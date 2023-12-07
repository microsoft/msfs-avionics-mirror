"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[17008],{3905:(t,e,n)=>{n.d(e,{Zo:()=>d,kt:()=>f});var o=n(67294);function i(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function l(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,o)}return n}function r(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?l(Object(n),!0).forEach((function(e){i(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function a(t,e){if(null==t)return{};var n,o,i=function(t,e){if(null==t)return{};var n,o,i={},l=Object.keys(t);for(o=0;o<l.length;o++)n=l[o],e.indexOf(n)>=0||(i[n]=t[n]);return i}(t,e);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(t);for(o=0;o<l.length;o++)n=l[o],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(i[n]=t[n])}return i}var s=o.createContext({}),p=function(t){var e=o.useContext(s),n=e;return t&&(n="function"==typeof t?t(e):r(r({},e),t)),n},d=function(t){var e=p(t.components);return o.createElement(s.Provider,{value:e},t.children)},u="mdxType",m={inlineCode:"code",wrapper:function(t){var e=t.children;return o.createElement(o.Fragment,{},e)}},c=o.forwardRef((function(t,e){var n=t.components,i=t.mdxType,l=t.originalType,s=t.parentName,d=a(t,["components","mdxType","originalType","parentName"]),u=p(n),c=i,f=u["".concat(s,".").concat(c)]||u[c]||m[c]||l;return n?o.createElement(f,r(r({ref:e},d),{},{components:n})):o.createElement(f,r({ref:e},d))}));function f(t,e){var n=arguments,i=e&&e.mdxType;if("string"==typeof t||i){var l=n.length,r=new Array(l);r[0]=c;var a={};for(var s in e)hasOwnProperty.call(e,s)&&(a[s]=e[s]);a.originalType=t,a[u]="string"==typeof t?t:i,r[1]=a;for(var p=2;p<l;p++)r[p]=n[p];return o.createElement.apply(null,r)}return o.createElement.apply(null,n)}c.displayName="MDXCreateElement"},11872:(t,e,n)=>{n.r(e),n.d(e,{assets:()=>s,contentTitle:()=>r,default:()=>m,frontMatter:()=>l,metadata:()=>a,toc:()=>p});var o=n(87462),i=(n(67294),n(3905));const l={id:"AutopilotConfig",title:"Class: AutopilotConfig",sidebar_label:"AutopilotConfig",sidebar_position:0,custom_edit_url:null},r=void 0,a={unversionedId:"g1000common/classes/AutopilotConfig",id:"g1000common/classes/AutopilotConfig",title:"Class: AutopilotConfig",description:"A configuration object which defines options related to the autopilot.",source:"@site/docs/g1000common/classes/AutopilotConfig.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/AutopilotConfig",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/AutopilotConfig",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AutopilotConfig",title:"Class: AutopilotConfig",sidebar_label:"AutopilotConfig",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AttitudeIndicator",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/AttitudeIndicator"},next:{title:"AvionicsComputerSystem",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/AvionicsComputerSystem"}},s={},p=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"hdgOptions",id:"hdgoptions",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"isHdgSyncModeSupported",id:"ishdgsyncmodesupported",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"lnavOptions",id:"lnavoptions",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"locOptions",id:"locoptions",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"lowBankOptions",id:"lowbankoptions",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"rollOptions",id:"rolloptions",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"supportAltSelCompatibility",id:"supportaltselcompatibility",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"vorOptions",id:"voroptions",level:3},{value:"Defined in",id:"defined-in-8",level:4}],d={toc:p},u="wrapper";function m(t){let{components:e,...n}=t;return(0,i.kt)(u,(0,o.Z)({},d,n,{components:e,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A configuration object which defines options related to the autopilot."),(0,i.kt)("h2",{id:"implements"},"Implements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/Config"},(0,i.kt)("inlineCode",{parentName:"a"},"Config")))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new AutopilotConfig"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"element"),")"),(0,i.kt)("p",null,"Creates a new AutopilotConfig from a configuration document element."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"element")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},"Element")),(0,i.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")))),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Profiles/Autopilot/AutopilotConfig.ts:93"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"hdgoptions"},"hdgOptions"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"hdgOptions"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/modules#autopilothdgoptions"},(0,i.kt)("inlineCode",{parentName:"a"},"AutopilotHdgOptions"))),(0,i.kt)("p",null,"Options for the autopilot HDG director."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Profiles/Autopilot/AutopilotConfig.ts:72"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ishdgsyncmodesupported"},"isHdgSyncModeSupported"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"isHdgSyncModeSupported"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether HDG sync mode is supported."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Profiles/Autopilot/AutopilotConfig.ts:87"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavoptions"},"lnavOptions"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"lnavOptions"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/modules#autopilotlnavoptions"},(0,i.kt)("inlineCode",{parentName:"a"},"AutopilotLNavOptions"))),(0,i.kt)("p",null,"Options for the autopilot GPS/FMS director."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Profiles/Autopilot/AutopilotConfig.ts:81"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"locoptions"},"locOptions"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"locOptions"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/modules#autopilotlocoptions"},(0,i.kt)("inlineCode",{parentName:"a"},"AutopilotLocOptions"))),(0,i.kt)("p",null,"Options for the autopilot LOC director."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Profiles/Autopilot/AutopilotConfig.ts:78"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lowbankoptions"},"lowBankOptions"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"lowBankOptions"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/modules#autopilotlowbankoptions"},(0,i.kt)("inlineCode",{parentName:"a"},"AutopilotLowBankOptions"))),(0,i.kt)("p",null,"Options for the autopilot Low Bank Mode."),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Profiles/Autopilot/AutopilotConfig.ts:84"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"rolloptions"},"rollOptions"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"rollOptions"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/modules#autopilotrolloptions"},(0,i.kt)("inlineCode",{parentName:"a"},"AutopilotRollOptions"))),(0,i.kt)("p",null,"Options for the autopilot ROL director."),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Profiles/Autopilot/AutopilotConfig.ts:69"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"supportaltselcompatibility"},"supportAltSelCompatibility"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"supportAltSelCompatibility"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether ",(0,i.kt)("inlineCode",{parentName:"p"},"AP_ALT_VAR_SET")," events should be treated as ",(0,i.kt)("inlineCode",{parentName:"p"},"AP_ALT_VAR_INC"),"/",(0,i.kt)("inlineCode",{parentName:"p"},"AP_ALT_VAR_DEC")," events for compatibility\nwith ModelBehaviors that transform the latter into the former."),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Profiles/Autopilot/AutopilotConfig.ts:66"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"voroptions"},"vorOptions"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vorOptions"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/modules#autopilotvoroptions"},(0,i.kt)("inlineCode",{parentName:"a"},"AutopilotVorOptions"))),(0,i.kt)("p",null,"Options for the autopilot VOR director."),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Profiles/Autopilot/AutopilotConfig.ts:75"))}m.isMDXComponent=!0}}]);