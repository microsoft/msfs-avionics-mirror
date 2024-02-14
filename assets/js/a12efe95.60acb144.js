"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[70992],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>u});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function d(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var l=a.createContext({}),s=function(e){var t=a.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},p=function(e){var t=s(e.components);return a.createElement(l.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},f=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,l=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),c=s(r),f=n,u=c["".concat(l,".").concat(f)]||c[f]||m[f]||i;return r?a.createElement(u,o(o({ref:t},p),{},{components:r})):a.createElement(u,o({ref:t},p))}));function u(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,o=new Array(i);o[0]=f;var d={};for(var l in t)hasOwnProperty.call(t,l)&&(d[l]=t[l]);d.originalType=e,d[c]="string"==typeof e?e:n,o[1]=d;for(var s=2;s<i;s++)o[s]=r[s];return a.createElement.apply(null,o)}return a.createElement.apply(null,r)}f.displayName="MDXCreateElement"},10280:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>m,frontMatter:()=>i,metadata:()=>d,toc:()=>s});var a=r(87462),n=(r(67294),r(3905));const i={id:"AirspeedAoaDataProvider",title:"Interface: AirspeedAoaDataProvider",sidebar_label:"AirspeedAoaDataProvider",sidebar_position:0,custom_edit_url:null},o=void 0,d={unversionedId:"garminsdk/interfaces/AirspeedAoaDataProvider",id:"garminsdk/interfaces/AirspeedAoaDataProvider",title:"Interface: AirspeedAoaDataProvider",description:"A provider of angle of attack data for an airspeed indicator.",source:"@site/docs/garminsdk/interfaces/AirspeedAoaDataProvider.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/AirspeedAoaDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedAoaDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AirspeedAoaDataProvider",title:"Interface: AirspeedAoaDataProvider",sidebar_label:"AirspeedAoaDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AhrsSystemEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AhrsSystemEvents"},next:{title:"AirspeedIndicatorDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"}},l={},s=[{value:"Properties",id:"properties",level:2},{value:"normAoaIasCoef",id:"normaoaiascoef",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"estimateIasFromNormAoa",id:"estimateiasfromnormaoa",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-1",level:4}],p={toc:s},c="wrapper";function m(e){let{components:t,...r}=e;return(0,n.kt)(c,(0,a.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A provider of angle of attack data for an airspeed indicator."),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"normaoaiascoef"},"normAoaIasCoef"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"normAoaIasCoef"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,n.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,n.kt)("p",null,"The correlation coefficient between a given normalized angle of attack and the estimated indicated airspeed in\nknots required to maintain level flight at that angle of attack for the current aircraft configuration and\nenvironment, or ",(0,n.kt)("inlineCode",{parentName:"p"},"null")," if such a value cannot be calculated."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/components/nextgenpfd/airspeed/AirspeedAoaDataProvider.ts:12"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"estimateiasfromnormaoa"},"estimateIasFromNormAoa"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"estimateIasFromNormAoa"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"normAoa"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"Estimates the indicated airspeed, in knots, required to maintain level flight at a given normalized angle of\nattack value for the current aircraft configuration and environment. Normalized angle of attack is defined such\nthat ",(0,n.kt)("inlineCode",{parentName:"p"},"0")," equals zero-lift AoA, and ",(0,n.kt)("inlineCode",{parentName:"p"},"1")," equals stall AoA."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"normAoa")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"A normalized angle of attack value.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"The estimated indicated airspeed, in knots, required to maintain level flight at the specified angle of\nattack, or ",(0,n.kt)("inlineCode",{parentName:"p"},"NaN")," if an estimate cannot be made."),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/components/nextgenpfd/airspeed/AirspeedAoaDataProvider.ts:22"))}m.isMDXComponent=!0}}]);