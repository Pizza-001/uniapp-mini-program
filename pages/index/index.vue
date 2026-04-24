<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- Header -->
    <view class="header">
      <view class="header-main" :style="{ paddingRight: menuButtonWidth + 'px' }">
        <view class="user-box">
          <view class="avatar-wrap">
             <image class="avatar" src="/static/icons/profile.png" mode="aspectFill" />
             <view class="online-status"></view>
          </view>
          <view class="user-text">
            <text class="greeting">宠爱之城欢迎您 ✨</text>
            <text class="user-name">{{ userInfo ? (userInfo.nickName || userInfo.userName) : '未登录用户' }}</text>
          </view>
        </view>
      </view>

      <view class="search-box">
        <uni-icons type="search" size="18" color="rgba(255,255,255,0.8)" />
        <input placeholder="搜索名医、疫苗、健康百科..." placeholder-class="search-ph" />
      </view>
    </view>

    <scroll-view scroll-y class="content-scroll">
      <view class="scroll-inner">
        
        <!-- Banner Carousel -->
        <view class="banner-section">
          <swiper class="banner-swiper" circular autoplay interval="4500" indicator-dots indicator-active-color="#fff">
            <swiper-item v-for="item in bannerList" :key="item.bannerId" @tap="handleBanner(item)">
              <image :src="formatImageUrl(item.image)" mode="aspectFill" class="banner-image" />
            </swiper-item>
            <swiper-item v-if="bannerList.length === 0">
              <view class="banner-placeholder">
                <text>美好加载中...</text>
              </view>
            </swiper-item>
          </swiper>
        </view>

        <!-- Quick Nav -->
        <view class="nav-grid">
           <view class="nav-item" v-for="nav in navList" :key="nav.label" @tap="handleNav(nav.path)">
             <view class="nav-icon-wrap" :style="{ background: nav.bg }">
               <image class="nav-icon-img" :src="nav.iconSrc" mode="aspectFit" />
             </view>
             <text class="nav-label">{{ nav.label }}</text>
           </view>
        </view>

        <!-- Top Doctors -->
        <view class="section-container">
          <view class="section-title-row">
            <text class="title">名医坐席</text>
             <view class="more-link" @tap="handleNav('/pages/appointment/index')">
              <text>全科名医</text><uni-icons type="right" size="12" color="#B2BEC3" />
            </view>
          </view>
          <scroll-view class="card-slider" scroll-x>
            <view class="doc-mini-card" v-for="doc in topDoctors" :key="doc.doctorId" @tap="handleNav('/pages/appointment/index')">
               <image class="doc-pic" :src="formatImageUrl(doc.avatar || doc.photo)" mode="aspectFill" />
               <text class="doc-name">{{ doc.name }}</text>
               <text class="doc-title">{{ doc.title }}</text>
               <text class="doc-rating">评分 {{ doc.rating || '5.0' }}</text>
            </view>
          </scroll-view>
        </view>

        <!-- Recommended Vaccines -->
        <view class="section-container">
           <view class="section-title-row">
            <text class="title">今日惠选疫苗</text>
             <view class="more-link" @tap="handleNav('/pages/vaccine/index')">
              <text>更多计划</text><uni-icons type="right" size="12" color="#B2BEC3" />
            </view>
          </view>
          <view class="vaccine-list">
             <view class="vac-card" v-for="vac in recommendedVaccines" :key="vac.vaccineId" @tap="handleNav('/pages/vaccine/index')">
               <view class="vac-icon">
                 <image class="vac-img-inner" src="/static/icons/nav-vaccine.png" mode="aspectFit" />
               </view>
               <view class="vac-info">
                 <text class="vac-name">{{vac.name}}</text>
                 <text class="vac-tags">{{vac.manufacturer || '原厂直供'}} | {{vac.targetScope || '全期'}}</text>
               </view>
               <view class="vac-price">¥{{vac.price}}</view>
             </view>
          </view>
        </view>

        <!-- Latest Knowledge -->
        <view class="section-container">
           <view class="section-title-row">
            <text class="title">养宠前沿百科</text>
             <view class="more-link" @tap="handleNav('/pages/knowledge/index')">
              <text>探索干货</text><uni-icons type="right" size="12" color="#B2BEC3" />
            </view>
          </view>
          <view class="news-list">
             <view class="news-item" v-for="news in latestKnowledge" :key="news.knowledgeId" @tap="goToKnowledge(news)">
               <image class="news-cover" :src="formatImageUrl(news.coverImage) || defaultCover" mode="aspectFill" />
               <view class="news-text">
                 <text class="news-title">{{ news.title }}</text>
                 <view class="news-meta">
                   <text class="category">{{ news.category || '精选' }}</text>
                   <text class="views">{{ news.views || 0 }} 浏览</text>
                 </view>
               </view>
             </view>
          </view>
        </view>

        <view class="safe-bottom"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { homeApi, hospitalApi, apptApi, userApi, formatImageUrl } from '@/api/index.js'

