import {
  defaults,
  Chart,
  ScatterController,
  registry,
  LineController,
  LinearScale,
  Point,
  UpdateMode,
  ITooltipItem,
  IChartMeta,
  ChartItem,
  IChartDataset,
  IChartConfiguration,
  IControllerDatasetOptions,
  ScriptableAndArrayOptions,
  ILineHoverOptions,
  IPointPrefixedOptions,
  IPointPrefixedHoverOptions,
} from 'chart.js';
import { merge } from '../../chartjs-helpers/core';
import { clipArea, unclipArea } from '../../chartjs-helpers/canvas';
import { listenArrayEvents, unlistenArrayEvents } from '../../chartjs-helpers/collection';
import { EdgeLine, IEdgeLineOptions } from '../elements';
import { interpolatePoints } from './utils';
import patchController from './patchController';

interface IExtendedChartMeta extends IChartMeta<Point> {
  edges: EdgeLine[];
  _parsedEdges: { source: number; target: number; points: { x: number; y: number }[] }[];
}

export class GraphController extends ScatterController {
  declare _cachedMeta: IExtendedChartMeta;
  declare _ctx: CanvasRenderingContext2D;
  declare _cachedDataOpts: any;
  declare _type: string;
  declare _data: any[];
  declare _edges: any[];
  declare _sharedOptions: any;
  declare _edgeSharedOptions: any;
  declare dataElementType: any;
  declare dataElementOptions: any;

  private _scheduleResyncLayoutId = -1;
  edgeElementOptions: any;
  edgeElementType: any;

  private readonly _edgeListener = {
    _onDataPush: (...args: any[]) => {
      const count = args.length;
      const start = (this.getDataset() as any).edges.length - count;
      const parsed = this._cachedMeta._parsedEdges;
      args.forEach((edge) => {
        parsed.push(this._parseDefinedEdge(edge));
      });
      this._insertEdgeElements(start, count);
    },
    _onDataPop: () => {
      this._cachedMeta.edges.pop();
      this._cachedMeta._parsedEdges.pop();
      this._scheduleResyncLayout();
    },
    _onDataShift: () => {
      this._cachedMeta.edges.shift();
      this._cachedMeta._parsedEdges.shift();
      this._scheduleResyncLayout();
    },
    _onDataSplice: (start: number, count: number, ...args: any[]) => {
      this._cachedMeta.edges.splice(start, count);
      this._cachedMeta._parsedEdges.splice(start, count);
      if (args.length > 0) {
        const parsed = this._cachedMeta._parsedEdges;
        parsed.splice(start, 0, ...args.map((edge) => this._parseDefinedEdge(edge)));
        this._insertEdgeElements(start, args.length);
      } else {
        this._scheduleResyncLayout();
      }
    },
    _onDataUnshift: (...args: any[]) => {
      const parsed = this._cachedMeta._parsedEdges;
      parsed.unshift(...args.map((edge) => this._parseDefinedEdge(edge)));
      this._insertEdgeElements(0, args.length);
    },
  };

  initialize() {
    const type = this._type;
    const defaultConfig = defaults.get(type);
    this.edgeElementOptions = defaultConfig.edgeElementOptions;
    this.edgeElementType = registry.getElement(defaultConfig.edgeElementType);
    super.initialize();
    this.enableOptionSharing = true;
    this._scheduleResyncLayout();
  }

  parse(start: number, count: number) {
    const meta = this._cachedMeta;
    const data = this._data;
    const iScale = meta.iScale!;
    const vScale = meta.vScale!;
    for (let i = 0; i < count; i++) {
      const index = i + start;
      const d = data[index];
      const v = meta._parsed[index] || {};
      if (d && typeof d.x === 'number') {
        v.x = d.x;
      }
      if (d && typeof d.y === 'number') {
        v.y = d.y;
      }
      meta._parsed[index] = v;
    }
    if (meta._parsed.length > data.length) {
      meta._parsed.splice(data.length, meta._parsed.length - data.length);
    }
    this._cachedMeta._sorted = false;
    iScale.invalidateCaches();
    vScale.invalidateCaches();

    this._parseEdges();
  }

