import Theme from 'vitepress/theme';
import { createTypedChart } from 'vue-chartjs';
import { Tooltip, LineElement, PointElement } from 'chart.js';
import { DendrogramController, ForceDirectedGraphController, EdgeLine, TreeController } from '../../../src';

export default {
  ...Theme,
  enhanceApp({ app }) {
    const deps = [
      Tooltip,
      LineElement,
      PointElement,
      DendrogramController,
      ForceDirectedGraphController,
      EdgeLine,
      TreeController,
    ];
    app.component('DendrogramChart', createTypedChart('dendrogram', deps));
    app.component('TreeChart', createTypedChart('tree', deps));
    app.component('ForceDirectedGraphChart', createTypedChart('forceDirected', deps));
  },
};
