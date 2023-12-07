"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[48375],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>g});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var o=a.createContext({}),d=function(e){var t=a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},m=function(e){var t=d(e.components);return a.createElement(o.Provider,{value:t},e.children)},p="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,o=e.parentName,m=s(e,["components","mdxType","originalType","parentName"]),p=d(n),u=i,g=p["".concat(o,".").concat(u)]||p[u]||c[u]||r;return n?a.createElement(g,l(l({ref:t},m),{},{components:n})):a.createElement(g,l({ref:t},m))}));function g(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,l=new Array(r);l[0]=u;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s[p]="string"==typeof e?e:i,l[1]=s;for(var d=2;d<r;d++)l[d]=n[d];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},93902:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>c,frontMatter:()=>r,metadata:()=>s,toc:()=>d});var a=n(87462),i=(n(67294),n(3905));const r={id:"FlightPlanSimSyncManager",title:"Class: FlightPlanSimSyncManager",sidebar_label:"FlightPlanSimSyncManager",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"garminsdk/classes/FlightPlanSimSyncManager",id:"garminsdk/classes/FlightPlanSimSyncManager",title:"Class: FlightPlanSimSyncManager",description:"A manager for syncing the active flight plan to and from the sim.",source:"@site/docs/garminsdk/classes/FlightPlanSimSyncManager.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/FlightPlanSimSyncManager",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/FlightPlanSimSyncManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPlanSimSyncManager",title:"Class: FlightPlanSimSyncManager",sidebar_label:"FlightPlanSimSyncManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPathTerminatorWaypointsRecord",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/FlightPathTerminatorWaypointsRecord"},next:{title:"FmaMasterSlot",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/FmaMasterSlot"}},o={},d=[{value:"Methods",id:"methods",level:2},{value:"isAutoSyncing",id:"isautosyncing",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"loadFromSim",id:"loadfromsim",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"startAutoSync",id:"startautosync",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"stopAutoSync",id:"stopautosync",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"getManager",id:"getmanager",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-4",level:4}],m={toc:d},p="wrapper";function c(e){let{components:t,...n}=e;return(0,i.kt)(p,(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A manager for syncing the active flight plan to and from the sim."),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"isautosyncing"},"isAutoSyncing"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"isAutoSyncing"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Checks whether this manager is automatically syncing the active flight plan to the sim."),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether this manager is automatically syncing the active flight plan to the sim."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"garminsdk/flightplan/FlightPlanSimSyncManager.ts:95"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"loadfromsim"},"loadFromSim"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"loadFromSim"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"flattenAirways?"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,i.kt)("p",null,"Loads the flight plan from the sim."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"flattenAirways")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"false")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether to flatten airways to their constituent legs. Defaults to ",(0,i.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,i.kt)("p",null,"A Promise which is fulfilled when the flight plan has been loaded."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"garminsdk/flightplan/FlightPlanSimSyncManager.ts:104"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"startautosync"},"startAutoSync"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"startAutoSync"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Starts automatically syncing the active flight plan to the sim."),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"garminsdk/flightplan/FlightPlanSimSyncManager.ts:174"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"stopautosync"},"stopAutoSync"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"stopAutoSync"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Stops automatically syncing the active flight plan to the sim."),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"garminsdk/flightplan/FlightPlanSimSyncManager.ts:187"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"getmanager"},"getManager"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,i.kt)("strong",{parentName:"p"},"getManager"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"fms"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/FlightPlanSimSyncManager"},(0,i.kt)("inlineCode",{parentName:"a"},"FlightPlanSimSyncManager")),">"),(0,i.kt)("p",null,"Gets an instance of the flight plan sync manager."),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"bus")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"fms")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/classes/Fms"},(0,i.kt)("inlineCode",{parentName:"a"},"Fms"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The FMS.")))),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/FlightPlanSimSyncManager"},(0,i.kt)("inlineCode",{parentName:"a"},"FlightPlanSimSyncManager")),">"),(0,i.kt)("p",null,"A Promise which will be fulfilled with an instance of the flight plan sync manager when it is ready."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"garminsdk/flightplan/FlightPlanSimSyncManager.ts:71"))}c.isMDXComponent=!0}}]);