"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[17382],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>f});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var o=a.createContext({}),p=function(e){var t=a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return a.createElement(o.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),m=p(n),u=r,f=m["".concat(o,".").concat(u)]||m[u]||k[u]||i;return n?a.createElement(f,l(l({ref:t},s),{},{components:n})):a.createElement(f,l({ref:t},s))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=u;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[m]="string"==typeof e?e:r,l[1]=d;for(var p=2;p<i;p++)l[p]=n[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},5900:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>k,frontMatter:()=>i,metadata:()=>d,toc:()=>p});var a=n(87462),r=(n(67294),n(3905));const i={id:"TrafficMapRangeController",title:"Class: TrafficMapRangeController",sidebar_label:"TrafficMapRangeController",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/classes/TrafficMapRangeController",id:"garminsdk/classes/TrafficMapRangeController",title:"Class: TrafficMapRangeController",description:"Controls traffic map range.",source:"@site/docs/garminsdk/classes/TrafficMapRangeController.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/TrafficMapRangeController",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/TrafficMapRangeController",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TrafficMapRangeController",title:"Class: TrafficMapRangeController",sidebar_label:"TrafficMapRangeController",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"TrafficMapOperatingModeIndicator",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/TrafficMapOperatingModeIndicator"},next:{title:"TrafficMapRangeLayer",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/TrafficMapRangeLayer"}},o={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"distanceModeSub",id:"distancemodesub",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"distanceUnitsMode",id:"distanceunitsmode",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"indexSub",id:"indexsub",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"metricRangeArray",id:"metricrangearray",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"nauticalRangeArray",id:"nauticalrangearray",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"rangeModule",id:"rangemodule",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"rangeSetting",id:"rangesetting",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"settingSub",id:"settingsub",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"trafficModule",id:"trafficmodule",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"useSetting",id:"usesetting",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"useSettingSub",id:"usesettingsub",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"Accessors",id:"accessors",level:2},{value:"isAlive",id:"isalive",level:3},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"Methods",id:"methods",level:2},{value:"changeRangeIndex",id:"changerangeindex",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"onAfterMapRender",id:"onaftermaprender",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"onAfterUpdated",id:"onafterupdated",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"onBeforeUpdated",id:"onbeforeupdated",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"onDeadZoneChanged",id:"ondeadzonechanged",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"onMapDestroyed",id:"onmapdestroyed",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"onMapProjectionChanged",id:"onmapprojectionchanged",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"onSleep",id:"onsleep",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"onWake",id:"onwake",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"setRangeIndex",id:"setrangeindex",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Defined in",id:"defined-in-24",level:4}],s={toc:p},m="wrapper";function k(e){let{components:t,...n}=e;return(0,r.kt)(m,(0,a.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Controls traffic map range."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"MapSystemController"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TrafficMapRangeControllerModules"},(0,r.kt)("inlineCode",{parentName:"a"},"TrafficMapRangeControllerModules")),">"),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"TrafficMapRangeController"))))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new TrafficMapRangeController"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"context"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"nauticalRangeArray?"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"metricRangeArray?"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"settingManager?"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"useSetting?"),")"),(0,r.kt)("p",null,"Constructor."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"context")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"MapSystemContext"),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TrafficMapRangeControllerModules"},(0,r.kt)("inlineCode",{parentName:"a"},"TrafficMapRangeControllerModules")),", ",(0,r.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"any"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"This controller's map context.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"nauticalRangeArray?")),(0,r.kt)("td",{parentName:"tr",align:"left"},"readonly ",(0,r.kt)("inlineCode",{parentName:"td"},"NumberUnitInterface"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"Unit"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Distance"),">",">","[]"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The map range array this controller sets for nautical distance mode. If not defined, this controller will not change the range array when entering nautical distance mode.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"metricRangeArray?")),(0,r.kt)("td",{parentName:"tr",align:"left"},"readonly ",(0,r.kt)("inlineCode",{parentName:"td"},"NumberUnitInterface"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"Unit"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Distance"),">",">","[]"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The map range array this controller sets for metric distance mode. If not defined, this controller will not change the range array when entering metric distance mode.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"settingManager?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"UserSettingManager"),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/modules#trafficmaprangecontrollersettings"},(0,r.kt)("inlineCode",{parentName:"a"},"TrafficMapRangeControllerSettings")),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"A setting manager containing the map range index setting. If not defined, map range will be set directly through the map model.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"useSetting?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"boolean"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"A subscribable which provides whether to control map range via the user setting. If not defined, map range will always be controlled via the user setting. Ignored if ",(0,r.kt)("inlineCode",{parentName:"td"},"settingManager")," is undefined.")))),(0,r.kt)("h4",{id:"overrides"},"Overrides"),(0,r.kt)("p",null,"MapSystemController","<","TrafficMapRangeControllerModules\\",">",".constructor"),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:61"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"context"},"context"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"context"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"MapSystemContext"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TrafficMapRangeControllerModules"},(0,r.kt)("inlineCode",{parentName:"a"},"TrafficMapRangeControllerModules")),", ",(0,r.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,"MapSystemController.context"),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"sdk/components/mapsystem/MapSystemController.ts:24"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"distancemodesub"},"distanceModeSub"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"distanceModeSub"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:44"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"distanceunitsmode"},"distanceUnitsMode"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"distanceUnitsMode"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/UnitsDistanceSettingMode"},(0,r.kt)("inlineCode",{parentName:"a"},"UnitsDistanceSettingMode")),">"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:40"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"indexsub"},"indexSub"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"indexSub"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:45"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"metricrangearray"},"metricRangeArray"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"metricRangeArray"),": readonly ",(0,r.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Distance"),">",">","[]"),(0,r.kt)("p",null,"The map range array this controller sets for metric distance mode. If not defined, this\ncontroller will not change the range array when entering metric distance mode."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:64"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"nauticalrangearray"},"nauticalRangeArray"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"nauticalRangeArray"),": readonly ",(0,r.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Distance"),">",">","[]"),(0,r.kt)("p",null,"The map range array this controller sets for nautical distance mode. If not defined,\nthis controller will not change the range array when entering nautical distance mode."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:63"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"rangemodule"},"rangeModule"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"rangeModule"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"MapIndexedRangeModule")),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:37"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"rangesetting"},"rangeSetting"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"rangeSetting"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:42"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"settingsub"},"settingSub"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"settingSub"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:46"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"trafficmodule"},"trafficModule"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"trafficModule"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapGarminTrafficModule"},(0,r.kt)("inlineCode",{parentName:"a"},"MapGarminTrafficModule"))),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:38"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"usesetting"},"useSetting"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"useSetting"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"A subscribable which provides whether to control map range via the user setting. If not defined,\nmap range will always be controlled via the user setting. Ignored if ",(0,r.kt)("inlineCode",{parentName:"p"},"settingManager")," is undefined."),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:66"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"usesettingsub"},"useSettingSub"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"useSettingSub"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:47"),(0,r.kt)("h2",{id:"accessors"},"Accessors"),(0,r.kt)("h3",{id:"isalive"},"isAlive"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"get")," ",(0,r.kt)("strong",{parentName:"p"},"isAlive"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether this controller is alive."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,"MapSystemController.isAlive"),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,"sdk/components/mapsystem/MapSystemController.ts:20"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"changerangeindex"},"changeRangeIndex"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"changeRangeIndex"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"delta"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Changes the range index by a given number of steps. Each step changes the range index to the next or previous\nindex that holds a range different from the current range."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"delta")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The number of steps by which to change the range.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The final index that was set."),(0,r.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:146"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"destroy"},"destroy"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"overrides-1"},"Overrides"),(0,r.kt)("p",null,"MapSystemController.destroy"),(0,r.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:195"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onaftermaprender"},"onAfterMapRender"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onAfterMapRender"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"overrides-2"},"Overrides"),(0,r.kt)("p",null,"MapSystemController.onAfterMapRender"),(0,r.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:74"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onafterupdated"},"onAfterUpdated"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onAfterUpdated"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"time"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"elapsed"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"This method is called immediately after this controller's map updates its layers."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"time")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The current time, as a Javascript timestamp.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"elapsed")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The elapsed time, in milliseconds, since the last update.")))),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,"MapSystemController.onAfterUpdated"),(0,r.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,r.kt)("p",null,"sdk/components/mapsystem/MapSystemController.ts:78"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onbeforeupdated"},"onBeforeUpdated"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onBeforeUpdated"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"time"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"elapsed"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"This method is called immediately before this controller's map updates its layers."),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"time")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The current time, as a Javascript timestamp.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"elapsed")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The elapsed time, in milliseconds, since the last update.")))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,r.kt)("p",null,"MapSystemController.onBeforeUpdated"),(0,r.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,r.kt)("p",null,"sdk/components/mapsystem/MapSystemController.ts:68"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ondeadzonechanged"},"onDeadZoneChanged"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onDeadZoneChanged"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"deadZone"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"This method is called when the dead zone of this controller's map changes."),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"deadZone")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,r.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"copyWithin"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"sort"'),">",">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The map's new dead zone.")))),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,r.kt)("p",null,"MapSystemController.onDeadZoneChanged"),(0,r.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,r.kt)("p",null,"sdk/components/mapsystem/MapSystemController.ts:48"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onmapdestroyed"},"onMapDestroyed"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onMapDestroyed"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"returns-7"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"overrides-3"},"Overrides"),(0,r.kt)("p",null,"MapSystemController.onMapDestroyed"),(0,r.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:190"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onmapprojectionchanged"},"onMapProjectionChanged"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onMapProjectionChanged"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"mapProjection"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"changeFlags"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"This method is called when the projection of this controller's map changes."),(0,r.kt)("h4",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"mapProjection")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"MapProjection")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The map projection.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"changeFlags")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Bit flags describing the type of change.")))),(0,r.kt)("h4",{id:"returns-8"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,r.kt)("p",null,"MapSystemController.onMapProjectionChanged"),(0,r.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,r.kt)("p",null,"sdk/components/mapsystem/MapSystemController.ts:58"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onsleep"},"onSleep"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onSleep"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"This method is called when this controller's map is put to sleep."),(0,r.kt)("h4",{id:"returns-9"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,r.kt)("p",null,"MapSystemController.onSleep"),(0,r.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,r.kt)("p",null,"sdk/components/mapsystem/MapSystemController.ts:92"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onwake"},"onWake"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onWake"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"This method is called when this controller's map is awakened."),(0,r.kt)("h4",{id:"returns-10"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,r.kt)("p",null,"MapSystemController.onWake"),(0,r.kt)("h4",{id:"defined-in-23"},"Defined in"),(0,r.kt)("p",null,"sdk/components/mapsystem/MapSystemController.ts:85"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"setrangeindex"},"setRangeIndex"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"setRangeIndex"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"index"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Sets the map range index. If the index is out of bounds, it will be clamped before being set."),(0,r.kt)("h4",{id:"parameters-6"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"index")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The index to set.")))),(0,r.kt)("h4",{id:"returns-11"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index that was set."),(0,r.kt)("h4",{id:"defined-in-24"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/controllers/TrafficMapRangeController.ts:128"))}k.isMDXComponent=!0}}]);