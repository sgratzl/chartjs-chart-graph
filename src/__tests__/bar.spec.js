import { matchChart } from '../test_utils';

describe('test', () => {
  test('t', () => {
    return matchChart({
      type: 'bar',
      data: {
        labels: ['A', 'B'],
        datasets: [
          {
            backgroundColor: 'steelblue',
            data: [1, 2],
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
