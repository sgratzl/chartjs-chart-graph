import {
  defaults,
  Chart,
  ScatterController,
  registry,
  LinearScale,
  PointElement,
  UpdateMode,
  TooltipItem,
  ChartItem,
  ChartConfiguration,
  ControllerDatasetOptions,
  ScriptableAndArrayOptions,
  LineHoverOptions,
  PointPrefixedOptions,
  PointPrefixedHoverOptions,
  ScriptableContext,
  Element,
  CartesianScaleTypeRegistry,
  CoreChartOptions,
} from 'chart.js';
import { merge, clipArea, unclipArea, listenArrayEvents, unlistenArrayEvents } from 'chart.js/helpers';
import { EdgeLine, IEdgeLineOptions } from '../elements';
import interpolatePoints from './interpolatePoints';
import patchController from './patchController';

export type AnyObject = Record<string, unknown>;

export interface IExtendedChartMeta {
  edges: EdgeLine[];
  _parsedEdges: ITreeEdge[];
}

export interface ITreeNode extends IGraphDataPoint {
  x: number;
  y: number;
  index?: number;
}

export interface ITreeEdge {
  source: number;
  target: number;
  points?: { x: number; y: number }[];
}

export class GraphController extends ScatterController {
  /**
   * @hidden
   */
  declare _ctx: CanvasRenderingContext2D;

  /**
   * @hidden
   */
  declare _cachedDataOpts: any;

  /**
   * @hidden
   */
  declare _type: string;

  /**
   * @hidden
   */
  declare _data: any[];

  /**
   * @hidden
   */
  declare _edges: any[];

  /**
   * @hidden
   */
  declare _sharedOptions: any;

  /**
   * @hidden
   */
  declare _edgeSharedOptions: any;

  /**
   * @hidden
   */
  declare dataElementType: any;

  /**
   * @hidden
   */
  private _scheduleResyncLayoutId = -1;

  /**
   * @hidden
   */
  edgeElementType: any;

  /**
   * @hidden
   */
  private readonly _edgeListener = {
    _onDataPush: (...args: any[]) => {
      const count = args.length;
      const start = (this.getDataset() as any).edges.length - count;
      const parsed = (this._cachedMeta as unknown as IExtendedChartMeta)._parsedEdges;
      args.forEach((edge) => {
        parsed.push(this._parseDefinedEdge(edge));
      });
      this._insertEdgeElements(start, count);
    },
    _onDataPop: () => {
      (this._cachedMeta as unknown as IExtendedChartMeta).edges.pop();
      (this._cachedMeta as unknown as IExtendedChartMeta)._parsedEdges.pop();
      this._scheduleResyncLayout();
    },
    _onDataShift: () => {
      (this._cachedMeta as unknown as IExtendedChartMeta).edges.shift();
      (this._cachedMeta as unknown as IExtendedChartMeta)._parsedEdges.shift();
      this._scheduleResyncLayout();
    },
    _onDataSplice: (start: number, count: number, ...args: any[]) => {
      (this._cachedMeta as unknown as IExtendedChartMeta).edges.splice(start, count);
      (this._cachedMeta as unknown as IExtendedChartMeta)._parsedEdges.splice(start, count);
      if (args.length > 0) {
        const parsed = (this._cachedMeta as unknown as IExtendedChartMeta)._parsedEdges;
        parsed.splice(start, 0, ...args.map((edge) => this._parseDefinedEdge(edge)));
        this._insertEdgeElements(start, args.length);
      } else {
        this._scheduleResyncLayout();
      }
    },
    _onDataUnshift: (...args: any[]) => {
      const parsed = (this._cachedMeta as unknown as IExtendedChartMeta)._parsedEdges;
      parsed.unshift(...args.map((edge) => this._parseDefinedEdge(edge)));
      this._insertEdgeElements(0, args.length);
    },
  };

  /**
   * @hidden
   */
  initialize(): void {
    const type = this._type;
    const defaultConfig = defaults.datasets[type as 'graph'] as any;
    this.edgeElementType = registry.getElement(defaultConfig.edgeElementType as string);
    super.initialize();
    this.enableOptionSharing = true;
    this._scheduleResyncLayout();
  }

