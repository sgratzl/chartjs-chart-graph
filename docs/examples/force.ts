import type { ChartConfiguration } from 'chart.js';
import type {} from '../../src';

// #region data
export const data: ChartConfiguration<'boxplot'>['data'] = {
  labels: ['A'],
  datasets: [
    {
      itemRadius: 2,
      data: [[57297214, 57297216, 117540924, 117540928]],
    },
  ],
};
// #endregion data
// #region config
export const config: ChartConfiguration<'boxplot'> = {
  type: 'boxplot',
  data,
  options: {
    plugins: {
      legend: {
        display: false,
      },
    },
  },
};
// #endregion config
