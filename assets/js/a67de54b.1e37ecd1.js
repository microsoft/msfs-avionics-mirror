"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[93303],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>f});var n=r(67294);function l(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){l(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,l=function(e,t){if(null==e)return{};var r,n,l={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(l[r]=e[r]);return l}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(l[r]=e[r])}return l}var s=n.createContext({}),c=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},p=function(e){var t=c(e.components);return n.createElement(s.Provider,{value:t},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var r=e.components,l=e.mdxType,a=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),d=c(r),u=l,f=d["".concat(s,".").concat(u)]||d[u]||m[u]||a;return r?n.createElement(f,i(i({ref:t},p),{},{components:r})):n.createElement(f,i({ref:t},p))}));function f(e,t){var r=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var a=r.length,i=new Array(a);i[0]=u;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[d]="string"==typeof e?e:l,i[1]=o;for(var c=2;c<a;c++)i[c]=r[c];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},11123:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>m,frontMatter:()=>a,metadata:()=>o,toc:()=>c});var n=r(87462),l=(r(67294),r(3905));const a={id:"ScrollUtils",title:"Class: ScrollUtils",sidebar_label:"ScrollUtils",sidebar_position:0,custom_edit_url:null},i=void 0,o={unversionedId:"framework/classes/ScrollUtils",id:"framework/classes/ScrollUtils",title:"Class: ScrollUtils",description:"Scroll utils",source:"@site/docs/framework/classes/ScrollUtils.md",sourceDirName:"framework/classes",slug:"/framework/classes/ScrollUtils",permalink:"/msfs-avionics-mirror/docs/framework/classes/ScrollUtils",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"ScrollUtils",title:"Class: ScrollUtils",sidebar_label:"ScrollUtils",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"SVGUtils",permalink:"/msfs-avionics-mirror/docs/framework/classes/SVGUtils"},next:{title:"SetSubject",permalink:"/msfs-avionics-mirror/docs/framework/classes/SetSubject"}},s={},c=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"ensureInView",id:"ensureinview",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4}],p={toc:c},d="wrapper";function m(e){let{components:t,...r}=e;return(0,l.kt)(d,(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"Scroll utils"),(0,l.kt)("h2",{id:"constructors"},"Constructors"),(0,l.kt)("h3",{id:"constructor"},"constructor"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"new ScrollUtils"),"(): ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/ScrollUtils"},(0,l.kt)("inlineCode",{parentName:"a"},"ScrollUtils"))),(0,l.kt)("h4",{id:"returns"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/ScrollUtils"},(0,l.kt)("inlineCode",{parentName:"a"},"ScrollUtils"))),(0,l.kt)("h2",{id:"methods"},"Methods"),(0,l.kt)("h3",{id:"ensureinview"},"ensureInView"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("strong",{parentName:"p"},"ensureInView"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"el"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"container"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"pinDirection?"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("p",null,"Scrolls the container to make sure an element is in view."),(0,l.kt)("h4",{id:"parameters"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"el")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"HTMLElement")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"undefined")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The element to scroll into view in the container.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"container")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"HTMLElement")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"undefined")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The container to scroll.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"pinDirection")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},'"top"')," ","|"," ",(0,l.kt)("inlineCode",{parentName:"td"},'"none"')," ","|"," ",(0,l.kt)("inlineCode",{parentName:"td"},'"bottom"')),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"'none'")),(0,l.kt)("td",{parentName:"tr",align:"left"},"The end of the container which the element should be pinned to.")))),(0,l.kt)("h4",{id:"returns-1"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"void")),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,"src/sdk/graphics/layout/ScrollUtils.ts:9"))}m.isMDXComponent=!0}}]);