"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[14520],{3905:(e,r,t)=>{t.d(r,{Zo:()=>p,kt:()=>m});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function l(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function o(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var s=n.createContext({}),c=function(e){var r=n.useContext(s),t=r;return e&&(t="function"==typeof e?e(r):l(l({},r),e)),t},p=function(e){var r=c(e.components);return n.createElement(s.Provider,{value:r},e.children)},u="mdxType",f={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},d=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),u=c(t),d=a,m=u["".concat(s,".").concat(d)]||u[d]||f[d]||i;return t?n.createElement(m,l(l({ref:r},p),{},{components:t})):n.createElement(m,l({ref:r},p))}));function m(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var i=t.length,l=new Array(i);l[0]=d;var o={};for(var s in r)hasOwnProperty.call(r,s)&&(o[s]=r[s]);o.originalType=e,o[u]="string"==typeof e?e:a,l[1]=o;for(var c=2;c<i;c++)l[c]=t[c];return n.createElement.apply(null,l)}return n.createElement.apply(null,t)}d.displayName="MDXCreateElement"},22272:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>s,contentTitle:()=>l,default:()=>f,frontMatter:()=>i,metadata:()=>o,toc:()=>c});var n=t(87462),a=(t(67294),t(3905));const i={id:"StallWarningEvents",title:"Interface: StallWarningEvents",sidebar_label:"StallWarningEvents",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/interfaces/StallWarningEvents",id:"framework/interfaces/StallWarningEvents",title:"Interface: StallWarningEvents",description:"Events published by the StallWarningPublisher.",source:"@site/docs/framework/interfaces/StallWarningEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/StallWarningEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/StallWarningEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"StallWarningEvents",title:"Interface: StallWarningEvents",sidebar_label:"StallWarningEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"SoundServerEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/SoundServerEvents"},next:{title:"StyleRecord",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/StyleRecord"}},s={},c=[{value:"Properties",id:"properties",level:2},{value:"stall_warning_on",id:"stall_warning_on",level:3},{value:"Defined in",id:"defined-in",level:4}],p={toc:c},u="wrapper";function f(e){let{components:r,...t}=e;return(0,a.kt)(u,(0,n.Z)({},p,t,{components:r,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Events published by the StallWarningPublisher."),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"stall_warning_on"},"stall","_","warning","_","on"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"stall","_","warning","_","on"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Whether or not the stall warning is on."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/data/StallWarningPublisher.ts:14"))}f.isMDXComponent=!0}}]);