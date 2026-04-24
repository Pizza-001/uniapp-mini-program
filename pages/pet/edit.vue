<template>
  <view class="edit-page">
    <!-- 头部导航 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @tap="goBack">
        <uni-icons type="left" size="22" color="#1E293B" />
      </view>
      <text class="title">{{ isEdit ? '编辑我的爱宠' : '建立成长档案' }}</text>
      <view class="placeholder"></view>
    </view>

    <scroll-view scroll-y class="form-container">
      <!-- 头像上传 -->
      <view class="avatar-section">
        <view class="avatar-box" @tap="handleUpload">
          <image 
            class="avatar-preview" 
            :src="form.avatar ? formatImageUrl(form.avatar) : '/static/images/ai-pet.png'" 
            mode="aspectFill" 
          />
          <view class="camera-badge">
            <uni-icons type="camera-filled" size="18" color="#FFFFFF" />
          </view>
        </view>
        <text class="upload-tip">点击为宝贝选择头像</text>
      </view>

      <!-- 主要信息表单 -->
      <view class="section-title">
        <text class="title-text">基本信息</text>
        <view class="title-line"></view>
      </view>

      <view class="modern-card">
        <view class="form-item">
          <view class="item-header">
            <uni-icons type="person" size="14" color="#94A3B8" />
            <text class="label">宠物昵称</text>
          </view>
          <input class="input" v-model="form.name" placeholder="请输入好听的名字" placeholder-class="p-class" />
        </view>

        <view class="form-item">
          <view class="item-header">
            <uni-icons type="list" size="14" color="#94A3B8" />
            <text class="label">主分类</text>
          </view>
          <picker :range="types" @change="handleTypeChange">
             <view class="picker-value" :class="{ placeholder: !form.type }">
               <text>{{ form.type || '请选择宠物类型' }}</text>
               <uni-icons type="right" size="14" color="#CBD5E1" />
             </view>
          </picker>
        </view>

        <view class="form-item">
          <view class="item-header">
            <uni-icons type="flag" size="14" color="#94A3B8" />
            <text class="label">宠物品种</text>
          </view>
          <input class="input" v-model="form.breed" placeholder="如：布偶猫、金毛巡回犬" placeholder-class="p-class" />
        </view>

        <view class="form-item">
          <view class="item-header">
            <uni-icons type="heart" size="14" color="#94A3B8" />
            <text class="label">性别</text>
          </view>
          <view class="gender-selector">
            <view class="gender-option" :class="{ active: form.gender === '0' }" @tap="form.gender = '0'">
              <text class="icon">♂</text>
              <text class="text">男生</text>
            </view>
            <view class="gender-option" :class="{ active: form.gender === '1' }" @tap="form.gender = '1'">
              <text class="icon">♀</text>
              <text class="text">女生</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-title">
        <text class="title-text">健康数据</text>
        <view class="title-line"></view>
      </view>

      <view class="modern-card">
        <view class="form-item">
          <view class="item-header">
            <uni-icons type="info" size="14" color="#94A3B8" />
            <text class="label">当前体重 (kg)</text>
          </view>
          <input class="input" type="digit" v-model="form.weight" placeholder="请输入宝宝体重" placeholder-class="p-class" />
        </view>

        <view class="form-item">
          <view class="item-header">
            <uni-icons type="calendar" size="14" color="#94A3B8" />
            <text class="label">出生日期</text>
          </view>
          <picker mode="date" @change="e => form.birthday = e.detail.value">
            <view class="picker-value" :class="{ placeholder: !form.birthday }">
              <text>{{ form.birthday || '记录重要的一天' }}</text>
              <uni-icons type="right" size="14" color="#CBD5E1" />
            </view>
          </picker>
      </view>
      
      <view class="section-title">
        <text class="title-text">主官信息</text>
        <view class="title-line"></view>
      </view>
      
      <view class="modern-card">
        <view class="form-item">
          <view class="item-header">
            <uni-icons type="person" size="14" color="#94A3B8" />
            <text class="label">主人姓名</text>
          </view>
          <input class="input" v-model="form.ownerName" placeholder="怎么称呼您呢？" placeholder-class="p-class" />
        </view>
        
        <view class="form-item">
          <view class="item-header">
            <uni-icons type="phone" size="14" color="#94A3B8" />
            <text class="label">联系电话</text>
          </view>
          <input class="input" type="number" v-model="form.phone" placeholder="紧急情况联系号码" placeholder-class="p-class" />
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="btn-group">
        <button class="save-btn" @tap="handleSubmit">
          <text>{{ isEdit ? '保存修改' : '建立档案' }}</text>
        </button>
      </view>
      
      <view class="safe-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { petApi, formatImageUrl, BASE_URL } from '@/api/index.js'

const statusBarHeight = ref(0)
const isEdit = ref(false)
const types = ['猫类', '犬类', '鸟类', '异宠', '马类', '鱼类']

const form = ref({
  petId: '',
  name: '',
  avatar: '',
  type: '',
  breed: '',
  gender: '0',
  weight: '',
  birthday: '',
  healthStatus: '健康',
  ownerName: '',
  phone: '',
  treatmentStatus: '健康'
})

const handleTypeChange = (e) => {
  form.value.type = types[e.detail.value]
}

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.redirectTo({ url: '/pages/pet/index' })
  }
}

