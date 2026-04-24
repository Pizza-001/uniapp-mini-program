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
  getInfo: () => request({ url: '/getInfo' }),
  getProfile: () => request({ url: '/system/user/profile' })
}

// 会员与资金模块
export const memberApi = {
  getMemberInfo: () => request({ url: '/hospital/member/info' }),
  recharge: (data) => request({ url: '/hospital/member/recharge', method: 'POST', data })
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
  getCategories: () => request({ url: '/pharmacy/categories' }),
  getProducts: (params) => request({ url: '/pharmacy/products', data: params })
}

// 预约模块
export const apptApi = {
  getDoctors: (params) => request({ url: '/hospital/doctor/list', data: params }),
  submitOrder: (data) => request({ url: '/hospital/reservation', method: 'POST', data })
}
