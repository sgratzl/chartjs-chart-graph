import { registry } from 'chart.js';
import { DendrogramController, ForceDirectedGraphController, GraphController, TreeController } from './controllers';
import { EdgeLine } from './elements';

export * from '.';

registry.addControllers(DendrogramController, ForceDirectedGraphController, GraphController, TreeController);
registry.addElements(EdgeLine);
