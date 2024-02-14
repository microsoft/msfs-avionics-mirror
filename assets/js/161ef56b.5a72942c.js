"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[15836],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>f});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var d=n.createContext({}),p=function(e){var t=n.useContext(d),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},m=function(e){var t=p(e.components);return n.createElement(d.Provider,{value:t},e.children)},s="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,d=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),s=p(a),u=r,f=s["".concat(d,".").concat(u)]||s[u]||k[u]||i;return a?n.createElement(f,l(l({ref:t},m),{},{components:a})):n.createElement(f,l({ref:t},m))}));function f(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=u;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[s]="string"==typeof e?e:r,l[1]=o;for(var p=2;p<i;p++)l[p]=a[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}u.displayName="MDXCreateElement"},39270:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>k,frontMatter:()=>i,metadata:()=>o,toc:()=>p});var n=a(87462),r=(a(67294),a(3905));const i={id:"AoaDataProvider",title:"Interface: AoaDataProvider",sidebar_label:"AoaDataProvider",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/interfaces/AoaDataProvider",id:"garminsdk/interfaces/AoaDataProvider",title:"Interface: AoaDataProvider",description:"A provider of angle of attack data.",source:"@site/docs/garminsdk/interfaces/AoaDataProvider.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/AoaDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AoaDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AoaDataProvider",title:"Interface: AoaDataProvider",sidebar_label:"AoaDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AoAIndicatorProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AoAIndicatorProps"},next:{title:"AoaSystemEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AoaSystemEvents"}},d={},p=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"aoa",id:"aoa",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"isDataFailed",id:"isdatafailed",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"isOnGround",id:"isonground",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"normAoa",id:"normaoa",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"normAoaIasCoef",id:"normaoaiascoef",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"stallAoa",id:"stallaoa",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"zeroLiftAoa",id:"zeroliftaoa",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"Methods",id:"methods",level:2},{value:"aoaToNormAoa",id:"aoatonormaoa",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"estimateIasFromAoa",id:"estimateiasfromaoa",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"estimateIasFromNormAoa",id:"estimateiasfromnormaoa",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"normAoaToAoa",id:"normaoatoaoa",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-10",level:4}],m={toc:p},s="wrapper";function k(e){let{components:t,...a}=e;return(0,r.kt)(s,(0,n.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A provider of angle of attack data."),(0,r.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultAoaDataProvider"},(0,r.kt)("inlineCode",{parentName:"a"},"DefaultAoaDataProvider")))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"aoa"},"aoa"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"aoa"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current angle of attack, in degrees."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:13"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isdatafailed"},"isDataFailed"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"isDataFailed"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether this provider's AoA data is in a failed state."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:35"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isonground"},"isOnGround"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"isOnGround"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether the airplane is on the ground."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:32"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"normaoa"},"normAoa"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"normAoa"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current normalized angle of attack. A value of ",(0,r.kt)("inlineCode",{parentName:"p"},"0")," is equal to zero-lift AoA, and a value of ",(0,r.kt)("inlineCode",{parentName:"p"},"1")," is equal to stall AoA."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:16"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"normaoaiascoef"},"normAoaIasCoef"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"normAoaIasCoef"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The correlation coefficient between a given normalized angle of attack and the estimated indicated airspeed in\nknots required to maintain level flight at that angle of attack for the current aircraft configuration and\nenvironment, or ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," if such a value cannot be calculated."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:29"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"stallaoa"},"stallAoa"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"stallAoa"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current stall (critical) angle of attack, in degrees."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:19"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"zeroliftaoa"},"zeroLiftAoa"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"zeroLiftAoa"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current zero-lift angle of attack, in degrees."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:22"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"aoatonormaoa"},"aoaToNormAoa"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"aoaToNormAoa"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"aoa"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Converts an absolute angle of attack value in degrees to a normalized angle of attack value. Normalized angle of\nattack is defined such that ",(0,r.kt)("inlineCode",{parentName:"p"},"0")," equals zero-lift AoA, and ",(0,r.kt)("inlineCode",{parentName:"p"},"1")," equals stall AoA."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"aoa")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"An absolute angle of attack value, in degrees.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The normalized equivalent of the specified angle of attack."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:43"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"estimateiasfromaoa"},"estimateIasFromAoa"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"estimateIasFromAoa"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"aoa"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Estimates the indicated airspeed, in knots, required to maintain level flight at a given angle of attack value\nfor the current aircraft configuration and environment."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"aoa")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"An angle of attack value, in degrees.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The estimated indicated airspeed, in knots, required to maintain level flight at the specified angle of\nattack, or ",(0,r.kt)("inlineCode",{parentName:"p"},"NaN")," if an estimate cannot be made."),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:60"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"estimateiasfromnormaoa"},"estimateIasFromNormAoa"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"estimateIasFromNormAoa"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"normAoa"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Estimates the indicated airspeed, in knots, required to maintain level flight at a given normalized angle of\nattack value for the current aircraft configuration and environment. Normalized angle of attack is defined such\nthat ",(0,r.kt)("inlineCode",{parentName:"p"},"0")," equals zero-lift AoA, and ",(0,r.kt)("inlineCode",{parentName:"p"},"1")," equals stall AoA."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"normAoa")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A normalized angle of attack value.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The estimated indicated airspeed, in knots, required to maintain level flight at the specified angle of\nattack, or ",(0,r.kt)("inlineCode",{parentName:"p"},"NaN")," if an estimate cannot be made."),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:70"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"normaoatoaoa"},"normAoaToAoa"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"normAoaToAoa"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"normAoa"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Converts a normalized angle of attack value to an absolute angle of attack value in degrees. Normalized angle of\nattack is defined such that ",(0,r.kt)("inlineCode",{parentName:"p"},"0")," equals zero-lift AoA, and ",(0,r.kt)("inlineCode",{parentName:"p"},"1")," equals stall AoA."),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"normAoa")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A normalized angle of attack value.")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The absolute equivalent of the specified normalized angle of attack, in degrees."),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:51"))}k.isMDXComponent=!0}}]);