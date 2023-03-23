"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[55239],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>m});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),s=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},d=function(e){var t=s(e.components);return r.createElement(p.Provider,{value:t},e.children)},c="mdxType",h={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),c=s(n),f=a,m=c["".concat(p,".").concat(f)]||c[f]||h[f]||i;return n?r.createElement(m,o(o({ref:t},d),{},{components:n})):r.createElement(m,o({ref:t},d))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=f;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[c]="string"==typeof e?e:a,o[1]=l;for(var s=2;s<i;s++)o[s]=n[s];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},28098:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>h,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var r=n(87462),a=(n(67294),n(3905));const i={id:"index.PathPattern",title:"Interface: PathPattern",sidebar_label:"PathPattern",custom_edit_url:null},o=void 0,l={unversionedId:"framework/interfaces/index.PathPattern",id:"framework/interfaces/index.PathPattern",title:"Interface: PathPattern",description:"index.PathPattern",source:"@site/docs/framework/interfaces/index.PathPattern.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.PathPattern",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.PathPattern",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.PathPattern",title:"Interface: PathPattern",sidebar_label:"PathPattern",custom_edit_url:null},sidebar:"sidebar",previous:{title:"PassedLegPredictions",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.PassedLegPredictions"},next:{title:"PathStream",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.PathStream"}},p={},s=[{value:"Properties",id:"properties",level:2},{value:"anchor",id:"anchor",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"length",id:"length",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"draw",id:"draw",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-2",level:4}],d={toc:s},c="wrapper";function h(e){let{components:t,...n}=e;return(0,a.kt)(c,(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".PathPattern"),(0,a.kt)("p",null,"A pattern which can be drawn along a path."),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"anchor"},"anchor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"anchor"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The anchor point of each repeating unit of this pattern along its length, as a fraction of the total length. The\norientation of each pattern unit is determined by the direction of the path at its anchor point."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/graphics/path/PatternPathStream.ts:17"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"length"},"length"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"length"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The along-path length of each repeating unit of this pattern."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/graphics/path/PatternPathStream.ts:11"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"draw"},"draw"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"draw"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"stream"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Draws a single unit of this pattern to a path stream. The coordinate system of the path stream is set such that\nthe anchor point of the pattern unit is located at the origin (0, 0), and the positive x-axis points in the\ndirection of the path on which the pattern unit is placed."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"stream")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.PathStream"},(0,a.kt)("inlineCode",{parentName:"a"},"PathStream"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The path stream to which to draw this pattern.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/graphics/path/PatternPathStream.ts:25"))}h.isMDXComponent=!0}}]);