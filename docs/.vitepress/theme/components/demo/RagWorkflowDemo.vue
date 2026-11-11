<template>
  <MermaidDiagram
    title="RAG 检索增强生成流程"
    caption="离线阶段建立索引，在线阶段完成召回、重排与带溯源的生成。"
    :code="code"
    :legend="legend"
  />
</template>

<script setup lang="ts">
import MermaidDiagram from '../visual/MermaidDiagram.vue'

const code = `
flowchart TB
  subgraph INGEST[离线索引]
    A[原始文档] --> B[解析清洗]
    B --> C[切分]
    C --> D[向量化]
    D --> E[向量索引]
  end
  subgraph QUERY[在线检索]
    F[用户问题] --> G[向量化]
    G --> H[召回候选]
    H --> I[重排]
    I --> J[构造上下文]
    J --> K[生成并溯源]
  end
  E --> H
`

const legend = [
  { label: '离线索引', color: 'var(--lf-navy)' },
  { label: '在线检索', color: 'var(--lf-teal)' }
]
</script>
