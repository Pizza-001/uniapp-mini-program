<template>
  <view class="container">
    <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <uni-icons type="left" size="24" color="#FFFFFF" @tap="goBack" />
        <text class="nav-title">钱包中心</text>
        <view style="width: 24px;"></view>
      </view>
    </view>

    <view class="header-bg"></view>

    <view class="main-content">
      <!-- 余额卡片 - 尊享视觉 -->
      <view class="balance-card anima-fade-in-down">
        <image class="card-bg" src="/static/images/recharge_card_bg.png" mode="aspectFill" />
        <view class="balance-info">
          <text class="label">当前可用余额</text>
          <view class="amount-row">
            <text class="symbol">¥</text>
            <text class="value">{{ memberInfo.balance || '0.00' }}</text>
          </view>
        </view>
      </view>

      <!-- 充值金额选择 - 灵活交互 -->
      <view class="section-card recharge-section anima-fade-in-up">
        <view class="section-header">
          <text class="title">选择充值金额</text>
          <text class="subtitle">充值越多，福利越多</text>
        </view>
        <view class="amount-grid">
          <view 
            class="amount-item" 
            v-for="(item, index) in amounts" 
            :key="index"
            :class="{ active: currentAmount === item.val }"
            @tap="selectAmount(item.val)"
          >
            <view class="recharge-val">
              <text class="symbol">¥</text>
              <text class="num">{{ item.val }}</text>
            </view>
            <text class="bonus" v-if="item.bonus">送{{ item.bonus }}元</text>
            <view class="hot-tag" v-if="item.hot">HOT</view>
          </view>
          <view 
            class="amount-item custom-item" 
            :class="{ active: currentAmount === 'custom', focused: isCustomFocused }"
            @tap="focusCustom"
          >
            <input 
              v-if="currentAmount === 'custom' || isCustomFocused" 
              type="number" 
              v-model="customInput" 
              placeholder="自定义" 
              class="custom-input"
              :focus="isCustomFocused"
              @blur="isCustomFocused = false"
              @input="onCustomInput"
            />
            <text v-else class="num">自定义</text>
          </view>
        </view>
      </view>

      <!-- 支付方式 - 企业级多端支持 -->
      <view class="section-card payment-section anima-fade-in-up" style="animation-delay: 0.1s;">
        <view class="section-header">
          <text class="title">选择支付方式</text>
        </view>
        <view class="payment-list">
          <view 
            class="payment-item" 
            v-for="p in payments" 
            :key="p.value" 
            @tap="paymentMethod = p.value"
            :class="{ selected: paymentMethod === p.value }"
          >
            <view class="p-left">
              <image class="p-icon" :src="p.img" />
              <view class="p-info">
                <text class="p-label">{{ p.label }}</text>
                <text class="p-desc">{{ p.desc }}</text>
              </view>
            </view>
            <view class="check-box">
              <view class="inner-circle" v-if="paymentMethod === p.value"></view>
            </view>
          </view>
        </view>
      </view>

      <view class="agreement-box">
        <checkbox :checked="isAgreed" @tap="isAgreed = !isAgreed" color="#7986CB" style="transform:scale(0.7)" />
        <text class="agreement-text">同意<text class="link">《充值协议》</text>并了解相关充值说明</text>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="total-info">
        <view class="pay-row">
          <text class="label">待支付:</text>
          <text class="symbol">¥</text>
          <text class="value">{{ finalAmount }}</text>
        </view>
        <text class="arrival-tips" v-if="actualBonus > 0">实际到账 ¥{{ totalArrival }}</text>
      </view>
      <view class="pay-btn" :class="{ loading: loading }" @tap="handleRecharge">
        <text v-if="!loading">立即充值</text>
        <uni-icons v-else type="spinner-cycle" size="24" color="#fff" class="spin" />
      </view>
    </view>

    <!-- 成功效果弹窗 - 自定义高颜值模态框 -->
    <view class="custom-modal-overlay" v-if="showSuccessPopup" @touchmove.stop.prevent>
      <view class="custom-modal-content anima-zoom-in">
        <view class="success-glow"></view>
        <view class="success-icon-wrapper">
          <view class="icon-circle">
            <uni-icons type="checkmarkempty" size="48" color="#fff" />
          </view>
          <view class="success-ring"></view>
        </view>
        <view class="success-text-content">
          <text class="modal-title">充值成功</text>
          <view class="modal-amount-row">
            <text class="currency">¥</text>
            <text class="amount-val">{{ lastRechargeAmt }}</text>
          </view>
          <text class="arrival-desc">充值金额已即时存入您的账户</text>
        </view>
        <view class="modal-btn" @tap="closeAndBack">完成</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { memberApi } from '@/api/index.js'
