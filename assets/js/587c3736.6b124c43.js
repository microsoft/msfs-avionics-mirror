"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[58649],{3905:(e,n,a)=>{a.d(n,{Zo:()=>c,kt:()=>f});var t=a(67294);function r(e,n,a){return n in e?Object.defineProperty(e,n,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[n]=a,e}function i(e,n){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),a.push.apply(a,t)}return a}function s(e){for(var n=1;n<arguments.length;n++){var a=null!=arguments[n]?arguments[n]:{};n%2?i(Object(a),!0).forEach((function(n){r(e,n,a[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(a,n))}))}return e}function o(e,n){if(null==e)return{};var a,t,r=function(e,n){if(null==e)return{};var a,t,r={},i=Object.keys(e);for(t=0;t<i.length;t++)a=i[t],n.indexOf(a)>=0||(r[a]=e[a]);return r}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(t=0;t<i.length;t++)a=i[t],n.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var l=t.createContext({}),d=function(e){var n=t.useContext(l),a=n;return e&&(a="function"==typeof e?e(n):s(s({},n),e)),a},c=function(e){var n=d(e.components);return t.createElement(l.Provider,{value:n},e.children)},p="mdxType",v={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},u=t.forwardRef((function(e,n){var a=e.components,r=e.mdxType,i=e.originalType,l=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),p=d(a),u=r,f=p["".concat(l,".").concat(u)]||p[u]||v[u]||i;return a?t.createElement(f,s(s({ref:n},c),{},{components:a})):t.createElement(f,s({ref:n},c))}));function f(e,n){var a=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var i=a.length,s=new Array(i);s[0]=u;var o={};for(var l in n)hasOwnProperty.call(n,l)&&(o[l]=n[l]);o.originalType=e,o[p]="string"==typeof e?e:r,s[1]=o;for(var d=2;d<i;d++)s[d]=a[d];return t.createElement.apply(null,s)}return t.createElement.apply(null,a)}u.displayName="MDXCreateElement"},60522:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>l,contentTitle:()=>s,default:()=>v,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var t=a(87462),r=(a(67294),a(3905));const i={id:"HorizonCanvasLayerCanvasInstance",title:"Interface: HorizonCanvasLayerCanvasInstance",sidebar_label:"HorizonCanvasLayerCanvasInstance",sidebar_position:0,custom_edit_url:null},s=void 0,o={unversionedId:"framework/interfaces/HorizonCanvasLayerCanvasInstance",id:"framework/interfaces/HorizonCanvasLayerCanvasInstance",title:"Interface: HorizonCanvasLayerCanvasInstance",description:"An instance of a canvas within a MapCanvasLayer.",source:"@site/docs/framework/interfaces/HorizonCanvasLayerCanvasInstance.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/HorizonCanvasLayerCanvasInstance",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/HorizonCanvasLayerCanvasInstance",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"HorizonCanvasLayerCanvasInstance",title:"Interface: HorizonCanvasLayerCanvasInstance",sidebar_label:"HorizonCanvasLayerCanvasInstance",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"HardwareUiControlProps",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/HardwareUiControlProps"},next:{title:"HorizonCanvasLayerProps",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/HorizonCanvasLayerProps"}},l={},d=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"canvas",id:"canvas",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"context",id:"context",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"isDisplayed",id:"isdisplayed",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"clear",id:"clear",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"reset",id:"reset",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-4",level:4}],c={toc:d},p="wrapper";function v(e){let{components:n,...a}=e;return(0,r.kt)(p,(0,t.Z)({},c,a,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"An instance of a canvas within a MapCanvasLayer."),(0,r.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/classes/HorizonCanvasLayerCanvasInstanceClass"},(0,r.kt)("inlineCode",{parentName:"a"},"HorizonCanvasLayerCanvasInstanceClass")))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"canvas"},"canvas"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"canvas"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"HTMLCanvasElement")),(0,r.kt)("p",null,"This instance's canvas element."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/horizon/layers/HorizonCanvasLayer.tsx:21"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"context"},"context"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"context"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"CanvasRenderingContext2D")),(0,r.kt)("p",null,"This instance's canvas 2D rendering context."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/horizon/layers/HorizonCanvasLayer.tsx:24"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isdisplayed"},"isDisplayed"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"isDisplayed"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether this instance's canvas is displayed."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/horizon/layers/HorizonCanvasLayer.tsx:27"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"clear"},"clear"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"clear"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Clears this canvas."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/horizon/layers/HorizonCanvasLayer.tsx:30"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"reset"},"reset"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"reset"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Resets this instance's canvas. This will erase the canvas of all drawn pixels, reset its state (including all\nstyles, transformations, and cached paths), and clear the Coherent GT command buffer associated with it."),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/horizon/layers/HorizonCanvasLayer.tsx:36"))}v.isMDXComponent=!0}}]);