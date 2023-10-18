"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[49318],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>c});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=r.createContext({}),s=function(e){var t=r.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(o.Provider,{value:t},e.children)},u="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,o=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),u=s(n),m=a,c=u["".concat(o,".").concat(m)]||u[m]||f[m]||i;return n?r.createElement(c,l(l({ref:t},p),{},{components:n})):r.createElement(c,l({ref:t},p))}));function c(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=m;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[u]="string"==typeof e?e:a,l[1]=d;for(var s=2;s<i;s++)l[s]=n[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},7558:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>f,frontMatter:()=>i,metadata:()=>d,toc:()=>s});var r=n(87462),a=(n(67294),n(3905));const i={id:"MfdNavDataBarProps",title:"Interface: MfdNavDataBarProps",sidebar_label:"MfdNavDataBarProps",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"g3000mfd/interfaces/MfdNavDataBarProps",id:"g3000mfd/interfaces/MfdNavDataBarProps",title:"Interface: MfdNavDataBarProps",description:"Component props for NavDataBar.",source:"@site/docs/g3000mfd/interfaces/MfdNavDataBarProps.md",sourceDirName:"g3000mfd/interfaces",slug:"/g3000mfd/interfaces/MfdNavDataBarProps",permalink:"/msfs-avionics-mirror/docs/g3000mfd/interfaces/MfdNavDataBarProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MfdNavDataBarProps",title:"Interface: MfdNavDataBarProps",sidebar_label:"MfdNavDataBarProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"G3000MfdPluginBinder",permalink:"/msfs-avionics-mirror/docs/g3000mfd/interfaces/G3000MfdPluginBinder"},next:{title:"StartupScreenProps",permalink:"/msfs-avionics-mirror/docs/g3000mfd/interfaces/StartupScreenProps"}},o={},s=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"dataBarSettingManager",id:"databarsettingmanager",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"dateTimeSettingManager",id:"datetimesettingmanager",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"fms",id:"fms",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"gpsIntegrityDataProvider",id:"gpsintegritydataprovider",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"unitsSettingManager",id:"unitssettingmanager",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"updateFreq",id:"updatefreq",level:3},{value:"Defined in",id:"defined-in-8",level:4}],p={toc:s},u="wrapper";function f(e){let{components:t,...n}=e;return(0,a.kt)(u,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Component props for NavDataBar."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"MfdNavDataBarProps"))))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"bus"},"bus"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"bus"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,a.kt)("p",null,"The event bus."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/MFD/Components/NavDataBar/MfdNavDataBar.tsx:15"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"children"},"children"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"children"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,a.kt)("p",null,"The children of the display component."),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,"ComponentProps.children"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:122"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"databarsettingmanager"},"dataBarSettingManager"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"dataBarSettingManager"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NavDataBarSettingTypes"),">"),(0,a.kt)("p",null,"A user setting manager for the settings that control the data bar's field types."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/MFD/Components/NavDataBar/MfdNavDataBar.tsx:24"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"datetimesettingmanager"},"dateTimeSettingManager"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"dateTimeSettingManager"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"DateTimeUserSettingTypes"),">"),(0,a.kt)("p",null,"A user setting manager for date/time settings."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/MFD/Components/NavDataBar/MfdNavDataBar.tsx:30"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"fms"},"fms"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"fms"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Fms")),(0,a.kt)("p",null,"The FMS."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/MFD/Components/NavDataBar/MfdNavDataBar.tsx:18"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"gpsintegritydataprovider"},"gpsIntegrityDataProvider"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"gpsIntegrityDataProvider"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"GpsIntegrityDataProvider")),(0,a.kt)("p",null,"A provider of GPS position integrity data."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/MFD/Components/NavDataBar/MfdNavDataBar.tsx:21"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ref"},"ref"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"ref"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,a.kt)("p",null,"A reference to the display component."),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,"ComponentProps.ref"),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:125"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"unitssettingmanager"},"unitsSettingManager"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"unitsSettingManager"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"UnitsUserSettingManager")),(0,a.kt)("p",null,"A user setting manager for measurement units."),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/MFD/Components/NavDataBar/MfdNavDataBar.tsx:27"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"updatefreq"},"updateFreq"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"updateFreq"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The update frequency of the data fields, in hertz."),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/MFD/Components/NavDataBar/MfdNavDataBar.tsx:33"))}f.isMDXComponent=!0}}]);