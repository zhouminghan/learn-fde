<template>
  <ArchitectureDiagram
    title="Agent 核心架构"
    caption="Agent 以规划为中枢，连接感知、记忆与工具执行，并通过反馈不断调整，直到满足终止条件。"
    :nodes="nodes"
    :edges="edges"
    :legend="legend"
  />
</template>

<script setup lang="ts">
import ArchitectureDiagram, { type ArchNode, type ArchEdge } from '../visual/ArchitectureDiagram.vue'

const nodes: ArchNode[] = [
  { id: 'user', label: '用户输入', desc: '问题或任务指令，是执行的起点。', kind: 'core', col: 0 },
  { id: 'perceive', label: '感知', desc: '理解输入并提取关键信息。', kind: 'core', col: 1 },
  { id: 'plan', label: '规划', desc: '把目标拆解为可执行步骤。', kind: 'core', col: 2 },
  { id: 'memory', label: '记忆', desc: '会话上下文与长期知识。', kind: 'data', col: 2 },
  { id: 'tool', label: '工具执行', desc: '调用外部函数完成具体操作。', kind: 'tool', col: 3 },
  { id: 'observe', label: '观察结果', desc: '读取工具输出与环境反馈。', kind: 'data', col: 4 },
  { id: 'output', label: '输出结果', desc: '在满足终止条件时生成最终回答。', kind: 'output', col: 5 }
]

const edges: ArchEdge[] = [
  { from: 'user', to: 'perceive' },
  { from: 'perceive', to: 'plan' },
  { from: 'plan', to: 'memory' },
  { from: 'plan', to: 'tool', label: '调度' },
  { from: 'tool', to: 'observe' },
  { from: 'observe', to: 'plan', label: '反馈' },
  { from: 'plan', to: 'output', label: '达成' }
]

const legend = [
  { label: '核心流程', color: 'var(--lf-navy)' },
  { label: '数据与状态', color: 'var(--lf-blue)' },
  { label: '工具执行', color: 'var(--lf-teal)' },
  { label: '输出', color: 'var(--lf-accent)' }
]
</script>
