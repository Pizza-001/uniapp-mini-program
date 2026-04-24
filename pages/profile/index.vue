<template>
  <view class="profile-page">
    <!-- 极简画廊风个人信息头部 -->
    <view class="premium-header">
      <view class="status-bar-placeholder" :style="{ height: statusBarHeight + 'px' }"></view>
      
      <view class="header-main">
        <view class="user-info-v5" @tap="handleUserClick">
          <view class="avatar-frame">
            <image :src="userInfo && userInfo.avatar ? formatImageUrl(userInfo.avatar) : 'https://img.icons8.com/plasticine/200/dog.png'" class="avatar-v5" />
          </view>
          <view class="text-meta">
            <text class="user-name-v5">{{ userInfo && userInfo.nickName ? userInfo.nickName : '宠物守护者' }}</text>
            <view class="identity-badge">
                <uni-icons type="vip-filled" size="12" color="#EBAC50" />
                <text>{{ parseLevelTitle(memberInfo.level) }}</text>
            </view>
          </view>
        </view>
        <view class="action-icons">
          <view class="icon-btn" @tap="handleNav('/pages/profile/settings')">
            <uni-icons type="gear" size="26" color="#1A1A1A" />
          </view>
        </view>
      </view>
    </view>

    <!-- 会员主卡区 (高层级浮动设计) -->
    <view class="hero-section">
      <view class="brand-member-card-v4" @tap="handleGoMemberCenter">
        <view class="card-inner">
          <view class="info-side">
            <view class="level-row">
              <text class="l-tag">L{{ memberInfo.level || 0 }}</text>
              <text class="l-name">{{ parseLevelTitle(memberInfo.level) }}</text>
            </view>
            <view class="growth-box">
              <text>成长值 {{ memberInfo.growthValue || 0 }}</text>
              <uni-icons type="help" size="14" color="rgba(255,255,255,0.6)" @tap.stop="handleShowGrowthRule" />
            </view>
            <view class="progress-track">
              <view class="progress-bar" :style="{ width: growthPercent + '%' }"></view>
            </view>
          </view>
          <view class="mascot-side">
            <view class="m-frame">
              <view class="eyes">
                <view class="eye left"><view class="pupil"></view></view>
                <view class="eye right"><view class="pupil"></view></view>
              </view>
              <view class="m-back-icon"><uni-icons type="left" size="14" color="#EBAC50" /></view>
            </view>
          </view>
        </view>
        
        <!-- 联动切换导航条 -->
        <view class="card-nav-v4">
          <view class="nav-tags">
            <text class="tag" :class="{active: currentTab === 0}" @tap.stop="currentTab = 0">权益礼</text>
            <text class="tag" :class="{active: currentTab === 1}" @tap.stop="currentTab = 1">心意礼</text>
            <text class="tag" :class="{active: currentTab === 2}" @tap.stop="currentTab = 2">成长礼</text>
          </view>
          <view class="nav-entry" @tap.stop="handleGoMemberCenter">
            <text>会员中心</text>
            <uni-icons type="right" size="12" color="#999" />
          </view>
        </view>

        <!-- 动态切换的特权图标区 (高对比度设计) -->
        <view class="benefit-row">
            <view class="b-item" v-for="(p, i) in activeTabPrivileges" :key="i" @tap.stop="showPrivilege(p)">
                <view class="b-icon badge-gold">
                    <uni-icons :type="p.icon" size="24" color="#EBAC50" />
                </view>
                <text>{{ p.label }}</text>
            </view>
        </view>
      </view>
    </view>

    <!-- 精简版金刚区 (3列紧凑型) -->
    <view class="function-grid">
      <view class="grid-card shadow-soft" v-for="(f, i) in mainFunctions" :key="i" @tap="handleNav(f.url)">
        <image :src="f.icon" class="f-icon" />
        <text class="f-name">{{ f.name }}</text>
      </view>
    </view>

    <!-- 综合菜单列表 (含 挂号记录 & 勋章墙) -->
    <view class="menu-list">
      <view class="menu-row" v-for="(m, i) in menus" :key="i" @tap="handleNav(m.url)">
        <view class="ml">
          <image :src="m.img" class="m-icon" />
          <text>{{ m.name }}</text>
        </view>
        <uni-icons type="right" size="14" color="#DCDFE6" />
      </view>
    </view>

    <!-- 自定义高级特权弹框 -->
    <view class="premium-popup" v-if="showPopupBox" @touchmove.stop.prevent>
        <view class="popup-mask" @tap="closePopup"></view>
        <view class="popup-content animate-pop">
            <text class="p-title">{{ activePrivilege.label }}</text>
            <view class="p-desc-box">
                <text class="p-text">{{ activePrivilege.longDesc || '该等级会员可享受专属特权服务，详情请咨询客服。' }}</text>
            </view>
            <view class="p-close-btn" @tap="closePopup">我知道了</view>
        </view>
    </view>

    <view class="logout-btn" @tap="handleLogout">退出登录</view>
    <view class="safe-area"></view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { userApi, memberApi, formatImageUrl } from '@/api/index.js'

