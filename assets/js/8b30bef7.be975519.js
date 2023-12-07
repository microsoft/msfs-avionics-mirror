"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[16428],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>v});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=r.createContext({}),s=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},d=function(e){var t=s(e.components);return r.createElement(c.Provider,{value:t},e.children)},p="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,c=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),p=s(n),u=i,v=p["".concat(c,".").concat(u)]||p[u]||f[u]||a;return n?r.createElement(v,o(o({ref:t},d),{},{components:n})):r.createElement(v,o({ref:t},d))}));function v(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=u;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[p]="string"==typeof e?e:i,o[1]=l;for(var s=2;s<a;s++)o[s]=n[s];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},46498:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>o,default:()=>f,frontMatter:()=>a,metadata:()=>l,toc:()=>s});var r=n(87462),i=(n(67294),n(3905));const a={id:"AircraftInertialEvents",title:"Interface: AircraftInertialEvents",sidebar_label:"AircraftInertialEvents",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"framework/interfaces/AircraftInertialEvents",id:"framework/interfaces/AircraftInertialEvents",title:"Interface: AircraftInertialEvents",description:"An interface that describes the possible aircraft inertial motion events.",source:"@site/docs/framework/interfaces/AircraftInertialEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/AircraftInertialEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AircraftInertialEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AircraftInertialEvents",title:"Interface: AircraftInertialEvents",sidebar_label:"AircraftInertialEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AiPilotEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AiPilotEvents"},next:{title:"AirportFacility",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AirportFacility"}},c={},s=[{value:"Properties",id:"properties",level:2},{value:"acceleration_body_x",id:"acceleration_body_x",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"acceleration_body_y",id:"acceleration_body_y",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"acceleration_body_z",id:"acceleration_body_z",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"rotation_velocity_body_x",id:"rotation_velocity_body_x",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"rotation_velocity_body_y",id:"rotation_velocity_body_y",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"rotation_velocity_body_z",id:"rotation_velocity_body_z",level:3},{value:"Defined in",id:"defined-in-5",level:4}],d={toc:s},p="wrapper";function f(e){let{components:t,...n}=e;return(0,i.kt)(p,(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"An interface that describes the possible aircraft inertial motion events."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"acceleration_body_x"},"acceleration","_","body","_","x"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"acceleration","_","body","_","x"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The airplane's linear acceleration, in meters per second per second, along the airplane's lateral (left-right)\naxis. Positive values indicate acceleration toward the right of the airplane."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/AircraftInertialPublisher.ts:16"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"acceleration_body_y"},"acceleration","_","body","_","y"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"acceleration","_","body","_","y"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The airplane's linear acceleration, in meters per second per second, along the airplane's vertical (bottom-top)\naxis. Positive values indicate acceleration toward the top of the airplane."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/AircraftInertialPublisher.ts:22"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"acceleration_body_z"},"acceleration","_","body","_","z"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"acceleration","_","body","_","z"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The airplane's linear acceleration, in meters per second per second, along the airplane's longitudinal\n(rear-front) axis. Positive values indicate acceleration toward the front of the airplane."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/AircraftInertialPublisher.ts:28"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"rotation_velocity_body_x"},"rotation","_","velocity","_","body","_","x"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"rotation","_","velocity","_","body","_","x"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The airplane's rotational velocity, in degrees per second, about its lateral (left-right) axis (i.e. the rate of\nchange of its pitch angle). Positive values indicate the airplane is pitching down."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/AircraftInertialPublisher.ts:34"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"rotation_velocity_body_y"},"rotation","_","velocity","_","body","_","y"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"rotation","_","velocity","_","body","_","y"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The airplane's rotational velocity, in degrees per second, about its vertical (bottom-top) axis (i.e. the rate of\nchange of its yaw angle). Positive values indicate the airplane is yawing to the right."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/AircraftInertialPublisher.ts:40"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"rotation_velocity_body_z"},"rotation","_","velocity","_","body","_","z"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"rotation","_","velocity","_","body","_","z"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The airplane's rotational velocity, in degrees per second, about its longitudinal (rear-front) axis (i.e. the rate\nof change of its roll/bank angle). Positive values indicate the airplane is rolling to the left."),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/AircraftInertialPublisher.ts:46"))}f.isMDXComponent=!0}}]);