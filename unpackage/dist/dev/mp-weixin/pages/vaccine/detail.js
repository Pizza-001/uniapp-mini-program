"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
const _sfc_main = {
  __name: "detail",
  props: { id: String },
  setup(__props) {
    const detail = common_vendor.ref({
      name: "犬六联疫苗",
      subTitle: "广谱保护，全面覆盖6种犬类常见传染病",
      price: 128,
      petType: "犬类（≥8周龄）",
      cycle: "首免间隔3~4周连续接种3次，之后每年补种1次",
      duration: "12个月",
      manufacturer: "英特威/美瑞华进口",
      diseases: ["犬瘟热", "细小病毒", "副流感", "腺病毒Ⅱ型", "传染性肝炎", "钩端螺旋体"],
      descList: [
        "接种前需进行基础健康检查，确保体温正常",
        "首次免疫建议8~12周龄开始，共接种3针",
        "接种后留院观察30分钟，防止过敏反应",
        "接种后72小时内避免洗澡和剧烈运动"
      ],
      steps: [
        { title: "在线预约", desc: "选择时间段完成预约，到院凭预约码取号" },
        { title: "健康检查", desc: "医生对宠物进行体温、心肺等基础检查" },
        { title: "注射疫苗", desc: "由持证兽医师完成皮下注射" },
        { title: "观察留院", desc: "注射后留院观察30分钟，确认无不良反应" },
        { title: "领取证书", desc: "完成接种后领取疫苗接种记录本" }
      ]
    });
    const goBack = () => common_vendor.index.navigateBack();
    const bookVaccine = () => {
      common_vendor.index.showToast({ title: "预约成功！", icon: "success" });
    };
    common_vendor.onMounted(() => {
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "left",
          size: "20",
          color: "#fff"
        }),
        b: common_vendor.o(goBack, "a6"),
        c: common_vendor.t(detail.value.name),
        d: common_vendor.t(detail.value.price),
        e: common_vendor.t(detail.value.subTitle),
        f: common_vendor.f(detail.value.diseases, (d, k0, i0) => {
          return {
            a: common_vendor.t(d),
            b: d
          };
        }),
        g: common_vendor.t(detail.value.petType),
        h: common_vendor.t(detail.value.cycle),
        i: common_vendor.t(detail.value.duration),
        j: common_vendor.t(detail.value.manufacturer),
        k: common_vendor.f(detail.value.descList, (d, i, i0) => {
          return {
            a: common_vendor.t(d),
            b: i
          };
        }),
        l: common_vendor.f(detail.value.steps, (s, i, i0) => {
          return common_vendor.e({
            a: common_vendor.t(i + 1),
            b: i < detail.value.steps.length - 1
          }, i < detail.value.steps.length - 1 ? {} : {}, {
            c: common_vendor.t(s.title),
            d: common_vendor.t(s.desc),
            e: i
          });
        }),
        m: common_vendor.o(bookVaccine, "97")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0719c8ff"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/vaccine/detail.js.map
