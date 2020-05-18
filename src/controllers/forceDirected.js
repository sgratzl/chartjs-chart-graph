import { Chart, defaults, controllers, merge } from '../chart';
import { GraphController } from './graph';
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
  forceX,
  forceRadial,
  forceY,
} from 'd3-force';
import { patchControllerConfig } from './utils';

export class ForceDirectedGraphController extends GraphController {
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);
    this._simulation = forceSimulation()
      .on('tick', () => {
        this.chart.update();
      })
      .on('end', () => {
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
      radial: forceRadial,
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
  }

  resetLayout() {
    super.resetLayout();
    this._simulation.stop();

    const nodes = this._cachedMeta._parsed;
    nodes.forEach((node, i) => {
      node.index = i;
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
  }

  resyncLayout() {
    super.resyncLayout();
    this._simulation.stop();

    const meta = this._cachedMeta;

    const nodes = meta._parsed;
    nodes.forEach((node, i) => {
      node.index = i;
      if (node.x === null) {
        delete node.x;
      }
      if (node.y === null) {
        delete node.y;
      }
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
      // work on copy to avoid change
      link.links((meta._parsedEdges || []).map((link) => Object.assign({}, link)));
    }

    if (this.chart.options.simulation.autoRestart) {
      this._simulation.alpha(1).restart();
    }
  }

  reLayout() {
    this._simulation.alpha(1).restart();
  }

  stopLayout() {
    super.stopLayout();
    this._simulation.stop();
  }
}

ForceDirectedGraphController.id = 'forceDirectedGraph';
ForceDirectedGraphController.register = () => {
  GraphController.register();
  defaults.set(
    ForceDirectedGraphController.id,
    merge({}, [
      defaults[GraphController.id],
      {
        simulation: {
          autoRestart: true,
          forces: {
            center: true,
            collide: false,
            link: true,
            manyBody: true,
            x: false,
            y: false,
            radial: false,
          },
        },
      },
    ])
  );
  controllers[ForceDirectedGraphController.id] = ForceDirectedGraphController;
  return ForceDirectedGraphController;
};

export class ForceDirectedGraphChart extends Chart {
  constructor(item, config) {
    super(item, patchControllerConfig(config, ForceDirectedGraphController));
  }
}
ForceDirectedGraphChart.id = ForceDirectedGraphController.id;
