/* eslint-env node */
const path = require('path');

const mapper = {};
for (const d of ['d3-force', 'd3-hierarchy', 'd3-quadtree', 'd3-dispatch', 'd3-timer']) {
  mapper[`^${d}$`] = require.resolve(d).replace(`src${path.sep}index.js`, `dist${path.sep}/${d}.js`);
}

module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest/presets/js-with-ts-esm',
  moduleNameMapper: mapper,
  testRegex: '((\\.|/)(test|spec))\\.m?tsx?$',
};
