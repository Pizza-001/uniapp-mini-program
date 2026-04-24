<template>
  <view class="container">
    <view class="header-card shadow-lg">
      <view class="total-points">
        <text class="label">当前可用积分</text>
        <text class="value">{{ memberInfo.points || 0 }}</text>
      </view>
      <view class="action-row">
        <view class="action-btn" @tap="goMall">
          <uni-icons type="shop-filled" size="20" color="#FFFFFF" />
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
              <uni-icons :type="item.type === 'plus' ? 'plus-filled' : 'minus-filled'" size="18" color="#FFFFFF" />
            </view>
            <view class="r-info">
              <text class="r-title">{{ item.title }}</text>
              <text class="r-time">{{ formatDate(item.createTime) }}</text>
            </view>
          </view>
          <text class="r-val" :class="item.type">{{ item.type === 'plus' ? '+' : '-' }}{{ item.changePoints }}</text>
        </view>
      </view>
      <view class="empty-box" v-else>
        <image src="/static/images/empty_data.png" mode="aspectFit" v-if="hasEmptyImage" />
        <view class="empty-icon" v-else>📊</view>
        <text>暂无积分记录，快去消费积攒吧</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { memberApi } from '@/api/index.js'

const memberInfo = ref({ points: 0 })
const records = ref([])
const hasEmptyImage = ref(false)

const fetchData = async () => {
  uni.showLoading({ title: '加载中...' })
  try {
    // 1. 获取会员信息
    const memberRes = await memberApi.getMemberInfo()
    if(memberRes.data) memberInfo.value = memberRes.data
    
    // 2. 获取积分记录
    const pointsRes = await memberApi.getPointsRecords()
    records.value = pointsRes.data || []
  } catch(e) {
  } finally {
    uni.hideLoading()
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 16)
}

const goMall = () => uni.showToast({ title: '积分商城正在装修中', icon: 'none' })
const showRule = () => {
  uni.showModal({
    title: '积分指南',
    content: '1. 购买药品：每消费1元增加1积分\n2. 积分可用于以后兑换宠物零食或抵扣医疗费\n3. 积分永久有效',
    showCancel: false,
    confirmColor: '#6366F1'
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.container { min-height: 100vh; background: #F8FAFC; padding: 40rpx 32rpx; }

.header-card {
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  border-radius: 50rpx; padding: 70rpx 40rpx;
  display: flex; flex-direction: column; align-items: center; gap: 40rpx;
  margin-bottom: 50rpx;
  
  .total-points {
    display: flex; flex-direction: column; align-items: center; gap: 15rpx;
    .label { color: rgba(255,255,255,0.8); font-size: 26rpx; font-weight: 600; letter-spacing: 2rpx; }
    .value { color: #fff; font-size: 100rpx; font-weight: 900; line-height: 1; }
  }
  
  .action-row {
    display: flex; gap: 24rpx;
    .action-btn {
      display: flex; align-items: center; gap: 12rpx;
      background: rgba(255,255,255,0.25); color: #fff; font-size: 26rpx; font-weight: 700;
      padding: 20rpx 48rpx; border-radius: 30rpx;
      backdrop-filter: blur(10px);
      &.outline { background: transparent; border: 2rpx solid rgba(255,255,255,0.4); }
    }
  }
}

.list-section {
  .section-title { font-size: 34rpx; font-weight: 900; color: #1E293B; margin-bottom: 30rpx; }
  
  .record-list {
    background: #fff; border-radius: 40rpx; padding: 10rpx 32rpx;
    box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
    
    .record-item {
      display: flex; justify-content: space-between; align-items: center; padding: 36rpx 0;
      border-bottom: 1rpx solid #F1F5F9;
      &:last-child { border-bottom: none; }
      
      .r-left {
        display: flex; align-items: center; gap: 24rpx;
        .icon-box {
          width: 72rpx; height: 72rpx; border-radius: 24rpx; display: flex; align-items: center; justify-content: center;
          &.plus { background: #10B981; }
          &.minus { background: #F43F5E; }
        }
        .r-info {
          display: flex; flex-direction: column; gap: 8rpx;
          .r-title { font-size: 28rpx; font-weight: 800; color: #1E293B; }
          .r-time { font-size: 22rpx; color: #94A3B8; font-weight: 500; }
        }
      }
      .r-val {
        font-size: 36rpx; font-weight: 900;
        &.plus { color: #10B981; }
        &.minus { color: #1E293B; }
      }
    }
  }
}

.empty-box {
  display: flex; flex-direction: column; align-items: center; gap: 20rpx; padding-top: 150rpx;
  .empty-icon { font-size: 80rpx; }
  image { width: 300rpx; height: 300rpx; opacity: 0.5; }
  text { font-size: 26rpx; color: #94A3B8; font-weight: 600; }
}

.shadow-lg { box-shadow: 0 30rpx 60rpx rgba(99, 102, 241, 0.25); }
</style>
