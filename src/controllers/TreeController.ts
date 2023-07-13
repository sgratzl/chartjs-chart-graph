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
import { DendrogramController, IDendrogramChartControllerDatasetOptions, ITreeOptions } from './DendrogramController';
import type { IGraphDataPoint, ITreeNode } from './GraphController';
import patchController from './patchController';

export class TreeController extends DendrogramController {
  static readonly id = 'tree';

  /**
   * @hidden
   */
  static readonly defaults: any = /* #__PURE__ */ merge({}, [
    DendrogramController.defaults,
    {
      tree: {
        mode: 'tree',
      },
    },
  ]);

  /**
   * @hidden
   */
  static readonly overrides: any = /* #__PURE__ */ DendrogramController.overrides;
}

declare module 'chart.js' {
  export interface ChartTypeRegistry {
    tree: {
      chartOptions: CoreChartOptions<'tree'> & { tree: ITreeOptions };
      datasetOptions: IDendrogramChartControllerDatasetOptions;
      defaultDataPoint: IGraphDataPoint & Record<string, unknown>;
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
