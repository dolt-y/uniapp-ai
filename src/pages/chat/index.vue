<template>
	<view class="container">
		<navBar @newConversation="newConversation" @viewHistory="viewHistory" @openModelSelector="openModelSelector" />
		<!-- 消息列表 -->
		<view class="message-list-wrapper">
			<scroll-view class="message-list" scroll-y :scroll-into-view="scrollViewToId" :scroll-with-animation="true">
				<view v-for="(message, index) in messages" :key="message.id" :id="'msg-' + message.id"
					:class="['message-item', message.sender === 'user' ? 'user-message' : 'ai-message']">
					<!-- AI 消息布局 -->
					<template v-if="message.sender === 'ai'">
						<view class="avatar">AI</view>
						<view class="message-content">
							<view class="message-bubble">
								<text selectable>{{ message.content }}</text>
							</view>
						</view>
					</template>

					<!-- 用户消息布局 -->
					<template v-else-if="message.sender === 'user'">
						<view class="message-content">
							<view class="message-bubble" :class="{ 'sending-bubble': message.status === 'pending' }">
								<text selectable>{{ message.content }}</text>
							</view>
							<!-- 消息状态指示器 (仅图标) -->
							<view v-if="message.status === 'pending'" class="message-status">
								<uni-icons type="spinner-cycle" size="20" color="#666" class="loading-icon"></uni-icons>
							</view>
							<view v-if="message.status === 'error'" class="message-status error-status"
								@click="retryMessage(message.id)">
								<uni-icons type="info-filled" size="20" color="#ff0000"></uni-icons>
							</view>
						</view>
						<img class="avatar user-avatar" :src="userInfo.avatarUrl" alt="" srcset="">
					</template>
				</view>

				<!-- AI 正在输入提示 -->
				<view v-if="aiTyping" class="message-item ai-message typing-indicator">
					<view class="avatar">AI</view>
					<view class="message-content">
						<view class="message-bubble">
							<text>AI 正在思考中</text>
							<text class="loading-dots">
								<text>.</text><text>.</text><text>.</text>
							</text>
						</view>
					</view>
				</view>
				<!-- 滚动到底部的占位符，确保最新消息可见 -->
				<!-- <view class="scroll-bottom-spacer" :id="lastMessageId"></view> -->
			</scroll-view>
		</view>
		<view class="arrow" @click="scrollToBottom">
			<img class="arrow-icon" src="../../static/arrow_bottom.png" alt="" srcset="">
		</view>
		<view class="input-area-wrapper" :style="{ paddingBottom: inputAreaPaddingBottom + 'px' }">
			<textarea class="input-area" :maxlength="100" v-model="inputText" placeholder="问问ai?" @keyup.enter="sendMessage"
				rows="3"></textarea>
			<button @click="sendMessage" :disabled="!inputText.trim() || aiTyping">
				<div class="svg-wrapper-1">
					<div class="svg-wrapper">
						<img class="send-icon" src="../../static/send.png" alt="">
					</div>
				</div>
				<span>发送</span>
			</button>
		</view>
	</view>
</template>
<script setup lang="ts">
import {
	ref,
	nextTick,
	computed
} from 'vue';
import {
	onLoad,
	onShow
} from '@dcloudio/uni-app';
import navBar from '@/components/nav-bar.vue';
import wxConfig from '../../utils/wxConfig';
// 响应式数据
const messages = ref([{
	id: 1, // 消息ID，用于滚动和唯一标识
	sender: 'ai',
	content: '您好！我是您的AI聊天助手，有什么可以帮助您的吗？'
},]);
const inputText = ref('');
const aiTyping = ref(false); // AI 是否正在输入
const messageIdCounter = ref(1); // 用于生成唯一消息ID
const scrollViewToId = ref(''); // 用于 scroll-into-view 滚动到指定元素

// 键盘和底部安全区适配
const keyboardHeight = ref(0);
const inputAreaPaddingBottom = ref(20); // 底部输入区域的初始 padding-bottom
const userInfo = ref(null); // 用户信息
// 模型相关
const models = ref([ // 可选择的模型列表
	{ value: 'model_a', text: '通用模型 A' },
	{ value: 'model_b', text: '专业模型 B' },
	{ value: 'model_c', text: '创意模型 C' },
]);
const selectedModel = ref('model_a'); // 当前选中的模型
const modelPopup = ref(null); // uni-popup 组件的引用，用于控制弹窗的打开和关闭

// 用于“重新生成”功能，存储最后一条用户发送的消息内容和ID
const lastUserMessageForRegen = ref(null);

