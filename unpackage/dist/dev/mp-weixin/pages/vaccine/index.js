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
    const vaccines = common_vendor.ref([]);
    const fetchVaccines = async () => {
      try {
        const res = await api_index.hospitalApi.getVaccines({ pageNum: 1, pageSize: 50 });
        vaccines.value = res;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/vaccine/index.vue:66", "获取疫苗列表失败", e);
      }
    };
    const handleBook = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/appointment/index?type=疫苗预约&vaccineId=${item.vaccineId}&vaccineName=${item.name}`
      });
    };
    common_vendor.onMounted(() => {
      fetchVaccines();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(vaccines.value, (item, k0, i0) => {
          return {
            a: "1568d1aa-0-" + i0,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.description || "预防多种宠物常见传染病"),
            d: common_vendor.t(199 + item.vaccineId * 20),
            e: common_vendor.o(($event) => handleBook(item), item.vaccineId),
            f: item.vaccineId
          };
        }),
        b: common_vendor.p({
          type: "pyramid",
          size: "30",
          color: "#42A5F5"
        }),
        c: common_vendor.p({
          type: "info",
          size: "18",
          color: "#FF7043"
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/vaccine/index.js.map
