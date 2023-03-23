"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[69716],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),d=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=d(e.components);return r.createElement(s.Provider,{value:t},e.children)},c="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),c=d(n),u=a,m=c["".concat(s,".").concat(u)]||c[u]||f[u]||i;return n?r.createElement(m,l(l({ref:t},p),{},{components:n})):r.createElement(m,l({ref:t},p))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=u;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[c]="string"==typeof e?e:a,l[1]=o;for(var d=2;d<i;d++)l[d]=n[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},40263:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>f,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var r=n(87462),a=(n(67294),n(3905));const i={id:"index.FlightPlanUserDataEvent",title:"Interface: FlightPlanUserDataEvent",sidebar_label:"FlightPlanUserDataEvent",custom_edit_url:null},l=void 0,o={unversionedId:"framework/interfaces/index.FlightPlanUserDataEvent",id:"framework/interfaces/index.FlightPlanUserDataEvent",title:"Interface: FlightPlanUserDataEvent",description:"index.FlightPlanUserDataEvent",source:"@site/docs/framework/interfaces/index.FlightPlanUserDataEvent.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.FlightPlanUserDataEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.FlightPlanUserDataEvent",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.FlightPlanUserDataEvent",title:"Interface: FlightPlanUserDataEvent",sidebar_label:"FlightPlanUserDataEvent",custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPlanSegmentEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.FlightPlanSegmentEvent"},next:{title:"FlightPlannerEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.FlightPlannerEvents"}},s={},d=[{value:"Properties",id:"properties",level:2},{value:"data",id:"data",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"key",id:"key",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"planIndex",id:"planindex",level:3},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:d},c="wrapper";function f(e){let{components:t,...n}=e;return(0,a.kt)(c,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".FlightPlanUserDataEvent"),(0,a.kt)("p",null,"An event generated when user data is set in the flight plan."),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"data"},"data"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"data"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"any")),(0,a.kt)("p",null,"The user data."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:214"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"key"},"key"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"key"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"The key of the user data."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:211"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"planindex"},"planIndex"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"planIndex"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The index of the flight plan."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:208"))}f.isMDXComponent=!0}}]);