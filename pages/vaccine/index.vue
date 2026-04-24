<template>
  <view class="page">
    <!-- 1. 顶部毛玻璃导航 -->
    <view class="glass-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <view class="title-row">
          <view class="back-btn" @tap="handleBack">
            <uni-icons type="left" size="24" color="#2C3E50" />
          </view>
          <text class="page-title">免疫接种</text>
        </view>
        <text class="page-subtitle">专业评估 · 严选原装 · 临床级安全保障</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" enable-back-to-top>
      <!-- 占位 (收紧间距) -->
      <view :style="{ height: statusBarHeight + 84 + 'px' }" />

      <!-- 2. 免疫须知 (悬浮感卡片) -->
      <view class="tips-glass animate-fade-in">
        <view class="tips-header">
          <uni-icons type="info-filled" size="20" color="#5C6BC0" />
          <text class="tips-title">接种前准备</text>
        </view>
        <view class="tips-grid">
          <view class="tip-item">
            <text class="tip-dot">•</text>
            <text class="tip-text">接种前后3天不建议洗澡，严防感冒</text>
          </view>
          <view class="tip-item">
            <text class="tip-dot">•</text>
            <text class="tip-text">两次免疫需间隔21天，确保抗体稳定</text>
          </view>
          <view class="tip-item">
            <text class="tip-dot">•</text>
            <text class="tip-text">院内留观30分钟，应对急性过敏反应</text>
          </view>
        </view>
      </view>

      <!-- 3. 筛选标题 -->
      <view class="section-title">
        <text class="title-text">甄选疫苗项目</text>
        <view class="title-badge">官方认证</view>
      </view>
      
      <!-- 4. 疫苗列表 -->
      <view class="vaccine-list">
        <view class="vaccine-card animate-in-up" v-for="item in vaccines" :key="item.vaccineId">
          <view class="card-main">
            <view class="icon-section">
              <view class="icon-circle" :style="{ background: item.status === '1' ? '#B0BEC5' : '$primary-grad' }">
                <uni-icons type="pyramid-filled" size="28" color="#fff" />
              </view>
            </view>
            <view class="content-section">
              <view class="name-row">
                <text class="name">{{ item.name }}</text>
                <view class="off-tag" v-if="item.status === '1'">已下架</view>
              </view>
              <view class="tags-row">
                <text class="v-tag">{{ item.targetScope || '全期通用' }}</text>
                <text class="v-tag sep">|</text>
                <text class="v-tag light">{{ item.manufacturer || '顶级原装' }}</text>
              </view>
              <text class="v-desc">{{ item.description || '保障爱宠健康，从科学免疫开始。' }}</text>
              
              <view class="warning-box" v-if="item.notes">
                <uni-icons type="info" size="14" color="#F1C40F" />
                <text class="warning-text">{{ item.notes }}</text>
              </view>
            </view>
          </view>
          
          <view class="card-footer">
            <view class="price-area">
              <text class="unit">¥</text>
              <text class="price">{{ item.price || '--' }}</text>
              <text class="per">/ 针</text>
            </view>
            <view 
              class="btn-book" 
              :class="{ disabled: item.status === '1' }" 
              @tap="handleBook(item)"
            >
              <text>{{ item.status === '1' ? '已售罄' : '立即预约' }}</text>
              <uni-icons v-if="item.status !== '1'" type="right" size="14" color="#fff" />
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
import { hospitalApi, formatImageUrl } from '@/api/index.js'

const statusBarHeight = ref(0)
const vaccines = ref([])

const fetchVaccines = async () => {
  try {
    const res = await hospitalApi.getVaccines({ pageNum: 1, pageSize: 50 })
    vaccines.value = res.rows || []
  } catch (e) {
    console.error('Failed to fetch vaccines', e)
  }
}

const handleBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}

