import { controllers, defaults, helpers } from 'chart.js';
import { listenArrayEvents, unlistenArrayEvents } from '../data';
import { EdgeLine } from '../elements';

export class Graph extends controllers.scatter {
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);

    this._initialReset = true;
    this._edgeListener = {
      onDataPush: (...args) => {
        const count = args.length;
        this._insertEdgeElements(this.getDataset().edges.length - count, count);
      },
      onDataPop: () => {
        this.getMeta().edges.pop();
        this.resyncLayout();
      },
      onDataShift: () => {
        this.getMeta().edges.shift();
        this.resyncLayout();
      },
      onDataSplice: (start, count, ...args) => {
        this.getMeta().edges.splice(start, count);
        this._insertEdgeElements(start, args.length);
      },
      onDataUnshift: (...args) => {
        this._insertEdgeElements(0, args.length);
      },
    };

    this.resyncLayout();
  }

  reset() {
    console.log('reset');
    if (this._initialReset) {
      this._initialReset = false;
    } else {
      this.resetLayout();
    }
    super.reset();
  }

  update(mode) {
    super.update(mode);

    const meta = this.getMeta();
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

  updateEdgeElements(edges, start, count) {
    // TODO
  }

  updateEdgeElement(edge, index, properties, mode) {
    super.updateElement(edge, index, properties, mode);
  }

  updateElement(point, index, properties, mode) {
    if (mode === 'reset') {
      // start in center also in x
      const xScale = this.getMeta().xScale;
      properties.x = xScale.getBasePixel();
    }
    super.updateElement(point, index, properties, mode);
  }

  // updateEdgeElement(line, index) {
  //   const dataset = this.getDataset();
  //   const edge = dataset.edges[index];
  //   const meta = this.getMeta();
  //   const points = meta.data;

  //   line._from = this.resolveNode(points, edge.source);
  //   line._to = this.resolveNode(points, edge.target);

  //   line._xScale = this.getScaleForId(meta.xAxisID);
  //   line._scale = line._yScale = this.getScaleForId(meta.yAxisID);

  //   line._datasetIndex = this.index;
  //   line._model = this._resolveEdgeLineOptions(line, index);
  // },

  // _resolveEdgeLineOptions(element, index) {
  //   const chart = this.chart;
  //   const dataset = chart.data.datasets[this.index];
  //   const custom = element.custom || {};
  //   const options = chart.options;
  //   const elementOptions = options.elements.line;

  //   // Scriptable options
  //   const context = {
  //     chart: chart,
  //     edgeIndex: index,
  //     dataset: dataset,
  //     datasetIndex: this.index,
  //   };

  //   const keys = [
  //     'backgroundColor',
  //     'borderWidth',
  //     'borderColor',
  //     'borderCapStyle',
  //     'borderDash',
  //     'borderDashOffset',
  //     'borderJoinStyle',
  //     'fill',
  //     'cubicInterpolationMode',
  //   ];

  //   const values = {};

  //   for (let i = 0; i < keys.length; ++i) {
  //     const key = keys[i];
  //     values[key] = Chart.helpers.options.resolve([custom[key], dataset[key], elementOptions[key]], context, index);
  //   }

  //   return values;
  // },

  resolveNode(nodes, ref) {
    if (typeof ref === 'number') {
      // index
      return nodes[ref];
    }
    if (typeof ref === 'string') {
      // label
      const labels = this.chart.data.labels;
      return nodes[labels.indexOf(ref)];
    }
    if (nodes.indexOf(ref) >= 0) {
      // hit
      return ref;
    }

    if (ref && typeof ref.index === 'number') {
      return nodes[ref.index];
    }

    const data = this.getDataset().data;
    const index = data.indexOf(ref);
    if (index >= 0) {
      return nodes[index];
    }

    console.warn('cannot resolve edge ref', ref);
    return null;
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
    const meta = this.getMeta();
    const edges = meta.edges || [];
    const elements = meta.data || [];

    const area = this.chart.chartArea;
    const ctx = this._ctx;

    if (edges.length > 0) {
      helpers.canvas.clipArea(ctx, area);
      // for (const edge of edges) {
      //   edge.draw(ctx);
      // }
      helpers.canvas.unclipArea(ctx);
    }

    for (const elem of elements) {
      elem.draw(ctx);
    }
  }

  _resyncElements(changed) {
    super._resyncElements(changed);

    const ds = this.getDataset();

    this._deriveEdges();

    const meta = this.getMeta();
    const edges = ds.edges || [];
    const metaEdges = meta.edges || (meta.edges = []);
    const numMeta = metaEdges.length;
    const numData = edges.length;

    if (numData < numMeta) {
      metaEdges.splice(numData, numMeta - numData);
      this.resyncLayout();
    } else if (numData > numMeta) {
      this._insertEdgeElements(numMeta, numData - numMeta);
    }
  }

  getTreeRoot() {
    const ds = this.getDataset();
    const nodes = ds.data;
    if (ds.derivedEdges) {
      // find the one with no parent
      return nodes.find((d) => d.parent == null);
    }
    // find the one with no edge
    const edges = ds.edges || [];
    const withEdge = new Set();
    edges.forEach((edge) => {
      withEdge.add(edge.source);
      withEdge.add(edge.target);
    });
    const labels = this.chart.data.labels;
    return nodes.find((d, i) => !withEdge.has(d) && withEdge.has(labels[i]));
  }

  getTreeChildren(node) {
    const ds = this.getDataset();
    const nodes = ds.data;
    const edges = ds.edges;
    return edges
      .filter((d) => {
        d.source = this.resolveNode(nodes, d.source);
        return d.source === node;
      })
      .map((d) => {
        d.target = this.resolveNode(nodes, d.target);
        return d.target;
      });
  }

  _deriveEdges() {
    const ds = this.getDataset();
    if (!ds.derivedEdges) {
      return ds.edges;
    }
    const edges = [];
    ds.derivedEdges = true;
    ds.data.forEach((node, i) => {
      node.index = i;
    });
    // try to derive edges via parent links
    ds.data.forEach((node) => {
      if (node.parent != null) {
        // tree edge
        const parent = this.resolveNode(ds.data, node.parent);
        edges.push({
          source: parent,
          target: node,
        });
      }
    });
    ds.edges = edges;
    return edges;
  }

  addElements() {
    super.addElements();

    const meta = this._cachedMeta;
    const ds = this.getDataset();
    if (!ds.edges) {
      ds.derivedEdges = true;
      this._deriveEdges();
    }

    const edges = ds.edges;
    const metaData = (meta.edges = new Array(edges.length));

    for (let i = 0; i < edges.length; ++i) {
      metaData[i] = new this.datasetElementType();
    }
  }

  _insertElements(start, count) {
    super._insertElements(start, count);

    const meta = this.getMeta();
    const ds = this.getDataset();
    if (!ds.edges) {
      ds.derivedEdges = true;
      this._deriveEdges();
    }

    const edges = ds.edges;
    const metaData = meta.edges || (meta.edges = []);

    for (let i = 0; i < edges.length; ++i) {
      metaData[i] = metaData[i] || new this.datasetElementType();
    }
  }

  _insertEdgeElements(start, count) {
    const elements = [];
    for (let i = 0; i < count; i++) {
      elements.push(new this.datasetElementType());
    }
    this.getMeta().edges.splice(start, 0, ...elements);
    this.updateEdgeElements(elements, start, 'reset');
    this.resyncLayout();
  }

  _onDataPush() {
    this._deriveEdges();
    super._onDataPush.apply(this, Array.from(arguments));
    this.resyncLayout();
  }
  _onDataPop() {
    this._deriveEdges();
    super._onDataPop();
    this.resyncLayout();
  }
  _onDataShift() {
    this._deriveEdges();
    super._onDataShift();
    this.resyncLayout();
  }
  _onDataSplice() {
    this._deriveEdges();
    super._onDataSplice.apply(this, Array.from(arguments));
    this.resyncLayout();
  }
  _onDataUnshift() {
    this._deriveEdges();
    super._onDataUnshift.apply(this, Array.from(arguments));
    this.resyncLayout();
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

  resyncLayout() {
    // hook
  }
}

Graph.id = 'graph';
Graph.register = () => {
  Graph.prototype.datasetElementType = EdgeLine.register();
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
