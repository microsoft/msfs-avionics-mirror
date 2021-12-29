"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[8480],{3905:function(e,t,a){a.d(t,{Zo:function(){return u},kt:function(){return m}});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function d(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},l=Object.keys(e);for(n=0;n<l.length;n++)a=l[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)a=l[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var o=n.createContext({}),p=function(e){var t=n.useContext(o),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},u=function(e){var t=p(e.components);return n.createElement(o.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,l=e.originalType,o=e.parentName,u=d(e,["components","mdxType","originalType","parentName"]),k=p(a),m=r,h=k["".concat(o,".").concat(m)]||k[m]||c[m]||l;return a?n.createElement(h,i(i({ref:t},u),{},{components:a})):n.createElement(h,i({ref:t},u))}));function m(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=a.length,i=new Array(l);i[0]=k;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d.mdxType="string"==typeof e?e:r,i[1]=d;for(var p=2;p<l;p++)i[p]=a[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,a)}k.displayName="MDXCreateElement"},5885:function(e,t,a){a.r(t),a.d(t,{frontMatter:function(){return d},contentTitle:function(){return o},metadata:function(){return p},toc:function(){return u},default:function(){return k}});var n=a(7462),r=a(3366),l=(a(7294),a(3905)),i=["components"],d={id:"RadiusToFixLegCalculator",title:"Class: RadiusToFixLegCalculator",sidebar_label:"RadiusToFixLegCalculator",sidebar_position:0,custom_edit_url:null},o=void 0,p={unversionedId:"framework/classes/RadiusToFixLegCalculator",id:"framework/classes/RadiusToFixLegCalculator",isDocsHomePage:!1,title:"Class: RadiusToFixLegCalculator",description:"Calculates flight path vectors for radius to fix legs.",source:"@site/docs/framework/classes/RadiusToFixLegCalculator.md",sourceDirName:"framework/classes",slug:"/framework/classes/RadiusToFixLegCalculator",permalink:"/msfs-avionics-mirror/docs/framework/classes/RadiusToFixLegCalculator",editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"RadiusToFixLegCalculator",title:"Class: RadiusToFixLegCalculator",sidebar_label:"RadiusToFixLegCalculator",sidebar_position:0,custom_edit_url:null},sidebar:"docsSidebar",previous:{title:"ProcedureTurnLegCalculator",permalink:"/msfs-avionics-mirror/docs/framework/classes/ProcedureTurnLegCalculator"},next:{title:"RandomNumberPublisher",permalink:"/msfs-avionics-mirror/docs/framework/classes/RandomNumberPublisher"}},u=[{value:"Hierarchy",id:"hierarchy",children:[],level:2},{value:"Constructors",id:"constructors",children:[{value:"constructor",id:"constructor",children:[{value:"Parameters",id:"parameters",children:[],level:4},{value:"Inherited from",id:"inherited-from",children:[],level:4},{value:"Defined in",id:"defined-in",children:[],level:4}],level:3}],level:2},{value:"Properties",id:"properties",children:[{value:"circleVectorBuilder",id:"circlevectorbuilder",children:[{value:"Inherited from",id:"inherited-from-1",children:[],level:4},{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"facilityCache",id:"facilitycache",children:[{value:"Inherited from",id:"inherited-from-2",children:[],level:4}],level:3},{value:"geoCircleCache",id:"geocirclecache",children:[{value:"Inherited from",id:"inherited-from-3",children:[],level:4},{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3},{value:"geoPointCache",id:"geopointcache",children:[{value:"Overrides",id:"overrides",children:[],level:4},{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3},{value:"skipWhenActive",id:"skipwhenactive",children:[{value:"Inherited from",id:"inherited-from-4",children:[],level:4}],level:3},{value:"vec3Cache",id:"vec3cache",children:[{value:"Inherited from",id:"inherited-from-5",children:[],level:4},{value:"Defined in",id:"defined-in-4",children:[],level:4}],level:3}],level:2},{value:"Methods",id:"methods",children:[{value:"calculate",id:"calculate",children:[{value:"Parameters",id:"parameters-1",children:[],level:4},{value:"Returns",id:"returns",children:[],level:4},{value:"Inherited from",id:"inherited-from-6",children:[],level:4},{value:"Defined in",id:"defined-in-5",children:[],level:4}],level:3},{value:"calculateVectors",id:"calculatevectors",children:[{value:"Parameters",id:"parameters-2",children:[],level:4},{value:"Returns",id:"returns-1",children:[],level:4},{value:"Inherited from",id:"inherited-from-7",children:[],level:4},{value:"Defined in",id:"defined-in-6",children:[],level:4}],level:3},{value:"getLegTrueCourse",id:"getlegtruecourse",children:[{value:"Parameters",id:"parameters-3",children:[],level:4},{value:"Returns",id:"returns-2",children:[],level:4},{value:"Inherited from",id:"inherited-from-8",children:[],level:4},{value:"Defined in",id:"defined-in-7",children:[],level:4}],level:3},{value:"getPositionFromIcao",id:"getpositionfromicao",children:[{value:"Parameters",id:"parameters-4",children:[],level:4},{value:"Returns",id:"returns-3",children:[],level:4},{value:"Inherited from",id:"inherited-from-9",children:[],level:4},{value:"Defined in",id:"defined-in-8",children:[],level:4}],level:3},{value:"getTerminatorPosition",id:"getterminatorposition",children:[{value:"Parameters",id:"parameters-5",children:[],level:4},{value:"Returns",id:"returns-4",children:[],level:4},{value:"Inherited from",id:"inherited-from-10",children:[],level:4},{value:"Defined in",id:"defined-in-9",children:[],level:4}],level:3},{value:"getTurnCenter",id:"getturncenter",children:[{value:"Parameters",id:"parameters-6",children:[],level:4},{value:"Returns",id:"returns-5",children:[],level:4},{value:"Overrides",id:"overrides-1",children:[],level:4},{value:"Defined in",id:"defined-in-10",children:[],level:4}],level:3},{value:"getTurnRadius",id:"getturnradius",children:[{value:"Parameters",id:"parameters-7",children:[],level:4},{value:"Returns",id:"returns-6",children:[],level:4},{value:"Overrides",id:"overrides-2",children:[],level:4},{value:"Defined in",id:"defined-in-11",children:[],level:4}],level:3},{value:"resolveIngressToEgress",id:"resolveingresstoegress",children:[{value:"Parameters",id:"parameters-8",children:[],level:4},{value:"Returns",id:"returns-7",children:[],level:4},{value:"Inherited from",id:"inherited-from-11",children:[],level:4},{value:"Defined in",id:"defined-in-12",children:[],level:4}],level:3},{value:"shouldSkipWhenActive",id:"shouldskipwhenactive",children:[{value:"Parameters",id:"parameters-9",children:[],level:4},{value:"Returns",id:"returns-8",children:[],level:4},{value:"Inherited from",id:"inherited-from-12",children:[],level:4},{value:"Defined in",id:"defined-in-13",children:[],level:4}],level:3}],level:2}],c={toc:u};function k(e){var t=e.components,a=(0,r.Z)(e,i);return(0,l.kt)("wrapper",(0,n.Z)({},c,a,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"Calculates flight path vectors for radius to fix legs."),(0,l.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},(0,l.kt)("inlineCode",{parentName:"a"},"TurnToFixLegCalculator"))),(0,l.kt)("p",{parentName:"li"},"\u21b3 ",(0,l.kt)("strong",{parentName:"p"},(0,l.kt)("inlineCode",{parentName:"strong"},"RadiusToFixLegCalculator"))))),(0,l.kt)("h2",{id:"constructors"},"Constructors"),(0,l.kt)("h3",{id:"constructor"},"constructor"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"new RadiusToFixLegCalculator"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"facilityCache"),")"),(0,l.kt)("p",null,"Constructor."),(0,l.kt)("h4",{id:"parameters"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"facilityCache")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"Map"),"<",(0,l.kt)("inlineCode",{parentName:"td"},"string"),", ",(0,l.kt)("a",{parentName:"td",href:"../interfaces/Facility"},(0,l.kt)("inlineCode",{parentName:"a"},"Facility")),">"),(0,l.kt)("td",{parentName:"tr",align:"left"},"This calculator's cache of facilities.")))),(0,l.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#constructor"},"constructor")),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:432"),(0,l.kt)("h2",{id:"properties"},"Properties"),(0,l.kt)("h3",{id:"circlevectorbuilder"},"circleVectorBuilder"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"circleVectorBuilder"),": ",(0,l.kt)("a",{parentName:"p",href:"CircleVectorBuilder"},(0,l.kt)("inlineCode",{parentName:"a"},"CircleVectorBuilder"))),(0,l.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#circlevectorbuilder"},"circleVectorBuilder")),(0,l.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:426"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"facilitycache"},"facilityCache"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"facilityCache"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"Map"),"<",(0,l.kt)("inlineCode",{parentName:"p"},"string"),", ",(0,l.kt)("a",{parentName:"p",href:"../interfaces/Facility"},(0,l.kt)("inlineCode",{parentName:"a"},"Facility")),">"),(0,l.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#facilitycache"},"facilityCache")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"geocirclecache"},"geoCircleCache"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"geoCircleCache"),": ",(0,l.kt)("a",{parentName:"p",href:"GeoCircle"},(0,l.kt)("inlineCode",{parentName:"a"},"GeoCircle")),"[]"),(0,l.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#geocirclecache"},"geoCircleCache")),(0,l.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:424"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"geopointcache"},"geoPointCache"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"geoPointCache"),": ",(0,l.kt)("a",{parentName:"p",href:"GeoPoint"},(0,l.kt)("inlineCode",{parentName:"a"},"GeoPoint")),"[]"),(0,l.kt)("h4",{id:"overrides"},"Overrides"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#geopointcache"},"geoPointCache")),(0,l.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:499"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"skipwhenactive"},"skipWhenActive"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"skipWhenActive"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,l.kt)("inlineCode",{parentName:"p"},"false")),(0,l.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#skipwhenactive"},"skipWhenActive")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"vec3cache"},"vec3Cache"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"vec3Cache"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"Float64Array"),"[]"),(0,l.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#vec3cache"},"vec3Cache")),(0,l.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:422"),(0,l.kt)("h2",{id:"methods"},"Methods"),(0,l.kt)("h3",{id:"calculate"},"calculate"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("strong",{parentName:"p"},"calculate"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"legs"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"calculateIndex"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"activeLegIndex"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"state"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"resolveIngressToEgress?"),"): ",(0,l.kt)("a",{parentName:"p",href:"../interfaces/LegCalculations"},(0,l.kt)("inlineCode",{parentName:"a"},"LegCalculations"))),(0,l.kt)("p",null,"Calculates flight path vectors for a flight plan leg and adds the calculations to the leg."),(0,l.kt)("h4",{id:"parameters-1"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"legs")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/LegDefinition"},(0,l.kt)("inlineCode",{parentName:"a"},"LegDefinition")),"[]"),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"undefined")),(0,l.kt)("td",{parentName:"tr",align:"left"},"A sequence of flight plan legs.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"calculateIndex")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"number")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"undefined")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The index of the leg to calculate.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"activeLegIndex")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"number")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"undefined")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The index of the active leg.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"state")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/FlightPathState"},(0,l.kt)("inlineCode",{parentName:"a"},"FlightPathState"))),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"undefined")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The current flight path state.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"resolveIngressToEgress")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"boolean")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"true")),(0,l.kt)("td",{parentName:"tr",align:"left"},"-")))),(0,l.kt)("h4",{id:"returns"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"../interfaces/LegCalculations"},(0,l.kt)("inlineCode",{parentName:"a"},"LegCalculations"))),(0,l.kt)("p",null,"The flight plan leg calculations."),(0,l.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#calculate"},"calculate")),(0,l.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:126"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"calculatevectors"},"calculateVectors"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("strong",{parentName:"p"},"calculateVectors"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"legs"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"calculateIndex"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"activeLegIndex"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"state"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"Calculates flight path vectors for a flight plan leg."),(0,l.kt)("h4",{id:"parameters-2"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"legs")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/LegDefinition"},(0,l.kt)("inlineCode",{parentName:"a"},"LegDefinition")),"[]")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"calculateIndex")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"number"))),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"activeLegIndex")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"number"))),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"state")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/FlightPathState"},(0,l.kt)("inlineCode",{parentName:"a"},"FlightPathState")))))),(0,l.kt)("h4",{id:"returns-1"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"The number of vectors added to the sequence."),(0,l.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#calculatevectors"},"calculateVectors")),(0,l.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:437"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"getlegtruecourse"},"getLegTrueCourse"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("strong",{parentName:"p"},"getLegTrueCourse"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"point"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Gets the true course for a flight plan leg. If the leg defines an origin or fix VOR facility, then the magnetic\nvariation defined at the VOR is used to adjust magnetic course, otherwise the computed magnetic variation for the\nspecified point is used."),(0,l.kt)("h4",{id:"parameters-3"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"leg")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/FlightPlanLeg"},(0,l.kt)("inlineCode",{parentName:"a"},"FlightPlanLeg"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"A flight plan leg.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"point")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/LatLonInterface"},(0,l.kt)("inlineCode",{parentName:"a"},"LatLonInterface"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"The location from which to get magnetic variation, if an origin VOR is not found.")))),(0,l.kt)("h4",{id:"returns-2"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"the true course for the flight plan leg."),(0,l.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#getlegtruecourse"},"getLegTrueCourse")),(0,l.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:108"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"getpositionfromicao"},"getPositionFromIcao"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("strong",{parentName:"p"},"getPositionFromIcao"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"icao"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"out"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,l.kt)("a",{parentName:"p",href:"GeoPoint"},(0,l.kt)("inlineCode",{parentName:"a"},"GeoPoint"))),(0,l.kt)("p",null,"Gets a geographical position from an ICAO string."),(0,l.kt)("h4",{id:"parameters-4"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"icao")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"string")),(0,l.kt)("td",{parentName:"tr",align:"left"},"An ICAO string.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"out")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"GeoPoint"},(0,l.kt)("inlineCode",{parentName:"a"},"GeoPoint"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"A GeoPoint object to which to write the result.")))),(0,l.kt)("h4",{id:"returns-3"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,l.kt)("a",{parentName:"p",href:"GeoPoint"},(0,l.kt)("inlineCode",{parentName:"a"},"GeoPoint"))),(0,l.kt)("p",null,"The geographical position corresponding to the ICAO string, or undefined if one could not be obtained."),(0,l.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#getpositionfromicao"},"getPositionFromIcao")),(0,l.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:79"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"getterminatorposition"},"getTerminatorPosition"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("strong",{parentName:"p"},"getTerminatorPosition"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"icao"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"out"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,l.kt)("a",{parentName:"p",href:"GeoPoint"},(0,l.kt)("inlineCode",{parentName:"a"},"GeoPoint"))),(0,l.kt)("p",null,"Gets the geographic position for a flight plan leg terminator."),(0,l.kt)("h4",{id:"parameters-5"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"leg")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/FlightPlanLeg"},(0,l.kt)("inlineCode",{parentName:"a"},"FlightPlanLeg"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"A flight plan leg.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"icao")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"string")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The ICAO string of the leg's terminator fix.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"out")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"GeoPoint"},(0,l.kt)("inlineCode",{parentName:"a"},"GeoPoint"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"A GeoPoint object to which to write the result.")))),(0,l.kt)("h4",{id:"returns-4"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,l.kt)("a",{parentName:"p",href:"GeoPoint"},(0,l.kt)("inlineCode",{parentName:"a"},"GeoPoint"))),(0,l.kt)("p",null,"The position of the leg terminator, or undefined if it could not be determined."),(0,l.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#getterminatorposition"},"getTerminatorPosition")),(0,l.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:91"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"getturncenter"},"getTurnCenter"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("strong",{parentName:"p"},"getTurnCenter"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"leg"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,l.kt)("a",{parentName:"p",href:"../interfaces/LatLonInterface"},(0,l.kt)("inlineCode",{parentName:"a"},"LatLonInterface"))),(0,l.kt)("p",null,"Gets the center of the turn defined by a flight plan leg."),(0,l.kt)("h4",{id:"parameters-6"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"leg")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/FlightPlanLeg"},(0,l.kt)("inlineCode",{parentName:"a"},"FlightPlanLeg")))))),(0,l.kt)("h4",{id:"returns-5"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,l.kt)("a",{parentName:"p",href:"../interfaces/LatLonInterface"},(0,l.kt)("inlineCode",{parentName:"a"},"LatLonInterface"))),(0,l.kt)("p",null,"The center of the turn defined by the flight plan leg, or undefined if it could not be determined."),(0,l.kt)("h4",{id:"overrides-1"},"Overrides"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#getturncenter"},"getTurnCenter")),(0,l.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:502"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"getturnradius"},"getTurnRadius"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("strong",{parentName:"p"},"getTurnRadius"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"center"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Gets the radius of the turn defined by a flight plan leg."),(0,l.kt)("h4",{id:"parameters-7"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"leg")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/FlightPlanLeg"},(0,l.kt)("inlineCode",{parentName:"a"},"FlightPlanLeg")))),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"center")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/LatLonInterface"},(0,l.kt)("inlineCode",{parentName:"a"},"LatLonInterface")))))),(0,l.kt)("h4",{id:"returns-6"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The radius of the turn defined by the flight plan leg, or undefined if it could not be determined."),(0,l.kt)("h4",{id:"overrides-2"},"Overrides"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#getturnradius"},"getTurnRadius")),(0,l.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:507"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"resolveingresstoegress"},"resolveIngressToEgress"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("strong",{parentName:"p"},"resolveIngressToEgress"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"legCalc"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"Calculates the ingress to egress vectors for a flight plan leg and adds them to a leg calculation."),(0,l.kt)("h4",{id:"parameters-8"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"legCalc")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/LegCalculations"},(0,l.kt)("inlineCode",{parentName:"a"},"LegCalculations"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"The calculations for a flight plan leg.")))),(0,l.kt)("h4",{id:"returns-7"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#resolveingresstoegress"},"resolveIngressToEgress")),(0,l.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:206"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"shouldskipwhenactive"},"shouldSkipWhenActive"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,l.kt)("strong",{parentName:"p"},"shouldSkipWhenActive"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"legs"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"calculateIndex"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"activeLegIndex"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"state"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Checks whether vector calculations should be skipped when the leg to calculate is the active leg."),(0,l.kt)("h4",{id:"parameters-9"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"legs")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/LegDefinition"},(0,l.kt)("inlineCode",{parentName:"a"},"LegDefinition")),"[]"),(0,l.kt)("td",{parentName:"tr",align:"left"},"A sequence of flight plan legs.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"calculateIndex")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"number")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The index of the leg to calculate.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"activeLegIndex")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"number")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The index of the active leg.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"state")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/FlightPathState"},(0,l.kt)("inlineCode",{parentName:"a"},"FlightPathState"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"The current flight path state.")))),(0,l.kt)("h4",{id:"returns-8"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether to skip vector calculations."),(0,l.kt)("h4",{id:"inherited-from-12"},"Inherited from"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator"},"TurnToFixLegCalculator"),".",(0,l.kt)("a",{parentName:"p",href:"TurnToFixLegCalculator#shouldskipwhenactive"},"shouldSkipWhenActive")),(0,l.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathLegCalculator.ts:187"))}k.isMDXComponent=!0}}]);