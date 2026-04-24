<template>
  <view class="pet-page">
    <!-- 头部导航 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-left">
        <view class="back-btn" @tap="goBack">
          <uni-icons type="left" size="22" color="#1E293B" />
        </view>
        <text class="title">我的宠物档案</text>
      </view>
      <view class="header-action-text" @tap="handleAdd">
        <uni-icons type="plus" size="14" color="#FFFFFF" />
        <text>添加宠物</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      <!-- 空状态 -->
      <view v-if="petList.length === 0 && !loading" class="empty-state">
        <view class="empty-illustration">
          <image class="empty-img" src="/static/images/ai-pet.png" mode="aspectFit" />
          <view class="empty-circle"></view>
        </view>
        <text class="empty-title">档案库空空如也</text>
        <text class="empty-desc">添加您的爱宠，开启智慧医疗新体验</text>
        <button class="add-btn-primary" @tap="handleAdd">立即添加</button>
      </view>

      <!-- 宠物列表 -->
      <view class="pet-list" v-else>
        <uni-swipe-action>
          <uni-swipe-action-item
            v-for="pet in petList"
            :key="pet.petId"
            class="swipe-item"
            :right-options="getSwipeOptions(pet)"
            @click="handleSwipeClick($event, pet)"
          >
            <view class="pet-card" @tap="handleEdit(pet)">
              <view class="avatar-wrapper">
                <image 
                  class="pet-avatar" 
                  :src="pet.avatar ? formatImageUrl(pet.avatar) : '/static/images/ai-pet.png'" 
                  mode="aspectFill" 
                />
                <view v-if="pet.gender" class="gender-badge" :class="pet.gender === '0' ? 'male' : 'female'">
                  <text class="gender-icon">{{ pet.gender === '0' ? '♂' : '♀' }}</text>
                </view>
              </view>
              
              <view class="pet-info">
                <view class="name-row">
                  <text class="name">{{ pet.name }}</text>
                  <text class="breed-tag">{{ pet.breed || '未知品种' }}</text>
                </view>
                
                <view class="detail-row">
                  <text class="type-text">{{ pet.type }}</text>
                  <view class="dot"></view>
                  <text class="age-text">{{ pet.age || '年龄未知' }}</text>
                </view>

                <view class="tag-row">
                  <view class="status-pill" :class="{ observing: pet.treatmentStatus === '观察中' }">
                    <view class="status-dot"></view>
                    <text>{{ pet.treatmentStatus || '健康' }}</text>
                  </view>
                  <view class="weight-pill" v-if="pet.weight">
                    <uni-icons type="info" size="12" color="#64748B" />
                    <text>{{ pet.weight }}kg</text>
                  </view>
                </view>
              </view>
              
              <view class="card-arrow">
                <uni-icons type="right" size="16" color="#CBD5E1" />
              </view>
            </view>
          </uni-swipe-action-item>
        </uni-swipe-action>
      </view>
      
      <view class="safe-bottom"></view>
    </scroll-view>

    <!-- 加载中 -->
    <view v-if="loading && petList.length === 0" class="loading-overlay">
      <view class="loading-spinner"></view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { petApi, formatImageUrl } from '@/api/index.js'
import { onLoad } from '@dcloudio/uni-app'

const statusBarHeight = ref(0)
const petList = ref([])
const loading = ref(true)
const isRefreshing = ref(false)

const getSwipeOptions = (pet) => [
  { 
    text: '编辑', 
    style: { 
      backgroundColor: '#6366F1',
      fontSize: '28rpx'
    } 
  },
  { 
    text: '删除', 
    style: { 
      backgroundColor: '#F43F5E',
      fontSize: '28rpx'
    } 
  }
]

const handleSwipeClick = (e, pet) => {
  if (e.index === 0) {
    handleEdit(pet)
  } else if (e.index === 1) {
    handleDelete(pet.petId)
  }
}

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}

const fetchMyPets = async () => {
  try {
    const res = await petApi.getMyPets({ pageNum: 1, pageSize: 50 })
    petList.value = res.rows || []
  } catch (e) {
    console.error('获取宠物列表失败', e)
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

const onRefresh = () => {
  isRefreshing.value = true
  fetchMyPets()
}

const handleAdd = () => {
  uni.navigateTo({ url: '/pages/pet/edit' })
}

const handleEdit = (pet) => {
  const petStr = encodeURIComponent(JSON.stringify(pet))
  uni.navigateTo({ url: `/pages/pet/edit?pet=${petStr}` })
}

const handleDelete = (petId) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要移除这份珍贵的成长档案吗？此操作不可撤销。',
    confirmText: '确定移除',
    confirmColor: '#F43F5E',
    cancelText: '我再想想',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在处理...', mask: true })
        try {
          await petApi.deletePet(petId)
          uni.showToast({ title: '档案已安全移除', icon: 'success' })
          fetchMyPets()
        } catch (e) {
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20
  fetchMyPets()
  uni.$on('refreshPetList', fetchMyPets)
})
</script>

<style lang="scss" scoped>
.pet-page { 
  background-color: #F8FAFC; 
  min-height: 100vh; 
  display: flex; 
  flex-direction: column; 
}

.header {
  padding: 20rpx 40rpx; 
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid rgba(0,0,0,0.05);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }
  
  .title { 
    font-size: 36rpx; 
    font-weight: 800; 
    color: #1E293B; 
    letter-spacing: -0.5rpx;
  }
  
  .back-btn {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 24rpx;
    background: #FFFFFF;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    &:active { transform: scale(0.95); background: #F1F5F9; }
  }

  .header-action-text {
    font-size: 24rpx;
    font-weight: 700;
    color: #FFFFFF;
    background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
    padding: 12rpx 28rpx;
    border-radius: 100rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    box-shadow: 0 8rpx 16rpx rgba(79, 70, 229, 0.2);
    &:active { opacity: 0.9; transform: scale(0.98); }
  }
}

