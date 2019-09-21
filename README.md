# Chart.js Graphs
[![NPM Package][npm-image]][npm-url] [![Github Actions][github-actions-image]][github-actions-url]

Chart.js module for charting graphs.

force directed link diagram

![node-link](https://user-images.githubusercontent.com/4129778/65296961-4beb3980-db34-11e9-9fe4-20f39878d114.png)


**Works only with Chart.js >= 2.8.0**


## Force Directed Graph

based on https://github.com/d3/d3-force/

Options
```typescript
interface IForceDirectedOptions {
  simulation: {
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


## Install

```bash
npm install --save chart.js chartjs-chart-graph
```

## Usage
see [Samples](https://github.com/sgratzl/chartjs-chart-graph/tree/master/samples) on Github

and [CodePen]()


## Styling
Several new styling keys are added to the indiviual chart types

```typescript
interface IGraphStyling {

}
```

## Data structure

```typescript
interface IGraphNodeItem {

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
