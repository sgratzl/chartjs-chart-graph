---
title: Examples
---

# Examples

<script setup>
import {config as force} from './force';
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
