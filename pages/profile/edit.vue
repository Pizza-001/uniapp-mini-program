<template>
  <view class="edit-profile">
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <uni-icons type="left" size="24" color="#2D3436" />
      </view>
      <text class="title">编辑资料</text>
      <view class="save-btn" @tap="handleSave">保存</view>
    </view>

    <view class="edit-content">
      <!-- 头像上传区 -->
      <view class="avatar-section" @tap="handleUploadAvatar">
        <image class="avatar" :src="formatImageUrl(form.avatar)" mode="aspectFill" />
        <view class="camera-icon">
          <uni-icons type="camera-filled" size="16" color="#fff" />
        </view>
        <text class="tip">点击更换头像</text>
      </view>

      <view class="form-group">
        <view class="form-item">
          <text class="label">登录账号</text>
          <input class="input disabled" v-model="form.userName" disabled />
          <uni-icons type="lock-filled" size="14" color="#DFE6E9" />
        </view>
        
        <view class="form-item">
          <text class="label">用户昵称</text>
          <input class="input" v-model="form.nickName" placeholder="起个响亮的昵称吧" />
        </view>

        <view class="form-item">
          <text class="label">性别</text>
          <picker @change="handleSexChange" :value="sexIndex" :range="sexRange">
            <view class="picker-value">
              <text>{{ sexRange[sexIndex] }}</text>
              <uni-icons type="right" size="14" color="#B2BEC3" />
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">电子邮箱</text>
          <input class="input" v-model="form.email" placeholder="绑定邮箱，安全加倍" />
        </view>
      </view>

      <view class="notice-card">
        <uni-icons type="info" size="14" color="#6366F1" />
        <text class="text">账号名是您的唯一身份标识，暂不支持修改。如需注销账号请联系 HIS 平台管理员。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi, formatImageUrl } from '@/api/index.js'

const form = ref({
  userName: '',
  nickName: '',
  sex: '0',
  email: '',
  avatar: ''
})

const sexRange = ['未知', '男', '女']
const sexIndex = ref(0)

const goBack = () => uni.navigateBack()

const fetchProfile = async () => {
  try {
    const res = await userApi.getProfile()
    const user = res.data
    form.value = {
      userName: user.userName,
      nickName: user.nickName,
      sex: user.sex || '0',
      email: user.email,
      avatar: user.avatar
    }
    sexIndex.value = parseInt(user.sex) || 0
  } catch (e) {}
}

const handleSexChange = (e) => {
  sexIndex.value = e.detail.value
  form.value.sex = sexIndex.value.toString()
}

const handleUploadAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      uni.showLoading({ title: '上传中...' })
      try {
        const uploadRes = await userApi.uploadAvatar(res.tempFilePaths[0])
        if (uploadRes.code === 200) {
          form.value.avatar = uploadRes.imgUrl
          uni.showToast({ title: '头像已更新', icon: 'success' })
        }
      } catch (e) {
        uni.showToast({ title: '上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

const handleSave = async () => {
  if (!form.value.nickName) {
    uni.showToast({ title: '昵称不能为空', icon: 'none' })
    return
  }
  
  uni.showLoading({ title: '保存中...' })
  try {
    await userApi.updateProfile({
      nickName: form.value.nickName,
      sex: form.value.sex,
      email: form.value.email
    })
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } catch (e) {
  } finally {
    uni.hideLoading()
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style lang="scss" scoped>
.edit-profile {
  height: 100vh; background: #F8FAFC; display: flex; flex-direction: column;
}

.nav-header {
  height: 88rpx; display: flex; align-items: center; justify-content: space-between;
  padding: 80rpx 40rpx 20rpx; background: #fff;
  .title { font-size: 34rpx; font-weight: 800; color: #2D3436; }
  .back-btn { width: 80rpx; height: 48rpx; display: flex; align-items: center; }
  .save-btn { font-size: 30rpx; font-weight: 800; color: #6366F1; width: 80rpx; text-align: right; }
}

.edit-content { flex: 1; padding: 40rpx; }

.avatar-section {
  display: flex; flex-direction: column; align-items: center; margin-bottom: 60rpx;
  position: relative;
  .avatar { width: 180rpx; height: 180rpx; border-radius: 90rpx; background: #fff; border: 4rpx solid #fff; box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.05); }
  .camera-icon {
    position: absolute; bottom: 50rpx; right: calc(50% - 90rpx);
    width: 48rpx; height: 48rpx; background: #6366F1; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; border: 4rpx solid #F8FAFC;
  }
  .tip { margin-top: 20rpx; font-size: 24rpx; color: #B2BEC3; font-weight: 600; }
}

.form-group {
  background: #fff; border-radius: 36rpx; overflow: hidden;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.02);
  .form-item {
    display: flex; align-items: center; padding: 36rpx 40rpx;
    &:not(:last-child) { border-bottom: 2rpx solid #F8FAFC; }
    .label { width: 160rpx; font-size: 28rpx; color: #636E72; font-weight: 600; }
    .input { flex: 1; font-size: 30rpx; color: #2D3436; font-weight: 700; 
      &.disabled { color: #B2BEC3; }
    }
    .picker-value { flex: 1; display: flex; justify-content: space-between; align-items: center;
      text { font-size: 30rpx; color: #2D3436; font-weight: 700; }
    }
  }
}

.notice-card {
  margin-top: 40rpx; padding: 30rpx; background: rgba(99, 102, 241, 0.05); border-radius: 24rpx;
  display: flex; gap: 16rpx;
  .text { font-size: 22rpx; color: #6366F1; line-height: 1.5; font-weight: 600; flex: 1; }
}
</style>
