import { describe, expect, it } from 'vitest'
import { createRun, decide, step, computeEvaluation } from '@/domain/lab/engine'
import { itServiceDeskCase } from '@/content/labs/it-service-desk'

describe('lab 模拟引擎', () => {
  it('初始状态为空闲且未完成任何步骤', () => {
    const run = createRun(itServiceDeskCase)
    expect(run.status).toBe('idle')
    expect(run.stepIndex).toBe(0)
    expect(run.completedStepIds).toEqual([])
  })

  it('单步执行逐步推进，并在审批节点暂停', () => {
    let run = createRun(itServiceDeskCase)
    const approvalIndex = itServiceDeskCase.steps.findIndex((s) => s.kind === 'approval')

    for (let i = 0; i <= approvalIndex; i += 1) {
      run = step(run, itServiceDeskCase)
    }

    expect(run.status).toBe('awaiting_approval')
    expect(run.stepIndex).toBe(approvalIndex)
  })

  it('批准后继续执行并完成创建工单', () => {
    let run = createRun(itServiceDeskCase)
    while (run.status === 'idle') run = step(run, itServiceDeskCase)

    run = decide(run, itServiceDeskCase, 'approved')
    expect(run.approvalDecision).toBe('approved')

    while (run.status === 'idle') run = step(run, itServiceDeskCase)
    expect(run.status).toBe('finished')
    expect(run.completedStepIds).toContain('create-ticket')
    expect(run.completedStepIds).toContain('respond')
  })

  it('拒绝后跳过高风险操作并结束', () => {
    let run = createRun(itServiceDeskCase)
    while (run.status === 'idle') run = step(run, itServiceDeskCase)

    run = decide(run, itServiceDeskCase, 'rejected')
    expect(run.status).toBe('finished')
    expect(run.approvalDecision).toBe('rejected')
    expect(run.completedStepIds).not.toContain('create-ticket')
  })

  it('评测规则在完整执行后通过', () => {
    let run = createRun(itServiceDeskCase)
    while (run.status === 'idle') run = step(run, itServiceDeskCase)
    run = decide(run, itServiceDeskCase, 'approved')
    while (run.status === 'idle') run = step(run, itServiceDeskCase)

    const evaluation = computeEvaluation(run, itServiceDeskCase)
    expect(evaluation.every((e) => e.pass)).toBe(true)
  })
})
