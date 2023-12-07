"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[39907],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>k});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function d(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var o=n.createContext({}),s=function(e){var t=n.useContext(o),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},m=function(e){var t=s(e.components);return n.createElement(o.Provider,{value:t},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,m=d(e,["components","mdxType","originalType","parentName"]),p=s(a),c=r,k=p["".concat(o,".").concat(c)]||p[c]||u[c]||i;return a?n.createElement(k,l(l({ref:t},m),{},{components:a})):n.createElement(k,l({ref:t},m))}));function k(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=c;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[p]="string"==typeof e?e:r,l[1]=d;for(var s=2;s<i;s++)l[s]=a[s];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}c.displayName="MDXCreateElement"},40181:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>d,toc:()=>s});var n=a(87462),r=(a(67294),a(3905));const i={id:"DefaultTcasRaCommandDataProvider",title:"Class: DefaultTcasRaCommandDataProvider",sidebar_label:"DefaultTcasRaCommandDataProvider",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/classes/DefaultTcasRaCommandDataProvider",id:"garminsdk/classes/DefaultTcasRaCommandDataProvider",title:"Class: DefaultTcasRaCommandDataProvider",description:"A default implementation of TcasRaCommandDataProvider.",source:"@site/docs/garminsdk/classes/DefaultTcasRaCommandDataProvider.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/DefaultTcasRaCommandDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultTcasRaCommandDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"DefaultTcasRaCommandDataProvider",title:"Class: DefaultTcasRaCommandDataProvider",sidebar_label:"DefaultTcasRaCommandDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"DefaultRadarAltimeterDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultRadarAltimeterDataProvider"},next:{title:"DefaultUnitsUserSettingManager",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultUnitsUserSettingManager"}},o={},s=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"raFlyToMaxVs",id:"raflytomaxvs",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"raFlyToMinVs",id:"raflytominvs",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"raMaxVs",id:"ramaxvs",level:3},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"raMinVs",id:"raminvs",level:3},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"tcas",id:"tcas",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"init",id:"init",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"pause",id:"pause",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"resume",id:"resume",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-9",level:4}],m={toc:s},p="wrapper";function u(e){let{components:t,...a}=e;return(0,r.kt)(p,(0,n.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A default implementation of ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TcasRaCommandDataProvider"},"TcasRaCommandDataProvider"),"."),(0,r.kt)("h2",{id:"implements"},"Implements"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TcasRaCommandDataProvider"},(0,r.kt)("inlineCode",{parentName:"a"},"TcasRaCommandDataProvider")))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new DefaultTcasRaCommandDataProvider"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"tcas"),")"),(0,r.kt)("p",null,"Constructor."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"tcas")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Tcas"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"AbstractTcasIntruder"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"TcasSensitivity"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"TcasIntruder"),">",">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The TCAS which from which this data provider sources resolution advisory commands.")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"garminsdk/traffic/TcasRaCommandDataProvider.ts:67"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"raflytomaxvs"},"raFlyToMaxVs"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"raFlyToMaxVs"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The upper bound vertical speed, in feet per minute, of the current resolution advisory's fly-to command, or\n",(0,r.kt)("inlineCode",{parentName:"p"},"null")," if there is no such value."),(0,r.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TcasRaCommandDataProvider"},"TcasRaCommandDataProvider"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TcasRaCommandDataProvider#raflytomaxvs"},"raFlyToMaxVs")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/traffic/TcasRaCommandDataProvider.ts:54"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"raflytominvs"},"raFlyToMinVs"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"raFlyToMinVs"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The lower bound vertical speed, in feet per minute, of the current resolution advisory's fly-to command, or\n",(0,r.kt)("inlineCode",{parentName:"p"},"null")," if there is no such value."),(0,r.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TcasRaCommandDataProvider"},"TcasRaCommandDataProvider"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TcasRaCommandDataProvider#raflytominvs"},"raFlyToMinVs")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/traffic/TcasRaCommandDataProvider.ts:50"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ramaxvs"},"raMaxVs"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"raMaxVs"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The maximum allowed vertical speed, in feet per minute, commanded by the current resolution advisory, or ",(0,r.kt)("inlineCode",{parentName:"p"},"null"),"\nif there is no such value."),(0,r.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TcasRaCommandDataProvider"},"TcasRaCommandDataProvider"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TcasRaCommandDataProvider#ramaxvs"},"raMaxVs")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"garminsdk/traffic/TcasRaCommandDataProvider.ts:46"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"raminvs"},"raMinVs"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"raMinVs"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The minimum allowed vertical speed, in feet per minute, commanded by the current resolution advisory, or ",(0,r.kt)("inlineCode",{parentName:"p"},"null"),"\nif there is no such value."),(0,r.kt)("h4",{id:"implementation-of-3"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TcasRaCommandDataProvider"},"TcasRaCommandDataProvider"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TcasRaCommandDataProvider#raminvs"},"raMinVs")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"garminsdk/traffic/TcasRaCommandDataProvider.ts:42"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"tcas"},"tcas"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"tcas"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Tcas"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"AbstractTcasIntruder"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"TcasSensitivity"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"TcasIntruder"),">",">"),(0,r.kt)("p",null,"The TCAS which from which this data provider sources resolution advisory commands."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"garminsdk/traffic/TcasRaCommandDataProvider.ts:67"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"destroy"},"destroy"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can\nno longer be paused or resumed."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"garminsdk/traffic/TcasRaCommandDataProvider.ts:219"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"init"},"init"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"init"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Initializes this data provider. Once initialized, this data provider will continuously update its data until\npaused or destroyed."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if this data provider has been destroyed."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"paused")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"false")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether to initialize this data provider as paused. If ",(0,r.kt)("inlineCode",{parentName:"td"},"true"),", this data provider will provide an initial set of data but will not update the provided data until it is resumed. Defaults to ",(0,r.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"garminsdk/traffic/TcasRaCommandDataProvider.ts:77"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"pause"},"pause"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"pause"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Pauses this data provider. Once paused, this data provider will not update its data until it is resumed."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if this data provider has been destroyed."),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"garminsdk/traffic/TcasRaCommandDataProvider.ts:201"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"resume"},"resume"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"resume"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or\ndestroyed."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if this data provider has been destroyed."),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"garminsdk/traffic/TcasRaCommandDataProvider.ts:182"))}u.isMDXComponent=!0}}]);