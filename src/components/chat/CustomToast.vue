<template>
  <view class="custom-toast" :class="{ 'show': visible }"
    :style="{ transform: `translateY(${translateY}px)` }"
  >
    <view class="toast-content"
      :class="{ 'success': type === 'success', 'error': type === 'error', 'warning': type === 'warning', 'info': type === 'info' }"
    >
      <view class="toast-icon">
      <!-- 成功图标 -->
      <image v-if="type === 'success'" src="/static/icons/checkmark-circle-outline.svg" mode="aspectFit"></image>
      <!-- 错误图标 -->
      <image v-else-if="type === 'error'" src="/static/icons/close-circle-outline.svg" mode="aspectFit"></image>
      <!-- 警告图标 -->
      <image v-else-if="type === 'warning'" src="/static/icons/alert-circle-outline.svg" mode="aspectFit"></image>
      <!-- 信息图标 -->
      <image v-else src="/static/icons/information-circle-outline.svg" mode="aspectFit"></image>
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  
  &.show {
    opacity: 1;
    pointer-events: auto;
  }

  .toast-content {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 24px;
    min-width: 120px;
    max-width: 80vw;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.8s ease;
    }

    &:hover::before {
      left: 100%;
    }

    // 不同类型的颜色
    &.success {
      background-color: rgba(7, 193, 96, 0.9);
    }

    &.error {
      background-color: rgba(255, 87, 34, 0.9);
    }

    &.warning {
      background-color: rgba(255, 165, 0, 0.9);
    }

    &.info {
      background-color: rgba(51, 51, 51, 0.9);
    }
  }

  .toast-icon {
    width: 24px;
    height: 24px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .toast-text {
    font-size: 16px;
    color: #FFFFFF;
    line-height: 1.5;
    text-align: center;
    word-break: break-word;
    max-width: calc(100% - 36px);
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(50px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(50px);
  }
}
</style>