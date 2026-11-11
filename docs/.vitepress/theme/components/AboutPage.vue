<template>
  <div class="about">
    <header class="page-head">
      <h1>关于项目</h1>
    </header>

    <section class="block">
      <h2>项目说明</h2>
      <p>
        Learning FDE 是独立的 FDE 学习与实战训练项目，用于整理公开课程知识、训练企业级 Agent
        交付能力并记录个人学习过程。项目与腾讯云官方认证无隶属关系，不提供真实考试题，不承诺认证结果。
      </p>
      <p>
        课程、考试规则及平台能力均以腾讯云最新官方信息为准；本项目仅基于公开信息组织学习内容与原创练习。
      </p>
    </section>

    <section class="block">
      <h2>免责声明</h2>
      <ul>
        <li>模拟考试题目为根据公开知识点设计的原创练习，非腾讯云官方真题。</li>
        <li>模拟成绩仅表示达到本项目模拟规则的分数，不代表腾讯云官方成绩或认证结果。</li>
        <li>多选题按官方指南“错选、漏选不得分”判分，learn-FDE 实现为完全匹配计分。</li>
        <li>所有学习数据仅保存在当前浏览器本地，不会上传到任何服务器。</li>
      </ul>
    </section>

    <section class="block">
      <h2>关键规则依据</h2>
      <table class="table">
        <thead>
          <tr><th>参数</th><th>取值</th><th>来源</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in rules" :key="r.name">
            <td>{{ r.name }}</td>
            <td>{{ r.value }}</td>
            <td>{{ r.source }}</td>
          </tr>
        </tbody>
      </table>
      <p class="note">
        官方参数以腾讯云 FDE 官方指南（2026-09-10 更新）为准，并同步核对认证详情页。本项目会记录核验日期并版本化考试蓝图。
      </p>
    </section>

    <section class="block">
      <h2>内容来源</h2>
      <ul class="sources">
        <li v-for="s in sources" :key="s.href">
          <a :href="s.href" target="_blank" rel="noopener noreferrer">{{ s.title }}</a>
          <span class="sources__href">{{ s.href }}</span>
        </li>
      </ul>
    </section>

    <section class="block">
      <h2>技术栈</h2>
      <p>VitePress · Vue 3 · TypeScript · IndexedDB（Dexie） · Vitest · Playwright · GitHub Pages。</p>
    </section>
  </div>
</template>

<script setup lang="ts">
const rules = [
  { name: '题目数量', value: '60 题', source: '腾讯云认证详情页（2026-09-10 更新）' },
  { name: '单选题', value: '40 题 · 1.5 分/题', source: '腾讯云认证详情页' },
  { name: '多选题', value: '20 题 · 2 分/题', source: '腾讯云认证详情页' },
  { name: '考试时长', value: '90 分钟', source: '腾讯云认证详情页' },
  { name: '合格线', value: '70 分', source: '腾讯云认证详情页' },
  { name: '多选判分', value: '完全匹配（错选、漏选不得分）', source: '腾讯云官方指南（2026-09-10）' }
]

const sources = [
  { title: '腾讯云 ADP FDE 认证详情', href: 'https://cloud.tencent.com/edu/training/cert/detail?type=CFD' },
  { title: '腾讯云 ADP FDE 官方指南', href: 'https://cloud.tencent.com/document/product/658/137832' },
  { title: '腾讯云 ADP 产品文档', href: 'https://cloud.tencent.com/document/product/1759' },
  { title: 'FDE 认证指南与生态伙伴', href: 'https://adp.tencent.com/zh/blog/adp-fde-certification-guide' }
]
</script>

<style scoped>
.about {
  max-width: 820px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.page-head h1 {
  margin: 0;
  font-size: 34px;
  letter-spacing: 0;
}

.block {
  margin-top: 24px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.block h2 {
  margin: 0 0 12px;
  font-size: 18px;
}

.block p {
  color: var(--vp-c-text-2);
  line-height: 1.8;
}

.block ul {
  color: var(--vp-c-text-2);
  line-height: 1.8;
  padding-left: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th,
.table td {
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  text-align: left;
}

.note {
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.sources {
  display: grid;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.sources li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sources__href {
  color: var(--vp-c-text-3);
  font-size: 12px;
  word-break: break-all;
}

@media (max-width: 640px) {
  .about {
    padding: 28px 16px 64px;
  }
}
</style>
