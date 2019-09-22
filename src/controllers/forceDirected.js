'use strict';

import * as Chart from 'chart.js';
import {forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide, forceX, forceRadial, forceY} from 'd3-force';

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

const superClass = Chart.controllers.graph.prototype;
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
          f[attr](options[attr]);
        });
      }
      this._simulation.force(key, f);
    });
    this._simulation.stop();

    superClass.initialize.call(this, chart, datasetIndex);
  },

  resetLayout() {
    superClass.resetLayout.call(this);
    this._simulation.stop();

    const nodes = this.getDataset().data;
    nodes.forEach((node) => {
      if (!node.reset) {
        return;
      }
      delete node.x;
      delete node.y;
      delete node.vx;
      delete node.vy;
    });
    this._simulation.nodes(nodes);
    this._simulation.alpha(1).restart();
  },

  resyncLayout() {
    superClass.resyncLayout.call(this);
    this._simulation.stop();

    const nodes = this.getDataset().data;
    nodes.forEach((node) => {
      if (typeof node.x == 'undefined' && typeof node.y == 'undefined') {
        node.reset = true;
      }
    });
    this._simulation.nodes(nodes);
    const link = this._simulation.force('link');
    if (link) {
      link.links(this.getDataset().edges || []);
    }
    this._simulation.alpha(1).restart();
  },

  stopLayout() {
    superClass.stopLayout.call(this);
    this._simulation.stop();
  }
});
