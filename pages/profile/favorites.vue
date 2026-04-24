<template>
  <view class="container">
    <view class="header-card">
      <view class="title-row">
        <text class="title">我的收藏</text>
        <view class="clear-btn" v-if="list.length > 0" @tap="clearAll">清空全部</view>
      </view>
      <text class="subtitle">共 {{ list.length }} 篇心爱内容</text>
    </view>

    <scroll-view scroll-y class="list-content">
      <view class="feed-list" v-if="list.length > 0">
        <view 
          class="feed-item card" 
          v-for="(item, index) in list" 
          :key="index" 
          @tap="handleNav('/pages/knowledge/detail?id=' + item.knowledgeId)"
        >
          <image class="feed-cover" :src="formatImageUrl(item.coverImage)" mode="aspectFill" />
          <view class="feed-info">
            <view class="tag-row">
              <text class="tag category-tag">{{ item.category || '科普' }}</text>
              <view class="del-btn" @tap.stop="removeFav(index)">
                <uni-icons type="trash-filled" size="18" color="#FF7675" />
              </view>
            </view>
            <text class="feed-title">{{ item.title }}</text>
            <view class="feed-footer">
              <text class="source">{{ item.author || '宠爱之城官方' }}</text>
              <text class="time">{{ item.createTime || '2026-04-23' }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-box" v-else>
        <image src="/static/images/empty_data.png" mode="aspectFit" />
        <text>还没有收藏任何内容哦</text>
        <view class="go-btn" @tap="uni.switchTab({ url: '/pages/discovery/index' })">去发现美好</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatImageUrl } from '@/api/index.js'

const list = ref([])

const loadFavs = () => {
  list.value = uni.getStorageSync('my_fav_list') || []
}

const removeFav = (index) => {
  uni.showModal({
    title: '提示',
    content: '不再收藏这篇文章了吗？',
    success: (res) => {
      if (res.confirm) {
        list.value.splice(index, 1)
        uni.setStorageSync('my_fav_list', list.value)
        const ids = list.value.map(i => i.knowledgeId)
        uni.setStorageSync('my_fav_ids', ids)
      }
    }
  })
}

const clearAll = () => {
  uni.showModal({
    title: '危险操作',
    content: '确定要清空所有收藏内容吗？此操作不可撤销。',
    confirmColor: '#EE5253',
    success: (res) => {
      if (res.confirm) {
        list.value = []
        uni.setStorageSync('my_fav_list', [])
        uni.setStorageSync('my_fav_ids', [])
        uni.showToast({ title: '已全部清空', icon: 'success' })
      }
    }
  })
}

const handleNav = (url) => uni.navigateTo({ url })

onMounted(() => {
  loadFavs()
})
</script>

<style lang="scss" scoped>


.container { min-height: 100vh; background: #F4F7FC; }

.header-card {
  background: linear-gradient(135deg, #FF7675 0%, #EE5253 100%);
  padding: 80rpx 40rpx;
  .title-row {
    display: flex; justify-content: space-between; align-items: center;
    .title { color: #fff; font-size: 44rpx; font-weight: 900; }
    .clear-btn { 
      font-size: 22rpx; color: #fff; padding: 10rpx 24rpx; 
      background: rgba(255,255,255,0.2); border-radius: 100rpx;
      backdrop-filter: blur(5px); border: 2rpx solid rgba(255,255,255,0.3);
    }
  }
  .subtitle { color: rgba(255,255,255,0.7); font-size: 24rpx; }
}

.list-content { padding: 30rpx; box-sizing: border-box; }

.feed-list {
  display: flex; flex-direction: column; gap: 30rpx;
  .feed-item {
    background: #fff; border-radius: 30rpx; overflow: hidden;
    box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.03);
    .feed-cover { width: 100%; height: 300rpx; }
    .feed-info {
      padding: 24rpx 30rpx;
      .tag-row {
        display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx;
        .tag { font-size: 18rpx; padding: 4rpx 16rpx; border-radius: 6rpx; background: #FFF0F0; color: #FF7675; font-weight: 800; }
      }
      .feed-title { font-size: 30rpx; font-weight: 800; color: #2D3436; margin-bottom: 20rpx; display: block; }
      .feed-footer {
        display: flex; justify-content: space-between; font-size: 20rpx; color: #B2BEC3;
      }
    }
  }
}

.empty-box {
  display: flex; flex-direction: column; align-items: center; gap: 30rpx; padding-top: 150rpx;
  image { width: 300rpx; height: 300rpx; opacity: 0.5; }
  text { color: #B2BEC3; font-size: 26rpx; }
  .go-btn { background: #EE5253; color: #fff; padding: 20rpx 60rpx; border-radius: 100rpx; font-weight: 700; font-size: 28rpx; }
}
</style>
