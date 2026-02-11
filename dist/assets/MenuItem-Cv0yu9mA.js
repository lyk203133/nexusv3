import{c as a}from"./useTranslation-B4X_B--w.js";import{b as r,n as s,d as t,e as c,h as l,E as d,g as m,t as i,f as u}from"./index-iIgKntgy.js";/**
 * @license lucide-vue-next v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=a("ChevronRightIcon",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]),h={class:"flex items-center"},p={class:"p-2 bg-slate-800 rounded-lg mr-3 text-emerald-500"},v={class:"text-white text-sm font-bold"},f={key:0,class:"text-[10px] text-slate-500"},y={__name:"MenuItem",props:{icon:{type:Object,required:!0},label:{type:String,required:!0},sub:{type:String,default:""}},emits:["click"],setup(e){return(n,o)=>(s(),r("div",{onClick:o[0]||(o[0]=x=>n.$emit("click")),class:"flex items-center justify-between p-4 border-b border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"},[t("div",h,[t("div",p,[(s(),l(d(e.icon),{size:20}))]),t("div",null,[t("div",v,i(e.label),1),e.sub?(s(),r("div",f,i(e.sub),1)):m("",!0)])]),c(u(b),{size:16,class:"text-slate-600"})]))}};export{y as _};
