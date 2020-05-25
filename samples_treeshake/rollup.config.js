// rollup.config.js
import pnp from 'rollup-plugin-pnp-resolve';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default ['tree', 'forceDirected', 'dendogram'].map((f) => ({
  input: `src/${f}.js`,
  output: {
    file: `build/${f}.js`,
    format: 'esm',
  },
  external: ['chart.js', 'd3-force', 'd3-hierarchy'],
  plugins: [commonjs(), pnp(), resolve()],
}));
