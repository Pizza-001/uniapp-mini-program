"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const tabs = ["全部", "待就诊", "已完成", "已取消"];
    const currentTab = common_vendor.ref(0);
    const list = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const fetchList = async () => {
      loading.value = true;
      try {
        const res = await api_index.request({
          url: "/hospital/reservation/selectMyReservationList",
          method: "GET"
        });
        list.value = res || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/record/index.vue:89", "获取预约列表失败", e);
      } finally {
        loading.value = false;
      }
    };
    const onRefresh = async () => {
      refreshing.value = true;
      await fetchList();
      refreshing.value = false;
    };
    const handleTab = (index) => {
      currentTab.value = index;
    };
    const formatStatus = (status) => {
      const statusMap = {
        "0": "待就诊",
        "1": "已完成",
        "2": "已取消"
      };
      return statusMap[status] || "未知";
    };
    const handleCancel = (item) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消该预约吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_index.request({
                url: `/hospital/reservation/${item.reservationId}`,
                method: "DELETE"
              });
              common_vendor.index.showToast({ title: "已取消", icon: "success" });
              fetchList();
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/record/index.vue:129", "取消失败", e);
            }
          }
        }
      });
    };
    const goToBook = () => {
      common_vendor.index.switchTab({ url: "/pages/index/index" });
    };
    const goToDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/record/detail?id=${item.reservationId}`
      });
    };
    common_vendor.onMounted(() => {
      fetchList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(tabs, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: currentTab.value === index ? 1 : "",
            c: index,
            d: common_vendor.o(($event) => handleTab(index), index)
          };
        }),
        b: list.value.length === 0 && !loading.value
      }, list.value.length === 0 && !loading.value ? {
        c: common_vendor.o(goToBook, "23")
      } : {}, {
        d: common_vendor.f(list.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.type),
            b: common_vendor.n(item.type === "疫苗预约" ? "vaccine" : "normal"),
            c: common_vendor.t(formatStatus(item.status)),
            d: common_vendor.n("status-" + item.status),
            e: common_vendor.t(item.petName),
            f: common_vendor.t(item.petBread || "未知品种"),
            g: common_vendor.t(item.date),
            h: common_vendor.t(item.time),
            i: item.doctorName
          }, item.doctorName ? {
            j: common_vendor.t(item.doctorName)
          } : {}, {
            k: item.symptom
          }, item.symptom ? {
            l: common_vendor.t(item.symptom)
          } : {}, {
            m: item.status === "0"
          }, item.status === "0" ? {
            n: common_vendor.o(($event) => handleCancel(item), item.reservationId)
          } : {}, {
            o: common_vendor.o(($event) => goToDetail(item), item.reservationId),
            p: item.reservationId
          });
        }),
        e: refreshing.value,
        f: common_vendor.o(onRefresh, "b0")
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/record/index.js.map
