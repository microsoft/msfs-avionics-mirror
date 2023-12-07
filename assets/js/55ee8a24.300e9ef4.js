"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[14603],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=r.createContext({}),u=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},c=function(e){var t=u(e.components);return r.createElement(s.Provider,{value:t},e.children)},p="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),p=u(n),d=i,m=p["".concat(s,".").concat(d)]||p[d]||f[d]||a;return n?r.createElement(m,l(l({ref:t},c),{},{components:n})):r.createElement(m,l({ref:t},c))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,l=new Array(a);l[0]=d;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[p]="string"==typeof e?e:i,l[1]=o;for(var u=2;u<a;u++)l[u]=n[u];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},62397:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>f,frontMatter:()=>a,metadata:()=>o,toc:()=>u});var r=n(87462),i=(n(67294),n(3905));const a={id:"FlightPlanRequestEvent",title:"Interface: FlightPlanRequestEvent",sidebar_label:"FlightPlanRequestEvent",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/interfaces/FlightPlanRequestEvent",id:"framework/interfaces/FlightPlanRequestEvent",title:"Interface: FlightPlanRequestEvent",description:"An event generated when an instrument requests a full set",source:"@site/docs/framework/interfaces/FlightPlanRequestEvent.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/FlightPlanRequestEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanRequestEvent",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPlanRequestEvent",title:"Interface: FlightPlanRequestEvent",sidebar_label:"FlightPlanRequestEvent",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPlanProcedureDetailsEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanProcedureDetailsEvent"},next:{title:"FlightPlanResponseEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanResponseEvent"}},s={},u=[{value:"Properties",id:"properties",level:2},{value:"uid",id:"uid",level:3},{value:"Defined in",id:"defined-in",level:4}],c={toc:u},p="wrapper";function f(e){let{components:t,...n}=e;return(0,i.kt)(p,(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"An event generated when an instrument requests a full set\nof plans from the bus."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"uid"},"uid"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"uid"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A unique ID attached to the request."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:203"))}f.isMDXComponent=!0}}]);