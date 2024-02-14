"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[88724],{3905:(e,r,n)=>{n.d(r,{Zo:()=>d,kt:()=>f});var t=n(67294);function a(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function i(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function o(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?i(Object(n),!0).forEach((function(r){a(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function l(e,r){if(null==e)return{};var n,t,a=function(e,r){if(null==e)return{};var n,t,a={},i=Object.keys(e);for(t=0;t<i.length;t++)n=i[t],r.indexOf(n)>=0||(a[n]=e[n]);return a}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(t=0;t<i.length;t++)n=i[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=t.createContext({}),s=function(e){var r=t.useContext(p),n=r;return e&&(n="function"==typeof e?e(r):o(o({},r),e)),n},d=function(e){var r=s(e.components);return t.createElement(p.Provider,{value:r},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},m=t.forwardRef((function(e,r){var n=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),u=s(n),m=a,f=u["".concat(p,".").concat(m)]||u[m]||c[m]||i;return n?t.createElement(f,o(o({ref:r},d),{},{components:n})):t.createElement(f,o({ref:r},d))}));function f(e,r){var n=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=m;var l={};for(var p in r)hasOwnProperty.call(r,p)&&(l[p]=r[p]);l.originalType=e,l[u]="string"==typeof e?e:a,o[1]=l;for(var s=2;s<i;s++)o[s]=n[s];return t.createElement.apply(null,o)}return t.createElement.apply(null,n)}m.displayName="MDXCreateElement"},2382:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>p,contentTitle:()=>o,default:()=>c,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var t=n(87462),a=(n(67294),n(3905));const i={id:"MapTerrainControllerModules",title:"Interface: MapTerrainControllerModules",sidebar_label:"MapTerrainControllerModules",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"garminsdk/interfaces/MapTerrainControllerModules",id:"garminsdk/interfaces/MapTerrainControllerModules",title:"Interface: MapTerrainControllerModules",description:"Modules required by MapTerrainController.",source:"@site/docs/garminsdk/interfaces/MapTerrainControllerModules.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/MapTerrainControllerModules",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapTerrainControllerModules",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapTerrainControllerModules",title:"Interface: MapTerrainControllerModules",sidebar_label:"MapTerrainControllerModules",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapTerrainColorsControllerModules",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapTerrainColorsControllerModules"},next:{title:"MapTerrainScaleIndicatorProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapTerrainScaleIndicatorProps"}},p={},s=[{value:"Properties",id:"properties",level:2},{value:"dataIntegrity",id:"dataintegrity",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"ownAirplaneProps",id:"ownairplaneprops",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"range",id:"range",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"terrain",id:"terrain",level:3},{value:"Defined in",id:"defined-in-3",level:4}],d={toc:s},u="wrapper";function c(e){let{components:r,...n}=e;return(0,a.kt)(u,(0,t.Z)({},d,n,{components:r,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Modules required by MapTerrainController."),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"dataintegrity"},"dataIntegrity"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"dataIntegrity"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"MapDataIntegrityModule")),(0,a.kt)("p",null,"Data integrity module."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/controllers/MapTerrainController.ts:34"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ownairplaneprops"},"ownAirplaneProps"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"ownAirplaneProps"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"MapOwnAirplanePropsModule")),(0,a.kt)("p",null,"Own airplane properties module."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/controllers/MapTerrainController.ts:31"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"range"},"range"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"range"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"MapIndexedRangeModule")),(0,a.kt)("p",null,"Range module."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/controllers/MapTerrainController.ts:25"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"terrain"},"terrain"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"terrain"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapTerrainModule"},(0,a.kt)("inlineCode",{parentName:"a"},"MapTerrainModule"))),(0,a.kt)("p",null,"Range module."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/controllers/MapTerrainController.ts:28"))}c.isMDXComponent=!0}}]);