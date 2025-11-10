<template>
  <view class="quick-reply-section">
    <view class="quick-reply-title">快捷回复</view>
    <view class="quick-reply-list">
      <view 
        v-for="(reply, index) in quickReplies" 
        :key="index"
        class="quick-reply-item"
        @click="handleQuickReply(reply)"
      >
        <text class="quick-reply-text">{{ reply }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 定义props
const props = defineProps({
  quickReplies: {
    type: Array,
    required: true
  }
});

// 定义事件
const emit = defineEmits(['quick-reply']);

// 处理快捷回复点击
function handleQuickReply(reply) {
  emit('quick-reply', reply);
}
</script>

<style lang="scss" scoped>
.quick-reply-section {
  padding: 28rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  border-top: 1rpx solid rgba(129, 140, 248, 0.12);
  box-shadow: 0 -16rpx 32rpx rgba(99, 102, 241, 0.12);
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  animation: slideUp 0.28s ease-out;
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);

  .quick-reply-title {
    font-size: 24rpx;
    font-weight: 600;
    color: rgba(47, 58, 102, 0.65);
    margin-bottom: 16rpx;
    letter-spacing: 0.8rpx;
  }

  .quick-reply-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .quick-reply-item {
    padding: 16rpx 28rpx;
    background: linear-gradient(135deg, rgba(129, 140, 248, 0.16), rgba(236, 233, 255, 0.14));
    border: 1rpx solid rgba(129, 140, 248, 0.2);
    border-radius: 28rpx;
    font-size: 26rpx;
    color: #3a4272;
    cursor: pointer;
    transition: transform 0.26s ease, box-shadow 0.26s ease, background 0.26s ease, color 0.26s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% - 20rpx);
    box-shadow: 0 12rpx 20rpx rgba(129, 140, 248, 0.12);
    position: relative;
    -webkit-tap-highlight-color: transparent;
    user-select: none;

    &:active {
      transform: translateY(3rpx);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(129, 140, 248, 0.18));
      box-shadow: 0 10rpx 16rpx rgba(99, 102, 241, 0.18);
      border-color: rgba(99, 102, 241, 0.32);
      color: #273063;
    }

    .quick-reply-text {
      display: inline-block;
      line-height: 1.4;
      letter-spacing: 0.6rpx;
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>