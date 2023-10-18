"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[95095],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=r.createContext({}),d=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=d(e.components);return r.createElement(l.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),c=d(n),u=i,f=c["".concat(l,".").concat(u)]||c[u]||m[u]||a;return n?r.createElement(f,o(o({ref:t},p),{},{components:n})):r.createElement(f,o({ref:t},p))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=u;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[c]="string"==typeof e?e:i,o[1]=s;for(var d=2;d<a;d++)o[d]=n[d];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},2502:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>m,frontMatter:()=>a,metadata:()=>s,toc:()=>d});var r=n(87462),i=(n(67294),n(3905));const a={id:"TransitionListItem",title:"Interface: TransitionListItem",sidebar_label:"TransitionListItem",sidebar_position:0,custom_edit_url:null},o=void 0,s={unversionedId:"garminsdk/interfaces/TransitionListItem",id:"garminsdk/interfaces/TransitionListItem",title:"Interface: TransitionListItem",description:"Transition List Items for the Select Procedure Page",source:"@site/docs/garminsdk/interfaces/TransitionListItem.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/TransitionListItem",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TransitionListItem",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TransitionListItem",title:"Interface: TransitionListItem",sidebar_label:"TransitionListItem",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"TrafficSystem",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TrafficSystem"},next:{title:"TurnRateProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/TurnRateProps"}},l={},d=[{value:"Properties",id:"properties",level:2},{value:"name",id:"name",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"startIndex",id:"startindex",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"transitionIndex",id:"transitionindex",level:3},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:d},c="wrapper";function m(e){let{components:t,...n}=e;return(0,i.kt)(c,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Transition List Items for the Select Procedure Page"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"name"},"name"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"name"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"Transition Name"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"garminsdk/flightplan/FmsUtils.ts:1264"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"startindex"},"startIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"startIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The starting leg index from Facility Approach Transition for this offset transition"),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Deprecated"))),(0,i.kt)("p",null,"No longer used by anything. Used to be used for a workaround that is no longer needed."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"garminsdk/flightplan/FmsUtils.ts:1271"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"transitionindex"},"transitionIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"transitionIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"Source Transition Index from Facility Approach"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"garminsdk/flightplan/FmsUtils.ts:1266"))}m.isMDXComponent=!0}}]);