  reset() {
    this.resetLayout();
    super.reset();
  }

  update(mode: UpdateMode) {
    super.update(mode);

    const meta = this._cachedMeta;
    const edges = meta.edges || [];

    this.updateEdgeElements(edges, 0, mode);
  }

  destroy() {
    (ScatterController.prototype as any).destroy.call(this);
    if (this._edges) {
      unlistenArrayEvents(this._edges, this._edgeListener);
    }
    this.stopLayout();
  }

  updateEdgeElements(edges: EdgeLine[], start: number, mode: UpdateMode) {
    const bak = {
      _cachedDataOpts: this._cachedDataOpts,
      dataElementType: this.dataElementType,
      dataElementOptions: this.dataElementOptions,
      _sharedOptions: this._sharedOptions,
    };
    this._cachedDataOpts = {};
    this.dataElementType = this.edgeElementType;
    this.dataElementOptions = this.edgeElementOptions;
    this._sharedOptions = this._edgeSharedOptions;
    const meta = this._cachedMeta;
    const nodes = meta.data;
    const data = meta._parsedEdges;

    const reset = mode === 'reset';

    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);

    const xScale = meta.xScale!;
    const yScale = meta.yScale!;

    const base = {
      x: xScale.getBasePixel(),
      y: yScale.getBasePixel(),
    };

    function copyPoint(point: { x: number; y: number; angle?: number }) {
      const x = reset ? base.x : xScale.getPixelForValue(point.x, 0);
      const y = reset ? base.y : yScale.getPixelForValue(point.y, 0);
      return {
        x,
        y,
        angle: point.angle,
      };
    }

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const index = start + i;
      const parsed = data[index];

