<template>
  <view class="detail-page">
    <view class="header-nav">
      <view class="back-btn" @tap="goBack" hover-class="back-btn-hover">
        <view class="back-arrow"></view>
      </view>
      <text class="header-title">正文</text>
    </view>
    
    <scroll-view scroll-y class="content-scroll">
      <view class="article-header">
        <text class="title">{{ detail.title || '标题加载中...' }}</text>
        <view class="meta-wrap">
          <view class="meta-left">
            <image src="/static/icons/profile.png" class="author-avatar" mode="aspectFill" />
            <text class="author">{{ detail.author || '平台专家团' }}</text>
            <text class="role-tag">官方认证</text>
          </view>
          <text class="date">{{ detail.createTime ? detail.createTime.substring(0,10) : '' }}</text>
        </view>
      </view>

      <view class="video-container" v-if="detail.videoUrl">
        <video 
          :src="formatImageUrl(detail.videoUrl)" 
          class="video-player"
          :poster="formatImageUrl(detail.coverImage) || defaultCover"
          title="养宠科普视频"
        ></video>
      </view>

      <view class="rich-content-box">
        <rich-text :nodes="detail.content || '<p>暂无详细正文内容...</p>'"></rich-text>
      </view>

      <view class="bottom-stats-bar">
        <view class="tags">
          <text class="tag-item"># {{ detail.category || '科普干货' }}</text>
          <text class="tag-item"># 科学养宠</text>
        </view>
        <view class="views-box">
          <uni-icons type="eye-filled" size="18" color="#BDC3C7" />
          <text>{{ detail.views || 0 }}人已读</text>
        </view>
      </view>
      
      <view class="spacing"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { request, formatImageUrl } from '@/api/index.js'
import { onLoad } from '@dcloudio/uni-app'

const currentId = ref('')
const detail = ref({})
const defaultCover = 'https://dummyimage.com/600x400/1A1A2E/fff&text=PetKnowledge'

onLoad((options) => {
  if (options.id) {
    currentId.value = options.id
    fetchDetail()
  }
})

const fetchDetail = async () => {
  if (!currentId.value) return
  try {
    const res = await request({ url: `/hospital/knowledge/${currentId.value}` })
    if (res.code === 200) {
      detail.value = res.data
    }
  } catch (e) {
    console.error('获取详情失败', e)
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

</script>

<style lang="scss">
.detail-page {
  height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.header-nav {
  background: #1A1A2E;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 88rpx;
  padding-top: var(--status-bar-height);
  box-sizing: content-box;
  
  .back-btn {
    position: absolute; left: 24rpx; bottom: 12rpx;
    width: 64rpx; height: 64rpx; border-radius: 50%;
    background: rgba(255,255,255,0.1); backdrop-filter: blur(5px);
    display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(255,255,255,0.2);
    transition: all 0.2s ease;
    
    .back-arrow {
      width: 22rpx;
      height: 22rpx;
      border-top: 4rpx solid #fff;
      border-left: 4rpx solid #fff;
      transform: rotate(-45deg);
      margin-left: 8rpx; /* Optical centering */
      border-radius: 2rpx;
    }
  }
  .back-btn-hover {
    background: rgba(255,255,255,0.25);
    transform: scale(0.92);
  }
  .header-title { color: #fff; font-size: 32rpx; font-weight: bold; }
}

.content-scroll { flex: 1; }

.article-header {
  padding: 40rpx 30rpx;
  
  .title {
    font-size: 44rpx; font-weight: 900; color: #1A1A2E; 
    line-height: 1.5; display: block; margin-bottom: 30rpx;
  }
  
  .meta-wrap {
    display: flex; justify-content: space-between; align-items: center;
    background: #F8F9FA; padding: 20rpx; border-radius: 20rpx;
    
    .meta-left {
      display: flex; align-items: center; gap: 16rpx;
      .author-avatar { width: 50rpx; height: 50rpx; border-radius: 50%; }
      .author { font-size: 28rpx; color: #34495E; font-weight: bold; }
      .role-tag { font-size: 20rpx; background: #E8EAF6; color: #5C6BC0; padding: 4rpx 12rpx; border-radius: 8rpx; font-weight: 800; border: 2rpx solid #C5CAE9;}
    }
    .date { font-size: 24rpx; color: #95A5A6; }
  }
}

.video-container {
  padding: 0 30rpx; margin-bottom: 40rpx;
  .video-player {
    width: 100%; height: 420rpx; border-radius: 24rpx; background-color: #000;
    box-shadow: 0 16rpx 40rpx rgba(0,0,0,0.1);
  }
}

.rich-content-box {
  padding: 0 30rpx 40rpx; font-size: 32rpx; color: #2C3E50; line-height: 1.8; letter-spacing: 1px;
}

.bottom-stats-bar {
  padding: 30rpx; border-top: 2rpx solid #F0F2F5;
  display: flex; justify-content: space-between; align-items: center;
  
  .tags {
    display: flex; gap: 20rpx;
    .tag-item { font-size: 24rpx; color: #1A1A2E; background: #F4F6F9; padding: 10rpx 24rpx; border-radius: 40rpx; font-weight: bold; }
  }
  
  .views-box {
    display: flex; align-items: center; gap: 10rpx;
    text { font-size: 24rpx; color: #BDC3C7; font-weight: bold; }
  }
}

.spacing { height: 80rpx; }
</style>