const statusBarHeight = ref(0)
const userInfo = ref(null)
const memberInfo = ref({ level: '6', balance: 0, points: 0, growthValue: 2500 })
const currentTab = ref(1) 

const mainFunctions = [
  { name: '我的档案', icon: 'https://img.icons8.com/color/96/dog.png', url: '/pages/pet/index' },
  { name: '我的钱包', icon: 'https://img.icons8.com/color/96/wallet.png', url: '/pages/profile/recharge' },
  { name: '积分商城', icon: 'https://img.icons8.com/color/96/gift.png', url: '/pages/points-mall/index' }
]

const menus = [
  { name: '挂号记录', img: 'https://img.icons8.com/fluency/96/document.png', url: '/pages/record/index' },
  { name: '我的勋章', img: 'https://img.icons8.com/color/96/medal.png', url: '/pages/profile/medals' },
  { name: '消费账单', img: 'https://img.icons8.com/color/96/bill.png', url: '/pages/profile/consumption' },
  { name: '我的地址', img: 'https://img.icons8.com/color/96/marker.png', url: '/pages/profile/address' },
  { name: '专属客服', img: 'https://img.icons8.com/color/96/customer-support.png', url: '/pages/profile/support' },
  { name: '系统设置', img: 'https://img.icons8.com/color/96/settings.png', url: '/pages/profile/settings' }
]

const activeTabPrivileges = computed(() => {
    const tabs = [
        [
            {label:'双倍积分', icon:'star-filled', longDesc:'消费即享双倍积分。'},
            {label:'会员日', icon:'calendar', longDesc:'每月8日会员专属折扣。'},
            {label:'会员价', icon:'cart-filled', longDesc:'专属折扣价格。'},
            {label:'消费返现', icon:'wallet', longDesc:'最高立返10%现金。'}
        ],
        [
            {label:'限定周边', icon:'shop', longDesc:'独家宠物定制周边免费领。'},
            {label:'专属抽奖', icon:'gear', longDesc:'每月一次大奖池抽取机会。'},
            {label:'社群神券', icon:'email', longDesc:'入群即领无门槛大红包。'},
            {label:'专属客服', icon:'headphones', longDesc:'金牌管家1对1即时响应。'}
        ],
        [
            {label:'升级积分', icon:'star', longDesc:'每次升级获赠额外积分。'},
            {label:'勋章展示', icon:'medal', longDesc:'记录您的养宠荣誉。'},
            {label:'成就奖励', icon:'gift', longDesc:'达成特定里程碑领好礼。'},
            {label:'惊喜福袋', icon:'heart', longDesc:'不定期派送神秘礼袋。'}
        ]
    ]
    return tabs[currentTab.value] || tabs[0]
})

