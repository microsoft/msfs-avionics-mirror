"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[85974],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>v});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function s(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?s(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):s(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},s=Object.keys(e);for(n=0;n<s.length;n++)r=s[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(n=0;n<s.length;n++)r=s[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var o=n.createContext({}),l=function(e){var t=n.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):a(a({},t),e)),r},p=function(e){var t=l(e.components);return n.createElement(o.Provider,{value:t},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,s=e.originalType,o=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),m=l(r),u=i,v=m["".concat(o,".").concat(u)]||m[u]||d[u]||s;return r?n.createElement(v,a(a({ref:t},p),{},{components:r})):n.createElement(v,a({ref:t},p))}));function v(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var s=r.length,a=new Array(s);a[0]=u;var c={};for(var o in t)hasOwnProperty.call(t,o)&&(c[o]=t[o]);c.originalType=e,c[m]="string"==typeof e?e:i,a[1]=c;for(var l=2;l<s;l++)a[l]=r[l];return n.createElement.apply(null,a)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},78848:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>o,contentTitle:()=>a,default:()=>d,frontMatter:()=>s,metadata:()=>c,toc:()=>l});var n=r(87462),i=(r(67294),r(3905));const s={id:"GpsReceiverSystemEvents",title:"Interface: GpsReceiverSystemEvents",sidebar_label:"GpsReceiverSystemEvents",sidebar_position:0,custom_edit_url:null},a=void 0,c={unversionedId:"garminsdk/interfaces/GpsReceiverSystemEvents",id:"garminsdk/interfaces/GpsReceiverSystemEvents",title:"Interface: GpsReceiverSystemEvents",description:"Events fired by the GPS receiver system.",source:"@site/docs/garminsdk/interfaces/GpsReceiverSystemEvents.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/GpsReceiverSystemEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/GpsReceiverSystemEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GpsReceiverSystemEvents",title:"Interface: GpsReceiverSystemEvents",sidebar_label:"GpsReceiverSystemEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GpsIntegrityDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/GpsIntegrityDataProvider"},next:{title:"HeadingSyncEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/HeadingSyncEvents"}},o={},l=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Indexable",id:"indexable",level:2}],p={toc:l},m="wrapper";function d(e){let{components:t,...r}=e;return(0,i.kt)(m,(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Events fired by the GPS receiver system."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"p"},"GpsReceiverGPSSatComputerDataEvents")),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"GpsReceiverSystemEvents"))))),(0,i.kt)("h2",{id:"indexable"},"Indexable"),(0,i.kt)("p",null,"\u25aa ","[gps_rec_state: ","`","gps","_","rec","_","state","_","${number}","`]",": ",(0,i.kt)("inlineCode",{parentName:"p"},"AvionicsSystemStateEvent")))}d.isMDXComponent=!0}}]);