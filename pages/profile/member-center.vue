<template>
  <view class="member-center-v2" :style="{ '--theme-color': currentLevelData.color }">
    <!-- 1. 沉浸式标题栏 -->
    <view class="nav-bar-v2" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <uni-icons type="left" size="24" color="#333" @tap="goBack" />
        <text class="title">会员中心</text>
        <uni-icons type="more-filled" size="24" color="#333" />
      </view>
    </view>

    <scroll-view scroll-y class="main-scroller">
      <!-- 2. 弧形进阶轨道 (100% 像素级还原) -->
      <view class="arc-level-v100">
        <svg class="arc-svg-v100" viewBox="0 0 400 120">
            <defs>
                <!-- 轨道渐变：两头淡入，中间亮 -->
                <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#EBAC50" stop-opacity="0" />
                    <stop offset="50%" stop-color="#EBAC50" stop-opacity="1" />
                    <stop offset="100%" stop-color="#EBAC50" stop-opacity="0" />
                </linearGradient>
                <!-- 发光滤镜 -->
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <!-- 绘制发光弧线轨道 -->
            <path d="M 40,90 Q 200,20 360,90" fill="none" stroke="url(#arcGrad)" stroke-width="4" filter="url(#glow)" />
            
            <!-- 等级节点 - 已划过 (L5) -->
            <circle cx="80" cy="74" r="5" fill="#EBAC50" />
            
            <!-- 等级节点 - 核心位 (L6) -->
            <circle cx="200" cy="54" r="10" fill="rgba(235, 172, 80, 0.3)" filter="url(#glow)" /> <!-- 外部光晕 -->
            <circle cx="200" cy="54" r="6" fill="#EBAC50" /> <!-- 中间底色 -->
            <circle cx="200" cy="54" r="3" fill="#FFF" /> <!-- 白色高亮中心 -->
        </svg>
        
        <view class="arc-labels-v100">
            <view class="l-item item-5">
                <text class="l-tag">L5</text>
                <text class="l-name">品鉴大师</text>
            </view>
            <view class="l-item item-6 active">
                <text class="l-tag">L6</text>
                <text class="l-name">宠爱大宗师</text>
            </view>
        </view>
      </view>

      <!-- 3. 会员卡 Swiper (核心联动区域) -->
      <swiper class="card-swiper" circular :current="activeIdx" @change="onSwiperChange" previous-margin="40rpx" next-margin="40rpx">
        <swiper-item v-for="(lv, index) in allLevels" :key="index">
          <view class="lv-card-wrap" :class="{ scale: activeIdx !== index }">
            <view class="lv-card" :style="{ background: lv.linear }">
                <view class="tag-status">{{ getStatusText(lv.id) }}</view>
                <view class="c-body">
                    <view class="info">
                        <view class="title-row">
                            <text class="l-tag">L{{lv.id}}</text>
                            <text class="l-name">{{lv.title}}</text>
                        </view>
                        <view class="growth-info" @tap="showPopup('成长值说明')">
                            <text v-if="memberInfo.growthValue >= lv.threshold">{{lv.threshold}} 成长值</text>
                            <text v-else>需 {{lv.threshold}} 成长值才能解锁</text>
                            <uni-icons type="help" size="14" color="rgba(255,255,255,0.6)" />
                        </view>
                        <view class="progress-bar">
                            <view class="fill" :style="{ width: getLevelPercent(lv.id) + '%' }"></view>
                        </view>
                        <text class="desc-msg">{{ lv.desc }}</text>
                    </view>
                    <view class="mascot-v2">
                        <view class="m-eye-box">
                            <view class="eye l"><view class="pupil"></view></view>
                            <view class="eye r"><view class="pupil"></view></view>
                        </view>
                    </view>
                </view>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <!-- 4. 动态权益矩阵 -->
      <view class="privilege-section">
        <view class="header-row">
            <view class="line"></view>
            <text class="txt">L{{currentLevelData.id}} {{currentLevelData.title}}尊享 {{currentLevelData.privileges.length}} 项权益</text>
            <view class="line"></view>
        </view>
        <view class="p-grid">
            <view class="p-item" v-for="(p, i) in currentLevelData.privileges" :key="i" @tap="showPrivilege(p)">
                <view class="p-icon-box" :style="{ background: currentLevelData.subColor }">
                    <uni-icons :type="p.icon" size="26" color="#3D3305" />
                    <text class="p-tag" v-if="p.tag">{{ p.tag }}</text>
                </view>
                <text class="p-label">{{ p.label }}</text>
            </view>
        </view>
      </view>

      <!-- 5. 等级福利礼包 -->
      <view class="gift-section">
          <view class="s-title">会员升级礼</view>
          <view class="gift-card-v2">
              <view class="g-left">
                  <view class="icon-circle"><uni-icons type="star-filled" size="22" color="#EBAC50" /></view>
                  <view class="g-meta">
                      <view class="g-val"><text class="num">{{ currentLevelData.giftPoints }}</text> 积分</view>
                      <text class="g-sub">升级即可领取</text>
                  </view>
              </view>
              <view class="g-btn" @tap="handleNav('/pages/profile/points')">
                  <text>查看明细</text>
                  <uni-icons type="right" size="12" color="#EBAC50" />
              </view>
          </view>
      </view>

      <!-- 5.5 我的优惠券 (新增) -->
      <view class="coupon-section-v2">
          <view class="s-header">
              <text class="title">我的优惠券</text>
              <text class="more" @tap="handleNav('/pages/profile/coupons')">查看全部 ></text>
          </view>
          <view class="coupon-card-v2">
              <view class="c-l">
                  <view class="c-val">8.8<text class="u">折</text></view>
                  <text class="c-tag">会员专属</text>
              </view>
              <view class="c-r">
                  <view class="c-info">
                      <text class="c-name">全场洗护美容折扣券</text>
                      <text class="c-time">有效期至 2026-12-31</text>
                  </view>
                  <view class="c-use-btn" @tap="handleNav('/pages/index/index')">立即使用</view>
              </view>
          </view>
      </view>

      <!-- 6. 积分商城嵌入 (100% 像素级重刻) -->
      <view class="mall-section-v100">
          <view class="s-title-v100">积分商城</view>
          <view class="mall-banner-inner" @tap="handleNav('/pages/points-mall/index')">
              <!-- 左侧：实物类 -->
              <view class="banner-col">
                  <image src="https://img.icons8.com/isometric/100/shopping-cart.png" class="col-img" />
              </view>
              
              <!-- 虚线分割 -->
              <view class="v-dash"></view>
              
              <!-- 中间：引导核心 -->
              <view class="banner-col center">
                  <view class="mascot-head">
                      <view class="m-red-hair"></view>
                      <view class="m-face">
                          <view class="m-eyes"><view class="e"></view><view class="e"></view></view>
                          <view class="m-smile"></view>
                      </view>
                  </view>
                  <view class="go-mall-btn">
                      前往积分商城 >
                  </view>
              </view>
              
              <!-- 虚线分割 -->
              <view class="v-dash"></view>
              
              <!-- 右侧：虚拟类 -->
              <view class="banner-col">
                  <image src="https://img.icons8.com/color/144/ticket.png" class="col-img ticket" />
              </view>
          </view>
      </view>

      <view class="safe-bottom"></view>
    </scroll-view>

    <!-- 7. 自定义高级特权弹框 -->
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
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { memberApi } from '@/api/index.js'

