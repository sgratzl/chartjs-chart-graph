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
      data: nodes.map((d) => Object.assign({}, d)),
    },
  ],
};
// #endregion data
// #region tree
export const tree: ChartConfiguration<'tree'> = {
  type: 'tree',
  data,
  options: {
    tree: {
      mode: 'tree',
    },
  },
};
// #endregion tree
// #region horizontal
export const horizontal: ChartConfiguration<'tree'> = {
  type: 'tree',
  data,
  options: {
    tree: {
      orientation: 'horizontal',
    },
  },
};
// #endregion horizontal
// #region vertical
export const vertical: ChartConfiguration<'tree'> = {
  type: 'tree',
  data,
  options: {
    tree: {
      orientation: 'vertical',
    },
  },
};
// #endregion vertical
// #region radial
export const radial: ChartConfiguration<'tree'> = {
  type: 'tree',
  data,
  options: {
    tree: {
      orientation: 'radial',
    },
  },
};
// #endregion radial
