<template>
    <view :data-weui-theme="theme">
        <!-- 头像选择 -->
        <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image class="avatar" :src="avatarUrl" />
        </button>

        <!-- 表单 -->
        <view class="form-section">
            <view class="form-item">
                <text class="label">昵称</text>
                <input type="text" class="weui-input" v-model="nickname" placeholder="请输入昵称" />
            </view>
        </view>
        <button class="save-btn" @tap="submit">保存</button>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const theme = ref<'light' | 'dark'>('light')
const defaultAvatarUrl =
    'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const avatarUrl = ref(defaultAvatarUrl)
const nickname = ref('')

onMounted(() => {
    const info = uni.getSystemInfoSync()
    theme.value = (info.theme as 'light' | 'dark') || 'light'

    uni.onThemeChange((result) => {
        theme.value = result.theme as 'light' | 'dark'
    })
})

const onChooseAvatar = (e: any) => {
    console.log(e)
    avatarUrl.value = e.detail.avatarUrl || defaultAvatarUrl
}

const submit = () => {
    if (!nickname.value.trim()) {
        uni.showToast({ title: '请输入昵称', icon: 'none' })
        return
    }
    uni.showLoading({ title: '保存中...' })
    setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: '保存成功' })
        console.log({ avatarUrl: avatarUrl.value, nickname: nickname.value })
    }, 600)
}

</script>

<style scoped lang="scss">
.avatar-wrapper {
    padding: 0;
    width: 112rpx;
    height: 112rpx;
    border-radius: 8px;
    margin-top: 40rpx;
    margin-bottom: 40rpx;
    overflow: hidden;
}

.avatar {
    width: 112rpx;
    height: 112rpx;
    display: block;
    border-radius: 8rpx;
}

.form-section {
    padding: 20rpx 0;
}

.form-item {
    display: flex;
    justify-content: space-between;
    justify-items: center;
    align-items: center;
    gap: 20rpx;
    border: 1px solid #ccc;
    padding: 10rpx 0;
}

.label {
    display: block;
    width: 90rpx;
    color: black;
    font-size: 30rpx;
    font-weight: bold;
    margin-left: 18rpx;
}

.weui-input {
    width: 80%;
    padding: 20rpx;
    border: none;
}

.save-btn {
    margin-top: 60rpx;
    width: 35%;
    padding: 0;
    background-color: #007aff;
    color: #fff;
    border-radius: 10rpx;
}
</style>
