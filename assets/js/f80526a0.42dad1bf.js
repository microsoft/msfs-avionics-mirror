"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[92465],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>d});var i=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,i)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,i,n=function(e,t){if(null==e)return{};var r,i,n={},a=Object.keys(e);for(i=0;i<a.length;i++)r=a[i],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)r=a[i],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var s=i.createContext({}),m=function(e){var t=i.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},u=function(e){var t=m(e.components);return i.createElement(s.Provider,{value:t},e.children)},c="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},p=i.forwardRef((function(e,t){var r=e.components,n=e.mdxType,a=e.originalType,s=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),c=m(r),p=n,d=c["".concat(s,".").concat(p)]||c[p]||f[p]||a;return r?i.createElement(d,l(l({ref:t},u),{},{components:r})):i.createElement(d,l({ref:t},u))}));function d(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var a=r.length,l=new Array(a);l[0]=p;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[c]="string"==typeof e?e:n,l[1]=o;for(var m=2;m<a;m++)l[m]=r[m];return i.createElement.apply(null,l)}return i.createElement.apply(null,r)}p.displayName="MDXCreateElement"},220:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>f,frontMatter:()=>a,metadata:()=>o,toc:()=>m});var i=r(87462),n=(r(67294),r(3905));const a={id:"SimbriefFlightStage",title:"Enumeration: SimbriefFlightStage",sidebar_label:"SimbriefFlightStage",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/enums/SimbriefFlightStage",id:"framework/enums/SimbriefFlightStage",title:"Enumeration: SimbriefFlightStage",description:"Simbrief flight stages",source:"@site/docs/framework/enums/SimbriefFlightStage.md",sourceDirName:"framework/enums",slug:"/framework/enums/SimbriefFlightStage",permalink:"/msfs-avionics-mirror/docs/framework/enums/SimbriefFlightStage",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"SimbriefFlightStage",title:"Enumeration: SimbriefFlightStage",sidebar_label:"SimbriefFlightStage",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"SimVarValueType",permalink:"/msfs-avionics-mirror/docs/framework/enums/SimVarValueType"},next:{title:"SpeedRestrictionType",permalink:"/msfs-avionics-mirror/docs/framework/enums/SpeedRestrictionType"}},s={},m=[{value:"Enumeration Members",id:"enumeration-members",level:2},{value:"Climb",id:"climb",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Cruise",id:"cruise",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Descent",id:"descent",level:3},{value:"Defined in",id:"defined-in-2",level:4}],u={toc:m},c="wrapper";function f(e){let{components:t,...r}=e;return(0,n.kt)(c,(0,i.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Simbrief flight stages"),(0,n.kt)("h2",{id:"enumeration-members"},"Enumeration Members"),(0,n.kt)("h3",{id:"climb"},"Climb"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"Climb")," = ",(0,n.kt)("inlineCode",{parentName:"p"},'"CLB"')),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/simbrief/SimbriefTypes.ts:3"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"cruise"},"Cruise"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"Cruise")," = ",(0,n.kt)("inlineCode",{parentName:"p"},'"CLZ"')),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/simbrief/SimbriefTypes.ts:4"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"descent"},"Descent"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"Descent")," = ",(0,n.kt)("inlineCode",{parentName:"p"},'"DSC"')),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/simbrief/SimbriefTypes.ts:5"))}f.isMDXComponent=!0}}]);