<template>
  <view class="login-page">
    <view class="background-blob blob-1"></view>
    <view class="background-blob blob-2"></view>
    <view class="status-bar-spacer" :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="login-container">
      <view class="brand-header">
        <text class="brand-title">{{ appName }}</text>
        <text class="brand-slogan">用 AI 激发无限创意与效率</text>
      </view>

      <view class="login-card">
        <text class="card-title">欢迎使用 {{ appName }}</text>
        <text class="card-subtitle">请授权登录以继续使用服务</text>

        <button open-type="getUserProfile" class="primary-btn login-btn" @tap="handleLogin">
          <image src="/static/icons/wechat.svg" mode="aspectFit" class="wechat-icon"></image>
          <text>微信一键登录</text>
        </button>

        <view class="agreement-check">
          <checkbox-group @change="handleAgreementChange">
            <label class="checkbox-label">
              <checkbox :checked="isAgreed" color="#8B5CF6" style="transform:scale(0.7)" />
              <text class="agreement-text">
                我已阅读并同意
                <text class="link-text" @tap.stop="openAgreement('user')">《用户协议》</text>
                及
                <text class="link-text" @tap.stop="openAgreement('privacy')">《隐私政策》</text>
              </text>
            </label>
          </checkbox-group>
        </view>
      </view>

      <view class="footer-info">
        <text>ZhiYuan AI Assistant © 2025</text>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import request from '../../utils/request';

const appName = ref('智元 AI 助手');
const isAgreed = ref(false);

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;

const handleAgreementChange = (e: { detail: { value: string | any[]; }; }) => {
  isAgreed.value = e.detail.value.length > 0;
};


const handleLogin = () => {
  if (!isAgreed.value) {
    uni.showToast({
      title: '请先阅读并同意用户协议和隐私政策',
      icon: 'none'
    });
    return;
  }
  uni.showLoading({
    title: '正在登录...',
    mask: true
  });
  // 获取用户信息（uni-app/微信小程序推荐使用 getUserProfile）
  // 注意：旧版 wx.getUserInfo 已不推荐或需要 button 触发。
  // 如果您确定环境支持 wx.getUserInfo，可以继续使用，但此处我使用 uni.getUserInfo 兼容 uni-app
  // 推荐改为 uni.getUserProfile (需要用户手动点击授权)
  uni.getUserProfile({
    desc: '获取用户信息用于登录',
    success(profile: { userInfo: any; }) {
      console.log('user profile:', profile);
      uni.login({
        success(res: { code: string; }) {
          console.log('wx.login code:', res.code);
          if (res.code) {
            uni.hideLoading();
            request('http://localhost:3000/api/user/login', {
              code: res.code,
              userInfo: profile.userInfo
            }, 'POST', false)
              .then((res) => {
                console.log('API 登录成功:', res);
                const token = res?.token;
                if (token) {
                  uni.setStorageSync('token', token);
                  console.log('Token 已保存:', token);
                }
                uni.hideLoading();
                uni.showToast({
                  title: '登录成功',
                  icon: 'success'
                });

                uni.navigateTo({
                  url: '/pages/chat/index'
                });
              })
              .catch((err: { data: { message: any; }; }) => {
                uni.hideLoading();
                console.error('API 登录失败:', err);
                uni.showToast({
                  title: err.data?.message || '登录失败，请重试',
                  icon: 'none'
                });
              });
          } else {
            uni.hideLoading();
            uni.showToast({
              title: '获取 Code 失败',
              icon: 'none'
            });
          }
        },
        fail(err) {
          uni.hideLoading();
          console.error('wx.login 调用失败:', err);
          uni.showToast({
            title: '网络连接失败',
            icon: 'none'
          });
        }
      });
    },
    fail(err) {
      uni.hideLoading();
      console.error('获取用户信息失败:', err);
      uni.showToast({
        title: '授权失败，无法登录',
        icon: 'none'
      });
    }
  });
}
const openAgreement = (type: string) => {
  const title = type === 'user' ? '用户协议' : '隐私政策';
  uni.showModal({
    title: title,
    content: `这里是${title}的详细内容...`,
    showCancel: false,
    confirmText: '确定'
  });
};

</script>
<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.18), transparent 40%),
    radial-gradient(circle at 80% 0%, rgba(14, 165, 233, 0.22), transparent 45%),
    linear-gradient(160deg, #eef2ff 0%, #f8fafc 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  color: var(--color-text-primary);
}

.background-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.3;
  z-index: 0;
}

.blob-1 {
  width: 460rpx;
  height: 460rpx;
  background: rgba(79, 70, 229, 0.55);
  top: -120rpx;
  left: -100rpx;
}

.blob-2 {
  width: 520rpx;
  height: 520rpx;
  background: rgba(14, 165, 233, 0.45);
  bottom: -140rpx;
  right: -140rpx;
}

.login-container {
  flex: 1;
  width: 100%;
  max-width: 820rpx;
  padding: 80rpx 48rpx 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
}

.brand-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  text-align: center;
}

.brand-title {
  font-size: 56rpx;
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: 1.6rpx;
}

.brand-slogan {
  font-size: 30rpx;
  color: var(--color-text-secondary);
}

.login-card {
  width: 80%;
  padding: 60rpx 48rpx;
  border-radius: 36rpx;
  // background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 40rpx 80rpx rgba(79, 70, 229, 0.18);
  backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.card-title {
  font-size: 40rpx;
  font-weight: 700;
}

.card-subtitle {
  font-size: 28rpx;
  color: var(--color-text-secondary);
}

.primary-btn {
  width: 100%;
  height: 100rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 45%, #a855f7 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  box-shadow: 0 24rpx 40rpx rgba(79, 70, 229, 0.35);
  border: none;
}

.primary-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 18rpx 28rpx rgba(79, 70, 229, 0.3);
}

.wechat-icon {
  width: 48rpx;
  height: 48rpx;
  filter: brightness(0) invert(1);
}

.agreement-check {
  width: 100%;
  // background: rgba(99, 102, 241, 0.08);
  // border: 1rpx solid rgba(99, 102, 241, 0.2);
  border-radius: 24rpx;
  // padding: 18rpx 22rpx;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  justify-items: center;
  align-items: center;
  gap: 12rpx;
  color: var(--color-text-secondary);
}

.agreement-text {
  font-size: 24rpx;
  line-height: 1.6;
}

.link-text {
  color: var(--color-accent);
  font-weight: 600;
  border-bottom: 1rpx solid rgba(99, 102, 241, 0.35);
}

.footer-info {
  margin-top: 40rpx;
  font-size: 22rpx;
  color: var(--color-text-secondary);
  opacity: 0.7;
}

@media (max-width: 720rpx) {
  .login-container {
    padding: 60rpx 32rpx 80rpx;
  }

  .login-card {
    padding: 48rpx 32rpx;
  }

  .brand-title {
    font-size: 48rpx;
  }
}
</style>
