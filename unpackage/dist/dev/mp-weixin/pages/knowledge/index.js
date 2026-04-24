"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
const defaultCover = "https://dummyimage.com/600x400/ff7043/fff&text=Knowledge";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const list = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const finished = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const currentCategory = common_vendor.ref(0);
    const categories = ["全部", "健康", "喂养", "行为", "美容", "疾病"];
    const queryParams = common_vendor.reactive({
      pageNum: 1,
      pageSize: 10,
      title: ""
    });
    const fetchData = async (reset = false) => {
      if (loading.value || finished.value && !reset)
        return;
      if (reset) {
        queryParams.pageNum = 1;
        list.value = [];
        finished.value = false;
      }
      loading.value = true;
      try {
        const res = await api_index.hospitalApi.getKnowledge(queryParams);
        if (res && res.length > 0) {
          list.value = [...list.value, ...res];
          if (res.length < queryParams.pageSize) {
            finished.value = true;
          } else {
            queryParams.pageNum++;
          }
        } else {
          finished.value = true;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/knowledge/index.vue:107", "获取知识列表失败", e);
      } finally {
        loading.value = false;
      }
    };
    const onRefresh = async () => {
      refreshing.value = true;
      await fetchData(true);
      refreshing.value = false;
    };
    const loadMore = () => {
      fetchData();
    };
    const handleSearch = () => {
      fetchData(true);
    };
    const handleCategory = (index) => {
      currentCategory.value = index;
      fetchData(true);
    };
    const goToDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/knowledge/detail?id=${item.knowledgeId}`
      });
    };
    const stripHtml = (html) => {
      if (!html)
        return "暂无简介";
      return html.replace(/<[^>]+>/g, "").substring(0, 50) + "...";
    };
    common_vendor.onMounted(() => {
      fetchData();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "18",
          color: "#999"
        }),
        b: common_vendor.o(handleSearch, "fd"),
        c: queryParams.title,
        d: common_vendor.o(($event) => queryParams.title = $event.detail.value, "d5"),
        e: common_vendor.f(categories, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: currentCategory.value === index ? 1 : "",
            c: index,
            d: common_vendor.o(($event) => handleCategory(index), index)
          };
        }),
        f: common_vendor.f(list.value, (item, k0, i0) => {
          return {
            a: common_vendor.unref(api_index.formatImageUrl)(item.videoUrl) || defaultCover,
            b: common_vendor.t(item.title),
            c: common_vendor.t(stripHtml(item.content)),
            d: "de6dec18-1-" + i0,
            e: common_vendor.t(100 + item.knowledgeId * 7),
            f: item.knowledgeId,
            g: common_vendor.o(($event) => goToDetail(item), item.knowledgeId)
          };
        }),
        g: common_vendor.p({
          type: "eye",
          size: "12",
          color: "#999"
        }),
        h: loading.value
      }, loading.value ? {} : finished.value ? {} : {}, {
        i: finished.value,
        j: common_vendor.o(loadMore, "3b"),
        k: refreshing.value,
        l: common_vendor.o(onRefresh, "cb")
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/knowledge/index.js.map
