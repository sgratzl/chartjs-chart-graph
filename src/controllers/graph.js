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

export const Graph = Chart.controllers.graph = Chart.controllers.scatter.extend({
  dataElementType: Chart.elements.Point,
  edgeElementType: Chart.elements.Line,

  createEdgeMetaData(index) {
    return this.edgeElementType && new this.edgeElementType({
      _chart: this.chart,
      _datasetIndex: this.index,
      _index: index
    });
  },

  update(reset) {
    Chart.controllers.scatter.prototype.update.call(this, reset);

    const meta = this.getMeta();
    const edges = meta.edges || [];

    edges.forEach((edge, i) => this.updateEdgeElement(edge, i, reset));
    edges.forEach((edge) => edge.pivot());
  },

  _edgeListener: (() => ({
    onDataPush() {
      const count = arguments.length;
      this.insertEdgeElements(this.getDataset().edges.length - count, count)
    },
    onDataPop() {
      this.getMeta().edges.pop();
      this.resyncLayout();
    },
    onDataShift() {
      this.getMeta().edges.shift();
      this.resyncLayout();
    },
    onDataSplice(start, count) {
      this.getMeta().edges.splice(start, count);
      this.insertEdgeElements(start, arguments.length - 2);
    },
    onDataUnshift() {
      this.insertEdgeElements(0, arguments.length);
    }
  }))(),

  destroy() {
    Chart.controllers.scatter.destroy.call(this);
    if (this._edges) {
      unlistenArrayEvents(this._edges, this._edgeListener);
    }
    this.stopLayout();
  },

  updateElement(point, index, reset) {
    Chart.controllers.scatter.prototype.updateElement.call(this, point, index, reset);

    if (reset) {
      // start in center also in x
      const xScale = this.getScaleForId(this.getMeta().xAxisID);
      point._model.x = xScale.getBasePixel();
    }
  },

  updateEdgeElement(line, index, _reset) {
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
    line._model = this._resolveLineOptions(line);
  },

  getPointForEdge(points, ref) {
    if (typeof ref === 'number') {
      // index
      return points[ref];
    }
    if (typeof ref === 'string') {
      // label
      const labels = this.getDataset().labels;
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

    Chart.controllers.scatter.prototype.buildOrUpdateElements.call(this);
  },

  transition(easingValue) {
    Chart.controllers.scatter.prototype.transition.call(this, easingValue);

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

    Chart.controllers.scatter.prototype.draw.call(this);
  },

  resyncElements() {
    Chart.controllers.scatter.prototype.resyncElements.call(this);
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
    Chart.controllers.scatter.prototype.addElements.call(this);

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


  stopLayout() {
    // hook
  },

  resyncLayout() {
    // hook
  },
});
