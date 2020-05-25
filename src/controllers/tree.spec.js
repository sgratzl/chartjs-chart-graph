import matchChart from '../__tests__/matchChart';
import { DendogramController } from './tree';
import nodes from './__tests__/tree';

describe('dendogram', () => {
  beforeAll(() => {
    DendogramController.register();
  });
  test('default', () => {
    return matchChart({
      type: DendogramController.id,
      data: {
        labels: nodes.map((d) => d.name),
        datasets: [
          {
            pointBackgroundColor: 'steelblue',
            pointRadius: 5,
            // stepped: 'middle',
            data: nodes,
          },
        ],
      },
      options: {
        legend: {
          display: false,
        },
      },
    });
  });
  test('vertical', () => {
    return matchChart({
      type: DendogramController.id,
      data: {
        labels: nodes.map((d) => d.name),
        datasets: [
          {
            tree: {
              orientation: 'vertical',
            },
            pointBackgroundColor: 'steelblue',
            pointRadius: 5,
            // stepped: 'middle',
            data: nodes,
          },
        ],
      },
      options: {
        legend: {
          display: false,
        },
      },
    });
  });
  test('radial', () => {
    return matchChart({
      type: DendogramController.id,
      data: {
        labels: nodes.map((d) => d.name),
        datasets: [
          {
            tree: {
              orientation: 'radial',
            },
            pointBackgroundColor: 'steelblue',
            pointRadius: 5,
            // stepped: 'middle',
            data: nodes,
          },
        ],
      },
      options: {
        legend: {
          display: false,
        },
      },
    });
  });

  test('default tree', () => {
    return matchChart({
      type: DendogramController.id,
      data: {
        labels: nodes.map((d) => d.name),
        datasets: [
          {
            tree: {
              mode: 'tree',
            },
            pointBackgroundColor: 'steelblue',
            pointRadius: 5,
            // stepped: 'middle',
            data: nodes,
          },
        ],
      },
      options: {
        legend: {
          display: false,
        },
      },
    });
  });
  test('vertical tree', () => {
    return matchChart({
      type: DendogramController.id,
      data: {
        labels: nodes.map((d) => d.name),
        datasets: [
          {
            tree: {
              mode: 'tree',
              orientation: 'vertical',
            },
            pointBackgroundColor: 'steelblue',
            pointRadius: 5,
            // stepped: 'middle',
            data: nodes,
          },
        ],
      },
      options: {
        legend: {
          display: false,
        },
      },
    });
  });
  test('radial tree', () => {
    return matchChart({
      type: DendogramController.id,
      data: {
        labels: nodes.map((d) => d.name),
        datasets: [
          {
            tree: {
              mode: 'tree',
              orientation: 'radial',
            },
            pointBackgroundColor: 'steelblue',
            pointRadius: 5,
            // stepped: 'middle',
            data: nodes,
          },
        ],
      },
      options: {
        legend: {
          display: false,
        },
      },
    });
  });
});
