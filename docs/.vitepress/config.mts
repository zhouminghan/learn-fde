import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import curriculumJson from '../../src/content/curriculum.json'
import type { Curriculum, LessonMeta, ModuleMeta } from '../../src/types'

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

const themeScript = `(function(){
  try {
    var saved = localStorage.getItem('learn-fde-theme');
    var dark = saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})()`

export default withMermaid(
  defineConfig({
    base,
    lang: 'zh-CN',
    title: 'learn-FDE',
    description: '腾讯云 ADP FDE 认证学习与能力训练站',
    appearance: false,
    lastUpdated: true,
    head: [
      ['meta', { name: 'theme-color', content: '#f7f4ef' }],
      ['script', {}, themeScript]
    ],
    themeConfig: {
      logo: null,
      nav: [
        { text: '首页', link: '/' },
        { text: '课程学习', link: '/course/', activeMatch: '^/course/' },
        { text: '专项练习', link: '/practice/' },
        { text: '模拟考试', link: '/exam/' },
        { text: '题库浏览', link: '/questions/' },
        { text: '学习记录', link: '/records/' },
        { text: '资源中心', link: '/resources/' },
        { text: '关于项目', link: '/about/' }
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
            button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
            modal: {
              noResultsText: '没有找到相关结果',
              resetButtonTitle: '清除查询',
              footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
            }
          }
        }
      },
      footer: {
        message: 'learn-FDE 是独立学习项目，与腾讯云官方认证无隶属关系，不提供真实考试题。',
        copyright: 'learn-FDE'
      }
    },
    vite: {
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('../../src', import.meta.url))
        }
      },
      ssr: {
        noExternal: ['lucide-vue-next', 'dexie']
      }
    },
    mermaid: {
      theme: 'base',
      themeVariables: {
        primaryColor: '#FDF4EC',
        primaryBorderColor: '#E7C3A6',
        primaryTextColor: '#3A3028',
        lineColor: '#B8A99A',
        fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: '16px'
      }
    }
  })
)
