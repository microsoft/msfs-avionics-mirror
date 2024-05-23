"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[62523],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>g});var r=n(67294);function s(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){s(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,s=function(e,t){if(null==e)return{};var n,r,s={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(s[n]=e[n]);return s}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(s[n]=e[n])}return s}var o=r.createContext({}),p=function(e){var t=r.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},m=function(e){var t=p(e.components);return r.createElement(o.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,s=e.mdxType,a=e.originalType,o=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),d=p(n),c=s,g=d["".concat(o,".").concat(c)]||d[c]||u[c]||a;return n?r.createElement(g,i(i({ref:t},m),{},{components:n})):r.createElement(g,i({ref:t},m))}));function g(e,t){var n=arguments,s=t&&t.mdxType;if("string"==typeof e||s){var a=n.length,i=new Array(a);i[0]=c;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l[d]="string"==typeof e?e:s,i[1]=l;for(var p=2;p<a;p++)i[p]=n[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},82994:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>i,default:()=>u,frontMatter:()=>a,metadata:()=>l,toc:()=>p});var r=n(87462),s=(n(67294),n(3905));const a={id:"UnitsUserSettings",title:"Class: UnitsUserSettings",sidebar_label:"UnitsUserSettings",sidebar_position:0,custom_edit_url:null},i=void 0,l={unversionedId:"garminsdk/classes/UnitsUserSettings",id:"garminsdk/classes/UnitsUserSettings",title:"Class: UnitsUserSettings",description:"Utility class for retrieving display units user setting managers.",source:"@site/docs/garminsdk/classes/UnitsUserSettings.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/UnitsUserSettings",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/UnitsUserSettings",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"UnitsUserSettings",title:"Class: UnitsUserSettings",sidebar_label:"UnitsUserSettings",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"UnitFormatter",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/UnitFormatter"},next:{title:"VSpeedUserSettingUtils",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/VSpeedUserSettingUtils"}},o={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"getLocalManager",id:"getlocalmanager",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"getManager",id:"getmanager",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-1",level:4}],m={toc:p},d="wrapper";function u(e){let{components:t,...n}=e;return(0,s.kt)(d,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("p",null,"Utility class for retrieving display units user setting managers."),(0,s.kt)("h2",{id:"constructors"},"Constructors"),(0,s.kt)("h3",{id:"constructor"},"constructor"),(0,s.kt)("p",null,"\u2022 ",(0,s.kt)("strong",{parentName:"p"},"new UnitsUserSettings"),"(): ",(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/UnitsUserSettings"},(0,s.kt)("inlineCode",{parentName:"a"},"UnitsUserSettings"))),(0,s.kt)("h4",{id:"returns"},"Returns"),(0,s.kt)("p",null,(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/UnitsUserSettings"},(0,s.kt)("inlineCode",{parentName:"a"},"UnitsUserSettings"))),(0,s.kt)("h2",{id:"methods"},"Methods"),(0,s.kt)("h3",{id:"getlocalmanager"},"getLocalManager"),(0,s.kt)("p",null,"\u25b8 ",(0,s.kt)("strong",{parentName:"p"},"getLocalManager"),"(",(0,s.kt)("inlineCode",{parentName:"p"},"bus"),"): ",(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/UnitsUserSettingManager"},(0,s.kt)("inlineCode",{parentName:"a"},"UnitsUserSettingManager")),"<",(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#unitsusersettingtypes"},(0,s.kt)("inlineCode",{parentName:"a"},"UnitsUserSettingTypes")),">"),(0,s.kt)("p",null,"Retrieves a manager for instrument-local display units user settings."),(0,s.kt)("h4",{id:"parameters"},"Parameters"),(0,s.kt)("table",null,(0,s.kt)("thead",{parentName:"table"},(0,s.kt)("tr",{parentName:"thead"},(0,s.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,s.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,s.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,s.kt)("tbody",{parentName:"table"},(0,s.kt)("tr",{parentName:"tbody"},(0,s.kt)("td",{parentName:"tr",align:"left"},(0,s.kt)("inlineCode",{parentName:"td"},"bus")),(0,s.kt)("td",{parentName:"tr",align:"left"},(0,s.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,s.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,s.kt)("h4",{id:"returns-1"},"Returns"),(0,s.kt)("p",null,(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/UnitsUserSettingManager"},(0,s.kt)("inlineCode",{parentName:"a"},"UnitsUserSettingManager")),"<",(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#unitsusersettingtypes"},(0,s.kt)("inlineCode",{parentName:"a"},"UnitsUserSettingTypes")),">"),(0,s.kt)("p",null,"A manager for instrument-local display units user settings."),(0,s.kt)("h4",{id:"defined-in"},"Defined in"),(0,s.kt)("p",null,"src/garminsdk/settings/UnitsUserSettings.ts:316"),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"getmanager"},"getManager"),(0,s.kt)("p",null,"\u25b8 ",(0,s.kt)("strong",{parentName:"p"},"getManager"),"(",(0,s.kt)("inlineCode",{parentName:"p"},"bus"),"): ",(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/UnitsUserSettingManager"},(0,s.kt)("inlineCode",{parentName:"a"},"UnitsUserSettingManager")),"<",(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#unitsusersettingtypes"},(0,s.kt)("inlineCode",{parentName:"a"},"UnitsUserSettingTypes")),">"),(0,s.kt)("p",null,"Retrieves a manager for display units user settings."),(0,s.kt)("h4",{id:"parameters-1"},"Parameters"),(0,s.kt)("table",null,(0,s.kt)("thead",{parentName:"table"},(0,s.kt)("tr",{parentName:"thead"},(0,s.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,s.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,s.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,s.kt)("tbody",{parentName:"table"},(0,s.kt)("tr",{parentName:"tbody"},(0,s.kt)("td",{parentName:"tr",align:"left"},(0,s.kt)("inlineCode",{parentName:"td"},"bus")),(0,s.kt)("td",{parentName:"tr",align:"left"},(0,s.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,s.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,s.kt)("h4",{id:"returns-2"},"Returns"),(0,s.kt)("p",null,(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/UnitsUserSettingManager"},(0,s.kt)("inlineCode",{parentName:"a"},"UnitsUserSettingManager")),"<",(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#unitsusersettingtypes"},(0,s.kt)("inlineCode",{parentName:"a"},"UnitsUserSettingTypes")),">"),(0,s.kt)("p",null,"A manager for display units user settings."),(0,s.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,s.kt)("p",null,"src/garminsdk/settings/UnitsUserSettings.ts:300"))}u.isMDXComponent=!0}}]);