<template>
  <view class="function-menu-overlay" v-if="visible" @click="handleOverlayClick">
    <view class="function-menu-container" @click.stop>
      <view class="menu-header">
        <view class="menu-title">功能菜单</view>
        <view class="close-btn" @click="handleClose">
          ✕
        </view>
      </view>
      <view class="menu-content">
        <view class="menu-item" @click="handleShowSettings">
          <view class="menu-item-content">
            <view class="menu-item-icon">
              ⚙️
            </view>
            <view class="menu-item-title">设置</view>
          </view>
          <view class="menu-item-arrow">
            →
          </view>
        </view>
        <view class="menu-item" @click="handleShowAbout">
          <view class="menu-item-content">
            <view class="menu-item-icon">
              ℹ️
            </view>
            <view class="menu-item-title">关于</view>
          </view>
          <view class="menu-item-arrow">
            →
          </view>
        </view>
        <view class="menu-item" @click="handleClearChat" :class="{ 'danger': true }">
          <view class="menu-item-content">
            <view class="menu-item-icon">
              🗑️
            </view>
            <view class="menu-item-title">清除聊天记录</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['close', 'clear-chat', 'show-settings', 'show-about']);

// 处理关闭
function handleClose() {
  emit('close');
}

// 处理遮罩点击
function handleOverlayClick() {
  emit('close');
}

// 处理清除聊天记录
function handleClearChat() {
  uni.showModal({
    title: '清除聊天记录',
    content: '确定要清除所有聊天记录吗？此操作不可恢复。',
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        emit('clear-chat');
        handleClose();
      }
    }
  });
}

// 处理显示设置
function handleShowSettings() {
  emit('show-settings');
  handleClose();
}

// 处理显示关于
function handleShowAbout() {
  emit('show-about');
  handleClose();
}
</script>

<style lang="scss" scoped>
.function-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 48rpx 32rpx;
  box-sizing: border-box;
  animation: fadeIn 0.28s ease;

  .function-menu-container {
    width: 100%;
    max-width: 640rpx;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.92), rgba(236, 240, 255, 0.94));
    border-radius: 36rpx;
    box-shadow: 0 36rpx 68rpx rgba(15, 23, 42, 0.24);
    overflow: hidden;
    animation: slideUp 0.28s ease;
    border: 1rpx solid rgba(129, 140, 248, 0.18);
    box-sizing: border-box;
    backdrop-filter: blur(24rpx);
    -webkit-backdrop-filter: blur(24rpx);
  }

  .menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid rgba(129, 140, 248, 0.12);
    background: rgba(255, 255, 255, 0.72);

    .menu-title {
      font-size: 30rpx;
      font-weight: 700;
      color: #2d3564;
      letter-spacing: 1rpx;
    }

    .close-btn {
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 18rpx;
      background: rgba(129, 140, 248, 0.12);
      transition: all 0.25s ease;
      box-shadow: 0 12rpx 24rpx rgba(129, 140, 248, 0.18);

      &:active {
        transform: translateY(3rpx);
        box-shadow: 0 8rpx 18rpx rgba(129, 140, 248, 0.2);
      }

      text {
        font-size: 32rpx;
        color: rgba(45, 53, 100, 0.72);
      }
    }
  }

  .menu-content {
    padding: 12rpx 28rpx 32rpx;
    display: flex;
    flex-direction: column;
    gap: 18rpx;
  }

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22rpx 24rpx;
    border-radius: 24rpx;
    background: rgba(244, 246, 255, 0.9);
    transition: transform 0.24s ease, box-shadow 0.24s ease, background 0.24s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
    border: 1rpx solid rgba(129, 140, 248, 0.14);

    &:active {
      transform: translateY(4rpx);
      box-shadow: 0 18rpx 24rpx rgba(79, 70, 229, 0.18);
      background: rgba(226, 232, 255, 0.92);
    }

    &.danger {
      background: rgba(248, 113, 113, 0.08);
      border-color: rgba(248, 113, 113, 0.24);

      &:active {
        background: rgba(248, 113, 113, 0.18);
      }

      .menu-item-title {
        color: #dc2626;
      }
    }

    .menu-item-content {
      display: flex;
      align-items: center;
      gap: 16rpx;
    }

    .menu-item-icon {
      width: 52rpx;
      height: 52rpx;
      border-radius: 18rpx;
      background: rgba(255, 255, 255, 0.94);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12rpx 20rpx rgba(99, 102, 241, 0.16);

      text {
        font-size: 30rpx;
      }
    }

    .menu-item-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #313a65;
      letter-spacing: 0.6rpx;
    }

    .menu-item-arrow {
      font-size: 32rpx;
      color: rgba(49, 58, 101, 0.45);
    }
  }
}

// 动画
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(60rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>