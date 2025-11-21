<template>
  <view class="chat-page">
    <view class="page-background">
      <view class="bg-gradient"></view>
      <view class="bg-glow-left"></view>
      <view class="bg-glow-right"></view>
      <view class="bg-noise"></view>
    </view>

    <NavBar :current-model="selectedModel" :model-list="models" @new-conversation="handleNewConversation"
      @view-history="handleViewHistory" @open-model-selector="openModelSelector" @open-menu="openFunctionMenu" />

    <view class="chat-body">
      <scroll-view class="message-scroll" :bounces="false" scroll-y :scroll-with-animation="true"
        :show-scrollbar="false" :scroll-into-view="scrollTargetId" enable-back-to-top>
        <view class="message-feed">
          <view v-if="showWelcomeCard" class="welcome-card">
            <text class="welcome-title">准备好开始了吗？</text>
            <text class="welcome-body">
              输入你的目标、受众和期望格式，我会帮你拆解任务并给出高质量输出建议。
            </text>
            <view class="welcome-tags">
              <view class="tag">写作灵感</view>
              <view class="tag">方案优化</view>
              <view class="tag">学习规划</view>
            </view>
          </view>

          <MessageItem v-for="message in messages" :key="message.id" :message="message"
            @preview-image="handlePreviewImage" />

          <view v-if="isAssistantTyping" class="typing-item" :id="typingAnchorId">
            <view class="typing-avatar">AI</view>
            <view class="typing-bubble">
              <text class="typing-label">正在组织语言</text>
              <view class="typing-dots">
                <view class="dot"></view>
                <view class="dot"></view>
                <view class="dot"></view>
              </view>
            </view>
          </view>

          <view :id="bottomAnchorId" class="scroll-anchor"></view>
        </view>
      </scroll-view>

      <view class="utility-bar">
        <view class="utility-chip" @click="toggleQuickReplies">
          <text>{{ quickRepliesVisible ? '收起推荐提问' : '展开推荐提问' }}</text>
        </view>
        <view class="utility-metrics">
          <view class="metric">
            <text class="metric-label">最近响应</text>
            <text class="metric-value">{{ lastInteractionLabel }}</text>
          </view>
          <view class="metric">
            <text class="metric-label">会话时长</text>
            <text class="metric-value">{{ conversationDurationLabel }}</text>
          </view>
        </view>
      </view>

      <QuickReply v-if="quickRepliesVisible && quickReplies.length" :quick-replies="quickReplies"
        @quick-reply="handleQuickReply" />
    </view>

    <view class="composer-container">
      <InputArea v-model="inputValue" :is-recording="isRecording" :recording-duration="recordingDuration"
        @send-message="handleSendMessage" @upload-image="handleImageUpload" @start-recording="startRecording"
        @stop-recording="stopRecording" @handle-recording-move="handleRecordingMove" />
    </view>

    <RecordingIndicator v-if="isRecording" :is-recording="isRecording" :duration="recordingDuration"
      :is-cancel="recordingCancel" @cancel="cancelRecording" />

    <FunctionMenu :visible="functionMenuVisible" @close="functionMenuVisible = false" @clear-chat="handleClearChat"
      @show-settings="handleShowSettings" @show-about="handleShowAbout" />

    <CustomToast ref="toastRef" />
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app';
import NavBar from '@/components/nav-bar.vue';
import MessageItem from '@/components/chat/MessageItem.vue';
import InputArea from '@/components/chat/InputArea.vue';
import QuickReply from '@/components/chat/QuickReply.vue';
import FunctionMenu from '@/components/chat/FunctionMenu.vue';
import RecordingIndicator from '@/components/chat/RecordingIndicator.vue';
import CustomToast from '@/components/chat/CustomToast.vue';
import streamRequest from '@/utils/streamRequest.js';
interface ChatMessage {
  id: number;
  role: 'assistant' | 'user';
  type: 'text' | 'image';
  content: string;
  status?: 'pending' | 'success' | 'error';
  timestamp: number;
  quoted?: {
    id: number;
    role: 'assistant' | 'user';
    content: string;
  } | null;
}
interface ModelOption {
  value: string;
  text: string;
}

type ToastExpose = {
  showToast: (options: { message: string; type?: 'success' | 'error' | 'warning' | 'info'; duration?: number }) => void;
  hideToast: () => void;
  clearTimer: () => void;
};

const models = ref<ModelOption[]>([
  { value: 'model_a', text: '通用模型 A' },
  { value: 'model_b', text: '专业模型 B' },
  { value: 'model_c', text: '创意模型 C' },
  { value: 'model_d', text: '效率模型 D' }
]);
const selectedModel = ref<string>('model_a');

