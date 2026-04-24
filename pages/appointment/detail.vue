<template>
  <view class="page">
    <!-- 1. 顶部毛玻璃导航 -->
    <view class="glass-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <view class="title-row">
          <view class="back-btn" @tap="handleBack">
            <uni-icons type="left" size="24" color="#2C3E50" />
          </view>
          <text class="page-title">{{ isDetail ? '预约详情' : '确认预约排班' }}</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" enable-back-to-top>
      <!-- 占位 -->
      <view :style="{ height: statusBarHeight + 100 + 'px' }" />

      <!-- 2. 状态/医生信息卡片 -->
      <view class="doctor-card-mini animate-fade-in" v-if="!isDetail">
        <view class="doctor-info">
          <text class="label">预约医师</text>
          <text class="name">{{ doctorName }}</text>
          <text class="dept">专业：{{ specialty || '全科诊疗' }}</text>
        </view>
        <view class="cost-info">
          <text class="label">基础挂号费</text>
          <text class="val">¥{{ fee || 0 }}</text>
        </view>
      </view>

      <!-- 3. 预约详情列表 (查看模式) -->
      <view class="info-list" v-else>
        <view class="status-banner" :style="{ background: getStatusColor(info.status) }">
           <uni-icons type="checkbox-filled" size="32" color="#fff" />
           <text class="status-text">{{ formatStatus(info.status) }}</text>
        </view>
        <view class="info-group">
           <view class="info-row">
             <text class="label">预约单号</text>
             <text class="val">{{ info.reservationId }}</text>
           </view>
           <view class="info-row">
             <text class="label">预约时间</text>
             <text class="val">{{ info.date }} {{ info.time }}</text>
           </view>
        </view>
      </view>

      <!-- 4. 动态表单 (编辑模式) -->
      <view class="booking-form" v-if="!isDetail">
        <view class="form-section">
          <view class="section-header">
            <text class="section-title">选择就诊宠物</text>
          </view>
          <scroll-view scroll-x class="pet-selector">
            <view class="pet-list">
              <view 
                class="pet-item" 
                v-for="pet in pets" 
                :key="pet.petId"
                :class="{ active: formData.petId === pet.petId }"
                @tap="formData.petId = pet.petId"
              >
                <image class="pet-avatar" :src="formatImageUrl(pet.avatar)" mode="aspectFill" />
                <text class="pet-name">{{ pet.name }}</text>
                <view class="active-tag" v-if="formData.petId === pet.petId">
                  <uni-icons type="checkmarkempty" size="10" color="#fff" />
                </view>
              </view>
              <view class="pet-item add" @tap="goToAddPet">
                <view class="add-box">+</view>
                <text class="pet-name">添加</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="form-section">
          <view class="section-header"><text class="section-title">症状描述（选填）</text></view>
          <textarea 
            class="symptom-input" 
            v-model="formData.symptom" 
            placeholder="请简单描述宠物的症状（如：食欲不振、呕吐、精神萎靡等）" 
            maxlength="200"
          />
        </view>

        <view class="form-section">
          <view class="section-header"><text class="section-title">选择到院时间</text></view>
          <view class="time-picker-wrap">
             <picker mode="date" @change="onDateChange">
               <view class="picker-box">
                 <uni-icons type="calendar" size="16" color="#5C6BC0" />
                 <text>{{ formData.date || '请选择日期' }}</text>
               </view>
             </picker>
             <picker mode="time" @change="onTimeChange">
               <view class="picker-box">
                 <uni-icons type="clear" size="16" color="#5C6BC0" />
                 <text>{{ formData.time || '请选择时段' }}</text>
               </view>
             </picker>
          </view>
        </view>
      </view>

      <view class="safe-bottom" />
    </scroll-view>

    <!-- 5. 底部操作栏 -->
    <view class="bottom-bar glass-footer animate-fade-in" v-if="!isDetail">
      <view class="cancel-btn" @tap="handleBack">取消办理</view>
      <view class="confirm-btn" :class="{ disabled: !canSubmit }" @tap="handleConfirm">
        <text>立即确认预约</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apptApi, petApi, formatImageUrl } from '@/api/index.js'

