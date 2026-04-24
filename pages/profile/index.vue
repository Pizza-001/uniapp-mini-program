<template>
  <view class="page">
    <scroll-view scroll-y class="scroll-view">
      <!-- 个人中心头部 -->
      <view class="profile-header">
        <view class="header-glass-bg"></view>
        <view class="top-padding" :style="{ height: statusBarHeight + 'px' }"></view>
        <view class="top-row">
          <view class="user-main" @tap="handleUserClick">
            <view class="avatar-box">
              <image class="avatar" :src="userInfo && userInfo.avatar ? (BASE_URL + userInfo.avatar) : '/static/icons/profile.png'" mode="aspectFill" />
              <view class="badge-vip">V{{ memberInfo.level || 0 }}</view>
            </view>
            <view class="user-meta">
              <view class="name-row">
                <text class="name">{{ userInfo ? (userInfo.nickName || userInfo.userName) : '点击登录' }}</text>
                <view class="level-tag" v-if="userInfo">{{ parseLevel(memberInfo.level) }}</view>
              </view>
              <text class="tag">{{ userInfo ? '宠爱守护者 · 全城宠爱' : '登录开启智慧宠医生活' }}</text>
            </view>
          </view>
          <view class="settings-icon" @tap="uni.showToast({title:'设置开发中',icon:'none'})">
            <!-- 即使 uni-icons 出错，这里也有文字或背景兜底 -->
            <uni-icons type="gear-filled" size="24" color="#fff" />
          </view>
        </view>

        <!-- 会员卡片 -->
        <view class="membership-card">
          <view class="card-gloss"></view>
          <view class="card-content">
            <view class="c-top">
              <view class="brand">
                <view class="icon-crown"></view>
                <text class="brand-text">PLATINUM MEMBER</text>
              </view>
              <view class="status-tag">ACTIVE</view>
            </view>
            <view class="c-mid">
              <text class="card-num">8888 6666 0000 {{ userInfo ? (userInfo.userId % 10000) : '7829' }}</text>
            </view>
            <view class="c-bottom">
              <view class="exp-info">
                <text class="label">EXPIRY DATE</text>
                <text class="val">PERMANENT</text>
              </view>
              <view class="recharge-btn" @tap="navigateTo('/pages/profile/recharge')">
                <text>立即充值</text>
                <view class="icon-arrow"></view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="main-container">
        <!-- 资产数据 -->
        <view class="asset-grid card">
          <view class="asset-item" @tap="navigateTo('/pages/profile/recharge')">
            <view class="val"><text class="unit">¥</text>{{ memberInfo.balance || 0 }}</view>
            <text class="label">账户余额</text>
          </view>
          <view class="asset-item" @tap="navigateTo('/pages/profile/points')">
            <view class="val">{{ memberInfo.points || 0 }}</view>
            <text class="label">我的积分</text>
          </view>
          <view class="asset-item" @tap="navigateTo('/pages/profile/coupons')">
            <view class="val">3</view>
            <text class="label">优惠券</text>
          </view>
        </view>

        <!-- 常用功能 - 采用 CSS 绘制图标 + SVG 背景方案，解决 uni-icons 不显示问题 -->
        <view class="function-section card">
          <view class="section-title">
            <text>我的服务</text>
            <text class="all" @tap="uni.showToast({title:'更多功能开发中',icon:'none'})">全部服务</text>
          </view>
          <view class="function-grid">
            <view class="f-item" @tap="navigateTo('/pages/record/index')">
              <view class="f-icon-wrap" style="background: #E8EAF6">
                <image src="https://img.icons8.com/color/96/medical-history.png" class="f-icon-img" />
              </view>
              <text class="f-label">挂号记录</text>
            </view>
            <view class="f-item" @tap="navigateTo('/pages/pet/index')">
              <view class="f-icon-wrap" style="background: #FFF3E0">
                <image src="https://img.icons8.com/color/96/dog.png" class="f-icon-img" />
              </view>
              <text class="f-label">宠物档案</text>
            </view>
            <view class="f-item" @tap="navigateTo('/pages/profile/recharge')">
              <view class="f-icon-wrap" style="background: #E3F2FD">
                <image src="https://img.icons8.com/color/96/wallet.png" class="f-icon-img" />
              </view>
              <text class="f-label">充值中心</text>
            </view>
            <view class="f-item" @tap="navigateTo('/pages/profile/favorites')">
              <view class="f-icon-wrap" style="background: #FFEBEE">
                <image src="https://img.icons8.com/color/96/filled-star.png" class="f-icon-img" />
              </view>
              <text class="f-label">我的收藏</text>
            </view>
          </view>
        </view>

        <view class="menu-card card">
          <view class="menu-item" v-for="(m, i) in menuList" :key="m.label" @tap="navigateTo(m.url)">
            <view class="m-left">
              <view class="m-dot" :style="{ background: m.color }"></view>
              <text>{{ m.label }}</text>
            </view>
            <uni-icons type="right" size="14" color="#DCDFE6" />
          </view>
        </view>

        <view class="logout-action" @tap="handleLogout">退出当前账号</view>
        <view class="safe-bottom" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi, authApi, memberApi, BASE_URL } from '@/api/index.js'
