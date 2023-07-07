import Theme from 'vitepress/theme';
import { createTypedChart } from 'vue-chartjs';
import { Tooltip, LineElement, PointElement, LinearScale } from 'chart.js';
import { DendrogramController, ForceDirectedGraphController, EdgeLine, TreeController } from '../../../src';
import ChartPluginDataLabel from 'chartjs-plugin-datalabels';

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
      LinearScale,
      ChartPluginDataLabel,
    ];
    app.component('DendrogramChart', createTypedChart('dendrogram', deps));
    app.component('TreeChart', createTypedChart('tree', deps));
    app.component('ForceDirectedGraphChart', createTypedChart('forceDirectedGraph', deps));
  },
};
