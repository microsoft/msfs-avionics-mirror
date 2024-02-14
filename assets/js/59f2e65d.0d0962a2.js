"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[93174],{3905:(e,r,n)=>{n.d(r,{Zo:()=>p,kt:()=>m});var a=n(67294);function t(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function o(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?o(Object(n),!0).forEach((function(r){t(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function c(e,r){if(null==e)return{};var n,a,t=function(e,r){if(null==e)return{};var n,a,t={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],r.indexOf(n)>=0||(t[n]=e[n]);return t}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(t[n]=e[n])}return t}var s=a.createContext({}),l=function(e){var r=a.useContext(s),n=r;return e&&(n="function"==typeof e?e(r):i(i({},r),e)),n},p=function(e){var r=l(e.components);return a.createElement(s.Provider,{value:r},e.children)},d="mdxType",f={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},u=a.forwardRef((function(e,r){var n=e.components,t=e.mdxType,o=e.originalType,s=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),d=l(n),u=t,m=d["".concat(s,".").concat(u)]||d[u]||f[u]||o;return n?a.createElement(m,i(i({ref:r},p),{},{components:n})):a.createElement(m,i({ref:r},p))}));function m(e,r){var n=arguments,t=r&&r.mdxType;if("string"==typeof e||t){var o=n.length,i=new Array(o);i[0]=u;var c={};for(var s in r)hasOwnProperty.call(r,s)&&(c[s]=r[s]);c.originalType=e,c[d]="string"==typeof e?e:t,i[1]=c;for(var l=2;l<o;l++)i[l]=n[l];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},71168:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>s,contentTitle:()=>i,default:()=>f,frontMatter:()=>o,metadata:()=>c,toc:()=>l});var a=n(87462),t=(n(67294),n(3905));const o={id:"MapCachedCanvasLayerReference",title:"Interface: MapCachedCanvasLayerReference",sidebar_label:"MapCachedCanvasLayerReference",sidebar_position:0,custom_edit_url:null},i=void 0,c={unversionedId:"framework/interfaces/MapCachedCanvasLayerReference",id:"framework/interfaces/MapCachedCanvasLayerReference",title:"Interface: MapCachedCanvasLayerReference",description:"A description of the reference projection of a MapCachedCanvasLayer.",source:"@site/docs/framework/interfaces/MapCachedCanvasLayerReference.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/MapCachedCanvasLayerReference",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MapCachedCanvasLayerReference",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapCachedCanvasLayerReference",title:"Interface: MapCachedCanvasLayerReference",sidebar_label:"MapCachedCanvasLayerReference",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapCachedCanvasLayerProps",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MapCachedCanvasLayerProps"},next:{title:"MapCachedCanvasLayerTransform",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MapCachedCanvasLayerTransform"}},s={},l=[{value:"Properties",id:"properties",level:2},{value:"center",id:"center",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"rotation",id:"rotation",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"scaleFactor",id:"scalefactor",level:3},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:l},d="wrapper";function f(e){let{components:r,...n}=e;return(0,t.kt)(d,(0,a.Z)({},p,n,{components:r,mdxType:"MDXLayout"}),(0,t.kt)("p",null,"A description of the reference projection of a MapCachedCanvasLayer."),(0,t.kt)("h2",{id:"properties"},"Properties"),(0,t.kt)("h3",{id:"center"},"center"),(0,t.kt)("p",null,"\u2022 ",(0,t.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,t.kt)("strong",{parentName:"p"},"center"),": ",(0,t.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/GeoPointReadOnly"},(0,t.kt)("inlineCode",{parentName:"a"},"GeoPointReadOnly"))),(0,t.kt)("p",null,"The map center of this reference."),(0,t.kt)("h4",{id:"defined-in"},"Defined in"),(0,t.kt)("p",null,"src/sdk/components/map/layers/MapCachedCanvasLayer.ts:23"),(0,t.kt)("hr",null),(0,t.kt)("h3",{id:"rotation"},"rotation"),(0,t.kt)("p",null,"\u2022 ",(0,t.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,t.kt)("strong",{parentName:"p"},"rotation"),": ",(0,t.kt)("inlineCode",{parentName:"p"},"number")),(0,t.kt)("p",null,"The rotation angle, in radians, of this reference."),(0,t.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,t.kt)("p",null,"src/sdk/components/map/layers/MapCachedCanvasLayer.ts:27"),(0,t.kt)("hr",null),(0,t.kt)("h3",{id:"scalefactor"},"scaleFactor"),(0,t.kt)("p",null,"\u2022 ",(0,t.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,t.kt)("strong",{parentName:"p"},"scaleFactor"),": ",(0,t.kt)("inlineCode",{parentName:"p"},"number")),(0,t.kt)("p",null,"The projection scale factor of this reference."),(0,t.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,t.kt)("p",null,"src/sdk/components/map/layers/MapCachedCanvasLayer.ts:25"))}f.isMDXComponent=!0}}]);