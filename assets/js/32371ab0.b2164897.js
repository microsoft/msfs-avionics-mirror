"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[1622],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>k});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=a.createContext({}),d=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=d(e.components);return a.createElement(p.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=d(n),c=r,k=m["".concat(p,".").concat(c)]||m[c]||u[c]||i;return n?a.createElement(k,l(l({ref:t},s),{},{components:n})):a.createElement(k,l({ref:t},s))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=c;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[m]="string"==typeof e?e:r,l[1]=o;for(var d=2;d<i;d++)l[d]=n[d];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},55488:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var a=n(87462),r=(n(67294),n(3905));const i={id:"WaypointAlertComputer",title:"Class: WaypointAlertComputer",sidebar_label:"WaypointAlertComputer",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/classes/WaypointAlertComputer",id:"garminsdk/classes/WaypointAlertComputer",title:"Class: WaypointAlertComputer",description:"A class that computes the current waypoint alert state for consumers to use for waypoint alert displays.",source:"@site/docs/garminsdk/classes/WaypointAlertComputer.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/WaypointAlertComputer",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/WaypointAlertComputer",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"WaypointAlertComputer",title:"Class: WaypointAlertComputer",sidebar_label:"WaypointAlertComputer",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"VerticalSpeedIndicator",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/VerticalSpeedIndicator"},next:{title:"WaypointComponent",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/WaypointComponent"}},p={},d=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"onStateChanged",id:"onstatechanged",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"state",id:"state",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"timeRemaining",id:"timeremaining",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"update",id:"update",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-4",level:4}],s={toc:d},m="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(m,(0,a.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A class that computes the current waypoint alert state for consumers to use for waypoint alert displays."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new WaypointAlertComputer"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"flightPlanner"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"alertLookaheadTime"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"nowAlertTime?"),")"),(0,r.kt)("p",null,"Creates an instance of the WaypointAlertComputer."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event bus to use with this instance.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"flightPlanner")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"FlightPlanner")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The flight planner to use with this instance.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"alertLookaheadTime")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The amount of time from the waypoint or target turn, in seconds, to begin alerting.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"nowAlertTime")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"WaypointAlertComputer.DEFAULT_NOW_ALERT_TIME")),(0,r.kt)("td",{parentName:"tr",align:"left"},'The amount of time, in seconds, to keep "...NOW" alerts active after they have been triggered. Defaults to five seconds.')))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/WaypointAlertComputer.ts:128"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"onstatechanged"},"onStateChanged"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"onStateChanged"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"SubEvent"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/WaypointAlertComputer"},(0,r.kt)("inlineCode",{parentName:"a"},"WaypointAlertComputer")),", ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WaypointAlertStateEvent"},(0,r.kt)("inlineCode",{parentName:"a"},"WaypointAlertStateEvent")),">",">"),(0,r.kt)("p",null,"An event which fires every time the alert state changes."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/WaypointAlertComputer.ts:96"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"state"},"state"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"state"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WaypointAlertStateEvent"},(0,r.kt)("inlineCode",{parentName:"a"},"WaypointAlertStateEvent")),">",">"),(0,r.kt)("p",null,"The current alert state."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/WaypointAlertComputer.ts:94"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"timeremaining"},"timeRemaining"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"timeRemaining"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NumberUnitSubject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Duration"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"SimpleUnit"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Duration"),">",">"),(0,r.kt)("p",null,"The time remaining for the current alert state, or ",(0,r.kt)("inlineCode",{parentName:"p"},"NaN")," if an alert is not active."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/WaypointAlertComputer.ts:98"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"update"},"update"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"update"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Updates the WaypointAlertComputer."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/WaypointAlertComputer.ts:195"))}u.isMDXComponent=!0}}]);