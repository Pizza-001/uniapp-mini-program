<template>
  <view class="page">
    <view class="header-img-wrap">
      <view class="header-bg">
        <text class="header-emoji">💉</text>
      </view>
      <view class="header-overlay">
        <view class="back-btn" @tap="goBack"><uni-icons type="left" size="20" color="#fff" /></view>
      </view>
    </view>

    <view class="detail-body">
      <!-- 疫苗基本信息 -->
      <view class="info-card">
        <view class="info-top">
          <text class="vaccine-name">{{ detail.name }}</text>
          <view class="price-badge">¥{{ detail.price }}</view>
        </view>
        <text class="vaccine-sub">{{ detail.subTitle }}</text>
        <view class="diseases-row">
          <text class="d-label">预防疾病：</text>
          <view class="disease-tags">
            <text class="dtag" v-for="d in detail.diseases" :key="d">{{ d }}</text>
          </view>
        </view>
        <view class="meta-grid">
          <view class="mg-item">
            <text class="mg-label">适用宠物</text>
            <text class="mg-val">{{ detail.petType }}</text>
          </view>
          <view class="mg-item">
            <text class="mg-label">接种周期</text>
            <text class="mg-val">{{ detail.cycle }}</text>
          </view>
          <view class="mg-item">
            <text class="mg-label">免疫时长</text>
            <text class="mg-val">{{ detail.duration }}</text>
          </view>
          <view class="mg-item">
            <text class="mg-label">疫苗厂家</text>
            <text class="mg-val">{{ detail.manufacturer }}</text>
          </view>
        </view>
      </view>

      <!-- 接种说明 -->
      <view class="section-card">
        <text class="section-head">接种说明</text>
        <view class="desc-item" v-for="(d, i) in detail.descList" :key="i">
          <text class="desc-dot">•</text>
          <text class="desc-text">{{ d }}</text>
        </view>
      </view>

      <!-- 接种流程 -->
      <view class="section-card">
        <text class="section-head">接种流程</text>
        <view class="steps">
          <view class="step" v-for="(s, i) in detail.steps" :key="i">
            <view class="step-circle">{{ i + 1 }}</view>
            <view class="step-line" v-if="i < detail.steps.length - 1" />
            <view class="step-content">
              <text class="step-title">{{ s.title }}</text>
              <text class="step-desc">{{ s.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="safe-bottom" />
    </view>

    <view class="bottom-bar">
      <view class="btn-confirm" @tap="bookVaccine">立即预约接种</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({ id: String })

const detail = ref({
  name: '犬六联疫苗',
  subTitle: '广谱保护，全面覆盖6种犬类常见传染病',
  price: 128,
  petType: '犬类（≥8周龄）',
  cycle: '首免间隔3~4周连续接种3次，之后每年补种1次',
  duration: '12个月',
  manufacturer: '英特威/美瑞华进口',
  diseases: ['犬瘟热', '细小病毒', '副流感', '腺病毒Ⅱ型', '传染性肝炎', '钩端螺旋体'],
  descList: [
    '接种前需进行基础健康检查，确保体温正常',
    '首次免疫建议8~12周龄开始，共接种3针',
    '接种后留院观察30分钟，防止过敏反应',
    '接种后72小时内避免洗澡和剧烈运动',
  ],
  steps: [
    { title: '在线预约', desc: '选择时间段完成预约，到院凭预约码取号' },
    { title: '健康检查', desc: '医生对宠物进行体温、心肺等基础检查' },
    { title: '注射疫苗', desc: '由持证兽医师完成皮下注射' },
    { title: '观察留院', desc: '注射后留院观察30分钟，确认无不良反应' },
    { title: '领取证书', desc: '完成接种后领取疫苗接种记录本' },
  ]
})

const goBack = () => uni.navigateBack()
const bookVaccine = () => {
  uni.showToast({ title: '预约成功！', icon: 'success' })
}

onMounted(() => {})
</script>

<style lang="scss" scoped>
.page { background: #F5F5F5; min-height: 100vh; }

.header-img-wrap {
  position: relative; height: 400rpx;
  .header-bg {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #FF8A65, #E64A19);
    display: flex; align-items: center; justify-content: center;
    .header-emoji { font-size: 160rpx; }
  }
  .header-overlay { 
    position: absolute; top: 0; left: 0; right: 0; 
    padding-top: var(--status-bar-height);
    height: 88rpx;
    display: flex;
    align-items: center;
    padding-left: 32rpx;
    .back-btn { width: 72rpx; height: 72rpx; border-radius: 50%; background: rgba(0,0,0,0.2);
      backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
  }
}

.detail-body { padding: 24rpx; margin-top: -40rpx; }

.info-card {
  background: #fff; border-radius: 24rpx; padding: 32rpx; margin-bottom: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.08);
  .info-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx;
    .vaccine-name { font-size: 36rpx; font-weight: 800; color: #333; }
    .price-badge { background: linear-gradient(135deg, #FF8A65, #E64A19); color: #fff;
      font-size: 30rpx; font-weight: 800; padding: 10rpx 28rpx; border-radius: 100rpx; }
  }
  .vaccine-sub { font-size: 26rpx; color: #999; display: block; margin-bottom: 20rpx; }
  .diseases-row { display: flex; align-items: flex-start; gap: 12rpx; margin-bottom: 24rpx; flex-wrap: wrap;
    .d-label { font-size: 26rpx; color: #555; font-weight: 600; flex-shrink: 0; }
    .disease-tags { display: flex; flex-wrap: wrap; gap: 8rpx; }
    .dtag { background: rgba(255,112,67,0.1); color: #FF7043; font-size: 20rpx; padding: 4rpx 14rpx; border-radius: 100rpx; }
  }
  .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx;
    background: #FFF8F5; border-radius: 16rpx; padding: 20rpx; }
  .mg-item { display: flex; flex-direction: column; gap: 6rpx;
    .mg-label { font-size: 22rpx; color: #999; }
    .mg-val { font-size: 26rpx; font-weight: 600; color: #333; }
  }
}

.section-card {
  background: #fff; border-radius: 20rpx; padding: 28rpx; margin-bottom: 20rpx;
  .section-head { font-size: 30rpx; font-weight: 700; color: #333; display: block; margin-bottom: 24rpx;
    padding-left: 16rpx; border-left: 6rpx solid #FF7043; }
  .desc-item { display: flex; gap: 12rpx; margin-bottom: 14rpx;
    .desc-dot { color: #FF7043; font-size: 28rpx; }
    .desc-text { font-size: 26rpx; color: #555; line-height: 1.6; }
  }
}

.steps { display: flex; flex-direction: column; }
.step { display: flex; align-items: flex-start; gap: 20rpx; position: relative; padding-bottom: 32rpx;
  .step-circle { width: 56rpx; height: 56rpx; border-radius: 50%; background: linear-gradient(135deg, #FF8A65, #E64A19);
    color: #fff; font-size: 26rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .step-line { position: absolute; left: 28rpx; top: 56rpx; width: 2rpx; height: calc(100% - 56rpx);
    background: linear-gradient(180deg, #FF7043, transparent); }
  .step-content { flex: 1; padding-top: 8rpx;
    .step-title { font-size: 28rpx; font-weight: 700; color: #333; display: block; margin-bottom: 6rpx; }
    .step-desc { font-size: 24rpx; color: #999; display: block; }
  }
}

.safe-bottom { height: 160rpx; }
.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 20rpx 32rpx calc(env(safe-area-inset-bottom) + 20rpx);
  background: #fff; box-shadow: 0 -4rpx 24rpx rgba(0,0,0,0.06);
  .btn-confirm { height: 96rpx; border-radius: 100rpx;
    background: linear-gradient(135deg, #FF8A65, #E64A19); color: #fff;
    font-size: 32rpx; font-weight: 700; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(255,112,67,0.4); }
}
</style>
