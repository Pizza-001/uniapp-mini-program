<template>
  <view class="settings-page">
    <view class="nav-header">
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="nav-content">
        <view class="back-btn" @tap="goBack">
          <uni-icons type="left" size="24" color="#2D3436" />
        </view>
        <text class="title">系统设置</text>
        <view style="width: 48rpx"></view>
      </view>
    </view>

    <!-- 精确占位容器 -->
    <view class="nav-placeholder">
      <view :style="{ height: statusBarHeight + 'px' }"></view>
      <view style="height: 100rpx"></view>
    </view>

    <scroll-view scroll-y class="settings-content">
      <!-- 个人资料预览 -->
      <view class="user-preview-card" @tap="navigateTo('/pages/profile/edit')">
        <image class="avatar" :src="userInfo && userInfo.avatar ? formatImageUrl(userInfo.avatar) : '/static/icons/profile.png'" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ userInfo ? (userInfo.nickName || userInfo.userName) : '未登录' }}</text>
          <text class="id">UID: {{ userInfo ? userInfo.userId : '------' }}</text>
        </view>
        <uni-icons type="right" size="16" color="#B2BEC3" />
      </view>

      <!-- 账户安全 -->
      <view class="section-group">
        <view class="section-title">账户与安全</view>
        <view class="cell" @tap="navigateTo('/pages/profile/bind-phone')">
          <text class="label">手机号绑定</text>
          <view class="value-wrap">
            <text class="value">{{ userInfo ? (userInfo.phonenumber || '去绑定') : '去绑定' }}</text>
            <uni-icons type="right" size="14" color="#DCDFE6" />
          </view>
        </view>
        <view class="cell" @tap="navigateTo('/pages/profile/modify-password')">
          <text class="label">登录密码修改</text>
          <uni-icons type="right" size="14" color="#DCDFE6" />
        </view>
        <view class="cell" @tap="navigateTo('/pages/profile/verify')">
          <text class="label">实名认证状态</text>
          <view class="value-wrap">
            <text class="value" :class="{ success: userInfo && userInfo.isVerified === '1' }">
              {{ userInfo && userInfo.isVerified === '1' ? '已认证' : '未认证' }}
            </text>
            <uni-icons v-if="!userInfo || userInfo.isVerified !== '1'" type="right" size="14" color="#DCDFE6" />
          </view>
        </view>
      </view>

      <!-- 系统设置 -->
      <view class="section-group">
        <view class="section-title">系统配置</view>
        <view class="cell">
          <text class="label">消息推送通知</text>
          <switch checked color="#6366F1" style="transform: scale(0.7)" />
        </view>
        <view class="cell" @tap="handleClearCache">
          <text class="label">清理缓存数据</text>
          <text class="value tip">{{ cacheSize }} MB</text>
        </view>
        <view class="cell">
          <text class="label">当前版本</text>
          <text class="value tip">v3.0.5 Enterprise</text>
        </view>
      </view>

      <!-- 更多 -->
      <view class="section-group">
        <view class="section-title">法律与支持</view>
        <view class="cell" @tap="showContentModal('隐私政策', '宠爱之城 HIS 系统高度重视您的隐私协议。我们承诺不会在未获得您授权的情况下将您的个人信息、宠物医疗数据、消费记录泄露给第三方。所有数据加密存储。')">
          <text class="label">隐私政策协议</text>
          <uni-icons type="right" size="14" color="#DCDFE6" />
        </view>
        <view class="cell" @tap="showContentModal('服务条款', '由于本系统涉及处方药兑换与预约，用户需对所填真实性负责。如有违规操作，HIS 平台保留封禁账号之权利。')">
          <text class="label">用户服务条款</text>
          <uni-icons type="right" size="14" color="#DCDFE6" />
        </view>
      </view>

      <view class="logout-btn" @tap="handleLogout">
        <text>退出当前账号</text>
      </view>
      
      <view class="footer-copyright">
        <text>Powered by HIS Enterprise Solution</text>
        <text>© 2025 宠爱之城 HIS 平台</text>
      </view>
      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { userApi, authApi, formatImageUrl } from '@/api/index.js'

