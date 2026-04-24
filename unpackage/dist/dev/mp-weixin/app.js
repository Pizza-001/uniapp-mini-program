"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/login/index.js";
  "./pages/register/index.js";
  "./pages/discovery/index.js";
  "./pages/pharmacy/index.js";
  "./pages/appointment/index.js";
  "./pages/appointment/detail.js";
  "./pages/profile/index.js";
  "./pages/record/index.js";
  "./pages/record/detail.js";
  "./pages/knowledge/index.js";
  "./pages/knowledge/detail.js";
  "./pages/ai/index.js";
  "./pages/vaccine/index.js";
  "./pages/vaccine/detail.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "宠爱之城 3.0 启动成功");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:10", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.use(common_vendor.createPinia());
  return {
    app,
    Pinia: common_vendor.Pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
