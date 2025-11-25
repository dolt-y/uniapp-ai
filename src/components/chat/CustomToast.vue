<template>
  <view class="custom-toast" :class="{ 'show': visible }">
    <view class="toast-content"
      :class="{ 'success': type === 'success', 'error': type === 'error', 'warning': type === 'warning', 'info': type === 'info' }"
    >
      <view class="toast-icon">
        <!-- 使用CSS绘制的图标替代图片 -->
        <view v-if="type === 'success'" class="icon-checkmark"></view>
        <view v-else-if="type === 'error'" class="icon-close"></view>
        <view v-else-if="type === 'warning'" class="icon-alert"></view>
        <view v-else class="icon-info"></view>
      </view>
      <view class="toast-text">{{ message }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';

// 响应式数据
const visible = ref(false);
const message = ref('');
const type = ref('info'); // success, error, warning, info
const translateY = ref(50);
let timer = null;

// 显示Toast
function showToast(options = {}) {
  const {
    message: msg = '',
    type: msgType = 'info',
    duration = 2000
  } = options;
  
  // 清除之前的定时器
  if (timer) {
    clearTimeout(timer);
  }
  
  message.value = msg;
  type.value = msgType;
  visible.value = true;
  translateY.value = 50;
  
  // 动画效果
  setTimeout(() => {
    translateY.value = 0;
  }, 10);
  
  // 自动隐藏
  timer = setTimeout(() => {
    hideToast();
  }, duration);
}

// 隐藏Toast
function hideToast() {
  translateY.value = 50;
  
  setTimeout(() => {
    visible.value = false;
    message.value = '';
  }, 300);
}

// 清除定时器
function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

// 暴露方法
defineExpose({
  showToast,
  hideToast,
  clearTimer
});

// 监听visible变化
watch(visible, (newVal) => {
  if (!newVal) {
    clearTimer();
  }
});
</script>

<style lang="scss" scoped>
.custom-toast {
  position: fixed;
  /* 改为从顶部显示，更符合移动端习惯 */
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  /* 初始状态向上移动并透明 */
  opacity: 0;
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  &.show {
    /* 显示时平滑滑入 */
    opacity: 1;
    pointer-events: auto;
    animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .toast-content {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    /* 简化为纯色背景，更现代简洁 */
    background-color: #FFFFFF;
    border-radius: 12px;
    min-width: 100px;
    max-width: 80vw;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
    /* 添加左侧彩色条 */
    border-left: 4px solid #3B82F6;

    &.success {
      border-left-color: #10B981;
      
      .toast-icon {
        background-color: rgba(16, 185, 129, 0.1);
        color: #10B981;
      }
    }

    &.error {
      border-left-color: #EF4444;
      
      .toast-icon {
        background-color: rgba(239, 68, 68, 0.1);
        color: #EF4444;
      }
    }

    &.warning {
      border-left-color: #F59E0B;
      
      .toast-icon {
        background-color: rgba(245, 158, 11, 0.1);
        color: #F59E0B;
      }
    }

    &.info {
      border-left-color: #3B82F6;
      
      .toast-icon {
        background-color: rgba(59, 130, 246, 0.1);
        color: #3B82F6;
      }
    }
  }

  .toast-icon {
    width: 32px;
    height: 32px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 8px;
    background-color: rgba(59, 130, 246, 0.1);
    color: #3B82F6;
    
    /* CSS绘制的图标 */
    .icon-checkmark,
    .icon-close,
    .icon-alert,
    .icon-info {
      position: relative;
      width: 16px;
      height: 16px;
    }
    
    /* 成功图标 - 对勾 */
    .icon-checkmark::before {
      content: '';
      position: absolute;
      width: 6px;
      height: 10px;
      border: solid currentColor;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      left: 5px;
      top: 2px;
    }
    
    /* 错误图标 - X */
    .icon-close::before,
    .icon-close::after {
      content: '';
      position: absolute;
      width: 2px;
      height: 16px;
      background-color: currentColor;
      left: 7px;
      top: 0;
    }
    .icon-close::before {
      transform: rotate(45deg);
    }
    .icon-close::after {
      transform: rotate(-45deg);
    }
    
    /* 警告图标 - ! */
    .icon-alert::before {
      content: '';
      position: absolute;
      width: 2px;
      height: 8px;
      background-color: currentColor;
      left: 7px;
      top: 1px;
    }
    .icon-alert::after {
      content: '';
      position: absolute;
      width: 3px;
      height: 3px;
      background-color: currentColor;
      border-radius: 50%;
      left: 6.5px;
      bottom: 1px;
    }
    
    /* 信息图标 - i */
    .icon-info::before {
      content: '';
      position: absolute;
      width: 2px;
      height: 8px;
      background-color: currentColor;
      left: 7px;
      bottom: 1px;
    }
    .icon-info::after {
      content: '';
      position: absolute;
      width: 3px;
      height: 3px;
      background-color: currentColor;
      border-radius: 50%;
      left: 6.5px;
      top: 1px;
    }
  }

  .toast-text {
    font-size: 14px;
    color: #1F2937;
    line-height: 1.5;
    font-weight: 500;
    word-break: break-word;
  }
}

/* 简洁的滑入动画 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
