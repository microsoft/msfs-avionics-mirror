"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[34269],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>g});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function s(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var l=n.createContext({}),d=function(e){var t=n.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):s(s({},t),e)),a},m=function(e){var t=d(e.components);return n.createElement(l.Provider,{value:t},e.children)},u="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,l=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),u=d(a),c=r,g=u["".concat(l,".").concat(c)]||u[c]||p[c]||i;return a?n.createElement(g,s(s({ref:t},m),{},{components:a})):n.createElement(g,s({ref:t},m))}));function g(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,s=new Array(i);s[0]=c;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[u]="string"==typeof e?e:r,s[1]=o;for(var d=2;d<i;d++)s[d]=a[d];return n.createElement.apply(null,s)}return n.createElement.apply(null,a)}c.displayName="MDXCreateElement"},23095:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>l,contentTitle:()=>s,default:()=>p,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var n=a(87462),r=(a(67294),a(3905));const i={id:"Gdu460CnsDataBarItemManager",title:"Class: Gdu460CnsDataBarItemManager",sidebar_label:"Gdu460CnsDataBarItemManager",sidebar_position:0,custom_edit_url:null},s=void 0,o={unversionedId:"g3xtouchcommon/classes/Gdu460CnsDataBarItemManager",id:"g3xtouchcommon/classes/Gdu460CnsDataBarItemManager",title:"Class: Gdu460CnsDataBarItemManager",description:"A manager that keeps track of the items to render and display on a GDU 460 CNS data bar.",source:"@site/docs/g3xtouchcommon/classes/Gdu460CnsDataBarItemManager.md",sourceDirName:"g3xtouchcommon/classes",slug:"/g3xtouchcommon/classes/Gdu460CnsDataBarItemManager",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/Gdu460CnsDataBarItemManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"Gdu460CnsDataBarItemManager",title:"Class: Gdu460CnsDataBarItemManager",sidebar_label:"Gdu460CnsDataBarItemManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"Gdu460CnsDataBar",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/Gdu460CnsDataBar"},next:{title:"Gdu460Display",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/Gdu460Display"}},l={},d=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"leftItems",id:"leftitems",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"maxDataFieldCount",id:"maxdatafieldcount",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"rightItems",id:"rightitems",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-4",level:4}],m={toc:d},u="wrapper";function p(e){let{components:t,...a}=e;return(0,r.kt)(u,(0,n.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A manager that keeps track of the items to render and display on a GDU 460 CNS data bar."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new Gdu460CnsDataBarItemManager"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"uiService"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"displaySettingManager"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"dataBarSettingManager"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"options"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/Gdu460CnsDataBarItemManager"},(0,r.kt)("inlineCode",{parentName:"a"},"Gdu460CnsDataBarItemManager"))),(0,r.kt)("p",null,"Creates a new instance of Gdu460CnsDataBarItemManager."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"uiService")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiService"},(0,r.kt)("inlineCode",{parentName:"a"},"UiService"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The UI service.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"displaySettingManager")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"UserSettingManager"),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#displayusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"DisplayUserSettingTypes")),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"A manager for display user settings.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"dataBarSettingManager")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"UserSettingManager"),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#cnsdatabarusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"CnsDataBarUserSettingTypes")),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"A manager for CNS data bar user settings.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"options")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#gdu460cnsdatabaritemmanageroptions"},(0,r.kt)("inlineCode",{parentName:"a"},"Gdu460CnsDataBarItemManagerOptions")),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"Options with which to configure the manager.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/Gdu460CnsDataBarItemManager"},(0,r.kt)("inlineCode",{parentName:"a"},"Gdu460CnsDataBarItemManager"))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/GduDisplay/Gdu460/CnsDataBar/Gdu460CnsDataBarItemManager.ts:171"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"leftitems"},"leftItems"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"leftItems"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"SubscribableArray"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#cnsdatabaritemdata"},(0,r.kt)("inlineCode",{parentName:"a"},"CnsDataBarItemData")),">",">"),(0,r.kt)("p",null,"The CNS data bar items to render on the left side."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/GduDisplay/Gdu460/CnsDataBar/Gdu460CnsDataBarItemManager.ts:142"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"maxdatafieldcount"},"maxDataFieldCount"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"maxDataFieldCount"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The maximum number of nav data fields that can be displayed on the CNS data bar given the currently rendered data\nbar items."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/GduDisplay/Gdu460/CnsDataBar/Gdu460CnsDataBarItemManager.ts:153"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"rightitems"},"rightItems"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"rightItems"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"SubscribableArray"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#cnsdatabaritemdata"},(0,r.kt)("inlineCode",{parentName:"a"},"CnsDataBarItemData")),">",">"),(0,r.kt)("p",null,"The CNS data bar items to render on the right side."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/GduDisplay/Gdu460/CnsDataBar/Gdu460CnsDataBarItemManager.ts:146"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"destroy"},"destroy"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Destroys this manager. Once destroyed, the manager will no longer automatically keep track of items to render and\ndisplay."),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/GduDisplay/Gdu460/CnsDataBar/Gdu460CnsDataBarItemManager.ts:627"))}p.isMDXComponent=!0}}]);