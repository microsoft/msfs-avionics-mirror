"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[36448],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>h});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var d=a.createContext({}),s=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=s(e.components);return a.createElement(d.Provider,{value:t},e.children)},c="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,d=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),c=s(n),u=r,h=c["".concat(d,".").concat(u)]||c[u]||f[u]||i;return n?a.createElement(h,l(l({ref:t},p),{},{components:n})):a.createElement(h,l({ref:t},p))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=u;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[c]="string"==typeof e?e:r,l[1]=o;for(var s=2;s<i;s++)l[s]=n[s];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},36443:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>f,frontMatter:()=>i,metadata:()=>o,toc:()=>s});var a=n(87462),r=(n(67294),n(3905));const i={id:"FlightPlanUserDataEvent",title:"Interface: FlightPlanUserDataEvent",sidebar_label:"FlightPlanUserDataEvent",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/interfaces/FlightPlanUserDataEvent",id:"framework/interfaces/FlightPlanUserDataEvent",title:"Interface: FlightPlanUserDataEvent",description:"An event generated when a global flight plan user data key-value pair is changed.",source:"@site/docs/framework/interfaces/FlightPlanUserDataEvent.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/FlightPlanUserDataEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanUserDataEvent",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPlanUserDataEvent",title:"Interface: FlightPlanUserDataEvent",sidebar_label:"FlightPlanUserDataEvent",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPlanSegmentEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanSegmentEvent"},next:{title:"FlightPlannerEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlannerEvents"}},d={},s=[{value:"Properties",id:"properties",level:2},{value:"batch",id:"batch",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"data",id:"data",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"key",id:"key",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"planIndex",id:"planindex",level:3},{value:"Defined in",id:"defined-in-3",level:4}],p={toc:s},c="wrapper";function f(e){let{components:t,...n}=e;return(0,r.kt)(c,(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"An event generated when a global flight plan user data key-value pair is changed."),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"batch"},"batch"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"batch"),": readonly ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#flightplanmodbatch"},(0,r.kt)("inlineCode",{parentName:"a"},"FlightPlanModBatch")),">","[]"),(0,r.kt)("p",null,"The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if\nthe change was not assigned to any batches."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:268"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"data"},"data"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"data"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"any")),(0,r.kt)("p",null,"The user data. Not defined if the user data was deleted."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:262"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"key"},"key"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"key"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("p",null,"The key of the user data."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:259"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"planindex"},"planIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"planIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the flight plan."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:256"))}f.isMDXComponent=!0}}]);