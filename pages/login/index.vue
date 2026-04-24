<template>
  <view class="page">
    <view class="login-header">
      <image class="logo" src="/static/images/logo_purple.png" mode="aspectFit" />
      <text class="title">身份确认</text>
      <text class="subtitle">欢迎使用宠爱之城 3.0 系统</text>
    </view>

    <!-- 登录方式切换 -->
    <view class="tab-row">
      <view class="tab-item" :class="{ active: loginType === 'account' }" @tap="loginType = 'account'">账号登录</view>
      <view class="tab-item" :class="{ active: loginType === 'phone' }" @tap="loginType = 'phone'">手机号登录</view>
      <view class="slider" :style="{ left: loginType === 'account' ? '0%' : '50%' }" />
    </view>

    <view class="login-form">
      <!-- 账号登录表单 -->
      <block v-if="loginType === 'account'">
        <view class="input-item">
          <uni-icons type="person" size="20" color="#B2BEC3" />
          <input v-model="form.username" placeholder="请输入用户名" />
        </view>
        
        <view class="input-item">
          <uni-icons type="locked" size="20" color="#B2BEC3" />
          <input v-model="form.password" type="password" placeholder="请输入密码" />
        </view>

        <view class="input-item captcha-item" v-if="captchaEnabled">
          <view class="captcha-input-wrap">
            <uni-icons type="compose" size="20" color="#B2BEC3" />
            <input v-model="form.code" placeholder="图形验证码" maxlength="5" />
          </view>
          <image :src="captchaImg" @tap="getCaptcha" class="captcha-img" mode="aspectFit" />
        </view>
      </block>

      <!-- 手机号登录表单 -->
      <block v-else>
        <view class="input-item">
          <uni-icons type="phone" size="20" color="#B2BEC3" />
          <input v-model="form.phonenumber" type="number" maxlength="11" placeholder="请输入手机号" />
        </view>

        <view class="input-item sms-item">
          <view class="sms-input-wrap">
            <uni-icons type="mail" size="20" color="#B2BEC3" />
            <input v-model="form.smsCode" type="number" maxlength="6" placeholder="验证码" />
          </view>
          <view class="btn-get-code" :class="{ disabled: countdown > 0 }" @tap="handleGetSmsCode">
            {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
          </view>
        </view>
      </block>

      <view class="btn-login" @tap="handleLogin">立即登录</view>
      
      <view class="footer-links">
        <text class="link" @tap="goToRegister">注册新账号</text>
        <text class="divider">|</text>
        <text class="link">找回密码</text>
      </view>

      <view class="agreement-row">
        <checkbox :checked="isAgreed" @tap="isAgreed = !isAgreed" color="#7986CB" style="transform:scale(0.7)" />
        <text class="agreement-text">我已阅读并同意<text class="link-text">《用户协议》</text>与<text class="link-text">《隐私政策》</text></text>
      </view>
    </view>

    <view class="third-party">
      <view class="divider-row">
        <view class="line" />
        <text class="divider-text">其他登录方式</text>
        <view class="line" />
      </view>
      <view class="platform-list">
        <view class="platform-item" @tap="quickLogin('weixin')">
          <image class="p-icon" src="/static/icons/wx.png" />
          <text>微信</text>
        </view>
        <view class="platform-item" @tap="quickLogin('alipay')">
          <image class="p-icon" src="/static/icons/alipay.png" />
          <text>支付宝</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { authApi } from '@/api/index.js'

const loginType = ref('account') // 'account' or 'phone'
const countdown = ref(0)
let timer = null

const form = reactive({
  username: '',
  password: '',
  code: '',
  uuid: '',
  phonenumber: '',
  smsCode: ''
})

const captchaEnabled = ref(true)
const captchaImg = ref('')
const isAgreed = ref(false)

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

const handleGetSmsCode = async () => {
  if (countdown.value > 0) return
  if (!form.phonenumber || form.phonenumber.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  try {
    const res = await authApi.getSmsCode({ phonenumber: form.phonenumber })
    // 用户要求：弄个提示框提示出来
    uni.showModal({
      title: '模拟收到短信',
      content: `您的短信验证码为：${res.data}，请于5分钟内输入。`,
      showCancel: false,
      confirmText: '我知道了'
    })
    
    // 开始倒计时
    countdown.value = 60
    timer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--
      } else {
        clearInterval(timer)
      }
    }, 1000)
  } catch (e) {
    console.error('获取验证码失败', e)
  }
}

