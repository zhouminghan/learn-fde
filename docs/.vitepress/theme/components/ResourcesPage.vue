<template>
  <div class="resources">
    <header class="page-head">
      <h1>资源中心</h1>
      <p>术语表、交付模板与检查清单，帮助把课程知识迁移到真实项目。</p>
    </header>

    <section class="block">
      <h2>术语表</h2>
      <div class="glossary">
        <div v-for="t in glossary" :key="t.term" class="glossary__item">
          <span class="glossary__term">{{ t.term }}</span>
          <span class="glossary__def">{{ t.def }}</span>
        </div>
      </div>
    </section>

    <section class="block">
      <h2>交付模板</h2>
      <div class="cards">
        <div v-for="t in templates" :key="t.title" class="card">
          <h3>{{ t.title }}</h3>
          <ul>
            <li v-for="item in t.items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="block">
      <h2>检查清单</h2>
      <div class="cards">
        <div v-for="c in checklists" :key="c.title" class="card">
          <h3>{{ c.title }}</h3>
          <ul>
            <li v-for="item in c.items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="block">
      <h2>官方资料入口</h2>
      <div class="links">
        <a v-for="l in links" :key="l.href" class="link" :href="l.href" target="_blank" rel="noopener noreferrer">
          <span class="link__title">{{ l.title }}</span>
          <span class="link__href">{{ l.href }}</span>
        </a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const glossary = [
  { term: 'AI / 人工智能', def: '让机器表现出理解、推理、决策等智能行为的总体领域。' },
  { term: 'Agent / 智能体', def: '能够感知环境、做出规划并调用工具执行任务、根据反馈调整的系统。' },
  { term: 'RAG', def: '检索增强生成，先检索相关资料再生成回答，使回答有据可依。' },
  { term: 'Workflow', def: '把任务拆解为节点并通过条件、循环等方式编排执行的工作流。' },
  { term: 'Multi-Agent', def: '将任务按角色拆分给多个智能体，并通过协议协作完成目标。' },
  { term: 'Claw', def: '由模型自主规划并循环调用工具完成任务的执行模式。' },
  { term: 'Token', def: '模型处理文本的最小单元，可能是字、子词或词。' },
  { term: 'Prompt', def: '给模型的输入指令，用于约束角色、任务、上下文与输出格式。' },
  { term: '知识库', def: '经过清洗与索引、可供智能体检索的企业知识资料集合。' },
  { term: '连接器 / 工具', def: '连接器负责接入外部系统，工具是智能体可调用执行的具体能力。' }
]

const templates = [
  { title: 'FDE 客户需求澄清模板', items: ['业务目标', '用户角色', '现状流程', '核心痛点', '约束条件', '成功指标'] },
  { title: 'Agent 解决方案设计模板', items: ['需求与目标', '架构设计', '技术选型', '数据与集成', '验收标准', '风险应对'] }
]

const checklists = [
  { title: '知识库数据准备与质量', items: ['来源清晰', '无重复', '无过时内容', '格式规整', '切分合理', '可溯源'] },
  { title: 'Prompt 评审', items: ['角色明确', '任务清晰', '上下文充分', '示例恰当', '输出格式约束'] },
  { title: 'Workflow 设计与验收', items: ['节点完整', '条件覆盖', '异常处理', '人工兜底', '可观测'] },
  { title: '上线交付', items: ['测试集通过', '回归验证', '监控就绪', '回滚预案', '安全合规'] }
]

const links = [
  { title: '腾讯云 ADP FDE 认证详情', href: 'https://cloud.tencent.com/edu/training/cert/detail?type=CFD' },
  { title: '腾讯云 ADP 产品文档', href: 'https://cloud.tencent.com/document/product/1759' },
  { title: 'FDE 认证指南与生态伙伴', href: 'https://adp.tencent.com/zh/blog/adp-fde-certification-guide' }
]
</script>

<style scoped>
.resources {
  max-width: 1080px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.page-head h1 {
  margin: 0 0 8px;
  font-size: 34px;
  letter-spacing: 0;
}

.page-head p {
  margin: 0;
  color: var(--vp-c-text-2);
}

.block {
  margin-top: 28px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.block h2 {
  margin: 0 0 14px;
  font-size: 18px;
}

.glossary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.glossary__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.glossary__term {
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.glossary__def {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.card {
  padding: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.card h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.card ul {
  margin: 0;
  padding-left: 18px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.8;
}

.links {
  display: grid;
  gap: 8px;
}

.link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
}

.link__title {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.link__href {
  color: var(--vp-c-text-3);
  font-size: 12px;
  word-break: break-all;
}

.link:hover {
  border-color: var(--vp-c-brand-1);
}

@media (max-width: 640px) {
  .resources {
    padding: 28px 16px 64px;
  }

  .glossary,
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
