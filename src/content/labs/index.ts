import type { LabCase } from '@/types/lab'
import { itServiceDeskCase } from './it-service-desk'

export const labCases: LabCase[] = [itServiceDeskCase]

export function labCaseById(id: string): LabCase | undefined {
  return labCases.find((c) => c.id === id)
}
