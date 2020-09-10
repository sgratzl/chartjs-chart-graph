import createChart from '../__tests__/createChart';
import { DendogramController } from './tree';
import { registry, Point, LinearScale } from 'chart.js';
import nodes from './__tests__/tree';
import { EdgeLine } from '../elements';

describe('dendogram', () => {
  beforeAll(() => {
    registry.addControllers(DendogramController);
    registry.addElements(EdgeLine, Point);
    registry.addScales(LinearScale);
  });
  test('default', () => {
    return createChart({
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
    }).toMatchImageSnapshot();
  });
  test('vertical', () => {
    return createChart({
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
    }).toMatchImageSnapshot();
  });
  test('radial', () => {
    return createChart({
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
    }).toMatchImageSnapshot();
  });

  test('default tree', () => {
    return createChart({
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
    }).toMatchImageSnapshot();
  });
  test('vertical tree', () => {
    return createChart({
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
    }).toMatchImageSnapshot();
  });
  test('radial tree', () => {
    return createChart({
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
    }).toMatchImageSnapshot();
  });
  test('directed', () => {
    return createChart({
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
    }).toMatchImageSnapshot();
  });
});