const messageIdSeed = ref<number>(0);
const bottomAnchorId = 'chat-bottom-anchor';
const typingAnchorId = 'chat-typing-anchor';

const messages = ref<ChatMessage[]>([]);
const inputValue = ref<string>('');
const isAssistantTyping = ref<boolean>(false);
const scrollTargetId = ref<string>('');
const quickRepliesVisible = ref<boolean>(true);
const quickReplies = ref<string[]>([
  '帮我总结一下今天的任务重点，分条列出',
  '用轻松的语气写一段咖啡新品宣传文案',
  '为我制定一个一周的健身计划',
  '请给出一个营销推广的行动清单'
]);

const functionMenuVisible = ref<boolean>(false);
const isRecording = ref<boolean>(false);
const recordingDuration = ref<number>(0);
const recordingCancel = ref<boolean>(false);
let recordingTimer: ReturnType<typeof setInterval> | null = null;

const conversationStartedAt = ref<number>(Date.now());
const lastUserMessage = ref<ChatMessage | null>(null);

const toastRef = ref<ToastExpose | null>(null);

const messageCount = computed(() => messages.value.length);
const selectedModelName = computed(() => {
  return models.value.find((m) => m.value === selectedModel.value)?.text ?? '通用模型';
});
const todayLabel = computed(() => formatDate(conversationStartedAt.value));
const showWelcomeCard = computed(() => messages.value.length <= 1);
const lastInteractionLabel = computed(() => {
  if (!messages.value.length) {
    return '尚未互动';
  }
  return formatRelativeTime(messages.value[messages.value.length - 1].timestamp);
});
const conversationDurationLabel = computed(() => {
  return formatDuration(Date.now() - conversationStartedAt.value);
});

const initializeConversation = () => {
  messageIdSeed.value = 0;
  conversationStartedAt.value = Date.now();
  messages.value = [createAssistantGreeting()];
  scrollToBottom();
};

initializeConversation();

function nextMessageId(): number {
  messageIdSeed.value += 1;
  return messageIdSeed.value;
}

function createAssistantGreeting(): ChatMessage {
  return {
    id: nextMessageId(),
    role: 'assistant',
    type: 'text',
    content: '你好，我是你的 AI 助手。随时告诉我你的想法，我会帮你整理、发散并给出下一步建议。',
    status: 'success',
    timestamp: Date.now(),
    quoted: null
  };
}

function scrollToBottom(targetId?: string) {
  nextTick(() => {
    scrollTargetId.value = targetId ?? bottomAnchorId;
  });
}

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  toastRef.value?.showToast({ message, type, duration: 2200 });
}

async function handleSendMessage(rawContent?: string) {
  const content = (rawContent ?? inputValue.value).trim();
  if (!content) {
    showToast('请输入要发送的内容', 'warning');
    return;
  }
  if (isAssistantTyping.value) {
    showToast('AI 正在回复，请稍候', 'info');
    return;
  }

  const userMessage: ChatMessage = {
    id: nextMessageId(),
    role: 'user',
    type: 'text',
    content,
    status: 'pending',
    timestamp: Date.now(),
    quoted: null
  };

  messages.value.push(userMessage);
  lastUserMessage.value = userMessage;
  inputValue.value = '';
  scrollToBottom(`message-${userMessage.id}`);

  await streamAssistantReply(userMessage, content);
}

function streamAssistantReply(userMessage, originalText) {
  isAssistantTyping.value = true;

  const assistantMessage: ChatMessage = {
    id: nextMessageId(),
    role: 'assistant',
    type: 'text',
    content: '',
    status: 'pending',
    timestamp: Date.now(),
    quoted: {
      id: userMessage.id,
      role: 'user',
      content: originalText
    }
  };

  messages.value.push(assistantMessage);
  scrollToBottom(`message-${assistantMessage.id}`);

  return new Promise<void>((resolve) => {

    streamRequest({
      url: 'http://localhost:3000/api/ai/chat',
      data: {
        messages: [
          { role: 'user', content: originalText }
        ],
        stream: true
      },

      onMessage(payload) {
        assistantMessage.content += payload;
        messages.value = [...messages.value];
        scrollToBottom(`message-${assistantMessage.id}`);
      },

      onDone() {
        assistantMessage.status = 'success';
        messages.value = [...messages.value];
        isAssistantTyping.value = false;
        resolve();
      },

      onError(err: any) {
        assistantMessage.status = 'error';
        showToast('AI 服务异常，请稍后再试', 'error');
        isAssistantTyping.value = false;
        console.error('SSE 出错:', err);
      }
    });

  });
}


