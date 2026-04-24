<template>
  <view class="checkout-page">
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back" @tap="goBack">
        <uni-icons type="left" size="24" color="#1E293B" />
      </view>
      <text class="title">确认支付</text>
      <view class="back"></view>
    </view>

    <scroll-view scroll-y class="main-scroll">
      <!-- 价格摘要 -->
      <view class="price-summary shadow-sm">
        <view class="total-payable">
          <text class="label">实付总额</text>
          <view class="price-box">
            <text class="symbol">¥</text>
            <text class="amount">{{ finalPayPrice }}</text>
          </view>
        </view>
        <view class="bill-details">
          <view class="bill-row">
            <text>商品原价</text>
            <text>¥{{ totalPrice }}</text>
          </view>
          <view class="bill-row red" v-if="selectedCoupon">
            <text>优惠券抵扣</text>
            <text>-¥{{ discountText }}</text>
          </view>
        </view>
      </view>

      <!-- 优惠券 -->
      <view class="section-title">优惠选择</view>
      <view class="coupon-box shadow-sm" @tap="openCouponModal">
        <view class="left">
          <uni-icons type="gift-filled" size="22" color="#F43F5E" />
          <text>我的优惠券</text>
        </view>
        <view class="right">
          <text class="status" :class="{ active: selectedCoupon }">
            {{ selectedCoupon ? `已享优惠 -¥${discountText}` : (coupons.length > 0 ? `${coupons.length}张可用` : '无可用券') }}
          </text>
          <uni-icons type="right" size="14" color="#94A3B8" />
        </view>
      </view>

      <!-- 支付方式 -->
      <view class="section-title">支付方式</view>
      <view class="payment-list shadow-sm">
        <view 
          class="pay-item" 
          v-for="item in paymentMethods" 
          :key="item.id"
          @tap="currentMethod = item.id"
        >
          <view class="item-left">
            <view class="payment-icon" :class="item.id.toLowerCase()">
              <uni-icons :type="item.icon" size="22" color="#fff" />
            </view>
            <view class="payment-info">
              <text class="name">{{ item.name }}</text>
              <text class="desc" v-if="item.id === 'BALANCE'">会员余额: ¥{{ balance }}</text>
            </view>
          </view>
          <view class="item-radio">
            <view class="radio-outer" :class="{ selected: currentMethod === item.id }">
              <view class="radio-inner" v-if="currentMethod === item.id"></view>
            </view>
          </view>
        </view>
      </view>

      <view class="safe-bottom"></view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="footer-action shadow-top">
      <view class="total-info">
        <text class="lbl">合计:</text>
        <text class="amt">¥{{ finalPayPrice }}</text>
      </view>
      <button class="submit-pay-btn" :loading="paying" @tap="handlePay">
        确认支付
      </button>
    </view>

    <!-- 优惠券弹层 -->
    <uni-popup ref="couponPopup" type="bottom" background-color="#fff">
      <view class="modal-content">
        <view class="modal-header">
          <text>选择可用优惠券</text>
          <uni-icons type="closeempty" size="24" color="#94A3B8" @tap="closeCouponModal" />
        </view>
        <scroll-view scroll-y class="coupon-scroller">
          <view 
            class="c-card" 
            v-for="uc in coupons" 
            :key="uc.id"
            :class="{ active: selectedCoupon?.id === uc.id, disabled: totalPrice < uc.coupon.minSpend }"
            @tap="selectCoupon(uc)"
          >
            <view class="c-left">
              <text class="c-val">{{ uc.coupon.amount }}</text>
              <text class="c-unit">{{ uc.coupon.type === 'CASH' ? '元' : '折' }}</text>
            </view>
            <view class="c-right">
              <text class="c-name">{{ uc.coupon.title }}</text>
              <text class="c-limit">无门槛或满{{ uc.coupon.minSpend }}元可用</text>
            </view>
            <view class="c-checker">
              <uni-icons type="checkbox-filled" size="24" color="#6366F1" v-if="selectedCoupon?.id === uc.id" />
              <view class="dot" v-else></view>
            </view>
          </view>
          <view v-if="coupons.length === 0" class="empty-c">暂无优惠券</view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { billingApi, memberApi } from '@/api/index.js'

