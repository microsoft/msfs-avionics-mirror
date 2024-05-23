"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[43078],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>f});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=i.createContext({}),p=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return i.createElement(o.Provider,{value:t},e.children)},k="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,o=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),k=p(n),u=a,f=k["".concat(o,".").concat(u)]||k[u]||m[u]||r;return n?i.createElement(f,l(l({ref:t},s),{},{components:n})):i.createElement(f,l({ref:t},s))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,l=new Array(r);l[0]=u;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[k]="string"==typeof e?e:a,l[1]=d;for(var p=2;p<r;p++)l[p]=n[p];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}u.displayName="MDXCreateElement"},35728:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>m,frontMatter:()=>r,metadata:()=>d,toc:()=>p});var i=n(87462),a=(n(67294),n(3905));const r={id:"WT21APStateManager",title:"Class: WT21APStateManager",sidebar_label:"WT21APStateManager",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"wt21fmc/classes/WT21APStateManager",id:"wt21fmc/classes/WT21APStateManager",title:"Class: WT21APStateManager",description:"A WT21 autopilot state manager.",source:"@site/docs/wt21fmc/classes/WT21APStateManager.md",sourceDirName:"wt21fmc/classes",slug:"/wt21fmc/classes/WT21APStateManager",permalink:"/msfs-avionics-mirror/docs/wt21fmc/classes/WT21APStateManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"WT21APStateManager",title:"Class: WT21APStateManager",sidebar_label:"WT21APStateManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"WT21APConfig",permalink:"/msfs-avionics-mirror/docs/wt21fmc/classes/WT21APConfig"},next:{title:"WT21Autopilot",permalink:"/msfs-avionics-mirror/docs/wt21fmc/classes/WT21Autopilot"}},o={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"_isFlightDirectorCoPilotOn",id:"_isflightdirectorcopiloton",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"_isFlightDirectorOn",id:"_isflightdirectoron",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"apConfig",id:"apconfig",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"apListenerRegistered",id:"aplistenerregistered",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"apMasterOn",id:"apmasteron",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"approachPressed",id:"approachpressed",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"bus",id:"bus",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"isAnyFlightDirectorOn",id:"isanyflightdirectoron",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"isFlightDirectorCoPilotOn",id:"isflightdirectorcopiloton",level:3},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"isFlightDirectorOn",id:"isflightdirectoron",level:3},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"keyEventManager",id:"keyeventmanager",level:3},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"lateralPressed",id:"lateralpressed",level:3},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"stateManagerInitialized",id:"statemanagerinitialized",level:3},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"verticalPressed",id:"verticalpressed",level:3},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"vnavPressed",id:"vnavpressed",level:3},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"Methods",id:"methods",level:2},{value:"handleKeyIntercepted",id:"handlekeyintercepted",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"initFlightDirector",id:"initflightdirector",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-16",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"initialize",id:"initialize",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-17",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"onAPListenerRegistered",id:"onaplistenerregistered",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"onBeforeInitialize",id:"onbeforeinitialize",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-18",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"sendApModeEvent",id:"sendapmodeevent",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-19",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"setFlightDirector",id:"setflightdirector",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-20",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"setupKeyIntercepts",id:"setupkeyintercepts",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"toggleVnav",id:"togglevnav",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Inherited from",id:"inherited-from-21",level:4},{value:"Defined in",id:"defined-in-24",level:4}],s={toc:p},k="wrapper";function m(e){let{components:t,...n}=e;return(0,a.kt)(k,(0,i.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A WT21 autopilot state manager."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"p"},"APStateManager")),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"WT21APStateManager"))))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new WT21APStateManager"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"apConfig"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21fmc/classes/WT21APStateManager"},(0,a.kt)("inlineCode",{parentName:"a"},"WT21APStateManager"))),(0,a.kt)("p",null,"Creates an instance of the APStateManager."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,a.kt)("td",{parentName:"tr",align:"left"},"An instance of the event bus.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"apConfig")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"APConfig")),(0,a.kt)("td",{parentName:"tr",align:"left"},"This autopilot's configuration.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21fmc/classes/WT21APStateManager"},(0,a.kt)("inlineCode",{parentName:"a"},"WT21APStateManager"))),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.constructor"),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:60"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"_isflightdirectorcopiloton"},"_","isFlightDirectorCoPilotOn"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("strong",{parentName:"p"},"_","isFlightDirectorCoPilotOn"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.","_","isFlightDirectorCoPilotOn"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:43"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"_isflightdirectoron"},"_","isFlightDirectorOn"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("strong",{parentName:"p"},"_","isFlightDirectorOn"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.","_","isFlightDirectorOn"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:41"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"apconfig"},"apConfig"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"apConfig"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"APConfig")),(0,a.kt)("p",null,"This autopilot's configuration."),(0,a.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.apConfig"),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:60"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"aplistenerregistered"},"apListenerRegistered"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("strong",{parentName:"p"},"apListenerRegistered"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"false")),(0,a.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.apListenerRegistered"),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:31"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"apmasteron"},"apMasterOn"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"apMasterOn"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.apMasterOn"),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:40"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"approachpressed"},"approachPressed"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"approachPressed"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"SubEventInterface"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21fmc/classes/WT21APStateManager"},(0,a.kt)("inlineCode",{parentName:"a"},"WT21APStateManager")),", ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.approachPressed"),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:37"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"bus"},"bus"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"bus"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,a.kt)("p",null,"An instance of the event bus."),(0,a.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.bus"),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:60"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isanyflightdirectoron"},"isAnyFlightDirectorOn"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"isAnyFlightDirectorOn"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"MappedSubject"),"<","[",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),"]",", ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether any of the flight directors are switched on.\nOnly looks at FD1/pilot unless the APConfig.independentFds option is enabled."),(0,a.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.isAnyFlightDirectorOn"),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:49"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isflightdirectorcopiloton"},"isFlightDirectorCoPilotOn"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"isFlightDirectorCoPilotOn"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.isFlightDirectorCoPilotOn"),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:44"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isflightdirectoron"},"isFlightDirectorOn"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"isFlightDirectorOn"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.isFlightDirectorOn"),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:42"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"keyeventmanager"},"keyEventManager"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"keyEventManager"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"KeyEventManager")),(0,a.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.keyEventManager"),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:27"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"lateralpressed"},"lateralPressed"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"lateralPressed"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"SubEventInterface"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21fmc/classes/WT21APStateManager"},(0,a.kt)("inlineCode",{parentName:"a"},"WT21APStateManager")),", ",(0,a.kt)("inlineCode",{parentName:"p"},"APModePressEvent"),">"),(0,a.kt)("h4",{id:"inherited-from-12"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.lateralPressed"),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:35"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"statemanagerinitialized"},"stateManagerInitialized"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"stateManagerInitialized"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("h4",{id:"inherited-from-13"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.stateManagerInitialized"),(0,a.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:33"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"verticalpressed"},"verticalPressed"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"verticalPressed"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"SubEventInterface"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21fmc/classes/WT21APStateManager"},(0,a.kt)("inlineCode",{parentName:"a"},"WT21APStateManager")),", ",(0,a.kt)("inlineCode",{parentName:"p"},"APModePressEvent"),">"),(0,a.kt)("h4",{id:"inherited-from-14"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.verticalPressed"),(0,a.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:36"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"vnavpressed"},"vnavPressed"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"vnavPressed"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"SubEventInterface"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21fmc/classes/WT21APStateManager"},(0,a.kt)("inlineCode",{parentName:"a"},"WT21APStateManager")),", ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("h4",{id:"inherited-from-15"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.vnavPressed"),(0,a.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:38"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"handlekeyintercepted"},"handleKeyIntercepted"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"handleKeyIntercepted"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"\xabdestructured\xbb"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"\xabdestructured\xbb")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"KeyEventData"))))),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"overrides"},"Overrides"),(0,a.kt)("p",null,"APStateManager.handleKeyIntercepted"),(0,a.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Autopilot/WT21APStateManager.ts:112"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"initflightdirector"},"initFlightDirector"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"initFlightDirector"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Initializes the flight director to a default value."),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-16"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.initFlightDirector"),(0,a.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:138"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"initialize"},"initialize"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"initialize"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"force?"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Checks whether the AP State Manager has completed listerner steps,\nand if so, finishes initializing and then notifies Autopilot of the same."),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"force")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"false")),(0,a.kt)("td",{parentName:"tr",align:"left"},"forces the initialize")))),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-17"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.initialize"),(0,a.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:126"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onaplistenerregistered"},"onAPListenerRegistered"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onAPListenerRegistered"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"overrides-1"},"Overrides"),(0,a.kt)("p",null,"APStateManager.onAPListenerRegistered"),(0,a.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Autopilot/WT21APStateManager.ts:10"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onbeforeinitialize"},"onBeforeInitialize"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onBeforeInitialize"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Method to override with steps to run before initialze method is run."),(0,a.kt)("h4",{id:"returns-5"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-18"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.onBeforeInitialize"),(0,a.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:212"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"sendapmodeevent"},"sendApModeEvent"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"sendApModeEvent"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"type"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"mode?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"set?"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Sends AP Mode Events from the Intercept to the Autopilot."),(0,a.kt)("h4",{id:"parameters-3"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"type")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"APModeType")),(0,a.kt)("td",{parentName:"tr",align:"left"},"is the AP Mode Type for this event")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"mode?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"APLateralModes")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},"APVerticalModes")),(0,a.kt)("td",{parentName:"tr",align:"left"},"is the mode to set/unset.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"set?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"is whether to actively set or unset this mode.")))),(0,a.kt)("h4",{id:"returns-6"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-19"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.sendApModeEvent"),(0,a.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:191"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"setflightdirector"},"setFlightDirector"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"setFlightDirector"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"on"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Sets the Flight Director State"),(0,a.kt)("h4",{id:"parameters-4"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"on")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"is wheter to set the FD On.")))),(0,a.kt)("h4",{id:"returns-7"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-20"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.setFlightDirector"),(0,a.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:146"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"setupkeyintercepts"},"setupKeyIntercepts"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"setupKeyIntercepts"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"manager"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"parameters-5"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"manager")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"KeyEventManager"))))),(0,a.kt)("h4",{id:"returns-8"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"overrides-2"},"Overrides"),(0,a.kt)("p",null,"APStateManager.setupKeyIntercepts"),(0,a.kt)("h4",{id:"defined-in-23"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Autopilot/WT21APStateManager.ts:22"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"togglevnav"},"toggleVnav"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"toggleVnav"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Toggles VNAV L Var value."),(0,a.kt)("h4",{id:"returns-9"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-21"},"Inherited from"),(0,a.kt)("p",null,"APStateManager.toggleVnav"),(0,a.kt)("h4",{id:"defined-in-24"},"Defined in"),(0,a.kt)("p",null,"sdk/autopilot/managers/APStateManager.ts:180"))}m.isMDXComponent=!0}}]);