"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[38877],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>v});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var s=n.createContext({}),l=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},u=function(e){var t=l(e.components);return n.createElement(s.Provider,{value:t},e.children)},p="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,u=c(e,["components","mdxType","originalType","parentName"]),p=l(r),d=i,v=p["".concat(s,".").concat(d)]||p[d]||f[d]||a;return r?n.createElement(v,o(o({ref:t},u),{},{components:r})):n.createElement(v,o({ref:t},u))}));function v(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=r.length,o=new Array(a);o[0]=d;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c[p]="string"==typeof e?e:i,o[1]=c;for(var l=2;l<a;l++)o[l]=r[l];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},92895:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>f,frontMatter:()=>a,metadata:()=>c,toc:()=>l});var n=r(87462),i=(r(67294),r(3905));const a={id:"ScreenStateEvent",title:"Interface: ScreenStateEvent",sidebar_label:"ScreenStateEvent",sidebar_position:0,custom_edit_url:null},o=void 0,c={unversionedId:"framework/interfaces/ScreenStateEvent",id:"framework/interfaces/ScreenStateEvent",title:"Interface: ScreenStateEvent",description:"An event fired when the screen state changes.",source:"@site/docs/framework/interfaces/ScreenStateEvent.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/ScreenStateEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/ScreenStateEvent",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"ScreenStateEvent",title:"Interface: ScreenStateEvent",sidebar_label:"ScreenStateEvent",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"RunwayTransition",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/RunwayTransition"},next:{title:"SetVnavDirectToData",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/SetVnavDirectToData"}},s={},l=[{value:"Properties",id:"properties",level:2},{value:"current",id:"current",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"previous",id:"previous",level:3},{value:"Defined in",id:"defined-in-1",level:4}],u={toc:l},p="wrapper";function f(e){let{components:t,...r}=e;return(0,i.kt)(p,(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"An event fired when the screen state changes."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"current"},"current"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"current"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"ScreenState")),(0,i.kt)("p",null,"The current screen state."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/InstrumentEvents.ts:12"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"previous"},"previous"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"previous"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"ScreenState")),(0,i.kt)("p",null,"The previous screen state."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/InstrumentEvents.ts:15"))}f.isMDXComponent=!0}}]);