const statusBarHeight = ref(44)
const activeIdx = ref(6) // 默认显示 L6
const memberInfo = ref({ level: '6', growthValue: 25000 })
const showPopupBox = ref(false)
const activePrivilege = ref({})

const allLevels = [
    { id: 0, title: '实习铲屎官', threshold: 0, color: '#999', subColor: '#F2F2F2', linear: '#AAA', desc: '开启铲屎官之旅', 
      privileges: [
          {label:'基础服务',icon:'chat',longDesc:'所有等级会员均可享受基础在线咨询服务。'},
          {label:'健康档案',icon:'list',longDesc:'免费为您的宠物建立电子健康管理档案。'}
      ] 
    },
    { id: 1, title: '资深铲屎官', threshold: 1000, color: '#3498DB', subColor: '#E1F5FE', linear: 'linear-gradient(135deg, #3498DB, #2980B9)', desc: '资深养宠经验', privileges: [{label:'会员专区',icon:'shop',longDesc:'解锁APP内会员专属精选商品区域。'}] },
    { id: 2, title: '护宠先锋', threshold: 5000, color: '#2ECC71', subColor: '#E8F5E9', linear: 'linear-gradient(135deg, #2ECC71, #27AE60)', desc: '宠物健康管家', privileges: [{label:'消费积分',icon:'star',longDesc:'每一笔消费均可产生积分奖励。'}] },
    { id: 3, title: '宠爱达人', threshold: 15000, color: '#9B59B6', subColor: '#F3E5F5', linear: 'linear-gradient(135deg, #9B59B6, #8E44AD)', desc: '社区活跃明星', privileges: [{label:'节日礼券',icon:'gift',longDesc:'在宠物节日等特定日期获得额外优惠券。'}] },
    { id: 4, title: '荣耀养宠师', threshold: 30000, color: '#F1C40F', subColor: '#FFFDE7', linear: 'linear-gradient(135deg, #F1C40F, #F39C12)', desc: '专业宠物护理', privileges: [{label:'专属咨询',icon:'headphones',longDesc:'获得高级宠物护理专家的优先咨询权。'}] },
    { id: 5, title: '护宠大师', threshold: 50000, color: '#EB4D4B', subColor: '#FFEBEE', linear: 'linear-gradient(135deg, #EB4D4B, #BDC3C7)', desc: '已超过该等级阈值', 
      privileges: [
          {label:'双倍积分',icon:'star-filled',tag:'x2',longDesc:'L4荣耀养宠师-L5护宠大师每周三消费得双倍积分。'},
          {label:'会员日',icon:'calendar',tag:'88',longDesc:'每月8日会员日，全场洗护美容服务享8.8折。'},
          {label:'会员价',icon:'cart-filled',tag:'¥',longDesc:'全场自营宠粮及药品享受会员专属折扣价。'},
          {label:'消费返现',icon:'wallet',longDesc:'消费满额返还抵用券，最高立返10%。'}
      ] 
    },
    { id: 6, title: '宠爱大宗师', threshold: 100000, color: '#3D3305', subColor: '#FFF8E1', linear: 'linear-gradient(135deg, #3D3305, #5A4B08)', desc: '恭喜您已达最高等级', 
      privileges: [
          {label:'双倍积分',icon:'star-filled',tag:'x2',longDesc:'L6宠爱大宗师全时段消费均可获得双倍积分。'},
          {label:'会员日',icon:'calendar',tag:'88',longDesc:'会员日全场服务更低折扣，并享免费体检一次。'},
          {label:'会员价',icon:'cart-filled',tag:'¥',longDesc:'享受全站最低折上折会员专属特价。'},
          {label:'消费返现',icon:'wallet',longDesc:'最高级别消费返利政策，消费即得高额回报。'},
          {label:'专属抽奖',icon:'gear',tag:'',longDesc:'每月获得一次平台高级礼品盲盒抽取机会。'},
          {label:'社群神券',icon:'email',tag:'',longDesc:'加入大宗师专属社群，每日领取超大额神券。'},
          {label:'专属客服',icon:'headphones',tag:'',longDesc:'金牌管家一对一24小时即时在线响应。'},
          {label:'生日福利',icon:'gift',tag:'',longDesc:'宠物生日当天，平台免费寄送精美生日定卡及大礼包。'}
      ] 
    }
]

