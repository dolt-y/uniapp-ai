<template>
  <view class="container">
    <image :src="fruit.image" mode="aspectFill"></image>
    <text>{{ fruit.name }}</text>
    <text>￥{{ fruit.price }}</text>
    <text>{{ fruit.description }}</text>

    <!-- 数量选择 -->
    <view class="quantity">
      <text>数量：</text>
      <button @click="decreaseQuantity">-</button>
      <text>{{ quantity }}</text>
      <button @click="increaseQuantity">+</button>
    </view>

    <!-- 用户评价 -->
    <view class="reviews">
      <text>用户评价：</text>
      <block v-for="review in fruit.reviews" :key="review.id">
        <text>{{ review.user }}：{{ review.content }}</text>
      </block>
    </view>

    <!-- 操作按钮 -->
    <button @click="addToCart">加入购物车</button>
    <button @click="buyNow">立即购买</button>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const fruit = ref({}); // 当前水果详情
const quantity = ref(1); // 购买数量
const route = useRoute();

// 请求后端获取水果详情
const fetchFruitDetail = async () => {
  const id = route.query.id;
  const res = await uni.request({
    url: `https://your-server.com/api/fruits/${id}`,
  });
  fruit.value = res.data;
};

// 增加数量
const increaseQuantity = () => {
  quantity.value += 1;
};

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value -= 1;
  }
};

// 添加到购物车
const addToCart = () => {
  uni.showToast({
    title: '已加入购物车',
    icon: 'success',
  });
};

// 立即购买
const buyNow = () => {
  uni.navigateTo({
    url: '/pages/cart/cart',
  });
};

onMounted(() => {
  fetchFruitDetail();
});
</script>

<style scoped>
.container {
  padding: 20px;
}
.quantity {
  display: flex;
  align-items: center;
  margin: 20px 0;
}
.reviews {
  margin: 20px 0;
}
</style> 