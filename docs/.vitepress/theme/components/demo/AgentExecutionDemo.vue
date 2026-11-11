<template>
  <InteractiveWorkflow
    title="Agent 执行流程演示"
    caption="点击“播放”观察一个完整执行循环；每一步展示结构化计划、操作与证据，而非私有推理链。"
    :steps="steps"
  />
</template>

<script setup lang="ts">
import InteractiveWorkflow, { type WorkflowStep } from '../visual/InteractiveWorkflow.vue'

const steps: WorkflowStep[] = [
  {
    id: 'receive',
    title: '接收请求',
    kind: '输入',
    summary: '用户提交“开发环境无法连接”，系统识别意图并明确任务目标。',
    evidence: [
      { label: '用户问题', value: '开发环境无法连接，请协助排查。' },
      { label: '意图分类', value: 'IT 故障排查' },
      { label: '任务目标', value: '定位问题并给出处理建议或创建工单。' }
    ]
  },
  {
    id: 'plan',
    title: '制定计划',
    kind: '规划',
    summary: '把任务拆解为检索、判断与可能需要的工单创建。',
    details: ['检索开发环境连接故障知识', '判断是否需要创建工单', '按规则决定是否提交人工审批']
  },
  {
    id: 'tool',
    title: '工具调用',
    kind: '工具',
    summary: '调用知识检索与工单查询工具，获取依据与当前状态。',
    evidence: [
      { label: '工具', value: 'query_ticket' },
      { label: '参数', value: '{ category: "dev_env" }' },
      { label: '结果', value: '未发现进行中的相关工单。' }
    ]
  },
  {
    id: 'decide',
    title: '分支判断',
    kind: 'Workflow',
    summary: '根据检索结果判断需要创建工单，并进入人工审批节点。',
    details: ['存在明确故障且无进行中工单 → 创建工单', '创建工单属于高风险操作 → 人工审批']
  },
  {
    id: 'approval',
    title: '人工审批',
    kind: '审批',
    summary: '向审批人展示待创建工单的参数与风险，等待批准或拒绝。',
    evidence: [
      { label: '待审批操作', value: 'create_ticket' },
      { label: '风险说明', value: '会产生一条正式工单并通知 IT 支持团队。' }
    ]
  },
  {
    id: 'evaluate',
    title: '评测',
    kind: '评测',
    summary: '检查任务完成度、知识依据、工具参数、权限约束与输出格式。',
    evidence: [
      { label: '任务完成', value: '是' },
      { label: '知识依据', value: '命中《开发环境连接指引》' },
      { label: '权限约束', value: '已遵守审批规则' }
    ]
  },
  {
    id: 'respond',
    title: '生成最终回答',
    kind: '输出',
    summary: '汇总检索依据、工具结果与审批结果，输出结构化处理结论。'
  }
]
</script>
