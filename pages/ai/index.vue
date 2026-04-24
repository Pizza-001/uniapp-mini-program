<template>
  <view class="ai-page">
    <!-- 自定义导航栏 -->
    <view class="nav-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="back-btn" @tap="goBack">
          <uni-icons type="left" size="24" color="#2C3E50" />
        </view>
        <text class="title">AI 健康助手</text>
        <view class="placeholder"></view>
      </view>
    </view>

    <!-- 聊天内容区 -->
    <scroll-view 
      class="chat-scroll" 
      scroll-y 
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
    >
      <view class="chat-container">
        <!-- 欢迎消息 -->
        <view class="message-wrapper assistant">
          <image class="avatar" src="/static/images/ai-consult.png" mode="aspectFit" />
          <view class="bubble">
            <text>您好！我是您的 AI 宠物健康管家。您可以向我咨询关于宠物的健康、行为、喂养等任何问题。</text>
          </view>
        </view>

        <!-- 对话列表 -->
        <view 
          v-for="(msg, index) in messages" 
          :key="index" 
          :class="['message-wrapper', msg.role]"
        >
          <image 
            class="avatar" 
            :src="msg.role === 'user' ? userAvatar : assistantAvatar" 
            mode="aspectFit" 
          />
          <view class="bubble">
            <text v-if="!msg.loading">{{ msg.content }}</text>
            <view class="typing" v-else>
              <view class="dot"></view>
              <view class="dot"></view>
              <view class="dot"></view>
            </view>
          </view>
        </view>
        
        <view class="spacing"></view>
      </view>
    </scroll-view>

    <!-- 输入区 -->
    <view class="input-area" :style="{ bottom: keyboardHeight + 'px' }">
      <view class="input-wrapper">
        <textarea 
          class="input" 
          v-model="inputMsg" 
          placeholder="描述宠物症状..." 
          auto-height 
          maxlength="500"
          :fixed="true"
          :cursor-spacing="20"
        />
        <view 
          class="send-btn" 
          :class="{ active: inputMsg.trim() }" 
          @tap="handleSend"
        >
          <uni-icons type="paperplane-filled" size="24" color="#fff" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { BASE_URL } from '@/api/index.js'

const messages = ref([])
const inputMsg = ref('')
const scrollTop = ref(0)
const keyboardHeight = ref(0)
const loading = ref(false)
const statusBarHeight = ref(0)

const userAvatar = 'https://dummyimage.com/100x100/4A569D/fff&text=Me'
const assistantAvatar = '/static/images/ai-consult.png'

const goBack = () => {
  uni.navigateBack()
}

const scrollToBottom = () => {
  nextTick(() => {
    scrollTop.value += 1000 // 强制滚动到底部
  })
}

const handleSend = async () => {
  if (!inputMsg.value.trim() || loading.value) return

  const userContent = inputMsg.value.trim()
  messages.value.push({ role: 'user', content: userContent })
  inputMsg.value = ''
  scrollToBottom()

  // 添加机器人占位消息
  const assistantMsg = { role: 'assistant', content: '', loading: true }
  messages.value.push(assistantMsg)
  loading.value = true

  try {
    // 调用 SSE 流式接口 (UniApp 需要特殊处理 chunked 响应)
    const token = uni.getStorageSync('token')
    const requestUrl = `${BASE_URL}/ai/chat/sse?memoryId=123&message=${encodeURIComponent(userContent)}`
    
    // 模拟流式效果 (由于小程序环境对 SSE 支持受限，通常由后端转为普通长链接或 WebSocket，此处先实现核心逻辑)
    // 如果是正式 SSE，需使用 enableChunked: true
    uni.request({
      url: requestUrl,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        assistantMsg.loading = false
        assistantMsg.content = typeof res.data === 'string' ? res.data : '分析完成，建议您带宠物进行专业检查。'
        scrollToBottom()
      },
      fail: () => {
        assistantMsg.loading = false
        assistantMsg.content = '抱歉，系统繁忙，请稍后再试。'
      },
      complete: () => {
        loading.value = false
      }
    })
  } catch (e) {
    assistantMsg.loading = false
    loading.value = false
  }
}

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight
  
  scrollToBottom()
  
  // 监听键盘高度
  uni.onKeyboardHeightChange(res => {
    keyboardHeight.value = res.height
    if (res.height > 0) scrollToBottom()
  })
})
</script>

<style lang="scss">
.ai-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F8FAFC;
}

.chat-scroll {
  flex: 1;
  padding: 0 30rpx;
  box-sizing: border-box;
}

/* 导航栏样式 */
.nav-header {
  background-color: #fff;
  border-bottom: 1rpx solid #F0F4F8;
  z-index: 100;
  
  .nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    
    .back-btn {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    
    .title {
      font-size: 32rpx;
      font-weight: 900;
      color: #2C3E50;
    }
    
    .placeholder {
      width: 80rpx;
    }
  }
}

.chat-container {
  padding-top: 30rpx;
}

.message-wrapper {
  display: flex;
  margin-bottom: 40rpx;
  
  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
    background-color: #fff;
    flex-shrink: 0;
  }
  
  .bubble {
    max-width: 75%;
    padding: 24rpx 32rpx;
    border-radius: 32rpx;
    font-size: 28rpx;
    line-height: 1.6;
    position: relative;
    word-break: break-all;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
  }
  
  &.assistant {
    flex-direction: row;
    .bubble {
      margin-left: 20rpx;
      background-color: #fff;
      color: #2C3E50;
      border-top-left-radius: 4rpx;
      border: 1rpx solid #EDF2F7;
    }
  }
  
  &.user {
    flex-direction: row-reverse;
    .bubble {
      margin-right: 20rpx;
      background: linear-gradient(135deg, #4A569D 0%, #5C6BC0 100%);
      color: #fff;
      border-top-right-radius: 4rpx;
      box-shadow: 0 8rpx 20rpx rgba(74, 86, 157, 0.2);
    }
  }
}

.typing {
  display: flex;
  gap: 8rpx;
  padding: 10rpx 0;
  
  .dot {
    width: 12rpx;
    height: 12rpx;
    background-color: #ccc;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}

.input-area {
  padding: 20rpx 30rpx 60rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  position: fixed;
  left: 0;
  right: 0;
  z-index: 100;
  
  .input-wrapper {
    display: flex;
    align-items: flex-end;
    background-color: #f8f8f8;
    border-radius: 40rpx;
    padding: 10rpx 30rpx;
    
    .input {
      flex: 1;
      padding: 16rpx 0;
      font-size: 28rpx;
      max-height: 200rpx;
    }
    
    .send-btn {
      width: 70rpx;
      height: 70rpx;
      background-color: #ccc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 20rpx;
      margin-bottom: 6rpx;
      transition: all 0.2s;
      
      &.active {
        background-color: #FF7043;
      }
    }
  }
}

.spacing {
  height: 200rpx;
}
</style>
