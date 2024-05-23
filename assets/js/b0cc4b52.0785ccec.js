"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[60300],{3905:(t,e,r)=>{r.d(e,{Zo:()=>d,kt:()=>f});var a=r(67294);function n(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function o(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,a)}return r}function p(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?o(Object(r),!0).forEach((function(e){n(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function i(t,e){if(null==t)return{};var r,a,n=function(t,e){if(null==t)return{};var r,a,n={},o=Object.keys(t);for(a=0;a<o.length;a++)r=o[a],e.indexOf(r)>=0||(n[r]=t[r]);return n}(t,e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);for(a=0;a<o.length;a++)r=o[a],e.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(t,r)&&(n[r]=t[r])}return n}var s=a.createContext({}),l=function(t){var e=a.useContext(s),r=e;return t&&(r="function"==typeof t?t(e):p(p({},e),t)),r},d=function(t){var e=l(t.components);return a.createElement(s.Provider,{value:e},t.children)},m="mdxType",u={inlineCode:"code",wrapper:function(t){var e=t.children;return a.createElement(a.Fragment,{},e)}},c=a.forwardRef((function(t,e){var r=t.components,n=t.mdxType,o=t.originalType,s=t.parentName,d=i(t,["components","mdxType","originalType","parentName"]),m=l(r),c=n,f=m["".concat(s,".").concat(c)]||m[c]||u[c]||o;return r?a.createElement(f,p(p({ref:e},d),{},{components:r})):a.createElement(f,p({ref:e},d))}));function f(t,e){var r=arguments,n=e&&e.mdxType;if("string"==typeof t||n){var o=r.length,p=new Array(o);p[0]=c;var i={};for(var s in e)hasOwnProperty.call(e,s)&&(i[s]=e[s]);i.originalType=t,i[m]="string"==typeof t?t:n,p[1]=i;for(var l=2;l<o;l++)p[l]=r[l];return a.createElement.apply(null,p)}return a.createElement.apply(null,r)}c.displayName="MDXCreateElement"},97877:(t,e,r)=>{r.r(e),r.d(e,{assets:()=>s,contentTitle:()=>p,default:()=>u,frontMatter:()=>o,metadata:()=>i,toc:()=>l});var a=r(87462),n=(r(67294),r(3905));const o={id:"MapFormatSupportMatrix",title:"Class: MapFormatSupportMatrix",sidebar_label:"MapFormatSupportMatrix",sidebar_position:0,custom_edit_url:null},p=void 0,i={unversionedId:"wt21shared/classes/MapFormatSupportMatrix",id:"wt21shared/classes/MapFormatSupportMatrix",title:"Class: MapFormatSupportMatrix",description:"A class for checking support of map modes against the map format.",source:"@site/docs/wt21shared/classes/MapFormatSupportMatrix.md",sourceDirName:"wt21shared/classes",slug:"/wt21shared/classes/MapFormatSupportMatrix",permalink:"/msfs-avionics-mirror/docs/wt21shared/classes/MapFormatSupportMatrix",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapFormatSupportMatrix",title:"Class: MapFormatSupportMatrix",sidebar_label:"MapFormatSupportMatrix",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapFormatController",permalink:"/msfs-avionics-mirror/docs/wt21shared/classes/MapFormatController"},next:{title:"MapRangeController",permalink:"/msfs-avionics-mirror/docs/wt21shared/classes/MapRangeController"}},s={},l=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"isSupported",id:"issupported",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4}],d={toc:l},m="wrapper";function u(t){let{components:e,...r}=t;return(0,n.kt)(m,(0,a.Z)({},d,r,{components:e,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A class for checking support of map modes against the map format."),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new MapFormatSupportMatrix"),"(): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21shared/classes/MapFormatSupportMatrix"},(0,n.kt)("inlineCode",{parentName:"a"},"MapFormatSupportMatrix"))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21shared/classes/MapFormatSupportMatrix"},(0,n.kt)("inlineCode",{parentName:"a"},"MapFormatSupportMatrix"))),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"issupported"},"isSupported"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"isSupported"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"format"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"layer"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Checks support for a map mode against the format."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"format")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},'"PPOS"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},'"ROSE"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},'"ARC"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},'"PLAN"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},'"GWX"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},'"TCAS"')),(0,n.kt)("td",{parentName:"tr",align:"left"},"The map format to check.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"layer")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The map mode. 0=map 1=terr 2=wx 3=nexrad")))),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"True if the map format supports the mode, false otherwise."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"workingtitle-instruments-wt21/shared/Map/MapFormatSupportMatrix.ts:23"))}u.isMDXComponent=!0}}]);