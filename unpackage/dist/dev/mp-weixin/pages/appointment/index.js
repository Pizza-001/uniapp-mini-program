"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const activeTab = common_vendor.ref(0);
    const tabs = ["医师挂号", "待缴费单", "历史记录"];
    const doctors = common_vendor.ref([
      { id: 1, name: "张远航", title: "主任医师", dept: "内科/全科", exp: 12, fee: 50, rate: 99, status: "online", avatar: "/static/icons/profile.png" },
      { id: 2, name: "李思思", title: "主治医师", dept: "猫科/皮肤科", exp: 8, fee: 35, rate: 98, status: "online", avatar: "/static/icons/profile.png" },
      { id: 3, name: "陈医生", title: "医师", dept: "牙科/眼科", exp: 5, fee: 20, rate: 95, status: "busy", avatar: "/static/icons/profile.png" },
      { id: 4, name: "王院长", title: "高级顾问", dept: "骨科/复杂手术", exp: 20, fee: 100, rate: 100, status: "online", avatar: "/static/icons/profile.png" }
    ]);
    const handleBook = (doc) => {
      if (doc.status === "busy")
        return;
      common_vendor.index.showLoading({ title: "预约中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "挂号成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: `/pages/appointment/detail?id=RE${Date.now()}`
          });
        }, 1500);
      }, 1e3);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(tabs, (tab, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab),
            b: activeTab.value === index
          }, activeTab.value === index ? {} : {}, {
            c: tab,
            d: activeTab.value === index ? 1 : "",
            e: common_vendor.o(($event) => activeTab.value = index, tab)
          });
        }),
        b: activeTab.value === 0
      }, activeTab.value === 0 ? {
        c: common_vendor.f(doctors.value, (doc, k0, i0) => {
          return {
            a: doc.avatar,
            b: common_vendor.t(doc.name),
            c: common_vendor.t(doc.title),
            d: common_vendor.t(doc.status === "online" ? "出诊中" : "忙碌"),
            e: common_vendor.n(doc.status),
            f: common_vendor.t(doc.dept),
            g: common_vendor.t(doc.exp),
            h: common_vendor.t(doc.rate),
            i: common_vendor.t(doc.fee),
            j: common_vendor.t(doc.status === "online" ? "立即挂号" : "暂不可约"),
            k: doc.status === "busy" ? 1 : "",
            l: common_vendor.o(($event) => handleBook(doc), doc.id),
            m: doc.id
          };
        })
      } : {}, {
        d: activeTab.value === 1
      }, activeTab.value === 1 ? {
        e: common_assets._imports_0$3
      } : {}, {
        f: activeTab.value === 2
      }, activeTab.value === 2 ? {
        g: common_assets._imports_1$1
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3746ec96"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/appointment/index.js.map
