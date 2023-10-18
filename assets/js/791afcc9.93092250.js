"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[45942],{3905:(e,r,t)=>{t.d(r,{Zo:()=>s,kt:()=>f});var i=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function a(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);r&&(i=i.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,i)}return t}function c(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?a(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function o(e,r){if(null==e)return{};var t,i,n=function(e,r){if(null==e)return{};var t,i,n={},a=Object.keys(e);for(i=0;i<a.length;i++)t=a[i],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)t=a[i],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var d=i.createContext({}),l=function(e){var r=i.useContext(d),t=r;return e&&(t="function"==typeof e?e(r):c(c({},r),e)),t},s=function(e){var r=l(e.components);return i.createElement(d.Provider,{value:r},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var r=e.children;return i.createElement(i.Fragment,{},r)}},p=i.forwardRef((function(e,r){var t=e.components,n=e.mdxType,a=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=l(t),p=n,f=m["".concat(d,".").concat(p)]||m[p]||u[p]||a;return t?i.createElement(f,c(c({ref:r},s),{},{components:t})):i.createElement(f,c({ref:r},s))}));function f(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var a=t.length,c=new Array(a);c[0]=p;var o={};for(var d in r)hasOwnProperty.call(r,d)&&(o[d]=r[d]);o.originalType=e,o[m]="string"==typeof e?e:n,c[1]=o;for(var l=2;l<a;l++)c[l]=t[l];return i.createElement.apply(null,c)}return i.createElement.apply(null,t)}p.displayName="MDXCreateElement"},98367:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>d,contentTitle:()=>c,default:()=>u,frontMatter:()=>a,metadata:()=>o,toc:()=>l});var i=t(87462),n=(t(67294),t(3905));const a={id:"index.SimbriefClimbDescentWindTemperatureRecord",title:"Interface: SimbriefClimbDescentWindTemperatureRecord",sidebar_label:"SimbriefClimbDescentWindTemperatureRecord",custom_edit_url:null},c=void 0,o={unversionedId:"framework/interfaces/index.SimbriefClimbDescentWindTemperatureRecord",id:"framework/interfaces/index.SimbriefClimbDescentWindTemperatureRecord",title:"Interface: SimbriefClimbDescentWindTemperatureRecord",description:"index.SimbriefClimbDescentWindTemperatureRecord",source:"@site/docs/framework/interfaces/index.SimbriefClimbDescentWindTemperatureRecord.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.SimbriefClimbDescentWindTemperatureRecord",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.SimbriefClimbDescentWindTemperatureRecord",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.SimbriefClimbDescentWindTemperatureRecord",title:"Interface: SimbriefClimbDescentWindTemperatureRecord",sidebar_label:"SimbriefClimbDescentWindTemperatureRecord",custom_edit_url:null},sidebar:"sidebar",previous:{title:"SetVnavDirectToData",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.SetVnavDirectToData"},next:{title:"SimbriefCruiseWindTemperatureRecord",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.SimbriefCruiseWindTemperatureRecord"}},d={},l=[{value:"Properties",id:"properties",level:2},{value:"cumulativeDistance",id:"cumulativedistance",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"expectedAltitude",id:"expectedaltitude",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"winds",id:"winds",level:3},{value:"Defined in",id:"defined-in-2",level:4}],s={toc:l},m="wrapper";function u(e){let{components:r,...t}=e;return(0,n.kt)(m,(0,i.Z)({},s,t,{components:r,mdxType:"MDXLayout"}),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".SimbriefClimbDescentWindTemperatureRecord"),(0,n.kt)("p",null,"Simbrief climb/descent wind and temperature record."),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"cumulativedistance"},"cumulativeDistance"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"cumulativeDistance"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"Cumulative distance from the start of the climb or descent."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/simbrief/SimbriefDataExtraction.ts:98"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"expectedaltitude"},"expectedAltitude"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"expectedAltitude"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"Expected altitude when crossing this point."),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/simbrief/SimbriefDataExtraction.ts:95"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"winds"},"winds"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"winds"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.SimbriefWindTemperatureRecord"},(0,n.kt)("inlineCode",{parentName:"a"},"SimbriefWindTemperatureRecord")),"[]"),(0,n.kt)("p",null,"Wind records for the point."),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/simbrief/SimbriefDataExtraction.ts:101"))}u.isMDXComponent=!0}}]);