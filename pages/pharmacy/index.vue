<template>
  <view class="page">
    <!-- 沉浸式搜索头 -->
    <view class="pharmacy-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <text class="title">宠爱药房</text>
        <view class="search-bar">
          <uni-icons type="search" size="18" color="rgba(255,255,255,0.6)" />
          <input placeholder="搜索处方药、营养品..." placeholder-style="color: rgba(255,255,255,0.4)" />
        </view>
      </view>
    </view>

    <view class="main-body">
      <!-- 极简侧边栏 -->
      <view class="sidebar">
        <view 
          class="sidebar-item" 
          v-for="(cat, index) in categories" 
          :key="cat"
          :class="{ active: activeCat === index }"
          @tap="activeCat = index"
        >
          <view class="indicator" v-if="activeCat === index" />
          <text>{{ cat }}</text>
        </view>
      </view>

      <!-- 商品瀑布流 -->
      <scroll-view scroll-y class="product-view">
        <view class="category-banner card">
          <view class="banner-text">
            <text class="b-title">{{ categories[activeCat] }}专区</text>
            <text class="b-subtitle">精选全球优质宠物医药资源</text>
          </view>
          <image class="banner-img" src="/static/icons/pill.png" mode="aspectFit" />
        </view>

        <view class="product-grid">
          <view class="product-card card" v-for="item in products" :key="item.id">
            <view class="image-area">
              <view class="p-placeholder">
                <uni-icons type="medallion" size="40" color="#E8EAF6" />
              </view>
              <view class="rx-tag" v-if="item.isRx">Rx 处方药</view>
            </view>
            <view class="detail-area">
              <text class="p-name">{{ item.name }}</text>
              <text class="p-desc">{{ item.enName }} · {{ item.spec }}</text>
              <view class="price-row">
                <view class="price-box">
                  <text class="unit">¥</text>
                  <text class="num">{{ item.price }}</text>
                </view>
                <view class="add-btn" @tap.stop="addToCart(item)">
                  <uni-icons type="plus-filled" size="24" color="#5C6BC0" />
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="safe-bottom" />
      </scroll-view>
    </view>

    <!-- 悬浮玻璃拟态购物车 -->
    <view class="float-cart-wrap">
      <view class="float-cart">
        <view class="cart-left">
          <view class="cart-icon">
            <uni-icons type="cart-filled" size="28" color="#5C6BC0" />
            <view class="count-badge" v-if="cartCount > 0">{{ cartCount }}</view>
          </view>
          <view class="total-box">
            <text class="label">预计合计</text>
            <text class="price">¥{{ totalPrice }}</text>
          </view>
        </view>
        <view class="checkout-btn" @tap="goCheckout">去结算</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const statusBarHeight = ref(0)
const activeCat = ref(0)
const cartCount = ref(0)
const totalPrice = ref('0.00')

const categories = ['热门推荐', '常规驱虫', '皮肤用药', '肠胃调理', '处方粮单']
const products = [
  { id: 1, name: '海乐妙 Milbemax', enName: '米尔贝肟', spec: '1片/盒', price: '45.00', isRx: true },
  { id: 2, name: '大宠爱 Revolution', enName: '赛拉菌素', spec: '3支/盒', price: '188.00', isRx: false },
  { id: 3, name: '博来恩 Broadline', enName: '非泼罗尼', spec: '0.9ml/支', price: '98.00', isRx: false },
  { id: 4, name: '莫比新 Mobicine', enName: '阿莫西林', spec: '50mg*10片', price: '68.00', isRx: true },
]

const addToCart = (item) => {
  cartCount.value++
  totalPrice.value = (parseFloat(totalPrice.value) + parseFloat(item.price)).toFixed(2)
  uni.showToast({ title: '已加入待购清单', icon: 'none' })
}

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
})
</script>

<style lang="scss" scoped>
.page { background: $bg-main; height: 100vh; display: flex; flex-direction: column; }

