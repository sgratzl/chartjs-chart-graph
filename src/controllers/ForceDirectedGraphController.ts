import {
  Chart,
  ChartItem,
  CartesianScaleTypeRegistry,
  ChartConfiguration,
  CoreChartOptions,
  LinearScale,
  PointElement,
} from 'chart.js';
import { merge } from 'chart.js/helpers';
import {
  forceCenter,
  forceCollide,
  forceLink,
  ForceLink,
  forceManyBody,
  forceRadial,
  forceSimulation,
  forceX,
  forceY,
  Simulation,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from 'd3-force';
import { EdgeLine } from '../elements';
import {
  GraphController,
  IGraphChartControllerDatasetOptions,
  IGraphDataPoint,
  ITreeEdge,
  ITreeNode,
} from './GraphController';
import patchController from './patchController';

export interface ITreeSimNode extends ITreeNode {
  _sim: { x?: number; y?: number; vx?: number; vy?: number; index?: number };
  reset?: boolean;
}

export interface IForceDirectedControllerOptions {
  simulation: {
    /**
     * auto restarts the simulation upon dataset change, one can manually restart by calling: `chart.getDatasetMeta(0).controller.reLayout();`
     *
     * @default true
     */
    autoRestart: boolean;

    initialIterations: number;

    forces: {
      /**
       * center force
       * https://github.com/d3/d3-force/#centering
       *
       * @default true
       */
      center: boolean | ICenterForce;

      /**
       * collision between nodes
       * https://github.com/d3/d3-force/#collision
       *
       * @default false
       */
      collide: boolean | ICollideForce;

      /**
       * link force
       * https://github.com/d3/d3-force/#links
       *
       * @default true
       */
      link: boolean | ILinkForce;

      /**
       * link force
       * https://github.com/d3/d3-force/#many-body
       *
       * @default true
       */
      manyBody: boolean | IManyBodyForce;

      /**
       * x positioning force
       * https://github.com/d3/d3-force/#forceX
       *
       * @default false
       */
      x: boolean | IForceXForce;

      /**
       * y positioning force
       * https://github.com/d3/d3-force/#forceY
       *
       * @default false
       */
      y: boolean | IForceYForce;

      /**
       * radial positioning force
       * https://github.com/d3/d3-force/#forceRadial
       *
       * @default false
       */
      radial: boolean | IRadialForce;
    };
  };
}

declare type ID3NodeCallback = (d: any, i: number) => number;
declare type ID3EdgeCallback = (d: any, i: number) => number;

export interface ICenterForce {
  x?: number;
  y?: number;
}

export interface ICollideForce {
  radius?: number | ID3NodeCallback;
  strength?: number | ID3NodeCallback;
}

export interface ILinkForce {
  id?: (d: { source: any; target: any }) => string | number;
  distance?: number | ID3EdgeCallback;
  strength?: number | ID3EdgeCallback;
}

export interface IManyBodyForce {
  strength?: number | ID3NodeCallback;
  theta?: number;
  distanceMin?: number;
  distanceMax?: number;
}

export interface IForceXForce {
  x?: number;
  strength?: number;
}

export interface IForceYForce {
  y?: number;
  strength?: number;
}

export interface IRadialForce {
  x?: number;
  y?: number;
  radius?: number;
  strength?: number;
}

export class ForceDirectedGraphController extends GraphController {
  declare options: IForceDirectedControllerOptions;

  private readonly _simulation: Simulation<SimulationNodeDatum, undefined>;

  constructor(chart: Chart, datasetIndex: number) {
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
    const sim = this.options.simulation;

    const fs = {
      center: forceCenter,
      collide: forceCollide,
      link: forceLink,
      manyBody: forceManyBody,
      x: forceX,
      y: forceY,
      radial: forceRadial,
    };

    (Object.keys(fs) as (keyof typeof fs)[]).forEach((key) => {
      const options = sim.forces[key] as any;
      if (!options) {
        return;
      }
      const f = (fs[key] as any)();
      if (typeof options !== 'boolean') {
        Object.keys(options).forEach((attr) => {
          f[attr](options[attr]);
        });
      }
      this._simulation.force(key, f);
    });
    this._simulation.stop();
  }

  _copyPosition(): void {
    const nodes = this._cachedMeta._parsed as ITreeSimNode[];

    const minmax = nodes.reduce(
      (acc, v) => {
        const s = v._sim;
        if (!s || s.x == null || s.y == null) {
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

    const rescaleX = (v: number) => ((v - minmax.minX) / (minmax.maxX - minmax.minX)) * 2 - 1;
    const rescaleY = (v: number) => ((v - minmax.minY) / (minmax.maxY - minmax.minY)) * 2 - 1;

    nodes.forEach((node) => {
      if (node._sim) {
        // eslint-disable-next-line no-param-reassign
        node.x = rescaleX(node._sim.x ?? 0);
        // eslint-disable-next-line no-param-reassign
        node.y = rescaleY(node._sim.y ?? 0);
      }
    });

    const { xScale, yScale } = this._cachedMeta;
    const elems = this._cachedMeta.data;
    elems.forEach((elem, i) => {
      const parsed = nodes[i];
      Object.assign(elem, {
        x: xScale?.getPixelForValue(parsed.x, i) ?? 0,
        y: yScale?.getPixelForValue(parsed.y, i) ?? 0,
        skip: false,
      });
    });
  }

  resetLayout(): void {
    super.resetLayout();
    this._simulation.stop();

    const nodes = (this._cachedMeta._parsed as ITreeSimNode[]).map((node, i) => {
      const simNode: ITreeSimNode['_sim'] = { ...node };
      simNode.index = i;
      // eslint-disable-next-line no-param-reassign
      node._sim = simNode;
      if (!node.reset) {
        return simNode;
      }
      delete simNode.x;
      delete simNode.y;
      delete simNode.vx;
      delete simNode.vy;
      return simNode;
    });
    this._simulation.nodes(nodes);
    this._simulation.alpha(1).restart();
  }

  resyncLayout(): void {
    super.resyncLayout();
    this._simulation.stop();

    const meta = this._cachedMeta;

    const nodes = (meta._parsed as ITreeSimNode[]).map((node, i) => {
      const simNode: ITreeSimNode['_sim'] = { ...node };
      simNode.index = i;
      // eslint-disable-next-line no-param-reassign
      node._sim = simNode;
      if (simNode.x === null) {
        delete simNode.x;
      }
      if (simNode.y === null) {
        delete simNode.y;
      }
      if (simNode.x == null && simNode.y == null) {
        // eslint-disable-next-line no-param-reassign
        node.reset = true;
      }
      return simNode;
    });
    const link =
      this._simulation.force<ForceLink<SimulationNodeDatum, SimulationLinkDatum<SimulationNodeDatum>>>('link');
    if (link) {
      link.links([]);
    }
    this._simulation.nodes(nodes);
    if (link) {
      // console.assert(ds.edges.length === meta.edges.length);
      // work on copy to avoid change
      link.links(((meta._parsedEdges || []) as ITreeEdge[]).map((l) => ({ ...l })));
    }

    if (this.options.simulation.initialIterations > 0) {
      this._simulation.alpha(1);
      this._simulation.tick(this.options.simulation.initialIterations);
      this._copyPosition();
      if (this.options.simulation.autoRestart) {
        this._simulation.restart();
      } else {
        requestAnimationFrame(() => this.chart.update());
      }
    } else if (this.options.simulation.autoRestart) {
      this._simulation.alpha(1).restart();
    }
  }

  reLayout(): void {
    this._simulation.alpha(1).restart();
  }

  stopLayout(): void {
    super.stopLayout();
    this._simulation.stop();
  }

  static readonly id = 'forceDirectedGraph';

  static readonly defaults: any = /* #__PURE__ */ merge({}, [
    GraphController.defaults,
    {
      animation: false,
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
  ]);

  static readonly overrides: any = /* #__PURE__ */ merge({}, [
    GraphController.overrides,
    {
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
}

export interface IForceDirectedGraphChartControllerDatasetOptions
  extends IGraphChartControllerDatasetOptions,
    IForceDirectedControllerOptions {}

declare module 'chart.js' {
  export interface ChartTypeRegistry {
    forceDirectedGraph: {
      chartOptions: CoreChartOptions<'forceDirectedGraph'>;
      datasetOptions: IForceDirectedGraphChartControllerDatasetOptions;
      defaultDataPoint: IGraphDataPoint;
      metaExtensions: Record<string, never>;
      parsedDataType: ITreeSimNode;
      scales: keyof CartesianScaleTypeRegistry;
    };
  }
}

export class ForceDirectedGraphChart<DATA extends unknown[] = IGraphDataPoint[], LABEL = string> extends Chart<
  'forceDirectedGraph',
  DATA,
  LABEL
> {
  static id = ForceDirectedGraphController.id;

  constructor(item: ChartItem, config: Omit<ChartConfiguration<'forceDirectedGraph', DATA, LABEL>, 'type'>) {
    super(
      item,
      patchController('forceDirectedGraph', config, ForceDirectedGraphController, [EdgeLine, PointElement], LinearScale)
    );
  }
}