const statusBarHeight = ref(0)
const items = ref([])
const coupons = ref([])
const selectedCoupon = ref(null)
const balance = ref('0.00')
const currentMethod = ref('WECHAT')
const paying = ref(false)
const billingId = ref('')

const paymentMethods = [
  { id: 'WECHAT', name: '微信支付', icon: 'weixin' },
  { id: 'ALIPAY', name: '支付宝支付', icon: 'paperplane-filled' },
  { id: 'BALANCE', name: '余额支付', icon: 'wallet-filled' },
  { id: 'BANK', name: '银行支付', icon: 'card' }
]

const totalPrice = computed(() => items.value.reduce((acc, item) => acc + (item.price * item.count), 0))

const discountText = computed(() => {
  if (!selectedCoupon.value) return '0.00'
  const c = selectedCoupon.value.coupon
  if (c.type === 'CASH') return c.amount.toFixed(2)
  return (totalPrice.value * (1 - c.amount)).toFixed(2)
})

const finalPayPrice = computed(() => {
  let val = totalPrice.value
  if (selectedCoupon.value) {
    const c = selectedCoupon.value.coupon
    if (c.type === 'CASH') val -= c.amount
    else val *= c.amount
  }
  return Math.max(0, val).toFixed(2)
})

const goBack = () => uni.navigateBack()
const couponPopup = ref(null)
const openCouponModal = () => couponPopup.value.open()
const closeCouponModal = () => couponPopup.value.close()

const selectCoupon = (uc) => {
  if (totalPrice.value < uc.coupon.minSpend) return
  selectedCoupon.value = (selectedCoupon.value?.id === uc.id) ? null : uc
  closeCouponModal()
}

const fetchData = async () => {
  try {
    const memberRes = await memberApi.getMemberInfo()
    balance.value = memberRes.data.balance.toFixed(2)
    const couponRes = await billingApi.getCoupons()
    coupons.value = couponRes.data || []
  } catch (e) {}
}

const handlePay = async () => {
  if (paying.value) return
  paying.value = true
  uni.showLoading({ title: '确认扣款中...', mask: true })
  try {
    await billingApi.settle({
      id: billingId.value,
      paymentMethod: currentMethod.value,
      userCouponId: selectedCoupon.value ? selectedCoupon.value.id : null,
      items: items.value
    })
    uni.hideLoading()
    uni.showToast({ title: '支付成功', icon: 'success' })
    setTimeout(() => { uni.redirectTo({ url: '/pages/pharmacy/success' }) }, 1000)
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: e.msg || '支付中断', icon: 'none' })
  } finally {
    paying.value = false
  }
}

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
  const pages = getCurrentPages()
  const options = pages[pages.length-1].options
  if (options.data) {
    const data = JSON.parse(decodeURIComponent(options.data))
    items.value = data.items
    billingId.value = data.billingId
  }
  fetchData()
})
</script>

<style lang="scss" scoped>
.checkout-page { background: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; }