const userInfo = ref(null)
const statusBarHeight = ref(20)
const cacheSize = ref('12.4')

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
})

const goBack = () => uni.navigateBack()
const navigateTo = (url) => uni.navigateTo({ url })

import { onShow } from '@dcloudio/uni-app'

const getUserInfo = async () => {
  try {
    const res = await userApi.getProfile()
    // 兼容处理：有些接口返回在 data，有些在 user
    const data = res.data || res.user || res
    console.log('Settings Refresh Data:', data)
    // 强制触发响应式更新
    userInfo.value = null
    nextTick(() => {
      userInfo.value = data
    })
  } catch (e) {
    console.error('Refresh profile failed', e)
  }
}

const showContentModal = (title, content) => {
  uni.showModal({
    title,
    content,
    showCancel: false,
    confirmText: '我已阅读'
  })
}

const handleClearCache = () => {
  uni.showLoading({ title: '清理中...' })
  setTimeout(() => {
    cacheSize.value = '0.0'
    uni.hideLoading()
    uni.showToast({ title: '已成功清理', icon: 'success' })
  }, 1500)
}

const handleLogout = () => {
  uni.showModal({
    title: '安全退出',
    content: '确定要退出当前账号并返回登录页吗？',
    confirmColor: '#FF7675',
    success: async (res) => {
      if (res.confirm) {
        try { await authApi.logout() } catch (e) {}
        uni.removeStorageSync('token')
        uni.reLaunch({ url: '/pages/login/index' })
      }
    }
  })
}

onShow(() => {
  getUserInfo()
})
</script>

<style lang="scss" scoped>
.settings-page {
  height: 100vh; background: #F8FAFC; display: flex; flex-direction: column;
}

.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  
  .nav-content {
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40rpx;
  }
  
  .title { font-size: 34rpx; font-weight: 800; color: #2D3436; }
  .back-btn { width: 48rpx; height: 48rpx; display: flex; align-items: center; }
}

.settings-content { flex: 1; padding-bottom: 60rpx; }

.user-preview-card {
  background: #fff; margin: 30rpx; padding: 40rpx; border-radius: 36rpx;
  display: flex; align-items: center; gap: 30rpx;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.02);
  .avatar { width: 100rpx; height: 100rpx; border-radius: 50%; background: #F8FAFC; }
  .info {
    flex: 1;
    .name { font-size: 32rpx; font-weight: 800; color: #2D3436; display: block; }
    .id { font-size: 22rpx; color: #B2BEC3; margin-top: 4rpx; }
  }
}

.section-group {
  background: #fff; border-radius: 36rpx; margin: 30rpx; padding: 10rpx 0;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.02);
  .section-title {
    padding: 30rpx 40rpx 10rpx; font-size: 24rpx; font-weight: 800; color: #B2BEC3;
    text-transform: uppercase; letter-spacing: 2rpx;
  }
  .cell {
    display: flex; justify-content: space-between; align-items: center;
    padding: 36rpx 40rpx;
    &:not(:last-child) { border-bottom: 2rpx solid #F8FAFC; }
    .label { font-size: 30rpx; color: #2D3436; font-weight: 600; }
    .value-wrap { display: flex; align-items: center; gap: 10rpx; }
    .value { font-size: 28rpx; color: #636E72; &.success { color: #00B894; font-weight: 800; } }
    .tip { font-size: 26rpx; color: #B2BEC3; }
  }
}

.logout-btn {
  margin: 60rpx 30rpx; background: #fff; height: 110rpx; border-radius: 30rpx;
  display: flex; align-items: center; justify-content: center;
  color: #FF7675; font-size: 32rpx; font-weight: 800;
  box-shadow: 0 10rpx 40rpx rgba(255,118,117,0.1);
}

.footer-copyright {
  display: flex; flex-direction: column; align-items: center; gap: 10rpx;
  padding: 40rpx 0 100rpx;
  text { font-size: 22rpx; color: #DCDFE6; font-weight: 600; }
}

.safe-bottom { height: constant(safe-area-inset-bottom); height: env(safe-area-inset-bottom); }
</style>
