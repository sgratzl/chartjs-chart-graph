import type { ChartConfiguration } from 'chart.js';
import type {} from '../../src';
import 'chartjs-plugin-datalabels';

// #region data
import nodes from './tree.json';

export const data: ChartConfiguration<'dendrogram'>['data'] = {
  labels: nodes.map((d) => d.name),
  datasets: [
    {
      pointBackgroundColor: 'steelblue',
      pointRadius: 5,
      data: nodes.map((d) => Object.assign({}, d)),
    },
  ],
};
// #endregion data
// #region config
export const config: ChartConfiguration<'dendrogram'> = {
  type: 'dendrogram',
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
