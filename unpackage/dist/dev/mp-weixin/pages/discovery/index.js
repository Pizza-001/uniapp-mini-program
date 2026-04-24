"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const statusBarHeight = common_vendor.ref(0);
    const keyword = common_vendor.ref("");
    const activeTab = common_vendor.ref("全部");
    const tabs = ["全部", "百科", "活动", "服务", "科普"];
    const list = common_vendor.ref([
      { id: 1, title: "夏季驱虫全攻略：让毛孩子远离寄生虫困扰", type: "wiki", typeText: "百科", views: "2.5w", likes: "1.2k", color: "#5C6BC0", icon: "info" },
      { id: 2, title: "春季洗护专场优惠券限时领取", type: "activity", typeText: "活动", views: "8.2k", likes: "534", color: "#42A5F5", icon: "gift" },
      { id: 3, title: "附近中心医院名医在线坐诊，扫码预约", type: "service", typeText: "服务", views: "1.1w", likes: "890", color: "#66BB6A", icon: "staff" },
      { id: 4, title: "新手养宠必看：如何挑选高性价比猫粮", type: "know", typeText: "科普", views: "3.4w", likes: "2.1k", color: "#FFA726", icon: "help" }
    ]);
    const filteredList = common_vendor.computed(() => {
      return list.value.filter((item) => {
        const matchTab = activeTab.value === "全部" || item.typeText === activeTab.value;
        const matchKey = !keyword.value || item.title.includes(keyword.value);
        return matchTab && matchKey;
      });
    });
    common_vendor.onMounted(() => {
      try {
        statusBarHeight.value = common_vendor.index.getSystemInfoSync().statusBarHeight || 0;
      } catch (e) {
        statusBarHeight.value = 20;
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "search",
          size: "18",
          color: "#B2BEC3"
        }),
        b: keyword.value,
        c: common_vendor.o(($event) => keyword.value = $event.detail.value, "93"),
        d: statusBarHeight.value + "px",
        e: common_vendor.f(tabs, (tab, k0, i0) => {
          return {
            a: common_vendor.t(tab),
            b: tab,
            c: activeTab.value === tab ? 1 : "",
            d: common_vendor.o(($event) => activeTab.value = tab, tab)
          };
        }),
        f: common_vendor.f(filteredList.value, (item, k0, i0) => {
          return {
            a: "4548b25e-1-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "48",
              color: "rgba(255,255,255,0.4)"
            }),
            c: item.color,
            d: common_vendor.t(item.typeText),
            e: common_vendor.n(item.type),
            f: common_vendor.t(item.title),
            g: common_vendor.t(item.views),
            h: common_vendor.t(item.likes),
            i: "4548b25e-2-" + i0,
            j: item.id
          };
        }),
        g: common_vendor.p({
          type: "more-filled",
          size: "18",
          color: "#B2BEC3"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4548b25e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/discovery/index.js.map
