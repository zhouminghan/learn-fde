import type { ThemePreference } from '@/types'

export const THEME_STORAGE_KEY = 'learn-fde-theme'

export const THEME_COLORS: Record<'light' | 'dark', string> = {
  light: '#f7f6f3',
  dark: '#191816'
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function resolveDarkPreference(preference: ThemePreference, systemDark: boolean): boolean {
  return preference === 'dark' || (preference === 'system' && systemDark)
}

export function readStoredThemePreference(): ThemePreference | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(value) ? value : null
  } catch {
    return null
  }
}

export function writeStoredThemePreference(preference: ThemePreference): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference)
    return true
  } catch {
    return false
  }
}

export function applyThemePreference(
  preference: ThemePreference,
  systemDark = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
) {
  if (typeof document === 'undefined') return
  const dark = resolveDarkPreference(preference, systemDark)
  const root = document.documentElement
  if (root.classList.contains('dark') !== dark) root.classList.toggle('dark', dark)
  if (root.dataset.themePreference !== preference) root.dataset.themePreference = preference
  const colorScheme = dark ? 'dark' : 'light'
  if (root.style.colorScheme !== colorScheme) root.style.colorScheme = colorScheme

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (themeColor) themeColor.content = dark ? THEME_COLORS.dark : THEME_COLORS.light
}

export function createThemeBootScript(): string {
  return `(function(){
  var preference = 'system';
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var saved = localStorage.getItem(key);
    if (saved === 'light' || saved === 'dark' || saved === 'system') preference = saved;
  } catch (error) {}
  try {
    var dark = preference === 'dark' || (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.dataset.themePreference = preference;
    root.style.colorScheme = dark ? 'dark' : 'light';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? ${JSON.stringify(THEME_COLORS.dark)} : ${JSON.stringify(THEME_COLORS.light)});
  } catch (error) {
    document.documentElement.dataset.themePreference = 'system';
  }
})()`
}
