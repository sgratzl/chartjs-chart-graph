---
title: Getting Started
---

Chart.js module for charting graphs. Adding new chart types: `graph`, `forceDirectedGraph`, `dendrogram`, and `tree`.

![force](https://user-images.githubusercontent.com/4129778/65398353-9bc03f80-dd84-11e9-8f14-339635c1ba4e.png)

![dend_h](https://user-images.githubusercontent.com/4129778/65398352-9bc03f80-dd84-11e9-9197-ecb66a872736.png)

![tree_v](https://user-images.githubusercontent.com/4129778/65398350-9bc03f80-dd84-11e9-8c94-e93c07040ee7.png)

![radial](https://user-images.githubusercontent.com/4129778/65398354-9bc03f80-dd84-11e9-9633-c4c80bd9c384.png)

Works great with https://github.com/chartjs/chartjs-plugin-datalabels or https://github.com/chrispahm/chartjs-plugin-dragdata

## Install

```sh
npm install chart.js chartjs-chart-graph
```

## Usage

see [Examples](./examples/)

CodePens

- [Force Directed Layout](https://codepen.io/sgratzl/pen/mdezvmL)
- [Tree Layouts](https://codepen.io/sgratzl/pen/jObedwg)
- [Tree With Data Labels](https://codepen.io/sgratzl/pen/vYNVbgd)

## Configuration

### Data Structure

TODO

### Styling

The new chart types are based on the existing `line` controller. Tho, instead of showing a line per dataset it shows edges as lines. Therefore, the styling options for points and lines are the same. See also https://www.chartjs.org/docs/latest/charts/line.html. However, to avoid confusion, the line options have a default `line` prefix, e..g `lineBorderColor` to specify the edge border color and `pointBorderColor` to specify the node border color.
