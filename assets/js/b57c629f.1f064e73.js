"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[24349],{3905:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>m});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},s=Object.keys(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=r.createContext({}),f=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},l=function(e){var t=f(e.components);return r.createElement(d.Provider,{value:t},e.children)},c="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,s=e.originalType,d=e.parentName,l=o(e,["components","mdxType","originalType","parentName"]),c=f(n),u=i,m=c["".concat(d,".").concat(u)]||c[u]||p[u]||s;return n?r.createElement(m,a(a({ref:t},l),{},{components:n})):r.createElement(m,a({ref:t},l))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var s=n.length,a=new Array(s);a[0]=u;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[c]="string"==typeof e?e:i,a[1]=o;for(var f=2;f<s;f++)a[f]=n[f];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},24013:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>a,default:()=>p,frontMatter:()=>s,metadata:()=>o,toc:()=>f});var r=n(87462),i=(n(67294),n(3905));const s={id:"PfdTrafficInsetProps",title:"Interface: PfdTrafficInsetProps",sidebar_label:"PfdTrafficInsetProps",sidebar_position:0,custom_edit_url:null},a=void 0,o={unversionedId:"g3xtouchcommon/interfaces/PfdTrafficInsetProps",id:"g3xtouchcommon/interfaces/PfdTrafficInsetProps",title:"Interface: PfdTrafficInsetProps",description:"Component props for PfdTrafficInset.",source:"@site/docs/g3xtouchcommon/interfaces/PfdTrafficInsetProps.md",sourceDirName:"g3xtouchcommon/interfaces",slug:"/g3xtouchcommon/interfaces/PfdTrafficInsetProps",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/PfdTrafficInsetProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"PfdTrafficInsetProps",title:"Interface: PfdTrafficInsetProps",sidebar_label:"PfdTrafficInsetProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"PfdSetupViewProps",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/PfdSetupViewProps"},next:{title:"PfdWindDisplayProps",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/PfdWindDisplayProps"}},d={},f=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"displaySettingManager",id:"displaysettingmanager",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"fplSourceDataProvider",id:"fplsourcedataprovider",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"gduSettingManager",id:"gdusettingmanager",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"mapConfig",id:"mapconfig",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"side",id:"side",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"trafficSource",id:"trafficsource",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"trafficSystem",id:"trafficsystem",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"uiService",id:"uiservice",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-9",level:4}],l={toc:f},c="wrapper";function p(e){let{components:t,...n}=e;return(0,i.kt)(c,(0,r.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Component props for PfdTrafficInset."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/PfdInsetProps"},(0,i.kt)("inlineCode",{parentName:"a"},"PfdInsetProps"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"PfdTrafficInsetProps"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"children"},"children"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"children"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,i.kt)("p",null,"The children of the display component."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/PfdInsetProps"},"PfdInsetProps"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/PfdInsetProps#children"},"children")),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/FSComponent.ts:122"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"displaysettingmanager"},"displaySettingManager"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"displaySettingManager"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#displayusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"DisplayUserSettingTypes")),">"),(0,i.kt)("p",null,"A manager for display user settings."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/GduDisplay/Gdu460/PfdInstruments/Inset/Insets/PfdTrafficInset/PfdTrafficInset.tsx:44"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"fplsourcedataprovider"},"fplSourceDataProvider"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"fplSourceDataProvider"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/G3XFplSourceDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"G3XFplSourceDataProvider"))),(0,i.kt)("p",null,"A provider of flight plan source data."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/GduDisplay/Gdu460/PfdInstruments/Inset/Insets/PfdTrafficInset/PfdTrafficInset.tsx:38"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"gdusettingmanager"},"gduSettingManager"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"gduSettingManager"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#gduusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"GduUserSettingTypes")),">"),(0,i.kt)("p",null,"A manager for GDU user settings."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/GduDisplay/Gdu460/PfdInstruments/Inset/Insets/PfdTrafficInset/PfdTrafficInset.tsx:41"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"mapconfig"},"mapConfig"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"mapConfig"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/MapConfig"},(0,i.kt)("inlineCode",{parentName:"a"},"MapConfig"))),(0,i.kt)("p",null,"A configuration object defining options for the map."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/GduDisplay/Gdu460/PfdInstruments/Inset/Insets/PfdTrafficInset/PfdTrafficInset.tsx:47"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ref"},"ref"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"ref"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,i.kt)("p",null,"A reference to the display component."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/PfdInsetProps"},"PfdInsetProps"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/PfdInsetProps#ref"},"ref")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/FSComponent.ts:125"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"side"},"side"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"side"),": ",(0,i.kt)("inlineCode",{parentName:"p"},'"left"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"right"')),(0,i.kt)("p",null,"The side to which the inset belongs."),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/PfdInsetProps"},"PfdInsetProps"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/PfdInsetProps#side"},"side")),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/GduDisplay/Gdu460/PfdInstruments/Inset/PfdInset.ts:11"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"trafficsource"},"trafficSource"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"trafficSource"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/enums/G3XTrafficSystemSource"},(0,i.kt)("inlineCode",{parentName:"a"},"G3XTrafficSystemSource"))),(0,i.kt)("p",null,"The traffic data source used by the traffic system."),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/GduDisplay/Gdu460/PfdInstruments/Inset/Insets/PfdTrafficInset/PfdTrafficInset.tsx:35"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"trafficsystem"},"trafficSystem"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"trafficSystem"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"TrafficSystem")),(0,i.kt)("p",null,"The traffic system used by the map."),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/GduDisplay/Gdu460/PfdInstruments/Inset/Insets/PfdTrafficInset/PfdTrafficInset.tsx:32"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"uiservice"},"uiService"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"uiService"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiService"},(0,i.kt)("inlineCode",{parentName:"a"},"UiService"))),(0,i.kt)("p",null,"The UI service instance."),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/PfdInsetProps"},"PfdInsetProps"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/PfdInsetProps#uiservice"},"uiService")),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/GduDisplay/Gdu460/PfdInstruments/Inset/PfdInset.ts:14"))}p.isMDXComponent=!0}}]);