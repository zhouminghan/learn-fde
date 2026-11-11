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
    <rect x="1.5" y="1.5" width="29" height="29" rx="7" class="brand-logo__bg" />
    <rect x="9" y="9" width="3.5" height="14" rx="1.2" class="brand-logo__glyph" />
    <rect x="9" y="9" width="8.5" height="3.5" rx="1.2" class="brand-logo__glyph" />
    <rect x="9" y="14.25" width="6" height="3.5" rx="1.2" class="brand-logo__glyph" />
    <circle cx="24" cy="8.5" r="2.7" class="brand-logo__dot" />
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
  fill: var(--lf-teal, #2c8f86);
}

.brand-logo__dot {
  fill: var(--lf-teal, #2c9a8f);
}
</style>
