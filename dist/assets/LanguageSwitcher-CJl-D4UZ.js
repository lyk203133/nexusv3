import{c as o}from"./useTranslation-B4X_B--w.js";import{b as i,n as u,e as r,d as t,f as n}from"./index-iIgKntgy.js";/**
 * @license lucide-vue-next v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=o("ChevronDownIcon",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-vue-next v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=o("GlobeIcon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]),d={class:"relative group"},v=["value"],h={__name:"LanguageSwitcher",props:{currentLang:{type:String,required:!0}},emits:["update:currentLang"],setup(a){return(s,e)=>(u(),i("div",d,[r(n(p),{size:14,class:"absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"}),t("select",{value:a.currentLang,onChange:e[0]||(e[0]=l=>s.$emit("update:currentLang",l.target.value)),class:"bg-slate-800 border border-slate-700 rounded-full pl-9 pr-8 py-1.5 text-xs text-slate-300 hover:text-emerald-400 hover:border-emerald-500 focus:border-emerald-500 appearance-none outline-none cursor-pointer transition-all relative z-0"},[...e[1]||(e[1]=[t("option",{value:"zh-TW"},"繁體中文",-1),t("option",{value:"en-US"},"English",-1),t("option",{value:"vi-VN"},"Tiếng Việt",-1)])],40,v),r(n(c),{size:12,class:"absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"})]))}};export{h as _};
