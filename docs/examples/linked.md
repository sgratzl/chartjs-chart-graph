---
title: Linked
---

# Linked

<script setup>
import {config} from './linked';
</script>

<ForceDirectedGraphChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./linked.ts#config [config]

<<< ./linked.ts#data [data]

:::
