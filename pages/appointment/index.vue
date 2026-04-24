<template>
  <view class="page">
    <!-- 1. 顶部毛玻璃导航 -->
    <view class="glass-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <view class="title-row">
          <view class="back-btn" @tap="handleBack">
            <uni-icons type="left" size="24" color="#2C3E50" />
          </view>
          <text class="page-title">预约挂号</text>
        </view>
        <view class="tabs-scroll">
          <view class="tabs-inner">
            <view 
              class="tab-item" 
              v-for="(tab, index) in tabs" 
              :key="tab" 
              :class="{ active: activeTab === index }"
              @tap="activeTab = index"
            >
              <text class="tab-text">{{ tab }}</text>
              <view class="tab-line" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" enable-back-to-top>
      <!-- 占位 (收紧间距) -->
      <view :style="{ height: statusBarHeight + 94 + 'px' }" />

      <!-- 2. 医师挂号列表 -->
      <view v-if="activeTab === 0" class="doctor-list">
        <view class="doctor-card animate-in" v-for="doc in doctors" :key="doc.doctorId">
          <view class="card-top">
            <view class="avatar-wrap">
              <image class="avatar" :src="formatImageUrl(doc.photo || doc.avatar)" mode="aspectFill" />
              <view class="online-status" :style="{ background: getStatusColor(doc.status) }"></view>
            </view>
            <view class="info">
              <view class="name-row">
                <text class="name">{{ doc.name }}</text>
                <text class="title-tag">{{ doc.title }}</text>
              </view>
              <text class="dept-text">{{ doc.specialty || '全科名医' }} | 从医{{ doc.experience || '10+' }}年</text>
              <view class="card-stats">
                <view class="stat-item">
                  <uni-icons type="star-filled" size="14" color="#FFB300" />
                  <text>{{ doc.rating || '5.0' }}</text>
                </view>
                <view class="stat-sep"></view>
                <text class="status-label" :style="{ color: getStatusColor(doc.status) }">{{ getStatusText(doc.status) }}</text>
              </view>
            </view>
          </view>
          
          <view class="card-footer">
            <view class="price-box">
              <text class="label">挂号费</text>
              <text class="unit">¥</text>
              <text class="price">{{ doc.fee != null ? doc.fee : 50 }}</text>
            </view>
            <view 
              class="btn-book" 
              :class="{ disabled: isOffDuty(doc.status) }"
              @tap="handleBook(doc)"
            >
              <text>{{ isOffDuty(doc.status) ? '暂停预约' : '预约排班' }}</text>
              <uni-icons v-if="!isOffDuty(doc.status)" type="right" size="14" color="#fff" />
            </view>
          </view>
        </view>
      </view>

      <!-- 待缴费单 -->
      <view v-if="activeTab === 1" class="order-list">
        <view class="order-card animate-in" v-for="item in pendingBills" :key="item.id">
          <view class="o-header">
            <text class="o-type">{{ formatBusinessType(item.businessType) }}</text>
            <text class="o-no">#{{ item.orderNo }}</text>
          </view>
          <view class="o-body">
            <view class="o-info">
              <text class="o-remark">{{ item.remark }}</text>
              <text class="o-time">{{ item.createTime }}</text>
            </view>
            <view class="o-price">
              <text class="u">¥</text>
              <text class="p">{{ item.totalAmount }}</text>
            </view>
          </view>
          <view class="o-footer">
            <button class="pay-btn" @tap="handlePay(item)">立即支付</button>
          </view>
        </view>
        <view v-if="pendingBills.length === 0" class="empty-view">
          <view class="empty-card">
             <image src="/static/images/empty-wallet.png" mode="widthFix" class="empty-img" />
             <text class="empty-text">当前暂无待缴费项目</text>
             <button class="empty-btn" @tap="activeTab = 0">去预约</button>
          </view>
        </view>
      </view>

      <!-- 历史记录 -->
      <view v-if="activeTab === 2" class="history-list">
        <view class="history-card animate-in" v-for="rec in historyList" :key="rec.recordId">
           <view class="h-top">
             <text class="h-type">{{ rec.visitType || '专家门诊' }}</text>
             <text class="h-time">{{ rec.visitTime }}</text>
           </view>
           <view class="h-content">
             <view class="h-item">
               <text class="l">就诊宠物</text>
               <text class="v">{{ rec.petName || '宠物助手' }}</text>
             </view>
             <view class="h-item">
               <text class="l">主诊医师</text>
               <text class="v">{{ rec.doctorName || '特邀专家' }}</text>
             </view>
             <view class="h-diag">
               <text class="l">诊断结论</text>
               <text class="v">{{ rec.assessment || '常规检查，状态良好' }}</text>
             </view>
           </view>
        </view>
        <view v-if="historyList.length === 0" class="empty-view">
           <view class="empty-card">
             <image src="/static/images/empty-history.png" mode="widthFix" class="empty-img" />
             <text class="empty-text">还没就诊记录，去看看名医吧</text>
             <button class="empty-btn" @tap="activeTab = 0">立即预约</button>
           </view>
        </view>
      </view>

      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { apptApi, billingApi, recordApi, formatImageUrl } from '@/api/index.js'
