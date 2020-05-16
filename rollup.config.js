// rollup.config.js
import pnp from 'rollup-plugin-pnp-resolve';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

export default [
  {
    input: 'src/bundle.js',
    output: {
      file: 'build/Chart.Graphs.js',
      name: 'ChartGraphs',
      format: 'umd',
      globals: {
        'chart.js': 'Chart',
      },
    },
    external: ['chart.js'],
    plugins: [commonjs(), pnp(), resolve(), babel({ babelHelpers: 'runtime' })],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'build/Chart.Graphs.esm.js',
      name: 'ChartGraphs',
      format: 'esm',
      globals: {
        'chart.js': 'Chart',
      },
    },
    external: ['chart.js', '@babel/runtime', 'd3-force', 'd3-hierarchy'],
    plugins: [commonjs(), pnp(), resolve()],
  },
];
