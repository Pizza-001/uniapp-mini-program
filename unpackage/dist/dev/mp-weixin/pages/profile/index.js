"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const statusBarHeight = common_vendor.ref(0);
    const userInfo = common_vendor.ref(null);
    const assets = [
      { label: "账户余额", val: "¥88.50" },
      { label: "我的积分", val: "1,250" },
      { label: "优惠券", val: "3" }
    ];
    const functions = [
      { label: "宠物档案", icon: "person-filled", color: "#5C6BC0", bg: "#E8EAF6" },
      { label: "积分商城", icon: "shop-filled", color: "#66BB6A", bg: "#E8F5E9" },
      { label: "充值中心", icon: "wallet-filled", color: "#42A5F5", bg: "#E3F2FD" },
      { label: "我的收藏", icon: "heart-filled", color: "#FF5252", bg: "#FFEBEE" }
    ];
    const menuList = [
      { label: "就诊人管理", color: "#5C6BC0", val: "" },
      { label: "地址管理", color: "#42A5F5", val: "" },
      { label: "在线客服", color: "#66BB6A", val: "9:00-21:00" },
      { label: "设置", color: "#909399", val: "" }
    ];
    const getUserInfo = async () => {
      try {
        const res = await api_index.userApi.getInfo();
        userInfo.value = res.user;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/profile/index.vue:126", "获取用户信息失败", e);
      }
    };
    const handleLogout = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_index.authApi.logout();
            } catch (e) {
            }
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.reLaunch({ url: "/pages/login/index" });
          }
        }
      });
    };
    common_vendor.onMounted(() => {
      statusBarHeight.value = common_vendor.index.getSystemInfoSync().statusBarHeight;
      if (common_vendor.index.getStorageSync("token")) {
        getUserInfo();
      }
    });
    return (_ctx, _cache) => {
      return {
        a: userInfo.value && userInfo.value.avatar ? common_vendor.unref(api_index.BASE_URL) + userInfo.value.avatar : "/static/icons/profile.png",
        b: common_vendor.t(userInfo.value ? userInfo.value.nickName || userInfo.value.userName : "点击登录"),
        c: common_vendor.t(userInfo.value ? "全城宠爱，智慧医疗" : "登录开启智慧宠医生活"),
        d: common_vendor.p({
          type: "gear-filled",
          size: "24",
          color: "#fff"
        }),
        e: common_vendor.p({
          type: "vip-filled",
          size: "20",
          color: "#FFD54F"
        }),
        f: statusBarHeight.value + "px",
        g: common_vendor.f(assets, (a, k0, i0) => {
          return {
            a: common_vendor.t(a.val),
            b: common_vendor.t(a.label),
            c: a.label
          };
        }),
        h: common_vendor.f(functions, (f, k0, i0) => {
          return {
            a: "201c0da5-2-" + i0,
            b: common_vendor.p({
              type: f.icon,
              size: "24",
              color: f.color
            }),
            c: f.bg,
            d: common_vendor.t(f.label),
            e: f.label
          };
        }),
        i: common_vendor.f(menuList, (m, i, i0) => {
          return common_vendor.e({
            a: m.color,
            b: common_vendor.t(m.label),
            c: m.val
          }, m.val ? {
            d: common_vendor.t(m.val)
          } : {}, {
            e: "201c0da5-3-" + i0,
            f: m.label
          });
        }),
        j: common_vendor.p({
          type: "right",
          size: "14",
          color: "#DCDFE6"
        }),
        k: common_vendor.o(handleLogout, "44")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/index.js.map
