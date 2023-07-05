import type { ChartConfiguration } from 'chart.js';
import type {} from '../../src';

// #region data
import nodes from './tree.json';

export const data: ChartConfiguration<'tree'>['data'] = {
  labels: nodes.map((d) => d.name),
  datasets: [
    {
      pointBackgroundColor: 'steelblue',
      pointRadius: 5,
      directed: true,
      data: nodes.map((d) => Object.assign({}, d)),
    },
  ],
};
// #endregion data
// #region config
export const config: ChartConfiguration<'tree'> = {
  type: 'tree',
  data,
};
// #endregion config
