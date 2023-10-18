"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[68325],{3905:(e,r,a)=>{a.d(r,{Zo:()=>c,kt:()=>m});var n=a(67294);function t(e,r,a){return r in e?Object.defineProperty(e,r,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[r]=a,e}function i(e,r){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var r=1;r<arguments.length;r++){var a=null!=arguments[r]?arguments[r]:{};r%2?i(Object(a),!0).forEach((function(r){t(e,r,a[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(a,r))}))}return e}function l(e,r){if(null==e)return{};var a,n,t=function(e,r){if(null==e)return{};var a,n,t={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],r.indexOf(a)>=0||(t[a]=e[a]);return t}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],r.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(t[a]=e[a])}return t}var f=n.createContext({}),s=function(e){var r=n.useContext(f),a=r;return e&&(a="function"==typeof e?e(r):o(o({},r),e)),a},c=function(e){var r=s(e.components);return n.createElement(f.Provider,{value:r},e.children)},p="mdxType",d={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},u=n.forwardRef((function(e,r){var a=e.components,t=e.mdxType,i=e.originalType,f=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),p=s(a),u=t,m=p["".concat(f,".").concat(u)]||p[u]||d[u]||i;return a?n.createElement(m,o(o({ref:r},c),{},{components:a})):n.createElement(m,o({ref:r},c))}));function m(e,r){var a=arguments,t=r&&r.mdxType;if("string"==typeof e||t){var i=a.length,o=new Array(i);o[0]=u;var l={};for(var f in r)hasOwnProperty.call(r,f)&&(l[f]=r[f]);l.originalType=e,l[p]="string"==typeof e?e:t,o[1]=l;for(var s=2;s<i;s++)o[s]=a[s];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}u.displayName="MDXCreateElement"},6707:(e,r,a)=>{a.r(r),a.d(r,{assets:()=>f,contentTitle:()=>o,default:()=>d,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var n=a(87462),t=(a(67294),a(3905));const i={id:"TrafficMapRangeLayerModules",title:"Interface: TrafficMapRangeLayerModules",sidebar_label:"TrafficMapRangeLayerModules",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"garminsdk/interfaces/TrafficMapRangeLayerModules",id:"garminsdk/interfaces/TrafficMapRangeLayerModules",title:"Interface: TrafficMapRangeLayerModules",description:"Modules required for TrafficMapRangeLayer.",source:"@site/docs/garminsdk/interfaces/TrafficMapRangeLayerModules.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/TrafficMapRangeLayerModules",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TrafficMapRangeLayerModules",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TrafficMapRangeLayerModules",title:"Interface: TrafficMapRangeLayerModules",sidebar_label:"TrafficMapRangeLayerModules",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"TrafficMapRangeControllerModules",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TrafficMapRangeControllerModules"},next:{title:"TrafficMapRangeLayerProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TrafficMapRangeLayerProps"}},f={},s=[{value:"Properties",id:"properties",level:2},{value:"garminTraffic",id:"garmintraffic",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"range",id:"range",level:3},{value:"Defined in",id:"defined-in-1",level:4}],c={toc:s},p="wrapper";function d(e){let{components:r,...a}=e;return(0,t.kt)(p,(0,n.Z)({},c,a,{components:r,mdxType:"MDXLayout"}),(0,t.kt)("p",null,"Modules required for TrafficMapRangeLayer."),(0,t.kt)("h2",{id:"properties"},"Properties"),(0,t.kt)("h3",{id:"garmintraffic"},"garminTraffic"),(0,t.kt)("p",null,"\u2022 ",(0,t.kt)("strong",{parentName:"p"},"garminTraffic"),": ",(0,t.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapGarminTrafficModule"},(0,t.kt)("inlineCode",{parentName:"a"},"MapGarminTrafficModule"))),(0,t.kt)("p",null,"Traffic module."),(0,t.kt)("h4",{id:"defined-in"},"Defined in"),(0,t.kt)("p",null,"garminsdk/components/map/layers/TrafficMapRangeLayer.tsx:18"),(0,t.kt)("hr",null),(0,t.kt)("h3",{id:"range"},"range"),(0,t.kt)("p",null,"\u2022 ",(0,t.kt)("strong",{parentName:"p"},"range"),": ",(0,t.kt)("inlineCode",{parentName:"p"},"MapIndexedRangeModule")),(0,t.kt)("p",null,"Range module."),(0,t.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,t.kt)("p",null,"garminsdk/components/map/layers/TrafficMapRangeLayer.tsx:15"))}d.isMDXComponent=!0}}]);