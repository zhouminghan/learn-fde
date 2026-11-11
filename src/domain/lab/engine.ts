import type { LabCase, LabRunState, LabStep } from '@/types/lab'

const KIND_LABELS: Record<LabStep['kind'], string> = {
  input: '输入',
  plan: '规划',
  retrieval: '检索',
  decision: '判断',
  tool: '工具',
  approval: '审批',
  evaluation: '评测',
  output: '输出'
}

export function createRun(caseDef: LabCase): LabRunState {
  return {
    caseId: caseDef.id,
    status: 'idle',
    stepIndex: 0,
    completedStepIds: [],
    logs: [`已加载案例「${caseDef.title}」。`]
  }
}

export function step(run: LabRunState, caseDef: LabCase): LabRunState {
  if (run.status === 'finished' || run.status === 'awaiting_approval') return run

  const current = caseDef.steps[run.stepIndex]
  if (!current) {
    return { ...run, status: 'finished' }
  }

  const logs = [...run.logs, ...stepLogs(current)]

  if (current.approval) {
    return {
      ...run,
      status: 'awaiting_approval',
      logs
    }
  }

  const completedStepIds = [...run.completedStepIds, current.id]
  const stepIndex = run.stepIndex + 1
  const finished = stepIndex >= caseDef.steps.length
  return {
    ...run,
    status: finished ? 'finished' : 'idle',
    stepIndex,
    completedStepIds,
    logs
  }
}

export function decide(run: LabRunState, caseDef: LabCase, decision: 'approved' | 'rejected'): LabRunState {
  if (run.status !== 'awaiting_approval') return run

  const current = caseDef.steps[run.stepIndex]
  if (!current?.approval) return run

  const label = decision === 'approved' ? '已批准' : '已拒绝'
  const logs = [...run.logs, `[审批] ${label}：${current.approval.action}`]

  if (decision === 'rejected') {
    return {
      ...run,
      status: 'finished',
      stepIndex: caseDef.steps.length,
      completedStepIds: [...run.completedStepIds, current.id],
      approvalDecision: 'rejected',
      logs: [...logs, '流程因审批拒绝而终止，未执行高风险操作。']
    }
  }

  const completedStepIds = [...run.completedStepIds, current.id]
  const stepIndex = run.stepIndex + 1
  const finished = stepIndex >= caseDef.steps.length
  return {
    ...run,
    status: finished ? 'finished' : 'idle',
    stepIndex,
    completedStepIds,
    approvalDecision: 'approved',
    logs
  }
}

export function computeEvaluation(run: LabRunState, caseDef: LabCase) {
  return caseDef.evaluation.map((rule) => ({
    id: rule.id,
    label: rule.label,
    pass: rule.check(run),
    reason: rule.reason
  }))
}

export function stepLogs(current: LabStep): string[] {
  const logs: string[] = []
  if (current.kind === 'tool' && current.toolCall) {
    const call = current.toolCall
    const params = JSON.stringify(call.params)
    const result = call.ok
      ? `${JSON.stringify(call.result)}`
      : `调用失败${call.note ? `（${call.note}）` : ''}`
    logs.push(`[工具] ${call.name}(${params})`)
    logs.push(`[结果] ${result}`)
    return logs
  }

  if (current.kind === 'retrieval') {
    logs.push(`[检索] ${current.summary}`)
    for (const detail of current.details ?? []) logs.push(`[证据] ${detail}`)
    return logs
  }

  logs.push(`[${KIND_LABELS[current.kind]}] ${current.summary}`)
  return logs
}
