import type { LabCase } from '@/types/lab'
import { itServiceDeskCase } from './it-service-desk'
import { knowledgeQaCase } from './knowledge-qa'
import { weatherCase } from './weather'
import { customerServiceCase } from './customer-service'

export const labCases: LabCase[] = [
  itServiceDeskCase,
  knowledgeQaCase,
  weatherCase,
  customerServiceCase
]

export function labCaseById(id: string): LabCase | undefined {
  return labCases.find((c) => c.id === id)
}
