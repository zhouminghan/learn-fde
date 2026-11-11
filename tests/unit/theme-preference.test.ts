import { describe, expect, it } from 'vitest'
import {
  isThemePreference,
  resolveDarkPreference
} from '../../docs/.vitepress/theme/theme-preference'

describe('theme preference contract', () => {
  it('accepts only supported preferences', () => {
    expect(isThemePreference('light')).toBe(true)
    expect(isThemePreference('dark')).toBe(true)
    expect(isThemePreference('system')).toBe(true)
    expect(isThemePreference('auto')).toBe(false)
    expect(isThemePreference(null)).toBe(false)
  })

  it('resolves explicit and system preferences deterministically', () => {
    expect(resolveDarkPreference('light', true)).toBe(false)
    expect(resolveDarkPreference('dark', false)).toBe(true)
    expect(resolveDarkPreference('system', true)).toBe(true)
    expect(resolveDarkPreference('system', false)).toBe(false)
  })
})
