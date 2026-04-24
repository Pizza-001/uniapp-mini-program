<template>
  <view class="container">
    <view class="header-card">
      <view class="total-points">
        <text class="label">当前可用积分</text>
        <text class="value">{{ memberInfo.points || 0 }}</text>
      </view>
      <view class="action-row">
        <view class="action-btn" @tap="goMall">
          <uni-icons type="shop" size="18" color="#FFFFFF" />
          <text>积分商城</text>
        </view>
        <view class="action-btn outline" @tap="showRule">
          <text>积分规则</text>
        </view>
      </view>
    </view>

    <view class="list-section">
      <view class="section-title">积分明细</view>
      <view class="record-list" v-if="records.length > 0">
        <view class="record-item" v-for="(item, index) in records" :key="index">
          <view class="r-left">
            <view class="icon-box" :class="item.type">
              <uni-icons :type="item.type === 'plus' ? 'plus-filled' : 'minus-filled'" size="16" color="#FFFFFF" />
            </view>
            <view class="r-info">
              <text class="r-title">{{ item.title }}</text>
              <text class="r-time">{{ item.time }}</text>
            </view>
          </view>
          <text class="r-val" :class="item.type">{{ item.type === 'plus' ? '+' : '-' }}{{ item.val }}</text>
        </view>
      </view>
      <view class="empty-box" v-else>
        <image src="/static/images/empty_data.png" mode="aspectFit" />
        <text>暂无积分记录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { memberApi } from '@/api/index.js'

const memberInfo = ref({ points: 0 })
const records = ref([
  { title: '每日签到赠送', time: '2026-04-23 09:00', val: 5, type: 'plus' },
  { title: '购买猫粮消费抵扣', time: '2026-04-22 14:30', val: 50, type: 'minus' },
  { title: '成功分享赠送', time: '2026-04-21 18:20', val: 10, type: 'plus' },
  { title: '宠物疫苗预约奖励', time: '2026-04-20 10:15', val: 20, type: 'plus' }
])

const getMemberAsset = async () => {
  try {
    const res = await memberApi.getMemberInfo()
    if(res.code === 200 && res.data) {
      memberInfo.value = res.data
    }
  } catch(e) {}
}

const goMall = () => uni.showToast({ title: '积分商城维护中', icon: 'none' })
const showRule = () => {
  uni.showModal({
    title: '积分规则',
    content: '1. 消费1元积1分\n2. 每日签到最高可得10积分\n3. 积分可用于抵扣消费或兑换商品',
    showCancel: false
  })
}

onMounted(() => {
  getMemberAsset()
})
</script>

<style lang="scss" scoped>
.container { min-height: 100vh; background: #F8FAFC; padding: 30rpx; }

.header-card {
  background: linear-gradient(135deg, #7986CB 0%, #5C6BC0 100%);
  border-radius: 40rpx; padding: 60rpx 40rpx;
  display: flex; flex-direction: column; align-items: center; gap: 40rpx;
  box-shadow: 0 20rpx 40rpx rgba(92, 107, 192, 0.2);
  margin-bottom: 40rpx;
  
  .total-points {
    display: flex; flex-direction: column; align-items: center; gap: 10rpx;
    .label { color: rgba(255,255,255,0.7); font-size: 24rpx; }
    .value { color: #fff; font-size: 80rpx; font-weight: 900; }
  }
  
  .action-row {
    display: flex; gap: 20rpx;
    .action-btn {
      display: flex; align-items: center; gap: 10rpx;
      background: rgba(255,255,255,0.2); color: #fff; font-size: 24rpx; font-weight: 600;
      padding: 16rpx 40rpx; border-radius: 100rpx;
      &.outline { background: transparent; border: 2rpx solid rgba(255,255,255,0.4); }
    }
  }
}

.list-section {
  .section-title { font-size: 32rpx; font-weight: 800; color: #2D3436; margin-bottom: 30rpx; padding-left: 10rpx; }
  
  .record-list {
    background: #fff; border-radius: 30rpx; padding: 0 30rpx;
    .record-item {
      display: flex; justify-content: space-between; align-items: center; padding: 30rpx 0;
      border-bottom: 2rpx solid #F1F4F8;
      &:last-child { border-bottom: none; }
      
      .r-left {
        display: flex; align-items: center; gap: 20rpx;
        .icon-box {
          width: 64rpx; height: 64rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          &.plus { background: #66BB6A; }
          &.minus { background: #FF7675; }
        }
        .r-info {
          display: flex; flex-direction: column; gap: 6rpx;
          .r-title { font-size: 28rpx; font-weight: 700; color: #2D3436; }
          .r-time { font-size: 22rpx; color: #B2BEC3; }
        }
      }
      .r-val {
        font-size: 32rpx; font-weight: 900;
        &.plus { color: #66BB6A; }
        &.minus { color: #2D3436; }
      }
    }
  }
}

.empty-box {
  display: flex; flex-direction: column; align-items: center; gap: 20rpx; padding-top: 100rpx;
  image { width: 300rpx; height: 300rpx; opacity: 0.5; }
  text { font-size: 26rpx; color: #B2BEC3; }
}
</style>
