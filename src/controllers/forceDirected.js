'use strict';

import * as Chart from 'chart.js';
import {Graph} from './graph';
import {forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide, forceX, forceRadial, forceY} from 'd3-force';

const defaults = {
  simulation: {
    autoRestart: true,
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

const superClass = Graph.prototype;
export const ForceDirectedGraph = Chart.controllers.forceDirectedGraph = Graph.extend({

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

    const ds = this.getDataset();
    // const meta = this.getMeta();

    const nodes = ds.data;
    // console.assert(ds.data.length === meta.data.length);

    nodes.forEach((node) => {
      if (node.x == null && node.y == null) {
        node.reset = true;
      }
    });
    const link = this._simulation.force('link');
    if (link) {
      link.links([]);
    }
    this._simulation.nodes(nodes);
    if (link) {
      // console.assert(ds.edges.length === meta.edges.length);
      link.links(ds.edges || []);
    }

    if (this.chart.options.simulation.autoRestart) {
      this._simulation.alpha(1).restart();
    }
  },

  restartLayout() {
    this._simulation.alpha(1).restart();
  },

  stopLayout() {
    superClass.stopLayout.call(this);
    this._simulation.stop();
  }
});

Chart.prototype.restart = function() {
  const numDatasets = this.data.datasets.length;
  for (let i = 0; i < numDatasets; ++i) {
    const controller = this.getDatasetMeta(i);
    if (controller.type === 'forceDirectedGraph') {
      controller.controller.restartLayout();
    }
  }
};
