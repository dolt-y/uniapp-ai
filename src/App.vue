<!--
 * @Description: 
 * @Author: wen.yao
 * @LastEditTime: 2025-11-07 17:18:29
-->
<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>

<style lang="scss">

:global(html),
:global(body) {
  font-family: 'SF Pro Display', 'PingFang SC', 'Segoe UI', sans-serif;
  font-size: 16px;
  color: var(--color-text-primary, #1f2937);
  background: var(--color-bg-primary, #f5f7ff);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
}

:global(view),
:global(text),
:global(button),
:global(input),
:global(textarea),
:global(image),
:global(swiper),
:global(swiper-item),
:global(scroll-view),
:global(navigator) {
  font-family: inherit;
}

:global(.container),
:global(.chat-container) {
  min-height: 100vh;
  background: var(--color-bg-primary, #f5f7ff);
}

:global(button) {
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  border-radius: 14px;
  padding: 12px 24px;
  color: var(--color-text-inverse, #fff);
  // background: linear-gradient(120deg, #3b82f6, #6366f1);
  // box-shadow: 0 12px 24px rgba(99, 102, 241, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:global(button:active) {
  transform: translateY(1px);
  // box-shadow: 0 8px 18px rgba(99, 102, 241, 0.18);
}

:global(button:disabled) {
  background: rgba(148, 163, 184, 0.5);
  box-shadow: none;
  cursor: not-allowed;
}

:global(input),
:global(textarea) {
  border: 1px solid var(--color-border-subtle, #d1d5db);
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 16px;
  background: var(--color-bg-card, #fff);
  color: var(--color-text-primary, #1f2937);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

:global(input:focus),
:global(textarea:focus) {
  border-color: rgba(99, 102, 241, 0.8);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

:global(a) {
  color: var(--color-accent, #6366f1);
  text-decoration: none;
  transition: opacity 0.2s ease;
}

:global(a:active) {
  opacity: 0.7;
}

:global(.card) {
  background: var(--color-bg-card, #fff);
  border-radius: 18px;
  padding: 20px;
  border: 1px solid var(--color-border-subtle, #e2e8f0);
  box-shadow: var(--shadow-soft, 0 10px 30px rgba(15, 23, 42, 0.08));
}

:global(::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:global(::-webkit-scrollbar-thumb) {
  background: rgba(148, 163, 184, 0.6);
  border-radius: 3px;
}

:global(::-webkit-scrollbar-track) {
  background: transparent;
}
</style>
