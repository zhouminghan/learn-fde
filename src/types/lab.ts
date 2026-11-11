export type LabStepKind =
  | 'input'
  | 'plan'
  | 'retrieval'
  | 'decision'
  | 'tool'
  | 'approval'
  | 'evaluation'
  | 'output'

export interface LabToolCall {
  toolId: string
  name: string
  params: Record<string, string>
  result: Record<string, string>
  ok: boolean
  note?: string
}

export interface LabApproval {
  action: string
  risk: string
}

export interface LabStep {
  id: string
  title: string
  kind: LabStepKind
  summary: string
  details?: string[]
  toolCall?: LabToolCall
  approval?: LabApproval
}

export interface LabKnowledgeDoc {
  id: string
  title: string
  chunks: { id: string; text: string }[]
}

export interface LabToolDefinition {
  id: string
  name: string
  description: string
  inputSchema: string
  outputSchema: string
}

export interface LabEvaluationRule {
  id: string
  label: string
  reason: string
  check: (run: LabRunState) => boolean
}

export interface LabCase {
  id: string
  title: string
  subtitle: string
  summary: string
  scenario: string
  objectives: string[]
  knowledgeDocs: LabKnowledgeDoc[]
  tools: LabToolDefinition[]
  steps: LabStep[]
  evaluation: LabEvaluationRule[]
  finalAnswer: string
  rejectedAnswer: string
}

export type LabRunStatus = 'idle' | 'running' | 'awaiting_approval' | 'finished'

export interface LabRunState {
  caseId: string
  status: LabRunStatus
  stepIndex: number
  completedStepIds: string[]
  logs: string[]
  approvalDecision?: 'approved' | 'rejected'
}
