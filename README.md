# Chart.js Graphs
[![NPM Package][npm-image]][npm-url] [![Github Actions][github-actions-image]][github-actions-url]

Chart.js module for charting graphs. Adding new chart types: `graph`, `forceDirectedGraph`, `dendogram`, and `tree`.

**Works only with Chart.js >= 2.8.0**

![force](https://user-images.githubusercontent.com/4129778/65398353-9bc03f80-dd84-11e9-8f14-339635c1ba4e.png)

![dend_h](https://user-images.githubusercontent.com/4129778/65398352-9bc03f80-dd84-11e9-9197-ecb66a872736.png)

![tree_v](https://user-images.githubusercontent.com/4129778/65398350-9bc03f80-dd84-11e9-8c94-e93c07040ee7.png)

![radial](https://user-images.githubusercontent.com/4129778/65398354-9bc03f80-dd84-11e9-9633-c4c80bd9c384.png)


Works great with https://github.com/chartjs/chartjs-plugin-datalabels or https://github.com/chrispahm/chartjs-plugin-dragdata

![data label](https://user-images.githubusercontent.com/4129778/65398517-a0392800-dd85-11e9-800a-144a13ad2ba1.png)

[CodePen](https://codepen.io/sgratzl/pen/XWrOgpy)


## Install

```bash
npm install --save chart.js chartjs-chart-graph
```

## Usage
see [Samples](https://github.com/sgratzl/chartjs-chart-graph/tree/master/samples) on Github

CodePens
 * [Force Directed Layout](https://codepen.io/sgratzl/pen/bGbzREq)
 * [Tree Layouts](https://codepen.io/sgratzl/pen/wvwNeWg)
 * [Tree With Data Labels](https://codepen.io/sgratzl/pen/XWrOgpy)


## Styling

The new chart types are based on the existing `line` controller. Tho, instead of showing a line per dataset it shows edges as lines. Therefore, the styling options for points and lines are the same. See also https://www.chartjs.org/docs/latest/charts/line.html

## Data Structure

```js
data: {
  labels: ['A', 'B', 'C'], // node labels
  datasets: [{
    data: [ // nodes as objects
      { x: 1, y: 2 }, // x, y will be set by the force directed graph and can be omitted
      { x: 3, y: 1 },
      { x: 5, y: 3 }
    ],
    edges: [ // edge list where source/target refers to the node index
      { source: 0, target: 1},
      { source: 0, target: 2}
    ]
  }]
},
```

Alternative structure for trees

```js
data: {
  labels: ['A', 'B', 'C'], // node labels
  datasets: [{
    data: [ // nodes as objects
      { x: 1, y: 2 }, // x, y will be set by the force directed graph and can be omitted
      { x: 3, y: 1, parent: 0 },
      { x: 5, y: 3, parent: 0 }
    ]
  }]
},
```


## Force Directed Graph

chart type: `forceDirectedGraph`

Computes the x,y posiiton of nodes based on a force simulation. It is based on https://github.com/d3/d3-force/.

![force](https://user-images.githubusercontent.com/4129778/65398353-9bc03f80-dd84-11e9-8f14-339635c1ba4e.png)

[CodePen](https://codepen.io/sgratzl/pen/bGbzREq)

### Options

```typescript
interface IForceDirectedOptions {
  simulation: {
    /**
     * auto restarts the simulation upon dataset change, one can manually restart by calling: `chart.relayout()`
     *
     * @default true
     */
    autoRestart: boolean;

    forces: {
      /**
       * center force
       * https://github.com/d3/d3-force/#centering
       *
       * @default true
       */
      center: boolean | ICenterForce,

      /**
       * collision betweeen nodes
       * https://github.com/d3/d3-force/#collision
       *
       * @default false
       */
      collide: boolean | ICollideForce,

      /**
       * link force
       * https://github.com/d3/d3-force/#links
       *
       * @default true
       */
      link: boolean | ILinkForce,

      /**
       * link force
       * https://github.com/d3/d3-force/#many-body
       *
       * @default true
       */
      manyBody: boolean | IManyBodyForce,

      /**
       * x positioning force
       * https://github.com/d3/d3-force/#forceX
       *
       * @default false
       */
      x: boolean | IForceXForce,

      /**
       * y positioning force
       * https://github.com/d3/d3-force/#forceY
       *
       * @default false
       */
      y: boolean | IForceYForce,

      /**
       * radial positioning force
       * https://github.com/d3/d3-force/#forceRadial
       *
       * @default false
       */
      radial: boolean | IRadialForce,
    }
  }
}

declare ID3NodeCallback = (d: IDataNode, i: number) => number;
declare ID3EdgeCallback = (d: IDataEdge, i: number) => number;

interface ICenterForce {
  x?: number;
  y?: number;
}

interface ICollideForce {
  radius?: number | ID3NodeCallback;
  strength?: number | ID3NodeCallback;
}

interface ILinkForce {
  id?: (d: IDataEdge) => string | number;
  distance?: number | ID3EdgeCallback;
  strength?: number | ID3EdgeCallback;
}

interface IManyBodyForce {
  strength?: number | ID3NodeCallback;
  theta?: number;
  distanceMin?: number;
  distanceMax?: number;
}

interface IForceXForce {
  x?: number;
  strength?: number;
}

interface IForceYForce {
  y?: number;
  strength?: number;
}

interface IRadialForce {
  x?: number;
  y?: number;
  radius?: number;
  strength?: number;
}

```

## Dendogram, Tree

chart types: `dendogram`, `tree`

The tree and dendograms layouts are based on https://github.com/d3/d3-hierarchy.

**Dendogram Horizontal**

![dend_h](https://user-images.githubusercontent.com/4129778/65398352-9bc03f80-dd84-11e9-9197-ecb66a872736.png)

[CodePen](https://codepen.io/sgratzl/pen/wvwNeWg)

**Dendogram Vertical**

![dend_v](https://user-images.githubusercontent.com/4129778/65398355-9bc03f80-dd84-11e9-9ea3-9501a79491fb.png)

[CodePen](https://codepen.io/sgratzl/pen/wvwNeWg)

**Dendogram Radial**

![radial](https://user-images.githubusercontent.com/4129778/65398460-581a0580-dd85-11e9-93b6-b70946f1155f.png)

[CodePen](https://codepen.io/sgratzl/pen/wvwNeWg)

**Tidy Tree Horizontal**

![tree_h](https://user-images.githubusercontent.com/4129778/65398351-9bc03f80-dd84-11e9-83f9-50b454fa6929.png)

[CodePen](https://codepen.io/sgratzl/pen/wvwNeWg)

**Tidy Tree Vertical**

![tree_v](https://user-images.githubusercontent.com/4129778/65398350-9bc03f80-dd84-11e9-8c94-e93c07040ee7.png)

[CodePen](https://codepen.io/sgratzl/pen/wvwNeWg)

**Tidy Tree Radial**

![radial](https://user-images.githubusercontent.com/4129778/65398354-9bc03f80-dd84-11e9-9633-c4c80bd9c384.png)

[CodePen](https://codepen.io/sgratzl/pen/wvwNeWg)


### Options

```typescript
interface ITreeOptions {
  tree: {
    /**
     * tree (cluster) or dendogram layout default depends on the chart type
     */
    mode: 'dendogram' | 'tree';
    /**
     * orientation of the tree layout
     * @default horizontal
     */
    orientation: 'horizontal' | 'vertical' | 'radial';
    /**
     * line tension (factor for the bezier control point as distance between the ndoes)
     * @default 0.4
     */
    lineTension: number;
  }
}
```


## Building

```sh
npm install
npm run build
```

[npm-image]: https://badge.fury.io/js/chartjs-chart-graph.svg
[npm-url]: https://npmjs.org/package/chartjs-chart-graph
[github-actions-image]: https://github.com/sgratzl/chartjs-chart-graph/workflows/nodeci/badge.svg
[github-actions-url]: https://github.com/sgratzl/chartjs-chart-graph/actions