// 计算属性：最后一条消息的ID，用于滚动
const lastMessageId = computed(() => {
	// 确保滚动到真正的消息或 AI 正在输入提示，而不是底部占位符
	const lastActualMessageId = messages.value.length > 0 ? 'msg-' + messages.value[messages.value.length - 1].id : null;
	return aiTyping.value ? 'msg-' + (messageIdCounter.value + 1) : (lastActualMessageId || 'bottom-spacer');
});


// 滚动到底部函数
const scrollToBottom = () => {
	nextTick(() => {
		scrollViewToId.value = lastMessageId.value;
		console.log('Scrolling to:', scrollViewToId.value); // 调试信息
	});
};

// 模拟 AI 响应 (实际需要替换为真实 API 调用)
const simulateAISend = async (userMessageContent, originalUserMessageId) => {
	aiTyping.value = true; // 显示 AI 正在输入提示
	const delay = 1500 + Math.random() * 1000; // 模拟网络延迟和处理时间
	await new Promise(resolve => setTimeout(resolve, delay));

	aiTyping.value = false; // 隐藏 AI 正在输入提示

	// 找到对应的用户消息并更新状态为 'success'
	const userMsg = messages.value.find(msg => msg.id === originalUserMessageId && msg.sender === 'user');
	if (userMsg) {
		userMsg.status = 'success';
	}

	// 模拟 AI 成功回复
	messages.value.push({
		id: ++messageIdCounter.value,
		sender: 'ai',
		content: `【${models.value.find(m => m.value === selectedModel.value).text}】您问：“${userMessageContent}”。根据当前模型，我的回复是：这是一段模拟的AI回复内容，您可以根据实际API替换。`,
		evaluation: null // 新增消息评价状态：null, 'liked', 'disliked'
	});
	scrollToBottom(); // 滚动到新消息
};

// 发送消息函数
const sendMessage = async () => {
	if (!inputText.value.trim() || aiTyping.value) { // 输入为空或AI正在输入时，不允许发送
		return;
	}

	const userMessageContent = inputText.value;
	const currentMessageId = ++messageIdCounter.value;

	// 用户发送消息，初始状态为 'pending'
	messages.value.push({
		id: currentMessageId,
		sender: 'user',
		content: userMessageContent,
		status: 'pending' // 新增消息状态：pending, success, error
	});
	inputText.value = ''; // 清空输入框
	scrollToBottom(); // 滚动到底部

	// 存储最后一条用户消息，用于重新生成功能
	lastUserMessageForRegen.value = { id: currentMessageId, content: userMessageContent };

	try {
		// 模拟后端请求，这里需要替换为真实的 AI API 调用
		await simulateAISend(userMessageContent, currentMessageId);
	} catch (error) {
		console.error('AI Reply Error:', error);
		// 如果发生错误，更新用户消息状态为 'error'
		const userMsg = messages.value.find(msg => msg.id === currentMessageId && msg.sender === 'user');
		if (userMsg) {
			userMsg.status = 'error';
		}
		// 也可以添加一条 AI 错误提示消息
		messages.value.push({
			id: ++messageIdCounter.value,
			sender: 'ai',
			content: '抱歉，AI服务暂时不可用，请稍后再试。'
		});
	} finally {
		scrollToBottom(); // 确保无论成功失败都滚动到底部
	}
};

// 重试发送消息
const retryMessage = (messageId) => {
	const messageToRetry = messages.value.find(msg => msg.id === messageId && msg.sender === 'user');
	if (messageToRetry && messageToRetry.status === 'error') {
		messageToRetry.status = 'pending'; // 重新设置为 pending 状态
		simulateAISend(messageToRetry.content, messageId); // 再次尝试发送
	}
};

// --- 功能方法 ---

// 新建会话
const newConversation = () => {
	uni.showModal({
		title: '新建会话',
		content: '确定要开始一个新的会话吗？当前会话将被清空。',
		success: (res) => {
			if (res.confirm) {
				messages.value = [{
					id: ++messageIdCounter.value,
					sender: 'ai',
					content: '您好！欢迎开始新的AI聊天会话，有什么可以帮助您的吗？'
				}];
				inputText.value = '';
				lastUserMessageForRegen.value = null; // 清空重新生成记录
				aiTyping.value = false;
				scrollToBottom();
				uni.showToast({ title: '新会话已创建', icon: 'none' });
			}
		}
	});
};

// 查看历史记录 (目前仅为占位符提示)
const viewHistory = () => {
	uni.showToast({
		title: '历史记录功能正在开发中...',
		icon: 'none'
	});
	// 实际应用中，这里会导航到历史记录页面或打开一个历史记录列表弹窗
	// uni.navigateTo({ url: '/pages/history/history' });
};

