<template>
  <div class="panel-node">
    <Panel v-bind="data" />
  </div>
</template>

<script setup lang="ts">
import { type NodeProps } from '@vue-flow/core';
import Panel from '@/components/Panels/Panel.vue';

interface Props extends NodeProps {
  data: any;
}

defineProps<Props>();
</script>

<style scoped>
.panel-node {
  width: 100%;
  height: 100%;
}
</style>
