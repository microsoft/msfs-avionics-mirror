"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[18551],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>m});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},l=Object.keys(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=r.createContext({}),s=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},d=function(e){var t=s(e.components);return r.createElement(c.Provider,{value:t},e.children)},p="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,l=e.originalType,c=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),p=s(n),u=i,m=p["".concat(c,".").concat(u)]||p[u]||f[u]||l;return n?r.createElement(m,a(a({ref:t},d),{},{components:n})):r.createElement(m,a({ref:t},d))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var l=n.length,a=new Array(l);a[0]=u;var o={};for(var c in t)hasOwnProperty.call(t,c)&&(o[c]=t[c]);o.originalType=e,o[p]="string"==typeof e?e:i,a[1]=o;for(var s=2;s<l;s++)a[s]=n[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},52437:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>a,default:()=>f,frontMatter:()=>l,metadata:()=>o,toc:()=>s});var r=n(87462),i=(n(67294),n(3905));const l={id:"index.LineSelectKeyEvent",title:"Interface: LineSelectKeyEvent",sidebar_label:"LineSelectKeyEvent",custom_edit_url:null},a=void 0,o={unversionedId:"framework/interfaces/index.LineSelectKeyEvent",id:"framework/interfaces/index.LineSelectKeyEvent",title:"Interface: LineSelectKeyEvent",description:"index.LineSelectKeyEvent",source:"@site/docs/framework/interfaces/index.LineSelectKeyEvent.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.LineSelectKeyEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.LineSelectKeyEvent",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.LineSelectKeyEvent",title:"Interface: LineSelectKeyEvent",sidebar_label:"LineSelectKeyEvent",custom_edit_url:null},sidebar:"sidebar",previous:{title:"LegDefinition",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.LegDefinition"},next:{title:"MapAbstractNearestWaypointsLayerProps",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.MapAbstractNearestWaypointsLayerProps"}},c={},s=[{value:"Properties",id:"properties",level:2},{value:"col",id:"col",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"isDelete",id:"isdelete",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"row",id:"row",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"scratchpadContents",id:"scratchpadcontents",level:3},{value:"Defined in",id:"defined-in-3",level:4}],d={toc:s},p="wrapper";function f(e){let{components:t,...n}=e;return(0,i.kt)(p,(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".LineSelectKeyEvent"),(0,i.kt)("p",null,"An FMC line select key"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"col"},"col"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"col"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The LSK column"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/FmcInteractionEvents.ts:9"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isdelete"},"isDelete"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"isDelete"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether the CLEAR/DELETE key (if applicable) was activated"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/FmcInteractionEvents.ts:15"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"row"},"row"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"row"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The LSK row"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/FmcInteractionEvents.ts:6"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"scratchpadcontents"},"scratchpadContents"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"scratchpadContents"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The scratchpad contents at the time of pressing the LSK"),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/FmcInteractionEvents.ts:12"))}f.isMDXComponent=!0}}]);