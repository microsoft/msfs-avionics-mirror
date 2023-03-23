"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[28905],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>m});var i=n(67294);function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,i,l=function(e,t){if(null==e)return{};var n,i,l={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(l[n]=e[n]);return l}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(l[n]=e[n])}return l}var o=i.createContext({}),s=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},u=function(e){var t=s(e.components);return i.createElement(o.Provider,{value:t},e.children)},p="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},f=i.forwardRef((function(e,t){var n=e.components,l=e.mdxType,r=e.originalType,o=e.parentName,u=d(e,["components","mdxType","originalType","parentName"]),p=s(n),f=l,m=p["".concat(o,".").concat(f)]||p[f]||c[f]||r;return n?i.createElement(m,a(a({ref:t},u),{},{components:n})):i.createElement(m,a({ref:t},u))}));function m(e,t){var n=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var r=n.length,a=new Array(r);a[0]=f;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[p]="string"==typeof e?e:l,a[1]=d;for(var s=2;s<r;s++)a[s]=n[s];return i.createElement.apply(null,a)}return i.createElement.apply(null,n)}f.displayName="MDXCreateElement"},34536:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>a,default:()=>c,frontMatter:()=>r,metadata:()=>d,toc:()=>s});var i=n(87462),l=(n(67294),n(3905));const r={id:"index.GPSSatelliteState",title:"Enumeration: GPSSatelliteState",sidebar_label:"GPSSatelliteState",custom_edit_url:null},a=void 0,d={unversionedId:"framework/enums/index.GPSSatelliteState",id:"framework/enums/index.GPSSatelliteState",title:"Enumeration: GPSSatelliteState",description:"index.GPSSatelliteState",source:"@site/docs/framework/enums/index.GPSSatelliteState.md",sourceDirName:"framework/enums",slug:"/framework/enums/index.GPSSatelliteState",permalink:"/msfs-avionics-mirror/docs/framework/enums/index.GPSSatelliteState",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.GPSSatelliteState",title:"Enumeration: GPSSatelliteState",sidebar_label:"GPSSatelliteState",custom_edit_url:null},sidebar:"sidebar",previous:{title:"FrequencyBank",permalink:"/msfs-avionics-mirror/docs/framework/enums/index.FrequencyBank"},next:{title:"GPSSystemSBASState",permalink:"/msfs-avionics-mirror/docs/framework/enums/index.GPSSystemSBASState"}},o={},s=[{value:"Enumeration Members",id:"enumeration-members",level:2},{value:"Acquired",id:"acquired",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"DataCollected",id:"datacollected",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Faulty",id:"faulty",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"InUse",id:"inuse",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"InUseDiffApplied",id:"inusediffapplied",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"None",id:"none",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"Unreachable",id:"unreachable",level:3},{value:"Defined in",id:"defined-in-6",level:4}],u={toc:s},p="wrapper";function c(e){let{components:t,...n}=e;return(0,l.kt)(p,(0,i.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".GPSSatelliteState"),(0,l.kt)("p",null,"Possible state on GPS satellites."),(0,l.kt)("h2",{id:"enumeration-members"},"Enumeration Members"),(0,l.kt)("h3",{id:"acquired"},"Acquired"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"Acquired")," = ",(0,l.kt)("inlineCode",{parentName:"p"},'"Acquired"')),(0,l.kt)("p",null,"The satellite has been found and data is being downloaded."),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1167"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"datacollected"},"DataCollected"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"DataCollected")," = ",(0,l.kt)("inlineCode",{parentName:"p"},'"DataCollected"')),(0,l.kt)("p",null,"The satellite has been found, data is downloaded, but is not presently used in the GPS solution."),(0,l.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1173"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"faulty"},"Faulty"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"Faulty")," = ",(0,l.kt)("inlineCode",{parentName:"p"},'"Faulty"')),(0,l.kt)("p",null,"The satellite is faulty."),(0,l.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1170"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"inuse"},"InUse"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"InUse")," = ",(0,l.kt)("inlineCode",{parentName:"p"},'"InUse"')),(0,l.kt)("p",null,"The satellite is being active used in the GPS solution."),(0,l.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1176"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"inusediffapplied"},"InUseDiffApplied"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"InUseDiffApplied")," = ",(0,l.kt)("inlineCode",{parentName:"p"},'"InUseDiffApplied"')),(0,l.kt)("p",null,"The satellite is being active used in the GPS solution and SBAS differential corrections are being applied."),(0,l.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1179"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"none"},"None"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"None")," = ",(0,l.kt)("inlineCode",{parentName:"p"},'"None"')),(0,l.kt)("p",null,"There is no current valid state."),(0,l.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1161"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"unreachable"},"Unreachable"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"Unreachable")," = ",(0,l.kt)("inlineCode",{parentName:"p"},'"Unreachable"')),(0,l.kt)("p",null,"The satellite is out of view and cannot be reached."),(0,l.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1164"))}c.isMDXComponent=!0}}]);