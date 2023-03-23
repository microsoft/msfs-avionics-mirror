"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[30142],{3905:(e,n,t)=>{t.d(n,{Zo:()=>p,kt:()=>c});var a=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function d(e,n){if(null==e)return{};var t,a,i=function(e,n){if(null==e)return{};var t,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var o=a.createContext({}),s=function(e){var n=a.useContext(o),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},p=function(e){var n=s(e.components);return a.createElement(o.Provider,{value:n},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},k=a.forwardRef((function(e,n){var t=e.components,i=e.mdxType,r=e.originalType,o=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),u=s(t),k=i,c=u["".concat(o,".").concat(k)]||u[k]||m[k]||r;return t?a.createElement(c,l(l({ref:n},p),{},{components:t})):a.createElement(c,l({ref:n},p))}));function c(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var r=t.length,l=new Array(r);l[0]=k;var d={};for(var o in n)hasOwnProperty.call(n,o)&&(d[o]=n[o]);d.originalType=e,d[u]="string"==typeof e?e:i,l[1]=d;for(var s=2;s<r;s++)l[s]=t[s];return a.createElement.apply(null,l)}return a.createElement.apply(null,t)}k.displayName="MDXCreateElement"},73620:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>l,default:()=>m,frontMatter:()=>r,metadata:()=>d,toc:()=>s});var a=t(87462),i=(t(67294),t(3905));const r={id:"GarminGoAroundManager",title:"Class: GarminGoAroundManager",sidebar_label:"GarminGoAroundManager",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/classes/GarminGoAroundManager",id:"garminsdk/classes/GarminGoAroundManager",title:"Class: GarminGoAroundManager",description:"A manager which responds to autopilot go-around mode activation by attempting to switch the active navigation",source:"@site/docs/garminsdk/classes/GarminGoAroundManager.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/GarminGoAroundManager",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminGoAroundManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GarminGoAroundManager",title:"Class: GarminGoAroundManager",sidebar_label:"GarminGoAroundManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GarminFacilityWaypointCache",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminFacilityWaypointCache"},next:{title:"GarminLowBankManager",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminLowBankManager"}},o={},s=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"activeNavSource",id:"activenavsource",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"activeNavSourceSub",id:"activenavsourcesub",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"fmaDataSub",id:"fmadatasub",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"fms",id:"fms",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"gpsSelectedDebounceTimer",id:"gpsselecteddebouncetimer",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"isAlive",id:"isalive",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"isGaActive",id:"isgaactive",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"isInit",id:"isinit",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"isLNavTracking",id:"islnavtracking",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"isPaused",id:"ispaused",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"gpsSelectedCallback",id:"gpsselectedcallback",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"init",id:"init",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"onGaActivated",id:"ongaactivated",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"onGpsNavSourceSelected",id:"ongpsnavsourceselected",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"pause",id:"pause",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"resume",id:"resume",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-18",level:4}],p={toc:s},u="wrapper";function m(e){let{components:n,...t}=e;return(0,i.kt)(u,(0,a.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A manager which responds to autopilot go-around mode activation by attempting to switch the active navigation\nsoruce to GPS and activate the missed approach."),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new GarminGoAroundManager"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"fms"),")"),(0,i.kt)("p",null,"Constructor."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"bus")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"fms")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/classes/Fms"},(0,i.kt)("inlineCode",{parentName:"a"},"Fms"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The FMS.")))),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:37"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"activenavsource"},"activeNavSource"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"activeNavSource"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"ConsumerSubject"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/ActiveNavSource"},(0,i.kt)("inlineCode",{parentName:"a"},"ActiveNavSource")),">"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:16"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"activenavsourcesub"},"activeNavSourceSub"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"activeNavSourceSub"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:30"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"bus"},"bus"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"bus"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,i.kt)("p",null,"The event bus."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:37"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"fmadatasub"},"fmaDataSub"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"fmaDataSub"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:29"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"fms"},"fms"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"fms"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/Fms"},(0,i.kt)("inlineCode",{parentName:"a"},"Fms"))),(0,i.kt)("p",null,"The FMS."),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:37"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"gpsselecteddebouncetimer"},"gpsSelectedDebounceTimer"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"gpsSelectedDebounceTimer"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"DebounceTimer")),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:18"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isalive"},"isAlive"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("strong",{parentName:"p"},"isAlive"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,i.kt)("inlineCode",{parentName:"p"},"true")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:26"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isgaactive"},"isGaActive"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"isGaActive"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:13"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isinit"},"isInit"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("strong",{parentName:"p"},"isInit"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,i.kt)("inlineCode",{parentName:"p"},"false")),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:25"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"islnavtracking"},"isLNavTracking"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"isLNavTracking"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"ConsumerValue"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:15"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ispaused"},"isPaused"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("strong",{parentName:"p"},"isPaused"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,i.kt)("inlineCode",{parentName:"p"},"true")),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:27"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"destroy"},"destroy"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Destroys this manager. Once destroyed, this manager will cease responding to go-around mode activations, and can\nno longer be paused or resumed."),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:177"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"gpsselectedcallback"},"gpsSelectedCallback"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"gpsSelectedCallback"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:19"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"init"},"init"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"init"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Initializes this manager. Once initialized, this manager will automatically attempt to switch the active\nnavigation source to GPS and activate the missed approach and when autopilot go-around mode is activated."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"Error if this manager has been destroyed."),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"paused")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"false")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether to initialize this manager as paused. Defaults to ",(0,i.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:46"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ongaactivated"},"onGaActivated"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("strong",{parentName:"p"},"onGaActivated"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Responds to when go-around mode has been activated. This will switch the active navigation source to GPS and the\nautopilot lateral mode to NAV (GPS/FMS) if an approach is loaded and LNAV guidance is available. Additionally,\nthis will activate the missed approach if such an action is possible."),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:92"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ongpsnavsourceselected"},"onGpsNavSourceSelected"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("strong",{parentName:"p"},"onGpsNavSourceSelected"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Responds to when GPS has been selected as the active navigation source after go-around mode has been activated."),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:116"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"pause"},"pause"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"pause"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Pauses this manager. Once paused, this data provider will not respond to go-around mode activations until it is\nresumed."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"Error if this manager has been destroyed."),(0,i.kt)("h4",{id:"returns-5"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:153"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"resume"},"resume"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"resume"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Resumes this manager. Once resumed, this manager will automatically attempt to switch the active navigation source\nto GPS and activate the missed approach and when autopilot go-around mode is activated."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"Error if this manager has been destroyed."),(0,i.kt)("h4",{id:"returns-6"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminGoAroundManager.ts:131"))}m.isMDXComponent=!0}}]);