import { controllers, defaults, helpers } from 'chart.js';
import { listenArrayEvents, unlistenArrayEvents } from '../data';
import { EdgeLine } from '../elements';

export class Graph extends controllers.scatter {
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);

    this._initialReset = true;
    this._cachedEdgeOpts = {};
    this._edgeListener = {
      onDataPush: (...args) => {
        const count = args.length;
        const start = this.getDataset().edges.length - count;
        const parsed = this._cachedMeta._parsedEdges;
        args.forEach((edge) => {
          parsed.push(this._parseDefinedEdge(edge));
        });
        this._insertEdgeElements(start, count);
      },
      onDataPop: () => {
        this._cachedMeta.edges.pop();
        this._cachedMeta._parsedEdges.pop();
        this._scheduleResyncLayout();
      },
      onDataShift: () => {
        this._cachedMeta.edges.shift();
        this._cachedMeta._parsedEdges.shift();
        this._scheduleResyncLayout();
      },
      onDataSplice: (start, count, ...args) => {
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
      onDataUnshift: (...args) => {
        const parsed = this._cachedMeta._parsedEdges;
        parsed.unshift(...args.map((edge) => this._parseDefinedEdge(edge)));
        this._insertEdgeElements(0, args.length);
      },
    };

    // this.resyncLayout();
  }

  parse(start, count) {
    super.parse(start, count);
    // since generated
    this._cachedMeta._sorted = false;
    this._parseEdges();
  }

  reset() {
    if (this._initialReset) {
      this._initialReset = false;
    } else {
      this.resetLayout();
    }
    super.reset();
  }

  update(mode) {
    super.update(mode);

    const meta = this._cachedMeta;
    const edges = meta.edges || [];

    this.updateEdgeElements(edges, 0, mode);
  }

  destroy() {
    super.destroy();
    if (this._edges) {
      unlistenArrayEvents(this._edges, this._edgeListener);
    }
    this.stopLayout();
  }

  updateEdgeElements(edges, start, mode) {
    const bak = {
      _cachedDataOpts: this._cachedDataOpts,
      dataElementType: this.dataElementType,
      dataElementOptions: this.dataElementOptions,
      _sharedOptions: this._sharedOptions,
    };
    this._cachedDataOpts = {};
    this.dataElementType = this.edgeElementType;
    this.dataElementOptions = this.edgeElementOptions;
    const meta = this._cachedMeta;
    const nodes = meta.data;
    const data = meta._parsedEdges;

    // const reset = mode === 'reset';

    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(mode || 'normal', edges[start], firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const index = start + i;
      var parsed = data[index];
      var properties = {
        source: nodes[parsed.source],
        target: nodes[parsed.target],
      };
      if (includeOptions) {
        properties.options = this.resolveDataElementOptions(index, mode);
      }
      this.updateEdgeElement(edge, index, properties, mode);
    }
    this.updateSharedOptions(sharedOptions, mode);

    Object.assign(this, bak);
  }

  updateEdgeElement(edge, index, properties, mode) {
    super.updateElement(edge, index, properties, mode);
  }

  updateElement(point, index, properties, mode) {
    if (mode === 'reset') {
      // start in center also in x
      const xScale = this._cachedMeta.xScale;
      properties.x = xScale.getBasePixel();
    }
    super.updateElement(point, index, properties, mode);
  }

  resolveNodeIndex(nodes, ref) {
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
    const dataset = this.getDataset();
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
      helpers.canvas.clipArea(ctx, area);
      edges.forEach((edge) => edge.draw(ctx, area));
      helpers.canvas.unclipArea(ctx);
    }

    elements.forEach((elem) => elem.draw(ctx, area));
  }

  _resyncElements(changed) {
    super._resyncElements(changed);

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
    } else if (changed) {
      this._scheduleResyncLayout();
    }
  }

  getTreeRootIndex() {
    const ds = this.getDataset();
    const nodes = ds.data;
    if (ds.derivedEdges) {
      // find the one with no parent
      return nodes.findIndex((d) => d.parent == null);
    }
    // find the one with no edge
    const edges = this._cachedMeta._parsedEdges || [];
    const nodeIndices = new Set(nodes.map((_, i) => i));
    edges.forEach((edge) => {
      nodeIndices.delete(edge.targetIndex);
    });
    return Array.from(nodeIndices)[0];
  }

  getTreeRoot() {
    const index = this.getTreeRootIndex();
    const p = this.getParsed(index);
    p.index = index;
    return p;
  }

  getTreeChildren(node) {
    const edges = this._cachedMeta._parsedEdges;
    return edges
      .filter((d) => d.source === node.index)
      .map((d) => {
        const p = this.getParsed(d.target);
        p.index = d.target;
        return p;
      });
  }

  _parseDefinedEdge(edge) {
    const ds = this.getDataset();
    const data = ds.data;
    return {
      source: this.resolveNodeIndex(data, edge.source),
      target: this.resolveNodeIndex(data, edge.target),
    };
  }

  _parseEdges() {
    const ds = this.getDataset();
    const data = ds.data;
    const meta = this._cachedMeta;
    if (ds.edges) {
      return (meta._parsedEdges = ds.edges.map((edge) => this._parseDefinedEdge(edge)));
    }

    const edges = (meta._parsedEdges = []);
    // try to derive edges via parent links
    data.forEach((node, i) => {
      if (node.parent != null) {
        // tree edge
        const parent = this.resolveNodeIndex(data, node.parent);
        edges.push({
          source: parent,
          target: i,
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

  _insertElements(start, count) {
    super._insertElements(start, count);
    if (count > 0) {
      this._resyncEdgeElements();
    }
  }

  _removeElements(start, count) {
    super._removeElements(start, count);
    if (count > 0) {
      this._resyncEdgeElements();
    }
  }

  _insertEdgeElements(start, count) {
    const elements = [];
    for (let i = 0; i < count; i++) {
      elements.push(new this.edgeElementType());
    }
    this._cachedMeta.edges.splice(start, 0, ...elements);
    this.updateEdgeElements(elements, start, 'reset');
    this._scheduleResyncLayout();
  }

  _onDataPush() {
    super._onDataPush.apply(this, Array.from(arguments));
    this._scheduleResyncLayout();
  }
  _onDataPop() {
    super._onDataPop();
    this._scheduleResyncLayout();
  }
  _onDataShift() {
    super._onDataShift();
    this._scheduleResyncLayout();
  }
  _onDataSplice() {
    super._onDataSplice.apply(this, Array.from(arguments));
    this._scheduleResyncLayout();
  }
  _onDataUnshift() {
    super._onDataUnshift.apply(this, Array.from(arguments));
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
    if (this._scheduleResyncLayoutId != null) {
      return;
    }
    this._scheduleResyncLayoutId = requestAnimationFrame(() => {
      this._scheduleResyncLayoutId = null;
      this.resyncLayout();
    });
  }

  resyncLayout() {
    // hook
  }
}

Graph.id = 'graph';
Graph.register = () => {
  Graph.prototype.edgeElementType = EdgeLine.register();
  Graph.prototype.edgeElementOptions = controllers.scatter.prototype.datasetElementOptions.concat([
    'tension',
    'stepped',
  ]);
  defaults.set(
    Graph.id,
    helpers.merge({}, [
      defaults.scatter,
      {
        layout: {
          padding: 5,
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
          },
        },
        tooltips: {
          callbacks: {
            label(item, data) {
              return data.labels[item.index];
            },
          },
        },
      },
    ])
  );
  controllers[Graph.id] = Graph;
  return Graph;
};
