import type { LabCase } from '@/types/lab'

export const weatherCase: LabCase = {
  id: 'weather',
  title: '天气查询助手',
  subtitle: 'MCP Tool Calling 入门',
  summary: '演示 Agent 如何调用一个模拟天气 MCP 工具，处理参数、超时、重试与结构化返回。',
  scenario: '用户查询“北京今天天气”。助手需要调用模拟天气工具 get_weather，先经历一次超时，再重试成功并返回结构化 JSON。所有天气数据均为模拟数据。',
  objectives: ['理解 MCP 工具调用过程。', '理解参数 Schema 与结构化返回。', '理解超时重试与异常处理。'],
  level: 'beginner',
  tags: ['MCP', 'Tool', '重试'],
  knowledgeDocs: [],
  tools: [
    {
      id: 'get_weather',
      name: 'get_weather',
      description: '查询指定城市的天气。',
      inputSchema: '{ "city": "string" }',
      outputSchema: '{ "city", "temp", "condition" }'
    }
  ],
  steps: [
    {
      id: 'receive',
      title: '接收请求',
      kind: 'input',
      summary: '用户查询“北京今天天气”，助手识别为天气查询任务。',
      details: ['城市：北京', '任务类型：天气查询']
    },
    {
      id: 'plan',
      title: '制定调用计划',
      kind: 'plan',
      summary: '准备调用 get_weather 工具，参数 city=北京。'
    },
    {
      id: 'call',
      title: '调用 get_weather',
      kind: 'tool',
      summary: '首次调用天气工具。',
      toolCall: {
        toolId: 'get_weather',
        name: 'get_weather',
        params: { city: '北京' },
        result: {},
        ok: false,
        note: '模拟超时'
      }
    },
    {
      id: 'retry',
      title: '重试 get_weather',
      kind: 'tool',
      summary: '重试天气工具调用。',
      toolCall: {
        toolId: 'get_weather',
        name: 'get_weather',
        params: { city: '北京' },
        result: { city: '北京', temp: '18°C', condition: '晴' },
        ok: true
      }
    },
    {
      id: 'evaluate',
      title: '评测',
      kind: 'evaluation',
      summary: '检查工具参数与返回结构是否正确。'
    },
    {
      id: 'respond',
      title: '输出结果',
      kind: 'output',
      summary: '返回结构化天气结果。'
    }
  ],
  evaluation: [
    {
      id: 'ev-param',
      label: '工具参数是否正确',
      reason: 'city=北京 符合输入 Schema。',
      check: (run) => run.completedStepIds.includes('call')
    },
    {
      id: 'ev-retry',
      label: '是否完成重试',
      reason: '超时后重试成功。',
      check: (run) => run.completedStepIds.includes('retry')
    },
    {
      id: 'ev-done',
      label: '是否返回结构化结果',
      reason: '已输出天气 JSON。',
      check: (run) => run.completedStepIds.includes('respond')
    }
  ],
  finalAnswer: '北京今天晴，气温 18°C。',
  rejectedAnswer: ''
}
