import { registry } from 'chart.js';
import {
  DendrogramController,
  DendogramController,
  ForceDirectedGraphController,
  GraphController,
  TreeController,
} from './controllers';
import { EdgeLine } from './elements';

export * from '.';

registry.addControllers(
  DendrogramController,
  DendogramController,
  ForceDirectedGraphController,
  GraphController,
  TreeController
);
registry.addElements(EdgeLine);
