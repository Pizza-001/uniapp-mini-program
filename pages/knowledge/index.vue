<template>
  <view class="knowledge-page">
    <view class="status-bar"></view>
    
    <view class="header">
      <text class="page-title">前沿科普</text>
      <view class="search-box">
        <uni-icons type="search" size="18" color="#BDC3C7" />
        <input 
          v-model="queryParams.title" 
          placeholder="搜索养护教程、绝育指南..." 
          class="input"
          placeholder-class="input-ph"
          @confirm="handleSearch"
        />
      </view>
    </view>

    <!-- 分类导航 -->
    <view class="category-wrapper">
      <scroll-view class="category-scroll" scroll-x :show-scrollbar="false">
        <view 
          class="category-item" 
          :class="{ active: currentCategoryIndex === index }"
          v-for="(item, index) in categories" 
          :key="index"
          @tap="handleCategory(index)"
        >
          {{ item }}
        </view>
      </scroll-view>
    </view>

    <!-- 知识列表 -->
    <scroll-view 
      class="list-scroll" 
      scroll-y 
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="article-list">
        <view class="article-card" v-for="item in list" :key="item.knowledgeId" @tap="goToDetail(item)">
          <view class="cover-wrap">
            <image class="cover" :src="formatImageUrl(item.coverImage) || defaultCover" mode="aspectFill" />
            <view class="play-icon" v-if="item.videoUrl">
              <uni-icons type="videocam-filled" size="24" color="#fff" />
            </view>
          </view>
          <view class="info">
            <view class="title-row">
              <text class="title">{{ item.title }}</text>
            </view>
            <text class="summary">{{ stripHtml(item.content) }}</text>
            
            <view class="meta-bottom">
               <view class="primary-tag">{{ item.category || '资讯' }}</view>
               <view class="stats">
                 <text class="author">By {{ item.author || '平台严选' }}</text>
                 <text class="dot">·</text>
                 <uni-icons type="fire-filled" size="14" color="#E74C3C" />
                 <text class="views">{{ item.views || 0 }}</text>
               </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-status">
        <text v-if="loading">极速加载中...</text>
        <text v-else-if="finished">全库知识已加载完毕</text>
        <text v-else>继续上滑探索</text>
      </view>
      
      <view class="footer-spacing"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { hospitalApi, formatImageUrl } from '@/api/index.js'

const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const currentCategoryIndex = ref(0)
const defaultCover = 'https://dummyimage.com/600x400/1A1A2E/fff&text=PetKnowledge'

const categories = ['头条精选', '健康自测', '医疗百科', '日常营养', '情绪行为', '急救常识']

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: '',
  category: ''
})

const fetchData = async (reset = false) => {
  if (loading.value || (finished.value && !reset)) return
  if (reset) {
    queryParams.pageNum = 1
    list.value = []
    finished.value = false
  }
  loading.value = true
  try {
    const res = await hospitalApi.getKnowledge(queryParams)
    const rows = res.rows || []
    const total = res.total || 0
    if (rows.length > 0) {
      list.value = [...list.value, ...rows]
      if (list.value.length >= total) finished.value = true
      else queryParams.pageNum++
    } else {
      finished.value = true
    }
  } catch (e) {
    console.error('获取列表失败', e)
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  refreshing.value = true
  await fetchData(true)
  refreshing.value = false
}

const loadMore = () => fetchData()

const handleSearch = () => fetchData(true)

const handleCategory = (index) => {
  currentCategoryIndex.value = index
  queryParams.category = index === 0 ? '' : categories[index]
  fetchData(true)
}

const goToDetail = (item) => {
  uni.navigateTo({ url: `/pages/knowledge/detail?id=${item.knowledgeId}` })
}

const stripHtml = (html) => {
  if (!html) return '进入正文探索更硬核的科普知识...'
  return html.replace(/<[^>]+>/g, '').substring(0, 45) + '...'
}

onMounted(() => fetchData())

onLoad((options) => {
  if (options.keyword) {
    queryParams.title = options.keyword
    fetchData(true)
  }
})
</script>

<style lang="scss">
.knowledge-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F8F9FA;
}

.status-bar {
  height: var(--status-bar-height);
  background: #1A1A2E;
}

.header {
  background: #1A1A2E;
  padding: 20rpx 40rpx 30rpx;
  
  .page-title {
    font-size: 40rpx; font-weight: 900; color: #fff; margin-bottom: 30rpx; display: block;
  }
  
  .search-box {
    display: flex; align-items: center; background-color: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
    padding: 16rpx 32rpx; border-radius: 40rpx; border: 1px solid rgba(255,255,255,0.15);
    .input { flex: 1; margin-left: 16rpx; font-size: 28rpx; color: #fff; }
    .input-ph { color: rgba(255,255,255,0.6); }
  }
}

.category-wrapper {
  background: #fff; padding: 20rpx 0 0;
  border-bottom: 2rpx solid #F0F2F5; shadow: 0 4rpx 10rpx rgba(0,0,0,0.02);
}

.category-scroll {
  white-space: nowrap; padding: 10rpx 20rpx 20rpx;
  .category-item {
    display: inline-block; padding: 12rpx 36rpx; font-size: 28rpx; color: #7F8C8D; 
    font-weight: bold; position: relative; transition: 0.3s;
    
    &.active {
      color: #1A1A2E; font-weight: 900; transform: scale(1.05);
      &::after {
        content: ''; position: absolute; bottom: -8rpx; left: 50%; transform: translateX(-50%);
        width: 30rpx; height: 8rpx; background: linear-gradient(90deg, #E74C3C, #F39C12); border-radius: 4rpx;
      }
    }
  }
}

.list-scroll { flex: 1; padding: 30rpx; box-sizing: border-box; }

.article-list { display: flex; flex-direction: column; gap: 30rpx; }

.article-card {
  display: flex; flex-direction: column; background: #fff;
  border-radius: 36rpx; overflow: hidden; box-shadow: 0 12rpx 32rpx rgba(149, 157, 165, 0.1);
  
  .cover-wrap {
    position: relative; width: 100%; height: 320rpx;
    .cover { width: 100%; height: 100%; }
    .play-icon {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 90rpx; height: 90rpx; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      border: 4rpx solid rgba(255,255,255,0.5);
    }
  }
  
  .info {
    padding: 30rpx;
    
    .title-row { margin-bottom: 16rpx; }
    .title { font-size: 34rpx; font-weight: 900; color: #2C3E50; line-height: 1.4; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
    
    .summary { font-size: 26rpx; color: #7F8C8D; margin-bottom: 24rpx; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; line-height: 1.5; }
    
    .meta-bottom {
      display: flex; justify-content: space-between; align-items: center;
      
      .primary-tag { font-size: 20rpx; color: #1A1A2E; background: #F4F6F9; padding: 8rpx 20rpx; border-radius: 8rpx; border: 2rpx solid #E5E8E8; font-weight: 800; }
      
      .stats {
        display: flex; align-items: center; gap: 8rpx;
        .author { font-size: 22rpx; color: #95A5A6; }
        .dot { color: #BDC3C7; }
        .views { font-size: 22rpx; color: #E74C3C; font-weight: bold; }
      }
    }
  }
}

.loading-status { text-align: center; padding: 40rpx 0; font-size: 24rpx; color: #BDC3C7; font-weight: bold; letter-spacing: 2rpx;}

.footer-spacing { height: 60rpx; }
</style>
