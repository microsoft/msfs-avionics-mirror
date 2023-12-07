"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[85036],{3905:(e,a,n)=>{n.d(a,{Zo:()=>s,kt:()=>f});var t=n(67294);function i(e,a,n){return a in e?Object.defineProperty(e,a,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[a]=n,e}function l(e,a){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);a&&(t=t.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),n.push.apply(n,t)}return n}function r(e){for(var a=1;a<arguments.length;a++){var n=null!=arguments[a]?arguments[a]:{};a%2?l(Object(n),!0).forEach((function(a){i(e,a,n[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(n,a))}))}return e}function o(e,a){if(null==e)return{};var n,t,i=function(e,a){if(null==e)return{};var n,t,i={},l=Object.keys(e);for(t=0;t<l.length;t++)n=l[t],a.indexOf(n)>=0||(i[n]=e[n]);return i}(e,a);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(t=0;t<l.length;t++)n=l[t],a.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=t.createContext({}),p=function(e){var a=t.useContext(d),n=a;return e&&(n="function"==typeof e?e(a):r(r({},a),e)),n},s=function(e){var a=p(e.components);return t.createElement(d.Provider,{value:a},e.children)},m="mdxType",v={inlineCode:"code",wrapper:function(e){var a=e.children;return t.createElement(t.Fragment,{},a)}},c=t.forwardRef((function(e,a){var n=e.components,i=e.mdxType,l=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=p(n),c=i,f=m["".concat(d,".").concat(c)]||m[c]||v[c]||l;return n?t.createElement(f,r(r({ref:a},s),{},{components:n})):t.createElement(f,r({ref:a},s))}));function f(e,a){var n=arguments,i=a&&a.mdxType;if("string"==typeof e||i){var l=n.length,r=new Array(l);r[0]=c;var o={};for(var d in a)hasOwnProperty.call(a,d)&&(o[d]=a[d]);o.originalType=e,o[m]="string"==typeof e?e:i,r[1]=o;for(var p=2;p<l;p++)r[p]=n[p];return t.createElement.apply(null,r)}return t.createElement.apply(null,n)}c.displayName="MDXCreateElement"},70902:(e,a,n)=>{n.r(a),n.d(a,{assets:()=>d,contentTitle:()=>r,default:()=>v,frontMatter:()=>l,metadata:()=>o,toc:()=>p});var t=n(87462),i=(n(67294),n(3905));const l={id:"MapStandaloneFlightPlanPlanDataProvider",title:"Class: MapStandaloneFlightPlanPlanDataProvider",sidebar_label:"MapStandaloneFlightPlanPlanDataProvider",sidebar_position:0,custom_edit_url:null},r=void 0,o={unversionedId:"garminsdk/classes/MapStandaloneFlightPlanPlanDataProvider",id:"garminsdk/classes/MapStandaloneFlightPlanPlanDataProvider",title:"Class: MapStandaloneFlightPlanPlanDataProvider",description:"A MapFlightPlanDataProvider which provides data for a standalone flight plan not owned by a flight planner.",source:"@site/docs/garminsdk/classes/MapStandaloneFlightPlanPlanDataProvider.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/MapStandaloneFlightPlanPlanDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapStandaloneFlightPlanPlanDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapStandaloneFlightPlanPlanDataProvider",title:"Class: MapStandaloneFlightPlanPlanDataProvider",sidebar_label:"MapStandaloneFlightPlanPlanDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapRunwayOutlineWaypointCache",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapRunwayOutlineWaypointCache"},next:{title:"MapSymbolVisController",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapSymbolVisController"}},d={},p=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"activeLateralLegIndex",id:"activelaterallegindex",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"lnavData",id:"lnavdata",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"obsCourse",id:"obscourse",level:3},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"plan",id:"plan",level:3},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"planCalculated",id:"plancalculated",level:3},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"planModified",id:"planmodified",level:3},{value:"Implementation of",id:"implementation-of-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"vnavBocLegIndex",id:"vnavboclegindex",level:3},{value:"Implementation of",id:"implementation-of-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"vnavBodLegIndex",id:"vnavbodlegindex",level:3},{value:"Implementation of",id:"implementation-of-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"vnavDistanceToToc",id:"vnavdistancetotoc",level:3},{value:"Implementation of",id:"implementation-of-8",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"vnavDistanceToTod",id:"vnavdistancetotod",level:3},{value:"Implementation of",id:"implementation-of-9",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"vnavPathMode",id:"vnavpathmode",level:3},{value:"Implementation of",id:"implementation-of-10",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"vnavState",id:"vnavstate",level:3},{value:"Implementation of",id:"implementation-of-11",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"vnavTocLegDistance",id:"vnavtoclegdistance",level:3},{value:"Implementation of",id:"implementation-of-12",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"vnavTocLegIndex",id:"vnavtoclegindex",level:3},{value:"Implementation of",id:"implementation-of-13",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"vnavTodLegDistance",id:"vnavtodlegdistance",level:3},{value:"Implementation of",id:"implementation-of-14",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"vnavTodLegIndex",id:"vnavtodlegindex",level:3},{value:"Implementation of",id:"implementation-of-15",level:4},{value:"Defined in",id:"defined-in-16",level:4}],s={toc:p},m="wrapper";function v(e){let{components:a,...n}=e;return(0,i.kt)(m,(0,t.Z)({},s,n,{components:a,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider")," which provides data for a standalone flight plan not owned by a flight planner."),(0,i.kt)("h2",{id:"implements"},"Implements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"MapFlightPlanDataProvider")))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new MapStandaloneFlightPlanPlanDataProvider"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"plan"),")"),(0,i.kt)("p",null,"Constructor."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"plan")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},"FlightPlan"),">"),(0,i.kt)("td",{parentName:"tr",align:"left"},"A subscribable which provides the flight plan for this data provider.")))),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:67"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"activelaterallegindex"},"activeLateralLegIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"activeLateralLegIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the index of the active lateral leg of the displayed flight plan, or -1 if no such\nleg exists."),(0,i.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#activelaterallegindex"},"activeLateralLegIndex")),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:20"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata"},"lnavData"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"lnavData"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"LNavTrackingState"),">"),(0,i.kt)("p",null,"A subscribable which provides LNAV data."),(0,i.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#lnavdata"},"lnavData")),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:23"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"obscourse"},"obsCourse"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"obsCourse"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the current OBS course, or undefined if OBS is not active."),(0,i.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#obscourse"},"obsCourse")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:59"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"plan"},"plan"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"plan"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"FlightPlan"),">"),(0,i.kt)("p",null,"A subscribable which provides the flight plan for this data provider."),(0,i.kt)("h4",{id:"implementation-of-3"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#plan"},"plan")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:67"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"plancalculated"},"planCalculated"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"planCalculated"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"SubEvent"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapStandaloneFlightPlanPlanDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"MapStandaloneFlightPlanPlanDataProvider")),", ",(0,i.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,i.kt)("p",null,"An event which notifies when the displayed plan has been calculated."),(0,i.kt)("h4",{id:"implementation-of-4"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#plancalculated"},"planCalculated")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:16"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"planmodified"},"planModified"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"planModified"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"SubEvent"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapStandaloneFlightPlanPlanDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"MapStandaloneFlightPlanPlanDataProvider")),", ",(0,i.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,i.kt)("p",null,"An event which notifies when the displayed plan has been modified."),(0,i.kt)("h4",{id:"implementation-of-5"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#planmodified"},"planModified")),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:13"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavboclegindex"},"vnavBocLegIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavBocLegIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the index of the leg within which the VNAV bottom-of-climb point lies, or -1 if\nno such leg exists."),(0,i.kt)("h4",{id:"implementation-of-6"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavboclegindex"},"vnavBocLegIndex")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:48"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavbodlegindex"},"vnavBodLegIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavBodLegIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the index of the leg within which the VNAV bottom-of-descent point lies, or -1 if\nno such leg exists."),(0,i.kt)("h4",{id:"implementation-of-7"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavbodlegindex"},"vnavBodLegIndex")),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:34"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavdistancetotoc"},"vnavDistanceToToc"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavDistanceToToc"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),">",">",">"),(0,i.kt)("p",null,"A subscribable which provides the distance along the flight path from the plane's current position to the next\ntop-of-climb."),(0,i.kt)("h4",{id:"implementation-of-8"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavdistancetotoc"},"vnavDistanceToToc")),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:55"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavdistancetotod"},"vnavDistanceToTod"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavDistanceToTod"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),">",">",">"),(0,i.kt)("p",null,"A subscribable which provides the distance along the flight path from the plane's current position to the next\ntop-of-descent."),(0,i.kt)("h4",{id:"implementation-of-9"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavdistancetotod"},"vnavDistanceToTod")),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:41"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavpathmode"},"vnavPathMode"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavPathMode"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"VNavPathMode"),">"),(0,i.kt)("p",null,"A subscribable which provides the currently active VNAV path mode."),(0,i.kt)("h4",{id:"implementation-of-10"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavpathmode"},"vnavPathMode")),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:28"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavstate"},"vnavState"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavState"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"VNavState"),">"),(0,i.kt)("p",null,"A subscribable which provides the current VNAV state."),(0,i.kt)("h4",{id:"implementation-of-11"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavstate"},"vnavState")),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:26"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavtoclegdistance"},"vnavTocLegDistance"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavTocLegDistance"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),">",">",">"),(0,i.kt)("p",null,"A subscribable which provides the distance along the flight path from the VNAV top-of-climb point to the end\nof the TOC leg."),(0,i.kt)("h4",{id:"implementation-of-12"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavtoclegdistance"},"vnavTocLegDistance")),(0,i.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:51"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavtoclegindex"},"vnavTocLegIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavTocLegIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the index of the leg within which the VNAV top-of-climb point lies, or -1 if no\nsuch leg exists."),(0,i.kt)("h4",{id:"implementation-of-13"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavtoclegindex"},"vnavTocLegIndex")),(0,i.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:45"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavtodlegdistance"},"vnavTodLegDistance"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavTodLegDistance"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),">",">",">"),(0,i.kt)("p",null,"A subscribable which provides the distance along the flight path from the VNAV top-of-descent point to the end\nof the TOD leg."),(0,i.kt)("h4",{id:"implementation-of-14"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavtodlegdistance"},"vnavTodLegDistance")),(0,i.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:37"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavtodlegindex"},"vnavTodLegIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavTodLegIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the index of the leg within which the VNAV top-of-descent point lies, or -1 if no\nsuch leg exists."),(0,i.kt)("h4",{id:"implementation-of-15"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavtodlegindex"},"vnavTodLegIndex")),(0,i.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapStandaloneFlightPlanDataProvider.ts:31"))}v.isMDXComponent=!0}}]);