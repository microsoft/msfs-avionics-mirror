"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[75118],{3905:(e,n,a)=>{a.d(n,{Zo:()=>s,kt:()=>k});var t=a(67294);function i(e,n,a){return n in e?Object.defineProperty(e,n,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[n]=a,e}function l(e,n){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),a.push.apply(a,t)}return a}function r(e){for(var n=1;n<arguments.length;n++){var a=null!=arguments[n]?arguments[n]:{};n%2?l(Object(a),!0).forEach((function(n){i(e,n,a[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(a,n))}))}return e}function o(e,n){if(null==e)return{};var a,t,i=function(e,n){if(null==e)return{};var a,t,i={},l=Object.keys(e);for(t=0;t<l.length;t++)a=l[t],n.indexOf(a)>=0||(i[a]=e[a]);return i}(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(t=0;t<l.length;t++)a=l[t],n.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}var d=t.createContext({}),p=function(e){var n=t.useContext(d),a=n;return e&&(a="function"==typeof e?e(n):r(r({},n),e)),a},s=function(e){var n=p(e.components);return t.createElement(d.Provider,{value:n},e.children)},m="mdxType",v={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},c=t.forwardRef((function(e,n){var a=e.components,i=e.mdxType,l=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=p(a),c=i,k=m["".concat(d,".").concat(c)]||m[c]||v[c]||l;return a?t.createElement(k,r(r({ref:n},s),{},{components:a})):t.createElement(k,r({ref:n},s))}));function k(e,n){var a=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var l=a.length,r=new Array(l);r[0]=c;var o={};for(var d in n)hasOwnProperty.call(n,d)&&(o[d]=n[d]);o.originalType=e,o[m]="string"==typeof e?e:i,r[1]=o;for(var p=2;p<l;p++)r[p]=a[p];return t.createElement.apply(null,r)}return t.createElement.apply(null,a)}c.displayName="MDXCreateElement"},74001:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>d,contentTitle:()=>r,default:()=>v,frontMatter:()=>l,metadata:()=>o,toc:()=>p});var t=a(87462),i=(a(67294),a(3905));const l={id:"MapActiveFlightPlanDataProvider",title:"Class: MapActiveFlightPlanDataProvider",sidebar_label:"MapActiveFlightPlanDataProvider",sidebar_position:0,custom_edit_url:null},r=void 0,o={unversionedId:"garminsdk/classes/MapActiveFlightPlanDataProvider",id:"garminsdk/classes/MapActiveFlightPlanDataProvider",title:"Class: MapActiveFlightPlanDataProvider",description:"A map flight plan layer data provider which provides the active flight plan to be displayed.",source:"@site/docs/garminsdk/classes/MapActiveFlightPlanDataProvider.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/MapActiveFlightPlanDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapActiveFlightPlanDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapActiveFlightPlanDataProvider",title:"Class: MapActiveFlightPlanDataProvider",sidebar_label:"MapActiveFlightPlanDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MagnetometerSystem",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MagnetometerSystem"},next:{title:"MapAirportIcon",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapAirportIcon"}},d={},p=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"activeLateralLegIndex",id:"activelaterallegindex",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"lnavData",id:"lnavdata",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"obsCourse",id:"obscourse",level:3},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"plan",id:"plan",level:3},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"planCalculated",id:"plancalculated",level:3},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"planModified",id:"planmodified",level:3},{value:"Implementation of",id:"implementation-of-5",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"planner",id:"planner",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"provider",id:"provider",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"vnavBocLegIndex",id:"vnavboclegindex",level:3},{value:"Implementation of",id:"implementation-of-6",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"vnavBodLegIndex",id:"vnavbodlegindex",level:3},{value:"Implementation of",id:"implementation-of-7",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"vnavDistanceToToc",id:"vnavdistancetotoc",level:3},{value:"Implementation of",id:"implementation-of-8",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"vnavDistanceToTod",id:"vnavdistancetotod",level:3},{value:"Implementation of",id:"implementation-of-9",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"vnavPathMode",id:"vnavpathmode",level:3},{value:"Implementation of",id:"implementation-of-10",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"vnavState",id:"vnavstate",level:3},{value:"Implementation of",id:"implementation-of-11",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"vnavTocLegDistance",id:"vnavtoclegdistance",level:3},{value:"Implementation of",id:"implementation-of-12",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"vnavTocLegIndex",id:"vnavtoclegindex",level:3},{value:"Implementation of",id:"implementation-of-13",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"vnavTodLegDistance",id:"vnavtodlegdistance",level:3},{value:"Implementation of",id:"implementation-of-14",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"vnavTodLegIndex",id:"vnavtodlegindex",level:3},{value:"Implementation of",id:"implementation-of-15",level:4},{value:"Defined in",id:"defined-in-19",level:4}],s={toc:p},m="wrapper";function v(e){let{components:n,...a}=e;return(0,i.kt)(m,(0,t.Z)({},s,a,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A map flight plan layer data provider which provides the active flight plan to be displayed."),(0,i.kt)("h2",{id:"implements"},"Implements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"MapFlightPlanDataProvider")))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new MapActiveFlightPlanDataProvider"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"planner"),")"),(0,i.kt)("p",null,"Constructor."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"bus")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"planner")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"FlightPlanner")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The flight planner.")))),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:50"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"activelaterallegindex"},"activeLateralLegIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"activeLateralLegIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the index of the active lateral leg of the displayed flight plan, or -1 if no such\nleg exists."),(0,i.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#activelaterallegindex"},"activeLateralLegIndex")),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:19"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"bus"},"bus"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"bus"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,i.kt)("p",null,"The event bus."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:50"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata"},"lnavData"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"lnavData"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"LNavTrackingState"),">"),(0,i.kt)("p",null,"A subscribable which provides LNAV data."),(0,i.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#lnavdata"},"lnavData")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:21"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"obscourse"},"obsCourse"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"obsCourse"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the current OBS course, or undefined if OBS is not active."),(0,i.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#obscourse"},"obsCourse")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:43"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"plan"},"plan"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"plan"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"FlightPlan"),">"),(0,i.kt)("p",null,"A subscribable which provides the flight plan to be displayed."),(0,i.kt)("h4",{id:"implementation-of-3"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#plan"},"plan")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:13"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"plancalculated"},"planCalculated"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"planCalculated"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"SubEvent"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapFlightPlannerPlanDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"MapFlightPlannerPlanDataProvider")),", ",(0,i.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,i.kt)("p",null,"An event which notifies when the displayed plan has been calculated."),(0,i.kt)("h4",{id:"implementation-of-4"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#plancalculated"},"planCalculated")),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:17"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"planmodified"},"planModified"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"planModified"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"SubEvent"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapFlightPlannerPlanDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"MapFlightPlannerPlanDataProvider")),", ",(0,i.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,i.kt)("p",null,"An event which notifies when the displayed plan has been modified."),(0,i.kt)("h4",{id:"implementation-of-5"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#planmodified"},"planModified")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:15"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"planner"},"planner"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"planner"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"FlightPlanner")),(0,i.kt)("p",null,"The flight planner."),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:50"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"provider"},"provider"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"provider"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapFlightPlannerPlanDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"MapFlightPlannerPlanDataProvider"))),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:10"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavboclegindex"},"vnavBocLegIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavBocLegIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the index of the leg within which the VNAV bottom-of-climb point lies, or -1 if\nno such leg exists."),(0,i.kt)("h4",{id:"implementation-of-6"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavboclegindex"},"vnavBocLegIndex")),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:37"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavbodlegindex"},"vnavBodLegIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavBodLegIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the index of the leg within which the VNAV bottom-of-descent point lies, or -1 if\nno such leg exists."),(0,i.kt)("h4",{id:"implementation-of-7"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavbodlegindex"},"vnavBodLegIndex")),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:29"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavdistancetotoc"},"vnavDistanceToToc"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavDistanceToToc"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),">",">",">"),(0,i.kt)("p",null,"A subscribable which provides the distance along the flight path from the plane's current position to the next\ntop-of-climb."),(0,i.kt)("h4",{id:"implementation-of-8"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavdistancetotoc"},"vnavDistanceToToc")),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:41"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavdistancetotod"},"vnavDistanceToTod"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavDistanceToTod"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),">",">",">"),(0,i.kt)("p",null,"A subscribable which provides the distance along the flight path from the plane's current position to the next\ntop-of-descent."),(0,i.kt)("h4",{id:"implementation-of-9"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavdistancetotod"},"vnavDistanceToTod")),(0,i.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:33"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavpathmode"},"vnavPathMode"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavPathMode"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"VNavPathMode"),">"),(0,i.kt)("p",null,"A subscribable which provides the currently active VNAV path mode."),(0,i.kt)("h4",{id:"implementation-of-10"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavpathmode"},"vnavPathMode")),(0,i.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:25"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavstate"},"vnavState"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavState"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"VNavState"),">"),(0,i.kt)("p",null,"A subscribable which provides the current VNAV state."),(0,i.kt)("h4",{id:"implementation-of-11"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavstate"},"vnavState")),(0,i.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:23"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavtoclegdistance"},"vnavTocLegDistance"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavTocLegDistance"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),">",">",">"),(0,i.kt)("p",null,"A subscribable which provides the distance along the flight path from the VNAV top-of-climb point to the end\nof the TOC leg."),(0,i.kt)("h4",{id:"implementation-of-12"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavtoclegdistance"},"vnavTocLegDistance")),(0,i.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:39"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavtoclegindex"},"vnavTocLegIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavTocLegIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the index of the leg within which the VNAV top-of-climb point lies, or -1 if no\nsuch leg exists."),(0,i.kt)("h4",{id:"implementation-of-13"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavtoclegindex"},"vnavTocLegIndex")),(0,i.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:35"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavtodlegdistance"},"vnavTodLegDistance"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavTodLegDistance"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),">",">",">"),(0,i.kt)("p",null,"A subscribable which provides the distance along the flight path from the VNAV top-of-descent point to the end\nof the TOD leg."),(0,i.kt)("h4",{id:"implementation-of-14"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavtodlegdistance"},"vnavTodLegDistance")),(0,i.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:31"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnavtodlegindex"},"vnavTodLegIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vnavTodLegIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the index of the leg within which the VNAV top-of-descent point lies, or -1 if no\nsuch leg exists."),(0,i.kt)("h4",{id:"implementation-of-15"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},"MapFlightPlanDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider#vnavtodlegindex"},"vnavTodLegIndex")),(0,i.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapActiveFlightPlanDataProvider.ts:27"))}v.isMDXComponent=!0}}]);