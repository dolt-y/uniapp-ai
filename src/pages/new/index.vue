<template>
  <view class="chat-container">
    <!-- 聊天消息列表 -->
    <scroll-view class="message-list" scroll-y :scroll-into-view="scrollToView" @scrolltoupper="loadMoreHistory"
      :enable-flex="true">
      <!-- 历史加载指示器 -->
      <view v-if="showHistoryLoading" class="history-loading">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载历史消息...</text>
      </view>

      <!-- 日期分隔线和消息项组件 -->
      <view v-for="(dateGroup, dateIndex) in groupedMessages" :key="dateIndex">
        <view class="date-divider">
          <text>{{ formatDateHeader(dateGroup.date) }}</text>
        </view>
        <!-- 使用MessageItem组件 -->
        <MessageItem 
          v-for="(msg, msgIndex) in dateGroup.messages" 
          :key="msgIndex" 
          :message="msg"
          :id="`message-${msg.timestamp}`"
          @preview-image="previewImage"
        />
      </view>

      <!-- AI 正在输入动画 -->
      <view v-if="isTyping" class="message-item ai-message typing-item">
        <view class="avatar">
          <image class="avatar-img" src="/static/logo.png" mode="aspectFill"></image>
        </view>
        <view class="message-wrapper">
          <view class="message-name">AI助手</view>
          <view class="message-bubble typing-bubble">
            <view class="typing-dots">
              <view class="dot"></view>
              <view class="dot"></view>
              <view class="dot"></view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 快捷回复组件 -->
    <QuickReply 
      v-if="showQuickReplies" 
      :quick-replies="quickReplies"
      @quick-reply="sendQuickReply"
    />

    <!-- 输入区域组件 -->
    <InputArea 
      @send-message="sendMessage"
      @upload-image="handleImageUpload"
      @toggle-voice="toggleVoiceInput"
      :is-voice-input="isVoiceInput"
      :can-send="canSend"
      :is-recording="isRecording"
      :recording-duration="recordingDuration"
      @start-recording="startRecording"
      @stop-recording="stopRecording"
      @handle-recording-move="handleRecordingMove"
    />

    <!-- 录音状态指示器组件 -->
    <RecordingIndicator 
      :is-recording="isRecording"
      :is-cancel="isCancelRecording"
      :duration="recordingDuration"
    />

    <!-- Toast组件 -->
    <CustomToast 
      :show="showToast"
      :message="toastMessage"
      :icon="toastIcon"
    />

    <!-- 功能菜单组件 -->
    <FunctionMenu 
      :visible="showFunctionMenu"
      @close="hideFunctionMenu"
      @clear-chat="clearChatHistory"
      @show-settings="showSettings"
      @show-about="showAbout"
    />

    <!-- 浮动菜单按钮 -->
    <view class="menu-float-btn" @click="showFunctionMenu = true">
      <text>…</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch, getCurrentInstance, nextTick } from 'vue';
import { useRouter } from 'vue-router';

// 导入组件
import MessageItem from '@/components/chat/MessageItem.vue';
import QuickReply from '@/components/chat/QuickReply.vue';
import InputArea from '@/components/chat/InputArea.vue';
import CustomToast from '@/components/chat/CustomToast.vue';
import FunctionMenu from '@/components/chat/FunctionMenu.vue';
import RecordingIndicator from '@/components/chat/RecordingIndicator.vue';

// 路由
const router = useRouter();

// 状态管理
const messages = ref([]);
const inputText = ref('');
const isTyping = ref(false);
const showQuickReplies = ref(true);
const scrollToView = ref('');
const showHistoryLoading = ref(false);
const isVoiceInput = ref(false);
const isRecording = ref(false);
const isCancelRecording = ref(false);
const recordingDuration = ref(0);
const recordingTimer = ref(null);
const showToast = ref(false);
const toastMessage = ref('');
const toastIcon = ref('');
const showFunctionMenu = ref(false);
const selectedMessage = ref(null);

// 快捷回复列表
const quickReplies = [
  '如何提高工作效率？',
  '推荐几本好书',
  '今天天气怎么样？',
  '帮我写一个自我介绍'
];

