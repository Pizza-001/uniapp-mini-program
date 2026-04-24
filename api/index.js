// 基础请求配置
export const BASE_URL = 'http://localhost:8088'

// 导出原始 request 供特殊情况使用
export const request = (options) => {
  const token = uni.getStorageSync('token')
  const header = {
    'Content-Type': 'application/json',
    ...options.header
  }
  if (token) {
    header['Authorization'] = 'Bearer ' + token
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      success: (res) => {
        // 处理响应
        if (res.statusCode === 200) {
          // RuoYi 返回结构通常包含 code 字段
          const result = res.data
          if (result.code === 401) {
            uni.removeStorageSync('token')
            uni.navigateTo({ url: '/pages/login/index' })
            reject(result)
          } else if (result.code === 500) {
            uni.showToast({ title: result.msg || '系统预期外错误', icon: 'none' })
            reject(result)
          } else {
            resolve(result)
          }
        } else {
          // 如果是非 200 HTTP 状态码，尝试提取 body 中的错误消息
          const errData = res.data || {}
          const errorMsg = errData.msg || '服务器异常: ' + res.statusCode
          uni.showToast({ title: errorMsg, icon: 'none' })
          reject(errData.msg ? errData : { msg: errorMsg, ...res })
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请检查网络连接', icon: 'none' })
        reject(err)
      }
    })
  })
}

// 图片地址处理工具
export const formatImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return BASE_URL + url
}

// 宠物模块
export const petApi = {
  getMyPets: (params) => request({ url: '/hospital/pet/myPets', data: params }),
  addPet: (data) => request({ url: '/hospital/pet/myPets', method: 'POST', data }),
  updatePet: (data) => request({ url: '/hospital/pet/myPets', method: 'PUT', data }),
  deletePet: (id) => request({ url: `/hospital/pet/${id}`, method: 'DELETE' })
}

// 认证模块 (RuoYi 标准接口)
export const authApi = {
  login: (data) => request({ url: '/login', method: 'POST', data }),
  smsLogin: (data) => request({ url: '/smsLogin', method: 'POST', data }),
  register: (data) => request({ url: '/register', method: 'POST', data }),
  getCaptcha: () => request({ url: '/captchaImage' }),
  getSmsCode: (data) => request({ url: '/sms/code', method: 'POST', data }),
  logout: () => request({ url: '/logout', method: 'POST' })
}

// 用户模块
export const userApi = {
  getInfo: () => request({ url: `/getInfo?t=${new Date().getTime()}` }),
  getProfile: () => request({ url: `/system/user/profile?t=${new Date().getTime()}` }),
  updateProfile: (data) => request({ url: '/system/user/profile', method: 'PUT', data }),
  verifyRealName: (data) => request({ url: '/system/user/profile/verify', method: 'PUT', data }),
  uploadAvatar: (filePath) => {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync('token')
      uni.uploadFile({
        url: BASE_URL + '/system/user/profile/avatar',
        filePath: filePath,
        name: 'avatarfile',
        header: { 'Authorization': 'Bearer ' + token },
        success: (res) => resolve(JSON.parse(res.data)),
        fail: (err) => reject(err)
      })
    })
  }
}

// 会员与资金模块
export const memberApi = {
  getMemberInfo: () => request({ url: '/hospital/member/info' }),
  recharge: (data) => request({ url: '/hospital/member/recharge', method: 'POST', data }),
  getPointsRecords: () => request({ url: '/hospital/member/pointsRecords' })
}

// 医院业务模块
export const hospitalApi = {
  getKnowledge: (params) => request({ url: '/hospital/knowledge/list', data: params }),
  getVaccines: (params) => request({ url: '/hospital/vaccine/list', data: params }),
  getReservations: () => request({ url: '/hospital/reservation/selectMyReservationList' })
}

// 首页模块
export const homeApi = {
  getBanner: () => request({ url: '/hospital/banner/list' }),
  getQuickNav: () => request({ url: '/home/nav' }),
  getPetArch: () => request({ url: '/pet/arch' })
}

// 发现模块
export const discoveryApi = {
  getFeed: (params) => request({ url: '/discovery/list', data: params }),
  getDetail: (id) => request({ url: `/discovery/detail/${id}` })
}

// 药房模块
export const pharmacyApi = {
  getCategories: () => request({ url: '/hospital/medicine/categories' }),
  getProducts: (params) => request({ url: '/hospital/medicine/list', data: params }),
  getDetail: (id) => request({ url: `/hospital/medicine/${id}` })
}

// 医疗记录模块
export const recordApi = {
  getMyRecords: () => request({ url: '/hospital/record/myRecord' })
}

// 结算与支付模块
export const billingApi = {
  createBilling: (data) => request({ url: '/hospital/billing', method: 'POST', data }),
  getCoupons: () => request({ url: '/hospital/billing/myCoupons' }),
  getMyPending: () => request({ url: '/hospital/billing/myPending' }),
  payBill: (id) => request({ url: `/hospital/billing/pay/${id}`, method: 'POST' }),
  settle: (data) => request({ url: '/hospital/billing/settle', method: 'POST', data }),
  getHistory: (params) => request({ url: '/hospital/billing/list', data: params }),
  getDetail: (id) => request({ url: `/hospital/billing/${id}` })
}

// 预约模块
export const apptApi = {
  getDoctors: (params) => request({ url: '/hospital/doctor/list', data: params }),
  submitOrder: (data) => request({ url: '/hospital/reservation', method: 'POST', data })
}

// AI 模块
export const aiApi = {
  // SSE 流式对话接口通常直接使用 uni.request，这里定义基础路径
  chatSse: (memoryId, message) => `/ai/chat/sse?memoryId=${memoryId}&message=${encodeURIComponent(message)}`
}

// 积分商城模块
export const pointsMallApi = {
  getProducts: (params) => request({ url: '/hospital/points-mall/list', data: params }),
  exchange: (productId) => request({ url: `/hospital/points-mall/exchange/${productId}`, method: 'POST' }),
  getRecords: () => request({ url: '/hospital/points-mall/exchange/list' })
}
