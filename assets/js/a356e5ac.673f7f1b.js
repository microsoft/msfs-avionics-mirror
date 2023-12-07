"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[71774],{3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>f});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=n.createContext({}),d=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},s=function(e){var t=d(e.components);return n.createElement(c.Provider,{value:t},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},v=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),p=d(r),v=a,f=p["".concat(c,".").concat(v)]||p[v]||u[v]||i;return r?n.createElement(f,o(o({ref:t},s),{},{components:r})):n.createElement(f,o({ref:t},s))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=v;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[p]="string"==typeof e?e:a,o[1]=l;for(var d=2;d<i;d++)o[d]=r[d];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}v.displayName="MDXCreateElement"},21623:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>o,default:()=>u,frontMatter:()=>i,metadata:()=>l,toc:()=>d});var n=r(87462),a=(r(67294),r(3905));const i={id:"NavToNavManager",title:"Interface: NavToNavManager",sidebar_label:"NavToNavManager",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"framework/interfaces/NavToNavManager",id:"framework/interfaces/NavToNavManager",title:"Interface: NavToNavManager",description:"An interface that describes a manager for dictating nav to nav transfer behavior",source:"@site/docs/framework/interfaces/NavToNavManager.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/NavToNavManager",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/NavToNavManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NavToNavManager",title:"Interface: NavToNavManager",sidebar_label:"NavToNavManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"NavSource",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/NavSource"},next:{title:"NdbFacility",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/NdbFacility"}},c={},d=[{value:"Properties",id:"properties",level:2},{value:"onTransferred",id:"ontransferred",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Returns",id:"returns",level:5},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"canLocActivate",id:"canlocactivate",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"canLocArm",id:"canlocarm",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4}],s={toc:d},p="wrapper";function u(e){let{components:t,...r}=e;return(0,a.kt)(p,(0,n.Z)({},s,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"An interface that describes a manager for dictating nav to nav transfer behavior\nand criteria."),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"ontransferred"},"onTransferred"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"onTransferred"),": () => ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,a.kt)("p",null,"\u25b8 (): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"A callback called when the nav transfer has been completed."),(0,a.kt)("h5",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/autopilot/managers/NavToNavManager.ts:9"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"canlocactivate"},"canLocActivate"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"canLocActivate"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"A method that determines whether or not an armed loc nav mode can\nbecome active."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"True if it can become active, false otherwise."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/autopilot/managers/NavToNavManager.ts:23"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"canlocarm"},"canLocArm"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"canLocArm"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"A method that determines whether or not nav mode can be armed\nwhen approach mode is attempted to be armed."),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"True if it can be armed, false otherwise."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/autopilot/managers/NavToNavManager.ts:16"))}u.isMDXComponent=!0}}]);