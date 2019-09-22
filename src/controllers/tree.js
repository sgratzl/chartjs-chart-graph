'use strict';

import * as Chart from 'chart.js';
import {Graph} from './graph';
import {hierarchy, cluster, tree} from 'd3-hierarchy';

const defaults = {
  tree: {
    mode: 'dendogram', // dendogram, tree
    orientation: 'horizontal' // vertical, horizontal, radial
  }
};

Chart.defaults.dendogram = Chart.helpers.merge({}, [Chart.defaults.graph, defaults]);

const superClass = Graph.prototype;
export const Dendogram = Chart.controllers.dendogram = Graph.extend({
  resyncLayout() {
    const meta = this.getMeta();
    meta.root = hierarchy(this.getRoot())
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

    if (orientation.orientation === 'radial') {
      layout.size([Math.PI * 2, 100]);
    }

    const orientation = {
      horizontal: (d) => {
        d.data.x = d.y;
        d.data.y = -d.x + 0.5;
      },
      vertical: (d) => {
        d.data.x = d.x - 0.5;
        d.data.y = -d.y;
      },
      radial: (d) => {
        d.data.x = Math.cos(d.x) * d.y;
        d.data.y = Math.sin(d.x) * d.y;
      }
    }

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
