"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[90695],{3905:(e,n,t)=>{t.d(n,{Zo:()=>d,kt:()=>m});var i=t(67294);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function s(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function r(e,n){if(null==e)return{};var t,i,o=function(e,n){if(null==e)return{};var t,i,o={},a=Object.keys(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var l=i.createContext({}),c=function(e){var n=i.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):s(s({},n),e)),t},d=function(e){var n=c(e.components);return i.createElement(l.Provider,{value:n},e.children)},u="mdxType",p={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},f=i.forwardRef((function(e,n){var t=e.components,o=e.mdxType,a=e.originalType,l=e.parentName,d=r(e,["components","mdxType","originalType","parentName"]),u=c(t),f=o,m=u["".concat(l,".").concat(f)]||u[f]||p[f]||a;return t?i.createElement(m,s(s({ref:n},d),{},{components:t})):i.createElement(m,s({ref:n},d))}));function m(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var a=t.length,s=new Array(a);s[0]=f;var r={};for(var l in n)hasOwnProperty.call(n,l)&&(r[l]=n[l]);r.originalType=e,r[u]="string"==typeof e?e:o,s[1]=r;for(var c=2;c<a;c++)s[c]=t[c];return i.createElement.apply(null,s)}return i.createElement.apply(null,t)}f.displayName="MDXCreateElement"},68919:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>s,default:()=>p,frontMatter:()=>a,metadata:()=>r,toc:()=>c});var i=t(87462),o=(t(67294),t(3905));const a={id:"AvionicsConfig",title:"Class: AvionicsConfig",sidebar_label:"AvionicsConfig",sidebar_position:0,custom_edit_url:null},s=void 0,r={unversionedId:"g3xtouchcommon/classes/AvionicsConfig",id:"g3xtouchcommon/classes/AvionicsConfig",title:"Class: AvionicsConfig",description:"A configuration object which defines options for G3X Touch avionics systems.",source:"@site/docs/g3xtouchcommon/classes/AvionicsConfig.md",sourceDirName:"g3xtouchcommon/classes",slug:"/g3xtouchcommon/classes/AvionicsConfig",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/AvionicsConfig",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AvionicsConfig",title:"Class: AvionicsConfig",sidebar_label:"AvionicsConfig",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AutopilotConfig",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/AutopilotConfig"},next:{title:"AvionicsStatusClient",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/AvionicsStatusClient"}},l={},c=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"annunciations",id:"annunciations",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"audio",id:"audio",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"auralAlerts",id:"auralalerts",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"autopilot",id:"autopilot",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"engine",id:"engine",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"fms",id:"fms",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"gduDefs",id:"gdudefs",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"map",id:"map",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"radios",id:"radios",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"sensors",id:"sensors",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"traffic",id:"traffic",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"transponder",id:"transponder",level:3},{value:"Defined in",id:"defined-in-12",level:4}],d={toc:c},u="wrapper";function p(e){let{components:n,...t}=e;return(0,o.kt)(u,(0,i.Z)({},d,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"A configuration object which defines options for G3X Touch avionics systems."),(0,o.kt)("h2",{id:"constructors"},"Constructors"),(0,o.kt)("h3",{id:"constructor"},"constructor"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"new AvionicsConfig"),"(",(0,o.kt)("inlineCode",{parentName:"p"},"baseInstrument"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"config"),"): ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/AvionicsConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"AvionicsConfig"))),(0,o.kt)("p",null,"Creates an AvionicsConfig from an XML configuration document."),(0,o.kt)("h4",{id:"parameters"},"Parameters"),(0,o.kt)("table",null,(0,o.kt)("thead",{parentName:"table"},(0,o.kt)("tr",{parentName:"thead"},(0,o.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,o.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,o.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,o.kt)("tbody",{parentName:"table"},(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"baseInstrument")),(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"BaseInstrument")),(0,o.kt)("td",{parentName:"tr",align:"left"},"The ",(0,o.kt)("inlineCode",{parentName:"td"},"BaseInstrument")," element associated with the configuration.")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"config")),(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"Document")),(0,o.kt)("td",{parentName:"tr",align:"left"},"An XML configuration document.")))),(0,o.kt)("h4",{id:"returns"},"Returns"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/AvionicsConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"AvionicsConfig"))),(0,o.kt)("h4",{id:"defined-in"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/AvionicsConfig.ts:63"),(0,o.kt)("h2",{id:"properties"},"Properties"),(0,o.kt)("h3",{id:"annunciations"},"annunciations"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,o.kt)("strong",{parentName:"p"},"annunciations"),": readonly ",(0,o.kt)("inlineCode",{parentName:"p"},"Annunciation"),"[]"),(0,o.kt)("p",null,"A config which defines the system annunciations."),(0,o.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/AvionicsConfig.ts:56"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"audio"},"audio"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,o.kt)("strong",{parentName:"p"},"audio"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/AudioConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"AudioConfig"))),(0,o.kt)("p",null,"A config that defines options for audio."),(0,o.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/AvionicsConfig.ts:41"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"auralalerts"},"auralAlerts"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,o.kt)("strong",{parentName:"p"},"auralAlerts"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/AuralAlertsConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"AuralAlertsConfig"))),(0,o.kt)("p",null,"A config that defines options for aural alerts."),(0,o.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/AvionicsConfig.ts:23"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"autopilot"},"autopilot"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,o.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,o.kt)("strong",{parentName:"p"},"autopilot"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/AutopilotConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"AutopilotConfig"))),(0,o.kt)("p",null,"A config that defines options for the autopilot, or ",(0,o.kt)("inlineCode",{parentName:"p"},"undefined")," if coupling to an autopilot is not supported."),(0,o.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/AvionicsConfig.ts:44"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"engine"},"engine"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,o.kt)("strong",{parentName:"p"},"engine"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/EngineConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"EngineConfig"))),(0,o.kt)("p",null,"A config that defines options for the display of engine information."),(0,o.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/AvionicsConfig.ts:53"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"fms"},"fms"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,o.kt)("strong",{parentName:"p"},"fms"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/FmsConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"FmsConfig"))),(0,o.kt)("p",null,"A config that defines FMS options."),(0,o.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/AvionicsConfig.ts:26"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"gdudefs"},"gduDefs"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,o.kt)("strong",{parentName:"p"},"gduDefs"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/GduDefsConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"GduDefsConfig"))),(0,o.kt)("p",null,"A config that defines options for GDUs."),(0,o.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/AvionicsConfig.ts:29"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"map"},"map"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,o.kt)("strong",{parentName:"p"},"map"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/MapConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"MapConfig"))),(0,o.kt)("p",null,"A config that defines options for maps."),(0,o.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/AvionicsConfig.ts:50"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"radios"},"radios"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,o.kt)("strong",{parentName:"p"},"radios"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/RadiosConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"RadiosConfig"))),(0,o.kt)("p",null,"A config that defines options for radios."),(0,o.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/AvionicsConfig.ts:35"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"sensors"},"sensors"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,o.kt)("strong",{parentName:"p"},"sensors"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/SensorsConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"SensorsConfig"))),(0,o.kt)("p",null,"A config that defines options for sensors."),(0,o.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/AvionicsConfig.ts:32"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"traffic"},"traffic"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,o.kt)("strong",{parentName:"p"},"traffic"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/TrafficConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"TrafficConfig"))),(0,o.kt)("p",null,"A config that defines options for the avionics' traffic system."),(0,o.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/AvionicsConfig.ts:47"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"transponder"},"transponder"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,o.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,o.kt)("strong",{parentName:"p"},"transponder"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/TransponderConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"TransponderConfig"))),(0,o.kt)("p",null,"A config that defines transponder options."),(0,o.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/AvionicsConfig.ts:38"))}p.isMDXComponent=!0}}]);