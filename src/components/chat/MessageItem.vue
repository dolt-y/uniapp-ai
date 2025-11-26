<template>
  <view class="message-item"
    :class="{ 'ai-message': message.role === 'assistant', 'user-message': message.role === 'user' }"
    :id="`message-${message.id}`">
    <view class="avatar">
      <image class="avatar-img" :src="message.role === 'assistant' ? '/static/logo.png' : userInfo.avatarUrl"
        mode="aspectFill"></image>
    </view>
    <view class="message-wrapper">
      <view class="message-header">
        <view v-if="message.role === 'assistant'" class="message-name">小梦</view>
        <view v-else class="message-name">{{ userInfo.nickname }}</view>
        <text class="message-time">{{ formatTime(message.timestamp) }}</text>
      </view>

      <view class="message-bubble">
        <view v-if="message.type === 'text'" class="message-content markdown-content">
          <rich-text :nodes="formattedContent" class="markdown-content"></rich-text>
        </view>
        <view v-else-if="message.type === 'image'" class="message-image" @click="previewImage(message.content)">
          <image :src="message.content" mode="aspectFill"></image>
          <view class="image-overlay"></view>
        </view>
        <view v-if="message.quoted" class="quoted-message">
          <text class="quoted-label">{{ message.quoted.role === 'assistant' ? '小梦' : '我' }}：</text>
          <text>{{ truncateText(message.quoted.content, 50) }}</text>
        </view>
      </view>
      <view class="message-footer">
        <view class="message-actions"
          v-if="message.type === 'text' && message.status !== 'pending' && message.role === 'assistant'">
          <view class="actions-left">
            <view class="action-btn copy-btn" @click="handleCopy" :class="{ 'copied': isCopied }">
            </view>

            <view class="action-btn regenerate-btn" @click="handleRegenerate">
            </view>
          </view>

          <!-- <view class="actions-right">
            <view class="action-btn share-btn" @click="handleShare">
            </view>
          </view> -->
        </view>

        <view v-if="showStatus" class="status-pill" :class="statusClass">
          <view v-if="message.status === 'pending'" class="status-spinner"></view>
          <text class="status-text">{{ statusText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps, onMounted } from 'vue';
import { renderMarkdown } from '@/utils/markdown';

const userInfo = ref(uni.getStorageSync('user'))
const isCopied = ref(false)

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['preview-image', 'regenerate', 'quote', 'share']);

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

function handleCopy() {
  uni.setClipboardData({
    data: props.message.content,
    success: () => {
      isCopied.value = true
      uni.showToast({
        title: '已复制到剪贴板',
        icon: 'success',
        duration: 1500
      })
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
    },
    fail: () => {
      uni.showToast({
        title: '复制失败',
        icon: 'none'
      })
    }
  })
}

function handleRegenerate() {
  uni.showModal({
    title: '重新生成',
    content: '确定要重新生成这条回复吗？',
    success: (res) => {
      if (res.confirm) {
        emit('regenerate', props.message)
      }
    }
  })
}

function handleQuote() {
  emit('quote', props.message)
}

function handleShare() {
  emit('share', props.message)
}

const formattedContent = computed(() => renderMarkdown(props.message?.content ?? ''));
const showStatus = computed(() => props.message.role === 'user');
const statusText = computed(() => getStatusText(props.message.status));
const statusClass = computed(() => props.message.status || 'success');
</script>

