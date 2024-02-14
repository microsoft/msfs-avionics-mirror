"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[33897],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>k});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},l=Object.keys(e);for(a=0;a<l.length;a++)r=l[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)r=l[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var s=a.createContext({}),p=function(e){var t=a.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},d=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,l=e.originalType,s=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),u=p(r),c=n,k=u["".concat(s,".").concat(c)]||u[c]||m[c]||l;return r?a.createElement(k,i(i({ref:t},d),{},{components:r})):a.createElement(k,i({ref:t},d))}));function k(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var l=r.length,i=new Array(l);i[0]=c;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[u]="string"==typeof e?e:n,i[1]=o;for(var p=2;p<l;p++)i[p]=r[p];return a.createElement.apply(null,i)}return a.createElement.apply(null,r)}c.displayName="MDXCreateElement"},43047:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>m,frontMatter:()=>l,metadata:()=>o,toc:()=>p});var a=r(87462),n=(r(67294),r(3905));const l={id:"FlightPlanLegIterator",title:"Class: FlightPlanLegIterator",sidebar_label:"FlightPlanLegIterator",sidebar_position:0,custom_edit_url:null},i=void 0,o={unversionedId:"framework/classes/FlightPlanLegIterator",id:"framework/classes/FlightPlanLegIterator",title:"Class: FlightPlanLegIterator",description:"A Utility Class that supports iterating through a flight plan either forward or reverse.",source:"@site/docs/framework/classes/FlightPlanLegIterator.md",sourceDirName:"framework/classes",slug:"/framework/classes/FlightPlanLegIterator",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanLegIterator",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPlanLegIterator",title:"Class: FlightPlanLegIterator",sidebar_label:"FlightPlanLegIterator",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPlanDisplayBuilder",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanDisplayBuilder"},next:{title:"FlightPlanPredictor",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanPredictor"}},s={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"isBusy",id:"isbusy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"iterateForward",id:"iterateforward",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"iterateReverse",id:"iteratereverse",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-2",level:4}],d={toc:p},u="wrapper";function m(e){let{components:t,...r}=e;return(0,n.kt)(u,(0,a.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A Utility Class that supports iterating through a flight plan either forward or reverse."),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new FlightPlanLegIterator"),"(): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanLegIterator"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPlanLegIterator"))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanLegIterator"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPlanLegIterator"))),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"isbusy"},"isBusy"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"isBusy"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Method that checks whether the FlightPlanLegIterator is busy."),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Whether the cursor is busy."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPlanLegIterator.ts:40"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"iterateforward"},"iterateForward"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"iterateForward"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"lateralPlan"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"each"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Iterates through the active flight plan in forward order."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"lateralPlan")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPlan"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPlan"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The lateral flight plan to iterate through.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"each")),(0,n.kt)("td",{parentName:"tr",align:"left"},"(",(0,n.kt)("inlineCode",{parentName:"td"},"data"),": ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/IteratorCursor"},(0,n.kt)("inlineCode",{parentName:"a"},"IteratorCursor")),") => ",(0,n.kt)("inlineCode",{parentName:"td"},"void")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The function to call for each flight plan leg.")))),(0,n.kt)("h4",{id:"returns-2"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,n.kt)("p",null,"an Error if the cursor is busy."),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPlanLegIterator.ts:93"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"iteratereverse"},"iterateReverse"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"iterateReverse"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"lateralPlan"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"each"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Iterates through the active flight plan in reverse order."),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"lateralPlan")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPlan"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPlan"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The lateral flight plan to iterate through.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"each")),(0,n.kt)("td",{parentName:"tr",align:"left"},"(",(0,n.kt)("inlineCode",{parentName:"td"},"data"),": ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/IteratorCursor"},(0,n.kt)("inlineCode",{parentName:"a"},"IteratorCursor")),") => ",(0,n.kt)("inlineCode",{parentName:"td"},"void")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The function to call for each flight plan leg.")))),(0,n.kt)("h4",{id:"returns-3"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,n.kt)("p",null,"an Error if the cursor is busy."),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPlanLegIterator.ts:50"))}m.isMDXComponent=!0}}]);