.pharmacy-header {
  background: $primary-grad;
  padding: 20rpx 40rpx 40rpx;
  .header-content {
    .title { font-size: 40rpx; font-weight: 800; color: #fff; margin-bottom: 30rpx; display: block; }
    .search-bar {
      @include glass-morphism;
      height: 80rpx; border-radius: 20rpx; padding: 0 30rpx;
      display: flex; align-items: center; gap: 20rpx;
      input { flex: 1; font-size: 26rpx; color: #fff; }
    }
  }
}

.main-body { flex: 1; display: flex; overflow: hidden; }

.sidebar {
  width: 170rpx; background: rgba(92, 107, 192, 0.03);
  .sidebar-item {
    height: 120rpx; display: flex; align-items: center; justify-content: center; position: relative;
    text { font-size: 26rpx; color: $text-sub; transition: all 0.3s; }
    &.active {
      background: #fff;
      text { color: $primary; font-weight: 800; transform: scale(1.1); }
      .indicator { position: absolute; left: 0; width: 8rpx; height: 40rpx; background: $primary; border-radius: 0 4rpx 4rpx 0; }
    }
  }
}

.product-view { flex: 1; padding: 30rpx; }

.card { @include premium-card; }

.category-banner {
  background: linear-gradient(135deg, $primary-light, #fff);
  padding: 30rpx; display: flex; align-items: center; justify-content: space-between;
  .b-title { font-size: 30rpx; font-weight: 800; color: $primary-dark; display: block; }
  .b-subtitle { font-size: 20rpx; color: $text-sub; }
  .banner-img { width: 100rpx; height: 100rpx; opacity: 0.6; }
}

.product-grid { display: flex; flex-direction: column; gap: 30rpx; }

.product-card {
  display: flex; gap: 30rpx; padding: 24rpx;
  .image-area {
    width: 180rpx; height: 180rpx; background: $bg-main; border-radius: 24rpx;
    position: relative; overflow: hidden; flex-shrink: 0;
    .p-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .rx-tag {
      position: absolute; top: 0; left: 0; background: $accent; color: #fff;
      font-size: 16rpx; font-weight: 700; padding: 4rpx 12rpx; border-radius: 0 0 16rpx 0;
    }
  }
  .detail-area {
    flex: 1; display: flex; flex-direction: column;
    .p-name { font-size: 28rpx; font-weight: 800; color: $text-main; margin-bottom: 8rpx; }
    .p-desc { font-size: 22rpx; color: $text-hint; margin-bottom: 20rpx; }
    .price-row {
      margin-top: auto; display: flex; justify-content: space-between; align-items: center;
      .price-box {
        display: flex; align-items: baseline; color: $accent;
        .unit { font-size: 20rpx; font-weight: 700; }
        .num { font-size: 36rpx; font-weight: 900; }
      }
    }
  }
}

.float-cart-wrap {
  position: fixed; bottom: calc(env(safe-area-inset-bottom) + 120rpx);
  left: 40rpx; right: 40rpx; z-index: 99;
  .float-cart {
    @include glass-morphism;
    height: 110rpx; border-radius: 100rpx; padding: 0 10rpx 0 40rpx;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 20rpx 40rpx rgba(0,0,0,0.1);
    
    .cart-left {
      display: flex; align-items: center; gap: 30rpx;
      .cart-icon {
        position: relative;
        .count-badge {
          position: absolute; top: -10rpx; right: -10rpx; background: $accent; color: #fff;
          font-size: 18rpx; min-width: 32rpx; height: 32rpx; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; border: 4rpx solid #fff;
        }
      }
      .total-box {
        display: flex; flex-direction: column;
        .label { font-size: 20rpx; color: $text-hint; }
        .price { font-size: 36rpx; font-weight: 900; color: $primary-dark; }
      }
    }
    
    .checkout-btn {
      @include action-button($primary-grad);
      height: 90rpx; padding: 0 50rpx; font-size: 30rpx;
    }
  }
}

.safe-bottom { height: 200rpx; }
</style>
