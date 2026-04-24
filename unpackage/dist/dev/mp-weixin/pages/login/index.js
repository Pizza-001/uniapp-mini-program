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
    const form = common_vendor.reactive({
      username: "",
      password: "",
      code: "",
      uuid: ""
    });
    const captchaEnabled = common_vendor.ref(true);
    const captchaImg = common_vendor.ref("");
    const isAgreed = common_vendor.ref(false);
    const getCaptcha = async () => {
      try {
        const res = await api_index.authApi.getCaptcha();
        captchaImg.value = "data:image/gif;base64," + res.img;
        form.uuid = res.uuid;
        captchaEnabled.value = res.captchaEnabled !== false;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:84", "获取验证码失败", e);
      }
    };
    const handleLogin = async () => {
      if (!isAgreed.value) {
        common_vendor.index.showToast({ title: "请先同意用户协议", icon: "none" });
        return;
      }
      if (!form.username || !form.password) {
        common_vendor.index.showToast({ title: "请输入用户名和密码", icon: "none" });
        return;
      }
      if (captchaEnabled.value && !form.code) {
        common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "登录中...", mask: true });
      try {
        const res = await api_index.authApi.login(form);
        common_vendor.index.setStorageSync("token", res.token);
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/index/index" });
        }, 1e3);
      } catch (e) {
        getCaptcha();
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const goToRegister = () => {
      common_vendor.index.navigateTo({ url: "/pages/register/index" });
    };
    const quickLogin = (type) => {
      common_vendor.index.showToast({ title: `${type === "weixin" ? "微信" : "支付宝"}快捷登录开发中`, icon: "none" });
    };
    common_vendor.onMounted(() => {
      getCaptcha();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$1,
        b: common_vendor.p({
          type: "person",
          size: "20",
          color: "#B2BEC3"
        }),
        c: form.username,
        d: common_vendor.o(($event) => form.username = $event.detail.value, "79"),
        e: common_vendor.p({
          type: "locked",
          size: "20",
          color: "#B2BEC3"
        }),
        f: form.password,
        g: common_vendor.o(($event) => form.password = $event.detail.value, "19"),
        h: captchaEnabled.value
      }, captchaEnabled.value ? {
        i: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#B2BEC3"
        }),
        j: form.code,
        k: common_vendor.o(($event) => form.code = $event.detail.value, "33"),
        l: captchaImg.value,
        m: common_vendor.o(getCaptcha, "d3")
      } : {}, {
        n: common_vendor.o(handleLogin, "1d"),
        o: common_vendor.o(goToRegister, "36"),
        p: isAgreed.value,
        q: common_vendor.o(($event) => isAgreed.value = !isAgreed.value, "c4"),
        r: common_assets._imports_1,
        s: common_vendor.o(($event) => quickLogin("weixin"), "89"),
        t: common_assets._imports_2,
        v: common_vendor.o(($event) => quickLogin("alipay"), "5c")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map
