---
title: Force Directed Graph
---

# Force Directed Graph

<script setup>
import {config} from './force';
</script>

<ForceDirectedGraphChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./force.ts#config [config]

<<< ./force.ts#data [data]

:::