import { onShow } from '@dcloudio/uni-app'

const statusBarHeight = ref(0)
const userInfo = ref(null)
const memberInfo = ref({ level: '0', balance: 0, points: 0 })

const parseLevel = (levelStr) => {
  const levels = { '3': '钻石会员', '2': '黄金会员', '1': '白银会员' }
  return levels[levelStr] || '普通会员'
}

const menuList = [
  { label: '预约记录', color: '#5C6BC0', url: '/pages/record/index' },
  { label: '就诊人管理', color: '#42A5F5', url: '#' },
  { label: '地址管理', color: '#66BB6A', url: '#' },
  { label: '在线客服', color: '#f39c12', url: '#' },
]

const navigateTo = (url) => uni.navigateTo({ url })

const handleUserClick = () => {
  if (!uni.getStorageSync('token')) navigateTo('/pages/login/index')
}

const getUserInfo = async () => {
  try {
    const res = await userApi.getInfo()
    userInfo.value = res.user
  } catch (e) {}
}

const getMemberAsset = async () => {
  try {
    const res = await memberApi.getMemberInfo()
    if(res.code === 200 && res.data) memberInfo.value = res.data
  } catch(e) {}
}

const handleLogout = () => {
  uni.showModal({
    title: '提示', content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try { await authApi.logout() } catch (e) {}
        uni.removeStorageSync('token'); uni.reLaunch({ url: '/pages/login/index' })
      }
    }
  })
}

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
})

onShow(() => {
  if (uni.getStorageSync('token')) {
    getUserInfo(); getMemberAsset()
  }
})
</script>

