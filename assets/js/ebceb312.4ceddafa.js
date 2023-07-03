"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[82527],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>k});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=i.createContext({}),m=function(e){var t=i.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},d=function(e){var t=m(e.components);return i.createElement(l.Provider,{value:t},e.children)},c="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,l=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),c=m(n),u=r,k=c["".concat(l,".").concat(u)]||c[u]||p[u]||a;return n?i.createElement(k,s(s({ref:t},d),{},{components:n})):i.createElement(k,s({ref:t},d))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,s=new Array(a);s[0]=u;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[c]="string"==typeof e?e:r,s[1]=o;for(var m=2;m<a;m++)s[m]=n[m];return i.createElement.apply(null,s)}return i.createElement.apply(null,n)}u.displayName="MDXCreateElement"},69769:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>s,default:()=>p,frontMatter:()=>a,metadata:()=>o,toc:()=>m});var i=n(87462),r=(n(67294),n(3905));const a={id:"EngineAirframeSystem",title:"Class: EngineAirframeSystem",sidebar_label:"EngineAirframeSystem",sidebar_position:0,custom_edit_url:null},s=void 0,o={unversionedId:"g1000common/classes/EngineAirframeSystem",id:"g1000common/classes/EngineAirframeSystem",title:"Class: EngineAirframeSystem",description:"The GEA engine/airframe system.",source:"@site/docs/g1000common/classes/EngineAirframeSystem.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/EngineAirframeSystem",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/EngineAirframeSystem",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"EngineAirframeSystem",title:"Class: EngineAirframeSystem",sidebar_label:"EngineAirframeSystem",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"EIS",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/EIS"},next:{title:"EngineMenu",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/EngineMenu"}},l={},m=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"bus",id:"bus",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"index",id:"index",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"initializationTime",id:"initializationtime",level:3},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"initializationTimeout",id:"initializationtimeout",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"isPowered",id:"ispowered",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"state",id:"state",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"stateEvent",id:"stateevent",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"Methods",id:"methods",level:2},{value:"connectToPower",id:"connecttopower",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"onPowerChanged",id:"onpowerchanged",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"onUpdate",id:"onupdate",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"setState",id:"setstate",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-11",level:4}],d={toc:m},c="wrapper";function p(e){let{components:t,...n}=e;return(0,r.kt)(c,(0,i.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"The GEA engine/airframe system."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem"},(0,r.kt)("inlineCode",{parentName:"a"},"BasicAvionicsSystem")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/EngineAirframeSystemEvents"},(0,r.kt)("inlineCode",{parentName:"a"},"EngineAirframeSystemEvents")),">"),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"EngineAirframeSystem"))))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new EngineAirframeSystem"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"index"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),")"),(0,r.kt)("p",null,"Creates an instance of the EngineAirframeSystem."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"index")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The index of the system.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The instance of the event bus for the system to use.")))),(0,r.kt)("h4",{id:"overrides"},"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem"},"BasicAvionicsSystem"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem#constructor"},"constructor")),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Systems/EngineAirframeSystem.ts:17"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"bus"},"bus"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"bus"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,r.kt)("p",null,"The instance of the event bus for the system to use."),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem"},"BasicAvionicsSystem"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem#bus"},"bus")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Systems/EngineAirframeSystem.ts:17"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"index"},"index"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"index"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the system."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem"},"BasicAvionicsSystem"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem#index"},"index")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Systems/EngineAirframeSystem.ts:17"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"initializationtime"},"initializationTime"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"initializationTime"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"12000")),(0,r.kt)("p",null,"The time it takes in milliseconds for the system to initialize."),(0,r.kt)("h4",{id:"overrides-1"},"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem"},"BasicAvionicsSystem"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem#initializationtime"},"initializationTime")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Systems/EngineAirframeSystem.ts:10"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"initializationtimeout"},"initializationTimeout"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"initializationTimeout"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"A timeout after which initialization will be complete."),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem"},"BasicAvionicsSystem"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem#initializationtimeout"},"initializationTimeout")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Systems/BasicAvionicsSystem.ts:27"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ispowered"},"isPowered"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"isPowered"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether or not the system is powered."),(0,r.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem"},"BasicAvionicsSystem"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem#ispowered"},"isPowered")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Systems/BasicAvionicsSystem.ts:30"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"state"},"state"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"state"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/enums/AvionicsSystemState"},(0,r.kt)("inlineCode",{parentName:"a"},"AvionicsSystemState"))),(0,r.kt)("p",null,"The state of the avionics system."),(0,r.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem"},"BasicAvionicsSystem"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem#state"},"state")),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Systems/BasicAvionicsSystem.ts:21"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"stateevent"},"stateEvent"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"stateEvent"),": ",(0,r.kt)("inlineCode",{parentName:"p"},'"engineairframe_state"')),(0,r.kt)("p",null,"The key of the state update event to send on state update."),(0,r.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem"},"BasicAvionicsSystem"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem#stateevent"},"stateEvent")),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Systems/BasicAvionicsSystem.ts:38"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"connecttopower"},"connectToPower"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"connectToPower"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"key"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Connects the system to the first avionics power bus."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"key")),(0,r.kt)("td",{parentName:"tr",align:"left"},"`","elec","_","bus","_","main","_","v","_","${number}","`"," ","|"," ","`","elec","_","bus","_","main","_","a","_","${number}","`"," ","|"," ","`","elec","_","master","_","battery","_","${number}","`"," ","|"," ","`","elec","_","circuit","_","avionics","_","on","_","${number}","`"," ","|"," ","`","elec","_","bat","_","v","_","${number}","`"," ","|"," ","`","elec","_","bat","_","a","_","${number}","`"," ","|"," ","`","elec","_","ext","_","power","_","available","_","${number}","`"," ","|"," ","`","elec","_","ext","_","power","_","on","_","${number}","`"," ","|"," ","`","elec","_","apu","_","gen","_","active","_","${number}","`"," ","|"," ","`","elec","_","apu","_","gen","_","switch","_","${number}","`"," ","|"," ","`","elec","_","eng","_","gen","_","switch","_","${number}","`"," ","|"," ","`","elec","_","circuit","_","on","_","${number}","`"," ","|"," ","`","elec","_","circuit","_","switch","_","on","_","${number}","`"," ","|"," keyof ",(0,r.kt)("inlineCode",{parentName:"td"},"BaseElectricalEvents")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The electrical event key to connect to.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem"},"BasicAvionicsSystem"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem#connecttopower"},"connectToPower")),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Systems/BasicAvionicsSystem.ts:47"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onpowerchanged"},"onPowerChanged"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"onPowerChanged"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"isPowered"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"A callback called when the connected power state of the avionics system changes."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"isPowered")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether or not the system is powered.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem"},"BasicAvionicsSystem"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem#onpowerchanged"},"onPowerChanged")),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Systems/BasicAvionicsSystem.ts:69"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onupdate"},"onUpdate"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onUpdate"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"A callback to call to update the state of the avionics system."),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem"},"BasicAvionicsSystem"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem#onupdate"},"onUpdate")),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Systems/BasicAvionicsSystem.ts:41"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"setstate"},"setState"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"setState"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"state"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Sets the state of the avionics system and publishes the change."),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"state")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/enums/AvionicsSystemState"},(0,r.kt)("inlineCode",{parentName:"a"},"AvionicsSystemState"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The new state to change to.")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem"},"BasicAvionicsSystem"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BasicAvionicsSystem#setstate"},"setState")),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Systems/BasicAvionicsSystem.ts:58"))}p.isMDXComponent=!0}}]);