const handleBook = (item) => {
  if (item.status === '1') {
    uni.showToast({ title: '当前项目不可预约', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/appointment/index?type=疫苗预约&vaccineId=${item.vaccineId}&vaccineName=${item.name}`
  })
}

onMounted(() => {
  try {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
  } catch (e) {
    statusBarHeight.value = 20
  }
  fetchVaccines()
})
</script>

<style lang="scss" scoped>
.page { background: $bg-main; min-height: 100vh; }

.glass-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 999;
  @include glass-morphism;
  .header-content {
    padding: 24rpx 40rpx 20rpx;
    .title-row {
      display: flex; align-items: center; gap: 16rpx; margin-bottom: 8rpx;
      .back-btn {
        width: 100rpx; height: 80rpx; display: flex; align-items: center; justify-content: flex-start;
        margin-left: -20rpx; // 负边距让图标视觉对齐，但增加左侧热区
      }
      .page-title {
        font-size: 44rpx; font-weight: 900; color: $text-main;
        letter-spacing: -1rpx; margin-bottom: 0;
      }
    }
    .page-subtitle { font-size: 22rpx; color: $text-hint; font-weight: 500; }
  }
}

.scroll-content { padding: 0 40rpx; width: 100%; box-sizing: border-box; }

.tips-glass {
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
  backdrop-filter: blur(20rpx);
  border-radius: 40rpx; padding: 32rpx;
  border: 4rpx solid #fff;
  box-shadow: $shadow-md;
  .tips-header {
    display: flex; align-items: center; gap: 12rpx; margin-bottom: 20rpx;
    .tips-title { font-size: 28rpx; font-weight: 800; color: $primary-dark; }
  }
  .tips-grid {
    display: flex; flex-direction: column; gap: 12rpx;
    .tip-item {
      display: flex; gap: 8rpx;
      .tip-dot { color: $primary; font-weight: 900; }
      .tip-text { font-size: 22rpx; color: $text-sub; line-height: 1.5; }
    }
  }
}

.section-title {
  padding: 48rpx 0 32rpx; display: flex; align-items: center; gap: 16rpx;
  .title-text { font-size: 34rpx; font-weight: 900; color: $text-main; }
  .title-badge {
    font-size: 18rpx; padding: 4rpx 16rpx; border-radius: 100rpx;
    background: $success; color: #fff; font-weight: 700;
  }
}

.vaccine-list { display: flex; flex-direction: column; gap: 32rpx; }

.vaccine-card {
  @include premium-card;
  padding: 36rpx;
  .card-main {
    display: flex; gap: 24rpx; margin-bottom: 28rpx;
    .icon-section {
      .icon-circle {
        width: 104rpx; height: 104rpx; border-radius: 32rpx;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 8rpx 20rpx rgba(121, 134, 203, 0.2);
        background: $primary-grad;
      }
    }
    .content-section {
      flex: 1;
      .name-row {
        display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx;
        .name { font-size: 34rpx; font-weight: 800; color: $text-main; }
        .off-tag { font-size: 18rpx; color: #fff; background: #BDC3C7; padding: 4rpx 12rpx; border-radius: 8rpx; }
      }
      .tags-row {
        display: flex; align-items: center; gap: 12rpx; margin-bottom: 16rpx;
        .v-tag { font-size: 22rpx; color: $text-sub; font-weight: 500; }
        .v-tag.light { color: $text-hint; }
        .v-tag.sep { color: #E0E0E0; font-size: 18rpx; }
      }
      .v-desc { font-size: 22rpx; color: $text-hint; line-height: 1.5; margin-bottom: 16rpx; }
      .warning-box {
        background: #FFF9C4; padding: 12rpx 16rpx; border-radius: 12rpx;
        display: flex; gap: 8rpx; align-items: center;
        .warning-text { font-size: 20rpx; color: #FBC02D; font-weight: 700; }
      }
    }
  }
  
  .card-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 28rpx; border-top: 2rpx solid #F4F7FC;
    .price-area {
      display: flex; align-items: baseline;
      .unit { font-size: 24rpx; color: $accent; font-weight: 800; }
      .price { font-size: 44rpx; color: $accent; font-weight: 900; margin: 0 4rpx; }
      .per { font-size: 22rpx; color: $text-hint; }
    }
    .btn-book {
      @include btn-primary;
      width: 200rpx; height: 76rpx; font-size: 26rpx; gap: 8rpx;
      &.disabled { background: #CFD8DC; box-shadow: none; }
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
