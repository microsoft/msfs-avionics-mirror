"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[97320],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>g});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var o=n.createContext({}),m=function(e){var t=n.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},d=function(e){var t=m(e.components);return n.createElement(o.Provider,{value:t},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,o=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),p=m(r),c=a,g=p["".concat(o,".").concat(c)]||p[c]||u[c]||i;return r?n.createElement(g,s(s({ref:t},d),{},{components:r})):n.createElement(g,s({ref:t},d))}));function g(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,s=new Array(i);s[0]=c;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l[p]="string"==typeof e?e:a,s[1]=l;for(var m=2;m<i;m++)s[m]=r[m];return n.createElement.apply(null,s)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},86986:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>o,contentTitle:()=>s,default:()=>u,frontMatter:()=>i,metadata:()=>l,toc:()=>m});var n=r(87462),a=(r(67294),r(3905));const i={id:"DateTimeUserSettings",title:"Class: DateTimeUserSettings",sidebar_label:"DateTimeUserSettings",sidebar_position:0,custom_edit_url:null},s=void 0,l={unversionedId:"garminsdk/classes/DateTimeUserSettings",id:"garminsdk/classes/DateTimeUserSettings",title:"Class: DateTimeUserSettings",description:"Utility class for retrieving date/time user setting managers.",source:"@site/docs/garminsdk/classes/DateTimeUserSettings.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/DateTimeUserSettings",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DateTimeUserSettings",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"DateTimeUserSettings",title:"Class: DateTimeUserSettings",sidebar_label:"DateTimeUserSettings",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"ComRadioUserSettings",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/ComRadioUserSettings"},next:{title:"DefaultAirspeedIndicatorDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultAirspeedIndicatorDataProvider"}},o={},m=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Methods",id:"methods",level:2},{value:"getLocalManager",id:"getlocalmanager",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"getManager",id:"getmanager",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4}],d={toc:m},p="wrapper";function u(e){let{components:t,...r}=e;return(0,a.kt)(p,(0,n.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Utility class for retrieving date/time user setting managers."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new DateTimeUserSettings"),"()"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"getlocalmanager"},"getLocalManager"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("strong",{parentName:"p"},"getLocalManager"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#datetimeusersettingtypes"},(0,a.kt)("inlineCode",{parentName:"a"},"DateTimeUserSettingTypes")),">"),(0,a.kt)("p",null,"Retrieves a manager for instrument-local date/time user settings."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#datetimeusersettingtypes"},(0,a.kt)("inlineCode",{parentName:"a"},"DateTimeUserSettingTypes")),">"),(0,a.kt)("p",null,"A manager for instrument-local date/time user settings."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"garminsdk/settings/DateTimeUserSettings.ts:59"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"getmanager"},"getManager"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("strong",{parentName:"p"},"getManager"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#datetimeusersettingtypes"},(0,a.kt)("inlineCode",{parentName:"a"},"DateTimeUserSettingTypes")),">"),(0,a.kt)("p",null,"Retrieves a manager for date/time user settings."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#datetimeusersettingtypes"},(0,a.kt)("inlineCode",{parentName:"a"},"DateTimeUserSettingTypes")),">"),(0,a.kt)("p",null,"A manager for date/time user settings."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"garminsdk/settings/DateTimeUserSettings.ts:42"))}u.isMDXComponent=!0}}]);