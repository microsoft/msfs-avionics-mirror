"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[60019],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>v});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=n.createContext({}),d=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},p=function(e){var t=d(e.components);return n.createElement(s.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),u=d(a),k=r,v=u["".concat(s,".").concat(k)]||u[k]||m[k]||i;return a?n.createElement(v,o(o({ref:t},p),{},{components:a})):n.createElement(v,o({ref:t},p))}));function v(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,o=new Array(i);o[0]=k;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[u]="string"==typeof e?e:r,o[1]=l;for(var d=2;d<i;d++)o[d]=a[d];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}k.displayName="MDXCreateElement"},55901:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>m,frontMatter:()=>i,metadata:()=>l,toc:()=>d});var n=a(87462),r=(a(67294),a(3905));const i={id:"DefaultNavStatusBoxDataProvider",title:"Class: DefaultNavStatusBoxDataProvider",sidebar_label:"DefaultNavStatusBoxDataProvider",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"garminsdk/classes/DefaultNavStatusBoxDataProvider",id:"garminsdk/classes/DefaultNavStatusBoxDataProvider",title:"Class: DefaultNavStatusBoxDataProvider",description:"A default implementation of NavStatusBoxDataProvider.",source:"@site/docs/garminsdk/classes/DefaultNavStatusBoxDataProvider.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/DefaultNavStatusBoxDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultNavStatusBoxDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"DefaultNavStatusBoxDataProvider",title:"Class: DefaultNavStatusBoxDataProvider",sidebar_label:"DefaultNavStatusBoxDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"DefaultNavDataBarFieldModelFactory",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultNavDataBarFieldModelFactory"},next:{title:"DefaultObsSuspDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultObsSuspDataProvider"}},s={},d=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"obsCourse",id:"obscourse",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"trackedLegs",id:"trackedlegs",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"waypointAlertState",id:"waypointalertstate",level:3},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"waypointAlertTime",id:"waypointalerttime",level:3},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"init",id:"init",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"pause",id:"pause",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"resume",id:"resume",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-8",level:4}],p={toc:d},u="wrapper";function m(e){let{components:t,...a}=e;return(0,r.kt)(u,(0,n.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A default implementation of ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavStatusBoxDataProvider"},"NavStatusBoxDataProvider"),"."),(0,r.kt)("h2",{id:"implements"},"Implements"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavStatusBoxDataProvider"},(0,r.kt)("inlineCode",{parentName:"a"},"NavStatusBoxDataProvider")))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new DefaultNavStatusBoxDataProvider"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"fms"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"waypointAlertComputer"),")"),(0,r.kt)("p",null,"Constructor."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"fms")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/classes/Fms"},(0,r.kt)("inlineCode",{parentName:"a"},"Fms"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The FMS.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"waypointAlertComputer")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/classes/WaypointAlertComputer"},(0,r.kt)("inlineCode",{parentName:"a"},"WaypointAlertComputer"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The waypoint alert computer from which to source this provider's waypoint alert data.")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/navstatusbox/NavStatusBoxDataProvider.ts:88"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"obscourse"},"obsCourse"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"obsCourse"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current active OBS course, in degrees, or ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," if OBS is inactive."),(0,r.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavStatusBoxDataProvider"},"NavStatusBoxDataProvider"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavStatusBoxDataProvider#obscourse"},"obsCourse")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/navstatusbox/NavStatusBoxDataProvider.ts:65"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"trackedlegs"},"trackedLegs"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"trackedLegs"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#navstatustrackedlegs"},(0,r.kt)("inlineCode",{parentName:"a"},"NavStatusTrackedLegs")),">",">"),(0,r.kt)("p",null,"The current from, to, and next flight plan legs LNAV is tracking."),(0,r.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavStatusBoxDataProvider"},"NavStatusBoxDataProvider"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavStatusBoxDataProvider#trackedlegs"},"trackedLegs")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/navstatusbox/NavStatusBoxDataProvider.ts:56"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"waypointalertstate"},"waypointAlertState"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"waypointAlertState"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WaypointAlertStateEvent"},(0,r.kt)("inlineCode",{parentName:"a"},"WaypointAlertStateEvent")),">",">"),(0,r.kt)("p",null,"The current waypoint alert state."),(0,r.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavStatusBoxDataProvider"},"NavStatusBoxDataProvider"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavStatusBoxDataProvider#waypointalertstate"},"waypointAlertState")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/navstatusbox/NavStatusBoxDataProvider.ts:68"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"waypointalerttime"},"waypointAlertTime"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"waypointAlertTime"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NumberUnitSubject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Duration"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"SimpleUnit"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Duration"),">",">"),(0,r.kt)("p",null,"The time remaining for the current waypoint alert, or ",(0,r.kt)("inlineCode",{parentName:"p"},"NaN")," if an alert is not active."),(0,r.kt)("h4",{id:"implementation-of-3"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavStatusBoxDataProvider"},"NavStatusBoxDataProvider"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavStatusBoxDataProvider#waypointalerttime"},"waypointAlertTime")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/navstatusbox/NavStatusBoxDataProvider.ts:71"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"destroy"},"destroy"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can\nno longer be paused or resumed."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/navstatusbox/NavStatusBoxDataProvider.ts:263"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"init"},"init"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"init"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Initializes this data provider. Once initialized, this data provider will continuously update its data until\npaused or destroyed."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if this data provider is dead."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"paused")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"false")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether to initialize this data provider as paused. If ",(0,r.kt)("inlineCode",{parentName:"td"},"true"),", this data provider will provide an initial set of data but will not update the provided data until it is resumed. Defaults to ",(0,r.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/navstatusbox/NavStatusBoxDataProvider.ts:102"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"pause"},"pause"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"pause"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Pauses this data provider. Once paused, this data provider will not update its data until it is resumed."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if this data provider is dead."),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/navstatusbox/NavStatusBoxDataProvider.ts:240"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"resume"},"resume"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"resume"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or\ndestroyed."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if this data provider is dead."),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/navstatusbox/NavStatusBoxDataProvider.ts:216"))}m.isMDXComponent=!0}}]);