const handleUpload = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uni.showLoading({ title: '上传中...', mask: true })
      uni.uploadFile({
        url: BASE_URL + '/common/upload',
        filePath: tempFilePath,
        name: 'file',
        header: {
          'Authorization': 'Bearer ' + uni.getStorageSync('token')
        },
        success: (uploadRes) => {
          const result = JSON.parse(uploadRes.data)
          if (result.code === 200) {
            form.value.avatar = result.fileName
            uni.showToast({ title: '图片上传成功', icon: 'success' })
          } else {
            uni.showToast({ title: result.msg || '上传失败', icon: 'none' })
          }
        },
        fail: () => {
          uni.showToast({ title: '网络错误', icon: 'none' })
        },
        complete: () => {
          uni.hideLoading()
        }
      })
    }
  })
}

const handleSubmit = async () => {
  if (!form.value.name) return uni.showToast({ title: '请输入宝贝昵称', icon: 'none' })
  if (!form.value.type) return uni.showToast({ title: '请选择宠物类型', icon: 'none' })
  
  uni.showLoading({ title: '正在同步...', mask: true })
  try {
    if (isEdit.value) {
      await petApi.updatePet(form.value)
    } else {
      await petApi.addPet(form.value)
    }
    uni.$emit('refreshPetList')
    uni.showToast({ title: isEdit.value ? '修改成功' : '建档成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1200)
  } catch (e) {
    console.error('保存失败', e)
  } finally {
    uni.hideLoading()
  }
}

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20
  
  // 检查是否有传入的编辑数据
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  
  if (options.pet) {
    const petData = JSON.parse(decodeURIComponent(options.pet))
    form.value = { ...petData }
    isEdit.value = true
  }
})
</script>

<style lang="scss" scoped>
.edit-page { 
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
  background: #fff;
  z-index: 100;
  border-bottom: 1rpx solid rgba(0,0,0,0.05);

  .title { 
    font-size: 34rpx; 
    font-weight: 800; 
    color: #1E293B; 
  }
  .back-btn {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 24rpx;
    background: #F8FAFC;
    &:active { transform: scale(0.95); }
  }
  .placeholder { width: 72rpx; }
}

.form-container { 
  flex: 1; 
}

.avatar-section {
  padding: 60rpx 0;
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  
  .avatar-box {
    position: relative;
    .avatar-preview { 
      width: 220rpx; 
      height: 220rpx; 
      border-radius: 70rpx; 
      background: #FFFFFF; 
      border: 6rpx solid #FFFFFF; 
      box-shadow: 0 20rpx 50rpx rgba(79, 70, 229, 0.15); 
    }
    .camera-badge {
      position: absolute;
      bottom: -10rpx;
      right: -10rpx;
      width: 60rpx;
      height: 60rpx;
      background: #4F46E5;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 6rpx solid #FFFFFF;
      box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
    }
  }
  
  .upload-tip { 
    font-size: 24rpx; 
    color: #4F46E5; 
    margin-top: 32rpx; 
    font-weight: 700; 
  }
}

.section-title {
  padding: 0 44rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  .title-text { font-size: 24rpx; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 2rpx; }
  .title-line { flex: 1; height: 1rpx; background: #E2E8F0; }
}

.modern-card {
  margin: 0 40rpx 40rpx;
  background: #FFFFFF; 
  border-radius: 40rpx; 
  padding: 10rpx 40rpx; 
  box-shadow: 0 4rpx 30rpx rgba(0,0,0,0.02);
  
  .form-item {
    padding: 32rpx 0; 
    border-bottom: 1rpx solid #F8FAFC;
    &:last-child { border-bottom: none; }
    
    .item-header {
      display: flex;
      align-items: center;
      gap: 10rpx;
      margin-bottom: 12rpx;
      .label { font-size: 22rpx; color: #94A3B8; font-weight: 700; }
    }
    
    .input { font-size: 32rpx; color: #1E293B; font-weight: 800; }
    .p-class { color: #CBD5E1; font-weight: 500; }
    
    .picker-value { 
      font-size: 32rpx; 
      color: #1E293B; 
      font-weight: 800; 
      display: flex;
      justify-content: space-between;
      align-items: center;
      &.placeholder { color: #CBD5E1; font-weight: 500; }
    }
    
    .gender-selector {
      display: flex; 
      gap: 24rpx;
      margin-top: 8rpx;
      .gender-option {
        flex: 1; 
        height: 100rpx; 
        background: #F8FAFC; 
        border-radius: 28rpx;
        display: flex; 
        align-items: center; 
        justify-content: center; 
        gap: 12rpx;
        transition: all 0.2s;
        border: 2rpx solid transparent;
        .icon { font-size: 32rpx; opacity: 0.8; }
        .text { font-size: 28rpx; color: #64748B; font-weight: 700; }
        
        &.active {
          background: #EEF2FF; 
          border-color: rgba(79, 70, 229, 0.2);
          .text { color: #4F46E5; }
          .icon { opacity: 1; color: #4F46E5; }
        }
      }
    }
  }
}

.btn-group {
  padding: 40rpx 40rpx 100rpx;
  .save-btn {
    background: #1E293B; 
    color: #FFFFFF; 
    font-size: 32rpx; 
    font-weight: 800;
    height: 110rpx; 
    line-height: 110rpx; 
    border-radius: 36rpx; 
    box-shadow: 0 20rpx 40rpx rgba(0,0,0,0.1);
    border: none;
    &:active { transform: translateY(4rpx); opacity: 0.9; }
  }
}

.safe-bottom { height: 60rpx; }
</style>
