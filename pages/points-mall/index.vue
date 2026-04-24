<template>
  <view class="points-mall">
    <!-- 头部：积分资产卡片 -->
    <view class="mall-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-bar">
        <uni-icons type="left" size="24" color="#fff" @tap="goBack" />
        <text class="title">积分商城</text>
        <view style="width: 48rpx"></view>
      </view>
      
      <view class="user-points-card">
        <view class="points-info">
          <text class="label">当前可用积分</text>
          <view class="value-row">
            <text class="num">{{ memberInfo.points || 0 }}</text>
            <view class="tag">积分抵现</view>
          </view>
        </view>
        <view class="btn-group">
          <view class="btn outline" @tap="goToRecords">
            <uni-icons type="list" size="14" color="#fff" />
            <text>兑换记录</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 主体：分类导航 -->
    <view class="mall-tabs">
      <view class="tab-item" :class="{ active: currentTab === 'MEDICINE' }" @tap="currentTab = 'MEDICINE'">药/品</view>
      <view class="tab-item" :class="{ active: currentTab === 'COUPON' }" @tap="currentTab = 'COUPON'">优/惠/券</view>
      <view class="tab-bar-indicator" :style="{ transform: currentTab === 'MEDICINE' ? 'translateX(0)' : 'translateX(100%)' }"></view>
    </view>

    <!-- 列表区 -->
    <scroll-view scroll-y class="mall-content" @scrolltolower="onReachBottom">
      <view class="product-grid" v-if="products.length > 0">
        <view class="product-card" v-for="item in products" :key="item.id">
          <view class="card-image">
            <image 
              class="img" 
              :src="item.productImage ? formatImageUrl(item.productImage) : (item.type === 'COUPON' ? '/static/images/coupon-bg.png' : '/static/images/med-01.png')" 
              mode="aspectFit" 
            />
            <view class="type-tag" :class="item.type">{{ item.type === 'MEDICINE' ? '药品' : '券' }}</view>
          </view>
          <view class="card-info">
            <text class="name">{{ item.productName }}</text>
            <view class="points-price">
              <text class="num">{{ item.pointsPrice }}</text>
              <text class="unit">积分</text>
            </view>
            <view class="card-footer">
              <text class="stock">库存 {{ item.stock }}</text>
              <button class="exchange-btn" :disabled="item.stock <= 0" @tap="handleExchange(item)">
                立即兑换
              </button>
            </view>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-else-if="!loading">
        <image class="empty-img" src="/static/images/empty-cart.png" mode="aspectFit" />
        <text class="empty-text">商城正在补货中...</text>
      </view>
      
      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { pointsMallApi, memberApi, formatImageUrl } from '@/api/index.js'

const statusBarHeight = ref(0)
const currentTab = ref('MEDICINE')
const products = ref([])
const memberInfo = ref({})
const loading = ref(false)

const queryParams = ref({
  type: 'MEDICINE',
  pageNum: 1,
  pageSize: 20
})

const fetchMemberInfo = async () => {
  try {
    const res = await memberApi.getMemberInfo()
    memberInfo.value = res.data || {}
  } catch (e) {}
}

