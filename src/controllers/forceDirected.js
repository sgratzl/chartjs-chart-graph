'use strict';

import * as Chart from 'chart.js';
import { forceSimulation, forceManyBody, forceLink, forceCenter } from 'd3-force';

const defaults = {};

Chart.defaults.forceDirectedGraph = Chart.helpers.merge({}, [Chart.defaults.graph, defaults]);

export const ForceDirectedGraph = Chart.controllers.forceDirectedGraph = Chart.controllers.graph.extend({

  initialize(chart, datasetIndex) {
    this._simulation = forceSimulation()
      .force('charge', forceManyBody())
      .force('link', forceLink())
      .force('center', forceCenter())
      .on('tick', () => {
        this.chart.update();
      }).on('end', () => {
        this.chart.update();
      });
    Chart.controllers.graph.prototype.initialize.call(this, chart, datasetIndex);
  },

  resyncLayout() {
    Chart.controllers.graph.prototype.resyncLayout.call(this);
    this._simulation.nodes(this.getDataset().data);
    this._simulation.force('link').links(this.getDataset().edges || []);
    this._simulation.restart();
  },

  stopLayout() {
    Chart.controllers.graph.prototype.stopLayout.call(this);
    this._simulation.stop();
  }
});