      const properties: any = {
        source: nodes[parsed.source],
        target: nodes[parsed.target],
        points: Array.isArray(parsed.points) ? parsed.points.map(copyPoint) : [],
      };
      properties.points._source = nodes[parsed.source];
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(index, mode);
      }
      this.updateEdgeElement(edge, index, properties, mode);
    }
    this.updateSharedOptions(sharedOptions, mode, firstOpts);

    this._edgeSharedOptions = this._sharedOptions;
    Object.assign(this, bak);
  }

  updateEdgeElement(edge: EdgeLine, index: number, properties: any, mode: UpdateMode) {
    super.updateElement(edge, index, properties, mode);
  }

  updateElement(point: Point, index: number, properties: any, mode: UpdateMode) {
    if (mode === 'reset') {
      // start in center also in x
      const xScale = this._cachedMeta.xScale!;
      properties.x = xScale.getBasePixel();
    }
    super.updateElement(point, index, properties, mode);
  }

  resolveNodeIndex(nodes: any[], ref: string | number | any): number {
    if (typeof ref === 'number') {
      // index
      return ref;
    }
    if (typeof ref === 'string') {
      // label
      const labels = this.chart.data.labels;
      return labels.indexOf(ref);
    }
    const nIndex = nodes.indexOf(ref);
    if (nIndex >= 0) {
      // hit
      return nIndex;
    }

    if (ref && typeof ref.index === 'number') {
      return ref.index;
    }

    const data = this.getDataset().data;
    const index = data.indexOf(ref);
    if (index >= 0) {
      return index;
    }

    console.warn('cannot resolve edge ref', ref);
    return -1;
  }

  buildOrUpdateElements() {
    const dataset = this.getDataset() as any;
    const edges = dataset.edges || [];

    // In order to correctly handle data addition/deletion animation (an thus simulate
    // real-time charts), we need to monitor these data modifications and synchronize
    // the internal meta data accordingly.
    if (this._edges !== edges) {
      if (this._edges) {
        // This case happens when the user replaced the data array instance.
        unlistenArrayEvents(this._edges, this._edgeListener);
      }

      if (edges && Object.isExtensible(edges)) {
        listenArrayEvents(edges, this._edgeListener);
      }
      this._edges = edges;
    }
    super.buildOrUpdateElements();
  }

  draw() {
    const meta = this._cachedMeta;
    const edges = meta.edges || [];
    const elements = meta.data || [];

    const area = this.chart.chartArea;
    const ctx = this._ctx;

    if (edges.length > 0) {
      clipArea(ctx, area);
      edges.forEach((edge) => edge.draw(ctx));
      unclipArea(ctx);
    }

    elements.forEach((elem) => elem.draw(ctx));
  }

  _resyncElements() {
    (ScatterController.prototype as any)._resyncElements.call(this);

    const meta = this._cachedMeta;
    const edges = meta._parsedEdges;
    const metaEdges = meta.edges || (meta.edges = []);
    const numMeta = metaEdges.length;
    const numData = edges.length;

    if (numData < numMeta) {
      metaEdges.splice(numData, numMeta - numData);
      this._scheduleResyncLayout();
    } else if (numData > numMeta) {
      this._insertEdgeElements(numMeta, numData - numMeta);
    }
  }

  getTreeRootIndex() {
    const ds = this.getDataset() as any;
    const nodes = ds.data as any[];
    if (ds.derivedEdges) {
      // find the one with no parent
      return nodes.findIndex((d) => d.parent == null);
    }
    // find the one with no edge
    const edges = this._cachedMeta._parsedEdges || [];
    const nodeIndices = new Set(nodes.map((_, i) => i));
    edges.forEach((edge) => {
      nodeIndices.delete(edge.target);
    });
    return Array.from(nodeIndices)[0];
  }

  getTreeRoot() {
    const index = this.getTreeRootIndex();
    const p = this.getParsed(index);
    p.index = index;
    return p;
  }

  getTreeChildren(node: { index: number }) {
    const edges = this._cachedMeta._parsedEdges;
    return edges
      .filter((d) => d.source === node.index)
      .map((d) => {
        const p = this.getParsed(d.target);
        p.index = d.target;
        return p;
      });
  }

  _parseDefinedEdge(edge: { source: number; target: number }) {
    const ds = this.getDataset();
    const data = ds.data;
    return {
      source: this.resolveNodeIndex(data, edge.source),
      target: this.resolveNodeIndex(data, edge.target),
      points: [],
    };
  }

  _parseEdges() {
    const ds = this.getDataset() as any;
    const data = ds.data as { parent?: number }[];
    const meta = this._cachedMeta;
    if (ds.edges) {
      return (meta._parsedEdges = ds.edges.map((edge: any) => this._parseDefinedEdge(edge)));
    }

    const edges: { source: number; target: number; points: { x: number; y: number }[] }[] = [];
    meta._parsedEdges = edges as any;
    // try to derive edges via parent links
    data.forEach((node, i) => {
      if (node.parent != null) {
        // tree edge
        const parent = this.resolveNodeIndex(data, node.parent);
        edges.push({
          source: parent,
          target: i,
          points: [],
        });
      }
    });
    return edges;
  }

  addElements() {
    super.addElements();

    const meta = this._cachedMeta;
    const edges = this._parseEdges();
    const metaData = (meta.edges = new Array(edges.length));

    for (let i = 0; i < edges.length; ++i) {
      metaData[i] = new this.edgeElementType();
    }
  }

  _resyncEdgeElements() {
    const meta = this._cachedMeta;
    const edges = this._parseEdges();
    const metaData = meta.edges || (meta.edges = []);

    for (let i = 0; i < edges.length; ++i) {
      metaData[i] = metaData[i] || new this.edgeElementType();
    }
    if (edges.length < metaData.length) {
      metaData.splice(edges.length, metaData.length);
    }
  }

  _insertElements(start: number, count: number) {
    (ScatterController.prototype as any)._insertElements.call(this, start, count);
    if (count > 0) {
      this._resyncEdgeElements();
    }
  }

  _removeElements(start: number, count: number) {
    (ScatterController.prototype as any)._removeElements.call(this, start, count);
    if (count > 0) {
      this._resyncEdgeElements();
    }
  }

  _insertEdgeElements(start: number, count: number) {
    const elements = [];
    for (let i = 0; i < count; i++) {
      elements.push(new this.edgeElementType());
    }
    this._cachedMeta.edges.splice(start, 0, ...elements);
    this.updateEdgeElements(elements, start, 'reset');
    this._scheduleResyncLayout();
  }

  reLayout() {
    // hook
  }

  resetLayout() {
    // hook
  }

  stopLayout() {
    // hook
  }

  _scheduleResyncLayout() {
    if (this._scheduleResyncLayoutId != null && this._scheduleResyncLayoutId >= 0) {
      return;
    }
    this._scheduleResyncLayoutId = requestAnimationFrame(() => {
      this._scheduleResyncLayoutId = -1;
      this.resyncLayout();
    });
  }

  resyncLayout() {
    // hook
  }

  static readonly id: string = 'graph';
  static readonly defaults: any = /*#__PURE__*/ merge({}, [
    ScatterController.defaults,
    {
      datasets: {
        clip: 10, // some space in combination with padding
        animation: {
          points: {
            fn: interpolatePoints,
            properties: ['points'],
          },
        },
      },
      layout: {
        padding: 10,
      },
      scales: {
        x: {
          display: false,
          ticks: {
            maxTicksLimit: 2,
            precision: 100,
            minRotation: 0,
            maxRotation: 0,
          },
        },
        y: {
          display: false,
          ticks: {
            maxTicksLimit: 2,
            precision: 100,
            minRotation: 0,
            maxRotation: 0,
          },
        },
      },
      tooltips: {
        callbacks: {
          label(item: ITooltipItem) {
            return item.chart.data.labels[item.dataIndex];
          },
        },
      },
      edgeElementType: EdgeLine.id,
      edgeElementOptions: Object.assign(
        {
          tension: 'lineTension',
          stepped: 'lineStepped',
          directed: 'directed',
          arrowHeadSize: 'arrowHeadSize',
          arrowHeadOffset: 'pointRadius',
        },
        (() => {
          const options: any = {};
          LineController.defaults.datasetElementOptions.forEach((attr: any) => {
            options[attr] = `line${attr[0].toUpperCase()}${attr.slice(1)}`;
          });
          return options;
        })()
      ),
    },
  ]);
}

