<template>
  <div class="theme-toggle" role="group" aria-label="主题选择">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="theme-toggle__btn"
      :data-theme-option="option.value"
      :aria-pressed="pref === option.value"
      :title="option.label"
      @click="select(option.value)"
    >
      <component :is="option.icon" :size="15" :stroke-width="2" />
      <span class="sr-only">{{ option.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Moon, Monitor, Sun } from '@lucide/vue'
import type { ThemePreference } from '@/types'
import {
  THEME_STORAGE_KEY,
  applyThemePreference,
  isThemePreference,
  readStoredThemePreference,
  writeStoredThemePreference
} from '../theme-preference'

const options: { value: ThemePreference; label: string; icon: unknown }[] = [
  { value: 'light', label: '浅色模式', icon: Sun },
  { value: 'dark', label: '深色模式', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor }
]

const pref = ref<ThemePreference>('system')
let media: MediaQueryList | null = null
let persistQueue = Promise.resolve()
let userChanged = false

function select(value: ThemePreference) {
  userChanged = true
  pref.value = value
  writeStoredThemePreference(value)
  applyThemePreference(value)
  void persist(value)
}

function persist(value: ThemePreference) {
  if (typeof window === 'undefined') return
  persistQueue = persistQueue.then(async () => {
    const { setThemePreference } = await import('@/storage/settings')
    await setThemePreference(value)
  }).catch(() => {
    // IndexedDB 不可用时主题仍由 localStorage 持久化。
  })
}

function onSystemChange() {
  if (pref.value === 'system') applyThemePreference('system')
}

function onStorageChange(event: StorageEvent) {
  if (event.key !== THEME_STORAGE_KEY) return
  const next = isThemePreference(event.newValue) ? event.newValue : 'system'
  pref.value = next
  applyThemePreference(next)
}

onMounted(() => {
  const saved = readStoredThemePreference()
  pref.value = saved ?? 'system'
  applyThemePreference(pref.value)
  media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', onSystemChange)
  window.addEventListener('storage', onStorageChange)

  if (saved) {
    void persist(saved)
    return
  }

  void (async () => {
    try {
      const { getThemePreference } = await import('@/storage/settings')
      const stored = await getThemePreference()
      if (userChanged || readStoredThemePreference()) return
      pref.value = stored
      writeStoredThemePreference(stored)
      applyThemePreference(stored)
    } catch {
      // 存储不可用时保留 System 模式。
    }
  })()
})

onBeforeUnmount(() => {
  media?.removeEventListener('change', onSystemChange)
  window.removeEventListener('storage', onStorageChange)
})
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  margin-left: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}

.theme-toggle__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  color: var(--vp-c-text-2);
  background: transparent;
  cursor: pointer;
}

.theme-toggle__btn:hover {
  color: var(--vp-c-text-1);
  background: var(--lf-hover-bg);
}

:global(html[data-theme-preference='light']) .theme-toggle__btn[data-theme-option='light'],
:global(html[data-theme-preference='dark']) .theme-toggle__btn[data-theme-option='dark'],
:global(html[data-theme-preference='system']) .theme-toggle__btn[data-theme-option='system'] {
  color: var(--lf-brand-soft-text);
  background: var(--lf-brand-soft);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
