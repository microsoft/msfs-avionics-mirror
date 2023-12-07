"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[75808],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>h});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var d=n.createContext({}),s=function(e){var t=n.useContext(d),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=s(e.components);return n.createElement(d.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,d=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=s(r),k=a,h=m["".concat(d,".").concat(k)]||m[k]||c[k]||i;return r?n.createElement(h,l(l({ref:t},p),{},{components:r})):n.createElement(h,l({ref:t},p))}));function h(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,l=new Array(i);l[0]=k;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:a,l[1]=o;for(var s=2;s<i;s++)l[s]=r[s];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}k.displayName="MDXCreateElement"},23259:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>o,toc:()=>s});var n=r(87462),a=(r(67294),r(3905));const i={id:"ProcedureTurnLegWaypointsRecord",title:"Class: ProcedureTurnLegWaypointsRecord",sidebar_label:"ProcedureTurnLegWaypointsRecord",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/classes/ProcedureTurnLegWaypointsRecord",id:"garminsdk/classes/ProcedureTurnLegWaypointsRecord",title:"Class: ProcedureTurnLegWaypointsRecord",description:"A record for procedure turn (PI) legs. Maintains two waypoints, both located at the PI leg's origin fix. The first",source:"@site/docs/garminsdk/classes/ProcedureTurnLegWaypointsRecord.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/ProcedureTurnLegWaypointsRecord",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/ProcedureTurnLegWaypointsRecord",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"ProcedureTurnLegWaypointsRecord",title:"Class: ProcedureTurnLegWaypointsRecord",sidebar_label:"ProcedureTurnLegWaypointsRecord",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"ProcedureTurnLegWaypoint",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/ProcedureTurnLegWaypoint"},next:{title:"RadarAltimeter",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/RadarAltimeter"}},d={},s=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"activeRenderRole",id:"activerenderrole",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"facLoader",id:"facloader",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"inactiveRenderRole",id:"inactiverenderrole",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"isActive",id:"isactive",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"leg",id:"leg",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"uid",id:"uid",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"waypointRenderer",id:"waypointrenderer",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"Methods",id:"methods",level:2},{value:"deregisterWaypoint",id:"deregisterwaypoint",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"refresh",id:"refresh",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"registerWaypoint",id:"registerwaypoint",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-11",level:4}],p={toc:s},m="wrapper";function c(e){let{components:t,...r}=e;return(0,a.kt)(m,(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A record for procedure turn (PI) legs. Maintains two waypoints, both located at the PI leg's origin fix. The first\nwaypoint is a standard FacilityWaypoint which is never rendered in an active flight plan waypoint role. The second\nis a ProcedureTurnWaypoint with an ident string equal to the PI leg's given name and which can be rendered in an\nactive flight plan waypoint role."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord"},(0,a.kt)("inlineCode",{parentName:"a"},"AbstractFlightPlanLegWaypointsRecord"))),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"ProcedureTurnLegWaypointsRecord"))))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new ProcedureTurnLegWaypointsRecord"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"waypointRenderer"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"facLoader"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"facWaypointCache"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"inactiveRenderRole"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"activeRenderRole"),")"),(0,a.kt)("p",null,"Constructor."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"leg")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"LegDefinition")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flight plan leg associated with this record.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"waypointRenderer")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapWaypointRenderer"},(0,a.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderer"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The renderer used to render this record's waypoints.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"facLoader")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"FacilityLoader")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The facility loader used by this waypoint.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"facWaypointCache")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"FacilityWaypointCache")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The facility waypoint cache used by this record.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"inactiveRenderRole")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapWaypointRenderRole"},(0,a.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderRole"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The role(s) under which the waypoint should be registered when it is part of an inactive leg.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"activeRenderRole")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapWaypointRenderRole"},(0,a.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderRole"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The role(s) under which the waypoint should be registered when it is part of an active leg.")))),(0,a.kt)("h4",{id:"overrides"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord"},"AbstractFlightPlanLegWaypointsRecord"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord#constructor"},"constructor")),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:257"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"activerenderrole"},"activeRenderRole"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"activeRenderRole"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapWaypointRenderRole"},(0,a.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderRole"))),(0,a.kt)("p",null,"The role(s) under which the waypoint should be registered when it is part of an active\nleg."),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord"},"AbstractFlightPlanLegWaypointsRecord"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord#activerenderrole"},"activeRenderRole")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:51"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"facloader"},"facLoader"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"facLoader"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"FacilityLoader")),(0,a.kt)("p",null,"The facility loader used by this waypoint."),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord"},"AbstractFlightPlanLegWaypointsRecord"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord#facloader"},"facLoader")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:49"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"inactiverenderrole"},"inactiveRenderRole"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"inactiveRenderRole"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapWaypointRenderRole"},(0,a.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderRole"))),(0,a.kt)("p",null,"The role(s) under which the waypoint should be registered when it is part of an inactive\nleg."),(0,a.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord"},"AbstractFlightPlanLegWaypointsRecord"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord#inactiverenderrole"},"inactiveRenderRole")),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:50"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isactive"},"isActive"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("strong",{parentName:"p"},"isActive"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"false")),(0,a.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord"},"AbstractFlightPlanLegWaypointsRecord"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord#isactive"},"isActive")),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:34"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"leg"},"leg"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"leg"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"LegDefinition")),(0,a.kt)("p",null,"The flight plan leg associated with this record."),(0,a.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord"},"AbstractFlightPlanLegWaypointsRecord"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord#leg"},"leg")),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:47"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"uid"},"uid"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("strong",{parentName:"p"},"uid"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord"},"AbstractFlightPlanLegWaypointsRecord"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord#uid"},"uid")),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:33"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"waypointrenderer"},"waypointRenderer"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"waypointRenderer"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapWaypointRenderer"},(0,a.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderer"))),(0,a.kt)("p",null,"The renderer used to render this record's waypoints."),(0,a.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord"},"AbstractFlightPlanLegWaypointsRecord"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord#waypointrenderer"},"waypointRenderer")),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:48"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"deregisterwaypoint"},"deregisterWaypoint"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("strong",{parentName:"p"},"deregisterWaypoint"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"waypoint"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"role"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Removes a registration for a waypoint from this record's waypoint renderer."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Waypoint")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A waypoint.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"role")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapWaypointRenderRole"},(0,a.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderRole"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The role(s) from which the waypoint should be deregistered.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord"},"AbstractFlightPlanLegWaypointsRecord"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord#deregisterwaypoint"},"deregisterWaypoint")),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:75"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"destroy"},"destroy"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Destroys this record. Deregisters all this record's waypoints with this record's waypoint renderer."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-1"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord"},"AbstractFlightPlanLegWaypointsRecord"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord#destroy"},"destroy")),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:292"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"refresh"},"refresh"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"refresh"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"isActive"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,a.kt)("p",null,"Refreshes this record's waypoints, keeping them up to date with this record's associated flight plan leg."),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"isActive")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether this record's leg is the active leg.")))),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,a.kt)("h4",{id:"overrides-2"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord"},"AbstractFlightPlanLegWaypointsRecord"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord#refresh"},"refresh")),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:271"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"registerwaypoint"},"registerWaypoint"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("strong",{parentName:"p"},"registerWaypoint"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"waypoint"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"role"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Registers a waypoint with this record's waypoint renderer."),(0,a.kt)("h4",{id:"parameters-3"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Waypoint")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A waypoint.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"role")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapWaypointRenderRole"},(0,a.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderRole"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The role(s) under which the waypoint should be registered.")))),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord"},"AbstractFlightPlanLegWaypointsRecord"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AbstractFlightPlanLegWaypointsRecord#registerwaypoint"},"registerWaypoint")),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/flightplan/MapFlightPlanWaypointRecord.ts:66"))}c.isMDXComponent=!0}}]);