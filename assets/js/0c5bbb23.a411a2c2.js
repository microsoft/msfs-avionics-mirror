"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[68262],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>g});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),p=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),d=p(n),f=a,g=d["".concat(l,".").concat(f)]||d[f]||m[f]||i;return n?r.createElement(g,o(o({ref:t},c),{},{components:n})):r.createElement(g,o({ref:t},c))}));function g(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=f;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[d]="string"==typeof e?e:a,o[1]=s;for(var p=2;p<i;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},72967:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>m,frontMatter:()=>i,metadata:()=>s,toc:()=>p});var r=n(87462),a=(n(67294),n(3905));const i={id:"WarningManager",title:"Class: WarningManager",sidebar_label:"WarningManager",sidebar_position:0,custom_edit_url:null},o=void 0,s={unversionedId:"framework/classes/WarningManager",id:"framework/classes/WarningManager",title:"Class: WarningManager",description:"The basic component for handling warning logic.",source:"@site/docs/framework/classes/WarningManager.md",sourceDirName:"framework/classes",slug:"/framework/classes/WarningManager",permalink:"/msfs-avionics-mirror/docs/framework/classes/WarningManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"WarningManager",title:"Class: WarningManager",sidebar_label:"WarningManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"Warning",permalink:"/msfs-avionics-mirror/docs/framework/classes/Warning"},next:{title:"WaypointDisplayBuilder",permalink:"/msfs-avionics-mirror/docs/framework/classes/WaypointDisplayBuilder"}},l={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4}],c={toc:p},d="wrapper";function m(e){let{components:t,...n}=e;return(0,a.kt)(d,(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"The basic component for handling warning logic."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new WarningManager"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"warnings"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"logicHost"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"textCb"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"soundCb?"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/WarningManager"},(0,a.kt)("inlineCode",{parentName:"a"},"WarningManager"))),(0,a.kt)("p",null,"Create a WarningManager."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"warnings")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/Warning"},(0,a.kt)("inlineCode",{parentName:"a"},"Warning")),"[]"),(0,a.kt)("td",{parentName:"tr",align:"left"},"An array of warnings to manage.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"logicHost")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/CompositeLogicXMLHost"},(0,a.kt)("inlineCode",{parentName:"a"},"CompositeLogicXMLHost"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"An event bus.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"textCb")),(0,a.kt)("td",{parentName:"tr",align:"left"},"(",(0,a.kt)("inlineCode",{parentName:"td"},"warning"),": ",(0,a.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/Warning"},(0,a.kt)("inlineCode",{parentName:"a"},"Warning")),") => ",(0,a.kt)("inlineCode",{parentName:"td"},"void")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A callback to display new warning text.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"soundCb?")),(0,a.kt)("td",{parentName:"tr",align:"left"},"(",(0,a.kt)("inlineCode",{parentName:"td"},"warning"),": ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/Warning"},(0,a.kt)("inlineCode",{parentName:"a"},"Warning")),", ",(0,a.kt)("inlineCode",{parentName:"td"},"active"),": ",(0,a.kt)("inlineCode",{parentName:"td"},"boolean"),") => ",(0,a.kt)("inlineCode",{parentName:"td"},"void")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A callback to play an instrument sound from a sound ID.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/WarningManager"},(0,a.kt)("inlineCode",{parentName:"a"},"WarningManager"))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/Warnings/Warning.ts:118"))}m.isMDXComponent=!0}}]);