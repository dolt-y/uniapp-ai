<template>
  <view class="recording-indicator" :class="{ 'active': isRecording }">
    <view class="recording-content">
      <view class="recording-icon">
        <image src="/static/icons/mic-outline.svg" mode="aspectFit"></image>
      </view>
      <view class="recording-info">
        <view class="recording-title">正在录音...</view>
        <view class="recording-duration">{{ formatDuration(duration) }}</view>
      </view>
      <view class="recording-action"
        :class="{ 'cancel': isCancel }"
        @click="handleCancel"
      >
        <image src="/static/icons/close-circle-outline.svg" mode="aspectFit" style="width: 28px; height: 28px;"></image>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 定义props
const props = defineProps({
  isRecording: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 0
  },
  isCancel: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['cancel']);

// 格式化时长
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 处理取消
function handleCancel() {
  emit('cancel');
}
</script>

<style lang="scss" scoped>
.recording-indicator {
  position: fixed;
  inset: 0;
  background: rgba(30, 41, 59, 0.62);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease;
  backdrop-filter: blur(18rpx);
  -webkit-backdrop-filter: blur(18rpx);
  
  &.active {
    opacity: 1;
    pointer-events: auto;
  }

  .recording-content {
    display: flex;
    align-items: center;
    padding: 36rpx 40rpx;
    border-radius: 32rpx;
    background: linear-gradient(150deg, rgba(255, 255, 255, 0.94), rgba(236, 243, 255, 0.96));
    box-shadow: 0 32rpx 68rpx rgba(15, 23, 42, 0.28);
    animation: scaleIn 0.26s ease-out;
    min-width: 560rpx;
    border: 2rpx solid rgba(129, 140, 248, 0.25);
    gap: 24rpx;
  }

  .recording-icon {
    width: 108rpx;
    height: 108rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 28rpx;
    background: linear-gradient(135deg, #34d399 0%, #0ea5e9 100%);
    animation: pulse 2s infinite;
    position: relative;
    flex-shrink: 0;
    box-shadow: 0 24rpx 36rpx rgba(14, 165, 233, 0.24);

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 140rpx;
      height: 140rpx;
      border-radius: 32rpx;
      background: rgba(14, 165, 233, 0.18);
      transform: translate(-50%, -50%);
      animation: ripple 2.2s infinite;
    }

    image {
      width: 60rpx;
      height: 60rpx;
      animation: bounce 1.2s infinite;
      filter: brightness(0) invert(1);
    }
  }

  .recording-info {
    flex: 1;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .recording-title {
    font-size: 30rpx;
    font-weight: 700;
    color: #1f2a4f;
    letter-spacing: 0.8rpx;
  }

  .recording-duration {
    font-size: 40rpx;
    font-weight: 700;
    color: #0f766e;
    font-family: 'Courier New', monospace;
    letter-spacing: 2rpx;
  }

  .recording-action {
    width: 92rpx;
    height: 92rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 28rpx;
    background: rgba(248, 113, 113, 0.12);
    transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
    cursor: pointer;
    flex-shrink: 0;
    box-shadow: 0 18rpx 32rpx rgba(248, 113, 113, 0.2);

    &:active {
      transform: translateY(4rpx);
      box-shadow: 0 14rpx 20rpx rgba(248, 113, 113, 0.22);
    }

    image {
      width: 44rpx;
      height: 44rpx;
      filter: hue-rotate(-20deg);
    }
  }
}

// 动画
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>