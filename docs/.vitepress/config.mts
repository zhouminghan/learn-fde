import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import curriculumJson from '../../src/content/curriculum.json'
import type { Curriculum, LessonMeta, ModuleMeta } from '../../src/types'
import { createThemeBootScript } from './theme/theme-preference'

const curriculum = curriculumJson as unknown as Curriculum

const repoUrl = 'https://github.com/zhouminghan/learn-fde'
const base = process.env.DOCS_BASE_PATH ?? '/learn-fde/'

function moduleSidebar(module: ModuleMeta): { text: string; items: { text: string; link: string }[] } {
  const lessons = curriculum.lessons
    .filter((l: LessonMeta) => l.moduleId === module.id && l.status === 'published')
    .sort((a: LessonMeta, b: LessonMeta) => a.order - b.order)
  return {
    text: module.title,
    items: lessons.map((l: LessonMeta) => ({ text: l.title, link: l.path }))
  }
}

const courseSidebar = curriculum.modules
  .map(moduleSidebar)

const themeScript = createThemeBootScript()

export default withMermaid(
  defineConfig({
    base,
    lang: 'zh-CN',
    title: 'Learning FDE',
    description: '腾讯云 ADP FDE 学习与实战训练平台',
    srcExclude: ['project/**'],
    appearance: false,
    lastUpdated: true,
    head: [
      ['meta', { name: 'theme-color', content: '#f7f6f3' }],
      ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
      ['link', { rel: 'icon', type: 'image/png', href: `${base}favicon.png` }],
      ['script', {}, themeScript]
    ],
    themeConfig: {
      logo: null,
      nav: [
        { text: '首页', link: '/' },
        { text: '课程学习', link: '/course/', activeMatch: '^/course/' },
        { text: '专项练习', link: '/practice/' },
        { text: '模拟考试', link: '/exam/' },
        { text: 'FDE 实验室', link: '/lab/' },
        { text: '题库浏览', link: '/questions/' },
        { text: '学习记录', link: '/records/' },
        { text: '资源中心', link: '/resources/' }
      ],
      sidebar: {
        '/course/01-ai-agent-basics/': courseSidebar,
        '/course/02-adp-capabilities/': courseSidebar,
        '/course/03-agent-development/': courseSidebar,
        '/course/04-evaluation-optimization/': courseSidebar,
        '/course/supplementary/': courseSidebar
      },
      socialLinks: [{ icon: 'github', link: repoUrl }],
      outline: { level: [2, 3], label: '本页目录' },
      docFooter: { prev: '上一篇', next: '下一篇' },
      lastUpdated: { text: '最近更新', formatOptions: { dateStyle: 'medium' } },
      returnToTopLabel: '返回顶部',
      sidebarMenuLabel: '目录',
      darkModeSwitchLabel: '主题',
      lightModeSwitchTitle: '切换到浅色模式',
      darkModeSwitchTitle: '切换到深色模式',
      search: {
        provider: 'local',
        options: {
          translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档 K'
              },
            modal: {
              noResultsText: '没有找到相关结果',
              resetButtonTitle: '清除查询',
              footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
            }
          }
        }
      },
      footer: {
        message: 'Learning FDE 是独立学习项目，与腾讯云官方认证无隶属关系，不提供真实考试题。',
        copyright: 'Learning FDE'
      }
    },
    vite: {
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('../../src', import.meta.url))
        }
      },
      build: {
        // Mermaid core is preloaded and diagram chunks are lazy; keep the threshold above the intentional peak.
        chunkSizeWarningLimit: 750
      },
      ssr: {
        noExternal: ['@lucide/vue', 'dexie']
      }
    },
    mermaid: {
      theme: 'base',
      themeVariables: {
        fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: '16px'
      }
    }
  })
)
