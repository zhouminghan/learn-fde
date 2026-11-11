import type { LabCase } from '@/types/lab'

export const customerServiceCase: LabCase = {
  id: 'customer-service',
  title: '智能客服助手',
  subtitle: '意图识别与 Workflow 入门',
  summary: '演示客服助手如何识别用户意图，并按意图路由到不同处理分支，必要时转人工。',
  scenario: '用户咨询客服问题。助手先识别意图，再按“查询订单 / 退款咨询 / 转人工”路由到不同分支，最后给出处理结果。所有订单与政策数据均为虚构演示数据。',
  objectives: ['理解意图识别。', '理解 Workflow 条件分支路由。', '理解人工转接的触发条件。'],
  level: 'beginner',
  tags: ['意图识别', 'Workflow'],
  knowledgeDocs: [],
  tools: [
    {
      id: 'query_order',
      name: 'query_order',
      description: '按订单号查询订单状态。',
      inputSchema: '{ "orderId": "string" }',
      outputSchema: '{ "orderId", "status" }'
    }
  ],
  steps: [
    {
      id: 'receive',
      title: '接收用户消息',
      kind: 'input',
      summary: '接收客服消息并识别意图。',
      details: ['用户消息：我的订单到哪了？']
    },
    {
      id: 'intent',
      title: '识别意图',
      kind: 'choice',
      summary: '选择识别出的用户意图。',
      choices: [
        { id: 'c-order', label: '查询订单', nextStepId: 'order-lookup' },
        { id: 'c-refund', label: '退款咨询', nextStepId: 'refund-lookup' },
        { id: 'c-human', label: '转人工客服', nextStepId: 'handoff' }
      ]
    },
    {
      id: 'order-lookup',
      title: '查询订单',
      kind: 'tool',
      summary: '调用 query_order 查询订单状态。',
      toolCall: {
        toolId: 'query_order',
        name: 'query_order',
        params: { orderId: 'A-1024' },
        result: { orderId: 'A-1024', status: '配送中' },
        ok: true
      },
      nextStepId: 'respond'
    },
    {
      id: 'refund-lookup',
      title: '查询退款政策',
      kind: 'retrieval',
      summary: '检索退款政策并给出说明。',
      details: ['7 天内无理由退款，需保留原包装。'],
      nextStepId: 'respond'
    },
    {
      id: 'handoff',
      title: '转人工客服',
      kind: 'output',
      summary: '当前问题无法自动解决，转接人工客服。',
      nextStepId: 'respond'
    },
    {
      id: 'respond',
      title: '输出处理结果',
      kind: 'output',
      summary: '输出对应分支的处理结果。'
    },
    {
      id: 'evaluate',
      title: '评测',
      kind: 'evaluation',
      summary: '检查意图识别与分支路由是否正确。'
    }
  ],
  evaluation: [
    {
      id: 'ev-intent',
      label: '是否完成意图识别',
      reason: '已执行意图识别选择。',
      check: (run) => run.completedStepIds.includes('intent')
    },
    {
      id: 'ev-route',
      label: '是否进入正确分支',
      reason: '根据意图进入订单 / 退款 / 人工分支。',
      check: (run) =>
        run.completedStepIds.some((id) => ['order-lookup', 'refund-lookup', 'handoff'].includes(id))
    },
    {
      id: 'ev-done',
      label: '是否输出处理结果',
      reason: '已输出对应分支结果。',
      check: (run) => run.completedStepIds.includes('respond')
    }
  ],
  finalAnswer: '你的订单 A-1024 当前状态为配送中。',
  rejectedAnswer: ''
}
