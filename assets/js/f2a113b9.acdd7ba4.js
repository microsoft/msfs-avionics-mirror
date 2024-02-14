"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[29706],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>f});var s=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);t&&(s=s.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,s)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,s,n=function(e,t){if(null==e)return{};var r,s,n={},i=Object.keys(e);for(s=0;s<i.length;s++)r=i[s],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(s=0;s<i.length;s++)r=i[s],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var l=s.createContext({}),p=function(e){var t=s.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):a(a({},t),e)),r},c=function(e){var t=p(e.components);return s.createElement(l.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return s.createElement(s.Fragment,{},t)}},m=s.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,l=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),u=p(r),m=n,f=u["".concat(l,".").concat(m)]||u[m]||d[m]||i;return r?s.createElement(f,a(a({ref:t},c),{},{components:r})):s.createElement(f,a({ref:t},c))}));function f(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,a=new Array(i);a[0]=m;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[u]="string"==typeof e?e:n,a[1]=o;for(var p=2;p<i;p++)a[p]=r[p];return s.createElement.apply(null,a)}return s.createElement.apply(null,r)}m.displayName="MDXCreateElement"},8621:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>a,default:()=>d,frontMatter:()=>i,metadata:()=>o,toc:()=>p});var s=r(87462),n=(r(67294),r(3905));const i={id:"MapUserSettingsUtils",title:"Class: MapUserSettingsUtils",sidebar_label:"MapUserSettingsUtils",sidebar_position:0,custom_edit_url:null},a=void 0,o={unversionedId:"garminsdk/classes/MapUserSettingsUtils",id:"garminsdk/classes/MapUserSettingsUtils",title:"Class: MapUserSettingsUtils",description:"A utility class for working with map user settings.",source:"@site/docs/garminsdk/classes/MapUserSettingsUtils.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/MapUserSettingsUtils",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapUserSettingsUtils",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapUserSettingsUtils",title:"Class: MapUserSettingsUtils",sidebar_label:"MapUserSettingsUtils",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapUnitsModule",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapUnitsModule"},next:{title:"MapUtils",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapUtils"}},l={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Properties",id:"properties",level:2},{value:"SETTING_NAMES",id:"setting_names",level:3},{value:"Defined in",id:"defined-in",level:4}],c={toc:p},u="wrapper";function d(e){let{components:t,...r}=e;return(0,n.kt)(u,(0,s.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A utility class for working with map user settings."),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new MapUserSettingsUtils"),"(): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapUserSettingsUtils"},(0,n.kt)("inlineCode",{parentName:"a"},"MapUserSettingsUtils"))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapUserSettingsUtils"},(0,n.kt)("inlineCode",{parentName:"a"},"MapUserSettingsUtils"))),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"setting_names"},"SETTING","_","NAMES"),(0,n.kt)("p",null,"\u25aa ",(0,n.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"SETTING","_","NAMES"),": readonly keyof ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#mapusersettingtypes"},(0,n.kt)("inlineCode",{parentName:"a"},"MapUserSettingTypes")),"[]"),(0,n.kt)("p",null,"An array of all map user setting names."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/settings/MapUserSettings.ts:185"))}d.isMDXComponent=!0}}]);