const currentLevelData = computed(() => allLevels[activeIdx.value])
const mallItems = ref([
    { name: '三文鱼冻干 100g', points: 500, image: 'https://img.icons8.com/color/144/cat-food.png' },
    { name: '全价成年猫粮 2kg', points: 2800, image: 'https://img.icons8.com/color/144/dog-bowl.png' },
    { name: '猫咪全项体检券', points: 15000, image: 'https://img.icons8.com/color/144/pill.png' },
    { name: '狗狗上门洗澡服务', points: 8000, image: 'https://img.icons8.com/color/144/pet-grooming.png' }
])

const onSwiperChange = (e) => { activeIdx.value = e.detail.current }
const getStatusText = (lvlId) => {
    const myLvl = parseInt(memberInfo.value.level)
    if (myLvl > lvlId) return '您已超过该等级'
    if (myLvl === lvlId) return '您当前所属等级'
    return `距解锁还差 ${allLevels[lvlId].threshold - memberInfo.value.growthValue} 经验`
}
const getLevelPercent = (lvlId) => {
    if (parseInt(memberInfo.value.level) > lvlId) return 100
    if (parseInt(memberInfo.value.level) < lvlId) return 0
    return Math.min((memberInfo.value.growthValue / allLevels[lvlId].threshold) * 100, 100)
}

