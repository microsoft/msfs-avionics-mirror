"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[34190],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>v});var a=n(67294);function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,a,l=function(e,t){if(null==e)return{};var n,a,l={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(l[n]=e[n]);return l}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(l[n]=e[n])}return l}var s=a.createContext({}),o=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},p=function(e){var t=o(e.components);return a.createElement(s.Provider,{value:t},e.children)},k="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,l=e.mdxType,i=e.originalType,s=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),k=o(n),u=l,v=k["".concat(s,".").concat(u)]||k[u]||m[u]||i;return n?a.createElement(v,r(r({ref:t},p),{},{components:n})):a.createElement(v,r({ref:t},p))}));function v(e,t){var n=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var i=n.length,r=new Array(i);r[0]=u;var d={};for(var s in t)hasOwnProperty.call(t,s)&&(d[s]=t[s]);d.originalType=e,d[k]="string"==typeof e?e:l,r[1]=d;for(var o=2;o<i;o++)r[o]=n[o];return a.createElement.apply(null,r)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},79453:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>r,default:()=>m,frontMatter:()=>i,metadata:()=>d,toc:()=>o});var a=n(87462),l=(n(67294),n(3905));const i={id:"FPLDetailsController",title:"Class: FPLDetailsController",sidebar_label:"FPLDetailsController",sidebar_position:0,custom_edit_url:null},r=void 0,d={unversionedId:"g1000common/classes/FPLDetailsController",id:"g1000common/classes/FPLDetailsController",title:"Class: FPLDetailsController",description:"Controller for FPLDetails",source:"@site/docs/g1000common/classes/FPLDetailsController.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/FPLDetailsController",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/FPLDetailsController",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FPLDetailsController",title:"Class: FPLDetailsController",sidebar_label:"FPLDetailsController",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FPLDetails",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/FPLDetails"},next:{title:"FPLDetailsStore",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/FPLDetailsStore"}},s={},o=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"airwaysCollapsed",id:"airwayscollapsed",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"didInitScroll",id:"didinitscroll",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"fms",id:"fms",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"hasVnav",id:"hasvnav",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"isInitialized",id:"isinitialized",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"legArrowRef",id:"legarrowref",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"originRef",id:"originref",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"scrollMode",id:"scrollmode",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"scrollToActiveLegCb",id:"scrolltoactivelegcb",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Returns",id:"returns",level:5},{value:"Defined in",id:"defined-in-10",level:4},{value:"sectionRefs",id:"sectionrefs",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"store",id:"store",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"Methods",id:"methods",level:2},{value:"clearActiveWaypoints",id:"clearactivewaypoints",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"collapseAirways",id:"collapseairways",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"initActiveLeg",id:"initactiveleg",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"initDtoLeg",id:"initdtoleg",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"initialize",id:"initialize",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"manageCollapsedAirways",id:"managecollapsedairways",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"notifyActiveLegState",id:"notifyactivelegstate",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"onActiveLegStateChange",id:"onactivelegstatechange",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"onFlightPlanLoaded",id:"onflightplanloaded",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"onLegChange",id:"onlegchange",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-10",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"onOriginDestChanged",id:"onorigindestchanged",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"onPlanCalculated",id:"onplancalculated",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-12",level:4},{value:"Defined in",id:"defined-in-24",level:4},{value:"onPlanIndexChanged",id:"onplanindexchanged",level:3},{value:"Parameters",id:"parameters-7",level:4},{value:"Returns",id:"returns-13",level:4},{value:"Defined in",id:"defined-in-25",level:4},{value:"onProcDetailsChanged",id:"onprocdetailschanged",level:3},{value:"Parameters",id:"parameters-8",level:4},{value:"Returns",id:"returns-14",level:4},{value:"Defined in",id:"defined-in-26",level:4},{value:"onSegmentChange",id:"onsegmentchange",level:3},{value:"Parameters",id:"parameters-9",level:4},{value:"Returns",id:"returns-15",level:4},{value:"Defined in",id:"defined-in-27",level:4},{value:"onVerticalDirect",id:"onverticaldirect",level:3},{value:"Parameters",id:"parameters-10",level:4},{value:"Returns",id:"returns-16",level:4},{value:"Defined in",id:"defined-in-28",level:4},{value:"onVnavUpdated",id:"onvnavupdated",level:3},{value:"Parameters",id:"parameters-11",level:4},{value:"Returns",id:"returns-17",level:4},{value:"Defined in",id:"defined-in-29",level:4},{value:"updateActiveLegState",id:"updateactivelegstate",level:3},{value:"Returns",id:"returns-18",level:4},{value:"Defined in",id:"defined-in-30",level:4},{value:"updateSectionsHeaderEmptyRow",id:"updatesectionsheaderemptyrow",level:3},{value:"Returns",id:"returns-19",level:4},{value:"Defined in",id:"defined-in-31",level:4}],p={toc:o},k="wrapper";function m(e){let{components:t,...n}=e;return(0,l.kt)(k,(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"Controller for FPLDetails"),(0,l.kt)("h2",{id:"constructors"},"Constructors"),(0,l.kt)("h3",{id:"constructor"},"constructor"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"new FPLDetailsController"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"store"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"fms"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"scrollToActiveLegCb"),")"),(0,l.kt)("p",null,"Constructor"),(0,l.kt)("h4",{id:"parameters"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"store")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/classes/FPLDetailsStore"},(0,l.kt)("inlineCode",{parentName:"a"},"FPLDetailsStore"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"the store instance")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"fms")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"Fms")),(0,l.kt)("td",{parentName:"tr",align:"left"},"the fms")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"bus")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,l.kt)("td",{parentName:"tr",align:"left"},"the bus")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"scrollToActiveLegCb")),(0,l.kt)("td",{parentName:"tr",align:"left"},"() => ",(0,l.kt)("inlineCode",{parentName:"td"},"void")),(0,l.kt)("td",{parentName:"tr",align:"left"},"the callback for scroll to active leg")))),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:46"),(0,l.kt)("h2",{id:"properties"},"Properties"),(0,l.kt)("h3",{id:"airwayscollapsed"},"airwaysCollapsed"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"airwaysCollapsed"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,l.kt)("inlineCode",{parentName:"p"},"false")),(0,l.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:34"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"bus"},"bus"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"bus"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,l.kt)("p",null,"the bus"),(0,l.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:46"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"didinitscroll"},"didInitScroll"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"didInitScroll"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,l.kt)("inlineCode",{parentName:"p"},"false")),(0,l.kt)("p",null,"First time this view is loaded, we need to force scroll to the active leg"),(0,l.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:37"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"fms"},"fms"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"fms"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"Fms")),(0,l.kt)("p",null,"the fms"),(0,l.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:46"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"hasvnav"},"hasVnav"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"hasVnav"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,l.kt)("inlineCode",{parentName:"p"},"false")),(0,l.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:32"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"isinitialized"},"isInitialized"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"isInitialized"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,l.kt)("inlineCode",{parentName:"p"},"false")),(0,l.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:33"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"legarrowref"},"legArrowRef"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"legArrowRef"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/FplActiveLegArrow"},(0,l.kt)("inlineCode",{parentName:"a"},"FplActiveLegArrow")),">"),(0,l.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:31"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"originref"},"originRef"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"originRef"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/FPLOrigin"},(0,l.kt)("inlineCode",{parentName:"a"},"FPLOrigin")),">"),(0,l.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:30"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"scrollmode"},"scrollMode"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"scrollMode"),": ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/enums/ScrollMode"},(0,l.kt)("inlineCode",{parentName:"a"},"ScrollMode"))," = ",(0,l.kt)("inlineCode",{parentName:"p"},"ScrollMode.MANUAL")),(0,l.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:35"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"scrolltoactivelegcb"},"scrollToActiveLegCb"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"scrollToActiveLegCb"),": () => ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,l.kt)("p",null,"\u25b8 (): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"the callback for scroll to active leg"),(0,l.kt)("h5",{id:"returns"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:46"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"sectionrefs"},"sectionRefs"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"sectionRefs"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/FPLSection"},(0,l.kt)("inlineCode",{parentName:"a"},"FPLSection")),">","[] = ",(0,l.kt)("inlineCode",{parentName:"p"},"[]")),(0,l.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:29"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"store"},"store"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"store"),": ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/FPLDetailsStore"},(0,l.kt)("inlineCode",{parentName:"a"},"FPLDetailsStore"))),(0,l.kt)("p",null,"the store instance"),(0,l.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:46"),(0,l.kt)("h2",{id:"methods"},"Methods"),(0,l.kt)("h3",{id:"clearactivewaypoints"},"clearActiveWaypoints"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"clearActiveWaypoints"),"(): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"Sets all legs in the displayed plan to inactive."),(0,l.kt)("h4",{id:"returns-1"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:568"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"collapseairways"},"collapseAirways"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("strong",{parentName:"p"},"collapseAirways"),"(): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"A method called to collapse the airways."),(0,l.kt)("h4",{id:"returns-2"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:503"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"initactiveleg"},"initActiveLeg"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("strong",{parentName:"p"},"initActiveLeg"),"(): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"A method to initialize the active leg.\nTODO: REMOVE THIS WHEN THE ROOT PROBLEM IS FIXED"),(0,l.kt)("h4",{id:"returns-3"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:130"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"initdtoleg"},"initDtoLeg"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("strong",{parentName:"p"},"initDtoLeg"),"(): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"A method to initialize the dto leg.\nTODO: REMOVE THIS WHEN THE ROOT PROBLEM IS FIXED"),(0,l.kt)("h4",{id:"returns-4"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:138"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"initialize"},"initialize"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("strong",{parentName:"p"},"initialize"),"(): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"Initializes fpldetails controller"),(0,l.kt)("h4",{id:"returns-5"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:53"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"managecollapsedairways"},"manageCollapsedAirways"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"manageCollapsedAirways"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"plan"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"A method called to manage collapsed airways when the active segment changes."),(0,l.kt)("h4",{id:"parameters-1"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"plan")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"FlightPlan")),(0,l.kt)("td",{parentName:"tr",align:"left"},"is the flight plan")))),(0,l.kt)("h4",{id:"returns-6"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:526"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"notifyactivelegstate"},"notifyActiveLegState"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"notifyActiveLegState"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"plan"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"Notifies this controller's sections of the flight plan's active leg state."),(0,l.kt)("h4",{id:"parameters-2"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"plan")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"FlightPlan")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The flight plan.")))),(0,l.kt)("h4",{id:"returns-7"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:549"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"onactivelegstatechange"},"onActiveLegStateChange"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"onActiveLegStateChange"),"(): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"Manages the state of the active/direct leg indications based on the store.activeLegState subject state."),(0,l.kt)("h4",{id:"returns-8"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:368"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"onflightplanloaded"},"onFlightPlanLoaded"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"onFlightPlanLoaded"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"e"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"A callback fired when a new plan is loaded."),(0,l.kt)("h4",{id:"parameters-3"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"e")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"FlightPlanIndicationEvent")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The event that was captured.")))),(0,l.kt)("h4",{id:"returns-9"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:243"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"onlegchange"},"onLegChange"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"onLegChange"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"e"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"A callback fired when a flight plan leg changes."),(0,l.kt)("h4",{id:"parameters-4"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"e")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"FlightPlanLegEvent")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The event that was captured.")))),(0,l.kt)("h4",{id:"returns-10"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:428"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"onorigindestchanged"},"onOriginDestChanged"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"onOriginDestChanged"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"e"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"A callback fired when the origin or destination is updated."),(0,l.kt)("h4",{id:"parameters-5"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"e")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"FlightPlanOriginDestEvent")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The event that was captured.")))),(0,l.kt)("h4",{id:"returns-11"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-23"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:329"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"onplancalculated"},"onPlanCalculated"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"onPlanCalculated"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"e"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"A callback fired when the plan is calculated."),(0,l.kt)("h4",{id:"parameters-6"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"e")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"FlightPlanCalculatedEvent")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The event that was captured.")))),(0,l.kt)("h4",{id:"returns-12"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-24"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:301"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"onplanindexchanged"},"onPlanIndexChanged"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"onPlanIndexChanged"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"e"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"A callback fired when the plan index changes (used for handling direct to display)."),(0,l.kt)("h4",{id:"parameters-7"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"e")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"FlightPlanIndicationEvent")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The event that was captured.")))),(0,l.kt)("h4",{id:"returns-13"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-25"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:278"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"onprocdetailschanged"},"onProcDetailsChanged"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"onProcDetailsChanged"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"e"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"A callback fired when a proc details event is received from the bus."),(0,l.kt)("h4",{id:"parameters-8"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"e")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"FlightPlanProcedureDetailsEvent")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The event that was captured.")))),(0,l.kt)("h4",{id:"returns-14"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-26"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:151"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"onsegmentchange"},"onSegmentChange"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"onSegmentChange"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"e"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"A callback fired when a flight plan segment changes."),(0,l.kt)("h4",{id:"parameters-9"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"e")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"FlightPlanSegmentEvent")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The event that was captured.")))),(0,l.kt)("h4",{id:"returns-15"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-27"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:463"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"onverticaldirect"},"onVerticalDirect"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"onVerticalDirect"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"state"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"A callback fired when the Vertical Direct softkey is pressed."),(0,l.kt)("h4",{id:"parameters-10"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"state")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"boolean")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The event value was captured.")))),(0,l.kt)("h4",{id:"returns-16"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-28"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:225"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"onvnavupdated"},"onVnavUpdated"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"onVnavUpdated"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"planIndex"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"A callback fired when a vnav updated message is recevied from the bus."),(0,l.kt)("h4",{id:"parameters-11"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"planIndex")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"number")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The index of the vertical plan that was updated by the path calculator.")))),(0,l.kt)("h4",{id:"returns-17"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-29"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:172"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"updateactivelegstate"},"updateActiveLegState"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"updateActiveLegState"),"(): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"Updates the active leg state subjects."),(0,l.kt)("h4",{id:"returns-18"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-30"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:397"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"updatesectionsheaderemptyrow"},"updateSectionsHeaderEmptyRow"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,l.kt)("strong",{parentName:"p"},"updateSectionsHeaderEmptyRow"),"(): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"Updates all section headers and empty rows."),(0,l.kt)("h4",{id:"returns-19"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in-31"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/FPL/FPLDetailsController.ts:490"))}m.isMDXComponent=!0}}]);