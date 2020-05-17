import { helpers, defaults, controllers } from 'chart.js';
import { Graph } from './graph';
import { hierarchy, cluster, tree } from 'd3-hierarchy';

export class Dendogram extends Graph {
  updateEdgeElement(line, index, properties, mode) {
    properties._orientation = this.chart.options.tree.orientation;
    super.updateEdgeElement(line, index, properties, mode);
  }

  updateElement(point, index, properties, mode) {
    properties.angle = this.getParsed(index).angle;
    super.updateElement(point, index, properties, mode);
  }

  resyncLayout() {
    const meta = this._cachedMeta;

    meta.root = hierarchy(this.getTreeRoot(), (d) => this.getTreeChildren(d))
      .count()
      .sort((a, b) => b.height - a.height || b.data.index - a.data.index);

    this.doLayout(meta.root);

    super.resyncLayout();
  }

  reLayout() {
    this.doLayout(this._cachedMeta.root);
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
          orientation: 'horizontal', // vertical, horizontal, radial
        },
        datasets: {
          animations: {
            numbers: {
              type: 'number',
              properties: ['x', 'y', 'angle', 'radius', 'rotation', 'borderWidth'],
            },
          },
          tension: 0.4,
        },
        scales: {
          x: {
            min: -1,
            max: 1,
          },
          y: {
            min: -1,
            max: 1,
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
