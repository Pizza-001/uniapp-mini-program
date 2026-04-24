<template>
  <view class="page">
    <!-- 1. 顶部毛玻璃搜索 -->
    <view class="glass-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <text class="page-title">发现</text>
        <view class="search-wrap">
          <view class="search-bar">
            <uni-icons type="search" size="18" color="#909399" />
            <input v-model="keyword" placeholder="搜索宠物干货、科普、活动..." placeholder-class="ph-style" />
          </view>
          <view class="noti-btn">
            <uni-icons type="notification-filled" size="24" color="#5C6BC0" />
            <view class="badge" />
          </view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" enable-back-to-top>
      <!-- 占位防止内容被吸顶头部遮挡 -->
      <view :style="{ height: statusBarHeight + 110 + 'px' }" />

      <!-- 2. 精选推荐 (Horizontal Scroll) -->
      <view class="section-title">
        <text class="title-text">精选推荐</text>
        <text class="more-link" @tap="activeTab = '科普'">更多</text>
      </view>
      <scroll-view scroll-x class="trending-scroll" shows-horizontal-scroll-indicator="false">
        <view class="trending-list">
          <view 
            class="trending-card" 
            v-for="(item, index) in trendingPicks" 
            :key="'trend-'+index"
            @tap="handleNav('/pages/knowledge/detail?id=' + item.knowledgeId)"
          >
            <image class="trend-img" :src="formatImageUrl(item.coverImage) || defaultCover" mode="aspectFill" />
            <view class="trend-overlay">
              <text class="trend-tag">{{ item.category || '精选' }}</text>
              <text class="trend-title">{{ item.title }}</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 3. 分类标签 -->
      <view class="category-tabs">
        <scroll-view scroll-x class="tab-scroll" shows-horizontal-scroll-indicator="false">
          <view class="tabs-inner">
            <view 
              class="tab-item" 
              v-for="tab in tabs" 
              :key="tab" 
              :class="{ active: activeTab === tab }"
              @tap="activeTab = tab"
            >
              <text class="tab-text">{{ tab }}</text>
              <view class="tab-line" />
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 4. 瀑布流布局 -->
      <view class="masonry-layout">
        <!-- 左侧列 -->
        <view class="masonry-col">
          <view 
            class="feed-card animate-in-up" 
            v-for="item in leftList" 
            :key="item.knowledgeId"
            @tap="handleNav('/pages/knowledge/detail?id=' + item.knowledgeId)"
          >
            <image class="card-cover" :src="formatImageUrl(item.coverImage) || defaultCover" mode="widthFix" />
            <view class="card-body">
              <text class="card-title">{{ item.title || '无标题' }}</text>
              <view class="card-footer">
                <view class="author">
                  <image class="avatar" :src="formatImageUrl(item.authorAvatar) || '/static/images/default-avatar.png'" />
                  <text class="name">{{ item.author || '宠爱之城' }}</text>
                </view>
                <view class="fav-box" @tap.stop="toggleFavorite(item)">
                  <uni-icons 
                    :type="isFavorite(item.knowledgeId) ? 'heart-filled' : 'heart'" 
                    size="18" 
                    :color="isFavorite(item.knowledgeId) ? '#FF5252' : '#B2BEC3'" 
                  />
                  <text class="count">{{ Math.floor((item.views || 0) * 0.05) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 右侧列 -->
        <view class="masonry-col">
          <view 
            class="feed-card animate-in-up" 
            v-for="item in rightList" 
            :key="item.knowledgeId"
            @tap="handleNav('/pages/knowledge/detail?id=' + item.knowledgeId)"
          >
            <image class="card-cover" :src="formatImageUrl(item.coverImage) || defaultCover" mode="widthFix" />
            <view class="card-body">
              <text class="card-title">{{ item.title || '无标题' }}</text>
              <view class="card-footer">
                <view class="author">
                  <image class="avatar" :src="formatImageUrl(item.authorAvatar) || '/static/images/default-avatar.png'" />
                  <text class="name">{{ item.author || '宠爱之城' }}</text>
                </view>
                <view class="fav-box" @tap.stop="toggleFavorite(item)">
                  <uni-icons 
                    :type="isFavorite(item.knowledgeId) ? 'heart-filled' : 'heart'" 
                    size="18" 
                    :color="isFavorite(item.knowledgeId) ? '#FF5252' : '#B2BEC3'" 
                  />
                  <text class="count">{{ Math.floor((item.views || 0) * 0.05) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-tip" v-if="filteredList.length === 0">
        <image src="/static/images/empty.png" mode="aspectFit" />
        <text>暂无相关内容，换个关键词试试吧</text>
      </view>

      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { hospitalApi, formatImageUrl } from '@/api/index.js'

const statusBarHeight = ref(0)
const keyword = ref('')
const activeTab = ref('全部')
const tabs = ['全部', '百科', '活动', '服务', '医学', '训练']
const defaultCover = 'https://dummyimage.com/600x400/5C6BC0/fff&text=PetCare'

const list = ref([])
const favoriteIds = ref([])

const filteredList = computed(() => {
  return list.value.filter(item => {
    const itemCat = item.category || '科普'
    const matchTab = activeTab.value === '全部' || itemCat.includes(activeTab.value) || activeTab.value.includes(itemCat)
    const matchKey = !keyword.value || (item.title && item.title.includes(keyword.value))
    return matchTab && matchKey
  })
})

// 瀑布流列分配 logic
const leftList = computed(() => filteredList.value.filter((_, i) => i % 2 === 0))
const rightList = computed(() => filteredList.value.filter((_, i) => i % 2 === 1))

// 精选推荐逻辑 (取阅读量前4)
const trendingPicks = computed(() => {
  return [...list.value].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4)
})

const isFavorite = (id) => favoriteIds.value.includes(id)

const toggleFavorite = (item) => {
  const ids = [...favoriteIds.value]
  const fullFavs = uni.getStorageSync('my_fav_list') || []
  const index = ids.indexOf(item.knowledgeId)
  
  if (index > -1) {
    // 移除 ID
    ids.splice(index, 1)
    // 从全量列表中移除
    const listIndex = fullFavs.findIndex(f => f.knowledgeId === item.knowledgeId)
    if (listIndex > -1) fullFavs.splice(listIndex, 1)
    
    uni.showToast({ title: '已取消', icon: 'none' })
  } else {
    // 添加 ID
    ids.push(item.knowledgeId)
    // 添加到全量列表
    fullFavs.push(item)
    uni.showToast({ title: '已收藏', icon: 'none' })
    uni.vibrateShort()
  }
  
  favoriteIds.value = ids
  uni.setStorageSync('my_fav_ids', ids)
  uni.setStorageSync('my_fav_list', fullFavs)
}

const fetchList = async () => {
  try {
    const res = await hospitalApi.getKnowledge({ status: '0', pageNum: 1, pageSize: 100 })
    list.value = res.rows || []
  } catch(e) {
    console.error('Failed to load discovery feed', e)
  }
}

const handleNav = (path) => {
  if (!path) return
  uni.navigateTo({ url: path })
}

onMounted(() => {
  try {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
    favoriteIds.value = uni.getStorageSync('my_fav_ids') || []
  } catch (e) {
    statusBarHeight.value = 20
  }
  fetchList()
})
</script>

<style lang="scss" scoped>
// 定义常用的文本省略 Mixin
@mixin text-ellipsis-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.page { background: $bg-main; min-height: 100vh; }

.glass-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 999;
  @include glass-morphism;
  border: none;
  .header-content {
    padding: 20rpx 32rpx;
    .page-title {
      font-size: 40rpx; font-weight: 800; color: $text-main;
      margin-bottom: 24rpx; display: block;
      letter-spacing: 2rpx;
    }
    .search-wrap {
      display: flex; align-items: center; gap: 24rpx;
      .search-bar {
        flex: 1; background: #fff; border-radius: 100rpx; padding: 18rpx 32rpx;
        display: flex; align-items: center; gap: 16rpx;
        box-shadow: $shadow-sm; border: 2rpx solid rgba(92, 107, 192, 0.1);
        input { flex: 1; font-size: 26rpx; color: $text-main; }
        .ph-style { color: #B2BEC3; }
      }
      .noti-btn {
        position: relative;
        width: 80rpx; height: 80rpx; background: #fff; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: $shadow-sm;
        .badge {
          position: absolute; top: 12rpx; right: 12rpx;
          width: 14rpx; height: 14rpx; background: $accent; border: 4rpx solid #fff; border-radius: 50%;
        }
      }
    }
  }
}

.scroll-content { width: 100%; }

.section-title {
  padding: 32rpx; display: flex; justify-content: space-between; align-items: center;
  .title-text { font-size: 32rpx; font-weight: 700; color: $text-main; }
  .more-link { font-size: 24rpx; color: $primary; }
}

.trending-scroll {
  padding: 0 32rpx; margin-bottom: 40rpx;
  .trending-list {
    display: flex; gap: 24rpx; padding-bottom: 10rpx;
    .trending-card {
      flex-shrink: 0; width: 480rpx; height: 280rpx;
      border-radius: 24rpx; overflow: hidden; position: relative;
      box-shadow: $shadow-md;
      .trend-img { width: 100%; height: 100%; }
      .trend-overlay {
        position: absolute; bottom: 0; left: 0; right: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
        padding: 32rpx 24rpx 20rpx;
        .trend-tag {
          font-size: 18rpx; color: #fff; background: rgba(255,255,255,0.2);
          padding: 2rpx 12rpx; border-radius: 4rpx; margin-bottom: 8rpx; display: inline-block;
          backdrop-filter: blur(4rpx);
        }
        .trend-title { font-size: 28rpx; color: #fff; font-weight: 600; line-height: 1.4; @include text-ellipsis-2; }
      }
    }
  }
}

.category-tabs {
  margin-bottom: 32rpx;
  .tabs-inner {
    display: flex; 
    flex-wrap: nowrap; 
    gap: 16rpx;
    padding: 0 32rpx;
    .tab-item {
      flex-shrink: 0; // 防止被挤压变窄
      padding: 12rpx 32rpx; position: relative;
      .tab-text { font-size: 28rpx; color: $text-sub; transition: all 0.3s; }
      .tab-line {
        position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
        width: 0; height: 6rpx; background: $primary; border-radius: 3rpx; transition: all 0.3s;
      }
      &.active {
        .tab-text { color: $primary; font-weight: 700; font-size: 30rpx; }
        .tab-line { width: 32rpx; }
      }
    }
  }
}

.masonry-layout {
  display: flex; gap: 24rpx; padding: 0 32rpx 40rpx;
  .masonry-col {
    flex: 1; display: flex; flex-direction: column; gap: 24rpx;
  }
  .feed-card {
    background: #fff; border-radius: 24rpx; overflow: hidden; box-shadow: $shadow-sm;
    &:active { transform: scale(0.98); }
    .card-cover { width: 100%; background: #F8FAFC; }
    .card-body {
      padding: 20rpx;
      .card-title { font-size: 28rpx; font-weight: 700; color: $text-main; line-height: 1.5; margin-bottom: 16rpx; display: block; }
      .card-footer {
        display: flex; justify-content: space-between; align-items: center;
        .author {
          display: flex; align-items: center; gap: 8rpx;
          .avatar { width: 36rpx; height: 36rpx; border-radius: 50%; background: #eee; }
          .name { font-size: 22rpx; color: $text-sub; }
        }
        .fav-box {
          display: flex; align-items: center; gap: 4rpx;
          .count { font-size: 22rpx; color: $text-hint; }
        }
      }
    }
  }
}

.empty-tip {
  padding: 100rpx 0; display: flex; flex-direction: column; align-items: center; gap: 24rpx;
  image { width: 300rpx; height: 200rpx; opacity: 0.6; }
  text { color: $text-hint; font-size: 26rpx; }
}

.animate-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.safe-bottom { height: 160rpx; }
</style>
