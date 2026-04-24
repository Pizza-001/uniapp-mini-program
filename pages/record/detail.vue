<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @tap="goBack"><uni-icons type="left" size="20" color="#fff" /></view>
      <text class="header-title">记录详情</text>
    </view>

    <scroll-view scroll-y class="content">
      <!-- 状态卡片 -->
      <view class="status-card" :class="'status-bg-' + detail.statusClass">
        <view class="status-icon">
          <text class="status-emoji">{{ statusEmoji[detail.statusClass] }}</text>
        </view>
        <view class="status-info">
          <text class="status-text">{{ detail.statusText }}</text>
          <text class="status-desc">{{ statusDesc[detail.statusClass] }}</text>
        </view>
      </view>

      <!-- 预约信息 -->
      <view class="info-card">
        <text class="card-title">预约信息</text>
        <view class="info-row" v-for="row in appointInfo" :key="row.label">
          <text class="info-label">{{ row.label }}</text>
          <text class="info-val">{{ row.value }}</text>
        </view>
      </view>

      <!-- 宠物信息 -->
      <view class="info-card">
        <text class="card-title">宠物信息</text>
        <view class="pet-info-row">
          <view class="pet-avatar">🐾</view>
          <view class="pet-detail">
            <text class="pet-name">{{ detail.petName }}</text>
            <text class="pet-breed">{{ detail.petBread || '宠物' }}</text>
            <view class="pet-tags">
              <text class="ptag" v-if="detail.type">{{ detail.type }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 费用明细 (模拟数据) -->
      <view class="info-card">
        <text class="card-title">费用明细</text>
        <view class="fee-row">
          <text class="fee-label">预约挂号费</text>
          <text class="fee-val">¥20.00</text>
        </view>
        <view class="fee-divider" />
        <view class="fee-row total">
          <text class="fee-label">合计</text>
          <text class="fee-val total-price">¥20.00</text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="info-card">
        <text class="card-title">订单信息</text>
        <view class="info-row">
          <text class="info-label">订单编号</text>
          <text class="info-val">{{ detail.reservationId }}</text>
        </view>
        <view class="info-row" v-if="detail.createTime">
          <text class="info-label">创建时间</text>
          <text class="info-val">{{ detail.createTime }}</text>
        </view>
      </view>

      <view class="safe-bottom" />
    </scroll-view>

    <!-- 操作栏 -->
    <view class="bottom-bar" v-if="detail.status === '0'">
      <view class="btn-cancel" @tap="cancelAppt">取消预约</view>
      <view class="btn-confirm" @tap="callDoctor">联系客服</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { request } from '@/api/index.js'

const props = defineProps({ id: String })

const detail = ref({
  status: '0',
  statusClass: 'pending',
  statusText: '加载中...',
  reservationId: '',
  type: '',
  petName: '',
  petBread: '',
  doctorName: '',
  date: '',
  time: '',
  createTime: ''
})

const statusEmoji = { pending: '⏰', done: '✅', cancelled: '❌' }
const statusDesc = {
  pending: '请于预约时间前15分钟到达医院',
  done: '本次就诊已完成，感谢您的信任',
  cancelled: '该预约已取消',
}

const statusMap = {
  '0': { text: '预约成功', class: 'pending' },
  '1': { text: '已完成', class: 'done' },
  '2': { text: '已取消', class: 'cancelled' }
}

const fetchDetail = async () => {
  if (!props.id) return
  try {
    const res = await request({
      url: `/hospital/reservation/${props.id}`
    })
    const s = statusMap[res.status] || statusMap['0']
    detail.value = {
      ...res,
      statusClass: s.class,
      statusText: s.text
    }
  } catch (e) {
    console.error('加载记录详情失败:', e)
  }
}

const appointInfo = computed(() => [
  { label: '服务项目', value: detail.value.type || '门诊挂号' },
  { label: '就诊医生', value: detail.value.doctorName || '待定' },
  { label: '预约日期', value: detail.value.date || '' },
  { label: '预约时间', value: detail.value.time || '' },
])

const goBack = () => uni.navigateBack()

const cancelAppt = () => {
  uni.showModal({
    title: '确认取消', content: '确定要取消该预约吗？',
    success: async ({ confirm }) => {
      if (confirm) {
        try {
          await request({
            url: `/hospital/reservation/${props.id}`,
            method: 'DELETE'
          })
          uni.showToast({ title: '已取消预约', icon: 'success' })
          fetchDetail()
        } catch (e) {}
      }
    }
  })
}

const callDoctor = () => uni.makePhoneCall({ phoneNumber: '020-88888888' })

onMounted(() => {
  fetchDetail()
})
</script>

<style lang="scss" scoped>
.page { background: #F5F5F5; min-height: 100vh; }
.header {
  background: linear-gradient(135deg, #FF8A65, #E64A19);
  padding: 0 32rpx 32rpx;
  padding-top: calc(var(--status-bar-height) + 20rpx);
  display: flex; align-items: center; gap: 24rpx;
  .back-btn { width: 64rpx; height: 64rpx; border-radius: 50%; background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center; }
  .header-title { font-size: 36rpx; font-weight: 700; color: #fff; }
}
.content { height: calc(100vh - 180rpx); padding: 24rpx; box-sizing: border-box; }

.status-card {
  display: flex; align-items: center; gap: 20rpx;
  border-radius: 20rpx; padding: 32rpx; margin-bottom: 24rpx;
  &.status-bg-pending { background: linear-gradient(135deg, #FFF3E0, #FFE0B2); }
  &.status-bg-done { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); }
  &.status-bg-cancelled { background: linear-gradient(135deg, #FAFAFA, #F0F0F0); }
  .status-icon { width: 96rpx; height: 96rpx; border-radius: 50%; background: rgba(255,255,255,0.6);
    display: flex; align-items: center; justify-content: center;
    .status-emoji { font-size: 48rpx; }
  }
  .status-info { flex: 1;
    .status-text { font-size: 36rpx; font-weight: 800; color: #333; display: block; margin-bottom: 8rpx; }
    .status-desc { font-size: 24rpx; color: #666; display: block; line-height: 1.5; }
  }
}

.info-card {
  background: #fff; border-radius: 20rpx; padding: 28rpx; margin-bottom: 20rpx;
  .card-title { font-size: 30rpx; font-weight: 700; color: #333; display: block; margin-bottom: 24rpx;
    padding-left: 16rpx; border-left: 6rpx solid #FF7043; }
}
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 14rpx 0;
  border-bottom: 2rpx solid #F5F5F5;
  &:last-child { border-bottom: none; }
  .info-label { font-size: 26rpx; color: #999; }
  .info-val { font-size: 26rpx; color: #333; font-weight: 500; }
}

.pet-info-row { display: flex; align-items: center; gap: 20rpx;
  .pet-avatar { width: 100rpx; height: 100rpx; border-radius: 50%; background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
    display: flex; align-items: center; justify-content: center; font-size: 52rpx; flex-shrink: 0; }
  .pet-detail { flex: 1;
    .pet-name { font-size: 32rpx; font-weight: 700; color: #333; display: block; margin-bottom: 6rpx; }
    .pet-breed { font-size: 24rpx; color: #999; display: block; margin-bottom: 12rpx; }
    .pet-tags { display: flex; gap: 10rpx;
      .ptag { background: rgba(255,112,67,0.1); color: #FF7043; font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 100rpx; }
    }
  }
}

.fee-row { display: flex; justify-content: space-between; padding: 12rpx 0;
  .fee-label { font-size: 26rpx; color: #666; }
  .fee-val { font-size: 26rpx; color: #333; }
  &.total { .fee-label { font-weight: 700; color: #333; } .total-price { font-size: 36rpx; font-weight: 800; color: #FF7043; } }
}
.fee-divider { height: 2rpx; background: #F0F0F0; margin: 8rpx 0; }

.safe-bottom { height: 160rpx; }
.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; gap: 20rpx; padding: 20rpx 32rpx calc(env(safe-area-inset-bottom) + 20rpx);
  background: #fff; box-shadow: 0 -4rpx 24rpx rgba(0,0,0,0.06);
  .btn-cancel { flex: 1; height: 88rpx; border-radius: 100rpx; border: 2rpx solid #ddd;
    display: flex; align-items: center; justify-content: center; font-size: 28rpx; color: #666; }
  .btn-confirm { flex: 2; height: 88rpx; border-radius: 100rpx;
    background: linear-gradient(135deg, #FF8A65, #E64A19); color: #fff; font-size: 30rpx; font-weight: 700;
    display: flex; align-items: center; justify-content: center; }
}
</style>
