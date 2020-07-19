import matchChart from '../__tests__/matchChart';
import { ForceDirectedGraphController } from './forceDirected';
import data from './__tests__/miserables';
import { registry, Point, LinearScale } from '@sgratzl/chartjs-esm-facade';
import { EdgeLine } from '../elements';

describe('dendogram', () => {
  beforeAll(() => {
    registry.addControllers(ForceDirectedGraphController);
    registry.addElements(EdgeLine, Point);
    registry.addScales(LinearScale);
  });
  test('default', () => {
    return matchChart({
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
    });
  });
});
