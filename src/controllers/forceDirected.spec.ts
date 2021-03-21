import { registry, PointElement, LinearScale } from 'chart.js';
import createChart from '../__tests__/createChart';
import { ForceDirectedGraphController } from './ForceDirectedGraphController';
import data from './__tests__/miserables';
import { EdgeLine } from '../elements';

describe('dendogram', () => {
  beforeAll(() => {
    registry.addControllers(ForceDirectedGraphController);
    registry.addElements(EdgeLine, PointElement);
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
            edges: data.links as any,
          },
        ],
      },
    }).toMatchImageSnapshot();
  });
});