// function generateAssistantReply(question: string): string {
//   return `【${selectedModelName.value}】

// 我理解到你正在关注：「${question}」。

// 以下是我为你整理的关键建议：
// 1. 明确目标与限制条件，确保执行路径清晰；
// 2. 列出需要的信息输入与产出格式，方便快速迭代；
// 3. 将工作拆分为 3 个以内的阶段，每个阶段都留下复盘空间；

// 如需我继续展开某个环节，直接告诉我即可。`;
// }

function handleQuickReply(reply: string) {
  handleSendMessage(reply);
}

function toggleQuickReplies() {
  quickRepliesVisible.value = !quickRepliesVisible.value;
}

function handleImageUpload(filePath: string) {
  const imageMessage: ChatMessage = {
    id: nextMessageId(),
    role: 'user',
    type: 'image',
    content: filePath,
    status: 'success',
    timestamp: Date.now(),
    quoted: null
  };

  messages.value.push(imageMessage);
  scrollToBottom(`message-${imageMessage.id}`);
  showToast('已收到图片，目前仅支持保存，解析功能即将上线', 'info');
}

function handlePreviewImage(imageUrl: string) {
  uni.previewImage({
    urls: [imageUrl],
    current: imageUrl
  });
}

function handleNewConversation() {
  uni.showModal({
    title: '新的灵感会话',
    content: '确认开始新的会话？当前聊天记录将被清空。',
    confirmText: '开始新会话',
    cancelText: '保留',
    success: (res) => {
      if (res.confirm) {
        initializeConversation();
        quickRepliesVisible.value = true;
        showToast('新的对话已准备好', 'success');
      }
    }
  });
}

function handleViewHistory() {
  showToast('历史记录面板正在设计中，敬请期待', 'info');
}

function openModelSelector() {
  const itemList = models.value.map((item) => item.text);
  uni.showActionSheet({
    itemList,
    success: (result) => {
      const index = result.tapIndex;
      if (typeof index === 'number' && models.value[index]) {
        selectedModel.value = models.value[index].value;
        showToast(`模型已切换至 ${models.value[index].text}`, 'success');
      }
    }
  });
}

function openFunctionMenu() {
  functionMenuVisible.value = true;
}

function handleClearChat() {
  functionMenuVisible.value = false;
  initializeConversation();
  showToast('聊天记录已清空', 'success');
}

function handleShowSettings() {
  showToast('设置中心即将上线', 'info');
}

function handleShowAbout() {
  functionMenuVisible.value = false;
  uni.showModal({
    title: '关于智元 AI 助手',
    content: '这是一个面向效率与灵感的智能助手，支持文本、图片与语音多模态交互。我们正在持续打磨体验，让你的每次提问都更丝滑。',
    showCancel: false,
    confirmText: '知道了'
  });
}

function startRecording() {
  if (isRecording.value) return;
  isRecording.value = true;
  recordingDuration.value = 0;
  recordingCancel.value = false;
  recordingTimer = setInterval(() => {
    recordingDuration.value += 1;
  }, 1000);
}

function stopRecording() {
  if (!isRecording.value) return;
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
  const cancelled = recordingCancel.value;
  isRecording.value = false;
  recordingDuration.value = 0;
  recordingCancel.value = false;
  showToast(cancelled ? '录音已取消' : '语音输入功能即将上线', cancelled ? 'warning' : 'info');
}

function cancelRecording() {
  recordingCancel.value = true;
  stopRecording();
}

