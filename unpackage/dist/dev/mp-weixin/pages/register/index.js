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
    const loading = common_vendor.ref(false);
    const agreed = common_vendor.ref(false);
    const captchaEnabled = common_vendor.ref(true);
    const captchaImg = common_vendor.ref("");
    const form = common_vendor.reactive({
      username: "",
      password: "",
      confirmPassword: "",
      code: "",
      uuid: ""
    });
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const toggleAgreement = () => {
      agreed.value = !agreed.value;
    };
    const getCaptcha = async () => {
      try {
        const res = await api_index.authApi.getCaptcha();
        captchaImg.value = "data:image/gif;base64," + res.img;
        form.uuid = res.uuid;
        captchaEnabled.value = res.captchaEnabled !== false;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/register/index.vue:123", "获取验证码失败", e);
      }
    };
    const handleRegister = async () => {
      if (!form.username || !form.password) {
        return common_vendor.index.showToast({ title: "请完整填写", icon: "none" });
      }
      if (form.password !== form.confirmPassword) {
        return common_vendor.index.showToast({ title: "两次密码不一致", icon: "none" });
      }
      if (captchaEnabled.value && !form.code) {
        return common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
      }
      if (!agreed.value) {
        return common_vendor.index.showToast({ title: "请先同意协议", icon: "none" });
      }
      loading.value = true;
      try {
        await api_index.authApi.register({
          username: form.username,
          password: form.password,
          code: form.code,
          uuid: form.uuid
        });
        common_vendor.index.showToast({ title: "注册成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.redirectTo({ url: "/pages/login/index" });
        }, 1500);
      } catch (e) {
        getCaptcha();
      } finally {
        loading.value = false;
      }
    };
    common_vendor.onMounted(() => {
      getCaptcha();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "left",
          size: "24",
          color: "#333"
        }),
        b: common_vendor.o(goBack, "4c"),
        c: common_vendor.p({
          type: "person",
          size: "18",
          color: "#FF7043"
        }),
        d: form.username,
        e: common_vendor.o(($event) => form.username = $event.detail.value, "78"),
        f: common_vendor.p({
          type: "locked",
          size: "18",
          color: "#FF7043"
        }),
        g: form.password,
        h: common_vendor.o(($event) => form.password = $event.detail.value, "7e"),
        i: common_vendor.p({
          type: "locked-filled",
          size: "18",
          color: "#FF7043"
        }),
        j: form.confirmPassword,
        k: common_vendor.o(($event) => form.confirmPassword = $event.detail.value, "fc"),
        l: captchaEnabled.value
      }, captchaEnabled.value ? {
        m: common_vendor.p({
          type: "compose",
          size: "18",
          color: "#FF7043"
        }),
        n: form.code,
        o: common_vendor.o(($event) => form.code = $event.detail.value, "a5"),
        p: captchaImg.value,
        q: common_vendor.o(getCaptcha, "31")
      } : {}, {
        r: loading.value,
        s: loading.value,
        t: common_vendor.o(handleRegister, "bf"),
        v: common_vendor.o(goBack, "2a"),
        w: agreed.value,
        x: common_vendor.o(toggleAgreement, "71")
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/register/index.js.map