import { onShow } from '@dcloudio/uni-app'

const statusBarHeight = ref(0)
const memberInfo = ref({ balance: 0, level: '0' })
const currentAmount = ref(100)
const customInput = ref('')
const isCustomFocused = ref(false)
const paymentMethod = ref('WECHAT')
const loading = ref(false)
const isAgreed = ref(true)
const lastRechargeAmt = ref(0)
const showSuccessPopup = ref(false)

const amounts = [
  { val: 50, bonus: 0, hot: false },
  { val: 100, bonus: 5, hot: false },
  { val: 200, bonus: 15, hot: true },
  { val: 500, bonus: 50, hot: false },
  { val: 1000, bonus: 120, hot: false }
]

const payments = [
  { label: '微信支付', value: 'WECHAT', img: '/static/icons/wx.png', desc: '亿万用户的选择，安全便捷' },
  { label: '支付宝', value: 'ALIPAY', img: '/static/icons/alipay.png', desc: '蚂蚁金服旗下，支付无忧' },
  { label: '银联支付', value: 'UNION', img: '/static/icons/unionpay.png', desc: '支持各大银行卡快速充值' }
]

const finalAmount = computed(() => {
  if (currentAmount.value === 'custom') {
    return Number(customInput.value) || 0
  }
  return currentAmount.value
})

const actualBonus = computed(() => {
  const amt = finalAmount.value
  if (amt >= 1000) return 120
  if (amt >= 500) return 50
  if (amt >= 200) return 15
  if (amt >= 100) return 5
  return 0
})

const totalArrival = computed(() => finalAmount.value + actualBonus.value)

const goBack = () => uni.navigateBack()

const parseLevel = (levelStr) => {
  const levels = { '3': '钻石会员', '2': '黄金会员', '1': '白银会员' }
  return levels[levelStr] || '普通会员'
}

const selectAmount = (val) => {
  currentAmount.value = val
  isCustomFocused.value = false
}

const focusCustom = () => {
  currentAmount.value = 'custom'
  isCustomFocused.value = true
}

const onCustomInput = (e) => {
  customInput.value = e.detail.value
}

const getMemberAsset = async () => {
  try {
    const res = await memberApi.getMemberInfo()
    if(res.code === 200 && res.data) {
      memberInfo.value = res.data
    }
  } catch(e) {}
}

const handleRecharge = async () => {
  const amt = finalAmount.value
  if (amt <= 0) {
    uni.showToast({ title: '充值金额无效', icon: 'none' })
    return
  }
  if (!isAgreed.value) {
    uni.showToast({ title: '请先同意充值协议', icon: 'none' })
    return
  }
  
  loading.value = true
  uni.showLoading({ title: '正在处理...', mask: true })
  
  try {
    const res = await memberApi.recharge({ amount: amt, paymentMethod: paymentMethod.value })
    if (res.code === 200) {
      lastRechargeAmt.value = amt
      showSuccessPopup.value = true
      // 触感反馈
      uni.vibrateShort()
    } else {
      uni.showToast({ title: res.msg || '充值失败', icon: 'none' })
    }
  } catch(e) {
    console.error('充值请求失败:', e)
    const errorMsg = e.msg || e.message || (e.errMsg ? `网络连接问题(${e.errMsg})` : '服务器通讯异常')
    uni.showToast({ title: errorMsg, icon: 'none' })
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}

const closeAndBack = () => {
  showSuccessPopup.value = false
  uni.navigateBack()
}

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
})

onShow(() => {
  getMemberAsset()
})
</script>