const handleLogin = async () => {
  if (!isAgreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }

  if (loginType.value === 'account') {
    if (!form.username || !form.password) {
      uni.showToast({ title: '请输入用户名和密码', icon: 'none' })
      return
    }
    if (captchaEnabled.value && !form.code) {
      uni.showToast({ title: '请输入图形验证码', icon: 'none' })
      return
    }
  } else {
    if (!form.phonenumber || !form.smsCode) {
      uni.showToast({ title: '请填写手机号和验证码', icon: 'none' })
      return
    }
  }

  uni.showLoading({ title: '正在登录...', mask: true })
  try {
    let res
    if (loginType.value === 'account') {
      res = await authApi.login(form)
    } else {
      res = await authApi.smsLogin(form)
    }
    
    uni.setStorageSync('token', res.token)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1000)
  } catch (e) {
    if (loginType.value === 'account') getCaptcha()
  } finally {
    uni.hideLoading()
  }
}

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/index' })
}

const quickLogin = (type) => {
  uni.showToast({ title: `${type === 'weixin' ? '微信' : '支付宝'}快捷登录开发中`, icon: 'none' })
}

onMounted(() => {
  getCaptcha()
})
</script>

<style lang="scss" scoped>
.page {
  padding: 80rpx 60rpx;
  background: #F8FAFC;
  min-height: 100vh;
}

.login-header {
  margin-bottom: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  .logo { width: 140rpx; height: 140rpx; margin-bottom: 30rpx; border-radius: 30rpx; box-shadow: 0 10rpx 30rpx rgba(92, 107, 192, 0.1); }
  .title { font-size: 52rpx; font-weight: 800; color: #2D3436; margin-bottom: 12rpx; letter-spacing: 2rpx; }
  .subtitle { font-size: 26rpx; color: #B2BEC3; }
}

.tab-row {
  display: flex;
  position: relative;
  margin-bottom: 60rpx;
  background: #EDF2F7;
  border-radius: 30rpx;
  padding: 8rpx;
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    font-size: 28rpx;
    color: #636E72;
    transition: all 0.3s;
    z-index: 2;
    &.active {
      color: #fff;
    }
  }
  .slider {
    position: absolute;
    width: calc(50% - 16rpx);
    height: calc(100% - 16rpx);
    background: #7986CB;
    border-radius: 24rpx;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.login-form {
  .input-item {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx 32rpx;
    margin-bottom: 32rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
    border: 1rpx solid transparent;
    transition: all 0.3s;
    &:focus-within {
      border-color: #7986CB;
      background: #fff;
    }
    input { flex: 1; margin-left: 20rpx; font-size: 28rpx; }
  }

  .captcha-item, .sms-item {
    background: transparent;
    padding: 0;
    box-shadow: none;
    .captcha-input-wrap, .sms-input-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      background: #fff;
      border-radius: 20rpx;
      padding: 24rpx 32rpx;
      margin-right: 20rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
    }
    .captcha-img {
      width: 180rpx;
      height: 84rpx;
      border-radius: 12rpx;
    }
    .btn-get-code {
      width: 180rpx;
      height: 84rpx;
      background: #E8EAF6;
      color: #5C6BC0;
      font-size: 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      &.disabled {
        color: #999;
        background: #F5F5F5;
      }
    }
  }

  .btn-login {
    background: linear-gradient(135deg, #5C6BC0, #7986CB);
    color: #fff;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 30rpx;
    margin-top: 60rpx;
    font-size: 32rpx;
    font-weight: bold;
    box-shadow: 0 8rpx 30rpx rgba(92, 107, 192, 0.3);
  }

  .footer-links {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40rpx;
    .link { font-size: 26rpx; color: #5C6BC0; }
    .divider { margin: 0 20rpx; color: #E0E4E8; }
  }

  .agreement-row {
    margin-top: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    .agreement-text { font-size: 22rpx; color: #B2BEC3; }
    .link-text { color: #5C6BC0; }
  }
}

.third-party {
  margin-top: 80rpx;
  .divider-row {
    display: flex; align-items: center; justify-content: center; gap: 20rpx; margin-bottom: 40rpx;
    .line { flex: 1; height: 1rpx; background: #EDF2F7; }
    .divider-text { font-size: 22rpx; color: #B2BEC3; }
  }
  .platform-list {
    display: flex; justify-content: center; gap: 80rpx;
    .platform-item {
      display: flex; flex-direction: column; align-items: center; gap: 12rpx;
      .p-icon { width: 72rpx; height: 72rpx; }
      text { font-size: 22rpx; color: #B2BEC3; }
    }
  }
}
</style>
