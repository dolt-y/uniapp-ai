<template>
    <web-view :src="webUrl" style="width:100%;height:100vh;" @message="onWebMessage" />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import request from '@/utils/request';

const webUrl = ref(''); // 先定义响应式变量
const userInfo = ref(null);

onMounted(async () => {
    const token = uni.getStorageSync('token');
    try {
        const res = await request('http://10.3.20.101:3000/api/user/info');
        userInfo.value = res.user;
        webUrl.value = `http://10.3.20.101:5173/?token=${token}&nickname=${encodeURIComponent(res.user.nickname)}&avatarUrl=${encodeURIComponent(res.user.avatarUrl)}`;
        console.log(webUrl.value)
    } catch (err) {
        console.error(err);
    }
});

function onWebMessage(evt) {
    console.log('接收到的消息：', evt.detail.data[0].action);
    uni.showModal({
        content: JSON.stringify(evt.detail.data)
    });
    if (evt.detail.data[0].action === 'back') {
        uni.navigateBack({ delta: 1 });
    }
}

</script>
<style scoped>
.container {
    width: 100%;
    height: 100vh;
}
</style>
