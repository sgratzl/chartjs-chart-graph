---
title: Tree with Labels
---

# Tree with Labels

<script setup>
import {config, radial} from './label';
</script>

<TreeChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./label.ts#config [config]

<<< ./label.ts#data [data]

:::

## Radial Tree with Labels

<TreeChart
  :options="radial.options"
  :data="radial.data"
/>

### Code

:::code-group

<<< ./label.ts#radial [config]

<<< ./label.ts#data [data]

:::
