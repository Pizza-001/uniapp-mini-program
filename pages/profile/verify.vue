<template>
  <view class="verify-page">
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <uni-icons type="left" size="24" color="#2D3436" />
      </view>
      <text class="title">实名认证</text>
      <view style="width: 48rpx"></view>
    </view>

    <view class="content">
      <view class="header-section">
        <view class="icon-box" :class="{ verified: isVerified }">
          <uni-icons :type="isVerified ? 'checkmark-empty' : 'auth-filled'" size="40" :color="isVerified ? '#fff' : '#00B894'" />
        </view>
        <text class="h-title">{{ isVerified ? '已通过实名认证' : '身份实名认证' }}</text>
        <text class="h-desc">{{ isVerified ? '您的身份信息已核验通过，享受完整医疗服务保障。' : '为了保障您的账号安全及享受完整的医疗服务，请完成实名认证。' }}</text>
      </view>

      <view class="form-card">
        <view class="form-item">
          <text class="label">真实姓名</text>
          <input class="input" v-model="form.realName" :disabled="isVerified" placeholder="请输入您的真实姓名" placeholder-style="color:#B2BEC3" />
        </view>
        <view class="divider"></view>
        <view class="form-item">
          <text class="label">身份证号</text>
          <input class="input" v-model="displayIdCard" :disabled="isVerified" placeholder="请输入18位二代身份证号" maxlength="18" placeholder-style="color:#B2BEC3" />
        </view>
      </view>

      <view class="security-tips">
        <uni-icons type="info" size="14" color="#B2BEC3" />
        <text>您的信息已加密处理，仅用于实名核验</text>
      </view>

      <button v-if="!isVerified" class="submit-btn" :loading="loading" @tap="handleSubmit">提交认证</button>
      <button v-else class="submit-btn verified-btn" disabled>已认证</button>
      
      <view class="protocol" v-if="!isVerified">
        <checkbox :checked="true" color="#00B894" style="transform: scale(0.6)" />
        <text>同意并阅读 <text class="link">《实名信息授权协议》</text></text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { userApi } from '@/api/index.js'

const form = ref({
  realName: '',
  idCard: ''
})
const isVerified = ref(false)
const loading = ref(false)

const displayIdCard = computed({
  get: () => {
    if (isVerified.value && form.value.idCard) {
      // 身份证脱敏：前3位和后4位保留，中间掩码
      return form.value.idCard.replace(/^(.{3})(?:\d+)(.{4})$/, "$1***********$2")
    }
    return form.value.idCard
  },
  set: (val) => {
    form.value.idCard = val
  }
})

onMounted(async () => {
  await loadProfile()
})

const loadProfile = async () => {
  const res = await userApi.getProfile()
  if (res.code === 200 && res.data) {
    const user = res.data
    if (user.isVerified === '1') {
      isVerified.value = true
      form.value.realName = user.realName
      form.value.idCard = user.idCard
    }
  }
}

const goBack = () => uni.navigateBack()

const handleSubmit = async () => {
  if (isVerified.value) return
  
  if (!form.value.realName) {
    return uni.showToast({ title: '请输入真实姓名', icon: 'none' })
  }
  
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  if (!idCardRegex.test(form.value.idCard)) {
    return uni.showToast({ title: '身份证格式不正确', icon: 'none' })
  }

  loading.value = true
  try {
    const res = await userApi.verifyRealName({
      realName: form.value.realName,
      idCard: form.value.idCard
    })
    if (res.code === 200) {
      uni.showToast({ title: '认证成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.verify-page {
  min-height: 100vh;
  background: #F8FAFC;
}

.nav-header {
  height: 88rpx; display: flex; align-items: center; justify-content: space-between;
  padding: 80rpx 40rpx 20rpx; background: #fff;
  .title { font-size: 34rpx; font-weight: 800; color: #2D3436; }
  .back-btn { width: 48rpx; height: 48rpx; display: flex; align-items: center; }
}

.content {
  padding: 60rpx 40rpx;
}

.header-section {
  display: flex; flex-direction: column; align-items: center; margin-bottom: 60rpx;
  .icon-box {
    width: 120rpx; height: 120rpx; background: rgba(0, 184, 148, 0.1);
    border-radius: 40rpx; display: flex; align-items: center; justify-content: center;
    margin-bottom: 30rpx;
    &.verified { background: #00B894; }
  }
  .h-title { font-size: 40rpx; font-weight: 800; color: #2D3436; margin-bottom: 16rpx; }
  .h-desc { font-size: 26rpx; color: #636E72; text-align: center; line-height: 1.6; padding: 0 40rpx; }
}

.form-card {
  background: #fff; border-radius: 30rpx; padding: 10rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.02);
  .form-item {
    padding: 30rpx 0;
    .label { font-size: 26rpx; color: #B2BEC3; font-weight: 700; display: block; margin-bottom: 16rpx; }
    .input { font-size: 32rpx; font-weight: 700; color: #2D3436; }
  }
  .divider { height: 2rpx; background: #F8FAFC; }
}

.security-tips {
  display: flex; align-items: center; gap: 10rpx; margin-top: 30rpx; padding: 0 10rpx;
  text { font-size: 22rpx; color: #B2BEC3; }
}

.submit-btn {
  margin-top: 80rpx; background: #00B894; color: #fff; font-size: 32rpx; font-weight: 800;
  height: 110rpx; line-height: 110rpx; border-radius: 20rpx; border: none;
  box-shadow: 0 20rpx 40rpx rgba(0, 184, 148, 0.2);
  &.verified-btn { background: #B2BEC3; box-shadow: none; }
}

.protocol {
  margin-top: 40rpx; display: flex; align-items: center; justify-content: center; gap: 4rpx;
  font-size: 22rpx; color: #636E72;
  .link { color: #00B894; font-weight: 700; }
}
</style>
