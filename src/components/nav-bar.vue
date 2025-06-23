<!-- 全局导航栏组件 -->
<template>
  <view class="custom-nav-bar">
    <view class="nav-title">{{ title }}</view>
  </view>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'AI 聊天助手'
  }
});

const emit = defineEmits(['newConversation', 'viewHistory', 'openModelSelector']);

const onNewConversation = () => {
  emit('newConversation');
};

const onViewHistory = () => {
  emit('viewHistory');
};

const onOpenModelSelector = () => {
  emit('openModelSelector');
};
</script>

<style scoped>
.custom-nav-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 84px;
  background-image: linear-gradient(-225deg, #FFFEFF 0%, #D7FFFE 100%);
  color: #333;
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-title {
  margin-top: 20px;
  font-size: 14px;
  font-weight: bold;
}
</style>