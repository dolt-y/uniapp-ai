<template>
  <view class="container">
    <view class="product-card">
      <!-- 商品图片 -->
      <view class="image-container">
        <image :src="fruit.image || '/static/logo.png'" mode="aspectFill" class="product-image"></image>
        <view class="image-overlay"></view>
      </view>

      <!-- 商品信息 -->
      <view class="product-info">
        <h1 class="product-name">{{ fruit.name || '精美水果' }}</h1>
        <div class="price-container">
          <span class="price">￥{{ fruit.price || '29.99' }}</span>
          <span class="original-price" v-if="originalPrice">￥{{ originalPrice }}</span>
        </div>
        <p class="description">{{ fruit.description || '新鲜优质水果，口感鲜美，营养丰富。' }}</p>
      </view>

      <!-- 数量选择 -->
      <view class="quantity">
        <span class="quantity-label">数量</span>
        <view class="quantity-control">
          <button class="quantity-btn" @click="decreaseQuantity">-</button>
          <span class="quantity-value">{{ quantity }}</span>
          <button class="quantity-btn" @click="increaseQuantity">+</button>
        </view>
      </view>

      <!-- 用户评价 -->
      <view class="reviews">
        <h3 class="section-title">用户评价</h3>
        <block v-if="fruit.reviews && fruit.reviews.length > 0">
          <view v-for="review in fruit.reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <span class="reviewer-name">{{ review.user || '用户' }}</span>
              <div class="rating">
                <span v-for="i in 5" :key="i" class="star">★</span>
              </div>
            </div>
            <p class="review-content">{{ review.content || '很好吃，下次还会购买！' }}</p>
          </view>
        </block>
        <block v-else>
          <div class="no-reviews">暂无评价，快来成为第一个评价的人吧！</div>
        </block>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="cart-btn" @click="addToCart">
          <span>加入购物车</span>
        </button>
        <button class="buy-btn" @click="buyNow">
          <span>立即购买</span>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
const fruit = ref({}); // 当前水果详情
const quantity = ref(1); // 购买数量
const route = useRoute();

// 计算原价（模拟）
const originalPrice = computed(() => {
  if (!fruit.value.price) return '39.99';
  return (parseFloat(fruit.value.price) * 1.3).toFixed(2);
});

// 请求后端获取水果详情
const fetchFruitDetail = async () => {
  const id = route.query.id;
  // 由于是模拟环境，提供一些默认数据
  fruit.value = {
    name: '新鲜草莓',
    price: '29.99',
    description: '来自云南高原的新鲜草莓，个大饱满，甜度适中，富含维生素C和多种矿物质。',
    image: '/static/logo.png',
    reviews: [
      { id: 1, user: '小明', content: '非常新鲜，甜度刚好，孩子很喜欢吃！' },
      { id: 2, user: '小红', content: '包装很好，没有损坏，下次还会购买。' }
    ]
  };
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
  // 由于没有cart页面，暂时显示提示
  uni.showToast({
    title: '即将前往结算',
    icon: 'none',
  });
};

onMounted(() => {
  fetchFruitDetail();
});
</script>

<style scoped>
.container {
  padding: 16px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding-bottom: 32px;
}

.product-card {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

/* 图片容器样式 */
.image-container {
  width: 100%;
  height: 250px;
  position: relative;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
}

.image-container:hover .product-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 100%);
}

/* 商品信息样式 */
.product-info {
  padding: 24px;
}

.product-name {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.3;
}

.price-container {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.price {
  font-size: 28px;
  font-weight: 700;
  color: #ff4757;
  margin-right: 12px;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
}

.description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
}

/* 数量选择样式 */
.quantity {
  padding: 0 24px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.quantity-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.quantity-control {
  display: flex;
  align-items: center;
  width: fit-content;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  background: #f5f5f5;
  color: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  padding: 0;
}

.quantity-btn:active {
  background: #e0e0e0;
}

.quantity-value {
  min-width: 50px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* 评价样式 */
.reviews {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.review-item {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reviewer-name {
  font-weight: 600;
  color: #333;
}

.rating {
  display: flex;
  gap: 2px;
}

.star {
  color: #ffd700;
  font-size: 14px;
}

.review-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.no-reviews {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  padding: 24px;
  gap: 12px;
}

.cart-btn,
.buy-btn {
  flex: 1;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.cart-btn:active {
  opacity: 0.9;
}

.buy-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.buy-btn:active {
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 12px;
  }
  
  .product-name {
    font-size: 22px;
  }
  
  .price {
    font-size: 24px;
  }
  
  .image-container {
    height: 200px;
  }
}
</style>