// 点赞消息
const likeMessage = (messageId) => {
	const msg = messages.value.find(m => m.id === messageId);
	if (msg && msg.sender === 'ai') {
		if (msg.evaluation === 'liked') {
			msg.evaluation = null; // 取消点赞
			uni.showToast({ title: '已取消点赞', icon: 'none' });
		} else {
			msg.evaluation = 'liked'; // 点赞
			msg.evaluation = msg.evaluation === 'disliked' ? null : 'liked'; // 如果之前是差评，先取消差评
			uni.showToast({ title: '点赞成功', icon: 'none' });
		}
	}
};

// 差评消息
const dislikeMessage = (messageId) => {
	const msg = messages.value.find(m => m.id === messageId);
	if (msg && msg.sender === 'ai') {
		if (msg.evaluation === 'disliked') {
			msg.evaluation = null; // 取消差评
			uni.showToast({ title: '已取消差评', icon: 'none' });
		} else {
			msg.evaluation = 'disliked'; // 差评
			msg.evaluation = msg.evaluation === 'liked' ? null : 'disliked'; // 如果之前是点赞，先取消点赞
			uni.showToast({ title: '已标记为差评', icon: 'none' });
		}
	}
};

// 重新生成回复
const regenerateMessage = async (messageId) => {
	// 确保是AI消息且有上一个用户消息可以重新生成
	const msg = messages.value.find(m => m.id === messageId);
	if (msg && msg.sender === 'ai' && lastUserMessageForRegen.value && !aiTyping.value) {
		uni.showModal({
			title: '重新生成',
			content: '确定要重新生成这条AI回复吗？',
			success: async (res) => {
				if (res.confirm) {
					// 移除当前AI消息 (如果它是最新的一条)
					if (messages.value[messages.value.length - 1].id === messageId) {
						messages.value.pop();
					} else {
						// 如果不是最新一条，需要找到并删除，这会更复杂
						messages.value = messages.value.filter(m => m.id !== messageId);
					}

					// 找到对应的用户消息并将其状态重置为 pending
					const userMsgToResend = messages.value.find(m => m.id === lastUserMessageForRegen.value.id && m.sender === 'user');
					if (userMsgToResend) {
						userMsgToResend.status = 'pending';
					}

					scrollToBottom(); // 滚动确保输入框可见

					try {
						await simulateAISend(lastUserMessageForRegen.value.content, lastUserMessageForRegen.value.id);
						uni.showToast({ title: '已重新生成', icon: 'success' });
					} catch (error) {
						console.error('Regenerate Error:', error);
						uni.showToast({ title: '重新生成失败', icon: 'error' });
						// 失败时可以考虑添加一条AI错误消息
						messages.value.push({
							id: ++messageIdCounter.value,
							sender: 'ai',
							content: '抱歉，重新生成失败。'
						});
					} finally {
						scrollToBottom();
					}
				}
			}
		});
	} else {
		uni.showToast({ title: '当前无法重新生成', icon: 'none' });
	}
};

// 分享消息
const shareMessage = (messageId) => {
	const msg = messages.value.find(m => m.id === messageId);
	if (msg && msg.sender === 'ai') {
		uni.share({
			provider: "weixin", // 微信小程序支持的分享
			type: 0, // 0: 文本，1: 图片，2: 网页
			title: "AI 聊天分享",
			scene: "WXSceneSession", // WXSceneSession: 好友会话, WXSceneTimeline: 朋友圈
			summary: msg.content.substring(0, 80) + "...", // 摘要内容
			success: (res) => {
				console.log("分享成功:" + JSON.stringify(res));
				uni.showToast({ title: '分享成功', icon: 'success' });
			},
			fail: (err) => {
				console.log("分享失败:" + JSON.stringify(err));
				uni.showToast({ title: '分享失败', icon: 'none' });
			}
		});
	}
};


// 模型选择相关方法
const openModelSelector = () => {
	modelPopup.value.open('bottom'); // 打开底部弹窗
};

const closeModelSelector = () => {
	modelPopup.value.close(); // 关闭底部弹窗
};

const handleModelChange = () => {
	// 模型切换后的操作，例如重新加载聊天记录或提示用户
	uni.showToast({
		title: `模型已切换至：${models.value.find(m => m.value === selectedModel.value).text}`,
		icon: 'none',
		duration: 2000
	});
	// 可以在这里清空聊天记录或根据新模型重新获取数据
	// messages.value = [];
	// messages.value.push({ id: ++messageIdCounter.value, sender: 'ai', content: `模型已切换为 ${selectedModel.value}，请开始您的对话。` });
	// scrollToBottom();
	closeModelSelector(); // 选择后自动关闭弹窗
};


