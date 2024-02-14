"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[3230],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>u});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var p=n.createContext({}),d=function(e){var t=n.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},m=function(e){var t=d(e.components);return n.createElement(p.Provider,{value:t},e.children)},s="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),s=d(a),k=r,u=s["".concat(p,".").concat(k)]||s[k]||c[k]||i;return a?n.createElement(u,l(l({ref:t},m),{},{components:a})):n.createElement(u,l({ref:t},m))}));function u(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=k;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[s]="string"==typeof e?e:r,l[1]=o;for(var d=2;d<i;d++)l[d]=a[d];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}k.displayName="MDXCreateElement"},6956:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var n=a(87462),r=(a(67294),a(3905));const i={id:"DefaultWaypointIconImageCache",title:"Class: DefaultWaypointIconImageCache",sidebar_label:"DefaultWaypointIconImageCache",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/classes/DefaultWaypointIconImageCache",id:"garminsdk/classes/DefaultWaypointIconImageCache",title:"Class: DefaultWaypointIconImageCache",description:"A default implementation of WaypointIconImageCache.",source:"@site/docs/garminsdk/classes/DefaultWaypointIconImageCache.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/DefaultWaypointIconImageCache",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultWaypointIconImageCache",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"DefaultWaypointIconImageCache",title:"Class: DefaultWaypointIconImageCache",sidebar_label:"DefaultWaypointIconImageCache",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"DefaultVsiDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultVsiDataProvider"},next:{title:"DefaultWindDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultWindDataProvider"}},p={},d=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Properties",id:"properties",level:2},{value:"cache",id:"cache",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"get",id:"get",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"getForAirport",id:"getforairport",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"getForVor",id:"getforvor",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"getForWaypoint",id:"getforwaypoint",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"register",id:"register",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-5",level:4}],m={toc:d},s="wrapper";function c(e){let{components:t,...a}=e;return(0,r.kt)(s,(0,n.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A default implementation of ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WaypointIconImageCache"},"WaypointIconImageCache"),"."),(0,r.kt)("h2",{id:"implements"},"Implements"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WaypointIconImageCache"},(0,r.kt)("inlineCode",{parentName:"a"},"WaypointIconImageCache")))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new DefaultWaypointIconImageCache"),"(): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultWaypointIconImageCache"},(0,r.kt)("inlineCode",{parentName:"a"},"DefaultWaypointIconImageCache"))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultWaypointIconImageCache"},(0,r.kt)("inlineCode",{parentName:"a"},"DefaultWaypointIconImageCache"))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"cache"},"cache"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"cache"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Map"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"string"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"HTMLImageElement"),">"),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/graphics/img/DefaultWaypointIconImageCache.ts:36"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"get"},"get"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"get"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"key"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"HTMLImageElement")),(0,r.kt)("p",null,"Retrieves an image from this cache."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"key")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The key of the image to retrieve.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"HTMLImageElement")),(0,r.kt)("p",null,"The image registered under the specified key, or ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," if one could not be found."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/graphics/img/DefaultWaypointIconImageCache.ts:54"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getforairport"},"getForAirport"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getForAirport"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"airport"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"HTMLImageElement")),(0,r.kt)("p",null,"Retrieves an image for an airport."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"airport")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"FacilityWaypoint"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"AirportFacility"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The airport for which to retrieve the image.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"HTMLImageElement")),(0,r.kt)("p",null,"The image for the specified airport, or ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," if one could not be found."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/graphics/img/DefaultWaypointIconImageCache.ts:87"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getforvor"},"getForVor"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getForVor"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"vor"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"HTMLImageElement")),(0,r.kt)("p",null,"Retrieves an image for a VOR."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"vor")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"FacilityWaypoint"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"VorFacility"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The VOR for which to retrieve the image.")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"HTMLImageElement")),(0,r.kt)("p",null,"The image for the specified VOR, or ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," if one could not be found."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/graphics/img/DefaultWaypointIconImageCache.ts:121"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getforwaypoint"},"getForWaypoint"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getForWaypoint"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"HTMLImageElement")),(0,r.kt)("p",null,"Retrieves an image for a waypoint."),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Waypoint")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The waypoint for which to retrieve the image.")))),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"HTMLImageElement")),(0,r.kt)("p",null,"The image for the specified waypoint, or ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," if one could not be found."),(0,r.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WaypointIconImageCache"},"WaypointIconImageCache"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WaypointIconImageCache#getforwaypoint"},"getForWaypoint")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/graphics/img/DefaultWaypointIconImageCache.ts:59"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"register"},"register"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"register"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"key"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"src"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Registers an image with this cache."),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"key")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The key of the image to register.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"src")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The source URI of the image to register.")))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/graphics/img/DefaultWaypointIconImageCache.ts:43"))}c.isMDXComponent=!0}}]);