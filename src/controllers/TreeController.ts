import {
  CartesianScaleTypeRegistry,
  Chart,
  ChartConfiguration,
  ChartItem,
  CoreChartOptions,
  LinearScale,
  PointElement,
} from 'chart.js';
import { merge } from 'chart.js/helpers';
import { EdgeLine } from '../elements';
import { DendogramController, IDendogramChartControllerDatasetOptions } from './DendogramController';
import type { IGraphDataPoint, ITreeNode } from './GraphController';
import patchController from './patchController';

export class TreeController extends DendogramController {
  static readonly id = 'tree';

  static readonly defaults: any = /* #__PURE__ */ merge({}, [
    DendogramController.defaults,
    {
      datasets: {
        tree: {
          mode: 'tree',
        },
      },
    },
  ]);

  static readonly overrides: any = /* #__PURE__ */ DendogramController.overrides;
}

declare module 'chart.js' {
  export interface ChartTypeRegistry {
    tree: {
      chartOptions: CoreChartOptions<'tree'>;
      datasetOptions: IDendogramChartControllerDatasetOptions;
      defaultDataPoint: IGraphDataPoint;
      metaExtensions: Record<string, never>;
      parsedDataType: ITreeNode;
      scales: keyof CartesianScaleTypeRegistry;
    };
  }
}

export class TreeChart<DATA extends unknown[] = IGraphDataPoint[], LABEL = string> extends Chart<'tree', DATA, LABEL> {
  static id = TreeController.id;

  constructor(item: ChartItem, config: Omit<ChartConfiguration<'tree', DATA, LABEL>, 'type'>) {
    super(item, patchController('tree', config, TreeController, [EdgeLine, PointElement], LinearScale));
  }
}
