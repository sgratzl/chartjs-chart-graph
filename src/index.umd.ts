import { registry } from '@sgratzl/chartjs-esm-facade';
import { DendogramController, ForceDirectedGraphController, GraphController, TreeController } from './controllers';
import { EdgeLine } from './elements';

export * from '.';

registry.addControllers(DendogramController, ForceDirectedGraphController, GraphController, TreeController);
registry.addElements(EdgeLine);
