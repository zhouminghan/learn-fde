<template>
  <DiagramFrame :title="title" :caption="caption" :legend="legend">
    <div
      ref="host"
      class="mermaid-host"
      role="img"
      :aria-label="title || 'Mermaid 图表'"
      :aria-busy="loading"
    ></div>
    <p v-if="loading" class="mermaid-loading">图表加载中…</p>
    <p v-if="error" class="mermaid-error" role="alert">图形渲染失败：{{ error }}</p>
  </DiagramFrame>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import DiagramFrame from './DiagramFrame.vue'

const props = withDefaults(
  defineProps<{
    code: string
    title?: string
    caption?: string
    legend?: { label: string; color: string }[]
  }>(),
  { legend: () => [] }
)

const host = ref<HTMLElement | null>(null)
const loading = ref(true)
const error = ref('')
let observer: MutationObserver | null = null
let renderSeq = 0

function cssVariable(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

async function renderDiagram() {
  const el = host.value
  if (!el) return
  const mermaid = (await import('mermaid')).default
  const dark = document.documentElement.classList.contains('dark')
  loading.value = true
  error.value = ''

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
    themeVariables: {
      background: cssVariable('--lf-chart-surface'),
      primaryColor: cssVariable('--lf-mermaid-primary'),
      primaryBorderColor: cssVariable('--lf-mermaid-primary-border'),
      primaryTextColor: cssVariable('--lf-mermaid-text'),
      secondaryColor: cssVariable('--lf-mermaid-secondary'),
      tertiaryColor: cssVariable('--lf-mermaid-tertiary'),
      lineColor: cssVariable('--lf-mermaid-line'),
      textColor: cssVariable('--lf-mermaid-text'),
      fontSize: '15px',
      fontFamily: cssVariable('--vp-font-family-base')
    }
  })

  const seq = ++renderSeq
  const id = `mmd-${seq}-${Date.now()}`
  try {
    const { svg } = await mermaid.render(id, props.code)
    if (seq === renderSeq) {
      el.innerHTML = svg
      loading.value = false
    }
  } catch (renderError) {
    if (seq === renderSeq) {
      loading.value = false
      el.innerHTML = ''
      error.value = (renderError as Error).message
    }
  }
}

onMounted(() => {
  void renderDiagram()
  observer = new MutationObserver(() => void renderDiagram())
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.mermaid-host {
  display: flex;
  justify-content: center;
  min-height: 180px;
  overflow-x: auto;
  background: var(--lf-chart-surface);
}

.mermaid-host :deep(svg) {
  max-width: 100%;
  height: auto;
}

.mermaid-error {
  margin: 0;
  color: var(--lf-red);
  font-size: 13px;
}

.mermaid-loading {
  margin: 8px 0 0;
  color: var(--lf-text-2);
  font-size: 13px;
  text-align: center;
}
</style>
