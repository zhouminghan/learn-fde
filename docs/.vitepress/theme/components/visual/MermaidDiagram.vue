<template>
  <DiagramFrame :title="title" :caption="caption" :legend="legend">
    <div ref="host" class="mermaid-host"></div>
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
let observer: MutationObserver | null = null
let renderSeq = 0

async function renderDiagram() {
  const el = host.value
  if (!el) return
  const mermaid = (await import('mermaid')).default
  const dark = document.documentElement.classList.contains('dark')

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'base',
    fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
    themeVariables: dark
      ? {
          background: '#202a34',
          primaryColor: '#26364a',
          primaryBorderColor: '#3a4c63',
          primaryTextColor: '#e8eef4',
          secondaryColor: '#243b2d',
          tertiaryColor: '#1c2c3d',
          lineColor: '#54667a',
          textColor: '#b8c3cf',
          fontSize: '15px'
        }
      : {
          background: '#fffefb',
          primaryColor: '#e3e9f1',
          primaryBorderColor: '#b9c6d6',
          primaryTextColor: '#1d2733',
          secondaryColor: '#dcf0ed',
          tertiaryColor: '#f9e8da',
          lineColor: '#8b97a5',
          textColor: '#1d2733',
          fontSize: '15px'
        }
  })

  const seq = ++renderSeq
  const id = `mmd-${seq}-${Date.now()}`
  try {
    const { svg } = await mermaid.render(id, props.code)
    if (seq === renderSeq) el.innerHTML = svg
  } catch (error) {
    if (seq === renderSeq) {
      el.innerHTML = `<p class="mermaid-error">图形渲染失败：${(error as Error).message}</p>`
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
  overflow-x: auto;
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
</style>
