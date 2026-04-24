<template>
  <view class="page">
    <!-- 1. 顶部毛玻璃导航 -->
    <view class="glass-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <view class="title-row">
          <view class="back-btn" @tap="handleBack">
            <uni-icons type="left" size="24" color="#2C3E50" />
          </view>
          <text class="page-title">预约记录</text>
        </view>
        <view class="tabs-scroll">
          <view class="tabs-inner">
            <view 
              class="tab-item" 
              v-for="(tab, index) in tabs" 
              :key="index" 
              :class="{ active: currentTab === index }"
              @tap="handleTab(index)"
            >
              <text class="tab-text">{{ tab }}</text>
              <view class="tab-line" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <scroll-view 
      class="scroll-content" 
      scroll-y 
      enable-back-to-top
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 占位 (收紧间距) -->
      <view :style="{ height: statusBarHeight + 94 + 'px' }" />

      <!-- 2. 空状态 -->
      <view class="empty-view animate-fade-in" v-if="list.length === 0 && !loading">
        <view class="empty-card">
           <image src="/static/images/empty-history.png" mode="widthFix" class="empty-img" />
           <text class="empty-text">计划赶不上变化，快去预约吧</text>
           <button class="empty-btn" @tap="goToBook">立即预约</button>
        </view>
      </view>

      <!-- 3. 记录列表 -->
      <view class="record-list" v-else>
        <view class="record-card animate-in-up" v-for="item in list" :key="item.reservationId" @tap="goToDetail(item)">
          <view class="card-main-content">
            <!-- 左侧图标/头像 -->
            <view class="card-left">
              <image 
                v-if="item.photo" 
                :src="formatImageUrl(item.photo)" 
                mode="aspectFill" 
                class="avatar-icon" 
              />
              <view v-else class="type-icon-box" :class="item.type === '疫苗预约' ? 'vaccine-bg' : 'normal-bg'">
                <image 
                  :src="item.type === '疫苗预约' ? '/static/icons/nav-vaccine.png' : '/static/icons/nav-appt.png'" 
                  mode="aspectFit" 
                  class="type-icon"
                />
              </view>
            </view>

            <!-- 右侧信息 -->
            <view class="card-right">
              <view class="card-header">
                <view class="type-box">
                  <view class="type-tag" :class="item.type === '疫苗预约' ? 'vaccine' : 'normal'">
                    {{ item.type || '常规门诊' }}
                  </view>
                </view>
                <view class="status-wrap">
                  <view class="status-dot" :style="{ background: getStatusColor(item.status) }"></view>
                  <text class="status-text" :style="{ color: getStatusColor(item.status) }">{{ formatStatus(item.status) }}</text>
                </view>
              </view>
          
          <view class="card-body">
            <view class="info-item">
              <uni-icons type="person" size="16" color="#B2BEC3" />
              <text class="val">{{ item.petName }} <text class="sub">({{ item.petBread || '全品种' }})</text></text>
            </view>
            <view class="info-item">
              <uni-icons type="calendar" size="16" color="#B2BEC3" />
              <text class="val">{{ item.date }} <text class="sub">{{ item.time }}</text></text>
            </view>
            <view class="info-item" v-if="item.doctorName">
              <uni-icons type="staff" size="16" color="#B2BEC3" />
              <text class="val">{{ item.doctorName }} <text class="sub">主诊医师</text></text>
            </view>
          </view>

          </view> <!-- card-right -->
          </view> <!-- card-main-content -->
          
          <view class="card-footer">
            <view class="actions">
              <view class="btn-outline" v-if="item.status === '0'" @tap.stop="handleCancel(item)">取消预约</view>
              <view class="btn-main">详情回执</view>
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
import { onShow } from '@dcloudio/uni-app'
import { request } from '@/api/index.js'

const statusBarHeight = ref(0)
const tabs = ['全部', '待就诊', '已完成', '已取消']
const currentTab = ref(0)
const list = ref([])
const loading = ref(false)
const refreshing = ref(false)

const getStatusColor = (s) => {
  if (s === '0') return '#5C6BC0'
  if (s === '1') return '#66BB6A'
  if (s === '2') return '#B0BEC5'
  return '#B0BEC5'
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/hospital/reservation/selectMyReservationList',
      method: 'GET'
    })
    list.value = res.data || []
  } catch (e) {
    console.error('Fetch records failed', e)
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  refreshing.value = true
  await fetchList()
  refreshing.value = false
}

// 移除手动定义的 onShow 常量，统一在生命周期钩子中调用
const handleTab = (index) => {
  currentTab.value = index
}

const handleBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}

const formatStatus = (status) => {
  const statusMap = { '0': '待就诊', '1': '已完成', '2': '已取消' }
  return statusMap[status] || '未知'
}

