"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[74180],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>m});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var c=n.createContext({}),s=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},d=function(e){var t=s(e.components);return n.createElement(c.Provider,{value:t},e.children)},p="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,a=e.originalType,c=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),p=s(r),u=i,m=p["".concat(c,".").concat(u)]||p[u]||f[u]||a;return r?n.createElement(m,o(o({ref:t},d),{},{components:r})):n.createElement(m,o({ref:t},d))}));function m(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=r.length,o=new Array(a);o[0]=u;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[p]="string"==typeof e?e:i,o[1]=l;for(var s=2;s<a;s++)o[s]=r[s];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},51577:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>o,default:()=>f,frontMatter:()=>a,metadata:()=>l,toc:()=>s});var n=r(87462),i=(r(67294),r(3905));const a={id:"index.FlightPathVectorStyle",title:"Interface: FlightPathVectorStyle",sidebar_label:"FlightPathVectorStyle",custom_edit_url:null},o=void 0,l={unversionedId:"framework/interfaces/index.FlightPathVectorStyle",id:"framework/interfaces/index.FlightPathVectorStyle",title:"Interface: FlightPathVectorStyle",description:"index.FlightPathVectorStyle",source:"@site/docs/framework/interfaces/index.FlightPathVectorStyle.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.FlightPathVectorStyle",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.FlightPathVectorStyle",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.FlightPathVectorStyle",title:"Interface: FlightPathVectorStyle",sidebar_label:"FlightPathVectorStyle",custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPathState",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.FlightPathState"},next:{title:"FlightPlanActiveLegEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.FlightPlanActiveLegEvent"}},c={},s=[{value:"Properties",id:"properties",level:2},{value:"partsToRender",id:"partstorender",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"styleBuilder",id:"stylebuilder",level:3},{value:"Defined in",id:"defined-in-1",level:4}],d={toc:s},p="wrapper";function f(e){let{components:t,...r}=e;return(0,i.kt)(p,(0,n.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".FlightPathVectorStyle"),(0,i.kt)("p",null,"A configuration for generating flight path rendering styles for individual vectors."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"partstorender"},"partsToRender"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"partsToRender"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/index.FlightPathLegRenderPart"},(0,i.kt)("inlineCode",{parentName:"a"},"FlightPathLegRenderPart"))),(0,i.kt)("p",null,"An optional override of which parts to render for the leg."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:156"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"stylebuilder"},"styleBuilder"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"styleBuilder"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/#vectorstylehandler"},(0,i.kt)("inlineCode",{parentName:"a"},"VectorStyleHandler"))),(0,i.kt)("p",null,"A builder function that provides the style for an individual vector."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/mapsystem/MapSystemPlanRenderer.ts:159"))}f.isMDXComponent=!0}}]);