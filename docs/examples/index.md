---
title: Examples
---

# Examples

<script setup>
import {config as force} from './force';
import {config as dendrogram} from './dendrogram';
import {config as tree} from './tree';
</script>

## Force Directed Graph

<ForceDirectedGraphChart
  :options="force.options"
  :data="force.data"
/>

### Code

:::code-group

<<< ./force.ts#config [config]

<<< ./force.ts#data [data]

:::

## Dendrogram

<DendrogramChart
  :options="dendrogram.options"
  :data="dendrogram.data"
/>

### Code

:::code-group

<<< ./dendrogram.ts#config [config]

<<< ./dendrogram.ts#data [data]

:::

## Tree

<TreeChart
  :options="tree.options"
  :data="tree.data"
/>

### Code

:::code-group

<<< ./tree.ts#tree [config]

<<< ./tree.ts#data [data]

:::