  /**
   * @hidden
   */
  parse(start: number, count: number): void {
    const meta = this._cachedMeta;
    const data = this._data;
    const { iScale, vScale } = meta;
    for (let i = 0; i < count; i += 1) {
      const index = i + start;
      const d = data[index];
      const v = (meta._parsed[index] || {}) as { x: number; y: number };
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
    (iScale as any)._dataLimitsCached = false;
    (vScale as any)._dataLimitsCached = false;

    this._parseEdges();
  }

  /**
   * @hidden
   */
  reset(): void {
    this.resetLayout();
    super.reset();
  }

  /**
   * @hidden
   */
  update(mode: UpdateMode): void {
    super.update(mode);

    const meta = this._cachedMeta as unknown as IExtendedChartMeta;
    const edges = meta.edges || [];

    this.updateEdgeElements(edges, 0, mode);
  }

  /**
   * @hidden
   */
  destroy(): void {
    (ScatterController.prototype as any).destroy.call(this);
    if (this._edges) {
      unlistenArrayEvents(this._edges, this._edgeListener);
    }
    this.stopLayout();
  }

  declare getContext: (index: number, active: boolean, mode: UpdateMode) => unknown;

  /**
   * @hidden
   */
  updateEdgeElements(edges: EdgeLine[], start: number, mode: UpdateMode): void {
    const bak = {
      _cachedDataOpts: this._cachedDataOpts,
      dataElementType: this.dataElementType,
      _sharedOptions: this._sharedOptions,
      // getDataset: this.getDataset,
      // getParsed: this.getParsed,
    };
    this._cachedDataOpts = {};
    this.dataElementType = this.edgeElementType;
    this._sharedOptions = this._edgeSharedOptions;

    const dataset = this.getDataset();
    const meta = this._cachedMeta;
    const nodeElements = meta.data;
    const data = (this._cachedMeta as unknown as IExtendedChartMeta)._parsedEdges;

    // get generic context to prefill cache
    this.getContext(-1, false, mode);
    this.getDataset = () => {
      return new Proxy(dataset, {
        get(obj: any, prop: string) {
          return prop === 'data' ? obj.edges ?? [] : obj[prop];
        },
      });
    };
    this.getParsed = (index: number) => {
      return data[index] as any;
    };
    // patch meta to store edges
    meta.data = (meta as any).edges;

    const reset = mode === 'reset';

    const firstOpts = this.resolveDataElementOptions(start, mode);
    const dummyShared = {};
    const sharedOptions = this.getSharedOptions(firstOpts) ?? dummyShared;
    const includeOptions = this.includeOptions(mode, sharedOptions);

    const { xScale, yScale } = meta;

    const base = {
      x: xScale?.getBasePixel() ?? 0,
      y: yScale?.getBasePixel() ?? 0,
    };

    function copyPoint(point: { x: number; y: number; angle?: number }) {
      const x = reset ? base.x : xScale?.getPixelForValue(point.x, 0) ?? 0;
      const y = reset ? base.y : yScale?.getPixelForValue(point.y, 0) ?? 0;
      return {
        x,
        y,
        angle: point.angle,
      };
    }

    for (let i = 0; i < edges.length; i += 1) {
      const edge = edges[i];
      const index = start + i;
      const parsed = data[index];

      const properties: any = {
        source: nodeElements[parsed.source],
        target: nodeElements[parsed.target],
        points: Array.isArray(parsed.points) ? parsed.points.map((p) => copyPoint(p)) : [],
      };
      properties.points._source = nodeElements[parsed.source];
      if (includeOptions) {
        if (sharedOptions !== dummyShared) {
          properties.options = sharedOptions;
        } else {
          properties.options = this.resolveDataElementOptions(index, mode);
        }
      }
      this.updateEdgeElement(edge, index, properties, mode);
    }
    this.updateSharedOptions(sharedOptions, mode, firstOpts);

    this._edgeSharedOptions = this._sharedOptions;
    Object.assign(this, bak);
    delete (this as any).getDataset;
    delete (this as any).getParsed;
    // patch meta to store edges
    meta.data = nodeElements;
  }

  /**
   * @hidden
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  updateEdgeElement(edge: EdgeLine, index: number, properties: any, mode: UpdateMode): void {
    super.updateElement(edge as unknown as Element<AnyObject, AnyObject>, index, properties, mode);
  }

  /**
   * @hidden
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  updateElement(point: Element<AnyObject, AnyObject>, index: number, properties: any, mode: UpdateMode): void {
    if (mode === 'reset') {
      // start in center also in x
      const { xScale } = this._cachedMeta;
      // eslint-disable-next-line no-param-reassign
      properties.x = xScale?.getBasePixel() ?? 0;
    }
    super.updateElement(point, index, properties, mode);
  }

  /**
   * @hidden
   */
  resolveNodeIndex(nodes: any[], ref: string | number | any): number {
    if (typeof ref === 'number') {
      // index
      return ref;
    }
    if (typeof ref === 'string') {
      // label
      const labels = this.chart.data.labels as string[];
      return labels.indexOf(ref);
    }
    const nIndex = nodes.indexOf(ref);
    if (nIndex >= 0) {
      // hit
      return nIndex;
    }

    const data = this.getDataset().data as any[];
    const index = data.indexOf(ref);
    if (index >= 0) {
      return index;
    }

    // eslint-disable-next-line no-console
    console.warn('cannot resolve edge ref', ref);
    return -1;
  }

  /**
   * @hidden
   */
  buildOrUpdateElements(): void {
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

  /**
   * @hidden
   */
  draw(): void {
    const meta = this._cachedMeta;
    const edges = (this._cachedMeta as unknown as IExtendedChartMeta).edges || [];
    const elements = (meta.data || []) as unknown[] as PointElement[];

    const area = this.chart.chartArea;
    const ctx = this._ctx;

    if (edges.length > 0) {
      clipArea(ctx, area);
      edges.forEach((edge) => (edge.draw.call as any)(edge, ctx, area));
      unclipArea(ctx);
    }

    elements.forEach((elem) => (elem.draw.call as any)(elem, ctx, area));
  }

  protected _resyncElements(): void {
    (ScatterController.prototype as any)._resyncElements.call(this);

    const meta = this._cachedMeta as unknown as IExtendedChartMeta;
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

  getTreeRootIndex(): number {
    const ds = this.getDataset() as any;
    const nodes = ds.data as any[];
    if (ds.derivedEdges) {
      // find the one with no parent
      return nodes.findIndex((d) => d.parent == null);
    }
    // find the one with no edge
    const edges = (this._cachedMeta as unknown as IExtendedChartMeta)._parsedEdges || [];
    const nodeIndices = new Set(nodes.map((_, i) => i));
    edges.forEach((edge) => {
      nodeIndices.delete(edge.target);
    });
    return Array.from(nodeIndices)[0];
  }

  getTreeRoot(): ITreeNode {
    const index = this.getTreeRootIndex();
    const p = this.getParsed(index) as ITreeNode;
    p.index = index;
    return p;
  }

  getTreeChildren(node: { index?: number }): ITreeNode[] {
    const edges = (this._cachedMeta as unknown as IExtendedChartMeta)._parsedEdges;
    const index = node.index ?? 0;
    return edges
      .filter((d) => d.source === index)
      .map((d) => {
        const p = this.getParsed(d.target) as ITreeNode;
        p.index = d.target;
        return p;
      });
  }

  /**
   * @hidden
   */
  _parseDefinedEdge(edge: { source: number; target: number }): ITreeEdge {
    const ds = this.getDataset();
    const { data } = ds;
    return {
      source: this.resolveNodeIndex(data, edge.source),
      target: this.resolveNodeIndex(data, edge.target),
      points: [],
    };
  }

  /**
   * @hidden
   */
  _parseEdges(): ITreeEdge[] {
    const ds = this.getDataset() as any;
    const data = ds.data as { parent?: number }[];
    const meta = this._cachedMeta as unknown as IExtendedChartMeta;
    if (ds.edges) {
      const edges = ds.edges.map((edge: any) => this._parseDefinedEdge(edge));
      meta._parsedEdges = edges;
      return edges;
    }

    const edges: ITreeEdge[] = [];
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

  /**
   * @hidden
   */
  addElements(): void {
    super.addElements();

    const meta = this._cachedMeta as unknown as IExtendedChartMeta;
    const edges = this._parseEdges();
    const metaData = new Array(edges.length);
    meta.edges = metaData;

    for (let i = 0; i < edges.length; i += 1) {
      // eslint-disable-next-line new-cap
      metaData[i] = new this.edgeElementType();
    }
  }

  /**
   * @hidden
   */
  _resyncEdgeElements(): void {
    const meta = this._cachedMeta as unknown as IExtendedChartMeta;
    const edges = this._parseEdges();
    const metaData = meta.edges || (meta.edges = []);

    for (let i = 0; i < edges.length; i += 1) {
      // eslint-disable-next-line new-cap
      metaData[i] = metaData[i] || new this.edgeElementType();
    }
    if (edges.length < metaData.length) {
      metaData.splice(edges.length, metaData.length);
    }
  }

  /**
   * @hidden
   */
  _insertElements(start: number, count: number): void {
    (ScatterController.prototype as any)._insertElements.call(this, start, count);
    if (count > 0) {
      this._resyncEdgeElements();
    }
  }

  /**
   * @hidden
   */
  _removeElements(start: number, count: number): void {
    (ScatterController.prototype as any)._removeElements.call(this, start, count);
    if (count > 0) {
      this._resyncEdgeElements();
    }
  }

  /**
   * @hidden
   */
  _insertEdgeElements(start: number, count: number): void {
    const elements = [];
    for (let i = 0; i < count; i += 1) {
      // eslint-disable-next-line new-cap
      elements.push(new this.edgeElementType());
    }
    (this._cachedMeta as unknown as IExtendedChartMeta).edges.splice(start, 0, ...elements);
    this.updateEdgeElements(elements, start, 'reset');
    this._scheduleResyncLayout();
  }

  // eslint-disable-next-line class-methods-use-this
  reLayout(): void {
    // hook
  }

  // eslint-disable-next-line class-methods-use-this
  resetLayout(): void {
    // hook
  }

  // eslint-disable-next-line class-methods-use-this
  stopLayout(): void {
    // hook
  }

  /**
   * @hidden
   */
  _scheduleResyncLayout(): void {
    if (this._scheduleResyncLayoutId != null && this._scheduleResyncLayoutId >= 0) {
      return;
    }
    this._scheduleResyncLayoutId = requestAnimationFrame(() => {
      this._scheduleResyncLayoutId = -1;
      this.resyncLayout();
    });
  }

  // eslint-disable-next-line class-methods-use-this
  resyncLayout(): void {
    // hook
  }

  static readonly id: string = 'graph';

  /**
   * @hidden
   */
  static readonly defaults: any = /* #__PURE__ */ merge({}, [
    ScatterController.defaults,
    {
      clip: 10, // some space in combination with padding
      animations: {
        points: {
          fn: interpolatePoints,
          properties: ['points'],
        },
      },
      edgeElementType: EdgeLine.id,
    },
  ]);

  /**
   * @hidden
   */
  static readonly overrides: any = /* #__PURE__ */ merge({}, [
    (ScatterController as any).overrides,
    {
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
      plugins: {
        tooltip: {
          callbacks: {
            label(item: TooltipItem<'graph'>) {
              return item.chart.data?.labels?.[item.dataIndex];
            },
          },
        },
      },
    },
  ]);
}

export interface IGraphDataPoint {
  parent?: number;
}

export interface IGraphEdgeDataPoint {
  source: number | string;
  target: number | string;
}

export interface IGraphChartControllerDatasetOptions
  extends ControllerDatasetOptions,
    ScriptableAndArrayOptions<PointPrefixedOptions, ScriptableContext<'graph'>>,
    ScriptableAndArrayOptions<PointPrefixedHoverOptions, ScriptableContext<'graph'>>,
    ScriptableAndArrayOptions<IEdgeLineOptions, ScriptableContext<'graph'>>,
    ScriptableAndArrayOptions<LineHoverOptions, ScriptableContext<'graph'>> {
  edges: IGraphEdgeDataPoint[];
}

declare module 'chart.js' {
  export interface ChartTypeRegistry {
    graph: {
      chartOptions: CoreChartOptions<'graph'>;
      datasetOptions: IGraphChartControllerDatasetOptions;
      defaultDataPoint: IGraphDataPoint;
      metaExtensions: Record<string, never>;
      parsedDataType: ITreeNode;
      scales: keyof CartesianScaleTypeRegistry;
    };
  }
}

export class GraphChart<DATA extends unknown[] = IGraphDataPoint[], LABEL = string> extends Chart<
  'graph',
  DATA,
  LABEL
> {
  static id = GraphController.id;

  constructor(item: ChartItem, config: Omit<ChartConfiguration<'graph', DATA, LABEL>, 'type'>) {
    super(item, patchController('graph', config, GraphController, [EdgeLine, PointElement], LinearScale));
  }
}
