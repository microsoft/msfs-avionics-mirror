"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[94190],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>f});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var s=a.createContext({}),d=function(e){var t=a.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=d(e.components);return a.createElement(s.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},k=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=d(r),k=n,f=m["".concat(s,".").concat(k)]||m[k]||c[k]||i;return r?a.createElement(f,l(l({ref:t},p),{},{components:r})):a.createElement(f,l({ref:t},p))}));function f(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,l=new Array(i);l[0]=k;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[m]="string"==typeof e?e:n,l[1]=o;for(var d=2;d<i;d++)l[d]=r[d];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}k.displayName="MDXCreateElement"},27932:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var a=r(87462),n=(r(67294),r(3905));const i={id:"MapSystemLegRenderer",title:"Class: MapSystemLegRenderer",sidebar_label:"MapSystemLegRenderer",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/classes/MapSystemLegRenderer",id:"framework/classes/MapSystemLegRenderer",title:"Class: MapSystemLegRenderer",description:"A map system flight plan leg renderer that uses a swappable style.",source:"@site/docs/framework/classes/MapSystemLegRenderer.md",sourceDirName:"framework/classes",slug:"/framework/classes/MapSystemLegRenderer",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapSystemLegRenderer",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapSystemLegRenderer",title:"Class: MapSystemLegRenderer",sidebar_label:"MapSystemLegRenderer",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapSystemLabelFactory",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapSystemLabelFactory"},next:{title:"MapSystemPlanRenderer",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapSystemPlanRenderer"}},s={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Properties",id:"properties",level:2},{value:"currentRenderStyle",id:"currentrenderstyle",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"tempVector",id:"tempvector",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"vectorRenderer",id:"vectorrenderer",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"geoCircleCache",id:"geocirclecache",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"geoPointCache",id:"geopointcache",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"Methods",id:"methods",level:2},{value:"render",id:"render",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"renderVector",id:"rendervector",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-6",level:4}],p={toc:d},m="wrapper";function c(e){let{components:t,...r}=e;return(0,n.kt)(m,(0,a.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A map system flight plan leg renderer that uses a swappable style."),(0,n.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},(0,n.kt)("inlineCode",{parentName:"a"},"AbstractFlightPathLegRenderer"))),(0,n.kt)("p",{parentName:"li"},"\u21b3 ",(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"MapSystemLegRenderer"))))),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new MapSystemLegRenderer"),"()"),(0,n.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer#constructor"},"constructor")),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"currentrenderstyle"},"currentRenderStyle"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"currentRenderStyle"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPathRenderStyle"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPathRenderStyle"))," ","|"," ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPathVectorStyle"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPathVectorStyle"))),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:89"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"tempvector"},"tempVector"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"tempVector"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/CircleVector"},(0,n.kt)("inlineCode",{parentName:"a"},"CircleVector"))),(0,n.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer#tempvector"},"tempVector")),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/AbstractFlightPathLegRenderer.ts:34"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"vectorrenderer"},"vectorRenderer"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"vectorRenderer"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPathVectorLineRenderer"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPathVectorLineRenderer"))),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:88"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"geocirclecache"},"geoCircleCache"),(0,n.kt)("p",null,"\u25aa ",(0,n.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"geoCircleCache"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/GeoCircle"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoCircle")),"[]"),(0,n.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer#geocirclecache"},"geoCircleCache")),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/AbstractFlightPathLegRenderer.ts:32"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"geopointcache"},"geoPointCache"),(0,n.kt)("p",null,"\u25aa ",(0,n.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"geoPointCache"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/GeoPoint"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoPoint")),"[]"),(0,n.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer#geopointcache"},"geoPointCache")),(0,n.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/AbstractFlightPathLegRenderer.ts:31"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"render"},"render"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"render"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"context"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"streamStack"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"partsToRender"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"...args"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Renders a flight plan leg path to a canvas."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"leg")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegDefinition"},(0,n.kt)("inlineCode",{parentName:"a"},"LegDefinition"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The flight plan leg to render.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"context")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"CanvasRenderingContext2D")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The canvas 2D rendering context to which to render.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"streamStack")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/GeoProjectionPathStreamStack"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoProjectionPathStreamStack"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The path stream stack to which to render.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"partsToRender")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The parts of the leg to render, as a combination of ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/enums/FlightPathLegRenderPart"},"FlightPathLegRenderPart")," values.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"...args")),(0,n.kt)("td",{parentName:"tr",align:"left"},"[]"),(0,n.kt)("td",{parentName:"tr",align:"left"},"Additional arguments.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer#render"},"render")),(0,n.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/AbstractFlightPathLegRenderer.ts:45"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"rendervector"},"renderVector"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("strong",{parentName:"p"},"renderVector"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"vector"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"isIngress"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"isEgress"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"context"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"streamStack"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Renders a flight path vector."),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"vector")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/CircleVector"},(0,n.kt)("inlineCode",{parentName:"a"},"CircleVector"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The flight path vector to render.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"isIngress")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether the vector is part of the ingress transition.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"isEgress")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether the vector is part of the egress transition.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"leg")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegDefinition"},(0,n.kt)("inlineCode",{parentName:"a"},"LegDefinition"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The flight plan leg containing the vector to render.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"context")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"CanvasRenderingContext2D")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The canvas 2D rendering context to which to render.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"streamStack")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/GeoProjectionPathStreamStack"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoProjectionPathStreamStack"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The path stream stack to which to render.")))),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"overrides"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer#rendervector"},"renderVector")),(0,n.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:92"))}c.isMDXComponent=!0}}]);