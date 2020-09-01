import { IChartComponentLike, registry, IDatasetControllerChartComponent } from '@sgratzl/chartjs-esm-facade';

export default function patchController<T, TYPE>(
  type: TYPE,
  config: T,
  controller: IDatasetControllerChartComponent,
  elements: IChartComponentLike = [],
  scales: IChartComponentLike = []
): T & { type: TYPE } {
  registry.addControllers(controller);
  if (Array.isArray(elements)) {
    for (const elem of elements) {
      registry.addElements(elem);
    }
  } else {
    registry.addElements(elements);
  }
  if (Array.isArray(scales)) {
    for (const elem of scales) {
      registry.addScales(elem);
    }
  } else {
    registry.addScales(scales);
  }
  const c = config as any;
  c.type = type;
  return c;
}
