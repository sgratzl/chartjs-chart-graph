---
title: Tree Orientations
---

# Tree Orientations

<script setup>
import {horizontal, vertical, radial} from './tree';
</script>

## Horizontal

<TreeChart
  :options="horizontal.options"
  :data="horizontal.data"
/>

### Code

:::code-group

<<< ./tree.ts#horizontal [config]

<<< ./tree.ts#data [data]

:::

## Vertical

<TreeChart
  :options="vertical.options"
  :data="vertical.data"
/>

### Code

:::code-group

<<< ./tree.ts#vertical [config]

<<< ./tree.ts#data [data]

:::

## Radial

<TreeChart
  :options="radial.options"
  :data="radial.data"
/>

### Code

:::code-group

<<< ./tree.ts#radial [config]

<<< ./tree.ts#data [data]

:::
