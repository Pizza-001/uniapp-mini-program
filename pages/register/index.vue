<template>
  <view class="register-page">
    <view class="bg-decoration"></view>
    <view class="content">
      <view class="header">
        <view class="back-btn" @tap="goBack">
          <uni-icons type="left" size="24" color="#333" />
        </view>
        <text class="title">加入宠爱之城</text>
        <text class="subtitle">开启您与宠物的智慧健康生活</text>
      </view>

      <view class="form-card">
        <view class="input-group">
          <view class="input-item">
            <uni-icons type="person" size="18" color="#FF7043" />
            <input 
              v-model="form.username" 
              placeholder="请设置用户名" 
              class="input"
              placeholder-style="color: #ccc"
            />
          </view>
          <view class="input-item">
            <uni-icons type="locked" size="18" color="#FF7043" />
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="请输入密码" 
              class="input"
              placeholder-style="color: #ccc"
            />
          </view>
          <view class="input-item">
            <uni-icons type="locked-filled" size="18" color="#FF7043" />
            <input 
              v-model="form.confirmPassword" 
              type="password" 
              placeholder="确认密码" 
              class="input"
              placeholder-style="color: #ccc"
            />
          </view>
          
          <!-- 验证码 -->
          <view class="input-item captcha-item" v-if="captchaEnabled">
            <view class="captcha-input-wrap">
              <uni-icons type="compose" size="18" color="#FF7043" />
              <input 
                v-model="form.code" 
                placeholder="验证码" 
                class="input"
                placeholder-style="color: #ccc"
              />
            </view>
            <image 
              :src="captchaImg" 
              @tap="getCaptcha" 
              class="captcha-img" 
              mode="aspectFit" 
            />
          </view>
        </view>

        <button 
          class="register-btn" 
          :loading="loading"
          :disabled="loading"
          @tap="handleRegister"
        >
          注册并登录
        </button>

        <view class="login-tip">
          <text>已有账号？</text>
          <text class="link" @tap="goBack">立即登录</text>
        </view>
      </view>

      <view class="agreement">
        <label class="checkbox" @tap="toggleAgreement">
          <checkbox :checked="agreed" color="#FF7043" style="transform:scale(0.7)" />
          <text class="text">我已阅读并同意 <text class="highlight">《用户协议》</text> 和 <text class="highlight">《隐私政策》</text></text>
        </label>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { authApi } from '@/api/index.js'

const loading = ref(false)
const agreed = ref(false)
const captchaEnabled = ref(true)
const captchaImg = ref('')

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  code: '',
  uuid: ''
})

const goBack = () => {
  uni.navigateBack()
}

const toggleAgreement = () => {
  agreed.value = !agreed.value
}

// 获取验证码
const getCaptcha = async () => {
  try {
    const res = await authApi.getCaptcha()
    captchaImg.value = 'data:image/gif;base64,' + res.img
    form.uuid = res.uuid
    captchaEnabled.value = res.captchaEnabled !== false
  } catch (e) {
    console.error('获取验证码失败', e)
  }
}

const handleRegister = async () => {
  if (!form.username || !form.password) {
    return uni.showToast({ title: '请完整填写', icon: 'none' })
  }
  if (form.password !== form.confirmPassword) {
    return uni.showToast({ title: '两次密码不一致', icon: 'none' })
  }
  if (captchaEnabled.value && !form.code) {
    return uni.showToast({ title: '请输入验证码', icon: 'none' })
  }
  if (!agreed.value) {
    return uni.showToast({ title: '请先同意协议', icon: 'none' })
  }

  loading.value = true
  try {
    // 调用注册接口
    await authApi.register({
      username: form.username,
      password: form.password,
      code: form.code,
      uuid: form.uuid
    })
    
    uni.showToast({ title: '注册成功', icon: 'success' })
    
    // 自动登录或跳回登录
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/login/index' })
    }, 1500)
  } catch (e) {
    getCaptcha() // 失败刷新验证码
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getCaptcha()
})
</script>

<style lang="scss">
// 样式复用登录页风格
.register-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  top: -100rpx;
  right: -100rpx;
  width: 400rpx;
  height: 400rpx;
  background: linear-gradient(135deg, #FF7043, #FFAB91);
  border-radius: 50%;
  opacity: 0.1;
}

.content {
  padding: 60rpx 40rpx;
  position: relative;
  z-index: 1;
}

.header {
  margin-bottom: 60rpx;
  
  .back-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    margin-left: -20rpx;
    margin-bottom: 20rpx;
  }
  
  .title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .subtitle {
    font-size: 26rpx;
    color: #999;
  }
}

.form-card {
  background-color: #fff;
  padding: 60rpx 40rpx;
  border-radius: 32rpx;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.05);
  margin-bottom: 40rpx;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-item {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  padding: 24rpx 30rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  
  .input {
    flex: 1;
    margin-left: 20rpx;
    font-size: 28rpx;
  }
}

.captcha-item {
  background-color: transparent;
  padding: 0;
  justify-content: space-between;
  
  .captcha-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    padding: 24rpx 30rpx;
    border-radius: 16rpx;
    margin-right: 20rpx;
  }
  
  .captcha-img {
    width: 200rpx;
    height: 80rpx;
    border-radius: 12rpx;
    background-color: #eee;
  }
}

.register-btn {
  background: linear-gradient(to right, #FF7043, #FF8A65);
  color: #fff;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 10rpx 30rpx rgba(255, 112, 67, 0.3);
  margin-bottom: 40rpx;
  
  &::after {
    border: none;
  }
}

.login-tip {
  text-align: center;
  font-size: 26rpx;
  color: #666;
  
  .link {
    color: #FF7043;
    margin-left: 10rpx;
    font-weight: bold;
  }
}

.agreement {
  padding: 0 20rpx;
  
  .checkbox {
    display: flex;
    align-items: flex-start;
    
    .text {
      font-size: 24rpx;
      color: #999;
      line-height: 1.6;
      margin-left: 10rpx;
      
      .highlight {
        color: #FF7043;
      }
    }
  }
}
</style>
