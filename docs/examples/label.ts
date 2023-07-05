import type { ChartConfiguration } from 'chart.js';
import type {} from '../../src';

// #region data
import nodes from './tree.json';

export const data: ChartConfiguration<'forceDirectedGraph'>['data'] = {
  labels: nodes.map((d) => d.name),
  datasets: [
    {
      pointBackgroundColor: ['#002838', '#ed7d00', '#395c6b', '#d94d15', '#889da6'],
      pointRadius: 10,
      data: nodes.map((d) => Object.assign({}, d)),
    },
  ],
};
// #endregion data
// #region config
export const config: ChartConfiguration<'forceDirectedGraph'> = {
  type: 'forceDirectedGraph',
  data,
  options: {
    tree: {
      orientation: 'radial',
    },
    layout: {
      padding: {
        left: 20,
        top: 20,
        bottom: 20,
        right: 20,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        // display: true,
        align: 'right',
        offset: 6,
        formatter: function (value, context) {
          return '' + value.name + '';
        },
        color: 'black',
        backgroundColor: 'steelblue',
      },
    },
  },
  plugins: [ChartDataLabels],
};
// #endregion config
