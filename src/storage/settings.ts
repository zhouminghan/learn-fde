import type { ThemePreference } from '@/types'
import { getDatabase } from './database'

export const SETTING_THEME = 'theme'

export async function getThemePreference(): Promise<ThemePreference> {
  try {
    const record = await getDatabase().appSettings.get(SETTING_THEME)
    const value = record?.value
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'system'
  } catch {
    return 'system'
  }
}

export async function setThemePreference(preference: ThemePreference): Promise<void> {
  try {
    await getDatabase().appSettings.put({
      key: SETTING_THEME,
      value: preference
    })
  } catch {
    // 持久化不可用时静默降级，由界面层给出提示。
  }
}
