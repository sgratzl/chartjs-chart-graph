export * from '.';

import { DendogramController, ForceDirectedGraphController, GraphController, TreeController } from './controllers';

GraphController.register();
ForceDirectedGraphController.register();
DendogramController.register();
TreeController.register();
