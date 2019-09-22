'use strict';

import * as Chart from 'chart.js';
import {Graph} from './graph';
import {hierarchy, cluster} from 'd3-hierarchy';

const defaults = {
  tree: {
    horizontal: false
  }
};

Chart.defaults.dendogram = Chart.helpers.merge({}, [Chart.defaults.graph, defaults]);

const superClass = Graph.prototype;
export const Dendogram = Chart.controllers.dendogram = Graph.extend({
  resyncLayout() {
    const meta = this.getMeta();
    meta.root = hierarchy(this.getRoot())
      .count() //sum((d) => d.value)
      .sort((a, b) => b.height - a.height);

    this.doLayout(meta.root);

    superClass.resyncLayout.call(this);
  },

  doLayout(root) {
    const layouted = cluster()(root);

    const horizontalMapper = (d) => {
      d.data.x = d.y - 0.5;
      d.data.y = -d.x;
    };

    const verticalMapper = (d) => {
      d.data.x = d.x - 0.5;
      d.data.y = -d.y;
    };

    const map = this.chart.options.tree.horizontal ? horizontalMapper : verticalMapper;

    layouted.each(map);

    requestAnimationFrame(() => this.chart.update());
  }
});