export interface IGraphDataPoint {
  parent?: number;
}

export interface IGraphEdgeDataPoint {
  source: number;
  target: number;
}

export interface IGraphChartControllerDatasetOptions
  extends IControllerDatasetOptions,
    ScriptableAndArrayOptions<IPointPrefixedOptions>,
    ScriptableAndArrayOptions<IPointPrefixedHoverOptions>,
    ScriptableAndArrayOptions<IEdgeLineOptions>,
    ScriptableAndArrayOptions<ILineHoverOptions> {}

export type IGraphChartControllerDataset<T = IGraphDataPoint, E = IGraphEdgeDataPoint> = IChartDataset<
  T,
  IGraphChartControllerDatasetOptions
> & {
  edges?: E[];
};

export type IGraphChartControllerConfiguration<
  T = IGraphDataPoint,
  E = IGraphEdgeDataPoint,
  L = string
> = IChartConfiguration<'graph', T, L, IGraphChartControllerDataset<T, E>>;

export class GraphChart<T = IGraphDataPoint, E = IGraphEdgeDataPoint, L = string> extends Chart<
  T,
  L,
  IGraphChartControllerConfiguration<T, E, L>
> {
  static readonly id = GraphController.id;

  constructor(item: ChartItem, config: Omit<IGraphChartControllerConfiguration<T, E, L>, 'type'>) {
    super(item, patchController('graph', config, GraphController, [EdgeLine, Point], LinearScale));
  }
}
