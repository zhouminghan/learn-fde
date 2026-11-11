import type { LabCase } from '@/types/lab'

export const knowledgeQaCase: LabCase = {
  id: 'knowledge-qa',
  title: '企业知识问答助手',
  subtitle: 'RAG 检索增强生成入门',
  summary: '演示如何把企业知识文档切片、检索并作为生成依据，回答时标注来源。',
  scenario: '员工向助手提问“如何申请软件权限”。助手需要从《企业 IT 服务规范》中检索相关条款，并按选定的检索策略与 Top-K 生成带来源的回答。所有文档与数据均为虚构演示数据。',
  objectives: ['理解 RAG 的检索与生成关系。', '理解 Top-K 对回答依据的影响。', '理解答案来源标注的重要性。'],
  level: 'beginner',
  tags: ['RAG', '知识库', '检索'],
  knowledgeDocs: [
    {
      id: 'it-policy',
      title: '企业 IT 服务规范',
      chunks: [
        { id: 'chunk-1', text: '软件权限申请需由申请人填写《软件权限申请表》，经部门负责人审批后开通。' },
        { id: 'chunk-2', text: '开发环境账号开通需同时提交 VPN 权限申请，审批通过后 1 个工作日内生效。' },
        { id: 'chunk-3', text: '离职或调岗时，相关软件权限应在一周内回收。' }
      ]
    }
  ],
  tools: [],
  steps: [
    {
      id: 'receive',
      title: '接收问题',
      kind: 'input',
      summary: '用户提问“如何申请软件权限”，助手识别为知识问答任务。',
      details: ['用户问题：如何申请软件权限？', '任务类型：企业知识问答']
    },
    {
      id: 'strategy',
      title: '选择检索策略',
      kind: 'choice',
      summary: '选择本次检索使用的策略。',
      choices: [
        { id: 'semantic', label: '语义检索', nextStepId: 'retrieve' },
        { id: 'keyword', label: '关键词检索', nextStepId: 'retrieve' }
      ]
    },
    {
      id: 'retrieve',
      title: '检索知识库',
      kind: 'retrieval',
      summary: '检索《企业 IT 服务规范》中与软件权限申请相关的片段。',
      details: [
        '命中：软件权限申请需填写申请表并经审批。',
        '命中：开发环境账号需同时提交 VPN 权限申请。',
        '命中：离职或调岗时权限应回收。'
      ]
    },
    {
      id: 'topk',
      title: '选择 Top-K',
      kind: 'choice',
      summary: '选择进入上下文的检索片段数量。',
      choices: [
        { id: 'top1', label: 'Top-1', nextStepId: 'generate' },
        { id: 'top3', label: 'Top-3', nextStepId: 'generate' }
      ]
    },
    {
      id: 'generate',
      title: '生成回答',
      kind: 'output',
      summary: '基于检索片段生成回答，并标注来源《企业 IT 服务规范》。',
      details: ['申请软件权限需填写申请表，经部门负责人审批后开通。']
    },
    {
      id: 'evaluate',
      title: '评测',
      kind: 'evaluation',
      summary: '检查回答是否有知识依据、是否标注来源。'
    },
    {
      id: 'respond',
      title: '输出最终答案',
      kind: 'output',
      summary: '输出带来源引用的最终答案。'
    }
  ],
  evaluation: [
    {
      id: 'ev-retrieve',
      label: '是否完成知识检索',
      reason: '已执行知识库检索节点。',
      check: (run) => run.completedStepIds.includes('retrieve')
    },
    {
      id: 'ev-source',
      label: '是否标注来源',
      reason: '生成步骤引用《企业 IT 服务规范》。',
      check: (run) => run.completedStepIds.includes('generate')
    },
    {
      id: 'ev-done',
      label: '是否完成问答闭环',
      reason: '已输出最终答案。',
      check: (run) => run.completedStepIds.includes('respond')
    }
  ],
  finalAnswer: '申请软件权限需填写《软件权限申请表》，经部门负责人审批后开通；开发环境账号还需同时提交 VPN 权限申请。来源：《企业 IT 服务规范》。',
  rejectedAnswer: ''
}
