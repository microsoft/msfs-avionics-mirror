"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[58840],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>h});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function d(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var o=n.createContext({}),s=function(e){var t=n.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=s(e.components);return n.createElement(o.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,o=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),m=s(r),c=a,h=m["".concat(o,".").concat(c)]||m[c]||k[c]||i;return r?n.createElement(h,l(l({ref:t},p),{},{components:r})):n.createElement(h,l({ref:t},p))}));function h(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,l=new Array(i);l[0]=c;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[m]="string"==typeof e?e:a,l[1]=d;for(var s=2;s<i;s++)l[s]=r[s];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},40493:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>k,frontMatter:()=>i,metadata:()=>d,toc:()=>s});var n=r(87462),a=(r(67294),r(3905));const i={id:"index.FlightPathLegLineRenderer",title:"Class: FlightPathLegLineRenderer<Args>",sidebar_label:"FlightPathLegLineRenderer",custom_edit_url:null},l=void 0,d={unversionedId:"framework/classes/index.FlightPathLegLineRenderer",id:"framework/classes/index.FlightPathLegLineRenderer",title:"Class: FlightPathLegLineRenderer<Args>",description:"index.FlightPathLegLineRenderer",source:"@site/docs/framework/classes/index.FlightPathLegLineRenderer.md",sourceDirName:"framework/classes",slug:"/framework/classes/index.FlightPathLegLineRenderer",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.FlightPathLegLineRenderer",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.FlightPathLegLineRenderer",title:"Class: FlightPathLegLineRenderer<Args>",sidebar_label:"FlightPathLegLineRenderer",custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPathCalculator",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.FlightPathCalculator"},next:{title:"FlightPathLegPatternRenderer",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.FlightPathLegPatternRenderer"}},o={},s=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"activeStyleIndex",id:"activestyleindex",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"isAtLegStart",id:"isatlegstart",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"needStrokeLineAtLegEnd",id:"needstrokelineatlegend",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"pathRenderer",id:"pathrenderer",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"styleBuffer",id:"stylebuffer",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"styleSelector",id:"styleselector",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"tempVector",id:"tempvector",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"EMPTY_DASH",id:"empty_dash",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"geoCircleCache",id:"geocirclecache",level:3},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"geoPointCache",id:"geopointcache",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"Methods",id:"methods",level:2},{value:"render",id:"render",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"renderVector",id:"rendervector",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"strokeLine",id:"strokeline",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"areStylesEqual",id:"arestylesequal",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-14",level:4}],p={toc:s},m="wrapper";function k(e){let{components:t,...r}=e;return(0,a.kt)(m,(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".FlightPathLegLineRenderer"),(0,a.kt)("p",null,"Renders flight plan leg paths as lines, with support for different styles for each flight path vector in the leg."),(0,a.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Args")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"any"),"[] = ",(0,a.kt)("inlineCode",{parentName:"td"},"any"),"[]")))),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFlightPathLegRenderer"},(0,a.kt)("inlineCode",{parentName:"a"},"AbstractFlightPathLegRenderer")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Args"),">"),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"FlightPathLegLineRenderer"))))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new FlightPathLegLineRenderer"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Args"),">","(",(0,a.kt)("inlineCode",{parentName:"p"},"styleSelector"),")"),(0,a.kt)("p",null,"Constructor."),(0,a.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Args")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"any"),"[] = ",(0,a.kt)("inlineCode",{parentName:"td"},"any"),"[]")))),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"styleSelector")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules/#flightpathleglinestyleselector"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPathLegLineStyleSelector")),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Args"),">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"A function which selects a style for each rendered vector.")))),(0,a.kt)("h4",{id:"overrides"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFlightPathLegRenderer#constructor"},"constructor")),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:93"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"activestyleindex"},"activeStyleIndex"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"activeStyleIndex"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"0")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:84"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isatlegstart"},"isAtLegStart"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"isAtLegStart"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"false")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:86"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"needstrokelineatlegend"},"needStrokeLineAtLegEnd"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"needStrokeLineAtLegEnd"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"false")),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:87"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"pathrenderer"},"pathRenderer"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"pathRenderer"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.GeoCirclePathRenderer"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoCirclePathRenderer"))),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:62"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"stylebuffer"},"styleBuffer"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"styleBuffer"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/#flightpathleglinestyle"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPathLegLineStyle")),"[]"),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:64"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"styleselector"},"styleSelector"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"styleSelector"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/#flightpathleglinestyleselector"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPathLegLineStyleSelector")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Args"),">"),(0,a.kt)("p",null,"A function which selects a style for each rendered vector."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:94"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"tempvector"},"tempVector"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"tempVector"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.CircleVector"},(0,a.kt)("inlineCode",{parentName:"a"},"CircleVector"))),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFlightPathLegRenderer#tempvector"},"tempVector")),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/AbstractFlightPathLegRenderer.ts:34"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"empty_dash"},"EMPTY","_","DASH"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"EMPTY","_","DASH"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"never"),"[] = ",(0,a.kt)("inlineCode",{parentName:"p"},"[]")),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:58"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"geocirclecache"},"geoCircleCache"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"geoCircleCache"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.GeoCircle"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoCircle")),"[]"),(0,a.kt)("h4",{id:"overrides-1"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFlightPathLegRenderer#geocirclecache"},"geoCircleCache")),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:60"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"geopointcache"},"geoPointCache"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"geoPointCache"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.GeoPoint"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoPoint")),"[]"),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFlightPathLegRenderer#geopointcache"},"geoPointCache")),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/AbstractFlightPathLegRenderer.ts:31"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"render"},"render"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"render"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"context"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"streamStack"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"partsToRender"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"...args"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Renders a flight plan leg path to a canvas."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"leg")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.LegDefinition"},(0,a.kt)("inlineCode",{parentName:"a"},"LegDefinition"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flight plan leg to render.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"context")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"CanvasRenderingContext2D")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The canvas 2D rendering context to which to render.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"streamStack")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.GeoProjectionPathStreamStack"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoProjectionPathStreamStack"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The path stream stack to which to render.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"partsToRender")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The parts of the leg to render, as a combination of ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/enums/index.FlightPathLegRenderPart"},"FlightPathLegRenderPart")," values.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"...args")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Args")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Additional arguments.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-2"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFlightPathLegRenderer#render"},"render")),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:100"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"rendervector"},"renderVector"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("strong",{parentName:"p"},"renderVector"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"vector"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"isIngress"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"isEgress"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"leg"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"context"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"streamStack"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"...args"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Renders a flight path vector."),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"vector")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.CircleVector"},(0,a.kt)("inlineCode",{parentName:"a"},"CircleVector"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flight path vector to render.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"isIngress")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether the vector is part of the ingress transition.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"isEgress")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether the vector is part of the egress transition.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"leg")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.LegDefinition"},(0,a.kt)("inlineCode",{parentName:"a"},"LegDefinition"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flight plan leg containing the vector to render.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"context")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"CanvasRenderingContext2D")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The canvas 2D rendering context to which to render.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"streamStack")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.GeoProjectionPathStreamStack"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoProjectionPathStreamStack"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The path stream stack to which to render.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"...args")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Args")),(0,a.kt)("td",{parentName:"tr",align:"left"},"-")))),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-3"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFlightPathLegRenderer"},"AbstractFlightPathLegRenderer"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFlightPathLegRenderer#rendervector"},"renderVector")),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:119"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"strokeline"},"strokeLine"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"strokeLine"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"context"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"style"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Applies a stroke to a canvas context."),(0,a.kt)("h4",{id:"parameters-3"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"context")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"CanvasRenderingContext2D")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A canvas 2D rendering context.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"style")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules/#flightpathleglinestyle"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPathLegLineStyle"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The style of the line to stroke.")))),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:151"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"arestylesequal"},"areStylesEqual"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"areStylesEqual"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"style1"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"style2"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Checks if two line styles are equal. Styles are considered equal if and only if their stroke and outline widths\nare zero, or their stroke and outline widths, styles, and dash arrays are the same."),(0,a.kt)("h4",{id:"parameters-4"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"style1")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules/#flightpathleglinestyle"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPathLegLineStyle"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The first style.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"style2")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules/#flightpathleglinestyle"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPathLegLineStyle"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The second style.")))),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Whether the two line styles are equal."),(0,a.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathLegLineRenderer.ts:175"))}k.isMDXComponent=!0}}]);