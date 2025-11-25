<template>
  <view class="input-wrapper">
    <view class="input-toolbar">
      <view class="capsule" @click="handleImageUpload">
        <image src="/static/icons/image-outline.svg" mode="aspectFit"></image>
        <text>插入图片</text>
      </view>
      <view class="capsule" @click="onViewHistory">
        <image src="/static/icons/chatbubble-outline.svg" mode="aspectFit"></image>
        <text>{{ '历史会话' }}</text>
      </view>
    </view>
    <view class="input-surface">
      <textarea v-model="inputContent" class="textarea" placeholder="组织好你的问题，让我为你补全灵感..."
        placeholder-style="color: rgba(47,58,102,0.35)" maxlength="1000" auto-height :disabled="isRecording"
        @focus="onInputFocus" @blur="onInputBlur"></textarea>
      <view class="input-actions">
        <view class="icon-btn" @touchstart="startRecording" @touchmove="handleRecordingMove" @touchend="stopRecording"
          @touchcancel="stopRecording" :class="{ active: isRecording }"
          style="-webkit-user-select: none; user-select: none;">
          <image src="/static/icons/mic-outline.svg" mode="aspectFit"></image>
        </view>
        <view class="send-btn" :class="{ disabled: !canSend }" @click="handleSend">
          <image src="/static/icons/send-outline.svg" mode="aspectFit"></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, defineEmits, defineProps, ref, watch } from 'vue';

// 定义props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  isRecording: {
    type: Boolean,
    default: false
  },
  recordingDuration: {
    type: Number,
    default: 0
  }
});

// 定义事件
const emit = defineEmits([
  'update:modelValue',
  'send-message',
  'upload-image',
  'toggle-voice',
  'start-recording',
  'stop-recording',
  'handle-recording-move',
  'viewHistory'
]);

// 响应式数据
const inputContent = ref(props.modelValue);
const isInputFocused = ref(false);

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== inputContent.value) {
      inputContent.value = newVal;
    }
  }
);

watch(
  () => inputContent.value,
  (newVal) => {
    if (newVal !== props.modelValue) {
      emit('update:modelValue', newVal);
    }
  }
);

const canSend = computed(() => inputContent.value.trim().length > 0 && !props.isRecording);

// 发送消息
function handleSend() {
  if (!canSend.value) return;

  const content = inputContent.value.trim();
  if (content) {
    emit('send-message', content);
    inputContent.value = '';
  }
}
const onViewHistory = () => {
  emit('viewHistory');
}
// 图片上传
function handleImageUpload() {
  if (props.isRecording) return;

  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      emit('upload-image', tempFilePath);
    },
    fail: (err) => {
      console.error('选择图片失败:', err);
    }
  });
}

// 开始录音
function startRecording(e) {
  e.preventDefault();
  if (props.isRecording) return;
  emit('start-recording');
}

// 处理录音移动
function handleRecordingMove(e) {
  if (!props.isRecording) return;
  emit('handle-recording-move', e);
}

// 停止录音
function stopRecording() {
  if (!props.isRecording) return;
  emit('stop-recording');
}

// 输入框聚焦
function onInputFocus() {
  isInputFocused.value = true;
}

// 输入框失焦
function onInputBlur() {
  isInputFocused.value = false;
}
</script>

<style lang="scss" scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 12rpx 4rpx 0;
  position: relative;
  z-index: 10;
}

.input-toolbar {
  display: flex;
  gap: 12rpx;
}

.capsule {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 18rpx;
  border-radius: 20rpx;
  background: var(--color-bg-soft);
  border: 1rpx solid var(--color-border-soft);
  color: var(--color-text-primary);
  font-size: 24rpx;
  box-shadow: var(--shadow-soft);

  image {
    width: 30rpx;
    height: 30rpx;
    opacity: 0.72;
  }

  &:active {
    transform: translateY(3rpx);
    box-shadow: 0 8rpx 14rpx rgba(93, 105, 187, 0.16);
  }
}

.input-surface {
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
  padding: 16rpx;
  border-radius: 26rpx;
  background: var(--color-bg-card);
  border: 1rpx solid var(--color-border-subtle);
  box-shadow: var(--shadow-soft);
  // backdrop-filter: blur(var(--blur-card));
  // -webkit-backdrop-filter: blur(var(--blur-card));
}

.textarea {
  flex: 1;
  min-height: 84rpx;
  max-height: 240rpx;
  padding-right: 12rpx;
  border: none;
  background: transparent;
  font-size: 28rpx;
  color: var(--color-text-primary);
  line-height: 1.6;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.icon-btn {
  width: 58rpx;
  height: 58rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-soft);
  border: 1rpx solid var(--color-border-soft);
  box-shadow: var(--shadow-soft);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  image {
    width: 30rpx;
    height: 30rpx;
    opacity: 0.72;
  }

  &:active {
    transform: translateY(3rpx);
    box-shadow: 0 10rpx 18rpx rgba(93, 105, 187, 0.2);
  }

  &.active {
    background: linear-gradient(135deg, #34d399 0%, #0ea5e9 100%);
    border-color: rgba(14, 165, 233, 0.4);

    image {
      filter: brightness(0) invert(1);
      opacity: 1;
    }
  }
}

.send-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  box-shadow: 0 18rpx 30rpx rgba(99, 102, 241, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  image {
    width: 28rpx;
    height: 28rpx;
    filter: brightness(0) invert(1);
  }

  &.disabled {
    background: rgba(226, 232, 240, 0.9);
    box-shadow: none;
    opacity: 0.45;
    pointer-events: none;
  }

  &:active {
    transform: translateY(3rpx);
    box-shadow: 0 12rpx 18rpx rgba(99, 102, 241, 0.32);
  }
}

.hint-bar {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 16rpx 22rpx;
  border-radius: 20rpx;
  background: var(--color-bg-soft);
  border: 1rpx solid var(--color-border-soft);
  box-shadow: var(--shadow-soft);
}

.hint-title {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--color-text-primary);
}

.hint-body {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

@media (max-width: 720rpx) {
  .input-toolbar {
    gap: 8rpx;
  }

  .capsule {
    flex: 1;
    justify-content: center;
    padding: 10rpx 12rpx;
  }

  .input-surface {
    padding: 18rpx 18rpx;
  }

  .hint-bar {
    font-size: 22rpx;
  }
}
</style>