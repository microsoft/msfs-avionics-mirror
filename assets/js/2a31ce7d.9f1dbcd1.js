"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[3064],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>p});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=r.createContext({}),s=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},m=function(e){var t=s(e.components);return r.createElement(c.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,c=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),u=s(n),f=i,p=u["".concat(c,".").concat(f)]||u[f]||d[f]||o;return n?r.createElement(p,a(a({ref:t},m),{},{components:n})):r.createElement(p,a({ref:t},m))}));function p(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=f;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[u]="string"==typeof e?e:i,a[1]=l;for(var s=2;s<o;s++)a[s]=n[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},72872:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>a,default:()=>d,frontMatter:()=>o,metadata:()=>l,toc:()=>s});var r=n(87462),i=(n(67294),n(3905));const o={id:"FmcPageLifecyclePolicy",title:"Enumeration: FmcPageLifecyclePolicy",sidebar_label:"FmcPageLifecyclePolicy",sidebar_position:0,custom_edit_url:null},a=void 0,l={unversionedId:"framework/enums/FmcPageLifecyclePolicy",id:"framework/enums/FmcPageLifecyclePolicy",title:"Enumeration: FmcPageLifecyclePolicy",description:"Represents possible lifetimes for FmcPages",source:"@site/docs/framework/enums/FmcPageLifecyclePolicy.md",sourceDirName:"framework/enums",slug:"/framework/enums/FmcPageLifecyclePolicy",permalink:"/msfs-avionics-mirror/docs/framework/enums/FmcPageLifecyclePolicy",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FmcPageLifecyclePolicy",title:"Enumeration: FmcPageLifecyclePolicy",sidebar_label:"FmcPageLifecyclePolicy",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightTimerMode",permalink:"/msfs-avionics-mirror/docs/framework/enums/FlightTimerMode"},next:{title:"FocusPosition",permalink:"/msfs-avionics-mirror/docs/framework/enums/FocusPosition"}},c={},s=[{value:"Enumeration Members",id:"enumeration-members",level:2},{value:"Singleton",id:"singleton",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Transient",id:"transient",level:3},{value:"Defined in",id:"defined-in-1",level:4}],m={toc:s},u="wrapper";function d(e){let{components:t,...n}=e;return(0,i.kt)(u,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Represents possible lifetimes for FmcPages"),(0,i.kt)("h2",{id:"enumeration-members"},"Enumeration Members"),(0,i.kt)("h3",{id:"singleton"},"Singleton"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"Singleton")," = ",(0,i.kt)("inlineCode",{parentName:"p"},"0")),(0,i.kt)("p",null,"Page is only created and initialized once, the first time it is navigated to, the reloaded and resumed."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/AbstractFmcPage.ts:22"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"transient"},"Transient"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"Transient")," = ",(0,i.kt)("inlineCode",{parentName:"p"},"1")),(0,i.kt)("p",null,"Page is re-created and re-initialized every time it is navigated to."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/AbstractFmcPage.ts:27"))}d.isMDXComponent=!0}}]);