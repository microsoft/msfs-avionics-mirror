"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[5633],{3905:(e,r,t)=>{t.d(r,{Zo:()=>c,kt:()=>m});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function l(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?l(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function o(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},l=Object.keys(e);for(n=0;n<l.length;n++)t=l[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)t=l[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var s=n.createContext({}),u=function(e){var r=n.useContext(s),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},c=function(e){var r=u(e.components);return n.createElement(s.Provider,{value:r},e.children)},p="mdxType",f={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},d=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,l=e.originalType,s=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),p=u(t),d=a,m=p["".concat(s,".").concat(d)]||p[d]||f[d]||l;return t?n.createElement(m,i(i({ref:r},c),{},{components:t})):n.createElement(m,i({ref:r},c))}));function m(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var l=t.length,i=new Array(l);i[0]=d;var o={};for(var s in r)hasOwnProperty.call(r,s)&&(o[s]=r[s]);o.originalType=e,o[p]="string"==typeof e?e:a,i[1]=o;for(var u=2;u<l;u++)i[u]=t[u];return n.createElement.apply(null,i)}return n.createElement.apply(null,t)}d.displayName="MDXCreateElement"},65802:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>s,contentTitle:()=>i,default:()=>f,frontMatter:()=>l,metadata:()=>o,toc:()=>u});var n=t(87462),a=(t(67294),t(3905));const l={id:"AuralAlertEvents",title:"Interface: AuralAlertEvents",sidebar_label:"AuralAlertEvents",sidebar_position:0,custom_edit_url:null},i=void 0,o={unversionedId:"framework/interfaces/AuralAlertEvents",id:"framework/interfaces/AuralAlertEvents",title:"Interface: AuralAlertEvents",description:"Events published by AuralAlertSystem.",source:"@site/docs/framework/interfaces/AuralAlertEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/AuralAlertEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AuralAlertEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AuralAlertEvents",title:"Interface: AuralAlertEvents",sidebar_label:"AuralAlertEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AuralAlertControlEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AuralAlertControlEvents"},next:{title:"AutothrottleEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AutothrottleEvents"}},s={},u=[{value:"Properties",id:"properties",level:2},{value:"aural_alert_request_all_registrations",id:"aural_alert_request_all_registrations",level:3},{value:"Defined in",id:"defined-in",level:4}],c={toc:u},p="wrapper";function f(e){let{components:r,...t}=e;return(0,a.kt)(p,(0,n.Z)({},c,t,{components:r,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Events published by ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AuralAlertSystem"},"AuralAlertSystem"),"."),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"aural_alert_request_all_registrations"},"aural","_","alert","_","request","_","all","_","registrations"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"aural","_","alert","_","request","_","all","_","registrations"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Requests all alerts to be registered again."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystem.ts:56"))}f.isMDXComponent=!0}}]);