const showPrivilege = (p) => {
    activePrivilege.value = p
    showPopupBox.value = true
}
const closePopup = () => { showPopupBox.value = false }

const handleNav = (url) => uni.navigateTo({ url })
const goBack = () => uni.navigateBack()

onMounted(() => {
    activeIdx.value = parseInt(memberInfo.value.level)
})
</script>

<style lang="scss" scoped>
.member-center-v2 {
  background: #F8F9FA; min-height: 100vh;
}

.nav-bar-v2 {
    background: #FFFBF0;
    .nav-content { height: 100rpx; display: flex; align-items: center; justify-content: space-between; padding: 0 40rpx; .title { font-size: 34rpx; font-weight: 900; color: #1A1A1A; } }
}

.arc-level-v100 {
    background: linear-gradient(to bottom, #FFFBF0, #FFF); padding: 20rpx 0 60rpx; position: relative; height: 180rpx;
    .arc-svg-v100 { width: 100%; height: 120rpx; }
    .arc-labels-v100 {
        position: absolute; bottom: 30rpx; left: 0; width: 100%;
        .l-item {
            position: absolute; display: flex; align-items: baseline; gap: 8rpx;
            .l-tag { font-size: 32rpx; color: #8D7A50; font-weight: 500; font-family: "Times New Roman", serif; }
            .l-name { font-size: 28rpx; color: #8D7A50; font-weight: 700; }
            
            &.item-5 { left: 40rpx; opacity: 0.6; }
            &.item-6 { 
                left: 50%; transform: translateX(-50%); opacity: 1;
                .l-tag { color: #8D7A50; }
                .l-name { color: #8D7A50; }
            }
        }
    }
}

.card-swiper {
    height: 400rpx; margin-top: 20rpx;
    .lv-card-wrap {
        padding: 0 20rpx; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); height: 100%;
        &.scale { transform: scale(0.9); opacity: 0.6; }
        .lv-card {
            height: 100%; border-radius: 40rpx; position: relative; padding: 40rpx; box-sizing: border-box; overflow: hidden;
            box-shadow: 0 20rpx 40rpx rgba(0,0,0,0.2);
            
            .tag-status { position: absolute; top: 0; left: 0; background: rgba(255,255,255,0.2); color: #fff; font-size: 20rpx; padding: 8rpx 30rpx; border-bottom-right-radius: 30rpx; }
            
            .c-body {
                display: flex; justify-content: space-between; align-items: flex-end; height: 100%;
                .info {
                    flex: 1;
                    .title-row { display: flex; align-items: center; gap: 16rpx; margin-bottom: 20rpx; .l-tag { color: #fff; font-size: 52rpx; font-weight: 900; } .l-name { color: #fff; font-size: 56rpx; font-weight: 900; } }
                    .growth-info { display: flex; align-items: center; gap: 8rpx; margin-bottom: 24rpx; text { color: rgba(255,255,255,0.8); font-size: 28rpx; font-weight: 700; } }
                    .progress-bar { height: 8rpx; background: rgba(255,255,255,0.1); border-radius: 10rpx; margin-bottom: 12rpx; .fill { height: 100%; background: #fff; box-shadow: 0 0 10rpx #fff; border-radius: 10rpx; } }
                    .desc-msg { font-size: 22rpx; color: rgba(255,255,255,0.6); font-weight: 600; }
                }
                .m-eye-box {
                    width: 160rpx; height: 110rpx; border: 4rpx solid rgba(255,255,255,0.4); border-radius: 40rpx; display: flex; align-items: center; justify-content: center; gap: 16rpx;
                    .eye { width: 40rpx; height: 56rpx; background: #fff; border-radius: 20rpx; position: relative; .pupil { width: 14rpx; height: 14rpx; background: #000; border-radius: 50%; position: absolute; bottom: 12rpx; left: 50%; transform: translateX(-50%); } }
                }
            }
        }
    }
}

.privilege-section {
    margin-top: 60rpx;
    .header-row {
        display: flex; align-items: center; justify-content: center; gap: 20rpx; margin-bottom: 40rpx;
        .line { width: 40rpx; height: 2rpx; background: #EEE; }
        .txt { font-size: 24rpx; font-weight: 900; color: #333; }
    }
    .p-grid {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 40rpx 20rpx; padding: 0 40rpx;
        .p-item {
            display: flex; flex-direction: column; align-items: center; gap: 16rpx;
            .p-icon-box {
                width: 100rpx; height: 100rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative;
                .p-tag { position: absolute; top: -10rpx; right: -10rpx; background: #EB4D4B; color: #fff; font-size: 16rpx; padding: 2rpx 10rpx; border-radius: 100rpx; font-weight: 900; }
            }
            .p-label { font-size: 24rpx; color: #333; font-weight: 800; text-align: center; }
        }
    }
}

.gift-section, .coupon-section-v2 {
    padding: 60rpx 40rpx 0;
    .s-title, .s-header .title { font-size: 34rpx; font-weight: 900; color: #1A1A1A; }
    .gift-card-v2 {
        margin-top: 30rpx; background: #fff; border-radius: 40rpx; padding: 40rpx; display: flex; justify-content: space-between; align-items: center;
        box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.02);
        .g-left {
            display: flex; align-items: center; gap: 24rpx;
            .icon-circle { width: 80rpx; height: 80rpx; border-radius: 50%; background: #FFF9C4; display: flex; align-items: center; justify-content: center; }
            .g-meta { .g-val { font-size: 32rpx; font-weight: 800; color: #333; .num { color: #EBAC50; font-size: 40rpx; } } .g-sub { font-size: 22rpx; color: #999; font-weight: 600; } }
        }
        .g-btn { display: flex; align-items: center; gap: 8rpx; text { font-size: 24rpx; color: #EBAC50; font-weight: 700; } }
    }
}

.coupon-section-v2 {
    .s-header { display: flex; justify-content: space-between; align-items: baseline; .more { font-size: 24rpx; color: #999; font-weight: 600; } }
    .coupon-card-v2 {
        margin-top: 24rpx; display: flex; height: 160rpx;
        .c-l {
            width: 180rpx; background: linear-gradient(135deg, #FF7675, #FF1A1A); border-radius: 30rpx 10rpx 10rpx 30rpx;
            display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;
            &::after { content: ''; position: absolute; right: -4rpx; top: 10%; bottom: 10%; width: 8rpx; background-image: radial-gradient(#fff 2rpx, transparent 0); background-size: 8rpx 12rpx; }
            .c-val { color: #fff; font-size: 48rpx; font-weight: 900; .u { font-size: 24rpx; margin-left: 4rpx; } }
            .c-tag { font-size: 18rpx; color: rgba(255,255,255,0.8); margin-top: 4rpx; }
        }
        .c-r {
            flex: 1; background: #fff; border-radius: 10rpx 30rpx 30rpx 10rpx; padding: 24rpx 30rpx;
            display: flex; align-items: center; justify-content: space-between;
            .c-info { .c-name { font-size: 28rpx; font-weight: 800; color: #333; display: block; margin-bottom: 8rpx; } .c-time { font-size: 20rpx; color: #999; } }
            .c-use-btn { background: #1A1A1A; color: #fff; font-size: 22rpx; padding: 12rpx 24rpx; border-radius: 100rpx; font-weight: 700; }
        }
    }
}

.mall-section-v100 {
    padding: 60rpx 40rpx;
    .s-title-v100 { font-size: 34rpx; font-weight: 900; color: #333; margin-bottom: 24rpx; }
    .mall-banner-inner {
        background: #FFF7F0; border-radius: 30rpx; padding: 40rpx 20rpx; display: flex; align-items: center; justify-content: space-around;
        position: relative;
        
        .banner-col {
            flex: 1; display: flex; flex-direction: column; align-items: center; gap: 20rpx;
            .col-img { width: 120rpx; height: 120rpx; &.ticket { transform: rotate(15deg); } }
            
            &.center { flex: 1.2; position: relative; }
        }
        
        .v-dash { width: 2rpx; height: 80rpx; border-left: 2rpx dashed #EEDDCB; }
        
        .mascot-head {
            width: 140rpx; height: 110rpx; position: relative; margin-bottom: 10rpx;
            .m-red-hair { position: absolute; top: 0; left: 0; right: 0; height: 60rpx; background: #FF0000; border-radius: 40rpx 40rpx 10rpx 10rpx; border: 4rpx solid #000; }
            .m-face { position: absolute; bottom: 0; left: 10rpx; right: 10rpx; height: 60rpx; background: #fff; border-radius: 0 0 30rpx 30rpx; border: 4rpx solid #000; border-top: none; display: flex; flex-direction: column; align-items: center; }
            .m-eyes { display: flex; gap: 20rpx; margin-top: 10rpx; .e { width: 14rpx; height: 20rpx; background: #000; border-radius: 50%; } }
            .m-smile { width: 16rpx; height: 8rpx; border-bottom: 2rpx solid #000; border-radius: 50%; }
        }
        
        .go-mall-btn {
            background: linear-gradient(to right, #FF1A1A, #E60000); padding: 12rpx 30rpx; border-radius: 100rpx;
            color: #FFEA00; font-size: 22rpx; font-weight: 900; box-shadow: 0 6rpx 20rpx rgba(255,0,0,0.3);
            white-space: nowrap;
        }
    }
}

.safe-bottom { height: 100rpx; }

/* 7. 自定义高级特权弹框样式 */
.premium-popup {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    .popup-mask { position: absolute; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); }
    .popup-content {
        position: relative; width: 580rpx; background: linear-gradient(to bottom, #FFF0F0, #FFFFFF);
        border-radius: 40rpx; padding: 60rpx 40rpx; box-sizing: border-box;
        display: flex; flex-direction: column; align-items: center;
        
        .p-title { font-size: 40rpx; font-weight: 900; color: #FF1A1A; margin-bottom: 40rpx; letter-spacing: 2rpx; }
        .p-desc-box {
            min-height: 120rpx; margin-bottom: 50rpx;
            .p-text { font-size: 28rpx; color: #333; line-height: 1.6; text-align: center; font-weight: 600; display: block; }
        }
        .p-close-btn {
            width: 100%; height: 100rpx; background: linear-gradient(to right, #FF7675, #FF1A1A);
            border-radius: 100rpx; display: flex; align-items: center; justify-content: center;
            color: #fff; font-size: 32rpx; font-weight: 900; box-shadow: 0 10rpx 30rpx rgba(255, 26, 26, 0.4);
            &:active { transform: scale(0.96); opacity: 0.9; }
        }
    }
}

.animate-pop {
    animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
    0% { transform: scale(0.6); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}
</style>
