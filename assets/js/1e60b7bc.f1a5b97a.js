"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[32559],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),d=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=d(e.components);return a.createElement(s.Provider,{value:t},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),u=d(n),m=r,f=u["".concat(s,".").concat(m)]||u[m]||c[m]||i;return n?a.createElement(f,o(o({ref:t},p),{},{components:n})):a.createElement(f,o({ref:t},p))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,o=new Array(i);o[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[u]="string"==typeof e?e:r,o[1]=l;for(var d=2;d<i;d++)o[d]=n[d];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},7446:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>c,frontMatter:()=>i,metadata:()=>l,toc:()=>d});var a=n(87462),r=(n(67294),n(3905));const i={id:"CnsDataBarProps",title:"Interface: CnsDataBarProps",sidebar_label:"CnsDataBarProps",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"g3xtouchcommon/interfaces/CnsDataBarProps",id:"g3xtouchcommon/interfaces/CnsDataBarProps",title:"Interface: CnsDataBarProps",description:"Props for the CnsDataBar component",source:"@site/docs/g3xtouchcommon/interfaces/CnsDataBarProps.md",sourceDirName:"g3xtouchcommon/interfaces",slug:"/g3xtouchcommon/interfaces/CnsDataBarProps",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/CnsDataBarProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"CnsDataBarProps",title:"Interface: CnsDataBarProps",sidebar_label:"CnsDataBarProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"CharInputSlotProps",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/CharInputSlotProps"},next:{title:"ComRadioSpacingDataProvider",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/ComRadioSpacingDataProvider"}},s={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"cnsConfig",id:"cnsconfig",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"dataBarSettingManager",id:"databarsettingmanager",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"dateTimeSettingManager",id:"datetimesettingmanager",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"fms",id:"fms",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"navDataBarEditController",id:"navdatabareditcontroller",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"navDataBarFieldModelFactory",id:"navdatabarfieldmodelfactory",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"navDataBarFieldRenderer",id:"navdatabarfieldrenderer",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"navDataFieldGpsValidity",id:"navdatafieldgpsvalidity",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"radiosConfig",id:"radiosconfig",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"uiService",id:"uiservice",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"unitsSettingManager",id:"unitssettingmanager",level:3},{value:"Defined in",id:"defined-in-12",level:4}],p={toc:d},u="wrapper";function c(e){let{components:t,...n}=e;return(0,r.kt)(u,(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Props for the ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/CnsDataBar"},"CnsDataBar")," component"),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"CnsDataBarProps"))))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"children"},"children"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"children"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,r.kt)("p",null,"The children of the display component."),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,"ComponentProps.children"),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/FSComponent.ts:122"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"cnsconfig"},"cnsConfig"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"cnsConfig"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/CnsDataBarConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"CnsDataBarConfig"))),(0,r.kt)("p",null,"The CNS data bar configuration object."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/CnsDataBar/CnsDataBar.tsx:52"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"databarsettingmanager"},"dataBarSettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"dataBarSettingManager"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#cnsdatabarusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"CnsDataBarUserSettingTypes")),">"),(0,r.kt)("p",null,"A manager for the CNS data bar user settings."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/CnsDataBar/CnsDataBar.tsx:58"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"datetimesettingmanager"},"dateTimeSettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"dateTimeSettingManager"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"DateTimeUserSettingTypes"),">"),(0,r.kt)("p",null,"A manager for date/time user settings."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/CnsDataBar/CnsDataBar.tsx:61"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fms"},"fms"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"fms"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"G3XFms")),(0,r.kt)("p",null,"The FMS."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/CnsDataBar/CnsDataBar.tsx:34"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"navdatabareditcontroller"},"navDataBarEditController"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"navDataBarEditController"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XNavDataBarEditController"},(0,r.kt)("inlineCode",{parentName:"a"},"G3XNavDataBarEditController"))),(0,r.kt)("p",null,"A controller for editing the data bar's data fields."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/CnsDataBar/CnsDataBar.tsx:49"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"navdatabarfieldmodelfactory"},"navDataBarFieldModelFactory"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"navDataBarFieldModelFactory"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NavDataBarFieldModelFactory")),(0,r.kt)("p",null,"The factory to use to create data models for the data bar's data fields."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/CnsDataBar/CnsDataBar.tsx:40"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"navdatabarfieldrenderer"},"navDataBarFieldRenderer"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"navDataBarFieldRenderer"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NavDataFieldRenderer")),(0,r.kt)("p",null,"The renderer to use to render the data bar's data fields."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/CnsDataBar/CnsDataBar.tsx:43"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"navdatafieldgpsvalidity"},"navDataFieldGpsValidity"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"navDataFieldGpsValidity"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NavDataFieldGpsValidity"),">"),(0,r.kt)("p",null,"The GPS validity state for nav data fields."),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/CnsDataBar/CnsDataBar.tsx:46"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"radiosconfig"},"radiosConfig"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"radiosConfig"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/RadiosConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"RadiosConfig"))),(0,r.kt)("p",null,"Radio configuration object."),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/CnsDataBar/CnsDataBar.tsx:55"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ref"},"ref"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"ref"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,r.kt)("p",null,"A reference to the display component."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,"ComponentProps.ref"),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/FSComponent.ts:125"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"uiservice"},"uiService"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"uiService"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiService"},(0,r.kt)("inlineCode",{parentName:"a"},"UiService"))),(0,r.kt)("p",null,"UI controller service"),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/CnsDataBar/CnsDataBar.tsx:37"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"unitssettingmanager"},"unitsSettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"unitsSettingManager"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"UnitsUserSettingManager"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"UnitsUserSettingTypes"),">"),(0,r.kt)("p",null,"A user setting manager for measurement units."),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/CnsDataBar/CnsDataBar.tsx:64"))}c.isMDXComponent=!0}}]);