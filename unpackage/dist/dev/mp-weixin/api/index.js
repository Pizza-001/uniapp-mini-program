"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://localhost:8080";
const request = (options) => {
  const token = common_vendor.index.getStorageSync("token");
  const header = {
    "Content-Type": "application/json",
    ...options.header
  };
  if (token) {
    header["Authorization"] = "Bearer " + token;
  }
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          const result = res.data;
          if (result.code === 401) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.navigateTo({ url: "/pages/login/index" });
            reject(result);
          } else if (result.code === 500) {
            common_vendor.index.showToast({ title: result.msg || "系统错误", icon: "none" });
            reject(result);
          } else {
            resolve(result);
          }
        } else {
          common_vendor.index.showToast({ title: "请求失败: " + res.statusCode, icon: "none" });
          reject(res);
        }
      },
      fail: (err) => {
        common_vendor.index.showToast({ title: "网络异常，请检查网络连接", icon: "none" });
        reject(err);
      }
    });
  });
};
const formatImageUrl = (url) => {
  if (!url)
    return "";
  if (url.startsWith("http"))
    return url;
  return BASE_URL + url;
};
const authApi = {
  login: (data) => request({ url: "/login", method: "POST", data }),
  register: (data) => request({ url: "/register", method: "POST", data }),
  getCaptcha: () => request({ url: "/captchaImage" }),
  logout: () => request({ url: "/logout", method: "POST" })
};
const userApi = {
  getInfo: () => request({ url: "/getInfo" }),
  getProfile: () => request({ url: "/system/user/profile" })
};
const hospitalApi = {
  getKnowledge: (params) => request({ url: "/hospital/knowledge/list", data: params }),
  getVaccines: (params) => request({ url: "/hospital/vaccine/list", data: params }),
  getReservations: () => request({ url: "/hospital/reservation/selectMyReservationList" })
};
exports.BASE_URL = BASE_URL;
exports.authApi = authApi;
exports.formatImageUrl = formatImageUrl;
exports.hospitalApi = hospitalApi;
exports.request = request;
exports.userApi = userApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/index.js.map
