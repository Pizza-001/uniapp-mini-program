"use strict";
const common_vendor = require("../../common/vendor.js");
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
    const info = common_vendor.ref({
      status: "0",
      reservationId: "",
      type: "",
      date: "",
      time: "",
      petName: "",
      petBread: "",
      doctorName: "",
      symptom: ""
    });
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const fetchDetail = async () => {
      if (!props.id)
        return;
      try {
        const res = await common_vendor.index.$http.get(`/hospital/reservation/${props.id}`);
        info.value = res.data;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/appointment/detail.vue:93", "获取详情失败", e);
      }
    };
    const formatStatus = (status) => {
      const map = { "0": "预约成功", "1": "已就诊", "2": "已取消" };
      return map[status] || "未知状态";
    };
    const handleCancel = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消预约吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await common_vendor.index.$http.delete(`/hospital/reservation/${props.id}`);
              common_vendor.index.showToast({ title: "取消成功" });
              fetchDetail();
            } catch (e) {
            }
          }
        }
      });
    };
    common_vendor.onMounted(() => {
      info.value = {
        status: "0",
        reservationId: props.id || "RE202404210001",
        type: "专家门诊",
        date: "2024-04-22",
        time: "14:30",
        petName: "小七",
        petBread: "金毛",
        doctorName: "张医生",
        symptom: "食欲不振，精神萎靡"
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "left",
          size: "20",
          color: "#fff"
        }),
        b: common_vendor.o(goBack, "30"),
        c: common_vendor.p({
          type: "checkbox-filled",
          size: "48",
          color: "#fff"
        }),
        d: common_vendor.t(formatStatus(info.value.status)),
        e: common_vendor.n("status-" + info.value.status),
        f: common_vendor.t(info.value.reservationId),
        g: common_vendor.t(info.value.type),
        h: common_vendor.t(info.value.date),
        i: common_vendor.t(info.value.time),
        j: common_vendor.t(info.value.petName),
        k: common_vendor.t(info.value.petBread || "未知"),
        l: info.value.doctorName
      }, info.value.doctorName ? {
        m: common_vendor.t(info.value.doctorName)
      } : {}, {
        n: info.value.symptom
      }, info.value.symptom ? {
        o: common_vendor.t(info.value.symptom)
      } : {}, {
        p: info.value.status === "0"
      }, info.value.status === "0" ? {
        q: common_vendor.o(handleCancel, "94")
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/appointment/detail.js.map
