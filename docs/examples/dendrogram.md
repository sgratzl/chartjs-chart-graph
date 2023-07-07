---
title: Dendrogram
---

# Dendrogram

<script setup>
import {config} from './dendrogram';
</script>

<DendrogramChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./dendrogram.ts#config [config]

<<< ./dendrogram.ts#data [data]

:::