const handleCancel = (item) => {
  uni.showModal({
    title: '温馨提示',
    content: '确定要取消该预约计划吗？',
    cancelText: '再想想',
    confirmText: '确定取消',
    confirmColor: '#E74C3C',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({
            url: `/hospital/reservation/${item.reservationId}`,
            method: 'DELETE'
          })
          uni.showToast({ title: '已取消', icon: 'success' })
          fetchList()
        } catch (e) {
          console.error('Cancel failed', e)
        }
      }
    }
  })
}

const goToBook = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const goToDetail = (item) => {
  uni.navigateTo({
    url: `/pages/record/detail?id=${item.reservationId}`
  })
}

onMounted(() => {
  try {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
  } catch (e) {
    statusBarHeight.value = 20
  }
})

onShow(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
.page { background: $bg-main; min-height: 100vh; }

.glass-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 999;
  @include glass-morphism;
  .header-content {
    padding: 24rpx 40rpx 10rpx;
    .title-row {
      display: flex; align-items: center; gap: 16rpx; margin-bottom: 24rpx;
      .back-btn {
        width: 100rpx; height: 80rpx; display: flex; align-items: center; justify-content: flex-start;
        margin-left: -20rpx; 
      }
      .page-title {
        font-size: 44rpx; font-weight: 900; color: $text-main;
        margin-bottom: 0;
      }
    }
  }
}

.tabs-inner {
  display: flex; gap: 40rpx;
  .tab-item {
    padding: 12rpx 0 20rpx; position: relative;
    .tab-text { font-size: 28rpx; color: $text-sub; transition: all 0.3s; }
    .tab-line {
      position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
      width: 0; height: 6rpx; background: $primary; border-radius: 3rpx; transition: all 0.3s;
    }
    &.active {
      .tab-text { color: $primary; font-weight: 800; transform: scale(1.05); }
      .tab-line { width: 32rpx; }
    }
  }
}

.scroll-content { padding: 0 40rpx; width: 100%; box-sizing: border-box; }

.record-list { display: flex; flex-direction: column; gap: 28rpx; padding-top: 20rpx; }

.record-card {
  @include premium-card;
  padding: 32rpx;
  
  .card-main-content {
    display: flex; gap: 24rpx;
  }
  
  .card-left {
    flex-shrink: 0;
    .avatar-icon {
      width: 100rpx; height: 100rpx; border-radius: 50%; border: 4rpx solid #fff;
      box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.08);
    }
    .type-icon-box {
      width: 100rpx; height: 100rpx; border-radius: 24rpx;
      display: flex; align-items: center; justify-content: center;
      &.vaccine-bg { background: #E8F5E9; }
      &.normal-bg { background: #E8EAF6; }
      .type-icon { width: 60rpx; height: 60rpx; }
    }
  }
  
  .card-right { flex: 1; min-width: 0; }

  .card-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 24rpx;
    .type-tag {
      font-size: 20rpx; padding: 4rpx 16rpx; border-radius: 8rpx; font-weight: 700;
      &.vaccine { background: $primary-light; color: $primary; }
      &.normal { background: #E3F2FD; color: #1976D2; }
    }
    .status-wrap {
      display: flex; align-items: center; gap: 8rpx;
      .status-dot { width: 12rpx; height: 12rpx; border-radius: 50%; }
      .status-text { font-size: 24rpx; font-weight: 800; }
    }
  }
  
  .card-body {
    background: #F8FAFC; border-radius: 20rpx; padding: 24rpx;
    display: flex; flex-direction: column; gap: 16rpx;
    .info-item {
      display: flex; align-items: center; gap: 16rpx;
      .val { font-size: 26rpx; color: $text-main; font-weight: 600; }
      .sub { font-size: 22rpx; color: $text-hint; font-weight: 400; margin-left: 8rpx; }
    }
  }

  .card-footer {
    margin-top: 28rpx; display: flex; justify-content: flex-end;
    .actions {
      display: flex; gap: 16rpx;
      .btn-outline {
        padding: 12rpx 32rpx; border-radius: 100rpx; font-size: 24rpx;
        color: $text-hint; border: 2rpx solid #E0E0E0;
      }
      .btn-main {
        padding: 12rpx 32rpx; border-radius: 100rpx; font-size: 24rpx;
        background: $primary-grad; color: #fff; font-weight: 700;
        box-shadow: 0 8rpx 16rpx rgba(92, 107, 192, 0.2);
      }
    }
  }
}

.empty-view {
  padding: 100rpx 0; width: 100%;
  .empty-card {
    @include premium-card;
    display: flex; flex-direction: column; align-items: center; gap: 32rpx; padding: 100rpx 40rpx;
    .empty-img { width: 300rpx; opacity: 0.6; }
    .empty-text { font-size: 26rpx; color: $text-hint; }
    .empty-btn {
      @include btn-primary;
      width: 240rpx; height: 80rpx; font-size: 26rpx;
    }
  }
}

.animate-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.safe-bottom { height: 160rpx; }
</style>