.scroll-content { 
  flex: 1; 
}

.empty-state {
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  padding-top: 20vh;
  
  .empty-illustration {
    position: relative;
    margin-bottom: 60rpx;
    .empty-img { width: 320rpx; height: 320rpx; position: relative; z-index: 2; opacity: 0.9; }
    .empty-circle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400rpx;
      height: 400rpx;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }
  }
  
  .empty-title { font-size: 36rpx; font-weight: 800; color: #1E293B; margin-bottom: 16rpx; }
  .empty-desc { font-size: 26rpx; color: #94A3B8; margin-bottom: 60rpx; text-align: center; max-width: 80%; }
  
  .add-btn-primary { 
    background: #1E293B; 
    color: #fff; 
    font-size: 30rpx; 
    height: 100rpx;
    line-height: 100rpx;
    padding: 0 100rpx; 
    border-radius: 50rpx; 
    font-weight: 800;
    box-shadow: 0 20rpx 40rpx rgba(30, 41, 59, 0.2);
    &:active { opacity: 0.9; transform: scale(0.98); }
  }
}

.pet-list {
  padding: 32rpx;
  display: flex; 
  flex-direction: column; 
  gap: 28rpx;
  
  .swipe-item {
    border-radius: 40rpx;
    overflow: hidden;
    box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.04);
  }

  .pet-card {
    background: #FFFFFF;
    padding: 32rpx;
    display: flex;
    align-items: center;
    gap: 32rpx;
    position: relative;
    
    .avatar-wrapper {
      position: relative;
      .pet-avatar { 
        width: 150rpx; 
        height: 150rpx; 
        border-radius: 44rpx; 
        background: #F1F5F9;
        border: 2rpx solid rgba(0,0,0,0.03);
      }
      .gender-badge {
        position: absolute;
        bottom: -6rpx;
        right: -6rpx;
        width: 44rpx;
        height: 44rpx;
        border-radius: 14rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 4rpx solid #FFFFFF;
        box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.1);
        &.male { background: #E0F2FE; color: #0EA5E9; }
        &.female { background: #FDF2F8; color: #EC4899; }
        .gender-icon { font-size: 24rpx; font-weight: 900; }
      }
    }
    
    .pet-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12rpx;
      
      .name-row {
        display: flex;
        align-items: center;
        gap: 16rpx;
        .name { font-size: 38rpx; font-weight: 900; color: #1E293B; }
        .breed-tag {
          font-size: 20rpx;
          color: #6366F1;
          background: #EEF2FF;
          padding: 4rpx 14rpx;
          border-radius: 8rpx;
          font-weight: 700;
        }
      }
      
      .detail-row {
        display: flex;
        align-items: center;
        gap: 12rpx;
        .type-text, .age-text { font-size: 24rpx; color: #64748B; font-weight: 600; }
        .dot { width: 6rpx; height: 6rpx; border-radius: 50%; background: #CBD5E1; }
      }
      
      .tag-row {
        display: flex;
        gap: 16rpx;
        margin-top: 4rpx;
        .status-pill {
          display: flex;
          align-items: center;
          gap: 8rpx;
          font-size: 22rpx;
          padding: 8rpx 20rpx;
          background: #F0FDF4;
          color: #16A34A;
          border-radius: 100rpx;
          font-weight: 700;
          &.observing { background: #FFF7ED; color: #EA580C; .status-dot { background: #EA580C; } }
          .status-dot { width: 10rpx; height: 10rpx; border-radius: 50%; background: #16A34A; }
        }
        .weight-pill {
          display: flex;
          align-items: center;
          gap: 6rpx;
          font-size: 22rpx;
          padding: 8rpx 20rpx;
          background: #F1F5F9;
          color: #64748B;
          border-radius: 100rpx;
          font-weight: 700;
        }
      }
    }

    .card-arrow {
      padding: 10rpx;
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #F1F5F9;
  border-top: 4rpx solid #4F46E5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.safe-bottom { height: 100rpx; }
</style>
