'use strict';

import * as Chart from 'chart.js';
import { forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide, forceX, forceRadial, forceY } from 'd3-force';

const defaults = {
  simulation: {
    forces: {
      center: true,
      collide: false,
      link: true,
      manyBody: true,
      x: false,
      y: false,
      radial: false
    }
  }
};

Chart.defaults.forceDirectedGraph = Chart.helpers.merge({}, [Chart.defaults.graph, defaults]);

export const ForceDirectedGraph = Chart.controllers.forceDirectedGraph = Chart.controllers.graph.extend({

  initialize(chart, datasetIndex) {
    this._simulation = forceSimulation()
      .on('tick', () => {
        this.chart.update();
      }).on('end', () => {
        this.chart.update();
      });
    const sim = chart.options.simulation;

    const fs = {
      center: forceCenter,
      collide: forceCollide,
      link: forceLink,
      manyBody: forceManyBody,
      x: forceX,
      y: forceY,
      radial: forceRadial
    };

    Object.keys(fs).forEach((key) => {
      const options = sim.forces[key];
      if (!options) {
        return;
      }
      const f = fs[key]();
      if (typeof options !== 'boolean') {
        Object.keys(options).forEach((attr) => {
          f[attr].call(f, options[attr]);
        });
      }
      this._simulation.force(key, f);
    });

    Chart.controllers.graph.prototype.initialize.call(this, chart, datasetIndex);
  },

  resyncLayout() {
    Chart.controllers.graph.prototype.resyncLayout.call(this);
    this._simulation.nodes(this.getDataset().data);
    const link = this._simulation.force('link');
    if (link) {
      link.links(this.getDataset().edges || []);
    }
    this._simulation.restart();
  },

  stopLayout() {
    Chart.controllers.graph.prototype.stopLayout.call(this);
    this._simulation.stop();
  }
});
