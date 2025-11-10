<!-- 全局导航栏组件 - 腾讯元宝风格 -->
<template>
  <view class="nav-wrapper">
    <view class="nav-shell">
      <view class="nav-top">
        <view class="brand-block">
          <image class="brand-logo" src="/static/logo.png" mode="aspectFit"></image>
          <view class="brand-text">
            <text class="brand-title">{{ title || '智元 AI 助手' }}</text>
            <view class="brand-tags">
              <text class="tag">智能创作</text>
              <text class="dot">·</text>
              <text class="tag">多模态</text>
              <text class="dot">·</text>
              <text class="tag">私有知识库</text>
            </view>
          </view>
        </view>

        <view class="nav-actions">
          <view class="action-btn" @click="onViewHistory">
            <image src="/static/icons/chatbubble-outline.svg" mode="aspectFit"></image>
          </view>
          <view class="action-btn" @click="onOpenMenu">
            <text class="more">···</text>
          </view>
        </view>
      </view>

      <view class="nav-bottom">
        <view class="model-panel" @click="onOpenModelSelector">
          <view class="panel-meta">
            <text class="panel-label">当前模型</text>
            <text class="panel-name">{{ currentModelName }}</text>
          </view>
          <view class="panel-extra">
            <text>切换体验</text>
            <image src="/static/icons/arrow_bottom.png" mode="aspectFit"></image>
          </view>
        </view>

        <view class="primary-btn" @click="onNewConversation">
          <image src="/static/icons/send-outline.svg" mode="aspectFit"></image>
          <view class="btn-text">
            <text class="btn-title">开启新会话</text>
            <text class="btn-caption">空白对话，灵感即刻起飞</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '智元 AI 助手'
  },
  currentModel: {
    type: String,
    default: 'model_a'
  },
  modelList: {
    type: Array,
    default: () => [
      { value: 'model_a', text: '通用模型' },
      { value: 'model_b', text: '专业模型' },
      { value: 'model_c', text: '创意模型' }
    ]
  }
});

const emit = defineEmits(['newConversation', 'viewHistory', 'openModelSelector', 'openMenu']);

// 获取当前模型名称
const currentModelName = computed(() => {
  const model = (props.modelList as Array<{ value: string; text: string }>).find(
    (m) => m.value === props.currentModel
  );
  return model ? model.text : '通用模型';
});

const onNewConversation = () => {
  emit('newConversation');
};

const onViewHistory = () => {
  emit('viewHistory');
};

const onOpenMenu = () => {
  emit('openMenu');
};

const onOpenModelSelector = () => {
  emit('openModelSelector');
};
</script>

<style scoped lang="scss">
.nav-wrapper {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 120;
  padding: calc(var(--status-bar-height, 0) + 18rpx) 24rpx 16rpx;
  background: linear-gradient(180deg, rgba(245, 247, 255, 0.92) 0%, rgba(245, 247, 255, 0) 100%);
  box-sizing: border-box;
}

.nav-shell {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 18rpx 22rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.95);
  border: 1rpx solid rgba(218, 227, 255, 0.7);
  box-shadow: 0 14rpx 28rpx rgba(84, 97, 178, 0.12);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
}

.nav-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.brand-logo {
  width: 60rpx;
  height: 60rpx;
  border-radius: 18rpx;
  box-shadow: 0 10rpx 20rpx rgba(99, 102, 241, 0.18);
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.brand-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #273156;
  letter-spacing: 1.2rpx;
}

.brand-tags {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: rgba(39, 49, 86, 0.55);
}

.tag {
  letter-spacing: 0.8rpx;
}

.dot {
  opacity: 0.5;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(244, 246, 255, 0.9);
  border: 1rpx solid rgba(208, 214, 255, 0.6);
  box-shadow: 0 12rpx 20rpx rgba(84, 97, 178, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  image {
    width: 32rpx;
    height: 32rpx;
    opacity: 0.75;
  }

  .more {
    font-size: 32rpx;
    color: rgba(47, 58, 99, 0.7);
    line-height: 1;
  }

  &:active {
    transform: translateY(3rpx);
    box-shadow: 0 8rpx 16rpx rgba(84, 97, 178, 0.18);
  }
}

.nav-bottom {
  display: flex;
  gap: 14rpx;
  align-items: center;
}

.model-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: linear-gradient(135deg, rgba(244, 246, 255, 0.96), rgba(226, 233, 255, 0.9));
  border: 1rpx solid rgba(197, 210, 255, 0.6);
  box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.5);
}

.panel-meta {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.panel-label {
  font-size: 22rpx;
  color: rgba(51, 59, 96, 0.6);
}

.panel-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #2f3a66;
  letter-spacing: 0.8rpx;
}

.panel-extra {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: rgba(51, 59, 96, 0.55);

  image {
    width: 20rpx;
    height: 20rpx;
    transform: rotate(-90deg);
    opacity: 0.5;
  }
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 12rpx 20rpx;
  border-radius: 22rpx;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #ec4899 100%);
  color: #ffffff;
  box-shadow: 0 18rpx 30rpx rgba(99, 102, 241, 0.22);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  image {
    width: 32rpx;
    height: 32rpx;
    filter: brightness(0) invert(1);
  }

  &:active {
    transform: translateY(3rpx);
    box-shadow: 0 12rpx 18rpx rgba(99, 102, 241, 0.25);
  }
}

.btn-text {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.btn-title {
  font-size: 26rpx;
  font-weight: 600;
}

.btn-caption {
  font-size: 20rpx;
  opacity: 0.8;
}
</style>