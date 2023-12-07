"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[15196],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>f});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},l=Object.keys(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var s=n.createContext({}),u=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},d=function(e){var t=u(e.components);return n.createElement(s.Provider,{value:t},e.children)},p="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,l=e.originalType,s=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),p=u(r),m=a,f=p["".concat(s,".").concat(m)]||p[m]||c[m]||l;return r?n.createElement(f,i(i({ref:t},d),{},{components:r})):n.createElement(f,i({ref:t},d))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=r.length,i=new Array(l);i[0]=m;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[p]="string"==typeof e?e:a,i[1]=o;for(var u=2;u<l;u++)i[u]=r[u];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},60416:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>c,frontMatter:()=>l,metadata:()=>o,toc:()=>u});var n=r(87462),a=(r(67294),r(3905));const l={id:"FlightPathTurnCalculator",title:"Class: FlightPathTurnCalculator",sidebar_label:"FlightPathTurnCalculator",sidebar_position:0,custom_edit_url:null},i=void 0,o={unversionedId:"framework/classes/FlightPathTurnCalculator",id:"framework/classes/FlightPathTurnCalculator",title:"Class: FlightPathTurnCalculator",description:"A flight path calculator for turns between legs.",source:"@site/docs/framework/classes/FlightPathTurnCalculator.md",sourceDirName:"framework/classes",slug:"/framework/classes/FlightPathTurnCalculator",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPathTurnCalculator",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPathTurnCalculator",title:"Class: FlightPathTurnCalculator",sidebar_label:"FlightPathTurnCalculator",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPathRenderStyle",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPathRenderStyle"},next:{title:"FlightPathUtils",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPathUtils"}},s={},u=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Methods",id:"methods",level:2},{value:"computeTurns",id:"computeturns",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4}],d={toc:u},p="wrapper";function c(e){let{components:t,...r}=e;return(0,a.kt)(p,(0,n.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A flight path calculator for turns between legs."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new FlightPathTurnCalculator"),"()"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"computeturns"},"computeTurns"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"computeTurns"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"legs"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"startIndex"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"count"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"desiredTurnRadius"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"desiredCourseReversalTurnRadius"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"desiredTurnAnticipationTurnRadius"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Computes leg to leg turns for a given sequence of legs. Turns will only be calculated between legs with defined\nflight path vectors and no pre-existing egress/ingress transition (unless it is a leg-to-leg turn) at the junction\nof the turn."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"legs")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegDefinition"},(0,a.kt)("inlineCode",{parentName:"a"},"LegDefinition")),"[]"),(0,a.kt)("td",{parentName:"tr",align:"left"},"A sequence of legs.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"startIndex")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index of the first leg for which to compute turns.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"count")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The total number of legs for which to compute turns.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"desiredTurnRadius")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The desired general turn radius, in meters.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"desiredCourseReversalTurnRadius")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The desired course reversal turn radius, in meters.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"desiredTurnAnticipationTurnRadius")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The desired turn anticipation turn radius, in meters.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPathTurnCalculator.ts:41"))}c.isMDXComponent=!0}}]);