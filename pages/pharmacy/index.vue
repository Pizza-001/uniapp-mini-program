<template>
  <view class="mall-page">
    <!-- 统一沉浸式头部 -->
    <view class="safe-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="title-bar">宠爱药房</view>
      <view class="search-box">
        <uni-icons type="search" size="18" color="#94A3B8" />
        <input 
          class="ipt" 
          placeholder="输入药名或疾病寻找良药..." 
          v-model="queryParams.name" 
          @confirm="handleSearch"
        />
      </view>
    </view>

    <!-- 主容器 -->
    <view class="split-view">
      <!-- 侧边栏 -->
      <scroll-view scroll-y class="sidebar" show-scrollbar="false">
        <view 
          class="side-nav" 
          :class="{ active: currentCategory === '' }" 
          @tap="switchCategory('')"
        >
          <view class="bar" v-if="currentCategory === ''"></view>
          <uni-icons type="star-filled" size="18" :color="currentCategory === '' ? '#6366F1' : '#94A3B8'" />
          <text>推荐</text>
        </view>
        <view 
          class="side-nav" 
          v-for="cat in categories" 
          :key="cat"
          :class="{ active: currentCategory === cat }" 
          @tap="switchCategory(cat)"
        >
          <view class="bar" v-if="currentCategory === cat"></view>
          <uni-icons :type="getCatIcon(cat)" size="18" :color="currentCategory === cat ? '#6366F1' : '#94A3B8'" />
          <text>{{ cat }}</text>
        </view>
      </scroll-view>

      <!-- 列表区 -->
      <scroll-view 
        scroll-y 
        class="pro-list" 
        refresher-enabled 
        :refresher-triggered="isRefreshing" 
        @refresherrefresh="onRefresh"
      >
        <view class="mall-grid" v-if="productList.length > 0">
          <view class="mall-item" v-for="item in productList" :key="item.medicineId">
            <view class="item-visual">
              <image class="img" :src="item.image ? formatImageUrl(item.image) : '/static/images/med-01.png'" mode="aspectFit" />
              <view class="tag" v-if="item.stock < 10">处</view>
            </view>
            <view class="item-detail">
              <text class="name">{{ item.name }}</text>
              <text class="desc">{{ item.specification }}</text>
              <view class="footer-p">
                <text class="price">¥{{ item.price }}</text>
                <view class="add-cart" @tap.stop="addToCart(item)">
                  <uni-icons type="plus-filled" size="26" color="#6366F1" />
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="empty-state" v-if="!loading && productList.length === 0">
          <text>药柜空空，换个分类看看吧</text>
        </view>
        <view class="bottom-safe-space"></view>
      </scroll-view>
    </view>

    <!-- 固定底部结算栏：吸附在 TabBar 之上 -->
    <view class="settle-bar shadow-top">
      <view class="total-p">
        <text class="label">合计:</text>
        <text class="sym">¥</text>
        <text class="num">{{ totalPrice }}</text>
      </view>
      <button class="settle-btn" :disabled="cartCount === 0" @tap="handleCheckout">
        去结算 ({{ cartCount }})
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { pharmacyApi, billingApi, formatImageUrl } from '@/api/index.js'

const statusBarHeight = ref(0)
const isRefreshing = ref(false)
const loading = ref(true)

const categories = ref([])
const currentCategory = ref('')
const productList = ref([])
const cart = ref([])

const queryParams = ref({
  name: '',
  type: '',
  pageNum: 1,
  pageSize: 50
})

const cartCount = computed(() => cart.value.reduce((acc, item) => acc + item.count, 0))
const totalPrice = computed(() => cart.value.reduce((acc, item) => acc + (item.price * item.count), 0).toFixed(2))

const fetchCategories = async () => {
  try { const res = await pharmacyApi.getCategories(); categories.value = res.data || [] } catch (e) {}
}

const fetchProducts = async () => {
  loading.value = true
  try {
    queryParams.value.type = currentCategory.value
    const res = await pharmacyApi.getProducts(queryParams.value)
    productList.value = res.rows || []
  } catch (e) {
  } finally { loading.value = false; isRefreshing.value = false }
}

const switchCategory = (cat) => { currentCategory.value = cat; fetchProducts() }
const handleSearch = () => fetchProducts()
const onRefresh = () => { isRefreshing.value = true; fetchProducts() }

const addToCart = (product) => {
  const index = cart.value.findIndex(item => item.medicineId === product.medicineId)
  if (index > -1) cart.value[index].count++
  else cart.value.push({ ...product, count: 1 })
}

