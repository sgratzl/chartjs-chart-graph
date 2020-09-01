import matchChart from '../__tests__/matchChart';
import { DendogramController } from './tree';
import { registry, Point, LinearScale } from '@sgratzl/chartjs-esm-facade';
import nodes from './__tests__/tree';
import { EdgeLine } from '../elements';

describe('dendogram', () => {
  beforeAll(() => {
    registry.addControllers(DendogramController);
    registry.addElements(EdgeLine, Point);
    registry.addScales(LinearScale);
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
  test('directed', () => {
    return matchChart({
      type: DendogramController.id,
      data: {
        labels: nodes.map((d) => d.name),
        datasets: [
          {
            pointBackgroundColor: 'steelblue',
            pointRadius: 5,
            directed: true,
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
