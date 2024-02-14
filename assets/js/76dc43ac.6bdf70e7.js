"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[52913],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>u});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var d=i.createContext({}),o=function(e){var t=i.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=o(e.components);return i.createElement(d.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},k=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,d=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),m=o(n),k=r,u=m["".concat(d,".").concat(k)]||m[k]||c[k]||a;return n?i.createElement(u,l(l({ref:t},p),{},{components:n})):i.createElement(u,l({ref:t},p))}));function u(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,l=new Array(a);l[0]=k;var s={};for(var d in t)hasOwnProperty.call(t,d)&&(s[d]=t[d]);s.originalType=e,s[m]="string"==typeof e?e:r,l[1]=s;for(var o=2;o<a;o++)l[o]=n[o];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}k.displayName="MDXCreateElement"},78112:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>c,frontMatter:()=>a,metadata:()=>s,toc:()=>o});var i=n(87462),r=(n(67294),n(3905));const a={id:"GpsReceiverSystem",title:"Class: GpsReceiverSystem",sidebar_label:"GpsReceiverSystem",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"garminsdk/classes/GpsReceiverSystem",id:"garminsdk/classes/GpsReceiverSystem",title:"Class: GpsReceiverSystem",description:"A Garmin GPS receiver system.",source:"@site/docs/garminsdk/classes/GpsReceiverSystem.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/GpsReceiverSystem",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GpsReceiverSystem",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GpsReceiverSystem",title:"Class: GpsReceiverSystem",sidebar_label:"GpsReceiverSystem",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GpsReceiverSelector",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GpsReceiverSelector"},next:{title:"HorizonDisplay",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/HorizonDisplay"}},d={},o=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"_state",id:"_state",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"bus",id:"bus",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"electricalPowerLogic",id:"electricalpowerlogic",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"electricalPowerSub",id:"electricalpowersub",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"index",id:"index",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"initializationTime",id:"initializationtime",level:3},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"initializationTimer",id:"initializationtimer",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"isPowerValid",id:"ispowervalid",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"isPowered",id:"ispowered",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"publisher",id:"publisher",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"stateEvent",id:"stateevent",level:3},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"Accessors",id:"accessors",level:2},{value:"state",id:"state",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"Methods",id:"methods",level:2},{value:"connectToPower",id:"connecttopower",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"onPowerChanged",id:"onpowerchanged",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"onPowerValid",id:"onpowervalid",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"onStateChanged",id:"onstatechanged",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"onUpdate",id:"onupdate",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"setState",id:"setstate",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"updatePowerFromLogic",id:"updatepowerfromlogic",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-19",level:4}],p={toc:o},m="wrapper";function c(e){let{components:t,...n}=e;return(0,r.kt)(m,(0,i.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A Garmin GPS receiver system."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"BasicAvionicsSystem"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/GpsReceiverSystemEvents"},(0,r.kt)("inlineCode",{parentName:"a"},"GpsReceiverSystemEvents")),">"),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"GpsReceiverSystem"))))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new GpsReceiverSystem"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"index"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"gpsSatComputer"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"powerSource?"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"options?"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/GpsReceiverSystem"},(0,r.kt)("inlineCode",{parentName:"a"},"GpsReceiverSystem"))),(0,r.kt)("p",null,"Creates an instance of a GPS receiver system."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"index")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The index of the GPS receiver.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},"An instance of the event bus.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"gpsSatComputer")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"GPSSatComputer")),(0,r.kt)("td",{parentName:"tr",align:"left"},"This system's GPS computer system.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"powerSource?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"CompositeLogicXMLElement")," ","|"," keyof BaseElectricalEvents ","|"," ","`","elec","_","bus","_","main","_","v","_","$","{","number}","`"," ","|"," ","`","elec","_","bus","_","main","_","a","_","$","{","number}","`"," ","|"," ","`","elec","_","master","_","battery","_","$","{","number}","`"," ","|"," ","`","elec","_","circuit","_","avionics","_","on","_","$","{","number}","`"," ","|"," ","`","elec","_","bat","_","v","_","$","{","number}","`"," ","|"," ","`","elec","_","bat","_","a","_","$","{","number}","`"," ","|"," ","`","elec","_","ext","_","power","_","available","_","$","{","number}","`"," ","|"," ","`","elec","_","ext","_","power","_","on","_","$","{","number}","`"," ","|"," ","`","elec","_","apu","_","gen","_","active","_","$","{","number}","`"," ","|"," ","`","elec","_","apu","_","gen","_","switch","_","$","{","number}","`"," ","|"," ","`","elec","_","eng","_","gen","_","switch","_","$","{","number}","`"," ","|"," ","`","elec","_","circuit","_","on","_","$","{","number}","`"," ","|"," ","`","elec","_","circuit","_","switch","_","on","_","$","{","number}","`"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The ElectricalEvents topic or electricity logic element to which to connect the system's power.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"options?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/modules#gpsreceiversystemoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"GpsReceiverSystemOptions")),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"Options with which to configure the system.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/GpsReceiverSystem"},(0,r.kt)("inlineCode",{parentName:"a"},"GpsReceiverSystem"))),(0,r.kt)("h4",{id:"overrides"},"Overrides"),(0,r.kt)("p",null,"BasicAvionicsSystem\\","<","GpsReceiverSystemEvents\\",">",".constructor"),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/system/GpsReceiverSystem.ts:82"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"_state"},"_","state"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"_","state"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"AvionicsSystemState")),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.","_","state"),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:32"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"bus"},"bus"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"bus"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,r.kt)("p",null,"The instance of the event bus for the system to use."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.bus"),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:63"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"electricalpowerlogic"},"electricalPowerLogic"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"electricalPowerLogic"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"CompositeLogicXMLElement")),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.electricalPowerLogic"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:48"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"electricalpowersub"},"electricalPowerSub"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"electricalPowerSub"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,r.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.electricalPowerSub"),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:47"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"index"},"index"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"index"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the system."),(0,r.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.index"),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:62"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"initializationtime"},"initializationTime"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"initializationTime"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"0")),(0,r.kt)("h4",{id:"overrides-1"},"Overrides"),(0,r.kt)("p",null,"BasicAvionicsSystem.initializationTime"),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/system/GpsReceiverSystem.ts:45"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"initializationtimer"},"initializationTimer"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"initializationTimer"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"DebounceTimer")),(0,r.kt)("p",null,"A timeout after which initialization will be complete."),(0,r.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.initializationTimer"),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:42"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ispowervalid"},"isPowerValid"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"isPowerValid"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"false")),(0,r.kt)("p",null,"Whether power data consumed by this system is valid."),(0,r.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.isPowerValid"),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:53"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ispowered"},"isPowered"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"isPowered"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether or not the system is powered."),(0,r.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.isPowered"),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:45"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"publisher"},"publisher"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"publisher"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Publisher"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/GpsReceiverSystemEvents"},(0,r.kt)("inlineCode",{parentName:"a"},"GpsReceiverSystemEvents")),">"),(0,r.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.publisher"),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:50"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"stateevent"},"stateEvent"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"stateEvent"),": ","`","gps","_","rec","_","state","_","$","{","number}","`"),(0,r.kt)("p",null,"The key of the state update event to send on state update."),(0,r.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.stateEvent"),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:64"),(0,r.kt)("h2",{id:"accessors"},"Accessors"),(0,r.kt)("h3",{id:"state"},"state"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"get")," ",(0,r.kt)("strong",{parentName:"p"},"state"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"AvionicsSystemState")),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"AvionicsSystemState")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.state"),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:34"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"connecttopower"},"connectToPower"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"connectToPower"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"source"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Connects this system's power state to an ElectricalEvents topic, electricity logic element, or\nSubscribable."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"source")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"CompositeLogicXMLElement")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"boolean"),">"," ","|"," keyof BaseElectricalEvents ","|"," ","`","elec","_","bus","_","main","_","v","_","$","{","number}","`"," ","|"," ","`","elec","_","bus","_","main","_","a","_","$","{","number}","`"," ","|"," ","`","elec","_","master","_","battery","_","$","{","number}","`"," ","|"," ","`","elec","_","circuit","_","avionics","_","on","_","$","{","number}","`"," ","|"," ","`","elec","_","bat","_","v","_","$","{","number}","`"," ","|"," ","`","elec","_","bat","_","a","_","$","{","number}","`"," ","|"," ","`","elec","_","ext","_","power","_","available","_","$","{","number}","`"," ","|"," ","`","elec","_","ext","_","power","_","on","_","$","{","number}","`"," ","|"," ","`","elec","_","apu","_","gen","_","active","_","$","{","number}","`"," ","|"," ","`","elec","_","apu","_","gen","_","switch","_","$","{","number}","`"," ","|"," ","`","elec","_","eng","_","gen","_","switch","_","$","{","number}","`"," ","|"," ","`","elec","_","circuit","_","on","_","$","{","number}","`"," ","|"," ","`","elec","_","circuit","_","switch","_","on","_","$","{","number}","`"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The source to which to connect this system's power state.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.connectToPower"),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:95"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onpowerchanged"},"onPowerChanged"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onPowerChanged"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"isPowered"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"A callback called when the connected power state of the avionics system changes."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"isPowered")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether or not the system is powered.")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-12"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.onPowerChanged"),(0,r.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:140"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onpowervalid"},"onPowerValid"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onPowerValid"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Responds to when power data becomes valid."),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-13"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.onPowerValid"),(0,r.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:86"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onstatechanged"},"onStateChanged"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onStateChanged"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"previousState"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"currentState"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"previousState")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"AvionicsSystemState"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"currentState")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"AvionicsSystemState"))))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"overrides-2"},"Overrides"),(0,r.kt)("p",null,"BasicAvionicsSystem.onStateChanged"),(0,r.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/system/GpsReceiverSystem.ts:145"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onupdate"},"onUpdate"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onUpdate"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"overrides-3"},"Overrides"),(0,r.kt)("p",null,"BasicAvionicsSystem.onUpdate"),(0,r.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/system/GpsReceiverSystem.ts:169"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"setstate"},"setState"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"setState"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"state"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Sets the state of the avionics system and publishes the change."),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"state")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"AvionicsSystemState")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The new state to change to.")))),(0,r.kt)("h4",{id:"returns-7"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-14"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.setState"),(0,r.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:117"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"updatepowerfromlogic"},"updatePowerFromLogic"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"updatePowerFromLogic"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Updates this system's power state from an electricity logic element."),(0,r.kt)("h4",{id:"returns-8"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-15"},"Inherited from"),(0,r.kt)("p",null,"BasicAvionicsSystem.updatePowerFromLogic"),(0,r.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,r.kt)("p",null,"src/sdk/system/BasicAvionicsSystem.ts:171"))}c.isMDXComponent=!0}}]);