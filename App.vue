<script>
export default {
  onLaunch: function() {
    console.log('宠爱之城 3.0 启动成功')
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
/* 每个页面公共css */

// 基础样式
page {
  background-color: #F8FAFC;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #2D3436;
  font-size: 28rpx;
  line-height: 1.5;
}

// 全局卡片组件基类
.card-container {
  background: #FFFFFF;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 24rpx rgba(92, 107, 192, 0.08);
  padding: 24rpx;
  margin-bottom: 24rpx;
}

// 按钮点击反馈
.btn-hover {
  opacity: 0.8;
  transform: scale(0.98);
}

// 隐藏滚动条
::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}
</style>
