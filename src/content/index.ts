import type { Curriculum, ExamBlueprint, Question } from '@/types'
import curriculumJson from './curriculum.json'
import blueprintJson from './exam-blueprint.json'
import aiAgentBasics from './questions/ai-agent-basics.json'
import adpCapabilities from './questions/adp-capabilities.json'
import agentDevelopment from './questions/agent-development.json'
import evaluationOptimization from './questions/evaluation-optimization.json'
import supplementary from './questions/supplementary.json'

export const curriculum = curriculumJson as unknown as Curriculum
export const examBlueprint = blueprintJson as unknown as ExamBlueprint

export const questionFiles = {
  'ai-agent-basics': aiAgentBasics,
  'adp-capabilities': adpCapabilities,
  'agent-development': agentDevelopment,
  'evaluation-optimization': evaluationOptimization,
  supplementary
} as const

export function loadAllQuestions(): Question[] {
  return [
    ...(aiAgentBasics as unknown as Question[]),
    ...(adpCapabilities as unknown as Question[]),
    ...(agentDevelopment as unknown as Question[]),
    ...(evaluationOptimization as unknown as Question[]),
    ...(supplementary as unknown as Question[])
  ]
}

export function loadPublishedQuestions(): Question[] {
  return loadAllQuestions().filter((q) => q.status === 'published')
}

export function lessonById(id: string) {
  return curriculum.lessons.find((l) => l.id === id)
}

export function domainById(id: string) {
  return curriculum.domains.find((d) => d.id === id)
}