const statusBarHeight = ref(0)
const menuButtonWidth = ref(0)
const userInfo = ref(null)

const bannerList = ref([])
const topDoctors = ref([])
const recommendedVaccines = ref([])
const latestKnowledge = ref([])
const defaultCover = 'https://dummyimage.com/600x400/5C6BC0/fff&text=PetCare'

const navList = [
  { label: '挂号预约', iconSrc: '/static/icons/nav-appt.png', bg: '#E8EAF6', path: '/pages/appointment/index' },
  { label: '疫苗接种', iconSrc: '/static/icons/nav-vaccine.png', bg: '#E8F5E9', path: '/pages/vaccine/index' },
  { label: '养宠百科', iconSrc: '/static/icons/nav-knowledge.png', bg: '#E3F2FD', path: '/pages/knowledge/index' },
  { label: '在线购药', iconSrc: '/static/icons/nav-pharmacy.png', bg: '#FFF3E0', path: '/pages/pharmacy/index' },
]

const handleNav = (path) => {
  if (!path || path === '#') return
  const isTabBar = path.includes('appointment') || path.includes('pharmacy')
  if (isTabBar) {
    uni.switchTab({ url: path })
  } else {
    uni.navigateTo({ url: path })
  }
}

const goToKnowledge = (news) => {
  uni.navigateTo({ url: `/pages/knowledge/detail?id=${news.knowledgeId}` })
}

const getUserInfo = async () => {
  try {
    const res = await userApi.getInfo()
    userInfo.value = res.user
  } catch(e) {}
}

const fetchBackendData = () => {
  // Banner
  homeApi.getBanner().then(res => {
    bannerList.value = res.rows || []
  }).catch(e => console.error('Banner err', e))

  // Top Doctors (limit 5)
  apptApi.getDoctors({ pageNum: 1, pageSize: 5 }).then(res => {
    topDoctors.value = res.rows || []
  }).catch(e => console.error('Doctors err', e))

  // Recommended Vaccines (limit 3)
  hospitalApi.getVaccines({ pageNum: 1, pageSize: 3 }).then(res => {
    recommendedVaccines.value = res.rows || []
  }).catch(e => console.error('Vaccines err', e))

  // Latest Knowledge (limit 4)
  hospitalApi.getKnowledge({ pageNum: 1, pageSize: 4 }).then(res => {
    latestKnowledge.value = res.rows || []
  }).catch(e => console.error('Knowledge err', e))
}

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight
  // #ifdef MP-WEIXIN
  const menu = uni.getMenuButtonBoundingClientRect()
  menuButtonWidth.value = sys.windowWidth - menu.left + 10
  // #endif

  if (uni.getStorageSync('token')) {
    getUserInfo()
  }
  fetchBackendData()
})
</script>

<style lang="scss" scoped>
.page { 
  background: #F4F6F9; 
  min-height: 100vh; 
  display: flex; 
  flex-direction: column; 
}