const statusBarHeight = ref(0)
const isDetail = ref(false)
const doctorId = ref('')
const doctorName = ref('')
const specialty = ref('')
const fee = ref(0)

const info = ref({}) // 详情模式数据
const pets = ref([]) // 可选项

const formData = ref({
  petId: '',
  symptom: '',
  date: '',
  time: ''
})

const canSubmit = computed(() => {
  return formData.value.petId && formData.value.date && formData.value.time
})

const handleBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}

const onDateChange = (e) => { formData.value.date = e.detail.value }
const onTimeChange = (e) => { formData.value.time = e.detail.value }

const fetchPets = async () => {
  try {
    const res = await petApi.getMyPets()
    pets.value = res.rows || []
    if (pets.value.length > 0) formData.value.petId = pets.value[0].petId
  } catch (e) {}
}

const handleConfirm = async () => {
  if (!canSubmit.value) {
    uni.showToast({ title: '请完善预约信息', icon: 'none' })
    return
  }
  
  uni.showLoading({ title: '正在提交预约...' })
  try {
    const selectedPet = pets.value.find(p => p.petId === formData.value.petId)
    const submitData = {
      doctorId: doctorId.value,
      doctorName: doctorName.value,
      petId: formData.value.petId,
      petName: selectedPet?.name,
      petBread: selectedPet?.breed || '未知', // 对齐后端 petBread 字段
      petAge: 1, // 补全必填字段 petAge (暂时给默认值1，解决数据库约束)
      symptom: formData.value.symptom,
      date: formData.value.date,
      time: formData.value.time,
      status: '0', 
      type: '专家门诊'
    }
    
    await apptApi.submitOrder(submitData)
    uni.hideLoading()
    uni.showToast({ title: '预约成功', icon: 'success' })
    
    // 成功后延迟跳转至记录页
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/record/index' })
    }, 1500)
  } catch (e) {
    uni.hideLoading()
  }
}

const formatStatus = (status) => {
  const map = { '0': '预约受理中', '1': '已就诊', '2': '已取消' }
  return map[status] || '未知状态'
}

const getStatusColor = (s) => s === '0' ? '#5C6BC0' : s === '1' ? '#66BB6A' : '#B0BEC5'

const goToAddPet = () => {
  uni.navigateTo({ url: '/pages/pet/add' })
}

onMounted((options) => {
  // 获取标题栏高度
  try {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
  } catch (e) {
    statusBarHeight.value = 20
  }

  // 这里的 options 会通过 defineProps 或 onLoad 获取
  // 临时兼容逻辑
  const query = getCurrentPages().pop().options
  if (query.reservationId) {
    isDetail.value = true
    // fetchDetail() // 获取已有详情
  } else {
    isDetail.value = false
    doctorId.value = query.id
    doctorName.value = query.name || '特邀专家'
    specialty.value = query.specialty
    fee.value = query.fee
    fetchPets()
  }
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
      display: flex; align-items: center; gap: 16rpx;
      .back-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: flex-start; margin-left: -20rpx; }
      .page-title { font-size: 40rpx; font-weight: 900; color: $text-main; letter-spacing: -1rpx; }
    }
  }
}

.scroll-content { padding: 0 40rpx; width: 100%; box-sizing: border-box; }

.doctor-card-mini {
  @include premium-card;
  padding: 32rpx; display: flex; justify-content: space-between; align-items: center;
  background: linear-gradient(135deg, rgba(255,255,255,1), rgba(244,247,252,0.5));
  margin-bottom: 40rpx;
  .doctor-info {
    .label { font-size: 20rpx; color: $text-hint; margin-bottom: 8rpx; display: block; }
    .name { font-size: 36rpx; font-weight: 800; color: $text-main; margin-bottom: 4rpx; display: block; }
    .dept { font-size: 22rpx; color: $primary; font-weight: 600; }
  }
  .cost-info {
    text-align: right;
    .label { font-size: 20rpx; color: $text-hint; margin-bottom: 4rpx; display: block; }
    .val { font-size: 38rpx; font-weight: 900; color: $accent; }
  }
}