// Mock 响应数据
const mockResponses = [
  {
    query: '如何提高工作效率？',
    response: '提高工作效率的几个实用技巧：\n1. **番茄工作法**：25分钟专注工作，5分钟休息\n2. **四象限法则**：区分紧急重要的任务\n3. **减少干扰**：关闭社交媒体通知\n4. **批量处理**：相似任务集中处理\n5. **定期休息**：保持精力充沛'
  },
  {
    query: '推荐几本好书',
    response: '根据您的兴趣，推荐以下几本经典书籍：\n1. 《原子习惯》- 詹姆斯·克利尔\n2. 《思考，快与慢》- 丹尼尔·卡尼曼\n3. 《人类简史》- 尤瓦尔·赫拉利\n4. 《原则》- 雷·达里奥\n5. 《被讨厌的勇气》- 岸见一郎'
  },
  {
    query: '今天天气怎么样？',
    response: '今天天气晴朗，温度适宜，非常适合户外活动。建议您可以：\n- 外出散步\n- 进行户外运动\n- 享受阳光\n记得做好防晒措施哦！'
  },
  {
    query: '帮我写一个自我介绍',
    response: '【自我介绍模板】\n\n大家好，我是[您的姓名]，很高兴认识大家。\n\n我目前在[公司/学校]担任[职位/专业]，主要负责[工作内容/学习方向]。我擅长[技能/领域]，曾参与过[项目/活动]。\n\n在业余时间，我喜欢[兴趣爱好]，这不仅丰富了我的生活，也让我学会了[收获]。\n\n希望能在这里结识更多志同道合的朋友，共同学习进步！'
  },
  {
    query: '什么是人工智能？',
    response: '人工智能（Artificial Intelligence，简称AI）是计算机科学的一个分支，旨在开发能够模拟人类智能行为的系统。\n\n人工智能的主要特点包括：\n- **机器学习**：通过数据学习和改进\n- **自然语言处理**：理解和生成人类语言\n- **计算机视觉**：识别和理解图像\n- **问题解决**：分析问题并提供解决方案\n\n人工智能已广泛应用于语音助手、图像识别、推荐系统等领域。'
  },
  {
    query: '讲个笑话',
    response: '为什么程序员总是分不清万圣节和圣诞节？\n\n因为 Oct 31 = Dec 25 （八进制31等于十进制25）'
  }
];

// 计算属性
const canSend = computed(() => {
  return inputText.value.trim().length > 0;
});

// 按日期分组消息
const groupedMessages = computed(() => {
  if (!messages.value.length) return [];

  const groups = {};

  messages.value.forEach(msg => {
    const date = new Date(msg.timestamp);
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateKey,
        messages: []
      };
    }

    groups[dateKey].messages.push(msg);
  });

  return Object.values(groups).sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
});

// 初始化
onMounted(() => {
  addWelcomeMessage();
  
  // 监听小程序返回按钮
  uni.onBackPress(handleBackPress);
});

// 页面卸载时清理事件监听
onUnmounted(() => {
  uni.offBackPress(handleBackPress);
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value);
  }
});

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  nextTick(() => {
    if (messages.value.length > 0) {
      // 延迟设置滚动目标，确保DOM已更新
      setTimeout(() => {
        scrollToView.value = `message-${messages.value[messages.value.length - 1].timestamp}`;
      }, 100);
    }
  });
}, { deep: true });

// 添加欢迎消息
function addWelcomeMessage() {
  const welcomeMsg = {
    role: 'assistant',
    type: 'text',
    content: '您好！我是您的AI助手，很高兴为您提供帮助。请问有什么我可以为您解答的问题吗？',
    timestamp: Date.now()
  };
  messages.value.push(welcomeMsg);
}

// 发送消息
function sendMessage() {
  if (!canSend.value || isRecording.value) return;

  const userMsg = {
    role: 'user',
    type: 'text',
    content: inputText.value.trim(),
    timestamp: Date.now(),
    quoted: selectedMessage.value
  };

  messages.value.push(userMsg);
  inputText.value = '';
  showQuickReplies.value = false;
  selectedMessage.value = null;

  simulateAIResponse(userMsg);
}

