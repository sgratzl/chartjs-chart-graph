import type { ChartConfiguration } from 'chart.js';
import type {} from '../../src';
import 'chartjs-plugin-datalabels';

// #region data

const edges = [
  { source: 1, target: 0 },
  { source: 2, target: 0 },
  { source: 2, target: 1 },
  { source: 3, target: 1 },
  { source: 3, target: 0 },
  { source: 3, target: 2 },
];

const widths = [2, 5, 10, 15, 20, 25];
const dashes = [
  [2, 2],
  [5, 5],
  [10, 10],
  [15, 15],
  [20, 20],
  [25, 25],
];
const colors = ['blue', 'red', 'green', 'purple', 'pink', 'yellow'];
const nodeColors = ['yellow', 'pink', 'teal', 'violet'];

export const data: ChartConfiguration<'tree'>['data'] = {
  labels: ['A', 'B', 'C', 'D'],
  datasets: [
    {
      data: [{}, {}, {}, {}],
      edges: edges,
      pointRadius: 20,
      pointBackgroundColor: (ctx) => nodeColors[ctx.index],
      edgeLineBorderWidth: (ctx) => widths[ctx.index],
      edgeLineBorderDash: (ctx) => dashes[ctx.index],
      edgeLineBorderColor: (ctx) => colors[ctx.index],
    },
  ],
};
// #endregion data
// #region config
export const config: ChartConfiguration<'tree'> = {
  type: 'forceDirectedGraph',
  data,
  options: {
    scales: {
      x: { min: -1.5, max: 1.5 },
      y: { min: -1.5, max: 1.5 },
    },
    plugins: { legend: { display: false } },
  },
};
// #endregion config
