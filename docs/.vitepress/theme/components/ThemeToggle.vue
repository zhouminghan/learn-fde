<template>
  <div class="theme-toggle" role="group" aria-label="主题选择">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="theme-toggle__btn"
      :class="{ active: pref === option.value }"
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
import { Moon, Monitor, Sun } from 'lucide-vue-next'
import type { ThemePreference } from '@/types'

const STORAGE_KEY = 'learn-fde-theme'

const options: { value: ThemePreference; label: string; icon: unknown }[] = [
  { value: 'light', label: '浅色模式', icon: Sun },
  { value: 'dark', label: '深色模式', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor }
]

const pref = ref<ThemePreference>('system')
let media: MediaQueryList | null = null

function readSaved(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system'
}

function apply(preference: ThemePreference) {
  if (typeof document === 'undefined') return
  const dark =
    preference === 'dark' ||
    (preference === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
}

function select(value: ThemePreference) {
  pref.value = value
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // 存储不可用时仅影响本次会话。
  }
  apply(value)
  void persist(value)
}

async function persist(value: ThemePreference) {
  if (typeof window === 'undefined') return
  try {
    const { setThemePreference } = await import('@/storage/settings')
    await setThemePreference(value)
  } catch {
    // IndexedDB 不可用时主题仍由 localStorage 持久化。
  }
}

function onSystemChange() {
  if (pref.value === 'system') apply('system')
}

onMounted(() => {
  pref.value = readSaved()
  apply(pref.value)
  media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', onSystemChange)
})

onBeforeUnmount(() => {
  media?.removeEventListener('change', onSystemChange)
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
}

.theme-toggle__btn.active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
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