import { onShow } from '@dcloudio/uni-app'

const statusBarHeight = ref(0)
const activeTab = ref(0)
const tabs = ['专家名医', '待缴单据', '历史就诊']
const doctors = ref([])
const pendingBills = ref([])
const historyList = ref([])

const fetchData = () => {
  if (activeTab.value === 0) fetchDoctors()
  else if (activeTab.value === 1) fetchPendingBills()
  else if (activeTab.value === 2) fetchHistory()
}

watch(activeTab, () => fetchData())

const fetchDoctors = async () => {
  try {
    const res = await apptApi.getDoctors({ pageNum: 1, pageSize: 50 })
    doctors.value = res.rows || []
  } catch (e) {
    console.error('获取医生列表失败', e)
  }
}

const fetchPendingBills = async () => {
  try {
    const res = await billingApi.getMyPending()
    pendingBills.value = res.data || []
  } catch (e) {}
}

const fetchHistory = async () => {
  try {
    const res = await recordApi.getMyRecords()
    historyList.value = res.data || []
  } catch (e) {}
}

const formatBusinessType = (type) => {
  const map = { 'CLINIC': '门诊缴费', 'VACCINE': '疫苗费用', 'MEDICINE': '药房结算' }
  return map[type] || '其他费用'
}

const handlePay = (item) => {
  uni.showModal({
    title: '支付确认',
    content: `准备支付 ${item.totalAmount} 元，将从账户余额扣除。`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在支付...' })
        try {
          const payRes = await billingApi.payBill(item.id)
          if (payRes.code === 200) {
            uni.showToast({ title: '支付成功', icon: 'success' })
            fetchPendingBills()
          }
        } catch (e) {
          uni.showToast({ title: e.message || '支付失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

const isOffDuty = (s) => (s === '3' || s === 'On Leave')

const getStatusText = (status) => {
  if (status === '0' || status === 'Available') return '在岗应诊'
  if (status === '1' || status === 'Consulting') return '专家会诊'
  if (status === '2' || status === 'Emergency') return '急诊救治'
  if (status === '3' || status === 'On Leave') return '出诊暂休'
  return '停诊'
}

const getStatusColor = (status) => {
  if (status === '0' || status === 'Available') return '#66BB6A'
  if (status === '1' || status === 'Consulting') return '#42A5F5'
  if (status === '2' || status === 'Emergency') return '#FF5252'
  return '#B0BEC5'
}

const handleBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}

const handleBook = (doc) => {
  if (isOffDuty(doc.status)) {
    uni.showToast({ title: '该专家目前不在岗，请预约其他医生', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/appointment/detail?id=${doc.doctorId}&name=${doc.name}&fee=${doc.fee != null ? doc.fee : 50}&specialty=${doc.specialty || ''}`
  })
}

onMounted(() => {
  try {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
  } catch (e) {
    statusBarHeight.value = 20
  }
  fetchDoctors()
})
</script>

<style lang="scss" scoped>
.page { background: $bg-main; min-height: 100vh; }

.glass-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 999;
  @include glass-morphism;
  border-bottom: 2rpx solid rgba(255,255,255,0.3);
  .header-content {
    padding: 24rpx 40rpx 12rpx;
    .title-row {
      display: flex; align-items: center; gap: 16rpx; margin-bottom: 28rpx;
      .back-btn {
        width: 100rpx; height: 80rpx; display: flex; align-items: center; justify-content: flex-start;
        margin-left: -20rpx;
      }
      .page-title {
        font-size: 44rpx; font-weight: 900; color: $text-main;
        letter-spacing: -1rpx; margin-bottom: 0;
      }
    }
  }
}

.tabs-inner {
  display: flex; gap: 48rpx;
  .tab-item {
    padding: 12rpx 0 20rpx; position: relative;
    .tab-text { font-size: 30rpx; color: $text-sub; transition: all 0.3s; font-weight: 500; }
    .tab-line {
      position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
      width: 0; height: 6rpx; background: $primary; border-radius: 3rpx; transition: all 0.3s;
    }
    &.active {
      .tab-text { color: $primary; font-weight: 800; transform: scale(1.05); }
      .tab-line { width: 40rpx; }
    }
  }
}

.scroll-content { padding: 0 40rpx; width: 100%; box-sizing: border-box; }

.doctor-list { display: flex; flex-direction: column; gap: 28rpx; padding-top: 24rpx; }

.doctor-card {
  @include premium-card;
  margin-bottom: 0; 
  padding: 36rpx;
  .card-top {
    display: flex; gap: 24rpx; margin-bottom: 24rpx;
    .avatar-wrap {
      position: relative;
      .avatar { width: 120rpx; height: 120rpx; border-radius: 30rpx; background: #eee; }
      .online-status {
        position: absolute; bottom: -4rpx; right: -4rpx;
        width: 24rpx; height: 24rpx; border: 4rpx solid #fff; border-radius: 50%;
      }
    }
    .info {
      flex: 1; display: flex; flex-direction: column; justify-content: center;
      .name-row {
        display: flex; align-items: center; gap: 12rpx; margin-bottom: 8rpx;
        .name { font-size: 32rpx; font-weight: 700; color: $text-main; }
        .title-tag { 
          font-size: 18rpx; color: $primary; background: $primary-light;
          padding: 2rpx 12rpx; border-radius: 6rpx; font-weight: 700;
        }
      }
      .dept-text { font-size: 24rpx; color: $text-sub; margin-bottom: 12rpx; }
      .card-stats {
        display: flex; align-items: center; gap: 16rpx;
        .stat-item {
          display: flex; align-items: center; gap: 4rpx;
          text { font-size: 22rpx; font-weight: 700; color: #D35400; }
        }
        .stat-sep { width: 2rpx; height: 16rpx; background: #E0E0E0; }
        .status-label { font-size: 22rpx; font-weight: 700; }
      }
    }
  }
  
  .card-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 24rpx; border-top: 2rpx solid #F4F7FC;
    .price-box {
      display: flex; align-items: baseline;
      .label { font-size: 22rpx; color: $text-hint; margin-right: 8rpx; }
      .unit { font-size: 24rpx; color: $accent; font-weight: 700; }
      .price { font-size: 36rpx; color: $accent; font-weight: 800; }
    }
    .btn-book {
      @include btn-primary;
      width: 220rpx; height: 72rpx; font-size: 26rpx; gap: 8rpx;
      &.disabled {
        background: #CFD8DC; box-shadow: none;
      }
    }
  }
}

.empty-view {
  padding: 100rpx 0;
  width: 100%;
  .empty-card {
    background: #fff; border-radius: 48rpx; padding: 100rpx 40rpx;
    display: flex; flex-direction: column; align-items: center; gap: 32rpx;
    box-shadow: $shadow-lg;
    width: 100%; box-sizing: border-box;
    .empty-img { width: 320rpx; margin-bottom: 20rpx; filter: grayscale(0.2); }
    .empty-text { font-size: 28rpx; color: $text-sub; font-weight: 500; }
    .empty-btn {
      @include btn-primary;
      width: 280rpx; height: 88rpx; font-size: 28rpx;
      background: $primary-grad; // 使用更有质感的紫色渐变
      box-shadow: 0 12rpx 24rpx rgba(92, 107, 192, 0.3);
    }
  }
}

.animate-in {
  animation: slideIn 0.5s ease-out both;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.order-list, .history-list { display: flex; flex-direction: column; gap: 28rpx; padding-top: 24rpx; }

.order-card {
  @include premium-card; padding: 32rpx;
  .o-header { display: flex; justify-content: space-between; margin-bottom: 24rpx; border-bottom: 2rpx solid #F8FAFC; padding-bottom: 16rpx;
    .o-type { font-size: 26rpx; font-weight: 800; color: $primary; }
    .o-no { font-size: 22rpx; color: $text-hint; }
  }
  .o-body { display: flex; justify-content: space-between; align-items: center; 
    .o-remark { font-size: 28rpx; font-weight: 700; color: $text-main; display: block; margin-bottom: 8rpx; }
    .o-time { font-size: 22rpx; color: $text-sub; }
    .o-price { text-align: right; .u { font-size: 24rpx; color: $accent; font-weight: 700; } .p { font-size: 40rpx; color: $accent; font-weight: 900; } }
  }
  .o-footer { margin-top: 24rpx; display: flex; justify-content: flex-end;
    .pay-btn { @include btn-primary; width: 180rpx; height: 64rpx; font-size: 24rpx; background: linear-gradient(135deg, #FF8A80 0%, #FF5252 100%); }
  }
}

.history-card {
  @include premium-card; padding: 32rpx;
  .h-top { display: flex; justify-content: space-between; margin-bottom: 20rpx;
    .h-type { font-size: 24rpx; color: #fff; background: $primary; padding: 4rpx 16rpx; border-radius: 8rpx; font-weight: 700; }
    .h-time { font-size: 22rpx; color: $text-hint; }
  }
  .h-content { 
    .h-item { display: flex; justify-content: space-between; margin-bottom: 12rpx;
      .l { font-size: 24rpx; color: $text-sub; }
      .v { font-size: 24rpx; color: $text-main; font-weight: 700; }
    }
    .h-diag { margin-top: 16rpx; padding-top: 16rpx; border-top: 2rpx dashed #eee;
      .l { font-size: 22rpx; color: $primary; font-weight: 800; display: block; margin-bottom: 8rpx; }
      .v { font-size: 24rpx; color: $text-sub; line-height: 1.4; }
    }
  }
}

.safe-bottom { height: 160rpx; }
</style>