.header {
  background: linear-gradient(135deg, #4A569D 0%, #5C6BC0 100%);
  padding: 30rpx 40rpx 80rpx;
  border-radius: 0 0 50rpx 50rpx;
  
  .header-main {
    display: flex; align-items: center; margin-bottom: 40rpx;
    
    .user-box {
      display: flex; align-items: center; gap: 24rpx;
      .avatar-wrap {
        position: relative;
        .avatar { width: 110rpx; height: 110rpx; border-radius: 50%; border: 6rpx solid rgba(255,255,255,0.4); }
        .online-status { position: absolute; bottom: 8rpx; right: 0; width: 24rpx; height: 24rpx; background: #66BB6A; border-radius: 50%; border: 4rpx solid #fff; }
      }
      .user-text {
        display: flex; flex-direction: column; gap: 8rpx;
        .greeting { font-size: 26rpx; color: rgba(255,255,255,0.9); }
        .user-name { font-size: 36rpx; font-weight: 900; color: #fff; letter-spacing: 2rpx; }
      }
    }
  }
  
  .search-box {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    height: 90rpx; padding: 0 32rpx; border-radius: 45rpx;
    display: flex; align-items: center; gap: 20rpx;
    border: 1px solid rgba(255,255,255,0.2);
    input { flex: 1; font-size: 28rpx; color: #fff; }
    .search-ph { color: rgba(255,255,255,0.7); }
  }
}

.content-scroll { flex: 1; margin-top: -50rpx; }
.scroll-inner { padding: 0 30rpx; }

.banner-section {
  margin-bottom: 40rpx;
  .banner-swiper {
    height: 340rpx; border-radius: 36rpx; overflow: hidden;
    box-shadow: 0 16rpx 40rpx rgba(74, 86, 157, 0.2);
    transform: translateZ(0); /* Hardware acceleration */
    .banner-image { width: 100%; height: 100%; }
    .banner-placeholder {
      width: 100%; height: 100%; background: #E8EAF6;
      display: flex; align-items: center; justify-content: center;
      color: #7986CB; font-size: 28rpx; font-weight: bold;
    }
  }
}

.nav-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 24rpx; margin-bottom: 40rpx;
  .nav-item {
    display: flex; flex-direction: column; align-items: center; gap: 16rpx;
    transition: transform 0.2s ease;
    &:active { transform: scale(0.95); }
    .nav-icon-wrap {
      width: 120rpx; height: 120rpx; border-radius: 40rpx;
      display: flex; align-items: center; justify-content: center;
      box-shadow: inset 0 4rpx 10rpx rgba(255,255,255,0.8), 0 12rpx 24rpx rgba(0,0,0,0.06);
      border: 2rpx solid #fff;
      .nav-icon-img {
        width: 76rpx; height: 76rpx;
      }
    }
    .nav-label { font-size: 24rpx; color: #2C3E50; font-weight: 800; }
  }
}

.section-container {
  margin-bottom: 40rpx;
  .section-title-row {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx;
    .title { font-size: 34rpx; font-weight: 900; color: #1A1A1A; position: relative; padding-left: 20rpx;
      &::before { content: ''; position: absolute; left: 0; top: 10%; bottom: 10%; width: 8rpx; background: #5C6BC0; border-radius: 8rpx; }
    }
    .more-link { display: flex; align-items: center; gap: 4rpx; color: #909399; font-size: 24rpx; font-weight: 600; padding: 10rpx; }
  }
}

.card-slider {
  white-space: nowrap; padding-bottom: 20rpx; margin: 0 -10rpx;
  .doc-mini-card {
    display: inline-flex; flex-direction: column; align-items: center;
    width: 240rpx; background: #fff; border-radius: 28rpx; padding: 30rpx 20rpx;
    margin: 0 10rpx; box-shadow: 0 8rpx 24rpx rgba(149, 157, 165, 0.1);
    .doc-pic { width: 100rpx; height: 100rpx; border-radius: 50%; border: 4rpx solid #E8EAF6; margin-bottom: 16rpx; background: #fafafa; }
    .doc-name { font-size: 28rpx; font-weight: 800; color: #2C3E50; margin-bottom: 6rpx; }
    .doc-title { font-size: 22rpx; color: #7F8C8D; margin-bottom: 12rpx; }
    .doc-rating { font-size: 20rpx; color: #E67E22; background: #FDF2E9; padding: 4rpx 16rpx; border-radius: 100rpx; font-weight: bold; }
  }
}

.vaccine-list {
  display: flex; flex-direction: column; gap: 20rpx;
  .vac-card {
    display: flex; align-items: center; background: #fff; padding: 30rpx; border-radius: 28rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
    .vac-icon { 
      width: 100rpx; height: 100rpx; border-radius: 24rpx; 
      background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%); 
      display: flex; align-items: center; justify-content: center; flex-shrink:0; 
      box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.04);
      border: 4rpx solid #fff;
      .vac-img-inner {
        width: 60rpx; height: 60rpx;
      }
    }
    .vac-info { flex: 1; margin-left: 24rpx; display: flex; flex-direction: column; gap: 10rpx;
      .vac-name { font-size: 30rpx; font-weight: 800; color: #1A1A1A; }
      .vac-tags { font-size: 22rpx; color: #7F8C8D; }
    }
    .vac-price { font-size: 34rpx; font-weight: 900; color: #E74C3C; }
  }
}

.news-list {
  display: flex; flex-direction: column; gap: 24rpx;
  .news-item {
    display: flex; background: #fff; padding: 24rpx; border-radius: 28rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
    .news-cover { width: 180rpx; height: 130rpx; border-radius: 16rpx; background: #eee; flex-shrink:0; }
    .news-text { flex: 1; margin-left: 24rpx; display: flex; flex-direction: column; justify-content: space-between;
      .news-title { font-size: 28rpx; font-weight: bold; color: #2C3E50; line-height: 1.4; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
      .news-meta { display: flex; justify-content: space-between; align-items: center;
        .category { font-size: 20rpx; color: #3498DB; background: #EBF5FB; padding: 4rpx 12rpx; border-radius: 8rpx; font-weight: bold; }
        .views { font-size: 22rpx; color: #BDC3C7; }
      }
    }
  }
}

.safe-bottom { height: 180rpx; }
</style>
