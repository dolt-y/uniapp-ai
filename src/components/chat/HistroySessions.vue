<template>
  <view v-if="visible" :class="['overlay', { 'overlay-active': visible }]" @click="handleClose">
    <view :class="['drawer', { 'drawer-open': visible }]" @click.stop>
      <!-- 顶部拖动条 -->
      <view class="drawer-handle">
        <view class="handle-bar"></view>
      </view>

      <view class="drawer-header">
        <view class="title">
          <text>历史会话</text>
          <text class="subtitle">共 {{ sessions.length }} 条</text>
        </view>
        <view class="actions">
          <view class="ghost-btn" @click.stop="refreshSessions">
            <text>{{ loading ? '加载中...' : '刷新' }}</text>
          </view>
        </view>
      </view>

      <view class="drawer-body">
        <view v-if="loading" class="state state-loading">
          <view class="loading-spinner"></view>
          <text>正在获取历史记录...</text>
        </view>
        <view v-else-if="errorMessage" class="state state-error" @click.stop="refreshSessions">
          <text class="error-icon">⚠️</text>
          <text>{{ errorMessage }}，点击重试</text>
        </view>
        <view v-else-if="!sessions.length" class="state state-empty">
          <text class="empty-icon">💬</text>
          <text>暂无历史会话</text>
          <text class="empty-hint">开始新的对话吧</text>
        </view>

        <scroll-view v-else class="drawer-list" scroll-y :style="{ height: listHeight + 'px' }">
          <view v-for="session in sessions" :key="session.id"
            :class="['drawer-item', { active: session.id === props.activeSessionId }]" @click="selectSession(session)">
            <view class="item-header">
              <view class="item-title">{{ session.title || '未命名会话' }}</view>
              <view class="item-badge" v-if="session.id === props.activeSessionId">当前</view>
            </view>
            <view class="item-desc">{{ session.summary || '暂无摘要' }}</view>
            <view class="item-footer">
              <view class="item-time">{{ formatTime(session.created_at) }}</view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import request from '@/utils/request';

type SessionItem = {
  id: number | string;
  title?: string;
  summary?: string;
  created_at?: string;
};

const props = defineProps<{
  visible: boolean;
  activeSessionId?: number | string | null;
}>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'select-session', session: SessionItem): void }>();

const sessions = ref<SessionItem[]>([]);
const listHeight = ref(0);
const loading = ref(false);
const errorMessage = ref('');

function handleClose() {
  emit('close');
}

function selectSession(session: SessionItem) {
  emit('select-session', session);
  handleClose();
}

function formatTime(time?: string) {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于1分钟
  if (diff < 60000) return '刚刚';
  // 小于1小时
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  // 小于24小时
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  // 小于7天
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;

  // 否则显示完整日期
  const pad = (val: number) => String(val).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function fetchSessions() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res: any = await request('http://localhost:3000/api/ai/sessions');
    sessions.value = res?.sessions ?? [];
  } catch (err) {
    console.error('获取会话失败', err);
    errorMessage.value = '获取会话失败';
  } finally {
    loading.value = false;
  }
}

function refreshSessions() {
  if (loading.value) return;
  fetchSessions();
}

function updateListHeight() {
  uni.getSystemInfo({
    success: (info) => {
      // 底部弹窗最大高度为屏幕高度的70%，减去header和handle的高度
      listHeight.value = info.windowHeight * 0.7 - 180;
    }
  });
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      fetchSessions();
      updateListHeight();
    }
  }
);

onMounted(() => {
  if (props.visible) {
    fetchSessions();
    updateListHeight();
  }
});
</script>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.overlay-active {
  opacity: 1;
  pointer-events: auto;
}

.drawer {
  width: 100%;
  max-height: 70vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.12);
  border-radius: 32rpx 32rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.drawer-open {
  transform: translateY(0);
}

.drawer-handle {
  display: flex;
  justify-content: center;
  padding: 24rpx 0 16rpx;
  cursor: grab;
}

.handle-bar {
  width: 80rpx;
  height: 8rpx;
  background: #e2e8f0;
  border-radius: 999rpx;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 32rpx 24rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.title {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: #0f172a;

  .subtitle {
    font-size: 24rpx;
    color: #64748b;
    font-weight: 400;
  }
}

.actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.ghost-btn {
  padding: 12rpx 28rpx;
  border-radius: 20rpx;
  background: #f1f5f9;
  color: #475569;
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.2s ease;

  &:active {
    background: #e2e8f0;
    transform: scale(0.96);
  }
}

.drawer-body {
  padding: 24rpx 32rpx 40rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.state {
  padding: 80rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  text-align: center;
  color: #64748b;
  font-size: 28rpx;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon {
  font-size: 64rpx;
  margin-bottom: 8rpx;
}

.state-error {
  color: #dc2626;
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
}

.empty-hint {
  font-size: 24rpx;
  color: #94a3b8;
  margin-top: 8rpx;
}

.drawer-list {
  flex: 1;
  padding-right: 8rpx;
}

.drawer-item {
  padding: 28rpx 24rpx;
  margin-bottom: 16rpx;
  border-radius: 20rpx;
  background: #f8fafc;
  border: 2rpx solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.98);
  }

  &.active {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.1);
  }
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.item-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-badge {
  padding: 4rpx 16rpx;
  background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 500;
  border-radius: 12rpx;
  margin-left: 16rpx;
  flex-shrink: 0;
}

.item-desc {
  font-size: 26rpx;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-time {
  font-size: 22rpx;
  color: #94a3b8;
}
</style>