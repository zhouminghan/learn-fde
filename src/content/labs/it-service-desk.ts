import type { LabCase } from '@/types/lab'

export const itServiceDeskCase: LabCase = {
  id: 'it-service-desk',
  title: '企业 IT 服务台智能助手',
  subtitle: '从需求到交付的完整 Agent 构建演示',
  summary:
    '以通用企业 IT 服务台为背景，模拟一个智能助手如何检索企业知识库、调用 MCP 工具、执行 Workflow，并在高风险操作前请求人工审批。',
  scenario:
    '某企业员工经常咨询 IT 问题。员工「陈晨」提交请求：“我的开发环境无法连接，帮我排查一下。”助手需要识别意图、检索知识库、判断是否需要创建工单，并在创建工单前请求人工审批。本案例中的企业、人员、知识文档与工单数据均为虚构演示数据。',
  objectives: [
    '理解如何分析企业业务需求并识别 Agent 应用场景。',
    '观察知识检索、工具调用与 Workflow 编排如何协作。',
    '理解 Human-in-the-loop 在高风险操作中的作用。',
    '理解 Evaluation 如何校验任务完成度与权限约束。'
  ],
  knowledgeDocs: [
    {
      id: 'doc-dev-env',
      title: '开发环境连接指引',
      chunks: [
        {
          id: 'dev-env-1',
          text: '开发环境无法连接时，先确认 VPN 状态与账号权限，再检查目标服务是否在维护窗口内。'
        },
        {
          id: 'dev-env-2',
          text: '若自助排查 15 分钟仍无法恢复，应创建 IT 支持工单，并附上错误码与发生时间。'
        }
      ]
    },
    {
      id: 'doc-ticket-policy',
      title: 'IT 工单处理规范',
      chunks: [
        {
          id: 'ticket-1',
          text: '创建工单属于可追溯操作，必须由申请人确认信息后提交，涉及环境变更时需人工审批。'
        }
      ]
    }
  ],
  tools: [
    {
      id: 'query_ticket',
      name: 'query_ticket',
      description: '按分类查询当前用户进行中的工单。',
      inputSchema: '{ "category": "string" }',
      outputSchema: '{ "tickets": [{ "id", "status" }] }'
    },
    {
      id: 'create_ticket',
      name: 'create_ticket',
      description: '创建一条 IT 支持工单。',
      inputSchema: '{ "title", "category", "description", "priority" }',
      outputSchema: '{ "ticketId", "status" }'
    }
  ],
  steps: [
    {
      id: 'receive',
      title: '接收用户请求',
      kind: 'input',
      summary: '解析用户问题，识别意图为「IT 故障排查」。',
      details: [
        '用户问题：我的开发环境无法连接，帮我排查一下。',
        '意图分类：IT 故障排查',
        '任务目标：定位问题并给出处理建议或创建工单。'
      ]
    },
    {
      id: 'plan',
      title: '制定执行计划',
      kind: 'plan',
      summary: '将任务拆解为知识检索、工单查询、分支判断与可能的工单创建。',
      details: [
        '检索开发环境连接故障知识',
        '查询是否存在进行中的相关工单',
        '按规则决定是否创建工单并请求审批'
      ]
    },
    {
      id: 'retrieve',
      title: '检索企业知识库',
      kind: 'retrieval',
      summary: '检索《开发环境连接指引》与《IT 工单处理规范》。',
      details: [
        '命中片段：先确认 VPN 状态与账号权限，再检查服务维护窗口。',
        '命中片段：自助排查 15 分钟仍无法恢复时，应创建 IT 支持工单。',
        '命中片段：创建工单涉及环境变更时需人工审批。'
      ]
    },
    {
      id: 'decide',
      title: 'Workflow 分支判断',
      kind: 'decision',
      summary: '根据检索依据判断：需要创建工单，并在创建前请求人工审批。',
      details: ['存在明确故障且无进行中工单 → 创建工单', '创建工单属于可追溯操作 → 人工审批']
    },
    {
      id: 'query-ticket',
      title: '调用 query_ticket',
      kind: 'tool',
      summary: '查询当前用户进行中的工单。',
      toolCall: {
        toolId: 'query_ticket',
        name: 'query_ticket',
        params: { category: 'dev_env' },
        result: {},
        ok: false,
        note: '首次调用超时，准备重试'
      }
    },
    {
      id: 'query-ticket-retry',
      title: '重试 query_ticket',
      kind: 'tool',
      summary: '重试工单查询，成功返回结果。',
      toolCall: {
        toolId: 'query_ticket',
        name: 'query_ticket',
        params: { category: 'dev_env' },
        result: { tickets: '[]（无进行中工单）' },
        ok: true
      }
    },
    {
      id: 'approve-create',
      title: '请求人工审批',
      kind: 'approval',
      summary: '创建工单属于高风险操作，需人工批准。',
      approval: {
        action: 'create_ticket（创建 IT 支持工单）',
        risk: '会产生一条正式工单并通知 IT 支持团队，属于可追溯操作。'
      }
    },
    {
      id: 'create-ticket',
      title: '调用 create_ticket',
      kind: 'tool',
      summary: '审批通过后创建 IT 支持工单。',
      toolCall: {
        toolId: 'create_ticket',
        name: 'create_ticket',
        params: {
          title: '开发环境无法连接',
          category: 'dev_env',
          description: 'VPN 正常，目标服务连接超时，附错误码 E502。',
          priority: 'normal'
        },
        result: { ticketId: 'IT-2026-1182', status: 'created' },
        ok: true
      }
    },
    {
      id: 'evaluate',
      title: '评测执行结果',
      kind: 'evaluation',
      summary: '检查任务完成度、知识依据、工具参数、权限约束与输出格式。'
    },
    {
      id: 'respond',
      title: '生成最终回答',
      kind: 'output',
      summary: '汇总检索依据、工具结果与审批结果，输出结构化处理结论。'
    }
  ],
  evaluation: [
    {
      id: 'ev-task',
      label: '任务是否完成',
      reason: '流程执行到最终回答节点。',
      check: (run) => run.completedStepIds.includes('respond') || run.status === 'finished'
    },
    {
      id: 'ev-knowledge',
      label: '是否基于知识库依据',
      reason: '已检索到开发环境连接指引与工单处理规范。',
      check: (run) => run.completedStepIds.includes('retrieve')
    },
    {
      id: 'ev-tool',
      label: '工具调用是否成功',
      reason: '工单查询在重试后成功返回。',
      check: (run) => run.completedStepIds.includes('query-ticket-retry')
    },
    {
      id: 'ev-permission',
      label: '是否遵守审批规则',
      reason: '创建工单前已完成人工审批，或审批拒绝后未执行高风险操作。',
      check: (run) =>
        run.completedStepIds.includes('approve-create') &&
        (run.approvalDecision === 'approved'
          ? run.completedStepIds.includes('create-ticket')
          : run.approvalDecision === 'rejected')
    },
    {
      id: 'ev-format',
      label: '输出是否符合格式',
      reason: '最终回答包含处理建议与工单状态。',
      check: (run) => run.completedStepIds.includes('respond')
    }
  ],
  finalAnswer:
    '已按《开发环境连接指引》排查：建议先确认 VPN 与账号权限，再检查服务维护窗口。鉴于自助排查依据建议创建工单，已提交 IT-2026-1182，并附错误码 E502 与发生时间。',
  rejectedAnswer:
    '已按《开发环境连接指引》给出排查建议。创建工单的请求被审批人拒绝，因此未执行高风险操作；如需进一步处理，可重新提交申请。'
}
