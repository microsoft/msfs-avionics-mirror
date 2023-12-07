"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[66632],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>g});var n=a(67294);function i(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function r(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?r(Object(a),!0).forEach((function(t){i(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,i=function(e,t){if(null==e)return{};var a,n,i={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(i[a]=e[a]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}var d=n.createContext({}),s=function(e){var t=n.useContext(d),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},p=function(e){var t=s(e.components);return n.createElement(d.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var a=e.components,i=e.mdxType,r=e.originalType,d=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=s(a),k=i,g=m["".concat(d,".").concat(k)]||m[k]||u[k]||r;return a?n.createElement(g,l(l({ref:t},p),{},{components:a})):n.createElement(g,l({ref:t},p))}));function g(e,t){var a=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=a.length,l=new Array(r);l[0]=k;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:i,l[1]=o;for(var s=2;s<r;s++)l[s]=a[s];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}k.displayName="MDXCreateElement"},20224:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>u,frontMatter:()=>r,metadata:()=>o,toc:()=>s});var n=a(87462),i=(a(67294),a(3905));const r={id:"GarminLowBankManager",title:"Class: GarminLowBankManager",sidebar_label:"GarminLowBankManager",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/classes/GarminLowBankManager",id:"garminsdk/classes/GarminLowBankManager",title:"Class: GarminLowBankManager",description:"A manager which handles activation and deactivation of Low Bank Mode for Garmin autopilots. The manager ensures that",source:"@site/docs/garminsdk/classes/GarminLowBankManager.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/GarminLowBankManager",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminLowBankManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GarminLowBankManager",title:"Class: GarminLowBankManager",sidebar_label:"GarminLowBankManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GarminHeadingSyncManager",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminHeadingSyncManager"},next:{title:"GarminMapBuilder",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminMapBuilder"}},d={},s=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"init",id:"init",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"pauseAutoToggle",id:"pauseautotoggle",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"resumeAutoToggle",id:"resumeautotoggle",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"setLowBankActive",id:"setlowbankactive",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-5",level:4}],p={toc:s},m="wrapper";function u(e){let{components:t,...a}=e;return(0,i.kt)(m,(0,n.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A manager which handles activation and deactivation of Low Bank Mode for Garmin autopilots. The manager ensures that\nLow Bank Mode is active only when supported by the autopilot's active lateral mode. Optionally, it will also\nautomatically toggle Low Bank Mode in response to changes in indicated altitude."),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new GarminLowBankManager"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"activateAltitude?"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"deactivateAltitude?"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"supportedAdcIndexes?"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"autoToggleBankLimit?"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"supportedAhrsIndexes?"),")"),(0,i.kt)("p",null,"Creates a new instance of GarminLowBankManager. The new manager is created as uninitialized and with auto-toggle\npaused."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"Error if ",(0,i.kt)("inlineCode",{parentName:"p"},"activateAltitude")," is less than ",(0,i.kt)("inlineCode",{parentName:"p"},"deactivateAltitude"),"."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"bus")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"activateAltitude?")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The indicated altitude threshold, in feet, for automatic activation of low-bank mode. If defined and auto-toggle is supported, this manager will automatically activate low-bank mode when the airplane climbs from below to above this altitude.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"deactivateAltitude?")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The indicated altitude threshold, in feet, for automatic deactivation of low-bank mode. If defined and auto-toggle is supported, this manager will automatically deactivate low-bank mode when the airplane descends from above to below this altitude.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"supportedAdcIndexes?")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"Iterable"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"number"),">"),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"An iterable of ADC system indexes from which the manager can source indicated altitude data. Required for auto-toggle behavior. The manager will source data from the first ADC system (in the order returned by the iterable) whose state is equal to ",(0,i.kt)("inlineCode",{parentName:"td"},"AvionicsSystemState.On"),".")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"autoToggleBankLimit")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"0")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The bank angle, in degrees, above which auto-toggle is disabled.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"supportedAhrsIndexes?")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"Iterable"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"number"),">"),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"An iterable of AHRS system indexes from which the manager can source bank angle data. Required for auto-toggle behavior to be limited by aircraft bank. The manager will source data from the first AHRS system (in the order returned by the iterable) whose state is equal to ",(0,i.kt)("inlineCode",{parentName:"td"},"AvionicsSystemState.On"),".")))),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminLowBankManager.ts:79"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"destroy"},"destroy"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Destroys this manager."),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminLowBankManager.ts:320"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"init"},"init"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"init"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,i.kt)("p",null,"Initializes this manager. Once this manager is initialized, it will ensure that Low Bank Mode is active only when\nit is supported by the autopilot's active lateral mode. Additionally, it will automatically toggle Low Bank Mode\nin response to changes in indicated altitude if the function is supported and resumed."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"Error if this manager has been destroyed."),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminLowBankManager.ts:123"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"pauseautotoggle"},"pauseAutoToggle"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"pauseAutoToggle"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Pauses this manager's auto-toggle behavior. Once paused, this manager will no longer automatically\nactivate/deactivate Low Bank Mode until auto-toggle is resumed."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"Error if this manager has been destroyed."),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminLowBankManager.ts:227"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"resumeautotoggle"},"resumeAutoToggle"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"resumeAutoToggle"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Resumes this manager's auto-toggle behavior. Once resumed, this manager will automatically activate/deactivate\nLow Bank Mode based on changes in indicated altitude. If this manager has not been initialized, auto-toggle\nbehavior will begin when initialization is complete."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"Error if this manager has been destroyed."),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminLowBankManager.ts:207"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"setlowbankactive"},"setLowBankActive"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"setLowBankActive"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"active"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Sets the active state of Low Bank Mode."),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"active")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether to activate Low Bank Mode.")))),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/GarminLowBankManager.ts:246"))}u.isMDXComponent=!0}}]);