<style lang="scss" scoped>
.message-item {
  display: flex;
  gap: 24rpx;
  padding: 16rpx 0;
  animation: messageSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    flex-shrink: 0;
    overflow: hidden;
    box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
    border: 3rpx solid rgba(255, 255, 255, 0.8);

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .message-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    max-width: calc(100% - 104rpx);
  }

  .message-header {
    display: flex;
    align-items: center;
    gap: 20rpx;
    // justify-content: space-between;
    padding: 0 4rpx;

    .message-name {
      font-size: 26rpx;
      font-weight: 600;
      letter-spacing: 0.5rpx;
    }

    .message-time {
      font-size: 24rpx;
      color: rgba(0, 0, 0, 0.45);
      letter-spacing: 0.3rpx;
    }
  }

  .message-bubble {
    padding: 24rpx 28rpx;
    border-radius: 20rpx 20rpx 20rpx 4rpx;
    word-wrap: break-word;
    line-height: 1.7;
    font-size: 28rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:active {
      transform: translateY(2rpx);
    }
  }

  &.user-message {
    flex-direction: row-reverse;

    .message-wrapper {
      align-items: flex-end;
    }

    .message-header {
      flex-direction: row-reverse;

      .message-time {
        color: rgba(0, 0, 0, 0.5);
      }
    }

    .message-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      border-radius: 20rpx 20rpx 4rpx 20rpx;
      box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
    }

    .avatar {
      border-color: rgba(102, 126, 234, 0.3);
    }

    .message-footer {
      flex-direction: row-reverse;
    }
  }

  &.ai-message {
    .message-bubble {
      background: #ffffff;
      color: #1f2937;
      border: 1rpx solid rgba(0, 0, 0, 0.08);
    }

    .avatar {
      border-color: rgba(99, 102, 241, 0.3);
    }
  }

  .message-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    padding: 0 4rpx;
  }

  .message-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 16rpx;

    .actions-left {
      display: flex;
      gap: 16rpx;
      align-items: center;
    }

    .actions-right {
      display: flex;
      gap: 16rpx;
      align-items: center;
      margin-left: auto;
    }

    .action-btn {
      width: 46rpx;
      height: 46rpx;
      border-radius: 50%;
      // background-color: rgba(0, 0, 0, 0.04);
      background-repeat: no-repeat;
      background-position: center;
      background-size: 36rpx 36rpx;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border: 1rpx solid transparent;
      flex-shrink: 0;

      &:active {
        transform: scale(0.92);
        background-color: rgba(99, 102, 241, 0.12);
      }

      &.copy-btn {
        background-image: url('../../static/copy.png');

        &.copied {
          background-color: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
          animation: successPulse 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      }

      &.regenerate-btn {
        background-image: url('../../static/rebuild.png');

        &:active {
          animation: rotate360 0.6s ease-out;
        }
      }

      &.share-btn {
        background-image: url('../../static/share.png');
      }
    }
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 20rpx;
    border-radius: 24rpx;
    font-size: 22rpx;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 4rpx;

    &.pending {
      background: rgba(99, 102, 241, 0.12);
      color: #6366f1;
    }

    &.success {
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
    }

    &.error {
      background: rgba(239, 68, 68, 0.12);
      color: #dc2626;
    }

    .status-text {
      letter-spacing: 0.5rpx;
    }
  }

  .status-spinner {
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    border: 3rpx solid currentColor;
    border-top-color: transparent;
    animation: spinner 0.8s linear infinite;
  }

  .markdown-content {
    width: 100%;
    line-height: 1.7;
    color: inherit;

    :deep(p) {
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(code) {
      font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
      background: rgba(0, 0, 0, 0.06);
      padding: 4rpx 10rpx;
      border-radius: 8rpx;
      font-size: 26rpx;
    }

    :deep(pre) {
      background: #1e293b;
      color: #e2e8f0;
      padding: 24rpx;
      border-radius: 16rpx;
      overflow: auto;
      margin: 16rpx 0;

      code {
        background: none;
        padding: 0;
      }
    }

    :deep(ul),
    :deep(ol) {
      margin: 16rpx 0;
      padding-left: 32rpx;
    }

    :deep(li) {
      margin-bottom: 8rpx;
    }

    :deep(blockquote) {
      border-left: 4rpx solid rgba(99, 102, 241, 0.5);
      padding-left: 20rpx;
      color: rgba(0, 0, 0, 0.6);
      margin: 16rpx 0;
      font-style: italic;
    }

    :deep(a) {
      color: #6366f1;
      text-decoration: underline;
    }
  }

  .message-image {
    max-width: 100%;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
    position: relative;

    image {
      width: 100%;
      display: block;
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 60%, rgba(0, 0, 0, 0.3));
      pointer-events: none;
    }
  }
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

@keyframes successPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.15);
  }
}

@keyframes rotate360 {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>