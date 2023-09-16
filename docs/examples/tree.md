---
title: Tree
---

# Tree

<script setup>
import {config} from './tree';
</script>

<TreeChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./tree.ts#config [config]

<<< ./tree.ts#data [data]

:::
