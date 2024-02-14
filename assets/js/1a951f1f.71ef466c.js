"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[84637],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),c=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=c(e.components);return r.createElement(s.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),d=c(n),f=a,m=d["".concat(s,".").concat(f)]||d[f]||u[f]||i;return n?r.createElement(m,l(l({ref:t},p),{},{components:n})):r.createElement(m,l({ref:t},p))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=f;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[d]="string"==typeof e?e:a,l[1]=o;for(var c=2;c<i;c++)l[c]=n[c];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},13589:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>o,toc:()=>c});var r=n(87462),a=(n(67294),n(3905));const i={id:"BaseWeightBalanceEvents",title:"Interface: BaseWeightBalanceEvents",sidebar_label:"BaseWeightBalanceEvents",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/interfaces/BaseWeightBalanceEvents",id:"framework/interfaces/BaseWeightBalanceEvents",title:"Interface: BaseWeightBalanceEvents",description:"An interface that describes the base Weight and Balance events.",source:"@site/docs/framework/interfaces/BaseWeightBalanceEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/BaseWeightBalanceEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/BaseWeightBalanceEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"BaseWeightBalanceEvents",title:"Interface: BaseWeightBalanceEvents",sidebar_label:"BaseWeightBalanceEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"BaseVNavSimVarEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/BaseVNavSimVarEvents"},next:{title:"BingComponentProps",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/BingComponentProps"}},s={},c=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"cg_percent",id:"cg_percent",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"payload_station_weight",id:"payload_station_weight",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"total_weight",id:"total_weight",level:3},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:c},d="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(d,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"An interface that describes the base Weight and Balance events."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"BaseWeightBalanceEvents"))),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/WeightBalanceEvents"},(0,a.kt)("inlineCode",{parentName:"a"},"WeightBalanceEvents"))))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"cg_percent"},"cg","_","percent"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"cg","_","percent"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Longitudinal CG position as a percent of reference Chord. Note: only valid for airplanes."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/WeightAndBalance.ts:13"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"payload_station_weight"},"payload","_","station","_","weight"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"payload","_","station","_","weight"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The weight value of a payload station with the given index"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/WeightAndBalance.ts:17"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"total_weight"},"total","_","weight"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"total","_","weight"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"A total weight value for the aircraft, in pounds."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/WeightAndBalance.ts:15"))}u.isMDXComponent=!0}}]);