const fetchProducts = async () => {
  loading.value = true
  try {
    queryParams.value.type = currentTab.value
    const res = await pointsMallApi.getProducts(queryParams.value)
    products.value = res.rows || []
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const handleExchange = async (product) => {
  if (memberInfo.value.points < product.pointsPrice) {
    uni.showToast({ title: '积分不足', icon: 'none' })
    return
  }

  uni.showModal({
    title: '确认兑换',
    content: `确定消耗 ${product.pointsPrice} 积分兑换 ${product.productName} 吗？`,
    confirmColor: '#6366F1',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '兑换中...' })
        try {
          await pointsMallApi.exchange(product.id)
          uni.showToast({ title: '兑换成功！', icon: 'success' })
          fetchMemberInfo()
          fetchProducts()
        } catch (e) {
          uni.showToast({ title: e.msg || '兑换失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

const goBack = () => uni.navigateBack()
const goToRecords = () => {
  uni.showToast({ title: '历史记录开发中', icon: 'none' })
}

const onReachBottom = () => {
  // 分页加载逻辑可在此扩展
  console.log('Reach bottom')
}

watch(currentTab, () => {
  queryParams.value.pageNum = 1
  fetchProducts()
})

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
  fetchMemberInfo()
  fetchProducts()
})
</script>

<style lang="scss" scoped>
.points-mall {
  height: 100vh; background: #F8FAFC; display: flex; flex-direction: column;
}

.mall-header {
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  padding: 0 40rpx 60rpx;
  
  .nav-bar {
    height: 88rpx; display: flex; align-items: center; justify-content: space-between;
    .title { color: #fff; font-size: 32rpx; font-weight: 800; }
  }
  
  .user-points-card {
    background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px);
    border-radius: 32rpx; padding: 40rpx; margin-top: 30rpx;
    display: flex; justify-content: space-between; align-items: center;
    border: 1rpx solid rgba(255, 255, 255, 0.2);
    
    .points-info {
      .label { color: rgba(255, 255, 255, 0.8); font-size: 24rpx; display: block; margin-bottom: 10rpx; }
      .value-row {
        display: flex; align-items: center; gap: 16rpx;
        .num { color: #fff; font-size: 56rpx; font-weight: 900; }
        .tag { background: rgba(255, 255, 255, 0.2); color: #fff; font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 10rpx; }
      }
    }
    
    .btn.outline {
      border: 1rpx solid rgba(255, 255, 255, 0.5); border-radius: 30rpx;
      padding: 12rpx 24rpx; display: flex; align-items: center; gap: 8rpx;
      text { color: #fff; font-size: 24rpx; }
    }
  }
}

.mall-tabs {
  background: #fff; display: flex; position: relative; border-bottom: 1rpx solid #F1F5F9;
  .tab-item {
    flex: 1; text-align: center; padding: 30rpx 0; font-size: 28rpx; color: #64748B; font-weight: 700;
    transition: all 0.3s;
    &.active { color: #6366F1; }
  }
  .tab-bar-indicator {
    position: absolute; bottom: 0; left: 0; width: 50%; height: 6rpx;
    display: flex; justify-content: center; transition: all 0.3s;
    &::after { content: ''; width: 60rpx; height: 100%; background: #6366F1; border-radius: 3rpx; }
  }
}

.mall-content { flex: 1; padding: 24rpx; box-sizing: border-box; }

.product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24rpx; }

.product-card {
  background: #fff; border-radius: 24rpx; overflow: hidden; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  .card-image {
    height: 240rpx; background: #F8FAFC; position: relative;
    display: flex; align-items: center; justify-content: center;
    .img { width: 140rpx; height: 140rpx; }
    .type-tag {
      position: absolute; top: 12rpx; left: 12rpx; font-size: 18rpx; padding: 4rpx 12rpx; border-radius: 8rpx;
      &.MEDICINE { background: #E0E7FF; color: #6366F1; }
      &.COUPON { background: #FEE2E2; color: #EF4444; }
    }
  }
  .card-info {
    padding: 20rpx;
    .name { font-size: 28rpx; font-weight: 800; color: #1E293B; display: block; height: 76rpx; overflow: hidden; }
    .points-price {
      margin: 16rpx 0; display: flex; align-items: baseline; gap: 4rpx;
      .num { font-size: 36rpx; font-weight: 900; color: #6366F1; }
      .unit { font-size: 20rpx; color: #94A3B8; }
    }
    .card-footer {
      display: flex; justify-content: space-between; align-items: center;
      .stock { font-size: 20rpx; color: #94A3B8; }
      .exchange-btn {
        margin: 0; background: #6366F1; color: #fff; font-size: 22rpx; 
        padding: 0 20rpx; height: 52rpx; line-height: 52rpx; border-radius: 26rpx;
        &[disabled] { background: #CBD5E1; }
      }
    }
  }
}

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 100rpx;
  .empty-img { width: 300rpx; height: 300rpx; margin-bottom: 30rpx; opacity: 0.5; }
  .empty-text { font-size: 26rpx; color: #94A3B8; }
}

.bottom-space { height: 40rpx; }
</style>
