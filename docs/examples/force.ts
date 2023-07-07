import type { ChartConfiguration } from 'chart.js';
import type {} from '../../src';
import 'chartjs-plugin-datalabels';

// #region data
import miserables from './miserables.json';
export const data: ChartConfiguration<'forceDirectedGraph'>['data'] = {
  labels: miserables.nodes.map((d) => d.id),
  datasets: [
    {
      pointBackgroundColor: 'steelblue',
      pointRadius: 5,
      data: miserables.nodes,
      edges: miserables.links,
    },
  ],
};
// #endregion data
// #region config
export const config: ChartConfiguration<'forceDirectedGraph'> = {
  type: 'forceDirectedGraph',
  data,
  options: {
    plugins: {
      datalabels: {
        display: false,
      },
    },
  },
};
// #endregion config
