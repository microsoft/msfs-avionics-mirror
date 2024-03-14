"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[22304],{3905:(e,n,t)=>{t.d(n,{Zo:()=>u,kt:()=>f});var i=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,i,r=function(e,n){if(null==e)return{};var t,i,r={},o=Object.keys(e);for(i=0;i<o.length;i++)t=o[i],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)t=o[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var s=i.createContext({}),m=function(e){var n=i.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},u=function(e){var n=m(e.components);return i.createElement(s.Provider,{value:n},e.children)},c="mdxType",p={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},d=i.forwardRef((function(e,n){var t=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),c=m(t),d=r,f=c["".concat(s,".").concat(d)]||c[d]||p[d]||o;return t?i.createElement(f,a(a({ref:n},u),{},{components:t})):i.createElement(f,a({ref:n},u))}));function f(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var o=t.length,a=new Array(o);a[0]=d;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l[c]="string"==typeof e?e:r,a[1]=l;for(var m=2;m<o;m++)a[m]=t[m];return i.createElement.apply(null,a)}return i.createElement.apply(null,t)}d.displayName="MDXCreateElement"},76714:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>a,default:()=>p,frontMatter:()=>o,metadata:()=>l,toc:()=>m});var i=t(87462),r=(t(67294),t(3905));const o={id:"FmsConfig",title:"Class: FmsConfig",sidebar_label:"FmsConfig",sidebar_position:0,custom_edit_url:null},a=void 0,l={unversionedId:"g3xtouchcommon/classes/FmsConfig",id:"g3xtouchcommon/classes/FmsConfig",title:"Class: FmsConfig",description:"A configuration object which defines FMS options.",source:"@site/docs/g3xtouchcommon/classes/FmsConfig.md",sourceDirName:"g3xtouchcommon/classes",slug:"/g3xtouchcommon/classes/FmsConfig",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/FmsConfig",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FmsConfig",title:"Class: FmsConfig",sidebar_label:"FmsConfig",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPlannerFlightPlanDataArray",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/FlightPlannerFlightPlanDataArray"},next:{title:"FmsExternalFplSourceConfig",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/FmsExternalFplSourceConfig"}},s={},m=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"externalFplSourceCount",id:"externalfplsourcecount",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"externalFplSources",id:"externalfplsources",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"flightPathOptions",id:"flightpathoptions",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"flightPlanning",id:"flightplanning",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"lnavIndex",id:"lnavindex",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"syncToSim",id:"synctosim",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"useSimObsState",id:"usesimobsstate",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"vnavIndex",id:"vnavindex",level:3},{value:"Defined in",id:"defined-in-8",level:4}],u={toc:m},c="wrapper";function p(e){let{components:n,...t}=e;return(0,r.kt)(c,(0,i.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A configuration object which defines FMS options."),(0,r.kt)("h2",{id:"implements"},"Implements"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/Config"},(0,r.kt)("inlineCode",{parentName:"a"},"Config")))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new FmsConfig"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/FmsConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"FmsConfig"))),(0,r.kt)("p",null,"Creates a new FmsConfig from a configuration document element."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/FmsConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"FmsConfig"))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/FmsConfig.ts:53"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"externalfplsourcecount"},"externalFplSourceCount"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"externalFplSourceCount"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"0")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"2")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"1")),(0,r.kt)("p",null,"The number of supported external flight plan data sources."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/FmsConfig.ts:47"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"externalfplsources"},"externalFplSources"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"externalFplSources"),": readonly (",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/FmsExternalFplSourceConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"FmsExternalFplSourceConfig")),")[]"),(0,r.kt)("p",null,"Configs that define options for external flight plan data sources. The index of each config corresponds to the\nindex of the source's parent external navigator."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/FmsConfig.ts:44"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"flightpathoptions"},"flightPathOptions"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"flightPathOptions"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#fmsflightpathoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"FmsFlightPathOptions"))),(0,r.kt)("p",null,"Options for flight path calculations."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/FmsConfig.ts:35"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"flightplanning"},"flightPlanning"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"flightPlanning"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/FmsFlightPlanningConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"FmsFlightPlanningConfig"))),(0,r.kt)("p",null,"A config that defines options for flight planning."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/FmsConfig.ts:38"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnavindex"},"lnavIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"lnavIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the LNAV instance to use for the internal navigation source."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/FmsConfig.ts:23"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"synctosim"},"syncToSim"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"syncToSim"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether to sync the internal primary flight plan to the sim."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/FmsConfig.ts:32"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"usesimobsstate"},"useSimObsState"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"useSimObsState"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether the internal navigation source uses the sim's native OBS state."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/FmsConfig.ts:26"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"vnavindex"},"vnavIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"vnavIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the VNAV instance to use for the internal navigation source."),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/AvionicsConfig/FmsConfig.ts:29"))}p.isMDXComponent=!0}}]);