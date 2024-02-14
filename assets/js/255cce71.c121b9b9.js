"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[68405],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>f});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var s=r.createContext({}),d=function(e){var t=r.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},p=function(e){var t=d(e.components);return r.createElement(s.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=d(a),k=n,f=m["".concat(s,".").concat(k)]||m[k]||c[k]||i;return a?r.createElement(f,l(l({ref:t},p),{},{components:a})):r.createElement(f,l({ref:t},p))}));function f(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,l=new Array(i);l[0]=k;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[m]="string"==typeof e?e:n,l[1]=o;for(var d=2;d<i;d++)l[d]=a[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}k.displayName="MDXCreateElement"},48342:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var r=a(87462),n=(a(67294),a(3905));const i={id:"DirectToFixLegCalculator",title:"Class: DirectToFixLegCalculator",sidebar_label:"DirectToFixLegCalculator",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/classes/DirectToFixLegCalculator",id:"framework/classes/DirectToFixLegCalculator",title:"Class: DirectToFixLegCalculator",description:"Calculates flight path vectors for direct to fix legs.",source:"@site/docs/framework/classes/DirectToFixLegCalculator.md",sourceDirName:"framework/classes",slug:"/framework/classes/DirectToFixLegCalculator",permalink:"/msfs-avionics-mirror/docs/framework/classes/DirectToFixLegCalculator",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"DirectToFixLegCalculator",title:"Class: DirectToFixLegCalculator",sidebar_label:"DirectToFixLegCalculator",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"DigitScroller",permalink:"/msfs-avionics-mirror/docs/framework/classes/DigitScroller"},next:{title:"DirectToPointBuilder",permalink:"/msfs-avionics-mirror/docs/framework/classes/DirectToPointBuilder"}},s={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"directToPointBuilder",id:"directtopointbuilder",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"facilityCache",id:"facilitycache",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"geoCircleCache",id:"geocirclecache",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"geoPointCache",id:"geopointcache",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"skipWhenActive",id:"skipwhenactive",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"vec3Cache",id:"vec3cache",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"Methods",id:"methods",level:2},{value:"calculate",id:"calculate",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"calculateMagVar",id:"calculatemagvar",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"calculateVectors",id:"calculatevectors",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"getLegMagVar",id:"getlegmagvar",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"getLegTrueCourse",id:"getlegtruecourse",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"getPositionFromIcao",id:"getpositionfromicao",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"getTerminatorPosition",id:"getterminatorposition",level:3},{value:"Parameters",id:"parameters-7",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"resolveIngressToEgress",id:"resolveingresstoegress",level:3},{value:"Parameters",id:"parameters-8",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"shouldSkipWhenActive",id:"shouldskipwhenactive",level:3},{value:"Parameters",id:"parameters-9",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-15",level:4}],p={toc:d},m="wrapper";function c(e){let{components:t,...a}=e;return(0,n.kt)(m,(0,r.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Calculates flight path vectors for direct to fix legs."),(0,n.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator"},(0,n.kt)("inlineCode",{parentName:"a"},"AbstractFlightPathLegCalculator"))),(0,n.kt)("p",{parentName:"li"},"\u21b3 ",(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"DirectToFixLegCalculator"))))),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new DirectToFixLegCalculator"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"facilityCache"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/DirectToFixLegCalculator"},(0,n.kt)("inlineCode",{parentName:"a"},"DirectToFixLegCalculator"))),(0,n.kt)("p",null,"Constructor."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"facilityCache")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Map"),"<",(0,n.kt)("inlineCode",{parentName:"td"},"string"),", ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/Facility"},(0,n.kt)("inlineCode",{parentName:"a"},"Facility")),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"This calculator's cache of facilities.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/DirectToFixLegCalculator"},(0,n.kt)("inlineCode",{parentName:"a"},"DirectToFixLegCalculator"))),(0,n.kt)("h4",{id:"overrides"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator"},"AbstractFlightPathLegCalculator"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator#constructor"},"constructor")),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:332"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"directtopointbuilder"},"directToPointBuilder"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"directToPointBuilder"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/DirectToPointBuilder"},(0,n.kt)("inlineCode",{parentName:"a"},"DirectToPointBuilder"))),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:326"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"facilitycache"},"facilityCache"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"facilityCache"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"Map"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"string"),", ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Facility"},(0,n.kt)("inlineCode",{parentName:"a"},"Facility")),">"),(0,n.kt)("p",null,"This calculator's cache of facilities."),(0,n.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator"},"AbstractFlightPathLegCalculator"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator#facilitycache"},"facilityCache")),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:43"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"geocirclecache"},"geoCircleCache"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"geoCircleCache"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/GeoCircle"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoCircle")),"[]"),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:324"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"geopointcache"},"geoPointCache"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"geoPointCache"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/GeoPoint"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoPoint")),"[]"),(0,n.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:323"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"skipwhenactive"},"skipWhenActive"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"skipWhenActive"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,n.kt)("inlineCode",{parentName:"p"},"false")),(0,n.kt)("p",null,"Whether this calculator will skip calculations for active legs when the leg has already\nbeen calculated. False by default."),(0,n.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator"},"AbstractFlightPathLegCalculator"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator#skipwhenactive"},"skipWhenActive")),(0,n.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:43"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"vec3cache"},"vec3Cache"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"vec3Cache"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"Float64Array"),"[]"),(0,n.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:322"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"calculate"},"calculate"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"calculate"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"legs"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"calculateIndex"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"activeLegIndex"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"state"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"resolveIngressToEgress?"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegCalculations"},(0,n.kt)("inlineCode",{parentName:"a"},"LegCalculations"))),(0,n.kt)("p",null,"Calculates flight path vectors for a flight plan leg and adds the calculations to the leg."),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"legs")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegDefinition"},(0,n.kt)("inlineCode",{parentName:"a"},"LegDefinition")),"[]"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"undefined")),(0,n.kt)("td",{parentName:"tr",align:"left"},"A sequence of flight plan legs.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"calculateIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"undefined")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The index of the leg to calculate.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"activeLegIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"undefined")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The index of the active leg.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"state")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPathState"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPathState"))),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"undefined")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The current flight path state.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"resolveIngressToEgress")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"true")),(0,n.kt)("td",{parentName:"tr",align:"left"},"-")))),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegCalculations"},(0,n.kt)("inlineCode",{parentName:"a"},"LegCalculations"))),(0,n.kt)("p",null,"The flight plan leg calculations."),(0,n.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator"},"AbstractFlightPathLegCalculator"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator#calculate"},"calculate")),(0,n.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:109"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"calculatemagvar"},"calculateMagVar"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"calculateMagVar"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"legs"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"calculateIndex"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Calculates the magnetic variation for a flight plan leg."),(0,n.kt)("h4",{id:"parameters-2"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"legs")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegDefinition"},(0,n.kt)("inlineCode",{parentName:"a"},"LegDefinition")),"[]"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A sequence of flight plan legs.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"calculateIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The index of the leg to calculate.")))),(0,n.kt)("h4",{id:"returns-2"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"The number of vectors added to the sequence."),(0,n.kt)("h4",{id:"overrides-1"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator"},"AbstractFlightPathLegCalculator"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator#calculatemagvar"},"calculateMagVar")),(0,n.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:337"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"calculatevectors"},"calculateVectors"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"calculateVectors"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"legs"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"calculateIndex"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"activeLegIndex"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"state"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Calculates flight path vectors for a flight plan leg."),(0,n.kt)("h4",{id:"parameters-3"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"legs")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegDefinition"},(0,n.kt)("inlineCode",{parentName:"a"},"LegDefinition")),"[]"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A sequence of flight plan legs.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"calculateIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The index of the leg to calculate.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"activeLegIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The index of the active leg.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"state")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPathState"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPathState"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The current flight path state.")))),(0,n.kt)("h4",{id:"returns-3"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"The number of vectors added to the sequence."),(0,n.kt)("h4",{id:"overrides-2"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator"},"AbstractFlightPathLegCalculator"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator#calculatevectors"},"calculateVectors")),(0,n.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:349"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"getlegmagvar"},"getLegMagVar"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"getLegMagVar"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"point"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"Gets the magnetic variation, in degrees, to use when calculating a flight plan leg's course. If the leg defines\nan origin or fix VOR facility, then the magnetic variation defined at the VOR is used. Otherwise the computed\nmagnetic variation for the specified point is used."),(0,n.kt)("h4",{id:"parameters-4"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"leg")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanLeg"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPlanLeg"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"A flight plan leg.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"point")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LatLonInterface"},(0,n.kt)("inlineCode",{parentName:"a"},"LatLonInterface"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The location from which to get magnetic variation, if an origin VOR is not found.")))),(0,n.kt)("h4",{id:"returns-4"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"The magnetic variation, in degrees, to use when calculating the specified flight plan leg's course."),(0,n.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator"},"AbstractFlightPathLegCalculator"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator#getlegmagvar"},"getLegMagVar")),(0,n.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:81"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"getlegtruecourse"},"getLegTrueCourse"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"getLegTrueCourse"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"point"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"Gets the true course, in degrees, for a flight plan leg. If the leg defines an origin or fix VOR facility, then\nthe magnetic variation defined at the VOR is used to adjust magnetic course. Otherwise the computed magnetic\nvariation for the specified point is used."),(0,n.kt)("h4",{id:"parameters-5"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"leg")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanLeg"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPlanLeg"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"A flight plan leg.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"point")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LatLonInterface"},(0,n.kt)("inlineCode",{parentName:"a"},"LatLonInterface"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The location from which to get magnetic variation, if an origin VOR is not found.")))),(0,n.kt)("h4",{id:"returns-5"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"The true course, in degrees, for the flight plan leg."),(0,n.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator"},"AbstractFlightPathLegCalculator"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator#getlegtruecourse"},"getLegTrueCourse")),(0,n.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:100"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"getpositionfromicao"},"getPositionFromIcao"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"getPositionFromIcao"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"icao"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"out"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/GeoPoint"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoPoint"))),(0,n.kt)("p",null,"Gets a geographical position from an ICAO string."),(0,n.kt)("h4",{id:"parameters-6"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"icao")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"string")),(0,n.kt)("td",{parentName:"tr",align:"left"},"An ICAO string.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"out")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/GeoPoint"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoPoint"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"A GeoPoint object to which to write the result.")))),(0,n.kt)("h4",{id:"returns-6"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/GeoPoint"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoPoint"))),(0,n.kt)("p",null,"The geographical position corresponding to the ICAO string, or undefined if one could not be obtained."),(0,n.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator"},"AbstractFlightPathLegCalculator"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator#getpositionfromicao"},"getPositionFromIcao")),(0,n.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:52"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"getterminatorposition"},"getTerminatorPosition"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"getTerminatorPosition"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"icao"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"out"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/GeoPoint"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoPoint"))),(0,n.kt)("p",null,"Gets the geographic position for a flight plan leg terminator."),(0,n.kt)("h4",{id:"parameters-7"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"leg")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanLeg"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPlanLeg"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"A flight plan leg.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"icao")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"string")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The ICAO string of the leg's terminator fix.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"out")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/GeoPoint"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoPoint"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"A GeoPoint object to which to write the result.")))),(0,n.kt)("h4",{id:"returns-7"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/GeoPoint"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoPoint"))),(0,n.kt)("p",null,"The position of the leg terminator, or undefined if it could not be determined."),(0,n.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator"},"AbstractFlightPathLegCalculator"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator#getterminatorposition"},"getTerminatorPosition")),(0,n.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:64"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"resolveingresstoegress"},"resolveIngressToEgress"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"resolveIngressToEgress"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"legCalc"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Calculates the ingress to egress vectors for a flight plan leg and adds them to a leg calculation."),(0,n.kt)("h4",{id:"parameters-8"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"legCalc")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegCalculations"},(0,n.kt)("inlineCode",{parentName:"a"},"LegCalculations"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The calculations for a flight plan leg.")))),(0,n.kt)("h4",{id:"returns-8"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator"},"AbstractFlightPathLegCalculator"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator#resolveingresstoegress"},"resolveIngressToEgress")),(0,n.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:207"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"shouldskipwhenactive"},"shouldSkipWhenActive"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"shouldSkipWhenActive"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"legs"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"calculateIndex"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"activeLegIndex"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"state"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Checks whether vector calculations should be skipped when the leg to calculate is the active leg."),(0,n.kt)("h4",{id:"parameters-9"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"legs")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegDefinition"},(0,n.kt)("inlineCode",{parentName:"a"},"LegDefinition")),"[]"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A sequence of flight plan legs.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"calculateIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The index of the leg to calculate.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"activeLegIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The index of the active leg.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"state")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPathState"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPathState"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The current flight path state.")))),(0,n.kt)("h4",{id:"returns-9"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Whether to skip vector calculations."),(0,n.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator"},"AbstractFlightPathLegCalculator"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegCalculator#shouldskipwhenactive"},"shouldSkipWhenActive")),(0,n.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,n.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:178"))}c.isMDXComponent=!0}}]);