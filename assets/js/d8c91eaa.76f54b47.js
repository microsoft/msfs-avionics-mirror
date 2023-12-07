"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[41806],{3905:(e,n,t)=>{t.d(n,{Zo:()=>d,kt:()=>m});var r=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?l(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},l=Object.keys(e);for(r=0;r<l.length;r++)t=l[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)t=l[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var s=r.createContext({}),p=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},d=function(e){var n=p(e.components);return r.createElement(s.Provider,{value:n},e.children)},c="mdxType",f={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},u=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,l=e.originalType,s=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),c=p(t),u=i,m=c["".concat(s,".").concat(u)]||c[u]||f[u]||l;return t?r.createElement(m,a(a({ref:n},d),{},{components:t})):r.createElement(m,a({ref:n},d))}));function m(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var l=t.length,a=new Array(l);a[0]=u;var o={};for(var s in n)hasOwnProperty.call(n,s)&&(o[s]=n[s]);o.originalType=e,o[c]="string"==typeof e?e:i,a[1]=o;for(var p=2;p<l;p++)a[p]=t[p];return r.createElement.apply(null,a)}return r.createElement.apply(null,t)}u.displayName="MDXCreateElement"},63451:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>a,default:()=>f,frontMatter:()=>l,metadata:()=>o,toc:()=>p});var r=t(87462),i=(t(67294),t(3905));const l={id:"FlightPlanResponseEvent",title:"Interface: FlightPlanResponseEvent",sidebar_label:"FlightPlanResponseEvent",sidebar_position:0,custom_edit_url:null},a=void 0,o={unversionedId:"framework/interfaces/FlightPlanResponseEvent",id:"framework/interfaces/FlightPlanResponseEvent",title:"Interface: FlightPlanResponseEvent",description:"An event generated when an instrument responds to a full",source:"@site/docs/framework/interfaces/FlightPlanResponseEvent.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/FlightPlanResponseEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanResponseEvent",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPlanResponseEvent",title:"Interface: FlightPlanResponseEvent",sidebar_label:"FlightPlanResponseEvent",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPlanRequestEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanRequestEvent"},next:{title:"FlightPlanSegmentEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanSegmentEvent"}},s={},p=[{value:"Properties",id:"properties",level:2},{value:"flightPlans",id:"flightplans",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"planIndex",id:"planindex",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"uid",id:"uid",level:3},{value:"Defined in",id:"defined-in-2",level:4}],d={toc:p},c="wrapper";function f(e){let{components:n,...t}=e;return(0,i.kt)(c,(0,r.Z)({},d,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"An event generated when an instrument responds to a full\nflight plan set request."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"flightplans"},"flightPlans"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"flightPlans"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPlan"},(0,i.kt)("inlineCode",{parentName:"a"},"FlightPlan")),"[]"),(0,i.kt)("p",null,"The plans contained by the flight planner."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:215"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"planindex"},"planIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"planIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The index of the active plan."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:218"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"uid"},"uid"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"uid"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The unique ID of the request that triggered this response."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:212"))}f.isMDXComponent=!0}}]);