"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[29220],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>b});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=i.createContext({}),p=function(e){var t=i.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},d=function(e){var t=p(e.components);return i.createElement(s.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},c=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,s=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),m=p(n),c=r,b=m["".concat(s,".").concat(c)]||m[c]||u[c]||a;return n?i.createElement(b,l(l({ref:t},d),{},{components:n})):i.createElement(b,l({ref:t},d))}));function b(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,l=new Array(a);l[0]=c;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[m]="string"==typeof e?e:r,l[1]=o;for(var p=2;p<a;p++)l[p]=n[p];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}c.displayName="MDXCreateElement"},7939:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>u,frontMatter:()=>a,metadata:()=>o,toc:()=>p});var i=n(87462),r=(n(67294),n(3905));const a={id:"AmbientEvents",title:"Interface: AmbientEvents",sidebar_label:"AmbientEvents",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/interfaces/AmbientEvents",id:"framework/interfaces/AmbientEvents",title:"Interface: AmbientEvents",description:"Events related to air data computer information.",source:"@site/docs/framework/interfaces/AmbientEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/AmbientEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AmbientEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AmbientEvents",title:"Interface: AmbientEvents",sidebar_label:"AmbientEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AltitudeSelectEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AltitudeSelectEvents"},next:{title:"AntiIceEngineIndexedTopics",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AntiIceEngineIndexedTopics"}},s={},p=[{value:"Properties",id:"properties",level:2},{value:"ambient_in_cloud",id:"ambient_in_cloud",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"ambient_precip_rate",id:"ambient_precip_rate",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"ambient_precip_state",id:"ambient_precip_state",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"ambient_qnh_inhg",id:"ambient_qnh_inhg",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"ambient_qnh_mb",id:"ambient_qnh_mb",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"ambient_visibility",id:"ambient_visibility",level:3},{value:"Defined in",id:"defined-in-5",level:4}],d={toc:p},m="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(m,(0,i.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Events related to air data computer information."),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"ambient_in_cloud"},"ambient","_","in","_","cloud"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"ambient","_","in","_","cloud"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether the airplane is in a cloud."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/Ambient.ts:29"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ambient_precip_rate"},"ambient","_","precip","_","rate"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"ambient","_","precip","_","rate"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The ambient precipitation rate, in millimeters per hour."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/Ambient.ts:23"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ambient_precip_state"},"ambient","_","precip","_","state"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"ambient","_","precip","_","state"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The ambient precipitation state."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/Ambient.ts:20"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ambient_qnh_inhg"},"ambient","_","qnh","_","inhg"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"ambient","_","qnh","_","inhg"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The QNH (barometric pressure setting required for an altimeter at ground elevation to read true ground elevation)\nat the airplane's current position, in inches of mercury."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/Ambient.ts:35"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ambient_qnh_mb"},"ambient","_","qnh","_","mb"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"ambient","_","qnh","_","mb"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The QNH (barometric pressure setting required for an altimeter at ground elevation to read true ground elevation)\nat the airplane's current position, in millibars."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/Ambient.ts:41"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ambient_visibility"},"ambient","_","visibility"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"ambient","_","visibility"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The ambient particle visibility, in meters."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/instruments/Ambient.ts:26"))}u.isMDXComponent=!0}}]);