// uni-app 生命周期钩子
onLoad(() => {
	// 监听键盘高度变化，以适配输入区域位置
	uni.onKeyboardHeightChange(res => {
		keyboardHeight.value = res.height;
		const safeAreaBottom = uni.getSystemInfoSync().safeAreaInsets.bottom;
		// 动态计算底部输入区域的 padding，确保在键盘上方且考虑安全区
		inputAreaPaddingBottom.value = keyboardHeight.value > 0 ? (keyboardHeight.value + safeAreaBottom) : 20;
		// fabBottom.value = keyboardHeight.value > 0 ? (keyboardHeight.value + safeAreaBottom + 20) : 30; // 悬浮球已移除，此行不再需要
		scrollToBottom();
	});
	console.log('UniApp 页面加载');
	wxConfig.getUserInfo({
		success: (res) => {
			console.log('获取用户信息成功', res);
			userInfo.value = res.userInfo;
			// 这里可以根据用户信息更新 UI 显示
		},
		fail: (err) => {
			console.log('获取用户信息失败', err);
			// 这里可以弹窗提示用户授权失败
		}
	})
	// 页面加载时确保滚动到底部
	scrollToBottom();
});

onShow(() => {
	// 页面显示时确保滚动到底部 (例如从其他页面返回)
	scrollToBottom();
});
</script>

<style scoped lang="scss">
.container {
	display: flex;
	flex-direction: column;
}

.nav-right-icons {
	display: flex;
	align-items: center;
	height: 100%;
}

.nav-icon {
	padding: 0 15rpx;
	/* 调整图标间距 */
	display: flex;
	align-items: center;
	height: 100%;
}

.message-list-wrapper {
	margin-top: 84px;
	height: calc(100vh - 255px);
	flex-grow: 1;
	// background-image: linear-gradient(-225deg, #E3FDF5 0%, #FFE6FA 100%);
	// background-color: #FFE6FA;
	overflow-y: auto;

	.message-list {
		flex: 1;
		padding: 20px;
		box-sizing: border-box;
		padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
	}
}


// .scroll-bottom-spacer {
// 	height: 20px;
// }

.message-item {
	display: flex;
	margin-bottom: 30px;
	align-items: flex-start;
	/* 顶部对齐 */
	opacity: 0;
	transform: translateY(20px);
	animation: fadeInSlideUp 0.3s ease-out forwards;
	/* 消息进入动画 */
}

/* 消息进入动画 */
@keyframes fadeInSlideUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}


