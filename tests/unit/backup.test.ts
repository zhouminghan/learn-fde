import { describe, expect, it } from 'vitest'
import { BACKUP_VERSION, exportToJson, parseBackup } from '@/storage/backup'

describe('parseBackup', () => {
  it('拒绝非 learn-FDE 数据', () => {
    const result = parseBackup(JSON.stringify({ foo: 'bar' }))
    expect(result.ok).toBe(false)
  })

  it('拒绝版本不兼容的数据', () => {
    const bundle = {
      schema: 'learn-fde-backup',
      version: 999,
      appVersion: '0.1.0',
      exportedAt: '2026-11-10',
      data: {}
    }
    const result = parseBackup(JSON.stringify(bundle))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('版本')
  })

  it('接受兼容版本并保留数据', () => {
    const bundle = {
      schema: 'learn-fde-backup',
      version: BACKUP_VERSION,
      appVersion: '0.1.0',
      exportedAt: '2026-11-10',
      data: { courseProgress: [{ lessonId: '1', status: 'completed', lastVisitedAt: '', readSeconds: 1 }] }
    }
    const result = parseBackup(exportToJson(bundle as never))
    expect(result.ok).toBe(true)
  })

  it('拒绝损坏的 JSON', () => {
    const result = parseBackup('{not json')
    expect(result.ok).toBe(false)
  })
})
