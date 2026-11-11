import { h, type App, type Component } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import BrandLogo from './components/BrandLogo.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import LessonControls from './components/LessonControls.vue'
import HomePage from './components/HomePage.vue'
import CoursePage from './components/CoursePage.vue'
import PracticePage from './components/PracticePage.vue'
import ExamPage from './components/ExamPage.vue'
import QuestionsPage from './components/QuestionsPage.vue'
import RecordsPage from './components/RecordsPage.vue'
import ResourcesPage from './components/ResourcesPage.vue'
import LabPage from './components/LabPage.vue'
import DiagramFrame from './components/visual/DiagramFrame.vue'
import MermaidDiagram from './components/visual/MermaidDiagram.vue'
import ArchitectureDiagram from './components/visual/ArchitectureDiagram.vue'
import InteractiveWorkflow from './components/visual/InteractiveWorkflow.vue'
import AgentArchitectureDemo from './components/demo/AgentArchitectureDemo.vue'
import RagWorkflowDemo from './components/demo/RagWorkflowDemo.vue'
import AgentExecutionDemo from './components/demo/AgentExecutionDemo.vue'
import './styles/custom.css'

const components: Record<string, Component> = {
  BrandLogo,
  ThemeToggle,
  LessonControls,
  HomePage,
  CoursePage,
  PracticePage,
  ExamPage,
  QuestionsPage,
  RecordsPage,
  ResourcesPage,
  LabPage,
  DiagramFrame,
  MermaidDiagram,
  ArchitectureDiagram,
  InteractiveWorkflow,
  AgentArchitectureDemo,
  RagWorkflowDemo,
  AgentExecutionDemo
}

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout),
  enhanceApp({ app }: { app: App }) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component)
    }
  }
} satisfies Theme