/* 头像样式 */
.avatar {
	width: 70rpx;
	height: 70rpx;
	border-radius: 50%;
	background-image: linear-gradient(144deg, #af40ff, #5b42f3 50%, #00ddeb);
	/* AI头像背景色 - 更鲜明的绿 */
	color: #FFFFFF;
	font-size: 28rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-shrink: 0;
	/* 防止头像被压缩 */
	margin-right: 20rpx;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	/* 头像阴影 */
}

.user-avatar {
	background-color: #81C784;
	/* 用户头像背景色 - 稍浅的主题绿 */
	margin-left: 20rpx;
	margin-right: 0;
}

/* 消息内容和气泡 */
.message-content {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	/* 默认左对齐 */
	flex: 1;
	/* 占据剩余空间 */
}

.user-message .message-content {
	align-items: flex-end;
	/* 用户消息内容靠右对齐 */
}

.message-bubble {
	max-width: 100%;
	/* 确保在 flex 容器内不会溢出 */
	padding: 20rpx 25rpx;
	border-radius: 20rpx;
	font-size: 32rpx;
	line-height: 1.5;
	word-break: break-all;
	/* 单词内换行 */
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	/* 气泡阴影 */
	position: relative;
	overflow: hidden;
	/* 确保伪元素不会溢出 */
}

/* 气泡三角形 (伪元素) */
.ai-message .message-bubble::before,
.user-message .message-bubble::before {
	content: '';
	position: absolute;
	width: 0;
	height: 0;
	border-style: solid;
	top: 15rpx;
	z-index: 1;
	/* 确保三角形在气泡之上 */
}

.ai-message .message-bubble {
	background-color: #FFFFFF;
	color: #333333;
	border-top-left-radius: 5rpx;
	/* AI气泡左上角尖角 */
	border-bottom-right-radius: 5rpx;
	/* AI气泡右下角也圆润一些 */
}

.ai-message .message-bubble::before {
	border-width: 0 20rpx 20rpx 0;
	border-color: transparent #FFFFFF transparent transparent;
	left: -15rpx;
}

.user-message {
	justify-content: flex-end;
	/* 用户消息靠右 */
}

.user-message .message-bubble {
	background-color: #C8E6C9;
	/* 用户消息气泡浅绿色背景 */
	color: #333333;
	border-top-right-radius: 5rpx;
	/* 用户气泡右上角尖角 */
	border-bottom-left-radius: 5rpx;
	/* 用户气泡左下角也圆润一些 */
}

.user-message .message-bubble::before {
	border-width: 0 0 20rpx 20rpx;
	border-color: transparent transparent transparent #C8E6C9;
	right: -15rpx;
}


/* 消息状态 (发送中/失败) */
.message-status {
	display: flex;
	align-items: center;
	justify-content: center;
	/* 图标居中，如果只有一个图标 */
	font-size: 24rpx;
	color: #666;
	margin-top: 10rpx;
	height: 40rpx;
	/* 给图标留出固定高度，避免跳动 */
	width: 40rpx;
	/* 确保图标区域稳定 */
}

/* 用户消息状态靠右 */
.user-message .message-status {
	align-self: flex-end;
	/* 自身靠右对齐 */
	margin-right: 10rpx;
	/* 与气泡的间距 */
}

.loading-icon {
	animation: spin 1s linear infinite;
	/* 旋转动画 */
}

.sending-bubble {
	opacity: 0.8;
	/* 正在发送的消息气泡略微透明 */
}

.error-status {
	color: #ff0000;
	/* 错误状态文字颜色 */
	padding: 5rpx 10rpx;
	/* 稍微增加点击区域 */
	border-radius: 10rpx;
	background-color: rgba(255, 0, 0, 0.05);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

/* AI 正在输入提示 */
.typing-indicator .message-bubble {
	background-color: #EEEEEE;
	color: #666;
	font-style: italic;
	animation: pulse 1.5s infinite;
}

.loading-dots text {
	animation: dot-pulse 1.5s infinite;
	opacity: 0.5;
}

.loading-dots text:nth-child(1) {
	animation-delay: 0s;
}

.loading-dots text:nth-child(2) {
	animation-delay: 0.2s;
}

.loading-dots text:nth-child(3) {
	animation-delay: 0.4s;
}

/* 动画关键帧 */
@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

@keyframes pulse {

	0%,
	100% {
		opacity: 0.8;
	}

	50% {
		opacity: 1;
	}
}

@keyframes dot-pulse {

	0%,
	100% {
		opacity: 0.5;
	}

	50% {
		opacity: 1;
	}
}

/* AI 消息操作按钮 - 仅图标 */
.message-actions {
	display: flex;
	margin-top: 10rpx;
	gap: 10rpx;
	/* 按钮之间的间距缩小，因为没有文字了 */
	justify-content: flex-start;
	/* AI 消息操作按钮靠左 */
	align-items: center;
	font-size: 24rpx;
}
.arrow {
	margin: 0 auto;
    .arrow-icon{
		width: 25px;
		height: 25px;
	}
}
.input-area-wrapper {
	display: flex;
	align-items: center;
	// background-image: linear-gradient(to bottom, #E3FDF5, #FFFFFF);
	height: 100px;

	// background-image: linear-gradient(90deg, #03a9f4, #f441a5)
	.input-area {
		position: fixed;
		height: 100px;
		bottom: 30px;
		width: 90%;
		left: 5%;
		padding: 15px;
		box-sizing: border-box;
		transition: padding-bottom 0.3s ease-out;
		border: 1px solid #E0E0E0;
		border-radius: 12px;
	}
	button {
		position: fixed;
		bottom: 35px;
		right: 25px;
		font-family: inherit;
		font-size: 16px;
		background: royalblue;
		color: white;
		padding-left: 0.9em;
		display: flex;
		align-items: center;
		border: none;
		border-radius: 16px;
		overflow: hidden;
		transition: all 0.2s;
		cursor: pointer;
		.send-icon{
			width: 18px;
			height: 16px;
			margin-right: 0.4em;
		}
	}
}
.popup-content {
	padding: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	border-top-left-radius: 20rpx;
	border-top-right-radius: 20rpx;
}

/* .popup-title 样式已不需要 */
.model-select {
	width: 100%;
	margin-bottom: 40rpx;
}

.close-button {
	width: 80%;
	background-color: #4CAF50;
	color: #FFFFFF;
	border-radius: 40rpx;
	height: 80rpx;
	line-height: 80rpx;
	font-size: 32rpx;
}
</style>