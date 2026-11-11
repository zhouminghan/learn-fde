<template>
  <figure class="diagram" :class="{ 'diagram--full': full }">
    <div v-if="title || fullscreen" class="diagram__bar">
      <figcaption v-if="title" class="diagram__title">{{ title }}</figcaption>
      <button
        v-if="fullscreen"
        type="button"
        class="diagram__fullscreen"
        :title="full ? '退出全屏' : '全屏查看'"
        :aria-expanded="full"
        @click="full = !full"
      >
        <Minimize2 v-if="full" :size="15" />
        <Maximize2 v-else :size="15" />
      </button>
    </div>
    <div class="diagram__body">
      <slot />
    </div>
    <div v-if="legend.length" class="diagram__legend">
      <span v-for="item in legend" :key="item.label" class="diagram__legend-item">
        <i :style="{ background: item.color }"></i>{{ item.label }}
      </span>
    </div>
    <figcaption v-if="caption" class="diagram__caption">{{ caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Maximize2, Minimize2 } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    title?: string
    caption?: string
    legend?: { label: string; color: string }[]
    fullscreen?: boolean
  }>(),
  { fullscreen: true, legend: () => [] }
)

const full = ref(false)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && full.value) full.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.diagram {
  margin: 24px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--lf-card-radius);
  background: var(--vp-c-bg-elv);
  overflow: hidden;
}

.diagram--full {
  position: fixed;
  inset: 0;
  z-index: 1000;
  margin: 0;
  border: 0;
  border-radius: 0;
  display: flex;
  flex-direction: column;
}

.diagram__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.diagram__title {
  font-size: 14px;
  font-weight: 650;
  color: var(--lf-navy-text);
}

.diagram__fullscreen {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-elv);
  cursor: pointer;
}

.diagram__fullscreen:hover {
  color: var(--lf-accent);
  border-color: var(--lf-accent);
}

.diagram__body {
  padding: 16px;
  overflow: auto;
}

.diagram--full .diagram__body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.diagram__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 10px 16px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.diagram__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.diagram__legend-item i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.diagram__caption {
  padding: 0 16px 12px;
  color: var(--vp-c-text-3);
  font-size: 13px;
  line-height: 1.6;
}
</style>
