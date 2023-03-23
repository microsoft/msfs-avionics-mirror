"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[56695],{3905:(e,t,n)=>{n.d(t,{Zo:()=>o,kt:()=>u});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=i.createContext({}),s=function(e){var t=i.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},o=function(e){var t=s(e.components);return i.createElement(p.Provider,{value:t},e.children)},k="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},c=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,p=e.parentName,o=d(e,["components","mdxType","originalType","parentName"]),k=s(n),c=r,u=k["".concat(p,".").concat(c)]||k[c]||m[c]||a;return n?i.createElement(u,l(l({ref:t},o),{},{components:n})):i.createElement(u,l({ref:t},o))}));function u(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,l=new Array(a);l[0]=c;var d={};for(var p in t)hasOwnProperty.call(t,p)&&(d[p]=t[p]);d.originalType=e,d[k]="string"==typeof e?e:r,l[1]=d;for(var s=2;s<a;s++)l[s]=n[s];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}c.displayName="MDXCreateElement"},17826:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>m,frontMatter:()=>a,metadata:()=>d,toc:()=>s});var i=n(87462),r=(n(67294),n(3905));const a={id:"GpsReceiverSelector",title:"Class: GpsReceiverSelector",sidebar_label:"GpsReceiverSelector",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/classes/GpsReceiverSelector",id:"garminsdk/classes/GpsReceiverSelector",title:"Class: GpsReceiverSelector",description:"Automatically selects the best GPS receiver from a set of candidates based on the current states of all receivers.",source:"@site/docs/garminsdk/classes/GpsReceiverSelector.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/GpsReceiverSelector",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GpsReceiverSelector",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GpsReceiverSelector",title:"Class: GpsReceiverSelector",sidebar_label:"GpsReceiverSelector",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GlidepathServiceLevelCalculator",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GlidepathServiceLevelCalculator"},next:{title:"GpsReceiverSystem",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GpsReceiverSystem"}},p={},s=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"_selectedIndex",id:"_selectedindex",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"enabledReceiverIndexes",id:"enabledreceiverindexes",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"enabledReceiverIndexesSub",id:"enabledreceiverindexessub",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"gpsStates",id:"gpsstates",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"isAlive",id:"isalive",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"isInit",id:"isinit",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"preferredReceiverIndex",id:"preferredreceiverindex",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"preferredReceiverIndexSub",id:"preferredreceiverindexsub",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"selectedIndex",id:"selectedindex",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"GPS_STATE_PRIORITIES",id:"gps_state_priorities",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"init",id:"init",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"selectIndex",id:"selectindex",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"compareGpsState",id:"comparegpsstate",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-15",level:4}],o={toc:s},k="wrapper";function m(e){let{components:t,...n}=e;return(0,r.kt)(k,(0,i.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Automatically selects the best GPS receiver from a set of candidates based on the current states of all receivers.\nReceivers that have computed a 3D position solution with differential corrections are favored over those that have\ncomputed a 3D solution without corrections, and either of these are favored over those that have not computed any\nposition solution."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new GpsReceiverSelector"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"enabledReceiverIndexes"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"preferredReceiverIndex?"),")"),(0,r.kt)("p",null,"Constructor."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"enabledReceiverIndexes")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Iterable"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"number"),">"," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"SubscribableSet"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"number"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The indexes of the GPS receivers from which to select.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"preferredReceiverIndex?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"number"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The index of this selector's preferred GPS receiver, or ",(0,r.kt)("inlineCode",{parentName:"td"},"-1")," if there is no such receiver. This selector is guaranteed to select the the preferred GPS receiver's if its state is at least as desirable as the state of all other receivers from which to select.")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:40"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"_selectedindex"},"_","selectedIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"_","selectedIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:21"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"bus"},"bus"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"bus"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,r.kt)("p",null,"The event bus."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:41"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"enabledreceiverindexes"},"enabledReceiverIndexes"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"enabledReceiverIndexes"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"SubscribableSet"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:18"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"enabledreceiverindexessub"},"enabledReceiverIndexesSub"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"enabledReceiverIndexesSub"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:29"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"gpsstates"},"gpsStates"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"gpsStates"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Map"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"ConsumerSubject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"GPSSystemState"),">",">"),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:24"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isalive"},"isAlive"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"isAlive"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:26"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isinit"},"isInit"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"isInit"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"false")),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:27"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"preferredreceiverindex"},"preferredReceiverIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"preferredReceiverIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:19"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"preferredreceiverindexsub"},"preferredReceiverIndexSub"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"preferredReceiverIndexSub"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:30"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"selectedindex"},"selectedIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"selectedIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:22"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"gps_state_priorities"},"GPS","_","STATE","_","PRIORITIES"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"GPS","_","STATE","_","PRIORITIES"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Object")),(0,r.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Acquiring")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"DiffSolutionAcquired")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Searching")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"SolutionAcquired")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number"))))),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:11"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"destroy"},"destroy"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Destroys this manager."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:124"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"init"},"init"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"init"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Initializes this manager. Once initialized, this manager will automatically keep the minimums unit in sync with\nthe Garmin altitude display units setting until it is destroyed."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if this manager has been destroyed."),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:54"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"selectindex"},"selectIndex"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"selectIndex"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Selects the index of the GPS receiver with the most desirable state."),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:88"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"comparegpsstate"},"compareGpsState"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"compareGpsState"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"a"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"b"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Compares two GPS system states and returns a number whose sign indicates which one is more desirable."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"a")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"GPSSystemState")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The first GPS system state to compare.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"b")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"GPSSystemState")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The second GPS system state to compare.")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"A negative number of state ",(0,r.kt)("inlineCode",{parentName:"p"},"a")," is more desirable than ",(0,r.kt)("inlineCode",{parentName:"p"},"b"),", a positive number if state ",(0,r.kt)("inlineCode",{parentName:"p"},"b")," is more\ndesirable than ",(0,r.kt)("inlineCode",{parentName:"p"},"a"),", or zero if the two states are equally desirable."),(0,r.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,r.kt)("p",null,"garminsdk/navigation/GpsReceiverSelector.ts:142"))}m.isMDXComponent=!0}}]);