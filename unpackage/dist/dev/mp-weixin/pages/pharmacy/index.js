"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const statusBarHeight = common_vendor.ref(0);
    const activeCat = common_vendor.ref(0);
    const cartCount = common_vendor.ref(0);
    const totalPrice = common_vendor.ref("0.00");
    const categories = ["热门推荐", "常规驱虫", "皮肤用药", "肠胃调理", "处方粮单"];
    const products = [
      { id: 1, name: "海乐妙 Milbemax", enName: "米尔贝肟", spec: "1片/盒", price: "45.00", isRx: true },
      { id: 2, name: "大宠爱 Revolution", enName: "赛拉菌素", spec: "3支/盒", price: "188.00", isRx: false },
      { id: 3, name: "博来恩 Broadline", enName: "非泼罗尼", spec: "0.9ml/支", price: "98.00", isRx: false },
      { id: 4, name: "莫比新 Mobicine", enName: "阿莫西林", spec: "50mg*10片", price: "68.00", isRx: true }
    ];
    const addToCart = (item) => {
      cartCount.value++;
      totalPrice.value = (parseFloat(totalPrice.value) + parseFloat(item.price)).toFixed(2);
      common_vendor.index.showToast({ title: "已加入待购清单", icon: "none" });
    };
    common_vendor.onMounted(() => {
      statusBarHeight.value = common_vendor.index.getSystemInfoSync().statusBarHeight;
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "18",
          color: "rgba(255,255,255,0.6)"
        }),
        b: statusBarHeight.value + "px",
        c: common_vendor.f(categories, (cat, index, i0) => {
          return common_vendor.e({
            a: activeCat.value === index
          }, activeCat.value === index ? {} : {}, {
            b: common_vendor.t(cat),
            c: cat,
            d: activeCat.value === index ? 1 : "",
            e: common_vendor.o(($event) => activeCat.value = index, cat)
          });
        }),
        d: common_vendor.t(categories[activeCat.value]),
        e: common_assets._imports_0$2,
        f: common_vendor.f(products, (item, k0, i0) => {
          return common_vendor.e({
            a: "58687a97-1-" + i0,
            b: item.isRx
          }, item.isRx ? {} : {}, {
            c: common_vendor.t(item.name),
            d: common_vendor.t(item.enName),
            e: common_vendor.t(item.spec),
            f: common_vendor.t(item.price),
            g: "58687a97-2-" + i0,
            h: common_vendor.o(($event) => addToCart(item), item.id),
            i: item.id
          });
        }),
        g: common_vendor.p({
          type: "medallion",
          size: "40",
          color: "#E8EAF6"
        }),
        h: common_vendor.p({
          type: "plus-filled",
          size: "24",
          color: "#5C6BC0"
        }),
        i: common_vendor.p({
          type: "cart-filled",
          size: "28",
          color: "#5C6BC0"
        }),
        j: cartCount.value > 0
      }, cartCount.value > 0 ? {
        k: common_vendor.t(cartCount.value)
      } : {}, {
        l: common_vendor.t(totalPrice.value),
        m: common_vendor.o((...args) => _ctx.goCheckout && _ctx.goCheckout(...args), "6f")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-58687a97"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/pharmacy/index.js.map
