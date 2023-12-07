"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[8245],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>k});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function d(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),s=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},c=function(e){var t=s(e.components);return n.createElement(l.Provider,{value:t},e.children)},u="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,c=d(e,["components","mdxType","originalType","parentName"]),u=s(r),m=a,k=u["".concat(l,".").concat(m)]||u[m]||p[m]||o;return r?n.createElement(k,i(i({ref:t},c),{},{components:r})):n.createElement(k,i({ref:t},c))}));function k(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=m;var d={};for(var l in t)hasOwnProperty.call(t,l)&&(d[l]=t[l]);d.originalType=e,d[u]="string"==typeof e?e:a,i[1]=d;for(var s=2;s<o;s++)i[s]=r[s];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},22655:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>p,frontMatter:()=>o,metadata:()=>d,toc:()=>s});var n=r(87462),a=(r(67294),r(3905));const o={id:"LodBoundaryCache",title:"Class: LodBoundaryCache",sidebar_label:"LodBoundaryCache",sidebar_position:0,custom_edit_url:null},i=void 0,d={unversionedId:"framework/classes/LodBoundaryCache",id:"framework/classes/LodBoundaryCache",title:"Class: LodBoundaryCache",description:"A cache of LodBoundary objects.",source:"@site/docs/framework/classes/LodBoundaryCache.md",sourceDirName:"framework/classes",slug:"/framework/classes/LodBoundaryCache",permalink:"/msfs-avionics-mirror/docs/framework/classes/LodBoundaryCache",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"LodBoundaryCache",title:"Class: LodBoundaryCache",sidebar_label:"LodBoundaryCache",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"LodBoundary",permalink:"/msfs-avionics-mirror/docs/framework/classes/LodBoundary"},next:{title:"Lookahead",permalink:"/msfs-avionics-mirror/docs/framework/classes/Lookahead"}},l={},s=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"lodDistanceThresholds",id:"loddistancethresholds",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"lodVectorCountTargets",id:"lodvectorcounttargets",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"size",id:"size",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"get",id:"get",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-4",level:4}],c={toc:s},u="wrapper";function p(e){let{components:t,...r}=e;return(0,a.kt)(u,(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A cache of LodBoundary objects."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new LodBoundaryCache"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"size"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"lodDistanceThresholds"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"lodVectorCountTargets"),")"),(0,a.kt)("p",null,"Constructor."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"size")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The maximum size of this cache.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"lodDistanceThresholds")),(0,a.kt)("td",{parentName:"tr",align:"left"},"readonly ",(0,a.kt)("inlineCode",{parentName:"td"},"number"),"[]"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The Douglas-Peucker distance thresholds, in great-arc radians, for each LOD level used by this cache's LodBoundary objects.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"lodVectorCountTargets")),(0,a.kt)("td",{parentName:"tr",align:"left"},"readonly ",(0,a.kt)("inlineCode",{parentName:"td"},"number"),"[]"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The vector count targets for each LOD level used by this cache's LodBoundary objects.")))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/navigation/LodBoundaryCache.ts:17"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"loddistancethresholds"},"lodDistanceThresholds"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"lodDistanceThresholds"),": readonly ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),"[]"),(0,a.kt)("p",null,"The Douglas-Peucker distance thresholds, in great-arc radians, for each LOD level\nused by this cache's LodBoundary objects."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/navigation/LodBoundaryCache.ts:17"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"lodvectorcounttargets"},"lodVectorCountTargets"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"lodVectorCountTargets"),": readonly ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),"[]"),(0,a.kt)("p",null,"The vector count targets for each LOD level used by this cache's LodBoundary objects."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/navigation/LodBoundaryCache.ts:17"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"size"},"size"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"size"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The maximum size of this cache."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/navigation/LodBoundaryCache.ts:17"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"get"},"get"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"get"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"facility"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/LodBoundary"},(0,a.kt)("inlineCode",{parentName:"a"},"LodBoundary"))),(0,a.kt)("p",null,"Retrieves a LodBoundary from this cache corresponding to a boundary facility. If the requested LodBoundary does\nnot exist, it will be created and added to this cache."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"facility")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/BoundaryFacility"},(0,a.kt)("inlineCode",{parentName:"a"},"BoundaryFacility"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"A boundary facility.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/LodBoundary"},(0,a.kt)("inlineCode",{parentName:"a"},"LodBoundary"))),(0,a.kt)("p",null,"The LodBoundary corresponding to ",(0,a.kt)("inlineCode",{parentName:"p"},"facility"),"."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/navigation/LodBoundaryCache.ts:26"))}p.isMDXComponent=!0}}]);