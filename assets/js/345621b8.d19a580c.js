"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[39485],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>m});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=r.createContext({}),c=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},s=function(e){var t=c(e.components);return r.createElement(p.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,p=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),d=c(n),f=i,m=d["".concat(p,".").concat(f)]||d[f]||u[f]||a;return n?r.createElement(m,o(o({ref:t},s),{},{components:n})):r.createElement(m,o({ref:t},s))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=f;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[d]="string"==typeof e?e:i,o[1]=l;for(var c=2;c<a;c++)o[c]=n[c];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},92314:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>u,frontMatter:()=>a,metadata:()=>l,toc:()=>c});var r=n(87462),i=(n(67294),n(3905));const a={id:"AirwaySegment",title:"Interface: AirwaySegment",sidebar_label:"AirwaySegment",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"framework/interfaces/AirwaySegment",id:"framework/interfaces/AirwaySegment",title:"Interface: AirwaySegment",description:"A segment of an airway.",source:"@site/docs/framework/interfaces/AirwaySegment.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/AirwaySegment",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AirwaySegment",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AirwaySegment",title:"Interface: AirwaySegment",sidebar_label:"AirwaySegment",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"Airway",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/Airway"},next:{title:"AltitudeSelectEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AltitudeSelectEvents"}},p={},c=[{value:"Properties",id:"properties",level:2},{value:"name",id:"name",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"nextIcao",id:"nexticao",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"prevIcao",id:"previcao",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"type",id:"type",level:3},{value:"Defined in",id:"defined-in-3",level:4}],s={toc:c},d="wrapper";function u(e){let{components:t,...n}=e;return(0,i.kt)(d,(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A segment of an airway."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"name"},"name"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"name"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The name of the airway"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/navigation/Facilities.ts:147"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"nexticao"},"nextIcao"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"nextIcao"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The next FS ICAO on the airway."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/navigation/Facilities.ts:156"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"previcao"},"prevIcao"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"prevIcao"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The previous FS ICAO on the airway."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/navigation/Facilities.ts:153"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"type"},"type"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"type"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The type of the airway."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/navigation/Facilities.ts:150"))}u.isMDXComponent=!0}}]);