function handleRecordingMove(event: any) {
  if (!isRecording.value) return;
  const touch = event?.touches?.[0] ?? event?.changedTouches?.[0];
  if (touch && typeof touch.clientY === 'number') {
    recordingCancel.value = touch.clientY < 120;
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${month}月${day}日 · ${weekdays[date.getDay()]}`;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) {
    return '刚刚';
  }
  if (diff < 3_600_000) {
    return `${Math.floor(diff / 60_000)} 分钟前`;
  }
  if (diff < 86_400_000) {
    return `${Math.floor(diff / 3_600_000)} 小时前`;
  }
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDuration(duration: number): string {
  const minutes = Math.floor(duration / 60_000);
  const seconds = Math.floor((duration % 60_000) / 1000);
  if (minutes === 0) {
    return `${seconds} 秒`;
  }
  return `${minutes} 分 ${seconds} 秒`;
}

onLoad(() => {
  scrollToBottom();
});

onShow(() => {
  scrollToBottom();
});

onUnload(() => {
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
});
</script>

<style scoped lang="scss">
.chat-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.page-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--color-bg-primary) 0%, var(--color-bg-card) 60%, var(--color-bg-primary) 100%);
}

.bg-glow-left {
  position: absolute;
  top: -120rpx;
  left: -80rpx;
  width: 360rpx;
  height: 360rpx;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%);
}

.bg-glow-right {
  position: absolute;
  bottom: 120rpx;
  right: -120rpx;
  width: 380rpx;
  height: 380rpx;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.16) 0%, transparent 70%);
}

.bg-noise {
  position: absolute;
  inset: 0;
  opacity: 0.06;
  background-image: linear-gradient(90deg, rgba(99, 102, 241, 0.12) 1px, transparent 0), linear-gradient(rgba(129, 140, 248, 0.12) 1px, transparent 0);
  background-size: 24rpx 24rpx;
  mix-blend-mode: soft-light;
}

.chat-body {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 28rpx 24rpx 20rpx;
  gap: 28rpx;
  box-sizing: border-box;
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg-card);
  border-radius: 32rpx;
  padding: 28rpx 30rpx;
  box-shadow: var(--shadow-soft);
  border: 1rpx solid var(--color-border-subtle);
}

.session-title {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.session-name {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: 2.2rpx;
}

.session-date {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  letter-spacing: 1rpx;
}

.session-badges {
  display: flex;
  gap: 14rpx;
}

.badge {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(99, 102, 241, 0.08);
  color: var(--color-text-primary);
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 0.6rpx;
}

.badge-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;

  &.primary {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  }

  &.success {
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  }
}

.message-scroll {
  flex: 1;
  background: var(--color-bg-elevated);
  border-radius: 36rpx;
  padding: 32rpx 26rpx;
  box-shadow: var(--shadow-strong);
  border: 1rpx solid var(--color-border-subtle);
  box-sizing: border-box;
}

.message-feed {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.welcome-card {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  padding: 24rpx 26rpx;
  border-radius: 28rpx;
  background: var(--color-bg-soft);
  border: 1rpx solid var(--color-border-soft);
  box-shadow: var(--shadow-soft);
}

.welcome-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: 0.8rpx;
}

.welcome-body {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.welcome-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.welcome-tags .tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(99, 102, 241, 0.12);
  color: var(--color-text-primary);
  font-size: 22rpx;
  letter-spacing: 0.6rpx;
}

.typing-item {
  display: flex;
  align-items: flex-end;
  gap: 18rpx;
  padding: 6rpx 12rpx;
}

.typing-avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 22rpx;
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-strong) 100%);
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: var(--shadow-strong);
}

.typing-bubble {
  padding: 22rpx 28rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, rgba(129, 140, 248, 0.16), rgba(236, 233, 255, 0.18));
  display: flex;
  align-items: center;
  gap: 20rpx;
  color: var(--color-text-secondary);
  font-size: 26rpx;
  letter-spacing: 0.8rpx;
  box-shadow: var(--shadow-soft);
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.typing-dots .dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.82);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots .dot:nth-child(2) {
  animation-delay: 0.18s;
}

.typing-dots .dot:nth-child(3) {
  animation-delay: 0.36s;
}

.scroll-anchor {
  height: 12rpx;
}

.utility-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 26rpx;
  border-radius: 26rpx;
  background: var(--color-bg-card);
  border: 1rpx solid var(--color-border-subtle);
  box-shadow: var(--shadow-soft);
}

.utility-chip {
  padding: 16rpx 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(129, 140, 248, 0.16), rgba(236, 233, 255, 0.12));
  color: var(--color-text-primary);
  font-size: 26rpx;
  font-weight: 600;
  letter-spacing: 0.6rpx;
}

.utility-metrics {
  display: flex;
  gap: 24rpx;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6rpx;
}

.metric-label {
  font-size: 22rpx;
  color: var(--color-text-secondary);
  letter-spacing: 0.6rpx;
}

.metric-value {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--color-text-primary);
}

.composer-container {
  position: sticky;
  bottom: 0;
  padding: 0 24rpx 32rpx;
  background: linear-gradient(180deg, transparent 0%, var(--color-bg-primary) 60%, var(--color-bg-card) 100%);
  backdrop-filter: blur(16rpx);
  -webkit-backdrop-filter: blur(16rpx);
  z-index: 2;
}

@media (max-width: 720rpx) {
  .chat-body {
    padding: 20rpx 18rpx 16rpx;
    gap: 20rpx;
  }

  .session-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14rpx;
    padding: 22rpx;
  }

  .utility-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 16rpx;
  }

  .utility-metrics {
    width: 100%;
    justify-content: space-between;
  }
}

@keyframes typing {

  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.4;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>