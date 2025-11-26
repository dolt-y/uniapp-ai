<template>
  <view v-if="visible" :class="['overlay', { 'overlay-active': visible }]" @click="handleClose">
    <view :class="['drawer', { 'drawer-open': visible }]" @click.stop>
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
              <view class="item-actions">
                <view class="delete-btn" @click.stop="confirmDelete(session)"
                  :class="{ 'deleting': deletingId === session.id }">
                  <view class="delete-icon"></view>
                </view>
              </view>
            </view>
            <view class="item-desc">{{ session.summary || '暂无摘要' }}</view>
            <view class="item-footer">
              <view class="item-time">{{ formatTime(session.updated_at) }}</view>
            </view>
          </view>
        </scroll-view>
      </view>
      <view v-if="showDeleteConfirm" class="confirm-overlay" @click="cancelDelete">
        <view class="confirm-dialog" @click.stop>
          <view class="confirm-header">
            <text class="confirm-title">确认删除</text>
          </view>
          <view class="confirm-body">
            <text class="confirm-text">确定要删除会话"{{ deleteTarget?.title || '未命名会话' }}"吗？</text>
            <text class="confirm-hint">此操作无法撤销</text>
          </view>
          <view class="confirm-actions">
            <view class="confirm-btn cancel-btn" @click="cancelDelete">
              <text>取消</text>
            </view>
            <view class="confirm-btn delete-confirm-btn" @click="deleteSession">
              <text>{{ deletingId ? '删除中...' : '删除' }}</text>
            </view>
          </view>
        </view>
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
  updated_at?: string;
};

const props = defineProps<{
  visible: boolean;
  activeSessionId?: number | string | null;
}>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select-session', session: SessionItem): void;
  (e: 'delete-session', sessionId: number | string): void;
}>();

const sessions = ref<SessionItem[]>([]);
const listHeight = ref(0);
const loading = ref(false);
const errorMessage = ref('');

const showDeleteConfirm = ref(false);
const deleteTarget = ref<SessionItem | null>(null);
const deletingId = ref<number | string | null>(null);

function confirmDelete(session: SessionItem) {
  deleteTarget.value = session;
  showDeleteConfirm.value = true;
}

function cancelDelete() {
  showDeleteConfirm.value = false;
  deleteTarget.value = null;
}

function handleClose() {
  emit('close');
}

function selectSession(session: SessionItem) {
  emit('select-session', session);
  handleClose();
}

function formatTime(time?: string) {
  if (!time) return '';

  const safeTime = time.replace(/-/g, '/');

  const date = new Date(safeTime);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;

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
async function deleteSession() {
  if (!deleteTarget.value || deletingId.value) return;

  const sessionId = deleteTarget.value.id;
  deletingId.value = sessionId;

  try {
    await request(`http://localhost:3000/api/ai/sessions/${sessionId}/delete`, {}, "POST",);
    sessions.value = sessions.value.filter(s => s.id !== sessionId);
    emit('delete-session', sessionId);

    uni.showToast({
      title: '删除成功',
      icon: 'success',
      duration: 2000
    });
  } catch (err) {
    console.error('删除会话失败', err);
    uni.showToast({
      title: '删除失败',
      icon: 'none',
      duration: 2000
    });
  } finally {
    deletingId.value = null;
    showDeleteConfirm.value = false;
    deleteTarget.value = null;
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
  width: 70%;
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

.item-actions {
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}

.delete-btn {
  width: 58rpx;
  height: 58rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.9);
    background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  }

  &.deleting {
    opacity: 0.5;
    pointer-events: none;
  }
}

.delete-icon {
  width: 32rpx;
  height: 32rpx;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23dc2626' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='3 6 5 6 21 6'%3E%3C/polyline%3E%3Cpath d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'%3E%3C/path%3E%3Cline x1='10' y1='11' x2='10' y2='17'%3E%3C/line%3E%3Cline x1='14' y1='11' x2='14' y2='17'%3E%3C/line%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;

  .confirm-dialog {
    width: 600rpx;
    background: #ffffff;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .confirm-header {
    padding: 40rpx 32rpx 24rpx;
    border-bottom: 1rpx solid #f1f5f9;

    .confirm-title {
      font-size: 36rpx;
      font-weight: 700;
      color: #0f172a;
    }
  }

  .confirm-body {
    padding: 32rpx;
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .confirm-text {
      font-size: 28rpx;
      color: #334155;
      line-height: 1.6;
    }

    .confirm-hint {
      font-size: 24rpx;
      color: #94a3b8;
    }
  }

  .confirm-actions {
    display: flex;
    gap: 16rpx;
    padding: 24rpx 32rpx 32rpx;

    .confirm-btn {
      flex: 1;
      padding: 24rpx;
      border-radius: 16rpx;
      font-size: 28rpx;
      font-weight: 600;
      text-align: center;
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.96);
      }
    }

    .cancel-btn {
      background: #f1f5f9;
      color: #64748b;

      &:active {
        background: #e2e8f0;
      }
    }

    .delete-confirm-btn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #ffffff;

      &:active {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(40rpx);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>