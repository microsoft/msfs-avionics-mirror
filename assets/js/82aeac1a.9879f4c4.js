"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[13259],{3905:(e,n,t)=>{t.d(n,{Zo:()=>c,kt:()=>g});var i=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,i,r=function(e,n){if(null==e)return{};var t,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var s=i.createContext({}),u=function(e){var n=i.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},c=function(e){var n=u(e.components);return i.createElement(s.Provider,{value:n},e.children)},d="mdxType",p={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},m=i.forwardRef((function(e,n){var t=e.components,r=e.mdxType,a=e.originalType,s=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),d=u(t),m=r,g=d["".concat(s,".").concat(m)]||d[m]||p[m]||a;return t?i.createElement(g,l(l({ref:n},c),{},{components:t})):i.createElement(g,l({ref:n},c))}));function g(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var a=t.length,l=new Array(a);l[0]=m;var o={};for(var s in n)hasOwnProperty.call(n,s)&&(o[s]=n[s]);o.originalType=e,o[d]="string"==typeof e?e:r,l[1]=o;for(var u=2;u<a;u++)l[u]=t[u];return i.createElement.apply(null,l)}return i.createElement.apply(null,t)}m.displayName="MDXCreateElement"},83016:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>l,default:()=>p,frontMatter:()=>a,metadata:()=>o,toc:()=>u});var i=t(87462),r=(t(67294),t(3905));const a={id:"G3XTouchPluginBinder",title:"Interface: G3XTouchPluginBinder",sidebar_label:"G3XTouchPluginBinder",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"g3xtouchcommon/interfaces/G3XTouchPluginBinder",id:"g3xtouchcommon/interfaces/G3XTouchPluginBinder",title:"Interface: G3XTouchPluginBinder",description:"A plugin binder for G3X Touch plugins.",source:"@site/docs/g3xtouchcommon/interfaces/G3XTouchPluginBinder.md",sourceDirName:"g3xtouchcommon/interfaces",slug:"/g3xtouchcommon/interfaces/G3XTouchPluginBinder",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/G3XTouchPluginBinder",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"G3XTouchPluginBinder",title:"Interface: G3XTouchPluginBinder",sidebar_label:"G3XTouchPluginBinder",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"G3XTouchPlugin",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/G3XTouchPlugin"},next:{title:"G3XTrafficMapOperatingModeIndicatorProps",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/G3XTrafficMapOperatingModeIndicatorProps"}},s={},u=[{value:"Properties",id:"properties",level:2},{value:"backplane",id:"backplane",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"casSystem",id:"cassystem",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"config",id:"config",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"displaySettingManager",id:"displaysettingmanager",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"facLoader",id:"facloader",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"flightPathCalculator",id:"flightpathcalculator",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"fms",id:"fms",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"fplSourceDataProvider",id:"fplsourcedataprovider",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"gduSettingManager",id:"gdusettingmanager",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"instrumentConfig",id:"instrumentconfig",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"navIndicators",id:"navindicators",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"pfdSettingManager",id:"pfdsettingmanager",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"uiService",id:"uiservice",level:3},{value:"Defined in",id:"defined-in-13",level:4}],c={toc:u},d="wrapper";function p(e){let{components:n,...t}=e;return(0,r.kt)(d,(0,i.Z)({},c,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A plugin binder for G3X Touch plugins."),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"backplane"},"backplane"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"backplane"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"InstrumentBackplane")),(0,r.kt)("p",null,"The backplane instance."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:27"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"bus"},"bus"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"bus"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,r.kt)("p",null,"The event bus."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:24"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"cassystem"},"casSystem"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"casSystem"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"CasSystem")),(0,r.kt)("p",null,"The CAS system."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:51"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"config"},"config"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"config"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/AvionicsConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"AvionicsConfig"))),(0,r.kt)("p",null,"The global avionics configuration object."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:30"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"displaysettingmanager"},"displaySettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"displaySettingManager"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/DisplayUserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"DisplayUserSettingManager"))),(0,r.kt)("p",null,"A manager for display user settings."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:60"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"facloader"},"facLoader"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"facLoader"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"FacilityLoader")),(0,r.kt)("p",null,"The facility loader."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:36"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"flightpathcalculator"},"flightPathCalculator"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"flightPathCalculator"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"FlightPathCalculator")),(0,r.kt)("p",null,"The lateral flight plan path calculator."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:39"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fms"},"fms"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"fms"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XFms"},(0,r.kt)("inlineCode",{parentName:"a"},"G3XFms"))),(0,r.kt)("p",null,"The FMS instance."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:42"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fplsourcedataprovider"},"fplSourceDataProvider"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"fplSourceDataProvider"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/G3XFplSourceDataProvider"},(0,r.kt)("inlineCode",{parentName:"a"},"G3XFplSourceDataProvider"))),(0,r.kt)("p",null,"A provider of flight plan source data."),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:54"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"gdusettingmanager"},"gduSettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"gduSettingManager"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/GduUserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"GduUserSettingManager"))),(0,r.kt)("p",null,"A manager for GDU user settings."),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:57"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"instrumentconfig"},"instrumentConfig"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"instrumentConfig"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/InstrumentConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"InstrumentConfig"))),(0,r.kt)("p",null,"The instrument configuration object."),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:33"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"navindicators"},"navIndicators"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"navIndicators"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#g3xtouchnavindicators"},(0,r.kt)("inlineCode",{parentName:"a"},"G3XTouchNavIndicators"))),(0,r.kt)("p",null,"A collection of all navigation indicators."),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:48"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"pfdsettingmanager"},"pfdSettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"pfdSettingManager"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/PfdUserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"PfdUserSettingManager"))),(0,r.kt)("p",null,"A manager for PFD user settings."),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:63"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"uiservice"},"uiService"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"uiService"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiService"},(0,r.kt)("inlineCode",{parentName:"a"},"UiService"))),(0,r.kt)("p",null,"The UI service."),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/G3XTouchPlugin.ts:45"))}p.isMDXComponent=!0}}]);