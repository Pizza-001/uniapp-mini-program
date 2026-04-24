<template>
  <view class="pet-page">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @tap="goBack">
        <uni-icons type="left" size="24" color="#1A1A1A" />
      </view>
      <text class="title">我的宠物档案</text>
      <view class="add-btn" @tap="handleAdd">
        <uni-icons type="plus" size="24" color="#5C6BC0" />
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <view v-if="petList.length === 0 && !loading" class="empty-state">
        <uni-icons type="person-filled" size="80" color="#E8EAF6" />
        <text class="empty-text">您还没有添加宠物档案哦</text>
        <button class="add-btn-primary" @tap="handleAdd">立即添加宠物</button>
      </view>

      <view class="pet-list" v-else>
        <view class="pet-card" v-for="pet in petList" :key="pet.petId">
          <view class="card-bg-glass"></view>
          <view class="card-content">
            <image class="pet-avatar" :src="pet.avatar ? formatImageUrl(pet.avatar) : '/static/images/ai-pet.png'" mode="aspectFill" />
            <view class="pet-info">
              <view class="pet-name-row">
                <text class="name">{{ pet.name }}</text>
                <uni-icons v-if="pet.gender === '0'" type="person-filled" size="18" color="#42A5F5" />
                <uni-icons v-else-if="pet.gender === '1'" type="person-filled" size="18" color="#FF5252" />
              </view>
              <text class="breed">{{ pet.type }} - {{ pet.breed || '未知品种' }}</text>
              <view class="tags">
                <text class="tag">{{ pet.healthStatus || '健康' }}</text>
                <text class="tag">{{ pet.weight ? pet.weight + 'kg' : '未称重' }}</text>
              </view>
            </view>
            <view class="action-btn" @tap="handleEdit(pet)">管理</view>
          </view>
        </view>
      </view>
      
      <view class="safe-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { petApi, formatImageUrl } from '@/api/index.js'
import { onLoad } from '@dcloudio/uni-app'

const statusBarHeight = ref(0)
const petList = ref([])
const loading = ref(true)

const goBack = () => uni.navigateBack()

const fetchMyPets = async () => {
  loading.value = true
  try {
    const res = await petApi.getMyPets({ pageNum: 1, pageSize: 50 })
    petList.value = res.rows || []
  } catch (e) {
    console.error('获取宠物列表失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  // 这里可以扩展跳转到宠物信息填写页
  uni.showToast({ title: '新增宠物功能开发中', icon: 'none' })
}

const handleEdit = (pet) => {
  // 这里可以扩展跳转到宠物信息编辑页
  uni.showToast({ title: '编辑宠物功能开发中', icon: 'none' })
}

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20
  fetchMyPets()
})
</script>

<style lang="scss" scoped>
.pet-page { background: #F8FAFC; height: 100vh; display: flex; flex-direction: column; }
.header {
  padding: 20rpx 40rpx; display: flex; align-items: center; justify-content: space-between;
  background: #fff; position: relative; z-index: 10;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  .title { font-size: 34rpx; font-weight: 800; color: #1A1A1A; }
}

.scroll-content { flex: 1; padding: 40rpx; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh;
  .empty-text { font-size: 28rpx; color: #95A5A6; margin: 30rpx 0; }
  .add-btn-primary { background: #5C6BC0; color: #fff; font-size: 28rpx; padding: 0 60rpx; border-radius: 100rpx; font-weight: bold; }
}

.pet-list {
  display: flex; flex-direction: column; gap: 30rpx;
  .pet-card {
    position: relative; border-radius: 36rpx; padding: 40rpx;
    background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
    box-shadow: 0 12rpx 30rpx rgba(118, 131, 166, 0.08); overflow: hidden;
    
    .card-bg-glass { position: absolute; top: -50%; right: -20%; width: 200rpx; height: 200rpx; background: rgba(92, 107, 192, 0.05); border-radius: 50%; }
    
    .card-content {
      position: relative; z-index: 2; display: flex; align-items: center; gap: 30rpx;
      .pet-avatar { width: 130rpx; height: 130rpx; border-radius: 35rpx; background: #E8EAF6; box-shadow: 0 8rpx 20rpx rgba(92, 107, 192, 0.15); border: 4rpx solid #fff; }
      .pet-info {
        flex: 1; display: flex; flex-direction: column; gap: 8rpx;
        .pet-name-row { display: flex; align-items: center; gap: 10rpx; .name { font-size: 34rpx; font-weight: 900; color: #2C3E50; } }
        .breed { font-size: 24rpx; color: #7F8C8D; }
        .tags { display: flex; gap: 12rpx; margin-top: 8rpx; .tag { font-size: 20rpx; padding: 4rpx 16rpx; background: #F1F3F5; color: #5C6BC0; border-radius: 8rpx; font-weight: bold; } }
      }
      .action-btn { font-size: 24rpx; font-weight: 800; color: #5C6BC0; padding: 12rpx 24rpx; background: #E8EAF6; border-radius: 16rpx; }
    }
  }
}
.safe-bottom { height: 100rpx; }
</style>