const handleCheckout = async () => {
  if (cart.value.length === 0) return
  uni.showLoading({ title: '收银台加载中...', mask: true })
  try {
    const billingData = {
      orderNo: 'MED' + Date.now(),
      businessType: 'MEDICINE',
      totalAmount: totalPrice.value
    }
    const res = await billingApi.createBilling(billingData)
    const billingId = res.data.id

    const data = encodeURIComponent(JSON.stringify({
      billingId: billingId,
      items: cart.value
    }))
    
    uni.navigateTo({ url: `/pages/pharmacy/checkout?data=${data}` })
    cart.value = []
  } catch (e) {
    uni.showToast({ title: '跳转失败，请检查网络', icon: 'none' })
  } finally { uni.hideLoading() }
}

const getCatIcon = (cat) => {
  if (cat.includes('驱虫')) return 'smallcircle-filled'
  if (cat.includes('护理')) return 'heart-filled'
  if (cat.includes('营养')) return 'shop-filled'
  return 'list'
}

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
  fetchCategories()
  fetchProducts()
})
</script>

<style lang="scss" scoped>
.mall-page {
  background: #F8FAFC; height: 100vh; display: flex; flex-direction: column; overflow: hidden;
}

.safe-header {
  background: #fff; padding: 20rpx 40rpx 30rpx;
  .title-bar { 
    text-align: center; font-size: 34rpx; font-weight: 900; color: #1E293B; margin-bottom: 20rpx;
  }
  .search-box {
    height: 84rpx; background: #F1F5F9; border-radius: 20rpx;
    display: flex; align-items: center; padding: 0 30rpx; gap: 20rpx;
    .ipt { flex: 1; font-size: 28rpx; color: #1E293B; }
  }
}

.split-view {
  flex: 1; display: flex; overflow: hidden;
}

.sidebar {
  width: 160rpx; background: #F8FAFC;
  .side-nav {
    padding: 36rpx 0; display: flex; flex-direction: column; align-items: center; gap: 8rpx;
    position: relative; color: #94A3B8; font-size: 24rpx; font-weight: 700;
    &.active {
      background: #fff; color: #6366F1;
      .bar {
        position: absolute; left: 0; top: 35%; height: 30%; width: 6rpx;
        background: #6366F1; border-radius: 0 4rpx 4rpx 0;
      }
    }
  }
}

.pro-list { flex: 1; background: #fff; padding: 24rpx; box-sizing: border-box; }

.mall-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24rpx; }

.mall-item {
  background: #fff; border-radius: 20rpx; border: 1rpx solid #F1F5F9; overflow: hidden;
  .item-visual {
    height: 200rpx; background: #F8FAFC; display: flex; align-items: center; justify-content: center; position: relative;
    .img { width: 130rpx; height: 130rpx; }
    .tag { position: absolute; top: 0; right: 0; background: #F43F5E; color: #fff; font-size: 18rpx; padding: 4rpx 8rpx; border-bottom-left-radius: 12rpx; }
  }
  .item-detail {
    padding: 16rpx;
    .name { font-size: 26rpx; font-weight: 800; color: #1E293B; line-height: 1.3; height: 68rpx; overflow: hidden; display: block; }
    .desc { font-size: 20rpx; color: #94A3B8; margin: 8rpx 0 16rpx; display: block; }
    .footer-p {
      display: flex; justify-content: space-between; align-items: center;
      .price { font-size: 30rpx; font-weight: 900; color: #F43F5E; }
    }
  }
}

.settle-bar {
  position: fixed; left: 0; right: 0; 
  bottom: var(--window-bottom); // 吸附在 TabBar 之上 (重要修复)
  background: #fff; padding: 20rpx 40rpx;
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1rpx solid #F1F5F9; z-index: 999;
  
  .total-p {
    display: flex; align-items: baseline;
    .label { font-size: 26rpx; color: #64748B; font-weight: 700; margin-right: 10rpx; }
    .sym { color: #F43F5E; font-size: 24rpx; font-weight: 800; }
    .num { color: #F43F5E; font-size: 40rpx; font-weight: 900; margin-left: 4rpx; }
  }
  
  .settle-btn {
    width: 240rpx; height: 88rpx; line-height: 88rpx; background: #FF4D4F;
    color: #fff; border-radius: 44rpx; font-size: 28rpx; font-weight: 800; margin: 0;
    box-shadow: 0 10rpx 20rpx rgba(255, 77, 79, 0.2);
    &[disabled] { opacity: 0.5; box-shadow: none; }
  }
}

.empty-state { text-align: center; padding-top: 100rpx; color: #94A3B8; font-size: 26rpx; }
.bottom-safe-space { height: 120rpx; }
.shadow-top { box-shadow: 0 -10rpx 30rpx rgba(0,0,0,0.03); }
</style>