<script>
export default {
  name: 'RechargePage'
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #F4F7FC;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.custom-navbar {
  position: fixed; top: 0; left: 0; width: 100%; z-index: 100;
  background: transparent;
  .nav-content {
    height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 30rpx;
    .nav-title { color: #fff; font-size: 32rpx; font-weight: 800; }
  }
}

.header-bg {
  height: 460rpx;
  background: linear-gradient(135deg, #5C6BC0 0%, #3F51B5 100%);
  border-bottom-left-radius: 80rpx;
  border-bottom-right-radius: 80rpx;
  position: absolute; top: 0; left: 0; width: 100%; z-index: 1;
}

.main-content {
  position: relative; z-index: 2; padding: 180rpx 40rpx 200rpx;
}

.balance-card {
  height: 220rpx; border-radius: 40rpx; overflow: hidden; position: relative;
  background: #2D3436; margin-bottom: 50rpx;
  box-shadow: 0 30rpx 60rpx rgba(63, 81, 181, 0.2);
  
  .card-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.2; }
  
  .balance-info {
    position: relative; z-index: 2; padding: 40rpx;
    .label { font-size: 24rpx; color: rgba(255,255,255,0.6); margin-bottom: 20rpx; display: block; }
    .amount-row {
      display: flex; align-items: baseline; gap: 10rpx;
      .symbol { font-size: 36rpx; color: #fff; font-weight: 800; }
      .value { font-size: 64rpx; color: #fff; font-weight: 900; letter-spacing: 2rpx; font-family: monospace; }
    }
  }
  
  .member-tag {
    position: absolute; right: 40rpx; top: 40rpx;
    display: flex; align-items: center; gap: 8rpx;
    background: rgba(255,255,255,0.1); padding: 8rpx 20rpx; border-radius: 100rpx;
    text { color: #F1C40F; font-size: 20rpx; font-weight: 800; }
  }
}

.section-card {
  background: #fff; border-radius: 40rpx; padding: 40rpx; margin-bottom: 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.02);
  
  .section-header {
    margin-bottom: 40rpx; display: flex; flex-direction: column; gap: 8rpx;
    .title { font-size: 32rpx; font-weight: 800; color: #2D3436; }
    .subtitle { font-size: 22rpx; color: #B2BEC3; }
  }
}

.amount-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24rpx;
  
  .amount-item {
    height: 140rpx; border-radius: 24rpx; background: #F8FAFC; border: 3rpx solid #F0F3F6;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    .recharge-val {
      display: flex; align-items: baseline; gap: 4rpx;
      .symbol { font-size: 24rpx; font-weight: 800; color: #333; }
      .num { font-size: 44rpx; font-weight: 900; color: #333; }
    }
    
    .bonus { font-size: 18rpx; color: #FF7675; margin-top: 6rpx; font-weight: 600; }
    .hot-tag {
      position: absolute; top: -10rpx; right: -10rpx; background: #FF7675; color: #fff;
      font-size: 16rpx; font-weight: 900; padding: 4rpx 10rpx; border-radius: 10rpx;
      box-shadow: 0 4rpx 10rpx rgba(255, 118, 117, 0.3);
    }
    
    &.active {
      background: #FFFFFF; border-color: #5C6BC0; transform: translateY(-4rpx);
      box-shadow: 0 12rpx 30rpx rgba(92, 107, 192, 0.1);
      .symbol, .num { color: #5C6BC0; }
    }
    
    &.custom-item {
      .num { font-size: 28rpx; color: #636E72; }
      .custom-input { width: 100%; text-align: center; font-size: 40rpx; font-weight: 900; color: #5C6BC0; }
    }
  }
}

.payment-list {
  display: flex; flex-direction: column; gap: 30rpx;
  
  .payment-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 30rpx; border-radius: 24rpx; background: #F8FAFC; border: 3rpx solid transparent;
    transition: all 0.2s ease;
    
    .p-left {
      display: flex; align-items: center; gap: 24rpx;
      .p-icon { width: 64rpx; height: 64rpx; }
      .p-info {
        display: flex; flex-direction: column; gap: 6rpx;
        .p-label { font-size: 28rpx; font-weight: 800; color: #2D3436; }
        .p-desc { font-size: 20rpx; color: #B2BEC3; }
      }
    }
    
    .check-box {
      width: 44rpx; height: 44rpx; border-radius: 50%; border: 4rpx solid #E0E4E8;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
      .inner-circle { width: 24rpx; height: 24rpx; background: #fff; border-radius: 50%; }
    }
    
    &.selected {
      background: #FFFFFF; border-color: #5C6BC0; box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.03);
      .check-box { background: #5C6BC0; border-color: #5C6BC0; }
    }
  }
}

.agreement-box {
  display: flex; align-items: center; justify-content: center; gap: 10rpx; padding-bottom: 60rpx;
  .agreement-text { font-size: 22rpx; color: #B2BEC3; .link { color: #5C6BC0; font-weight: 600; } }
}

.bottom-bar {
  position: fixed; bottom: 0; left: 0; width: 100%; padding: 30rpx 50rpx calc(30rpx + env(safe-area-inset-bottom));
  background: #fff; box-shadow: 0 -20rpx 60rpx rgba(0,0,0,0.05);
  display: flex; justify-content: space-between; align-items: center; z-index: 90;
  box-sizing: border-box;
  
  .total-info {
    display: flex; flex-direction: column; gap: 4rpx;
    .pay-row {
      display: flex; align-items: baseline; gap: 6rpx;
      .label { font-size: 24rpx; color: #636E72; }
      .symbol { font-size: 32rpx; color: #FF7675; font-weight: 800; }
      .value { font-size: 56rpx; color: #FF7675; font-weight: 900; font-family: monospace; }
    }
    .arrival-tips { font-size: 20rpx; color: #5C6BC0; font-weight: 700; }
  }
  
  .pay-btn {
    width: 320rpx; height: 100rpx; background: linear-gradient(135deg, #5C6BC0 0%, #3F51B5 100%);
    border-radius: 50rpx; display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 32rpx; font-weight: 800; box-shadow: 0 20rpx 40rpx rgba(63, 81, 181, 0.3);
    transition: transform 0.1s;
    &:active { transform: scale(0.96); }
    &.loading { opacity: 0.8; }
  }
}

// 成功弹窗样式
.custom-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(10px); }
.custom-modal-content { position: relative; width: 620rpx; background: #fff; border-radius: 60rpx; padding: 80rpx 40rpx 60rpx; text-align: center; overflow: hidden;
  .success-glow { position: absolute; top: -100rpx; left: 50%; transform: translateX(-50%); width: 400rpx; height: 400rpx; background: radial-gradient(circle, rgba(102,187,106,0.1) 0%, transparent 70%); }
  .success-icon-wrapper { position: relative; width: 160rpx; height: 160rpx; margin: 0 auto 40rpx;
    .icon-circle { width: 160rpx; height: 160rpx; background: #66BB6A; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; z-index: 5; box-shadow: 0 20rpx 40rpx rgba(102,187,106,0.3); }
    .success-ring { position: absolute; top: -10rpx; left: -10rpx; right: -10rpx; bottom: -10rpx; border: 4rpx solid #66BB6A; border-radius: 50%; animation: pulse-ring 2s infinite; }
  }
  .success-text-content { .modal-title { font-size: 40rpx; font-weight: 900; color: #2D3436; display: block; margin-bottom: 20rpx; }
    .modal-amount-row { display: flex; align-items: baseline; justify-content: center; gap: 8rpx; margin-bottom: 20rpx; .currency { font-size: 32rpx; color: #2D3436; font-weight: 800; } .amount-val { font-size: 64rpx; font-weight: 900; color: #2D3436; } }
    .arrival-desc { font-size: 26rpx; color: #94A3B8; }
  }
  .modal-btn { margin-top: 60rpx; background: #2D3436; color: #fff; font-size: 32rpx; font-weight: 800; padding: 30rpx; border-radius: 30rpx; box-shadow: 0 20rpx 40rpx rgba(0,0,0,0.1); &:active { transform: scale(0.96); } }
}

// 基础动效库 - 替代外部 animate.css
.anima-fade-in-down { animation: fadeInDown 0.6s both; }
.anima-fade-in-up { animation: fadeInUp 0.6s both; }
.anima-zoom-in { animation: zoomIn 0.4s both; }

@keyframes fadeInDown { 
  from { opacity: 0; transform: translate3d(0, -30px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes fadeInUp { 
  from { opacity: 0; transform: translate3d(0, 30px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes zoomIn { 
  from { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); }
  50% { opacity: 1; }
}

@keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.3); opacity: 0; } }
@keyframes rotate { from { transform: rotate(0); } to { transform: rotate(360deg); } }
</style>
