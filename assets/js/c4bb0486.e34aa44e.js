"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[52114],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>h});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var d=a.createContext({}),s=function(e){var t=a.useContext(d),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=s(e.components);return a.createElement(d.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},k=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,d=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=s(r),k=n,h=m["".concat(d,".").concat(k)]||m[k]||c[k]||i;return r?a.createElement(h,l(l({ref:t},p),{},{components:r})):a.createElement(h,l({ref:t},p))}));function h(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,l=new Array(i);l[0]=k;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:n,l[1]=o;for(var s=2;s<i;s++)l[s]=r[s];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}k.displayName="MDXCreateElement"},74602:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>o,toc:()=>s});var a=r(87462),n=(r(67294),r(3905));const i={id:"FlightPathLegLineRenderer",title:"Class: FlightPathLegLineRenderer<Args>",sidebar_label:"FlightPathLegLineRenderer",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/classes/FlightPathLegLineRenderer",id:"framework/classes/FlightPathLegLineRenderer",title:"Class: FlightPathLegLineRenderer<Args>",description:"Renders flight plan leg paths as lines, with support for different styles for each flight path vector in the leg.",source:"@site/docs/framework/classes/FlightPathLegLineRenderer.md",sourceDirName:"framework/classes",slug:"/framework/classes/FlightPathLegLineRenderer",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPathLegLineRenderer",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPathLegLineRenderer",title:"Class: FlightPathLegLineRenderer<Args>",sidebar_label:"FlightPathLegLineRenderer",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPathCalculator",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPathCalculator"},next:{title:"FlightPathLegPatternRenderer",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPathLegPatternRenderer"}},d={},s=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"tempVector",id:"tempvector",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"geoCircleCache",id:"geocirclecache",level:3},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"geoPointCache",id:"geopointcache",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"render",id:"render",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"renderVector",id:"rendervector",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-5",level:4}],p={toc:s},m="wrapper";function c(e){let{components:t,...r}=e;return(0,n.kt)(m,(0,a.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Renders flight plan leg paths as lines, with support for different styles for each flight path vector in the leg."),(0,n.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Args")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("inlineCode",{parentName:"td"},"any"),"[] = ",(0,n.kt)("inlineCode",{parentName:"td"},"any"),"[]")))),(0,n.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},(0,n.kt)("inlineCode",{parentName:"a"},"AbstractFlightPathLegRenderer")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Args"),">"),(0,n.kt)("p",{parentName:"li"},"\u21b3 ",(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"FlightPathLegLineRenderer"))))),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new FlightPathLegLineRenderer"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Args"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"styleSelector"),")"),(0,n.kt)("p",null,"Constructor."),(0,n.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Args")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("inlineCode",{parentName:"td"},"any"),"[] = ",(0,n.kt)("inlineCode",{parentName:"td"},"any"),"[]")))),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"styleSelector")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#flightpathleglinestyleselector"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPathLegLineStyleSelector")),"<",(0,n.kt)("inlineCode",{parentName:"td"},"Args"),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A function which selects a style for each rendered vector.")))),(0,n.kt)("h4",{id:"overrides"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer#constructor"},"constructor")),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:93"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"tempvector"},"tempVector"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"tempVector"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/CircleVector"},(0,n.kt)("inlineCode",{parentName:"a"},"CircleVector"))),(0,n.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer#tempvector"},"tempVector")),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/AbstractFlightPathLegRenderer.ts:34"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"geocirclecache"},"geoCircleCache"),(0,n.kt)("p",null,"\u25aa ",(0,n.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"geoCircleCache"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/GeoCircle"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoCircle")),"[]"),(0,n.kt)("h4",{id:"overrides-1"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer#geocirclecache"},"geoCircleCache")),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:60"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"geopointcache"},"geoPointCache"),(0,n.kt)("p",null,"\u25aa ",(0,n.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"geoPointCache"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/GeoPoint"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoPoint")),"[]"),(0,n.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer#geopointcache"},"geoPointCache")),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/AbstractFlightPathLegRenderer.ts:31"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"render"},"render"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"render"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"context"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"streamStack"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"partsToRender"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"...args"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Renders a flight plan leg path to a canvas."),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"leg")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegDefinition"},(0,n.kt)("inlineCode",{parentName:"a"},"LegDefinition"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The flight plan leg to render.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"context")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"CanvasRenderingContext2D")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The canvas 2D rendering context to which to render.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"streamStack")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/GeoProjectionPathStreamStack"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoProjectionPathStreamStack"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The path stream stack to which to render.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"partsToRender")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The parts of the leg to render, as a combination of ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/enums/FlightPathLegRenderPart"},"FlightPathLegRenderPart")," values.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"...args")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Args")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Additional arguments.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"overrides-2"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer#render"},"render")),(0,n.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:100"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"rendervector"},"renderVector"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("strong",{parentName:"p"},"renderVector"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"vector"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"isIngress"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"isEgress"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"context"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"streamStack"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"...args"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Renders a flight path vector."),(0,n.kt)("h4",{id:"parameters-2"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"vector")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/CircleVector"},(0,n.kt)("inlineCode",{parentName:"a"},"CircleVector"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The flight path vector to render.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"isIngress")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether the vector is part of the ingress transition.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"isEgress")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether the vector is part of the egress transition.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"leg")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegDefinition"},(0,n.kt)("inlineCode",{parentName:"a"},"LegDefinition"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The flight plan leg containing the vector to render.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"context")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"CanvasRenderingContext2D")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The canvas 2D rendering context to which to render.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"streamStack")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/GeoProjectionPathStreamStack"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoProjectionPathStreamStack"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The path stream stack to which to render.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"...args")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Args")),(0,n.kt)("td",{parentName:"tr",align:"left"},"-")))),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"overrides-3"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFlightPathLegRenderer#rendervector"},"renderVector")),(0,n.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:119"))}c.isMDXComponent=!0}}]);