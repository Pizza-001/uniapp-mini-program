"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
const _sfc_main = {
  __name: "detail",
  props: {
    id: String
  },
  setup(__props) {
    const props = __props;
    const detail = common_vendor.ref({
      title: "加载中...",
      content: "",
      videoUrl: "",
      createTime: ""
    });
    const fetchDetail = async () => {
      if (!props.id)
        return;
      try {
        const res = await api_index.request({
          url: `/hospital/knowledge/${props.id}`
        });
        detail.value = res;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/knowledge/detail.vue:63", "获取详情失败", e);
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    common_vendor.onMounted(() => {
      fetchDetail();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "left",
          size: "24",
          color: "#fff"
        }),
        b: common_vendor.o(goBack, "30"),
        c: common_vendor.t(detail.value.title),
        d: common_vendor.t(detail.value.createTime || "2026-04-21"),
        e: detail.value.videoUrl
      }, detail.value.videoUrl ? {
        f: common_vendor.unref(api_index.formatImageUrl)(detail.value.videoUrl)
      } : {}, {
        g: detail.value.content
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/knowledge/detail.js.map
