"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[66420],{3905:(e,n,t)=>{t.d(n,{Zo:()=>s,kt:()=>u});var i=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?l(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function d(e,n){if(null==e)return{};var t,i,r=function(e,n){if(null==e)return{};var t,i,r={},l=Object.keys(e);for(i=0;i<l.length;i++)t=l[i],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)t=l[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var o=i.createContext({}),p=function(e){var n=i.useContext(o),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},s=function(e){var n=p(e.components);return i.createElement(o.Provider,{value:n},e.children)},c="mdxType",f={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},g=i.forwardRef((function(e,n){var t=e.components,r=e.mdxType,l=e.originalType,o=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),c=p(t),g=r,u=c["".concat(o,".").concat(g)]||c[g]||f[g]||l;return t?i.createElement(u,a(a({ref:n},s),{},{components:t})):i.createElement(u,a({ref:n},s))}));function u(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var l=t.length,a=new Array(l);a[0]=g;var d={};for(var o in n)hasOwnProperty.call(n,o)&&(d[o]=n[o]);d.originalType=e,d[c]="string"==typeof e?e:r,a[1]=d;for(var p=2;p<l;p++)a[p]=t[p];return i.createElement.apply(null,a)}return i.createElement.apply(null,t)}g.displayName="MDXCreateElement"},60413:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>a,default:()=>f,frontMatter:()=>l,metadata:()=>d,toc:()=>p});var i=t(87462),r=(t(67294),t(3905));const l={id:"index.FlightPlanLegEvent",title:"Interface: FlightPlanLegEvent",sidebar_label:"FlightPlanLegEvent",custom_edit_url:null},a=void 0,d={unversionedId:"framework/interfaces/index.FlightPlanLegEvent",id:"framework/interfaces/index.FlightPlanLegEvent",title:"Interface: FlightPlanLegEvent",description:"index.FlightPlanLegEvent",source:"@site/docs/framework/interfaces/index.FlightPlanLegEvent.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.FlightPlanLegEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.FlightPlanLegEvent",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.FlightPlanLegEvent",title:"Interface: FlightPlanLegEvent",sidebar_label:"FlightPlanLegEvent",custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPlanLeg",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.FlightPlanLeg"},next:{title:"FlightPlanLegUserDataEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.FlightPlanLegUserDataEvent"}},o={},p=[{value:"Properties",id:"properties",level:2},{value:"batch",id:"batch",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"leg",id:"leg",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"legIndex",id:"legindex",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"planIndex",id:"planindex",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"segmentIndex",id:"segmentindex",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"type",id:"type",level:3},{value:"Defined in",id:"defined-in-5",level:4}],s={toc:p},c="wrapper";function f(e){let{components:n,...t}=e;return(0,r.kt)(c,(0,i.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".FlightPlanLegEvent"),(0,r.kt)("p",null,"An event fired when a flight plan leg is added, removed, or its vertical data is changed."),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"batch"},"batch"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"batch"),": readonly ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/#flightplanmodbatch"},(0,r.kt)("inlineCode",{parentName:"a"},"FlightPlanModBatch")),">","[]"),(0,r.kt)("p",null,"The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if\nthe change was not assigned to any batches."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:100"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"leg"},"leg"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"leg"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.LegDefinition"},(0,r.kt)("inlineCode",{parentName:"a"},"LegDefinition"))),(0,r.kt)("p",null,"The leg that was added, removed, or changed."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:94"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"legindex"},"legIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"legIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the changed flight plan leg in its containing segment."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:91"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"planindex"},"planIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"planIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the flight plan."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:85"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"segmentindex"},"segmentIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"segmentIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the segment containing the changed flight plan leg."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:88"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"type"},"type"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"type"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/index.LegEventType"},(0,r.kt)("inlineCode",{parentName:"a"},"LegEventType"))),(0,r.kt)("p",null,"The type of the leg event."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:82"))}f.isMDXComponent=!0}}]);