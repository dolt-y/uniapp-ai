<template>
  <view class="search-bar">
    <input v-model="keyword" placeholder="搜索水果" />
    <button @click="handleSearch">搜索</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const keyword = ref('');

const handleSearch = () => {
  emit('search', keyword.value);
};
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
}
button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
</style> 