"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[13357],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>f});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var l=a.createContext({}),c=function(e){var t=a.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},d=function(e){var t=c(e.components);return a.createElement(l.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},p=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,l=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),u=c(r),p=n,f=u["".concat(l,".").concat(p)]||u[p]||m[p]||i;return r?a.createElement(f,o(o({ref:t},d),{},{components:r})):a.createElement(f,o({ref:t},d))}));function f(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,o=new Array(i);o[0]=p;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[u]="string"==typeof e?e:n,o[1]=s;for(var c=2;c<i;c++)o[c]=r[c];return a.createElement.apply(null,o)}return a.createElement.apply(null,r)}p.displayName="MDXCreateElement"},87097:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>m,frontMatter:()=>i,metadata:()=>s,toc:()=>c});var a=r(87462),n=(r(67294),r(3905));const i={id:"GameStateProvider",title:"Class: GameStateProvider",sidebar_label:"GameStateProvider",sidebar_position:0,custom_edit_url:null},o=void 0,s={unversionedId:"framework/classes/GameStateProvider",id:"framework/classes/GameStateProvider",title:"Class: GameStateProvider",description:"A utility class which provides the current game state.",source:"@site/docs/framework/classes/GameStateProvider.md",sourceDirName:"framework/classes",slug:"/framework/classes/GameStateProvider",permalink:"/msfs-avionics-mirror/docs/framework/classes/GameStateProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GameStateProvider",title:"Class: GameStateProvider",sidebar_label:"GameStateProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GPSSatellite",permalink:"/msfs-avionics-mirror/docs/framework/classes/GPSSatellite"},next:{title:"GameVarPublisher",permalink:"/msfs-avionics-mirror/docs/framework/classes/GameVarPublisher"}},l={},c=[{value:"Methods",id:"methods",level:2},{value:"get",id:"get",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4}],d={toc:c},u="wrapper";function m(e){let{components:t,...r}=e;return(0,n.kt)(u,(0,a.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A utility class which provides the current game state."),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"get"},"get"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"get"),"(): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscribable"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscribable")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,n.kt)("inlineCode",{parentName:"p"},"GameState"),">"),(0,n.kt)("p",null,"Gets a subscribable which provides the current game state."),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscribable"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscribable")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,n.kt)("inlineCode",{parentName:"p"},"GameState"),">"),(0,n.kt)("p",null,"A subscribable which provides the current game state."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/data/GameStateProvider.ts:56"))}m.isMDXComponent=!0}}]);