const growthPercent = computed(() => {
  const thresholds = [1000, 5000, 15000, 30000, 50000, 50000, 100000]
  const target = thresholds[parseInt(memberInfo.value.level)] || 1000
  return Math.min((memberInfo.value.growthValue / target) * 100, 100)
})

const parseLevelTitle = (lvl) => {
  const titles = { '0': '实习铲屎官', '1': '资深铲屎官', '2': '护宠先锋', '3': '宠爱达人', '4': '荣耀养宠师', '5': '护宠大师', '6': '宠爱大宗师' }
  return titles[lvl] || '宠爱守护者'
}

// 详情弹窗逻辑
const showPopupBox = ref(false)
const activePrivilege = ref({})
const showPrivilege = (p) => {
    activePrivilege.value = p
    showPopupBox.value = true
}
const closePopup = () => { showPopupBox.value = false }
const handleShowGrowthRule = () => {
    showPrivilege({ label: '成长值说明', longDesc: '成长值是会员等级晋升的位一凭证，通过消费、签到等任务获得。' })
}

const handleGoMemberCenter = () => uni.navigateTo({ url: '/pages/profile/member-center' });
const handleNav = (url) => uni.navigateTo({ url });

const refreshData = async () => {
  if (!uni.getStorageSync('token')) return
  try {
    const res = await memberApi.getMemberInfo()
    if (res.code === 200) memberInfo.value = res.data
    const uRes = await userApi.getInfo()
    if (uRes.code === 200) {
      userInfo.value = uRes.user || uRes.data
    }
  } catch (e) {}
}

const handleLogout = () => {
  uni.showModal({
    title: '提示', content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('token'); uni.reLaunch({ url: '/pages/login/index' })
      }
    }
  })
}

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
})

onShow(() => refreshData())
</script>

