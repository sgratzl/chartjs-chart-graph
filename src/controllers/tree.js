'use strict';

import * as Chart from 'chart.js';
import {Graph} from './graph';
import {hierarchy, cluster, tree} from 'd3-hierarchy';

const defaults = {
  tree: {
    mode: 'dendogram', // dendogram, tree
    lineTension: 0.4,
    orientation: 'horizontal' // vertical, horizontal, radial
  },
  scales: {
    xAxes: [{
      ticks: {
        min: -1,
        max: 1
      }
    }],
    yAxes: [{
      ticks: {
        min: -1,
        max: 1
      }
    }]
  },

};

Chart.defaults.dendogram = Chart.helpers.configMerge(Chart.defaults.graph, defaults);

const superClass = Graph.prototype;
export const Dendogram = Chart.controllers.dendogram = Graph.extend({
  updateEdgeElement(line, index) {
    superClass.updateEdgeElement.call(this, line, index);

    line._orientation = this.chart.options.tree.orientation;
    const options = this.chart.options;
    line._model.tension = Chart.helpers.valueOrDefault(this.getDataset().lineTension, options.tree.lineTension, options.elements.line.lineTension);

  },

  updateElement(point, index, reset) {
    superClass.updateElement.call(this, point, index, reset);

    // propagate angle
    const node = this.getDataset().data[index];
    point._model.angle = node.angle;
  },

  resyncLayout() {
    const meta = this.getMeta();

    meta.root = hierarchy(this.getTreeRoot(), (d) => this.getTreeChildren(d))
      .count()
      .sort((a, b) => b.height - a.height || b.data.index - a.data.index);

    this.doLayout(meta.root);

    superClass.resyncLayout.call(this);
  },

  reLayout() {
    this.doLayout(this.getMeta().root);
  },

  doLayout(root) {
    const options = this.chart.options.tree;

    const layout = options.mode === 'tree' ? tree() : cluster();

    if (options.orientation === 'radial') {
      layout.size([Math.PI * 2, 1]);
    } else {
      layout.size([2, 2]);
    }

    const orientation = {
      horizontal: (d) => {
        d.data.x = d.y - 1;
        d.data.y = -d.x + 1;
      },
      vertical: (d) => {
        d.data.x = d.x - 1;
        d.data.y = -d.y + 1;
      },
      radial: (d) => {
        d.data.x = Math.cos(d.x) * d.y;
        d.data.y = Math.sin(d.x) * d.y;
        d.data.angle = d.y === 0 ? NaN : d.x;
      }
    };

    layout(root).each(orientation[options.orientation] || orientation.horizontal);

    requestAnimationFrame(() => this.chart.update());
  }
});


const treeDefaults = {
  tree: {
    mode: 'tree'
  }
};

Chart.defaults.tree = Chart.helpers.merge({}, [Chart.defaults.dendogram, treeDefaults]);

export const Tree = Chart.controllers.tree = Dendogram;
