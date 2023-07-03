"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[41946],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>f});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=r.createContext({}),c=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},m=function(e){var t=c(e.components);return r.createElement(s.Provider,{value:t},e.children)},p="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,s=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),p=c(n),u=i,f=p["".concat(s,".").concat(u)]||p[u]||d[u]||o;return n?r.createElement(f,a(a({ref:t},m),{},{components:n})):r.createElement(f,a({ref:t},m))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=u;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[p]="string"==typeof e?e:i,a[1]=l;for(var c=2;c<o;c++)a[c]=n[c];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},58221:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>a,default:()=>d,frontMatter:()=>o,metadata:()=>l,toc:()=>c});var r=n(87462),i=(n(67294),n(3905));const o={id:"index.ClockEvents",title:"Interface: ClockEvents",sidebar_label:"ClockEvents",custom_edit_url:null},a=void 0,l={unversionedId:"framework/interfaces/index.ClockEvents",id:"framework/interfaces/index.ClockEvents",title:"Interface: ClockEvents",description:"index.ClockEvents",source:"@site/docs/framework/interfaces/index.ClockEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.ClockEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.ClockEvents",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.ClockEvents",title:"Interface: ClockEvents",sidebar_label:"ClockEvents",custom_edit_url:null},sidebar:"sidebar",previous:{title:"CircleVector",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.CircleVector"},next:{title:"CollectionComponentProps",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.CollectionComponentProps"}},s={},c=[{value:"Properties",id:"properties",level:2},{value:"realTime",id:"realtime",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"simRate",id:"simrate",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"simTime",id:"simtime",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"simTimeHiFreq",id:"simtimehifreq",level:3},{value:"Defined in",id:"defined-in-3",level:4}],m={toc:c},p="wrapper";function d(e){let{components:t,...n}=e;return(0,i.kt)(p,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".ClockEvents"),(0,i.kt)("p",null,"Events related to the clock."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"realtime"},"realTime"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"realTime"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A Javascript timestamp corresponding to the real-world (operating system) time. The timestamp uses the UNIX epoch\n(00:00 UTC January 1, 1970) and has units of milliseconds."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Clock.ts:14"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"simrate"},"simRate"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"simRate"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The simulation rate factor."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Clock.ts:31"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"simtime"},"simTime"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"simTime"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A Javascript timestamp corresponding to the simulation time. The timestamp uses the UNIX epoch\n(00:00 UTC January 1, 1970) and has units of milliseconds."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Clock.ts:20"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"simtimehifreq"},"simTimeHiFreq"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"simTimeHiFreq"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A Javascript timestamp corresponding to the simulation time, fired every sim frame instead of on each Coherent\nanimation frame. The timestamp uses the UNIX epoch (00:00 UTC January 1, 1970) and has units of milliseconds."),(0,i.kt)("p",null,"USE THIS EVENT SPARINGLY, as it will impact performance and ignores the user set glass cockpit refresh setting."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Clock.ts:28"))}d.isMDXComponent=!0}}]);