<style lang="scss" scoped>
.profile-page { background: #F8F9FA; min-height: 100vh; }

.premium-header {
  background: #fff; padding: 0 40rpx 40rpx;
  .header-main {
    display: flex; justify-content: space-between; align-items: center; padding: 50rpx 0 20rpx;
    .user-info-v5 {
      display: flex; align-items: center; gap: 32rpx;
      .avatar-frame { width: 140rpx; height: 140rpx; border-radius: 50%; padding: 6rpx; background: #fff; box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.08); .avatar-v5 { width: 100%; height: 100%; border-radius: 50%; } }
      .text-meta { .user-name-v5 { font-size: 44rpx; font-weight: 900; color: #1A1A1A; display: block; margin-bottom: 8rpx; } .identity-badge { display: flex; align-items: center; gap: 6rpx; background: #F8F9FA; padding: 4rpx 16rpx; border-radius: 100rpx; text { font-size: 20rpx; color: #666; font-weight: 700; } } }
    }
    .action-icons { .icon-btn { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; background: #F8F9FA; border-radius: 50%; } }
  }
}

.hero-section {
  padding: 0 40rpx; margin-top: 0;
}

.brand-member-card-v4 {
  background: #fff; border-radius: 40rpx; overflow: hidden; box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.1);
  background: #3D3305;
  
  .card-inner {
    padding: 40rpx; display: flex; justify-content: space-between; align-items: center; min-height: 220rpx;
    .info-side {
      flex: 1;
      .level-row { display: flex; align-items: baseline; gap: 12rpx; margin-bottom: 12rpx; .l-tag { color: #fff; font-size: 44rpx; font-weight: 800; } .l-name { color: #fff; font-size: 48rpx; font-weight: 800; } }
      .growth-box { display: flex; align-items: center; gap: 8rpx; margin-bottom: 24rpx; text { color: rgba(255,255,255,0.8); font-size: 26rpx; font-weight: 600; } }
      .progress-track { height: 4rpx; background: rgba(255,255,255,0.1); border-radius: 10rpx; width: 300rpx; .progress-bar { height: 100%; background: #EBAC50; border-radius: 10rpx; box-shadow: 0 0 10rpx #EBAC50; } }
    }
    .m-frame {
      width: 130rpx; height: 90rpx; border: 2rpx solid rgba(235, 172, 80, 0.4); border-radius: 30rpx; display: flex; align-items: center; justify-content: center; position: relative;
      .m-back-icon { position: absolute; right: 6rpx; top: 6rpx; transform: rotate(180deg); }
      .eye { width: 32rpx; height: 48rpx; background: #fff; border-radius: 16rpx; position: relative; .pupil { width: 12rpx; height: 12rpx; background: #000; border-radius: 50%; position: absolute; bottom: 8rpx; left: 50%; transform: translateX(-50%); } }
    }
  }

  .card-nav-v4 {
    display: flex; justify-content: space-between; align-items: center; padding: 24rpx 40rpx; background: #fff;
    .nav-tags { display: flex; gap: 16rpx; .tag { padding: 10rpx 24rpx; border-radius: 100rpx; background: #F4F5F7; font-size: 22rpx; color: #666; font-weight: 600; &.active { background: #FFF8E1; color: #333; font-weight: 700; } } }
    .nav-entry { display: flex; align-items: center; gap: 4rpx; text { font-size: 24rpx; color: #999; font-weight: 600; } }
  }

  .benefit-row {
    display: flex; justify-content: space-between; padding: 20rpx 40rpx 40rpx; background: #fff;
    .b-item {
        display: flex; flex-direction: column; align-items: center; gap: 12rpx;
        .b-icon { width: 76rpx; height: 76rpx; display: flex; align-items: center; justify-content: center; &.badge-gold { background: #1A1A1A; border-radius: 50%; border: 2rpx solid #EBAC50; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.3); } }
        text { font-size: 22rpx; color: #333; font-weight: 700; }
    }
  }
}

.function-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 30rpx; padding: 40rpx;
  .grid-card { background: #fff; border-radius: 40rpx; padding: 30rpx 0; display: flex; flex-direction: column; align-items: center; gap: 16rpx; box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.03); .f-icon { width: 80rpx; height: 80rpx; } .f-name { font-size: 26rpx; color: #333; font-weight: 700; } }
}

.menu-list {
  background: #fff; border-radius: 40rpx; margin: 0 40rpx; padding: 10rpx 40rpx;
  .menu-row {
    display: flex; justify-content: space-between; align-items: center; padding: 36rpx 0;
    &:not(:last-child) { border-bottom: 2rpx solid #F8F9FA; }
    .ml { 
        display: flex; align-items: center; gap: 24rpx; 
        .m-icon { width: 44rpx; height: 44rpx; }
        text { font-size: 28rpx; color: #333; font-weight: 700; } 
    }
  }
}

.logout-btn { margin: 60rpx 40rpx; text-align: center; color: #FF7675; font-size: 28rpx; font-weight: 700; background: #fff; padding: 30rpx; border-radius: 40rpx; }
.safe-area { height: 100rpx; }

/* 弹框样式 */
.premium-popup {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    .popup-mask { position: absolute; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); }
    .popup-content {
        position: relative; width: 580rpx; background: linear-gradient(to bottom, #FFF0F0, #FFFFFF);
        border-radius: 40rpx; padding: 60rpx 40rpx; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;
        .p-title { font-size: 40rpx; font-weight: 900; color: #FF1A1A; margin-bottom: 40rpx; letter-spacing: 2rpx; }
        .p-desc-box { min-height: 120rpx; margin-bottom: 50rpx; .p-text { font-size: 28rpx; color: #333; line-height: 1.6; text-align: center; font-weight: 600; display: block; } }
        .p-close-btn { width: 100%; height: 100rpx; background: linear-gradient(to right, #FF7675, #FF1A1A); border-radius: 100rpx; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 32rpx; font-weight: 900; box-shadow: 0 10rpx 30rpx rgba(255, 26, 26, 0.4); }
    }
}
.animate-pop { animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes popIn { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
</style>
