---
title: Tree Orientations
---

# Tree Orientations

<script setup>
import {horizontal, vertical, radial} from './tree';
</script>

## Horizontal

<TreeGraph
  :options="horizontal.options"
  :data="horizontal.data"
/>

### Code

:::code-group

<<< ./tree.ts#horizontal [config]

<<< ./tee.ts#data [data]

:::

## Vertical

<TreeGraph
  :options="vertical.options"
  :data="vertical.data"
/>

### Code

:::code-group

<<< ./tree.ts#vertical [config]

<<< ./tee.ts#data [data]

:::

## Radial

<TreeGraph
  :options="radial.options"
  :data="radial.data"
/>

### Code

:::code-group

<<< ./tree.ts#radial [config]

<<< ./tee.ts#data [data]

:::
