"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[68878],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>k});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var o=i.createContext({}),p=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return i.createElement(o.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},c=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,o=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),m=p(n),c=r,k=m["".concat(o,".").concat(c)]||m[c]||u[c]||a;return n?i.createElement(k,l(l({ref:t},s),{},{components:n})):i.createElement(k,l({ref:t},s))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,l=new Array(a);l[0]=c;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[m]="string"==typeof e?e:r,l[1]=d;for(var p=2;p<a;p++)l[p]=n[p];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}c.displayName="MDXCreateElement"},78222:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>u,frontMatter:()=>a,metadata:()=>d,toc:()=>p});var i=n(87462),r=(n(67294),n(3905));const a={id:"AltimeterDataProvider",title:"Interface: AltimeterDataProvider",sidebar_label:"AltimeterDataProvider",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/interfaces/AltimeterDataProvider",id:"garminsdk/interfaces/AltimeterDataProvider",title:"Interface: AltimeterDataProvider",description:"A data provider for an altimeter.",source:"@site/docs/garminsdk/interfaces/AltimeterDataProvider.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/AltimeterDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AltimeterDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AltimeterDataProvider",title:"Interface: AltimeterDataProvider",sidebar_label:"AltimeterDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AirspeedIndicatorProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorProps"},next:{title:"AltimeterProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AltimeterProps"}},o={},p=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"altitudeTrend",id:"altitudetrend",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"baroIsStdActive",id:"baroisstdactive",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"baroPreselect",id:"baropreselect",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"baroSetting",id:"barosetting",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"indicatedAlt",id:"indicatedalt",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"isDataFailed",id:"isdatafailed",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"minimums",id:"minimums",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"radarAlt",id:"radaralt",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"selectedAlt",id:"selectedalt",level:3},{value:"Defined in",id:"defined-in-8",level:4}],s={toc:p},m="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(m,(0,i.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A data provider for an altimeter."),(0,r.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultAltimeterDataProvider"},(0,r.kt)("inlineCode",{parentName:"a"},"DefaultAltimeterDataProvider")))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"altitudetrend"},"altitudeTrend"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"altitudeTrend"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current indicated altitude trend, in feet."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltimeterDataProvider.ts:18"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"baroisstdactive"},"baroIsStdActive"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"baroIsStdActive"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether STD BARO mode is active."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltimeterDataProvider.ts:24"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"baropreselect"},"baroPreselect"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"baroPreselect"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current preselected barometric pressure setting, in inches of mercury."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltimeterDataProvider.ts:27"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"barosetting"},"baroSetting"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"baroSetting"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current barometric pressure setting, in inches of mercury."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltimeterDataProvider.ts:21"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"indicatedalt"},"indicatedAlt"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"indicatedAlt"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current indicated altitude, in feet."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltimeterDataProvider.ts:15"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isdatafailed"},"isDataFailed"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"isDataFailed"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether altitude data is in a failure state."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltimeterDataProvider.ts:39"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"minimums"},"minimums"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"minimums"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current active minimums, in feet indicated altitude, or ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," if no such value exists."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltimeterDataProvider.ts:33"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"radaralt"},"radarAlt"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"radarAlt"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current radar altitude, in feet, or ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," if there is no valid radar altitude."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltimeterDataProvider.ts:36"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"selectedalt"},"selectedAlt"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"selectedAlt"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The current selected altitude, or ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," if no such value exists."),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/components/nextgenpfd/altimeter/AltimeterDataProvider.ts:30"))}u.isMDXComponent=!0}}]);