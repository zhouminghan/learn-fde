<template>
  <DefaultLayout>
    <template #nav-bar-title-before>
      <BrandLogo />
    </template>
    <template #nav-bar-content-after>
      <ThemeToggle />
    </template>
    <template #doc-footer-before>
      <LessonControls v-if="isLessonPage" />
    </template>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

const { Layout: DefaultLayout } = DefaultTheme
const { page } = useData()

const isLessonPage = computed(() => {
  const relativePath = page.value.relativePath ?? ''
  return relativePath.startsWith('course/') && relativePath !== 'course/index.md'
})

onMounted(() => {
  document.documentElement.dataset.appHydrated = 'true'
})
</script>
