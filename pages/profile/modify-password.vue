<template>
  <view class="modify-password">
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <uni-icons type="left" size="24" color="#2D3436" />
      </view>
      <text class="title">修改登录密码</text>
      <view style="width: 80rpx"></view>
    </view>

    <view class="modify-content">
      <view class="safe-banner">
        <uni-icons type="paperplane-filled" size="40" color="#6366F1" />
        <text class="tip">为保障您的账号资产安全，请设置高强度的复杂度密码（字母+数字）。</text>
      </view>

      <view class="form-group">
        <view class="input-item">
          <text class="label">旧密码</text>
          <input class="input" type="password" v-model="form.oldPassword" placeholder="输入当前使用的密码" />
        </view>
        <view class="input-item">
          <text class="label">新密码</text>
          <input class="input" type="password" v-model="form.newPassword" placeholder="设置 6-20 位新密码" />
        </view>
        <view class="input-item">
          <text class="label">确认新密码</text>
          <input class="input" type="password" v-model="form.confirmPassword" placeholder="再次输入新密码" />
        </view>
      </view>

      <button class="submit-btn" :disabled="!isFormValid" @tap="handleUpdate">确认修改</button>
      
      <view class="forget-tip" @tap="uni.showToast({title:'请联系管理员重置',icon:'none'})">
        忘记旧密码？
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { request } from '@/api/index.js'

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const goBack = () => uni.navigateBack()

const isFormValid = computed(() => {
  return form.value.oldPassword && form.value.newPassword && form.value.confirmPassword
})

const handleUpdate = async () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }
  if (form.value.newPassword.length < 6) {
    uni.showToast({ title: '密码长度至少 6 位', icon: 'none' })
    return
  }

  uni.showLoading({ title: '正在修改...' })
  try {
    // 对接 SysProfileController 的 updatePwd 接口
    const res = await request({
      url: '/system/user/profile/updatePwd',
      method: 'PUT',
      data: {
        oldPassword: form.value.oldPassword,
        newPassword: form.value.newPassword
      }
    })
    
    if (res.code === 200) {
      uni.showToast({ title: '密码修改成功', icon: 'success' })
      setTimeout(() => {
        // 修改密码后通常需要重新登录
        uni.removeStorageSync('token')
        uni.reLaunch({ url: '/pages/login/index' })
      }, 1500)
    }
  } catch (e) {
    // 拦截器已处理错误提示
  } finally {
    uni.hideLoading()
  }
}
</script>

<style lang="scss" scoped>
.modify-password {
  height: 100vh; background: #F8FAFC; display: flex; flex-direction: column;
}

.nav-header {
  height: 88rpx; display: flex; align-items: center; justify-content: space-between;
  padding: 80rpx 40rpx 20rpx; background: #fff;
  .title { font-size: 34rpx; font-weight: 800; color: #2D3436; }
}

.modify-content { padding: 40rpx; }

.safe-banner {
  background: #fff; padding: 40rpx; border-radius: 30rpx; display: flex; gap: 24rpx; align-items: center;
  margin-bottom: 40rpx;
  .tip { flex: 1; font-size: 26rpx; color: #636E72; line-height: 1.5; font-weight: 600; }
}

.form-group {
  background: #fff; border-radius: 36rpx; overflow: hidden; padding: 10rpx 40rpx;
  .input-item {
    padding: 36rpx 0;
    &:not(:last-child) { border-bottom: 2rpx solid #F8FAFC; }
    .label { display: block; font-size: 26rpx; color: #B2BEC3; margin-bottom: 16rpx; font-weight: 700; }
    .input { font-size: 32rpx; font-weight: 800; color: #2D3436; }
  }
}

.submit-btn {
  margin-top: 60rpx; background: #6366F1; color: #fff; font-size: 32rpx; font-weight: 800;
  height: 100rpx; line-height: 100rpx; border-radius: 20rpx; border: none;
  &[disabled] { opacity: 0.5; }
}

.forget-tip { text-align: center; margin-top: 40rpx; font-size: 28rpx; color: #B2BEC3; font-weight: 600; }
</style>
