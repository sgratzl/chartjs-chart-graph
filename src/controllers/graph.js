'use strict';

import * as Chart from 'chart.js';
import {listenArrayEvents, unlistenArrayEvents} from '../data';

const defaults = {
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

Chart.defaults.graph = Chart.helpers.merge({}, [Chart.defaults.scatter, defaults]);

const superClass = Chart.controllers.scatter.prototype;
export const Graph = Chart.controllers.graph = Chart.controllers.scatter.extend({
  dataElementType: Chart.elements.Point,
  edgeElementType: Chart.elements.Line,

  initialize(chart, datasetIndex) {
    const that = this;
    this._initialReset = true;
    this._edgeListener = {
      onDataPush() {
        const count = arguments.length;
        that.insertEdgeElements(that.getDataset().edges.length - count, count);
      },
      onDataPop() {
        that.getMeta().edges.pop();
        that.resyncLayout();
      },
      onDataShift() {
        that.getMeta().edges.shift();
        that.resyncLayout();
      },
      onDataSplice(start, count) {
        that.getMeta().edges.splice(start, count);
        that.insertEdgeElements(start, arguments.length - 2);
      },
      onDataUnshift() {
        that.insertEdgeElements(0, arguments.length);
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
      this.getPointForEdge(points, edge.source),
      this.getPointForEdge(points, edge.target)
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

  getPointForEdge(points, ref) {
    if (typeof ref === 'number') {
      // index
      return points[ref];
    }
    if (typeof ref === 'string') {
      // label
      const labels = this.chart.data.labels;
      return points[labels.indexOf(ref)];
    }
    if (ref._model) {
      // point
      return ref;
    }
    if (ref && typeof ref.index === 'number') {
      return points[ref.index];
    }
    console.warn('cannot resolve edge ref', ref);
    return null;
  },

  buildOrUpdateElements() {
    const dataset = this.getDataset();
    const edges = dataset.edges || (dataset.edges = []);

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
    const meta = this.getMeta();
    const edges = this.getDataset().edges;
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

  addElements() {
    superClass.addElements.call(this);

    const meta = this.getMeta();
    const edges = this.getDataset().edges || [];
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
    superClass.onDataPush.apply(this, Array.from(arguments));
    this.resyncLayout();
  },
  onDataPop() {
    superClass.onDataPop.call(this);
    this.resyncLayout();
  },
  onDataShift() {
    superClass.onDataShift.call(this);
    this.resyncLayout();
  },
  onDataSplice() {
    superClass.onDataSplice.apply(this, Array.from(arguments));
    this.resyncLayout();
  },
  onDataUnshift() {
    superClass.onDataUnshift.apply(this, Array.from(arguments));
    this.resyncLayout();
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
