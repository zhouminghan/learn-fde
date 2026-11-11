<template>
  <svg
    class="brand-logo"
    width="28"
    height="28"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
    aria-label="Learning FDE"
  >
    <rect x="2" y="2" width="28" height="28" rx="7" class="brand-logo__bg" />
    <path
      d="M9 23V10h5.2c3.1 0 4.9 1.6 4.9 4.05 0 1.75-1.05 3.05-2.7 3.55 2 .45 3.15 1.9 3.15 4C19.55 24.05 17.7 25 14.6 25H9v-2zm5.05-6.1c1.7 0 2.6-.65 2.6-1.85 0-1.1-.9-1.7-2.55-1.7h-2.7v3.55h2.65zm.1 6.1c1.85 0 2.8-.7 2.8-1.95 0-1.25-1-1.9-2.85-1.9h-2.7V23h2.75z"
      class="brand-logo__glyph"
    />
    <circle cx="23.5" cy="8.5" r="2.4" class="brand-logo__dot" />
  </svg>
</template>

<script setup lang="ts">
// 品牌标志：字母 F 与流程节点。颜色随主题通过 CSS 变量适配。
</script>

<style scoped>
.brand-logo {
  display: block;
  flex: none;
}

.brand-logo__bg {
  fill: var(--lf-navy);
}

.brand-logo__glyph {
  fill: #fff;
}

.brand-logo__dot {
  fill: var(--lf-teal, #2c9a8f);
}
</style>
