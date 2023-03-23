"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[30953],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>h});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var d=n.createContext({}),s=function(e){var t=n.useContext(d),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=s(e.components);return n.createElement(d.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,d=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),c=s(r),k=a,h=c["".concat(d,".").concat(k)]||c[k]||m[k]||i;return r?n.createElement(h,l(l({ref:t},p),{},{components:r})):n.createElement(h,l({ref:t},p))}));function h(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,l=new Array(i);l[0]=k;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[c]="string"==typeof e?e:a,l[1]=o;for(var s=2;s<i;s++)l[s]=r[s];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}k.displayName="MDXCreateElement"},48779:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>m,frontMatter:()=>i,metadata:()=>o,toc:()=>s});var n=r(87462),a=(r(67294),r(3905));const i={id:"index.FlightPathVectorLineRenderer",title:"Class: FlightPathVectorLineRenderer",sidebar_label:"FlightPathVectorLineRenderer",custom_edit_url:null},l=void 0,o={unversionedId:"framework/classes/index.FlightPathVectorLineRenderer",id:"framework/classes/index.FlightPathVectorLineRenderer",title:"Class: FlightPathVectorLineRenderer",description:"index.FlightPathVectorLineRenderer",source:"@site/docs/framework/classes/index.FlightPathVectorLineRenderer.md",sourceDirName:"framework/classes",slug:"/framework/classes/index.FlightPathVectorLineRenderer",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.FlightPathVectorLineRenderer",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.FlightPathVectorLineRenderer",title:"Class: FlightPathVectorLineRenderer",sidebar_label:"FlightPathVectorLineRenderer",custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPathUtils",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.FlightPathUtils"},next:{title:"FlightPathVectorPatternRenderer",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.FlightPathVectorPatternRenderer"}},d={},s=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Properties",id:"properties",level:2},{value:"renderer",id:"renderer",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"geoCircleCache",id:"geocirclecache",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"render",id:"render",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:s},c="wrapper";function m(e){let{components:t,...r}=e;return(0,a.kt)(c,(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".FlightPathVectorLineRenderer"),(0,a.kt)("p",null,"Renders flight path vectors as a curved line."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new FlightPathVectorLineRenderer"),"()"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"renderer"},"renderer"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"renderer"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.GeoCircleLineRenderer"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoCircleLineRenderer"))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathVectorLineRenderer.ts:12"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"geocirclecache"},"geoCircleCache"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"geoCircleCache"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.GeoCircle"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoCircle")),"[]"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathVectorLineRenderer.ts:10"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"render"},"render"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"render"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"vector"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"context"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"streamStack"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"width"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"style"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"dash?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"outlineWidth?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"outlineStyle?"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Renders a flight path vector to a canvas."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"vector")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.CircleVector"},(0,a.kt)("inlineCode",{parentName:"a"},"CircleVector"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flight path vector to render.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"context")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"CanvasRenderingContext2D")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The canvas 2D rendering context to which to render.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"streamStack")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.GeoProjectionPathStreamStack"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoProjectionPathStreamStack"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The path stream to which to render.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"width")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The width of the rendered line.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"style")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The style of the rendered line.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"dash?")),(0,a.kt)("td",{parentName:"tr",align:"left"},"readonly ",(0,a.kt)("inlineCode",{parentName:"td"},"number"),"[]"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The dash array of the rendered line. Defaults to no dash.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"outlineWidth?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The width of the outline, in pixels. Defaults to 0 pixels.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"outlineStyle?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The style of the outline. Defaults to ",(0,a.kt)("inlineCode",{parentName:"td"},"'black'"),".")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/FlightPathVectorLineRenderer.ts:25"))}m.isMDXComponent=!0}}]);