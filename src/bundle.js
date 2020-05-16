export * from '.';

import { Dendogram, ForceDirectedGraph, Graph, Tree } from './controllers';

Graph.register();
ForceDirectedGraph.register();
Dendogram.register();
Tree.register();
