"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[94235],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>f});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=a.createContext({}),p=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return a.createElement(d.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=p(n),c=i,f=m["".concat(d,".").concat(c)]||m[c]||k[c]||r;return n?a.createElement(f,l(l({ref:t},s),{},{components:n})):a.createElement(f,l({ref:t},s))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,l=new Array(r);l[0]=c;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:i,l[1]=o;for(var p=2;p<r;p++)l[p]=n[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},21424:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>k,frontMatter:()=>r,metadata:()=>o,toc:()=>p});var a=n(87462),i=(n(67294),n(3905));const r={id:"AbstractFlightPlanLegWaypointsRecord",title:"Class: AbstractFlightPlanLegWaypointsRecord",sidebar_label:"AbstractFlightPlanLegWaypointsRecord",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/classes/AbstractFlightPlanLegWaypointsRecord",id:"garminsdk/classes/AbstractFlightPlanLegWaypointsRecord",title:"Class: AbstractFlightPlanLegWaypointsRecord",description:"An abstract implementation of FlightPlanLegWaypointsRecord.",source:"@site/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AbstractFlightPlanLegWaypointsRecord",title:"Class: AbstractFlightPlanLegWaypointsRecord",sidebar_label:"AbstractFlightPlanLegWaypointsRecord",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"WindDisplayOption",permalink:"/msfs-avionics-mirror/docs/garminsdk/enums/WindDisplayOption"},next:{title:"AbstractNavReferenceBase",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractNavReferenceBase"}},d={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"activeRenderRole",id:"activerenderrole",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"facLoader",id:"facloader",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"inactiveRenderRole",id:"inactiverenderrole",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"isActive",id:"isactive",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"leg",id:"leg",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"uid",id:"uid",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"waypointRenderer",id:"waypointrenderer",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"uidSource",id:"uidsource",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"Methods",id:"methods",level:2},{value:"deregisterWaypoint",id:"deregisterwaypoint",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"refresh",id:"refresh",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"registerWaypoint",id:"registerwaypoint",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-12",level:4}],s={toc:p},m="wrapper";function k(e){let{components:t,...n}=e;return(0,i.kt)(m,(0,a.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"An abstract implementation of FlightPlanLegWaypointsRecord."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"AbstractFlightPlanLegWaypointsRecord"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/FixIcaoWaypointsRecord"},(0,i.kt)("inlineCode",{parentName:"a"},"FixIcaoWaypointsRecord"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/FlightPathTerminatorWaypointsRecord"},(0,i.kt)("inlineCode",{parentName:"a"},"FlightPathTerminatorWaypointsRecord"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/ProcedureTurnLegWaypointsRecord"},(0,i.kt)("inlineCode",{parentName:"a"},"ProcedureTurnLegWaypointsRecord"))))),(0,i.kt)("h2",{id:"implements"},"Implements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/FlightPlanLegWaypointsRecord"},(0,i.kt)("inlineCode",{parentName:"a"},"FlightPlanLegWaypointsRecord")))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new AbstractFlightPlanLegWaypointsRecord"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"waypointRenderer"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"facLoader"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"inactiveRenderRole"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"activeRenderRole"),")"),(0,i.kt)("p",null,"Constructor."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"leg")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"LegDefinition")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The flight plan leg associated with this record.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"waypointRenderer")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapWaypointRenderer"},(0,i.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderer"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The renderer used to render this record's waypoints.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"facLoader")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"FacilityLoader")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The facility loader used by this waypoint.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"inactiveRenderRole")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapWaypointRenderRole"},(0,i.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderRole"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The role(s) under which the waypoint should be registered when it is part of an inactive leg.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"activeRenderRole")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapWaypointRenderRole"},(0,i.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderRole"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The role(s) under which the waypoint should be registered when it is part of an active leg.")))),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:46"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"activerenderrole"},"activeRenderRole"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"activeRenderRole"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapWaypointRenderRole"},(0,i.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderRole"))),(0,i.kt)("p",null,"The role(s) under which the waypoint should be registered when it is part of an active\nleg."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:51"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"facloader"},"facLoader"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"facLoader"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"FacilityLoader")),(0,i.kt)("p",null,"The facility loader used by this waypoint."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:49"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"inactiverenderrole"},"inactiveRenderRole"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"inactiveRenderRole"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapWaypointRenderRole"},(0,i.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderRole"))),(0,i.kt)("p",null,"The role(s) under which the waypoint should be registered when it is part of an inactive\nleg."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:50"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isactive"},"isActive"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("strong",{parentName:"p"},"isActive"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,i.kt)("inlineCode",{parentName:"p"},"false")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:34"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"leg"},"leg"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"leg"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"LegDefinition")),(0,i.kt)("p",null,"The flight plan leg associated with this record."),(0,i.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/FlightPlanLegWaypointsRecord"},"FlightPlanLegWaypointsRecord"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/FlightPlanLegWaypointsRecord#leg"},"leg")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:47"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"uid"},"uid"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("strong",{parentName:"p"},"uid"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:33"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"waypointrenderer"},"waypointRenderer"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"waypointRenderer"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapWaypointRenderer"},(0,i.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderer"))),(0,i.kt)("p",null,"The renderer used to render this record's waypoints."),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:48"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"uidsource"},"uidSource"),(0,i.kt)("p",null,"\u25aa ",(0,i.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("strong",{parentName:"p"},"uidSource"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,i.kt)("inlineCode",{parentName:"p"},"0")),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:31"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"deregisterwaypoint"},"deregisterWaypoint"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("strong",{parentName:"p"},"deregisterWaypoint"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"waypoint"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"role"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Removes a registration for a waypoint from this record's waypoint renderer."),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"Waypoint")),(0,i.kt)("td",{parentName:"tr",align:"left"},"A waypoint.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"role")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapWaypointRenderRole"},(0,i.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderRole"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The role(s) from which the waypoint should be deregistered.")))),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:75"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"destroy"},"destroy"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Abstract")," ",(0,i.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Destroys this record. Deregisters all this record's waypoints with this record's waypoint renderer."),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/FlightPlanLegWaypointsRecord"},"FlightPlanLegWaypointsRecord"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/FlightPlanLegWaypointsRecord#destroy"},"destroy")),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:59"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"refresh"},"refresh"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Abstract")," ",(0,i.kt)("strong",{parentName:"p"},"refresh"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"isActive"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,i.kt)("p",null,"Refreshes this record's waypoints, keeping them up to date with this record's associated flight plan leg."),(0,i.kt)("h4",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"isActive")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether this record's leg is the active leg.")))),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,i.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/FlightPlanLegWaypointsRecord"},"FlightPlanLegWaypointsRecord"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/FlightPlanLegWaypointsRecord#refresh"},"refresh")),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:56"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"registerwaypoint"},"registerWaypoint"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("strong",{parentName:"p"},"registerWaypoint"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"waypoint"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"role"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Registers a waypoint with this record's waypoint renderer."),(0,i.kt)("h4",{id:"parameters-3"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"Waypoint")),(0,i.kt)("td",{parentName:"tr",align:"left"},"A waypoint.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"role")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapWaypointRenderRole"},(0,i.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderRole"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The role(s) under which the waypoint should be registered.")))),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:66"))}k.isMDXComponent=!0}}]);