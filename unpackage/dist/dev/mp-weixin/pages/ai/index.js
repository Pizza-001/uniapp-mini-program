"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_index = require("../../api/index.js");
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
const userAvatar = "https://dummyimage.com/100x100/ff7043/fff&text=Me";
const assistantAvatar = "/static/images/ai-pet.png";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const messages = common_vendor.ref([]);
    const inputMsg = common_vendor.ref("");
    const scrollTop = common_vendor.ref(0);
    const keyboardHeight = common_vendor.ref(0);
    const loading = common_vendor.ref(false);
    const scrollToBottom = () => {
      common_vendor.nextTick$1(() => {
        scrollTop.value += 1e3;
      });
    };
    const handleSend = async () => {
      if (!inputMsg.value.trim() || loading.value)
        return;
      const userContent = inputMsg.value.trim();
      messages.value.push({ role: "user", content: userContent });
      inputMsg.value = "";
      scrollToBottom();
      const assistantMsg = { role: "assistant", content: "", loading: true };
      messages.value.push(assistantMsg);
      loading.value = true;
      try {
        const token = common_vendor.index.getStorageSync("token");
        const requestUrl = `${api_index.BASE_URL}/ai/chat/sse?memoryId=123&message=${encodeURIComponent(userContent)}`;
        common_vendor.index.request({
          url: requestUrl,
          method: "GET",
          header: {
            "Authorization": "Bearer " + token
          },
          success: (res) => {
            assistantMsg.loading = false;
            assistantMsg.content = typeof res.data === "string" ? res.data : "分析完成，建议您带宠物进行专业检查。";
            scrollToBottom();
          },
          fail: () => {
            assistantMsg.loading = false;
            assistantMsg.content = "抱歉，系统繁忙，请稍后再试。";
          },
          complete: () => {
            loading.value = false;
          }
        });
      } catch (e) {
        assistantMsg.loading = false;
        loading.value = false;
      }
    };
    common_vendor.onMounted(() => {
      scrollToBottom();
      common_vendor.index.onKeyboardHeightChange((res) => {
        keyboardHeight.value = res.height;
        if (res.height > 0)
          scrollToBottom();
      });
    });
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$4,
        b: common_vendor.f(messages.value, (msg, index, i0) => {
          return common_vendor.e({
            a: msg.role === "user" ? userAvatar : assistantAvatar,
            b: !msg.loading
          }, !msg.loading ? {
            c: common_vendor.t(msg.content)
          } : {}, {
            d: index,
            e: common_vendor.n(msg.role)
          });
        }),
        c: scrollTop.value,
        d: inputMsg.value,
        e: common_vendor.o(($event) => inputMsg.value = $event.detail.value, "df"),
        f: common_vendor.p({
          type: "paperplane-filled",
          size: "24",
          color: "#fff"
        }),
        g: inputMsg.value.trim() ? 1 : "",
        h: common_vendor.o(handleSend, "93"),
        i: keyboardHeight.value + "px"
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/ai/index.js.map
