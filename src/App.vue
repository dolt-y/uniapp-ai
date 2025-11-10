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

<style>
/* 全局样式重置和基础设置 */
view, text, button, input, textarea, image, swiper, swiper-item, scroll-view, navigator {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  color: $text-primary;
  background-color: $background-primary;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent; /* 移除点击高亮 */
}

/* 页面容器样式 */
.container {
  min-height: 100vh;
  background-color: $background-primary;
  position: relative;
}

.chat-container {
  min-height: 100vh;
  background-color: $background-secondary;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 按钮基础样式 */
button {
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.2s ease;
  background-color: $primary-color;
  color: white;
  padding: 12px 24px;
}

button:active {
  transform: scale(0.98);
  opacity: 0.9;
}

button:disabled {
  background-color: $text-disabled;
  cursor: not-allowed;
  transform: none;
}

/* 输入框基础样式 */
input, textarea {
  border: 1px solid $border-light;
  outline: none;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 16px;
  transition: all 0.2s ease;
  background-color: $background-secondary;
  color: $text-primary;
}

input:focus, textarea:focus {
  border-color: $primary-color;
  box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
}

/* 链接样式 */
a {
  color: $primary-color;
  text-decoration: none;
  transition: color 0.2s ease;
}

a:active {
  opacity: 0.8;
}

/* 卡片样式 */
.card {
  background-color: $background-secondary;
  border-radius: 16px;
  padding: 20px;
  box-shadow: $shadow-md;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:active {
  transform: translateY(2px);
  box-shadow: $shadow-sm;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
