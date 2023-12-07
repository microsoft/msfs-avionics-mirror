"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[80327],{3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>f});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var d=n.createContext({}),p=function(e){var t=n.useContext(d),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},s=function(e){var t=p(e.components);return n.createElement(d.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=p(r),k=a,f=m["".concat(d,".").concat(k)]||m[k]||c[k]||i;return r?n.createElement(f,l(l({ref:t},s),{},{components:r})):n.createElement(f,l({ref:t},s))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,l=new Array(i);l[0]=k;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:a,l[1]=o;for(var p=2;p<i;p++)l[p]=r[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}k.displayName="MDXCreateElement"},75127:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>o,toc:()=>p});var n=r(87462),a=(r(67294),r(3905));const i={id:"GeoCircleResampler",title:"Class: GeoCircleResampler",sidebar_label:"GeoCircleResampler",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/classes/GeoCircleResampler",id:"framework/classes/GeoCircleResampler",title:"Class: GeoCircleResampler",description:"Resamples projected great- and small-circle paths between defined endpoints into series of straight line segments and circular arcs.",source:"@site/docs/framework/classes/GeoCircleResampler.md",sourceDirName:"framework/classes",slug:"/framework/classes/GeoCircleResampler",permalink:"/msfs-avionics-mirror/docs/framework/classes/GeoCircleResampler",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GeoCircleResampler",title:"Class: GeoCircleResampler",sidebar_label:"GeoCircleResampler",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GeoCirclePatternRenderer",permalink:"/msfs-avionics-mirror/docs/framework/classes/GeoCirclePatternRenderer"},next:{title:"GeoKdTree",permalink:"/msfs-avionics-mirror/docs/framework/classes/GeoKdTree"}},d={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"dpTolerance",id:"dptolerance",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"maxDepth",id:"maxdepth",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"minDistance",id:"mindistance",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"resample",id:"resample",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-4",level:4}],s={toc:p},m="wrapper";function c(e){let{components:t,...r}=e;return(0,a.kt)(m,(0,n.Z)({},s,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Resamples projected great- and small-circle paths between defined endpoints into series of straight line segments and circular arcs."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new GeoCircleResampler"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"minDistance"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"dpTolerance"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"maxDepth"),")"),(0,a.kt)("p",null,"Constructor."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"minDistance")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The minimum great-circle distance this resampler enforces between two adjacent resampled points, in great-arc radians.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"dpTolerance")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The Douglas-Peucker tolerance, in pixels, this resampler uses when deciding whether to discard a resampled point during the simplification process.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"maxDepth")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The maximum depth of the resampling algorithm used by this resampler. The number of resampled points is bounded from above by ",(0,a.kt)("inlineCode",{parentName:"td"},"2^[maxDepth] - 1"),".")))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/geo/GeoCircleResampler.ts:162"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"dptolerance"},"dpTolerance"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"dpTolerance"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The Douglas-Peucker tolerance, in pixels, this resampler uses when deciding whether to discard\na resampled point during the simplification process."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/geo/GeoCircleResampler.ts:162"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"maxdepth"},"maxDepth"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"maxDepth"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The maximum depth of the resampling algorithm used by this resampler. The number of resampled\npoints is bounded from above by ",(0,a.kt)("inlineCode",{parentName:"p"},"2^[maxDepth] - 1"),"."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/geo/GeoCircleResampler.ts:162"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"mindistance"},"minDistance"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"minDistance"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The minimum great-circle distance this resampler enforces between two adjacent resampled\npoints, in great-arc radians."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/geo/GeoCircleResampler.ts:162"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"resample"},"resample"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"resample"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"projection"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"circle"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"start"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"end"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"handler"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Resamples a projected great- or small-circle path."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"projection")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/GeoProjection"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoProjection"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The projection to use.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"circle")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/GeoCircle"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoCircle"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The geo circle along which the path lies.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"start")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,a.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"copyWithin"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"sort"'),">",">"," ","|"," ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LatLonInterface"},(0,a.kt)("inlineCode",{parentName:"a"},"LatLonInterface"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The start of the path.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"end")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,a.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"copyWithin"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"sort"'),">",">"," ","|"," ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LatLonInterface"},(0,a.kt)("inlineCode",{parentName:"a"},"LatLonInterface"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The end of the path.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"handler")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#geocircleresamplerhandler"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoCircleResamplerHandler"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"A function to handle the resampled points. The function is called once for each resampled point, in order.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/geo/GeoCircleResampler.ts:176"))}c.isMDXComponent=!0}}]);