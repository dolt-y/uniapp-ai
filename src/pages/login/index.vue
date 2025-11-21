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
    uni.showLoading({
        title: '正在登录...',
        mask: true
    });

    uni.login({
        success(res: { code: string; }) {
            console.log('wx.login code:', res.code);

            if (res.code) {
                // 2. 获取用户信息（uni-app/微信小程序推荐使用 getUserProfile）
                // 注意：旧版 wx.getUserInfo 已不推荐或需要 button 触发。
                // 如果您确定环境支持 wx.getUserInfo，可以继续使用，但此处我使用 uni.getUserInfo 兼容 uni-app
                // 推荐改为 uni.getUserProfile (需要用户手动点击授权)

                uni.getUserInfo({ // 或使用 uni.getUserProfile
                    desc: '获取用户信息用于登录',
                    success(profile: { userInfo: any; }) {
                        console.log('user profile:', profile);
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

                                uni.redirectTo({
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
:root {
    --color-primary: #8B5CF6;
    --color-primary-dark: #7C3AED;
    --color-bg-gradient-start: #F5F3FF;
    --color-bg-gradient-end: #EDE9FE;
    --color-text-main: #4C1D95;
    --color-text-sub: #6D28D9;
    --color-text-muted: #8B5CF6;
}

// 基础页面设置
.login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow: hidden;
}

.background-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    z-index: 0;
    opacity: 0.6;
}

.blob-1 {
    width: 400rpx;
    height: 400rpx;
    background: #DDD6FE;
    top: -100rpx;
    left: -100rpx;
}

.blob-2 {
    width: 500rpx;
    height: 500rpx;
    background: #C4B5FD;
    bottom: -100rpx;
    right: -150rpx;
}

// 容器：垂直居中（使用 flex-grow 模拟）
.login-container {
    flex-grow: 1;
    width: 100%;
    max-width: 720rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 0 40rpx;
    padding-bottom: 80rpx;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
}

// --- 品牌 Logo & Slogan ---
.brand-header {
    padding-top: 15vh; // 稍微调整高度
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24rpx;
}

.logo-placeholder {
    width: 160rpx;
    height: 160rpx;
    border-radius: 40rpx;
    background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 20rpx 40rpx rgba(139, 92, 246, 0.3);
    margin-bottom: 10rpx;
}

.logo-text {
    font-size: 64rpx;
    font-weight: bold;
    color: #ffffff;
}

.brand-logo {
    width: 160rpx;
    height: 160rpx;
    border-radius: 40rpx;
    box-shadow: 0 20rpx 40rpx rgba(139, 92, 246, 0.3);
}

.brand-title {
    font-size: 52rpx;
    font-weight: 800;
    color: #4C1D95;
    letter-spacing: 2rpx;
}

.brand-slogan {
    font-size: 30rpx;
    color: #6D28D9;
    opacity: 0.8;
    font-weight: 500;
}

.login-card {
    width: 100%;
    padding: 60rpx 40rpx;

    border: 1rpx solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 20rpx 60rpx rgba(139, 92, 246, 0.15);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32rpx;
}

.card-title {
    font-size: 40rpx;
    font-weight: 700;
    color: #2E1065;
}

.card-subtitle {
    font-size: 28rpx;
    color: #6D28D9;
    margin-bottom: 20rpx;
    opacity: 0.8;
}

.primary-btn {
    width: 100%;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    border-radius: 32rpx;
    line-height: 100rpx;
    font-size: 32rpx;
    font-weight: 600;

    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
    color: #ffffff;
    box-shadow: 0 10rpx 25rpx rgba(124, 58, 237, 0.4);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: none;

    // 微信图标
    .wechat-icon {
        width: 48rpx;
        height: 48rpx;
        filter: brightness(0) invert(1);
    }

    // 模拟按钮按下效果
    &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 12rpx rgba(124, 58, 237, 0.3);
        opacity: 0.95;
    }
}

// --- 次级登录/协议 ---
.secondary-login-area {
    margin-top: 10rpx;

    .secondary-login-text {
        font-size: 26rpx;
        color: var(--color-text-secondary);
        transition: color 0.2s ease;

        &:active {
            color: var(--color-accent);
        }
    }
}

.agreement-check {
    margin-top: 10rpx;
    padding: 0 10rpx;
    width: 100%;

    .checkbox-label {
        display: flex;
        align-items: flex-start;
        justify-content: center;
    }
}

.agreement-text {
    font-size: 24rpx;
    color: #7C3AED;
    margin-left: 10rpx;
    line-height: 1.6;
    text-align: left;
}

.link-text {
    color: #5B21B6;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px solid rgba(91, 33, 182, 0.3);
    margin: 0 4rpx;

    &:active {
        opacity: 0.7;
    }
}

// --- 底部信息 ---
.footer-info {
    margin-top: 40rpx;
    font-size: 22rpx;
    color: #8B5CF6;
    opacity: 0.5;
}
</style>
