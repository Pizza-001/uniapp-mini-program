"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_index = require("../../api/index.js");
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const statusBarHeight = common_vendor.ref(0);
    const menuButtonWidth = common_vendor.ref(0);
    const userInfo = common_vendor.ref(null);
    const navList = [
      { label: "挂号预约", uniIcon: "calendar-filled", color: "#5C6BC0", bg: "#E8EAF6", path: "/pages/appointment/index" },
      { label: "诊疗报告", uniIcon: "info-filled", color: "#42A5F5", bg: "#E3F2FD", path: "#" },
      { label: "排队缴费", uniIcon: "wallet-filled", color: "#66BB6A", bg: "#E8F5E9", path: "#" },
      { label: "在线购药", uniIcon: "shop-filled", color: "#FFA726", bg: "#FFF3E0", path: "/pages/pharmacy/index" }
    ];
    const history = [
      { date: "2024-04-15 10:30", typeText: "常规体检", desc: "宠物年度健康体检计划", doctor: "张远航 主任医师", color: "#5C6BC0", bg: "#E8EAF6" },
      { date: "2024-03-20 14:00", typeText: "疫苗接种", desc: "犬六联疫苗 + 狂犬疫苗", doctor: "李思思 医师", color: "#66BB6A", bg: "#E8F5E9" }
    ];
    const handleNav = (path) => {
      if (path === "#") {
        common_vendor.index.showToast({ title: "模块开发中", icon: "none" });
        return;
      }
      if (path.includes("pharmacy") || path.includes("appointment")) {
        common_vendor.index.switchTab({ url: path });
      } else {
        common_vendor.index.navigateTo({ url: path });
      }
    };
    const getUserInfo = async () => {
      try {
        const res = await api_index.userApi.getInfo();
        userInfo.value = res.user;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:128", "获取用户信息失败", e);
      }
    };
    common_vendor.onMounted(() => {
      const sys = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = sys.statusBarHeight;
      const menu = common_vendor.index.getMenuButtonBoundingClientRect();
      menuButtonWidth.value = sys.windowWidth - menu.left + 10;
      if (common_vendor.index.getStorageSync("token")) {
        getUserInfo();
      }
    });
    return (_ctx, _cache) => {
      return {
        a: statusBarHeight.value + "px",
        b: common_assets._imports_0,
        c: common_vendor.t(userInfo.value ? userInfo.value.nickName || userInfo.value.userName : "请先登录"),
        d: common_vendor.p({
          type: "location-filled",
          size: "14",
          color: "#fff"
        }),
        e: common_vendor.p({
          type: "bottom",
          size: "10",
          color: "#fff"
        }),
        f: common_vendor.o((...args) => _ctx.switchHospital && _ctx.switchHospital(...args), "15"),
        g: menuButtonWidth.value + "px",
        h: common_vendor.p({
          type: "search",
          size: "18",
          color: "rgba(255,255,255,0.6)"
        }),
        i: common_vendor.f(navList, (nav, k0, i0) => {
          return {
            a: "1cf27b2a-3-" + i0,
            b: common_vendor.p({
              type: nav.uniIcon,
              size: "28",
              color: nav.color
            }),
            c: nav.bg,
            d: common_vendor.t(nav.label),
            e: nav.label,
            f: common_vendor.o(($event) => handleNav(nav.path), nav.label)
          };
        }),
        j: common_vendor.p({
          type: "paperplane",
          size: "40",
          color: "#C5CAE9"
        }),
        k: common_vendor.p({
          type: "plusempty",
          size: "16",
          color: "#fff"
        }),
        l: common_vendor.o((...args) => _ctx.addPet && _ctx.addPet(...args), "eb"),
        m: common_vendor.p({
          type: "right",
          size: "12",
          color: "#B2BEC3"
        }),
        n: common_vendor.f(history, (item, index, i0) => {
          return {
            a: item.color,
            b: common_vendor.t(item.date),
            c: common_vendor.t(item.typeText),
            d: item.bg,
            e: item.color,
            f: common_vendor.t(item.desc),
            g: common_vendor.t(item.doctor),
            h: index
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
