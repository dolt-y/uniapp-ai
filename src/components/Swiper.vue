<template>
  <swiper :autoplay="true" :interval="3000" :circular="true">
    <swiper-item v-for="item in items" :key="item.link">
      <image :src="item.image" mode="aspectFill" @click="navigateTo(item.link)" />
    </swiper-item>
  </swiper>
</template>

<script setup>
import { useRouter } from 'uni-simple-router';

const router = useRouter();

const navigateTo = (link) => {
  router.push(link);
};
</script>

<style scoped>
swiper {
  height: 200px;
}
image {
  width: 100%;
  height: 100%;
}
</style> 