// 发送快捷回复
function sendQuickReply(reply) {
  inputText.value = reply;
  sendMessage();
}

// 模拟AI回复
function simulateAIResponse(userMsg) {
  isTyping.value = true;

  // 查找匹配的mock响应
  let matchedResponse = null;
  const query = userMsg.content;

  for (let i = 0; i < mockResponses.length; i++) {
    const item = mockResponses[i];
    if (query.includes(item.query) || item.query.includes(query)) {
      matchedResponse = item;
      break;
    }
  }

  // 模拟打字延迟
  const delay = 1500 + Math.random() * 1000;

  setTimeout(() => {
    isTyping.value = false;

    const aiMsg = {
      role: 'assistant',
      type: 'text',
      content: matchedResponse ? matchedResponse.response : '抱歉，我暂时无法理解您的问题，请尝试其他方式提问。',
      timestamp: Date.now(),
      quoted: userMsg
    };

    messages.value.push(aiMsg);

    // 回复后显示快捷回复
    setTimeout(() => {
      if (!isTyping.value && !inputText.value.trim()) {
        showQuickReplies.value = true;
      }
    }, 2000);
  }, delay);
}

// 格式化消息内容
function formatMessageContent(content) {
  return content
    .replace(/\n/g, '<br/>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>')
    .replace(/^(\d+)\. (.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 5px; list-style-type: decimal;">$2</li>');
}

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 格式化日期标题
function formatDateHeader(dateKey) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(dateKey);

  if (date.toDateString() === today.toDateString()) {
    return '今天';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
}

// 图片上传
function handleImageUpload() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];

      // 发送图片消息
      const imageMsg = {
        role: 'user',
        type: 'image',
        content: tempFilePath,
        timestamp: Date.now()
      };

      messages.value.push(imageMsg);
      showQuickReplies.value = false;

      // 模拟AI回复
      setTimeout(() => {
        isTyping.value = true;
        setTimeout(() => {
          isTyping.value = false;
          const aiMsg = {
            role: 'assistant',
            type: 'text',
            content: '我已收到您发送的图片。这张图片看起来很有趣！您想了解关于这张图片的什么信息，或者需要我对图片内容进行分析吗？',
            timestamp: Date.now(),
            quoted: imageMsg
          };
          messages.value.push(aiMsg);
        }, 1500);
      }, 500);
    }
  });
}

// 预览图片
function previewImage(imageUrl) {
  uni.previewImage({
    urls: [imageUrl],
    current: imageUrl
  });
}

// 加载历史消息
function loadMoreHistory() {
  if (showHistoryLoading.value) return;
  showHistoryLoading.value = true;
  setTimeout(() => {
    showHistoryLoading.value = false;
    showToastMsg('没有更多历史消息了', 'ℹ️');
  }, 1000);
}

// 显示Toast提示
function showToastMsg(message, icon = 'ℹ️') {
  toastMessage.value = message;
  toastIcon.value = icon;
  showToast.value = true;
  
  setTimeout(() => {
    showToast.value = false;
  }, 1000);
}

// 处理系统返回按钮
function handleBackPress() {
  if (isRecording.value) {
    stopRecording();
    return;
  }
  if (showFunctionMenu.value) {
    showFunctionMenu.value = false;
    return;
  }
  router.back();
}

// 清除聊天记录
function clearChatHistory() {
  showFunctionMenu.value = false;
  uni.showModal({
    title: '确认清除',
    content: '确定要清除所有聊天记录吗？',
    success: (modalRes) => {
      if (modalRes.confirm) {
        messages.value = [];
        addWelcomeMessage();
        showToastMsg('聊天记录已清除', '✅');
      }
    }
  });
}

// 显示设置
function showSettings() {
  showFunctionMenu.value = false;
  showToastMsg('设置功能开发中', '⚙️');
}

// 显示关于
function showAbout() {
  showFunctionMenu.value = false;
  showToastMsg('AI助手 v1.0.0', 'ℹ️');
}

