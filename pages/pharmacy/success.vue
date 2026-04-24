<template>
  <view class="success-page">
    <view class="content">
      <view class="icon-box">
        <uni-icons type="checkbox-filled" size="80" color="#10B981" />
      </view>
      <text class="title">支付成功</text>
      <text class="desc">您的订单已处理，药品将尽快为您准备。</text>
      
      <view class="btn-group">
        <button class="btn primary" @tap="goToHome">回首页</button>
        <button class="btn secondary" @tap="goToPharmacy">继续购买</button>
      </view>
    </view>
  </view>
</template>

<script setup>
const goToHome = () => {
  console.log('Navigating to Home via reLaunch')
  uni.reLaunch({ url: '/pages/index/index' })
}
const goToPharmacy = () => {
  console.log('Navigating to Pharmacy via switchTab')
  uni.switchTab({ url: '/pages/pharmacy/index' })
}
</script>

<style lang="scss" scoped>
.success-page {
  height: 100vh; background: #fff;
  display: flex; align-items: center; justify-content: center;
  padding: 0 60rpx;
}
.content {
  display: flex; flex-direction: column; align-items: center; width: 100%;
}
.icon-box { margin-bottom: 40rpx; }
.title { font-size: 40rpx; font-weight: 800; color: #1E293B; margin-bottom: 20rpx; }
.desc { font-size: 26rpx; color: #94A3B8; text-align: center; margin-bottom: 80rpx; }
.btn-group { width: 100%; display: flex; flex-direction: column; gap: 30rpx; }
.btn {
  width: 100%; height: 100rpx; border-radius: 30rpx; font-weight: 800; font-size: 30rpx;
  display: flex; align-items: center; justify-content: center;
  &.primary { background: #111827; color: #fff; }
  &.secondary { background: #F1F5F9; color: #1E293B; }
}
</style>
