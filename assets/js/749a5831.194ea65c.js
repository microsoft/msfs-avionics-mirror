"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[67333],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>k});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var o=a.createContext({}),p=function(e){var t=a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},d=function(e){var t=p(e.components);return a.createElement(o.Provider,{value:t},e.children)},m="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},g=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,o=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),m=p(n),g=i,k=m["".concat(o,".").concat(g)]||m[g]||f[g]||r;return n?a.createElement(k,l(l({ref:t},d),{},{components:n})):a.createElement(k,l({ref:t},d))}));function k(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,l=new Array(r);l[0]=g;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s[m]="string"==typeof e?e:i,l[1]=s;for(var p=2;p<r;p++)l[p]=n[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}g.displayName="MDXCreateElement"},33706:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>f,frontMatter:()=>r,metadata:()=>s,toc:()=>p});var a=n(87462),i=(n(67294),n(3905));const r={id:"FlightPlanSegment",title:"Class: FlightPlanSegment",sidebar_label:"FlightPlanSegment",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"framework/classes/FlightPlanSegment",id:"framework/classes/FlightPlanSegment",title:"Class: FlightPlanSegment",description:"A segment of a flight plan.",source:"@site/docs/framework/classes/FlightPlanSegment.md",sourceDirName:"framework/classes",slug:"/framework/classes/FlightPlanSegment",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanSegment",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPlanSegment",title:"Class: FlightPlanSegment",sidebar_label:"FlightPlanSegment",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPlanPredictorUtils",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanPredictorUtils"},next:{title:"FlightPlanUtils",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanUtils"}},o={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"airway",id:"airway",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"legs",id:"legs",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"offset",id:"offset",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"segmentIndex",id:"segmentindex",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"segmentType",id:"segmenttype",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"Empty",id:"empty",level:3},{value:"Defined in",id:"defined-in-6",level:4}],d={toc:p},m="wrapper";function f(e){let{components:t,...n}=e;return(0,i.kt)(m,(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A segment of a flight plan."),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new FlightPlanSegment"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"segmentIndex"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"offset"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"legs"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"segmentType?"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"airway?"),")"),(0,i.kt)("p",null,"Creates a new FlightPlanSegment."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"segmentIndex")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The index of the segment within the flight plan.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"offset")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The leg offset within the original flight plan that the segment starts at.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"legs")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegDefinition"},(0,i.kt)("inlineCode",{parentName:"a"},"LegDefinition")),"[]"),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The legs in the flight plan segment.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"segmentType")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/enums/FlightPlanSegmentType"},(0,i.kt)("inlineCode",{parentName:"a"},"FlightPlanSegmentType"))),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"FlightPlanSegmentType.Enroute")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The type of segment this is.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"airway?")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"string")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The airway associated with this segment, if any.")))),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:189"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"airway"},"airway"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"airway"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The airway associated with this segment, if any."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:190"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"legs"},"legs"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"legs"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegDefinition"},(0,i.kt)("inlineCode",{parentName:"a"},"LegDefinition")),"[]"),(0,i.kt)("p",null,"The legs in the flight plan segment."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:189"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"offset"},"offset"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"offset"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The leg offset within the original flight plan that\nthe segment starts at."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:189"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"segmentindex"},"segmentIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"segmentIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The index of the segment within the flight plan."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:189"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"segmenttype"},"segmentType"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"segmentType"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/FlightPlanSegmentType"},(0,i.kt)("inlineCode",{parentName:"a"},"FlightPlanSegmentType"))," = ",(0,i.kt)("inlineCode",{parentName:"p"},"FlightPlanSegmentType.Enroute")),(0,i.kt)("p",null,"The type of segment this is."),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:190"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"empty"},"Empty"),(0,i.kt)("p",null,"\u25aa ",(0,i.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,i.kt)("strong",{parentName:"p"},"Empty"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanSegment"},(0,i.kt)("inlineCode",{parentName:"a"},"FlightPlanSegment"))),(0,i.kt)("p",null,"An empty flight plan segment."),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:194"))}f.isMDXComponent=!0}}]);