// 语音相关方法
function startRecording() {
  isRecording.value = true;
  isCancelRecording.value = false;
  recordingDuration.value = 0;
  recordingTimer.value = setInterval(() => {
    recordingDuration.value++;
  }, 1000);
}

function handleRecordingMove(event) {
  if (!isRecording.value) return;
  const touchY = event.touches[0].clientY;
  const startY = event.currentTarget.offsetTop;
  isCancelRecording.value = touchY < startY - 80;
}

function stopRecording() {
  if (!isRecording.value) return;
  const shouldCancel = isCancelRecording.value;
  isRecording.value = false;
  isCancelRecording.value = false;
  
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value);
    recordingTimer.value = null;
  }
  
  if (recordingDuration.value > 1 && !shouldCancel) {
    const recognizedText = `语音输入内容 (${recordingDuration.value}秒)`;
    inputText.value = recognizedText;
    sendMessage();
  } else if (recordingDuration.value <= 1) {
    showToastMsg('录音时间太短', '⏱️');
  } else if (shouldCancel) {
    showToastMsg('录音已取消', '✕');
  }
  
  recordingDuration.value = 0;
}

// 切换语音输入
function toggleVoiceInput() {
  isVoiceInput.value = !isVoiceInput.value;
  showQuickReplies.value = false;
}

// 隐藏功能菜单
function hideFunctionMenu() {
  showFunctionMenu.value = false;
}

</script>

<style lang="scss" scoped>
// 全局样式变量 - 基于腾讯元宝设计风格
$primary-color: #07C160; // 腾讯绿作为主色调
$primary-light: #E6F7EF;
$primary-dark: #06B255;
$text-color: #333333;
$text-secondary: #666666;
$text-tertiary: #999999;
$border-color: #E8E8E8;
$background-color: #F7F8FA;
$chat-bg-color: #F7F8FA;
$surface-color: #FFFFFF;
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
$spacing-md: 16px;
$spacing-lg: 24px;
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

// 通用混合器
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba($text-color, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba($text-color, 0.2);
    border-radius: 2px;
    transition: background 0.3s;
    
    &:hover {
      background: rgba($text-color, 0.3);
    }
  }
}

/* 聊天容器 - 精致版，适配小程序 */
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $background-color;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
}

/* 消息列表 */
.message-list {
  flex: 1;
  padding: $spacing-md;
  overflow-y: auto;
  background-color: $chat-bg-color;
  gap: $spacing-lg;
  @include scrollbar;

  /* 历史加载指示器 */
  .history-loading {
    @include flex-center;
    padding: $spacing-md;
    color: $text-tertiary;
    font-size: 14px;

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-top-color: $primary-color;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
    }
  }

  /* 消息分组 */
  .message-group {
    margin-bottom: $spacing-lg;

    .date-divider {
      display: flex;
      justify-content: center;
      margin-bottom: $spacing-md;

      text {
        background-color: rgba(0, 0, 0, 0.05);
        color: $text-tertiary;
        font-size: 12px;
        padding: 4px 12px;
        border-radius: 12px;
      }
    }
  }
}

/* 浮动菜单按钮 */
.menu-float-btn {
  position: fixed;
  bottom: 100px;
  right: 16px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: $primary-color;
  color: #FFFFFF;
  @include flex-center;
  font-size: 24px;
  box-shadow: 0 6px 20px rgba($primary-color, 0.4);
  z-index: 100;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    box-shadow: 0 8px 28px rgba($primary-color, 0.5);
    transform: translateY(-3px) scale(1.05);
  }

  &:active {
    background-color: $primary-dark;
    transform: scale(0.95) translateY(0);
    box-shadow: 0 3px 15px rgba($primary-color, 0.3);
  }
}

/* 动画 */
@keyframes spin {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 确保组件正确定位 */
:deep(.quick-reply-section) {
  position: relative;
  z-index: 10;
}

:deep(.input-wrapper) {
  position: relative;
  z-index: 20;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .chat-container {
    max-width: 768px;
    margin: 0 auto;
    height: 100vh;
    box-shadow: $shadow-md;
    display: flex;
    flex-direction: column;
  }
  
  .message-list {
    flex: 1;
    height: auto;
  }
}
</style>