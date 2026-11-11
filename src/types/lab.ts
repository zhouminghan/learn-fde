export type LabStepKind =
  | 'input'
  | 'plan'
  | 'retrieval'
  | 'decision'
  | 'tool'
  | 'approval'
  | 'choice'
  | 'evaluation'
  | 'output'

export interface LabChoice {
  id: string
  label: string
  nextStepId: string
}

export interface LabInput {
  id: string
  label: string
  type: 'text' | 'select'
  options?: string[]
  defaultValue?: string
}

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
  choices?: LabChoice[]
  nextStepId?: string
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
  level?: 'beginner' | 'intermediate' | 'capstone'
  tags?: string[]
  inputs?: LabInput[]
  knowledgeDocs: LabKnowledgeDoc[]
  tools: LabToolDefinition[]
  steps: LabStep[]
  evaluation: LabEvaluationRule[]
  finalAnswer: string
  rejectedAnswer: string
}

export type LabRunStatus = 'idle' | 'running' | 'awaiting_approval' | 'awaiting_choice' | 'finished'

export interface LabRunState {
  caseId: string
  status: LabRunStatus
  stepIndex: number
  completedStepIds: string[]
  logs: string[]
  approvalDecision?: 'approved' | 'rejected'
  inputs?: Record<string, string>
}
