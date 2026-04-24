<template>
  <view class="container">
    <view class="tab-bar">
      <view v-for="t in tabs" :key="t.val" class="tab-item" :class="{ active: currentTab === t.val }" @tap="currentTab = t.val">
        <text>{{ t.label }}</text>
        <view class="dot" v-if="currentTab === t.val"></view>
      </view>
    </view>

    <scroll-view scroll-y class="coupon-list-scroll">
      <view class="coupon-list" v-if="filteredCoupons.length > 0">
        <view 
          class="coupon-card" 
          v-for="(c, i) in filteredCoupons" 
          :key="i"
          :class="{ expired: currentTab !== 'valid' }"
        >
          <view class="c-left">
            <view class="amt">
              <text class="unit">¥</text>
              <text class="val">{{ c.val }}</text>
            </view>
            <text class="cond">满{{ c.min }}可用</text>
          </view>
          <view class="c-mid">
            <view class="c-info">
              <view class="tag" :class="c.type">{{ c.tag }}</view>
              <text class="title">{{ c.title }}</text>
            </view>
            <text class="time">有效期至：{{ c.expiry }}</text>
          </view>
          <view class="c-right" @tap="useCoupon(c)">
            <text class="btn-text">{{ currentTab === 'valid' ? '去使用' : (currentTab === 'used' ? '已核销' : '已失效') }}</text>
          </view>
          
          <view class="hole top"></view>
          <view class="hole bottom"></view>
        </view>
      </view>

      <view class="empty-box" v-else>
        <image src="/static/images/empty_data.png" mode="aspectFit" />
        <text>暂无相关优惠券</text>
      </view>
    </scroll-view>

    <view class="exchange-box">
      <input v-model="promoCode" placeholder="请输入优惠券兑换码" placeholder-style="color: #B2BEC3;" />
      <view class="exchange-btn" @tap="handleExchange">兑换</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { billingApi } from '@/api/index.js'

const currentTab = ref('valid')
const promoCode = ref('')
const tabs = [
  { label: '未使用', val: 'valid' },
  { label: '已使用', val: 'used' },
  { label: '已过期', val: 'expired' }
]

const coupons = ref([])

const fetchCoupons = async () => {
  try {
    const res = await billingApi.getCoupons()
    const now = new Date().getTime()
    coupons.value = (res.data || []).map(uc => {
      const validTo = uc.coupon.validTo ? new Date(uc.coupon.validTo).getTime() : null
      let status = 'valid'
      if (uc.useStatus === '1') status = 'used'
      else if (validTo && validTo < now) status = 'expired'
      
      // 根据标题或类型做简单的映射，增加视觉区分
      let tag = '全场通用'; let type = 'general'; let url = '/pages/index/index'
      const title = uc.coupon.title || ''
      if (title.includes('药')) { tag = '限药品'; type = 'medicine'; url = '/pages/pharmacy/index' }
      else if (title.includes('疫苗')) { tag = '限疫苗'; type = 'vaccine'; url = '/pages/vaccine/index' }
      else if (title.includes('手术') || title.includes('挂号')) { tag = '限就诊'; type = 'surgery'; url = '/pages/appointment/index' }

      return {
        val: uc.coupon.type === 'CASH' ? uc.coupon.amount : (uc.coupon.amount * 10),
        min: uc.coupon.minSpend,
        title: uc.coupon.title,
        tag: tag,
        expiry: uc.coupon.validTo ? uc.coupon.validTo.split(' ')[0] : '永久有效',
        status: status,
        type: type,
        url: url,
        id: uc.id
      }
    })
  } catch (e) {
    console.error('Fetch coupons err', e)
  }
}


const filteredCoupons = computed(() => {
  return coupons.value.filter(c => c.status === currentTab.value)
})

const useCoupon = (c) => {
  if (currentTab.value !== 'valid') return
  const tabBarPages = ['/pages/index/index', '/pages/discovery/index', '/pages/pharmacy/index', '/pages/appointment/index', '/pages/profile/index']
  if (tabBarPages.includes(c.url)) {
    uni.switchTab({ url: c.url })
  } else {
    uni.navigateTo({ url: c.url })
  }
}

