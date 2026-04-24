<template>
  <view class="page">
    <view class="navbar">
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="nav-content">
        <view class="back-btn" @tap="goBack">
          <uni-icons type="left" size="24" color="#2D3436" />
        </view>
        <text class="title">消费账单</text>
        <view class="placeholder"></view>
      </view>
    </view>

    <scroll-view scroll-y class="content-scroll">
      <view class="header-summary">
        <view class="summary-card">
          <view class="label">本月支出 (元)</view>
          <view class="amount">{{ totalAmount }}</view>
          <view class="stats">
            <text class="count">共 {{ totalCount }} 笔交易</text>
            <view class="trend">
              <uni-icons type="arrow-up" size="12" color="#FF7675" />
              <text>12% 较上月</text>
            </view>
          </view>
        </view>
      </view>

      <view class="bill-list">
        <view class="month-group" v-for="(group, idx) in billGroups" :key="idx">
          <view class="group-title">{{ group.month }}</view>
          <view class="group-content">
            <view class="bill-item" v-for="(item, i) in group.items" :key="i" @tap="showDetail(item)">
              <view class="item-left">
                <view class="icon-wrap" :class="item.type">
                  <uni-icons :type="item.type === 'med' ? 'medkit-filled' : 'staff-filled'" size="20" color="#fff" />
                </view>
                <view class="info">
                  <text class="name">{{ item.title }}</text>
                  <text class="time">{{ item.time }}</text>
                </view>
              </view>
              <view class="item-right">
                <text class="amount">-{{ item.amount }}</text>
                <text class="status">{{ item.status }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { billingApi } from '@/api/index.js'

const statusBarHeight = ref(44)
const billGroups = ref([])
const totalAmount = ref('0.00')
const totalCount = ref(0)
const loading = ref(false)

const fetchHistory = async () => {
  loading.ref = true
  try {
    const res = await billingApi.getHistory({ status: '1' }) // 只查已结算的
    if (res.code === 200 || (res.rows)) {
      const list = res.rows || []
      totalCount.value = list.length
      
      // 计算本月支出 (简单示例，实际应按月过滤)
      let sum = 0
      list.forEach(item => sum += (item.payAmount || 0))
      totalAmount.value = sum.toFixed(2)

      // 按月份分组数据
      const groups = {}
      list.forEach(item => {
        const date = new Date(item.paymentTime || item.createTime)
        const month = `${date.getFullYear()}年${date.getMonth() + 1}月`
        if (!groups[month]) groups[month] = []
        groups[month].push({
          title: formatTitle(item),
          time: formatDate(item.paymentTime || item.createTime),
          amount: (item.payAmount || 0).toFixed(2),
          status: '支付成功',
          type: item.businessType === 'MEDICINE' ? 'med' : 'treat'
        })
      })

      billGroups.value = Object.keys(groups).map(month => ({
        month,
        items: groups[month]
      }))
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const formatTitle = (item) => {
  const types = { 'VACCINE': '疫苗接种', 'CLINIC': '门诊费用', 'MEDICINE': '药房购药', 'GENERAL': '综合支出' }
  return types[item.businessType] || '消费支出'
}

const formatDate = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const h = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  return `${m}-${d} ${h}:${min}`
}

const goBack = () => uni.navigateBack()
const showDetail = (item) => {
  uni.showToast({ title: '单号详情可咨询前台', icon: 'none' })
}

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
  fetchHistory()
})
</script>

<style lang="scss" scoped>
.page { background: #F8FAFC; min-height: 100vh; }

.navbar {
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid rgba(0,0,0,0.05);
  
  .nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    
    .title { font-size: 32rpx; font-weight: 800; color: #2D3436; }
    .back-btn, .placeholder { width: 60rpx; }
  }
}

.header-summary {
  padding: 40rpx;
  background: linear-gradient(to bottom, #fff 0%, #F8FAFC 100%);
  
  .summary-card {
    background: #1A237E;
    border-radius: 40rpx;
    padding: 60rpx 50rpx;
    color: #fff;
    box-shadow: 0 30rpx 60rpx rgba(26, 35, 126, 0.2);
    
    .label { font-size: 24rpx; color: rgba(255,255,255,0.7); margin-bottom: 16rpx; }
    .amount { font-size: 64rpx; font-weight: 900; margin-bottom: 30rpx; letter-spacing: 2rpx; }
    
    .stats {
      display: flex; justify-content: space-between; align-items: center;
      .count { font-size: 24rpx; color: rgba(255,255,255,0.8); }
      .trend {
        display: flex; align-items: center; gap: 8rpx; font-size: 20rpx;
        background: rgba(255,255,255,0.1); padding: 8rpx 20rpx; border-radius: 100rpx;
      }
    }
  }
}

.bill-list {
  padding: 0 30rpx;
  
  .month-group {
    margin-bottom: 40rpx;
    .group-title { font-size: 28rpx; font-weight: 800; color: #B2BEC3; margin-bottom: 24rpx; padding-left: 10rpx; }
    
    .group-content {
      background: #fff; border-radius: 32rpx; overflow: hidden;
      border: 1rpx solid rgba(0,0,0,0.02);
      
      .bill-item {
        display: flex; justify-content: space-between; align-items: center; padding: 36rpx 30rpx;
        border-bottom: 2rpx solid #F8FAFC;
        &:last-child { border-bottom: none; }
        
        .item-left {
          display: flex; align-items: center; gap: 24rpx;
          .icon-wrap {
            width: 80rpx; height: 80rpx; border-radius: 20rpx;
            display: flex; align-items: center; justify-content: center;
            &.med { background: #5C6BC0; }
            &.treat { background: #26A69A; }
          }
          .info {
            .name { font-size: 28rpx; font-weight: 700; color: #2D3436; display: block; margin-bottom: 6rpx; }
            .time { font-size: 22rpx; color: #B2BEC3; }
          }
        }
        
        .item-right {
          text-align: right;
          .amount { font-size: 32rpx; font-weight: 900; color: #2D3436; display: block; }
          .status { font-size: 20rpx; color: #66BB6A; }
        }
      }
    }
  }
}

.safe-bottom { height: 100rpx; }
</style>
