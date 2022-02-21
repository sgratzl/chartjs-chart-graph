import { Chart, LinearScale, PointElement } from 'chart.js';
import { ForceDirectedGraphController, EdgeLine } from '../build';

// register controller in chart.js and ensure the defaults are set
Chart.register(ForceDirectedGraphController, EdgeLine, LinearScale, PointElement);

const ctx = document.querySelector('canvas').getContext('2d');

const chart1 = new Chart(ctx, {
  type: 'forceDirectedGraph',
  data: {
    labels: ['A', 'B', 'C'], // node labels
    datasets: [
      {
        data: [
          // nodes as objects
          { x: 1, y: 2 }, // x, y will be set by the force directed graph and can be omitted
          { x: 3, y: 1 },
          { x: 5, y: 3 },
        ],
        edges: [
          // edge list where source/target refers to the node index
          { source: 0, target: 1 },
          { source: 0, target: 2 },
        ],
      },
    ],
  },
  options: {
    elements: {
      point: {
        backgroundColor: 'red',
      },
      edgeLine: {
        backgroundColor: 'red',
      },
    },
  },
});

const chart2 = new Chart(ctx, {
  type: 'tree',
  data: {
    labels: ['A', 'B', 'C'], // node labels
    datasets: [
      {
        data: [
          // nodes as objects
          { x: 1, y: 2 }, // x, y will be set by the force directed graph and can be omitted
          { x: 3, y: 1, parent: 0 },
          { x: 5, y: 3, parent: 0 },
        ],
      },
    ],
  },
  options: {
    elements: {
      point: {
        backgroundColor: 'red',
      },
      edgeLine: {
        backgroundColor: 'red',
      },
    },
  },
});

const chart3 = new Chart(ctx, {
  type: 'dendogram',
  data: {
    labels: ['A', 'B', 'C'], // node labels
    datasets: [
      {
        data: [
          // nodes as objects
          { x: 1, y: 2 }, // x, y will be set by the force directed graph and can be omitted
          { x: 3, y: 1, parent: 0 },
          { x: 5, y: 3, parent: 0 },
        ],
      },
    ],
  },
  options: {
    elements: {
      point: {
        backgroundColor: 'red',
      },
      edgeLine: {
        backgroundColor: 'red',
      },
    },
  },
});
