"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[82122],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=r.createContext({}),d=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=d(e.components);return r.createElement(c.Provider,{value:t},e.children)},s="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),s=d(n),u=a,m=s["".concat(c,".").concat(u)]||s[u]||f[u]||i;return n?r.createElement(m,o(o({ref:t},p),{},{components:n})):r.createElement(m,o({ref:t},p))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=u;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[s]="string"==typeof e?e:a,o[1]=l;for(var d=2;d<i;d++)o[d]=n[d];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},30895:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>o,default:()=>f,frontMatter:()=>i,metadata:()=>l,toc:()=>d});var r=n(87462),a=(n(67294),n(3905));const i={id:"SetVnavDirectToData",title:"Interface: SetVnavDirectToData",sidebar_label:"SetVnavDirectToData",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"framework/interfaces/SetVnavDirectToData",id:"framework/interfaces/SetVnavDirectToData",title:"Interface: SetVnavDirectToData",description:"The data needed to set a VNAV direct-to.",source:"@site/docs/framework/interfaces/SetVnavDirectToData.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/SetVnavDirectToData",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/SetVnavDirectToData",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"SetVnavDirectToData",title:"Interface: SetVnavDirectToData",sidebar_label:"SetVnavDirectToData",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"ScreenStateEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/ScreenStateEvent"},next:{title:"SimbriefAirport",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/SimbriefAirport"}},c={},d=[{value:"Properties",id:"properties",level:2},{value:"fpa",id:"fpa",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"globalLegIndex",id:"globallegindex",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"planIndex",id:"planindex",level:3},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:d},s="wrapper";function f(e){let{components:t,...n}=e;return(0,a.kt)(s,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"The data needed to set a VNAV direct-to."),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"fpa"},"fpa"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"fpa"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The flight path angle, in degrees, of the VNAV direct-to. If not defined, the default VNAV FPA will be applied.\nIgnored if ",(0,a.kt)("inlineCode",{parentName:"p"},"globalLegIndex")," is negative."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/autopilot/data/VNavControlEvents.ts:19"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"globallegindex"},"globalLegIndex"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"globalLegIndex"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The global index of the flight plan leg containing the VNAV direct-to target constraint. Using a negative index\nwill cancel any existing VNAV direct-to."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/autopilot/data/VNavControlEvents.ts:13"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"planindex"},"planIndex"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"planIndex"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The index of the flight plan for which to set the VNAV direct-to."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/autopilot/data/VNavControlEvents.ts:7"))}f.isMDXComponent=!0}}]);