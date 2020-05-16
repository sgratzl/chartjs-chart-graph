import { helpers, defaults, controllers } from 'chart.js';
import { Graph } from './graph';
import { hierarchy, cluster, tree } from 'd3-hierarchy';

export class Dendogram extends Graph {
  updateEdgeElement(line, index) {
    super.updateEdgeElement(line, index);

    line._orientation = this.chart.options.tree.orientation;
    const options = this.chart.options;
    line._model.tension = helpers.valueOrDefault(
      this.getDataset().lineTension,
      options.tree.lineTension,
      options.elements.line.lineTension
    );
  }

  // TODO
  // updateElement(point, index, reset) {
  //   super.updateElement.call(this, point, index, reset);

  //   // propagate angle
  //   const node = this.getDataset().data[index];
  //   point._model.angle = node.angle;
  // },

  resyncLayout() {
    const meta = this.getMeta();

    meta.root = hierarchy(this.getTreeRoot(), (d) => this.getTreeChildren(d))
      .count()
      .sort((a, b) => b.height - a.height || b.data.index - a.data.index);

    this.doLayout(meta.root);

    super.resyncLayout();
  }

  reLayout() {
    this.doLayout(this.getMeta().root);
  }

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
        d.data.angle = d.y === 0 ? Number.NaN : d.x;
      },
    };

    layout(root).each(orientation[options.orientation] || orientation.horizontal);

    requestAnimationFrame(() => this.chart.update());
  }
}

Dendogram.id = 'dendogram';
Dendogram.register = () => {
  Graph.register();
  defaults.set(
    Dendogram.id,
    helpers.merge({}, [
      defaults[Graph.id],
      {
        tree: {
          mode: 'dendogram', // dendogram, tree
          lineTension: 0.4,
          orientation: 'horizontal', // vertical, horizontal, radial
        },
        scales: {
          x: {
            ticks: {
              min: -1,
              max: 1,
            },
          },
          y: {
            ticks: {
              min: -1,
              max: 1,
            },
          },
        },
      },
    ])
  );
  controllers[Dendogram.id] = Dendogram;
  return Dendogram;
};

export class Tree extends Dendogram {}
Tree.id = 'tree';
Tree.register = () => {
  Dendogram.register();
  defaults.set(
    Tree.id,
    helpers.merge({}, [
      defaults[Dendogram.id],
      {
        tree: {
          mode: 'tree',
        },
      },
    ])
  );
  controllers[Tree.id] = Tree;
  return Tree;
};