.nav-bar {
  background: #fff; padding: 20rpx 40rpx;
  display: flex; align-items: center; justify-content: space-between;
  .title { font-size: 32rpx; font-weight: 800; color: #1E293B; }
  .back { width: 80rpx; }
}

.main-scroll { flex: 1; padding: 32rpx; box-sizing: border-box; }

.price-summary {
  background: #fff; border-radius: 24rpx; padding: 40rpx; margin-bottom: 32rpx;
  .total-payable {
    text-align: center; margin-bottom: 32rpx;
    .label { font-size: 24rpx; color: #94A3B8; font-weight: 600; }
    .price-box {
      margin-top: 8rpx; color: #1E293B;
      .symbol { font-size: 32rpx; font-weight: 800; }
      .amount { font-size: 72rpx; font-weight: 900; margin-left: 8rpx; }
    }
  }
  .bill-details {
    border-top: 1rpx dashed #F1F5F9; padding-top: 32rpx;
    .bill-row {
      display: flex; justify-content: space-between; font-size: 26rpx; color: #64748B; margin-bottom: 12rpx;
      &.red { color: #F43F5E; font-weight: 700; }
    }
  }
}

.coupon-box {
  background: #fff; border-radius: 20rpx; padding: 32rpx; display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 40rpx;
  .left { display: flex; align-items: center; gap: 16rpx; font-size: 28rpx; font-weight: 700; color: #1E293B; }
  .right {
    display: flex; align-items: center; gap: 8rpx;
    .status { font-size: 24rpx; color: #94A3B8; &.active { color: #F43F5E; font-weight: 800; } }
  }
}

.payment-list {
  background: #fff; border-radius: 20rpx; overflow: hidden;
  .pay-item {
    display: flex; justify-content: space-between; align-items: center; padding: 32rpx;
    border-bottom: 1rpx solid #F8FAFC;
    &:last-child { border-bottom: none; }
    
    .item-left {
      display: flex; align-items: center; gap: 24rpx;
      .payment-icon {
        width: 72rpx; height: 72rpx; border-radius: 20rpx;
        display: flex; align-items: center; justify-content: center;
        &.wechat { background: #10B981; }
        &.alipay { background: #0EA5E9; }
        &.balance { background: #6366F1; }
        &.bank { background: #F59E0B; }
      }
      .payment-info {
        display: flex; flex-direction: column;
        .name { font-size: 28rpx; font-weight: 700; color: #1E293B; }
        .desc { font-size: 20rpx; color: #94A3B8; margin-top: 4rpx; }
      }
    }
    .item-radio {
      .radio-outer {
        width: 40rpx; height: 40rpx; border: 4rpx solid #E2E8F0; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        &.selected { border-color: #1E293B; background: #1E293B; }
        .radio-inner { width: 16rpx; height: 16rpx; background: #fff; border-radius: 50%; }
      }
    }
  }
}

.section-title { font-size: 28rpx; font-weight: 800; color: #1E293B; margin-bottom: 20rpx; }

.footer-action {
  background: #fff; padding: 24rpx 40rpx 60rpx;
  display: flex; justify-content: space-between; align-items: center;
  .total-info {
    display: flex; align-items: baseline;
    .lbl { font-size: 28rpx; color: #64748B; font-weight: 600; margin-right: 8rpx; }
    .amt { font-size: 40rpx; font-weight: 900; color: #F43F5E; }
  }
  .submit-pay-btn {
    width: 280rpx; height: 88rpx; line-height: 88rpx; background: #1E293B;
    color: #fff; border-radius: 44rpx; font-size: 28rpx; font-weight: 800;
  }
}

.modal-content {
  background: #fff; border-top-left-radius: 48rpx; border-top-right-radius: 48rpx; padding: 48rpx;
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx; font-size: 34rpx; font-weight: 900; color: #1E293B; }
  .c-card {
    display: flex; align-items: center; background: #F8FAFC; border-radius: 24rpx; padding: 32rpx; margin-bottom: 20rpx;
    border: 2rpx solid transparent;
    &.active { background: #EEF2FF; border-color: #6366F1; }
    &.disabled { opacity: 0.5; }
    
    .c-left {
      width: 120rpx; display: flex; align-items: baseline; color: #6366F1;
      .c-val { font-size: 44rpx; font-weight: 900; }
      .c-unit { font-size: 20rpx; font-weight: 700; margin-left: 4rpx; }
    }
    .c-right {
      flex: 1; padding-left: 20rpx;
      .c-name { display: block; font-size: 26rpx; font-weight: 800; color: #1E293B; }
      .c-limit { font-size: 20rpx; color: #94A3B8; margin-top: 4rpx; }
    }
    .c-checker { .dot { width: 36rpx; height: 36rpx; border-radius: 50%; border: 4rpx solid #CBD5E1; } }
  }
}

.shadow-sm { box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02); }
.shadow-top { box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.02); }
.safe-bottom { height: 100rpx; }
</style>
