import { registry, PointElement, LinearScale } from 'chart.js';
import createChart from '../__tests__/createChart';
import { DendrogramController } from './DendrogramController';
import nodes from './__tests__/tree';
import { EdgeLine } from '../elements';

describe('dendrogram', () => {
  beforeAll(() => {
    registry.addControllers(DendrogramController);
    registry.addElements(EdgeLine, PointElement);
    registry.addScales(LinearScale);
  });
  test('default', () => {
    return createChart({
      type: DendrogramController.id as 'dendrogram',
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
    }).toMatchImageSnapshot();
  });
  test('vertical', () => {
    return createChart({
      type: DendrogramController.id as 'dendrogram',
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
    }).toMatchImageSnapshot();
  });
  test('radial', () => {
    return createChart({
      type: DendrogramController.id as 'dendrogram',
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
    }).toMatchImageSnapshot();
  });

  test('default tree', () => {
    return createChart({
      type: DendrogramController.id as 'dendrogram',
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
    }).toMatchImageSnapshot();
  });
  test('vertical tree', () => {
    return createChart({
      type: DendrogramController.id as 'dendrogram',
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
    }).toMatchImageSnapshot();
  });
  test('radial tree', () => {
    return createChart({
      type: DendrogramController.id as 'dendrogram',
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
    }).toMatchImageSnapshot();
  });
  test('directed', () => {
    return createChart({
      type: DendrogramController.id as 'dendrogram',
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
    }).toMatchImageSnapshot();
  });
});
