<template>
  <view
    class="message-item"
    :class="{ 'ai-message': message.role === 'assistant', 'user-message': message.role === 'user' }"
    :id="`message-${message.id}`"
  >
    <view class="avatar">
      <image
        class="avatar-img"
        :src="message.role === 'assistant' ? '/static/logo.png' : '/static/logo.png'"
        mode="aspectFill"
      ></image>
    </view>
    <view class="message-wrapper">
      <view v-if="message.role === 'assistant'" class="message-name">AI 助手</view>

      <view class="message-bubble">
        <view v-if="message.type === 'text'" class="message-content">
          <rich-text :nodes="formatMessageContent(message.content)" class="message-content"></rich-text>
        </view>
        <view v-else-if="message.type === 'image'" class="message-image" @click="previewImage(message.content)">
          <image :src="message.content" mode="aspectFill"></image>
          <view class="image-overlay"></view>
        </view>
        <view v-if="message.quoted" class="quoted-message">
          <text class="quoted-label">{{ message.quoted.role === 'assistant' ? 'AI助手' : '我' }}：</text>
          <text>{{ truncateText(message.quoted.content, 50) }}</text>
        </view>
      </view>
      <view class="message-meta" :class="{ 'user-meta': message.role === 'user' }">
        <text class="message-time">{{ formatTime(message.timestamp) }}</text>
        <view v-if="showStatus" class="status-pill" :class="statusClass">
          <view v-if="message.status === 'pending'" class="status-spinner"></view>
          <text>{{ statusText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, defineEmits, defineProps } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['preview-image']);

function formatMessageContent(content) {
  // 处理换行和格式化
  let formatted = content
    .replace(/\n/g, '<br/>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 处理列表样式
    .replace(/^- (.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>')
    // 处理数字列表
    .replace(/^(\d+)\. (.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 5px; list-style-type: decimal;">$2</li>');

  return formatted;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function previewImage(imageUrl) {
  emit('preview-image', imageUrl);
}

function getStatusText(status) {
  if (status === 'pending') return '发送中';
  if (status === 'error') return '发送失败';
  return '已送达';
}

const showStatus = computed(() => props.message.role === 'user');
const statusText = computed(() => getStatusText(props.message.status));
const statusClass = computed(() => props.message.status || 'success');
</script>

<style lang="scss" scoped>
.message-item {
  display: flex;
  gap: 20rpx;
  animation: messageSlideIn 0.32s ease-out;
  position: relative;

  .avatar {
    width: 70rpx;
    height: 70rpx;
    border-radius: 24rpx;
    margin: 0 8px;
    background: linear-gradient(135deg, rgba(244, 246, 255, 0.92), rgba(228, 233, 255, 0.92));
    flex-shrink: 0;
    overflow: hidden;
    box-shadow: 0 12rpx 24rpx rgba(102, 126, 234, 0.16);

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .message-wrapper {
    max-width: 78%;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .message-name {
    font-size: 24rpx;
    color: rgba(76, 86, 125, 0.7);
    font-weight: 500;
    letter-spacing: 1rpx;
    margin-left: 12rpx;
  }

  .message-bubble {
    padding: 22rpx 28rpx;
    border-radius: 26rpx;
    word-wrap: break-word;
    line-height: 1.68;
    position: relative;
    font-size: 28rpx;
    overflow: hidden;
    box-shadow: 0 20rpx 38rpx rgba(118, 75, 162, 0.08);
    border: 1rpx solid transparent;
    backdrop-filter: blur(6rpx);
    -webkit-backdrop-filter: blur(6rpx);
    transition: transform 0.25s ease, box-shadow 0.25s ease;

    &:active {
      transform: translateY(4rpx);
      box-shadow: 0 16rpx 24rpx rgba(118, 75, 162, 0.12);
    }
  }

  &.user-message {
    flex-direction: row-reverse;

    .message-wrapper {
      align-items: flex-end;
    }

    .message-bubble {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
      color: #ffffff;
      border: none;
    }

    .avatar {
      background: linear-gradient(135deg, #34d399 0%, #0ea5e9 100%);
      box-shadow: 0 12rpx 28rpx rgba(14, 165, 233, 0.26);
    }
  }

  &.ai-message {
    .message-bubble {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(237, 242, 255, 0.94));
      border: 1rpx solid rgba(99, 102, 241, 0.12);
      color: #38416c;
    }

    .avatar {
      background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
      box-shadow: 0 12rpx 28rpx rgba(99, 102, 241, 0.24);
    }
  }

  .message-content {
    line-height: 1.58;
    color: inherit;
  }

  .quoted-message {
    background-color: rgba(244, 246, 255, 0.92);
    border: 1rpx solid rgba(102, 126, 234, 0.14);
    border-radius: 18rpx;
    padding: 16rpx 18rpx;
    margin-bottom: 14rpx;
    font-size: 24rpx;
    color: rgba(55, 65, 81, 0.85);
    max-height: 160rpx;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    line-height: 1.5;
    backdrop-filter: blur(6rpx);
    -webkit-backdrop-filter: blur(6rpx);

    .quoted-label {
      font-weight: 500;
      color: #4f5b8c;
      margin-right: 12rpx;
    }
  }

  .message-image {
    max-width: 460rpx;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 20rpx 32rpx rgba(15, 23, 42, 0.18);
    -webkit-tap-highlight-color: transparent;

    image {
      width: 100%;
      height: 100%;
      display: block;
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(30, 41, 59, 0.3) 100%);
      pointer-events: none;
    }
  }

  .message-meta {
    display: flex;
    align-items: center;
    gap: 14rpx;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: rgba(71, 85, 105, 0.7);

    &.user-meta {
      flex-direction: row-reverse;
    }

    .message-time {
      letter-spacing: 0.5rpx;
    }
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 10rpx;
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;
    font-weight: 500;
    letter-spacing: 0.8rpx;

    &.pending {
      background: rgba(99, 102, 241, 0.16);
      color: #595eea;
    }

    &.success {
      background: rgba(45, 212, 191, 0.16);
      color: #0f766e;
    }

    &.error {
      background: rgba(248, 113, 113, 0.18);
      color: #dc2626;
    }
  }

  .status-spinner {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    border: 4rpx solid currentColor;
    border-top-color: transparent;
    animation: spinner 0.9s linear infinite;
  }
}

@keyframes messageSlideIn {
  0% {
    opacity: 0;
    transform: translateY(16rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>