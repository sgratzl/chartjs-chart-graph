"use strict";
exports.__esModule = true;
var chart_js_1 = require("chart.js");
var build_1 = require("../build");
// register controller in chart.js and ensure the defaults are set
chart_js_1.Chart.register(build_1.ForceDirectedGraphController, build_1.EdgeLine, chart_js_1.LinearScale, chart_js_1.PointElement);
var ctx = document.querySelector('canvas').getContext('2d');
var chart1 = new chart_js_1.Chart(ctx, {
    type: 'forceDirectedGraph',
    data: {
        labels: ['A', 'B', 'C'],
        datasets: [
            {
                data: [
                    // nodes as objects
                    { x: 1, y: 2 },
                    { x: 3, y: 1 },
                    { x: 5, y: 3 },
                ],
                edges: [
                    // edge list where source/target refers to the node index
                    { source: 0, target: 1 },
                    { source: 0, target: 2 },
                ]
            },
        ]
    },
    options: {
        elements: {
            point: {
                backgroundColor: 'red'
            },
            edgeLine: {
                backgroundColor: 'red'
            }
        }
    }
});
var chart2 = new chart_js_1.Chart(ctx, {
    type: 'tree',
    data: {
        labels: ['A', 'B', 'C'],
        datasets: [
            {
                data: [
                    // nodes as objects
                    { x: 1, y: 2 },
                    { x: 3, y: 1, parent: 0 },
                    { x: 5, y: 3, parent: 0 },
                ]
            },
        ]
    },
    options: {
        elements: {
            point: {
                backgroundColor: 'red'
            },
            edgeLine: {
                backgroundColor: 'red'
            }
        }
    }
});
var chart3 = new chart_js_1.Chart(ctx, {
    type: 'dendogram',
    data: {
        labels: ['A', 'B', 'C'],
        datasets: [
            {
                data: [
                    // nodes as objects
                    { x: 1, y: 2 },
                    { x: 3, y: 1, parent: 0 },
                    { x: 5, y: 3, parent: 0 },
                ]
            },
        ]
    },
    options: {
        elements: {
            point: {
                backgroundColor: 'red'
            },
            edgeLine: {
                backgroundColor: 'red'
            }
        }
    }
});
