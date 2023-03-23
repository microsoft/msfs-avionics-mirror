"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[28137],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>k});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=a.createContext({}),d=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=d(e.components);return a.createElement(p.Provider,{value:t},e.children)},m="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=d(n),u=r,k=m["".concat(p,".").concat(u)]||m[u]||f[u]||i;return n?a.createElement(k,l(l({ref:t},s),{},{components:n})):a.createElement(k,l({ref:t},s))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=u;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[m]="string"==typeof e?e:r,l[1]=o;for(var d=2;d<i;d++)l[d]=n[d];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},59514:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>f,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var a=n(87462),r=(n(67294),n(3905));const i={id:"ToldConfig",title:"Class: ToldConfig",sidebar_label:"ToldConfig",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"g3000common/classes/ToldConfig",id:"g3000common/classes/ToldConfig",title:"Class: ToldConfig",description:"A configuration object which defines options related to TOLD (takeoff/landing) performance calculations.",source:"@site/docs/g3000common/classes/ToldConfig.md",sourceDirName:"g3000common/classes",slug:"/g3000common/classes/ToldConfig",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/ToldConfig",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"ToldConfig",title:"Class: ToldConfig",sidebar_label:"ToldConfig",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"ToggleStatusBar",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/ToggleStatusBar"},next:{title:"ToldUserSettings",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/ToldUserSettings"}},p={},d=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"landing",id:"landing",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"takeoff",id:"takeoff",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"parseAntiIce",id:"parseantiice",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"parseAutothrottle",id:"parseautothrottle",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"parseFlaps",id:"parseflaps",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"parseFlapsOption",id:"parseflapsoption",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"parseLanding",id:"parselanding",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"parseRollingTakeoff",id:"parserollingtakeoff",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"parseTakeoff",id:"parsetakeoff",level:3},{value:"Parameters",id:"parameters-7",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"parseThrustReverser",id:"parsethrustreverser",level:3},{value:"Parameters",id:"parameters-8",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-10",level:4}],s={toc:d},m="wrapper";function f(e){let{components:t,...n}=e;return(0,r.kt)(m,(0,a.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A configuration object which defines options related to TOLD (takeoff/landing) performance calculations."),(0,r.kt)("h2",{id:"implements"},"Implements"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/Config"},(0,r.kt)("inlineCode",{parentName:"a"},"Config")))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new ToldConfig"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),")"),(0,r.kt)("p",null,"Creates a new ToldConfig from a configuration document element."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldConfig.ts:132"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"landing"},"landing"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"landing"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#landingperfconfigurationoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"LandingPerfConfigurationOptions")),">"),(0,r.kt)("p",null,"Landing options."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldConfig.ts:126"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"takeoff"},"takeoff"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"takeoff"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#takeoffperfconfigurationoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"TakeoffPerfConfigurationOptions")),">"),(0,r.kt)("p",null,"Takeoff options."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldConfig.ts:123"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"parseantiice"},"parseAntiIce"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"parseAntiIce"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldantiiceoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"ToldAntiIceOptions"))),(0,r.kt)("p",null,"Parses anti-ice options from a configuration document element."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldantiiceoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"ToldAntiIceOptions"))),(0,r.kt)("p",null,"The anti-ice options defined by the configuration document element, or ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," if the element is ",(0,r.kt)("inlineCode",{parentName:"p"},"null"),"."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldConfig.ts:226"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"parseautothrottle"},"parseAutothrottle"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"parseAutothrottle"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldautothrottleoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"ToldAutothrottleOptions"))),(0,r.kt)("p",null,"Parses autothrottle options from a configuration document element."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldautothrottleoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"ToldAutothrottleOptions"))),(0,r.kt)("p",null,"The autothrottle options defined by the configuration document element, or ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," if the element is ",(0,r.kt)("inlineCode",{parentName:"p"},"null"),"."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldConfig.ts:291"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"parseflaps"},"parseFlaps"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"parseFlaps"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldflapsoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"ToldFlapsOptions"))),(0,r.kt)("p",null,"Parses flaps options from a configuration document element."),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldflapsoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"ToldFlapsOptions"))),(0,r.kt)("p",null,"The flaps options defined by the configuration document element, or ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," if the element is ",(0,r.kt)("inlineCode",{parentName:"p"},"null"),"."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldConfig.ts:174"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"parseflapsoption"},"parseFlapsOption"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"parseFlapsOption"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldflapsoption"},(0,r.kt)("inlineCode",{parentName:"a"},"ToldFlapsOption"))),(0,r.kt)("p",null,"Parses a single flaps option from a configuration document element."),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldflapsoption"},(0,r.kt)("inlineCode",{parentName:"a"},"ToldFlapsOption"))),(0,r.kt)("p",null,"The flaps option defined by the configuration document element, or ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," if the element is malformed."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldConfig.ts:205"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"parselanding"},"parseLanding"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"parseLanding"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#landingperfconfigurationoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"LandingPerfConfigurationOptions"))),(0,r.kt)("p",null,"Parses takeoff options from a configuration document element."),(0,r.kt)("h4",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")))),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#landingperfconfigurationoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"LandingPerfConfigurationOptions"))),(0,r.kt)("p",null,"The takeoff options defined by the configuration document element."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldConfig.ts:160"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"parserollingtakeoff"},"parseRollingTakeoff"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"parseRollingTakeoff"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldrollingtakeoffoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"ToldRollingTakeoffOptions"))),(0,r.kt)("p",null,"Parses rolling takeoff options from a configuration document element."),(0,r.kt)("h4",{id:"parameters-6"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldrollingtakeoffoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"ToldRollingTakeoffOptions"))),(0,r.kt)("p",null,"The rolling takeoff options defined by the configuration document element, or ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," if the element is ",(0,r.kt)("inlineCode",{parentName:"p"},"null"),"."),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldConfig.ts:265"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"parsetakeoff"},"parseTakeoff"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"parseTakeoff"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#takeoffperfconfigurationoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"TakeoffPerfConfigurationOptions"))),(0,r.kt)("p",null,"Parses takeoff options from a configuration document element."),(0,r.kt)("h4",{id:"parameters-7"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")))),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#takeoffperfconfigurationoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"TakeoffPerfConfigurationOptions"))),(0,r.kt)("p",null,"The takeoff options defined by the configuration document element."),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldConfig.ts:146"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"parsethrustreverser"},"parseThrustReverser"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"parseThrustReverser"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldthrustreverseroptions"},(0,r.kt)("inlineCode",{parentName:"a"},"ToldThrustReverserOptions"))),(0,r.kt)("p",null,"Parses thrust reverser options from a configuration document element."),(0,r.kt)("h4",{id:"parameters-8"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")))),(0,r.kt)("h4",{id:"returns-7"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldthrustreverseroptions"},(0,r.kt)("inlineCode",{parentName:"a"},"ToldThrustReverserOptions"))),(0,r.kt)("p",null,"The thrust reverser options defined by the configuration document element, or ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," if the element is ",(0,r.kt)("inlineCode",{parentName:"p"},"null"),"."),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldConfig.ts:250"))}f.isMDXComponent=!0}}]);