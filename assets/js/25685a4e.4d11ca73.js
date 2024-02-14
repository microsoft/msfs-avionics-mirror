"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[50384],{3905:(e,t,n)=>{n.d(t,{Zo:()=>o,kt:()=>c});var s=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);t&&(s=s.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,s)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,s,r=function(e,t){if(null==e)return{};var n,s,r={},i=Object.keys(e);for(s=0;s<i.length;s++)n=i[s],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(s=0;s<i.length;s++)n=i[s],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var m=s.createContext({}),u=function(e){var t=s.useContext(m),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},o=function(e){var t=u(e.components);return s.createElement(m.Provider,{value:t},e.children)},f="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return s.createElement(s.Fragment,{},t)}},d=s.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,m=e.parentName,o=a(e,["components","mdxType","originalType","parentName"]),f=u(n),d=r,c=f["".concat(m,".").concat(d)]||f[d]||p[d]||i;return n?s.createElement(c,l(l({ref:t},o),{},{components:n})):s.createElement(c,l({ref:t},o))}));function c(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=d;var a={};for(var m in t)hasOwnProperty.call(t,m)&&(a[m]=t[m]);a.originalType=e,a[f]="string"==typeof e?e:r,l[1]=a;for(var u=2;u<i;u++)l[u]=n[u];return s.createElement.apply(null,l)}return s.createElement.apply(null,n)}d.displayName="MDXCreateElement"},65729:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>m,contentTitle:()=>l,default:()=>p,frontMatter:()=>i,metadata:()=>a,toc:()=>u});var s=n(87462),r=(n(67294),n(3905));const i={id:"FuelSystemEvents",title:"Interface: FuelSystemEvents",sidebar_label:"FuelSystemEvents",sidebar_position:0,custom_edit_url:null},l=void 0,a={unversionedId:"framework/interfaces/FuelSystemEvents",id:"framework/interfaces/FuelSystemEvents",title:"Interface: FuelSystemEvents",description:"Events related to fuel system information.",source:"@site/docs/framework/interfaces/FuelSystemEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/FuelSystemEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FuelSystemEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FuelSystemEvents",title:"Interface: FuelSystemEvents",sidebar_label:"FuelSystemEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FsInstrument",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FsInstrument"},next:{title:"GNSSEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/GNSSEvents"}},m={},u=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"fuel_system_engine_pressure",id:"fuel_system_engine_pressure",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"fuel_system_line_flow",id:"fuel_system_line_flow",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"fuel_system_line_pressure",id:"fuel_system_line_pressure",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"fuel_system_pump_active",id:"fuel_system_pump_active",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"fuel_system_pump_switch",id:"fuel_system_pump_switch",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"fuel_system_tank_quantity",id:"fuel_system_tank_quantity",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"fuel_system_valve_open",id:"fuel_system_valve_open",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"fuel_system_valve_switch",id:"fuel_system_valve_switch",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-7",level:4}],o={toc:u},f="wrapper";function p(e){let{components:t,...n}=e;return(0,r.kt)(f,(0,s.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Events related to fuel system information."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents"},(0,r.kt)("inlineCode",{parentName:"a"},"BaseFuelSystemEvents")))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"FuelSystemIndexedEvents")),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"FuelSystemEvents"))))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"fuel_system_engine_pressure"},"fuel","_","system","_","engine","_","pressure"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"fuel","_","system","_","engine","_","pressure"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The engines's fuel pressure in psi."),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents"},"BaseFuelSystemEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents#fuel_system_engine_pressure"},"fuel_system_engine_pressure")),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/FuelSystemData.ts:25"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fuel_system_line_flow"},"fuel","_","system","_","line","_","flow"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"fuel","_","system","_","line","_","flow"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The fuel flow of a fuel line in gallons per hour."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents"},"BaseFuelSystemEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents#fuel_system_line_flow"},"fuel_system_line_flow")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/FuelSystemData.ts:31"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fuel_system_line_pressure"},"fuel","_","system","_","line","_","pressure"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"fuel","_","system","_","line","_","pressure"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The pressure of a fuel line in psi."),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents"},"BaseFuelSystemEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents#fuel_system_line_pressure"},"fuel_system_line_pressure")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/FuelSystemData.ts:28"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fuel_system_pump_active"},"fuel","_","system","_","pump","_","active"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"fuel","_","system","_","pump","_","active"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"The pump's active state (ex. false when pump is on but no fuel in tank)"),(0,r.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents"},"BaseFuelSystemEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents#fuel_system_pump_active"},"fuel_system_pump_active")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/FuelSystemData.ts:22"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fuel_system_pump_switch"},"fuel","_","system","_","pump","_","switch"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"fuel","_","system","_","pump","_","switch"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"The pump's switch state"),(0,r.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents"},"BaseFuelSystemEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents#fuel_system_pump_switch"},"fuel_system_pump_switch")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/FuelSystemData.ts:19"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fuel_system_tank_quantity"},"fuel","_","system","_","tank","_","quantity"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"fuel","_","system","_","tank","_","quantity"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The quantity of fuel in the selected tank (by tank index), in gallons."),(0,r.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents"},"BaseFuelSystemEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents#fuel_system_tank_quantity"},"fuel_system_tank_quantity")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/FuelSystemData.ts:34"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fuel_system_valve_open"},"fuel","_","system","_","valve","_","open"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"fuel","_","system","_","valve","_","open"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The valve's actual continous position, in percent, 0 ... 1"),(0,r.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents"},"BaseFuelSystemEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents#fuel_system_valve_open"},"fuel_system_valve_open")),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/FuelSystemData.ts:16"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fuel_system_valve_switch"},"fuel","_","system","_","valve","_","switch"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"fuel","_","system","_","valve","_","switch"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"The valve's switch:"),(0,r.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents"},"BaseFuelSystemEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFuelSystemEvents#fuel_system_valve_switch"},"fuel_system_valve_switch")),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/FuelSystemData.ts:13"))}p.isMDXComponent=!0}}]);