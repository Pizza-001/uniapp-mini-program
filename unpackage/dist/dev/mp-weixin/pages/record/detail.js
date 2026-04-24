"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
const _sfc_main = {
  __name: "detail",
  props: { id: String },
  setup(__props) {
    const props = __props;
    const detail = common_vendor.ref({
      status: "0",
      statusClass: "pending",
      statusText: "加载中...",
      reservationId: "",
      type: "",
      petName: "",
      petBread: "",
      doctorName: "",
      date: "",
      time: "",
      createTime: ""
    });
    const statusEmoji = { pending: "⏰", done: "✅", cancelled: "❌" };
    const statusDesc = {
      pending: "请于预约时间前15分钟到达医院",
      done: "本次就诊已完成，感谢您的信任",
      cancelled: "该预约已取消"
    };
    const statusMap = {
      "0": { text: "预约成功", class: "pending" },
      "1": { text: "已完成", class: "done" },
      "2": { text: "已取消", class: "cancelled" }
    };
    const fetchDetail = async () => {
      if (!props.id)
        return;
      try {
        const res = await api_index.request({
          url: `/hospital/reservation/${props.id}`
        });
        const s = statusMap[res.status] || statusMap["0"];
        detail.value = {
          ...res,
          statusClass: s.class,
          statusText: s.text
        };
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/record/detail.vue:128", "加载记录详情失败:", e);
      }
    };
    const appointInfo = common_vendor.computed(() => [
      { label: "服务项目", value: detail.value.type || "门诊挂号" },
      { label: "就诊医生", value: detail.value.doctorName || "待定" },
      { label: "预约日期", value: detail.value.date || "" },
      { label: "预约时间", value: detail.value.time || "" }
    ]);
    const goBack = () => common_vendor.index.navigateBack();
    const cancelAppt = () => {
      common_vendor.index.showModal({
        title: "确认取消",
        content: "确定要取消该预约吗？",
        success: async ({ confirm }) => {
          if (confirm) {
            try {
              await api_index.request({
                url: `/hospital/reservation/${props.id}`,
                method: "DELETE"
              });
              common_vendor.index.showToast({ title: "已取消预约", icon: "success" });
              fetchDetail();
            } catch (e) {
            }
          }
        }
      });
    };
    const callDoctor = () => common_vendor.index.makePhoneCall({ phoneNumber: "020-88888888" });
    common_vendor.onMounted(() => {
      fetchDetail();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "left",
          size: "20",
          color: "#fff"
        }),
        b: common_vendor.o(goBack, "70"),
        c: common_vendor.t(statusEmoji[detail.value.statusClass]),
        d: common_vendor.t(detail.value.statusText),
        e: common_vendor.t(statusDesc[detail.value.statusClass]),
        f: common_vendor.n("status-bg-" + detail.value.statusClass),
        g: common_vendor.f(appointInfo.value, (row, k0, i0) => {
          return {
            a: common_vendor.t(row.label),
            b: common_vendor.t(row.value),
            c: row.label
          };
        }),
        h: common_vendor.t(detail.value.petName),
        i: common_vendor.t(detail.value.petBread || "宠物"),
        j: detail.value.type
      }, detail.value.type ? {
        k: common_vendor.t(detail.value.type)
      } : {}, {
        l: common_vendor.t(detail.value.reservationId),
        m: detail.value.createTime
      }, detail.value.createTime ? {
        n: common_vendor.t(detail.value.createTime)
      } : {}, {
        o: detail.value.status === "0"
      }, detail.value.status === "0" ? {
        p: common_vendor.o(cancelAppt, "19"),
        q: common_vendor.o(callDoctor, "c7")
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-58524edd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/record/detail.js.map