.form-section {
  background: #fff; border-radius: 40rpx; padding: 32rpx; margin-bottom: 32rpx;
  box-shadow: $shadow-sm;
  .section-header { margin-bottom: 24rpx; 
    .section-title { font-size: 28rpx; font-weight: 800; color: $text-main; }
  }
}

.pet-selector {
  .pet-list { display: flex; gap: 24rpx; padding: 10rpx 0; }
  .pet-item {
    position: relative; flex-shrink: 0;
    display: flex; flex-direction: column; align-items: center; gap: 12rpx;
    .pet-avatar { width: 100rpx; height: 100rpx; border-radius: 50%; border: 4rpx solid #F1F4F9; transition: 0.3s; }
    .pet-name { font-size: 22rpx; color: $text-sub; font-weight: 600; }
    &.active {
      .pet-avatar { border-color: $primary; box-shadow: 0 8rpx 16rpx rgba(92,107,192,0.2); transform: scale(1.05); }
      .pet-name { color: $primary; }
    }
    .active-tag {
      position: absolute; top: 0; right: 0; background: $primary; width: 32rpx; height: 32rpx;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
    }
    &.add .add-box {
      width: 100rpx; height: 100rpx; border-radius: 50%; border: 4rpx dashed #E0E0E0;
      display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #BDC3C7;
    }
  }
}

.symptom-input {
  width: 100%; height: 200rpx; background: #F8FAFC; border-radius: 20rpx;
  padding: 20rpx; font-size: 26rpx; color: $text-main; box-sizing: border-box;
}

.time-picker-wrap {
  display: flex; gap: 20rpx;
  .picker-box {
    flex: 1; background: #F8FAFC; height: 88rpx; border-radius: 20rpx;
    display: flex; align-items: center; justify-content: center; gap: 12rpx;
    text { font-size: 26rpx; color: $text-main; font-weight: 600; }
  }
}

.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 999;
  padding: 30rpx 40rpx calc(30rpx + env(safe-area-inset-bottom));
  display: flex; gap: 24rpx;
  &.glass-footer { @include glass-morphism; border-top: 2rpx solid rgba(255,255,255,0.3); }
  .cancel-btn {
    flex: 1; height: 100rpx; border-radius: 100rpx; border: 2rpx solid #E0E0E0;
    display: flex; align-items: center; justify-content: center; font-size: 28rpx; color: $text-sub;
  }
  .confirm-btn {
    flex: 2; height: 100rpx; border-radius: 100rpx; background: $primary-grad;
    display: flex; align-items: center; justify-content: center; font-size: 30rpx; color: #fff; font-weight: 800;
    box-shadow: 0 12rpx 24rpx rgba(92,107,192,0.3);
    &.disabled { background: #CFD8DC; box-shadow: none; }
  }
}

.status-banner {
  padding: 60rpx; border-radius: 40rpx; margin-bottom: 40rpx;
  display: flex; flex-direction: column; align-items: center; gap: 20rpx;
  .status-text { font-size: 40rpx; font-weight: 900; color: #fff; }
}

.info-group {
  @include premium-card; padding: 40rpx;
  .info-row {
    display: flex; justify-content: space-between; margin-bottom: 24rpx;
    &:last-child { margin-bottom: 0; }
    .label { font-size: 26rpx; color: $text-hint; }
    .val { font-size: 26rpx; color: $text-main; font-weight: 700; }
  }
}

.safe-bottom { height: 200rpx; }

.animate-fade-in { animation: fadeIn 0.8s ease-out both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
