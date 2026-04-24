<template>
  <view class="bind-phone">
    <!-- 头部自定义导航：扩大返回热区 -->
    <view class="nav-header">
      <view class="back-area" @tap="handleGoBack">
        <uni-icons type="left" size="24" color="#2D3436" />
      </view>
      <text class="title">绑定手机</text>
      <view style="width: 80rpx"></view>
    </view>

    <view class="bind-content">
      <view class="status-section">
        <view class="icon-wrap">
          <uni-icons type="phone-filled" size="48" color="#6366F1" />
        </view>
        <text class="status-title">{{ currentPhone ? '更换绑定手机' : '绑定手机号码' }}</text>
        <text class="status-desc">更换后，原手机号 {{ currentPhone || '---' }} 将失效。</text>
      </view>

      <view class="form-group">
        <view class="input-item">
          <uni-icons type="phone" size="20" color="#B2BEC3" />
          <input class="input" type="number" v-model="form.phonenumber" placeholder="请输入新手机号" maxlength="11" />
        </view>
        
        <view class="input-item">
          <uni-icons type="email" size="20" color="#B2BEC3" />
          <input class="input" type="number" v-model="form.code" placeholder="输入 6 位验证码" maxlength="6" />
          <view class="send-btn" :class="{ disabled: countdown > 0 }" @tap="handleGetCode">
            {{ countdown > 0 ? countdown + 's' : '获取验证码' }}
          </view>
        </view>
      </view>

      <button class="submit-btn" @tap="handleSubmit">立即绑定</button>
      
      <view class="tips">
        <text class="dot">·</text>
        <text>如有疑问，请咨询 HIS 系统管理员</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from '@/api/index.js'

const currentPhone = ref('')
const form = ref({
  phonenumber: '',
  code: ''
})
const countdown = ref(0)
let timer = null

const handleGoBack = () => {
  uni.navigateBack({ delta: 1 })
}

const handleGetCode = () => {
  if (countdown.value > 0) return
  if (!/^1[3-9]\d{9}$/.test(form.value.phonenumber)) {
    uni.showToast({ title: '格式错误', icon: 'none' })
    return
  }
  
  uni.showLoading({ title: '发送中...' })
  setTimeout(() => {
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString()
    uni.hideLoading()
    uni.showModal({
      title: '验证码',
      content: `您的新绑定验证码为：${mockCode}`,
      showCancel: false,
      success: () => { form.value.code = mockCode } // 自动填入方便测试
    })
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  }, 800)
}

const handleSubmit = async () => {
  if (!/^1[3-9]\d{9}$/.test(form.value.phonenumber)) {
    uni.showToast({ title: '手机号无效', icon: 'none' })
    return
  }
  if (!form.value.code) {
    uni.showToast({ title: '请填写验证码', icon: 'none' })
    return
  }

  uni.showLoading({ title: '正在同步...' })
  try {
    // 1. 获取完整数据
    const res = await userApi.getProfile()
    console.log('GetProfile Raw Res:', res)
    
    // 兼容取值：如果是 RuoYi 标准版，用户在 res.data；如果是精简版，在 res 本身
    const user = res.data || res.user || res
    
    // 2. 构造精简且准确的更新对象
    const updateData = {
      userId: user.userId,
      userName: user.userName,
      nickName: user.nickName,
      phonenumber: form.value.phonenumber, // 必须是这个全小写
      email: user.email,
      sex: user.sex || '0'
    }
    
    console.log('Final Update Payload:', updateData)
    
    // 3. 执行更新
    const updateRes = await userApi.updateProfile(updateData)
    if (updateRes.code === 200) {
      uni.showToast({ title: '绑定成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (e) {
    console.error('Submit Error:', e)
  } finally {
    uni.hideLoading()
  }
}

onMounted(async () => {
  try {
    const res = await userApi.getProfile()
    currentPhone.value = (res.data || res.user || {}).phonenumber
  } catch (e) {}
})
</script>

<style lang="scss" scoped>
.bind-phone { height: 100vh; background: #fff; }
.nav-header {
  height: 88rpx; display: flex; align-items: center; justify-content: space-between;
  padding: 80rpx 40rpx 20rpx; background: #fff; border-bottom: 2rpx solid #F8FAFC;
  .title { font-size: 34rpx; font-weight: 800; color: #2D3436; }
  .back-area { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: flex-start; }
}

.bind-content { padding: 60rpx 50rpx; }
.status-section {
  display: flex; flex-direction: column; align-items: center; margin-bottom: 80rpx;
  .icon-wrap { width: 160rpx; height: 160rpx; background: rgba(99, 102, 241, 0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 40rpx; }
  .status-title { font-size: 40rpx; font-weight: 800; color: #2D3436; margin-bottom: 20rpx; }
  .status-desc { font-size: 26rpx; color: #B2BEC3; text-align: center; line-height: 1.6; }
}

.form-group {
  .input-item {
    display: flex; align-items: center; height: 110rpx; background: #F8FAFC; border-radius: 20rpx;
    padding: 0 40rpx; margin-bottom: 30rpx; gap: 20rpx;
    .input { flex: 1; font-size: 30rpx; font-weight: 700; color: #2D3436; }
    .send-btn { font-size: 26rpx; font-weight: 800; color: #6366F1; &.disabled { color: #B2BEC3; } }
  }
}

.submit-btn {
  margin-top: 60rpx; background: #6366F1; color: #fff; font-size: 34rpx; font-weight: 800;
  height: 110rpx; line-height: 110rpx; border-radius: 24rpx; border: none;
  box-shadow: 0 20rpx 40rpx rgba(99, 102, 241, 0.2);
}

.tips {
  margin-top: 60rpx; display: flex; align-items: center; justify-content: center; gap: 10rpx;
  color: #B2BEC3; font-size: 24rpx; .dot { font-size: 40rpx; line-height: 1; }
}
</style>
