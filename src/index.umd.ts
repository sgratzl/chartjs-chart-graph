import { registry } from 'chart.js';
import {
  DendrogramController,
  dendrogramController,
  ForceDirectedGraphController,
  GraphController,
  TreeController,
} from './controllers';
import { EdgeLine } from './elements';

export * from '.';

registry.addControllers(
  DendrogramController,
  dendrogramController,
  ForceDirectedGraphController,
  GraphController,
  TreeController
);
registry.addElements(EdgeLine);
