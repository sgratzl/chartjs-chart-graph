'use strict';

import * as Chart from 'chart.js';
import {listenArrayEvents, unlistenArrayEvents} from '../data';

const defaults = {
  layout: {
    padding: 5
  },
  scales: {
    xAxes: [{
      display: false
    }],
    yAxes: [{
      display: false
    }]
  },
  tooltips: {
    callbacks: {
      label(item, data) {
        return data.labels[item.index];
      }
    }
  }
};

Chart.defaults.graph = Chart.helpers.configMerge(Chart.defaults.scatter, defaults);

const superClass = Chart.controllers.scatter.prototype;
export const Graph = Chart.controllers.graph = Chart.controllers.scatter.extend({
  dataElementType: Chart.elements.Point,
  edgeElementType: Chart.elements.Line,

  initialize(chart, datasetIndex) {
    this._initialReset = true;
    this._edgeListener = {
      onDataPush: (...args) => {
        const count = args.length;
        this.insertEdgeElements(this.getDataset().edges.length - count, count);
      },
      onDataPop: () => {
        this.getMeta().edges.pop();
        this.resyncLayout();
      },
      onDataShift: () => {
        this.getMeta().edges.shift();
        this.resyncLayout();
      },
      onDataSplice: (start, count, ...args) => {
        this.getMeta().edges.splice(start, count);
        this.insertEdgeElements(start, args.length);
      },
      onDataUnshift: (...args) => {
        this.insertEdgeElements(0, args.length);
      }
    };

    superClass.initialize.call(this, chart, datasetIndex);
  },

  createEdgeMetaData(index) {
    return this.edgeElementType && new this.edgeElementType({
      _chart: this.chart,
      _datasetIndex: this.index,
      _index: index
    });
  },

  update(reset) {
    superClass.update.call(this, reset);

    const meta = this.getMeta();
    const edges = meta.edges || [];

    edges.forEach((edge, i) => this.updateEdgeElement(edge, i, reset));
    edges.forEach((edge) => edge.pivot());
  },

  destroy() {
    superClass.destroy.call(this);
    if (this._edges) {
      unlistenArrayEvents(this._edges, this._edgeListener);
    }
    this.stopLayout();
  },

  updateElement(point, index, reset) {
    superClass.updateElement.call(this, point, index, reset);

    if (reset) {
      // start in center also in x
      const xScale = this.getScaleForId(this.getMeta().xAxisID);
      point._model.x = xScale.getBasePixel();
    }
  },

  updateEdgeElement(line, index) {
    const dataset = this.getDataset();
    const edge = dataset.edges[index];
    const meta = this.getMeta();
    const points = meta.data;

    line._children = [
      this.resolveNode(points, edge.source),
      this.resolveNode(points, edge.target)
    ];
    line._xScale = this.getScaleForId(meta.xAxisID);
    line._scale = line._yScale = this.getScaleForId(meta.yAxisID);

    line._datasetIndex = this.index;
    line._model = this._resolveEdgeLineOptions(line, index);
  },

  _resolveEdgeLineOptions(element, index) {
    const chart = this.chart;
    const dataset = chart.data.datasets[this.index];
    const custom = element.custom || {};
    const options = chart.options;
    const elementOptions = options.elements.line;

    // Scriptable options
    const context = {
      chart: chart,
      edgeIndex: index,
      dataset: dataset,
      datasetIndex: this.index
    };

    const keys = [
      'backgroundColor',
      'borderWidth',
      'borderColor',
      'borderCapStyle',
      'borderDash',
      'borderDashOffset',
      'borderJoinStyle',
      'fill',
      'cubicInterpolationMode'
    ];

    const values = {};

    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      values[key] = Chart.helpers.options.resolve([
        custom[key],
        dataset[key],
        elementOptions[key]
      ], context, index);
    }

    // The default behavior of lines is to break at null values, according
    // to https://github.com/chartjs/Chart.js/issues/2435#issuecomment-216718158
    // This option gives lines the ability to span gaps
    values.spanGaps = Chart.helpers.valueOrDefault(dataset.spanGaps, options.spanGaps);
    values.tension = Chart.helpers.valueOrDefault(dataset.lineTension, elementOptions.tension);
    values.steppedLine = Chart.helpers.options.resolve([custom.steppedLine, dataset.steppedLine, elementOptions.stepped]);

    return values;
  },

  resolveNode(nodes, ref) {
    if (typeof ref === 'number') {
      // index
      return nodes[ref];
    }
    if (typeof ref === 'string') {
      // label
      const labels = this.chart.data.labels;
      return nodes[labels.indexOf(ref)];
    }
    if (nodes.indexOf(ref) >= 0) {
      // hit
      return ref;
    }

    if (ref && typeof ref.index === 'number') {
      return nodes[ref.index];
    }

    const data = this.getDataset().data;
    const index = data.indexOf(ref);
    if (index >= 0) {
      return nodes[index];
    }

    console.warn('cannot resolve edge ref', ref);
    return null;
  },

  buildOrUpdateElements() {
    const dataset = this.getDataset();
    const edges = dataset.edges || [];

    // In order to correctly handle data addition/deletion animation (an thus simulate
    // real-time charts), we need to monitor these data modifications and synchronize
    // the internal meta data accordingly.
    if (this._edges !== edges) {
      if (this._edges) {
        // This case happens when the user replaced the data array instance.
        unlistenArrayEvents(this._edges, this._edgeListener);
      }

      if (edges && Object.isExtensible(edges)) {
        listenArrayEvents(edges, this._edgeListener);
      }
      this._edges = edges;
    }

    superClass.buildOrUpdateElements.call(this);
  },

  transition(easingValue) {
    superClass.transition.call(this, easingValue);

    const meta = this.getMeta();
    const edges = meta.edges || [];

    edges.forEach((edge) => edge.transition(easingValue));
  },

  draw() {
    const meta = this.getMeta();
    const edges = meta.edges || [];
    const area = this.chart.chartArea;

    if (edges.length > 0) {
      Chart.helpers.canvas.clipArea(this.chart.ctx, {
        left: area.left,
        right: area.right,
        top: area.top,
        bottom: area.bottom
      });

      edges.forEach((edge) => edge.draw());

      Chart.helpers.canvas.unclipArea(this.chart.ctx);
    }

    superClass.draw.call(this);
  },

  reset() {
    if (this._initialReset) {
      this._initialReset = false;
    } else {
      this.resetLayout();
    }
    superClass.reset.call(this);
  },

  resyncElements() {
    superClass.resyncElements.call(this);

    const ds = this.getDataset();

    this._deriveEdges();

    const meta = this.getMeta();
    const edges = ds.edges || [];
    const metaEdges = meta.edges || (meta.edges = []);
    const numMeta = metaEdges.length;
    const numData = edges.length;

    if (numData < numMeta) {
      metaEdges.splice(numData, numMeta - numData);
      this.resyncLayout();
    } else if (numData > numMeta) {
      this.insertEdgeElements(numMeta, numData - numMeta);
    }
  },

  getRoot() {
    const ds = this.getDataset();
    const nodes = ds.data;
    if (ds.derivedEdges) {
      // find the one with no parent
      return nodes.find((d) => d.parent == null);
    }
    // find the one with no edge
    const edges = ds.edges || [];
    const withEdge = new Set();
    edges.forEach((edge) => {
      withEdge.add(edge.source);
      withEdge.add(edge.target);
    });
    const labels = this.chart.data.labels;
    return nodes.find((d, i) => !withEdge.has(d) && withEdge.has(labels[i]));
  },

  _deriveEdges() {
    const ds = this.getDataset();
    if (!ds.derivedEdges) {
      return ds.edges;
    }
    const edges = [];
    ds.derivedEdges = true;
    ds.data.forEach((node, i) => {
      node.index = i;
      node.children = [];
    });
    // try to derive edges via parent links
    ds.data.forEach((node) => {
      if (node.parent != null) {
        // tree edge
        const parent = this.resolveNode(ds.data, node.parent);
        parent.children.push(node);
        edges.push({
          source: parent,
          target: node
        });
      }
    });
    ds.edges = edges;
    return edges;
  },

  addElements() {
    superClass.addElements.call(this);

    const meta = this.getMeta();
    const ds = this.getDataset();
    if (!ds.edges) {
      ds.derivedEdges = true;
      this._deriveEdges();
    }

    const edges = ds.edges;
    const metaData = meta.edges || (meta.edges = []);

    for (let i = 0; i < edges.length; ++i) {
      metaData[i] = metaData[i] || this.createEdgeMetaData(i);
    }
    this.resyncLayout();
  },

  addEdgeElementAndReset(index) {
    const element = this.createEdgeMetaData(index);
    this.getMeta().edges.splice(index, 0, element);
    this.updateEdgeElement(element, index, true);
  },

  insertEdgeElements(start, count) {
    for (let i = 0; i < count; ++i) {
      this.addEdgeElementAndReset(start + i);
    }
    this.resyncLayout();
  },

  onDataPush() {
    this._deriveEdges();
    superClass.onDataPush.apply(this, Array.from(arguments));
    this.resyncLayout();
  },
  onDataPop() {
    this._deriveEdges();
    superClass.onDataPop.call(this);
    this.resyncLayout();
  },
  onDataShift() {
    this._deriveEdges();
    superClass.onDataShift.call(this);
    this.resyncLayout();
  },
  onDataSplice() {
    this._deriveEdges();
    superClass.onDataSplice.apply(this, Array.from(arguments));
    this.resyncLayout();
  },
  onDataUnshift() {
    this._deriveEdges();
    superClass.onDataUnshift.apply(this, Array.from(arguments));
    this.resyncLayout();
  },

  reLayout() {
    // hook
  },

  resetLayout() {
    // hook
  },

  stopLayout() {
    // hook
  },

  resyncLayout() {
    // hook
  },
});

Chart.prototype.relayout = function() {
  const numDatasets = this.data.datasets.length;
  for (let i = 0; i < numDatasets; ++i) {
    const controller = this.getDatasetMeta(i);
    if (typeof controller.controller.reLayout === 'function') {
      controller.controller.reLayout();
    }
  }
};

