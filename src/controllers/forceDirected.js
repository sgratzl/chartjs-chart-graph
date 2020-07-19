import { Chart, merge, requestAnimFrame } from '@sgratzl/chartjs-esm-facade';
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
import patchController from './patchController';
import { EdgeLine } from '../elements';

export class ForceDirectedGraphController extends GraphController {
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);
    this._simulation = forceSimulation()
      .on('tick', () => {
        this._copyPosition();
        this.chart.render();
      })
      .on('end', () => {
        this._copyPosition();
        this.chart.render();
      });
    const sim = this._config.simulation;

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

  _copyPosition() {
    const nodes = this._cachedMeta._parsed;

    const minmax = nodes.reduce(
      (acc, v) => {
        const s = v._sim;
        if (!s) {
          return acc;
        }
        if (s.x < acc.minX) {
          acc.minX = s.x;
        }
        if (s.x > acc.maxX) {
          acc.maxX = s.x;
        }
        if (s.y < acc.minY) {
          acc.minY = s.y;
        }
        if (s.y > acc.maxY) {
          acc.maxY = s.y;
        }
        return acc;
      },
      {
        minX: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      }
    );

    const rescaleX = (v) => ((v - minmax.minX) / (minmax.maxX - minmax.minX)) * 2 - 1;
    const rescaleY = (v) => ((v - minmax.minY) / (minmax.maxY - minmax.minY)) * 2 - 1;

    nodes.forEach((node) => {
      if (node._sim) {
        node.x = rescaleX(node._sim.x);
        node.y = rescaleY(node._sim.y);
      }
    });

    const xScale = this._cachedMeta.xScale;
    const yScale = this._cachedMeta.yScale;
    const elems = this._cachedMeta.data;
    elems.forEach((elem, i) => {
      const parsed = nodes[i];
      elem.x = xScale.getPixelForValue(parsed.x, i);
      elem.y = yScale.getPixelForValue(parsed.y, i);
    });
  }

  resetLayout() {
    super.resetLayout();
    this._simulation.stop();

    const nodes = this._cachedMeta._parsed.map((node, i) => {
      const simNode = Object.assign({}, node);
      simNode.index = i;
      node._sim = simNode;
      if (!node.reset) {
        return simNode;
      }
      delete simNode.x;
      delete simNode.y;
      delete simNode.vx;
      delete simNoe.vy;
      return simNode;
    });
    this._simulation.nodes(nodes);
    this._simulation.alpha(1).restart();
  }

  resyncLayout() {
    super.resyncLayout();
    this._simulation.stop();

    const meta = this._cachedMeta;

    const nodes = meta._parsed.map((node, i) => {
      const simNode = Object.assign({}, node);
      simNode.index = i;
      node._sim = simNode;
      if (simNode.x === null) {
        delete simNode.x;
      }
      if (simNode.y === null) {
        delete simNode.y;
      }
      if (simNode.x == null && simNode.y == null) {
        node.reset = true;
      }
      return simNode;
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

    if (this._config.simulation.initialIterations > 0) {
      this._simulation.alpha(1);
      this._simulation.tick(this._config.simulation.initialIterations);
      this._copyPosition();
      if (this._config.simulation.autoRestart) {
        this._simulation.restart();
      } else {
        requestAnimFrame.call(window, () => this.chart.update());
      }
    } else if (this._config.simulation.autoRestart) {
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
ForceDirectedGraphController.defaults = /*#__PURE__*/ merge({}, [
  GraphController.defaults,
  {
    animation: false,
    datasets: {
      simulation: {
        initialIterations: 0,
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
]);

export class ForceDirectedGraphChart extends Chart {
  constructor(item, config) {
    super(item, patchController(config, ForceDirectedGraphController, EdgeLine));
  }
}
ForceDirectedGraphChart.id = ForceDirectedGraphController.id;
