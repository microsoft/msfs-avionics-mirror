"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[64237],{3905:(e,n,t)=>{t.d(n,{Zo:()=>s,kt:()=>m});var r=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function a(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var p=r.createContext({}),d=function(e){var n=r.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},s=function(e){var n=d(e.components);return r.createElement(p.Provider,{value:n},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},f=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,p=e.parentName,s=a(e,["components","mdxType","originalType","parentName"]),c=d(t),f=i,m=c["".concat(p,".").concat(f)]||c[f]||u[f]||o;return t?r.createElement(m,l(l({ref:n},s),{},{components:t})):r.createElement(m,l({ref:n},s))}));function m(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,l=new Array(o);l[0]=f;var a={};for(var p in n)hasOwnProperty.call(n,p)&&(a[p]=n[p]);a.originalType=e,a[c]="string"==typeof e?e:i,l[1]=a;for(var d=2;d<o;d++)l[d]=t[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,t)}f.displayName="MDXCreateElement"},92764:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>p,contentTitle:()=>l,default:()=>u,frontMatter:()=>o,metadata:()=>a,toc:()=>d});var r=t(87462),i=(t(67294),t(3905));const o={id:"GPSEpoch",title:"Interface: GPSEpoch",sidebar_label:"GPSEpoch",sidebar_position:0,custom_edit_url:null},l=void 0,a={unversionedId:"framework/interfaces/GPSEpoch",id:"framework/interfaces/GPSEpoch",title:"Interface: GPSEpoch",description:"The GPS ephemeris data epoch.",source:"@site/docs/framework/interfaces/GPSEpoch.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/GPSEpoch",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/GPSEpoch",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GPSEpoch",title:"Interface: GPSEpoch",sidebar_label:"GPSEpoch",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GPSEphemerisRecords",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/GPSEphemerisRecords"},next:{title:"GPSSVClock",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/GPSSVClock"}},p={},d=[{value:"Properties",id:"properties",level:2},{value:"day",id:"day",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"hour",id:"hour",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"minute",id:"minute",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"month",id:"month",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"second",id:"second",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"year",id:"year",level:3},{value:"Defined in",id:"defined-in-5",level:4}],s={toc:d},c="wrapper";function u(e){let{components:n,...t}=e;return(0,i.kt)(c,(0,r.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"The GPS ephemeris data epoch."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"day"},"day"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"day"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The epoch day."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1740"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"hour"},"hour"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"hour"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The epoch hour."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1743"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"minute"},"minute"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"minute"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The epoch minute."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1746"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"month"},"month"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"month"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The epoch month."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1737"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"second"},"second"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"second"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The epoch second."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1749"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"year"},"year"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"year"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The epoch year."),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1734"))}u.isMDXComponent=!0}}]);