const handleExchange = () => {
  if (!promoCode.value) return
  uni.showLoading({ title: '核销中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '兑换码无效', icon: 'none' })
  }, 1000)
}

onMounted(() => {
  fetchCoupons()
})
</script>

<style lang="scss" scoped>


.container { min-height: 100vh; background: #F4F7FC; display: flex; flex-direction: column; }

.tab-bar {
  display: flex; background: #fff; padding: 20rpx 0; position: sticky; top: 0; z-index: 10;
  .tab-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8rpx;
    text { font-size: 28rpx; color: #636E72; font-weight: 600; transition: color 0.3s; }
    .dot { width: 40rpx; height: 6rpx; background: #5C6BC0; border-radius: 10rpx; }
    &.active text { color: #5C6BC0; }
  }
}

.coupon-list-scroll { flex: 1; padding: 30rpx; box-sizing: border-box; }

.coupon-card {
  height: 200rpx; background: #fff; border-radius: 24rpx; margin-bottom: 30rpx;
  display: flex; overflow: hidden; position: relative;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.03);
  
  .c-left {
    width: 220rpx; background: linear-gradient(135deg, #FF7675 0%, #EE5253 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff;
    .amt {
      display: flex; align-items: baseline; gap: 4rpx;
      .unit { font-size: 24rpx; font-weight: 800; }
      .val { font-size: 56rpx; font-weight: 900; }
    }
    .cond { font-size: 20rpx; opacity: 0.8; }
  }
  
  .c-mid {
    flex: 1; padding: 30rpx; display: flex; flex-direction: column; justify-content: space-between;
    .c-info {
      display: flex; flex-direction: column; gap: 8rpx;
      .tag { 
        font-size: 18rpx; padding: 4rpx 12rpx; border-radius: 6rpx; width: fit-content; font-weight: 800;
        &.general { background: #E8EAF6; color: #5C6BC0; }
        &.medicine { background: #E8F5E9; color: #66BB6A; }
        &.vaccine { background: #E3F2FD; color: #42A5F5; }
        &.surgery { background: #FFF3E0; color: #F39C12; }
      }
      .title { font-size: 28rpx; font-weight: 800; color: #2D3436; }
    }
    .time { font-size: 20rpx; color: #B2BEC3; }
  }
  
  .c-right {
    width: 60rpx; writing-mode: vertical-rl; display: flex; align-items: center; justify-content: center;
    background: #FAFBFC; border-left: 2rpx dashed #E0E4E8;
    .btn-text { font-size: 24rpx; color: #5C6BC0; font-weight: 800; letter-spacing: 4rpx; }
  }
  
  &.expired {
    .c-left { background: #B2BEC3; }
    .c-mid .c-info .tag { background: #F1F2F6 !important; color: #B2BEC3 !important; }
    .c-mid .c-info .title { color: #B2BEC3; }
    .c-right .btn-text { color: #B2BEC3; }
  }
  
  .hole {
    position: absolute; width: 30rpx; height: 30rpx; background: #F4F7FC; border-radius: 50%;
    left: 205rpx;
    &.top { top: -15rpx; }
    &.bottom { bottom: -15rpx; }
  }
}

.exchange-box {
  background: #fff; padding: 30rpx 40rpx calc(30rpx + env(safe-area-inset-bottom));
  display: flex; gap: 20rpx;
  input { flex: 1; height: 90rpx; background: #F8FAFC; border-radius: 20rpx; padding: 0 30rpx; font-size: 28rpx; }
  .exchange-btn {
    width: 180rpx; height: 90rpx; background: #5C6BC0; color: #fff; 
    display: flex; align-items: center; justify-content: center; border-radius: 20rpx; font-weight: 700;
  }
}

.empty-box {
  display: flex; flex-direction: column; align-items: center; gap: 20rpx; padding-top: 100rpx;
  image { width: 300rpx; height: 300rpx; opacity: 0.5; }
  text { font-size: 26rpx; color: #B2BEC3; }
}
</style>
