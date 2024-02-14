"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[88603],{3905:(e,r,t)=>{t.d(r,{Zo:()=>c,kt:()=>f});var n=t(67294);function s(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function a(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){s(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function i(e,r){if(null==e)return{};var t,n,s=function(e,r){if(null==e)return{};var t,n,s={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||(s[t]=e[t]);return s}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(s[t]=e[t])}return s}var l=n.createContext({}),p=function(e){var r=n.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):a(a({},r),e)),t},c=function(e){var r=p(e.components);return n.createElement(l.Provider,{value:r},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},m=n.forwardRef((function(e,r){var t=e.components,s=e.mdxType,o=e.originalType,l=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),u=p(t),m=s,f=u["".concat(l,".").concat(m)]||u[m]||d[m]||o;return t?n.createElement(f,a(a({ref:r},c),{},{components:t})):n.createElement(f,a({ref:r},c))}));function f(e,r){var t=arguments,s=r&&r.mdxType;if("string"==typeof e||s){var o=t.length,a=new Array(o);a[0]=m;var i={};for(var l in r)hasOwnProperty.call(r,l)&&(i[l]=r[l]);i.originalType=e,i[u]="string"==typeof e?e:s,a[1]=i;for(var p=2;p<o;p++)a[p]=t[p];return n.createElement.apply(null,a)}return n.createElement.apply(null,t)}m.displayName="MDXCreateElement"},62820:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>l,contentTitle:()=>a,default:()=>d,frontMatter:()=>o,metadata:()=>i,toc:()=>p});var n=t(87462),s=(t(67294),t(3905));const o={id:"MapCrosshairModule",title:"Class: MapCrosshairModule",sidebar_label:"MapCrosshairModule",sidebar_position:0,custom_edit_url:null},a=void 0,i={unversionedId:"garminsdk/classes/MapCrosshairModule",id:"garminsdk/classes/MapCrosshairModule",title:"Class: MapCrosshairModule",description:"A module for the map crosshair.",source:"@site/docs/garminsdk/classes/MapCrosshairModule.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/MapCrosshairModule",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapCrosshairModule",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapCrosshairModule",title:"Class: MapCrosshairModule",sidebar_label:"MapCrosshairModule",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapCrosshairLayer",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapCrosshairLayer"},next:{title:"MapDataIntegrityRTRController",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapDataIntegrityRTRController"}},l={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Properties",id:"properties",level:2},{value:"show",id:"show",level:3},{value:"Defined in",id:"defined-in",level:4}],c={toc:p},u="wrapper";function d(e){let{components:r,...t}=e;return(0,s.kt)(u,(0,n.Z)({},c,t,{components:r,mdxType:"MDXLayout"}),(0,s.kt)("p",null,"A module for the map crosshair."),(0,s.kt)("h2",{id:"constructors"},"Constructors"),(0,s.kt)("h3",{id:"constructor"},"constructor"),(0,s.kt)("p",null,"\u2022 ",(0,s.kt)("strong",{parentName:"p"},"new MapCrosshairModule"),"(): ",(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapCrosshairModule"},(0,s.kt)("inlineCode",{parentName:"a"},"MapCrosshairModule"))),(0,s.kt)("h4",{id:"returns"},"Returns"),(0,s.kt)("p",null,(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapCrosshairModule"},(0,s.kt)("inlineCode",{parentName:"a"},"MapCrosshairModule"))),(0,s.kt)("h2",{id:"properties"},"Properties"),(0,s.kt)("h3",{id:"show"},"show"),(0,s.kt)("p",null,"\u2022 ",(0,s.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,s.kt)("strong",{parentName:"p"},"show"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,s.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,s.kt)("h4",{id:"defined-in"},"Defined in"),(0,s.kt)("p",null,"src/garminsdk/components/map/modules/MapCrosshairModule.ts:7"))}d.isMDXComponent=!0}}]);