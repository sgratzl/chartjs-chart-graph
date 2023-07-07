---
title: Directed Tree
---

# Directed Tree

<script setup>
import {config} from './directed';
</script>

<TreeChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./directed.ts#config [config]

<<< ./directed.ts#data [data]

:::