<style lang="scss" scoped>
.page { background: #F4F7FC; min-height: 100vh; }
.scroll-view { height: 100%; }

.profile-header {
  position: relative;
  background: linear-gradient(135deg, #5C6BC0 0%, #3F51B5 100%);
  padding: 0 40rpx 160rpx;
  border-bottom-left-radius: 60rpx;
  border-bottom-right-radius: 60rpx;
  
  .header-glass-bg {
    position: absolute; top: -100rpx; right: -100rpx; width: 400rpx; height: 400rpx;
    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
  }
  
  .top-row {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 60rpx; margin-top: 30rpx;
    position: relative; z-index: 5;
    .user-main {
      display: flex; align-items: center; gap: 30rpx;
      .avatar-box {
        position: relative;
        .avatar { width: 120rpx; height: 120rpx; border-radius: 50%; border: 4rpx solid rgba(255,255,255,0.4); }
        .badge-vip { 
          position: absolute; bottom: 0; right: -8rpx; background: #F1C40F; color: #fff; 
          font-size: 18rpx; font-weight: 900; padding: 2rpx 10rpx; border-radius: 100rpx; 
          border: 4rpx solid #3F51B5;
        }
      }
      .user-meta {
        .name-row { display: flex; align-items: center; gap: 16rpx; .name { font-size: 38rpx; font-weight: 800; color: #fff; } .level-tag { font-size: 18rpx; color: #fff; background: rgba(255,255,255,0.2); padding: 2rpx 10rpx; border-radius: 6rpx; } }
        .tag { font-size: 22rpx; color: rgba(255,255,255,0.7); margin-top: 4rpx; display: block; }
      }
    }
    .settings-icon { width: 72rpx; height: 72rpx; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.15); border-radius: 50%; }
  }
}

.membership-card {
  position: relative; height: 320rpx; border-radius: 40rpx; overflow: hidden;
  background: linear-gradient(135deg, #2D3436 0%, #000000 100%);
  box-shadow: 0 40rpx 80rpx rgba(0,0,0,0.3);
  
  .card-gloss { position: absolute; top: -100rpx; left: -100rpx; width: 400rpx; height: 400rpx; background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 80%); }
  
  .card-content {
    position: relative; z-index: 2; height: 100%; padding: 40rpx 50rpx;
    display: flex; flex-direction: column; justify-content: space-between;
    box-sizing: border-box;
    .c-top {
      display: flex; justify-content: space-between; align-items: center;
      .brand { 
        display: flex; align-items: center; gap: 12rpx; 
        .icon-crown { width: 32rpx; height: 32rpx; background: #F1C40F; clip-path: polygon(50% 0%, 100% 100%, 0% 100%); }
        .brand-text { font-size: 24rpx; color: rgba(255,255,255,0.9); font-weight: 800; letter-spacing: 4rpx; } 
      }
      .status-tag { font-size: 16rpx; color: #66BB6A; border: 2rpx solid #66BB6A; padding: 4rpx 12rpx; border-radius: 8rpx; font-weight: 900; }
    }
    .c-mid { .card-num { font-size: 36rpx; color: #fff; letter-spacing: 10rpx; font-family: monospace; } }
    .c-bottom {
      display: flex; justify-content: space-between; align-items: flex-end;
      .exp-info { .label { font-size: 14rpx; color: rgba(255,255,255,0.4); font-weight: 800; display: block; } .val { font-size: 20rpx; color: rgba(255,255,255,0.8); font-weight: 600; } }
      .recharge-btn { 
        background: #F1C40F; color: #2D3436; font-size: 24rpx; font-weight: 800; padding: 16rpx 36rpx; border-radius: 100rpx; 
        display: flex; align-items: center; gap: 8rpx; 
        .icon-arrow { width: 12rpx; height: 12rpx; border-right: 3rpx solid #2D3436; border-top: 3rpx solid #2D3436; transform: rotate(45deg); }
      }
    }
  }
}

.main-container { position: relative; z-index: 10; padding: 0 30rpx; margin-top: -80rpx; }
.card { background: #fff; border-radius: 40rpx; padding: 40rpx; margin-bottom: 30rpx; box-shadow: 0 20rpx 40rpx rgba(0,0,0,0.02); }

.asset-grid {
  display: flex; justify-content: space-between; padding: 40rpx;
  .asset-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 12rpx;
    &:not(:last-child) { border-right: 2rpx solid #F1F2F6; }
    .val { font-size: 44rpx; font-weight: 900; color: #2D3436; .unit { font-size: 24rpx; color: #B2BEC3; } }
    .label { font-size: 24rpx; color: #B2BEC3; font-weight: 600; }
  }
}

.function-section {
  .section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx; text { font-size: 32rpx; font-weight: 800; color: #2D3436; } .all { font-size: 24rpx; color: #B2BEC3; font-weight: 600; } }
  .function-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 20rpx;
    .f-item {
      display: flex; flex-direction: column; align-items: center; gap: 20rpx;
      .f-icon-wrap { width: 110rpx; height: 110rpx; border-radius: 36rpx; display: flex; align-items: center; justify-content: center; }
      .f-icon-img { width: 64rpx; height: 64rpx; }
      .f-label { font-size: 26rpx; color: #2D3436; font-weight: 700; }
    }
  }
}

.menu-card {
  padding: 10rpx 40rpx;
  .menu-item {
    display: flex; justify-content: space-between; align-items: center; padding: 40rpx 0; border-bottom: 2rpx solid #F8FAFC;
    &:last-child { border-bottom: none; }
    .m-left { display: flex; align-items: center; gap: 24rpx; text { font-size: 30rpx; color: #2D3436; font-weight: 700; } .m-dot { width: 10rpx; height: 10rpx; border-radius: 50%; } }
  }
}

.logout-action { margin: 60rpx 0; text-align: center; color: #FF7675; font-size: 30rpx; font-weight: 700; padding: 30rpx; }
.safe-bottom { height: 180rpx; }
</style>
