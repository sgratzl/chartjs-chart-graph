import createChart from '../__tests__/createChart';
import { ForceDirectedGraphController } from './forceDirected';
import data from './__tests__/miserables';
import { registry, Point, LinearScale } from 'chart.js';
import { EdgeLine } from '../elements';

describe('dendogram', () => {
  beforeAll(() => {
    registry.addControllers(ForceDirectedGraphController);
    registry.addElements(EdgeLine, Point);
    registry.addScales(LinearScale);
  });
  test('default', () => {
    return createChart({
      type: ForceDirectedGraphController.id,
      data: {
        labels: data.nodes.map((d) => d.id),
        datasets: [
          {
            simulation: {
              initialIterations: 100,
              autoRestart: false,
            },
            pointBackgroundColor: 'steelblue',
            pointRadius: 5,
            data: data.nodes,
            edges: data.links,
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
