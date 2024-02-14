"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[82122],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>v});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=r.createContext({}),p=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},d=function(e){var t=p(e.components);return r.createElement(c.Provider,{value:t},e.children)},s="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,c=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),s=p(n),u=i,v=s["".concat(c,".").concat(u)]||s[u]||f[u]||a;return n?r.createElement(v,o(o({ref:t},d),{},{components:n})):r.createElement(v,o({ref:t},d))}));function v(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=u;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[s]="string"==typeof e?e:i,o[1]=l;for(var p=2;p<a;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},30895:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>o,default:()=>f,frontMatter:()=>a,metadata:()=>l,toc:()=>p});var r=n(87462),i=(n(67294),n(3905));const a={id:"SetVnavDirectToData",title:"Interface: SetVnavDirectToData",sidebar_label:"SetVnavDirectToData",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"framework/interfaces/SetVnavDirectToData",id:"framework/interfaces/SetVnavDirectToData",title:"Interface: SetVnavDirectToData",description:"Data describing how to set a VNAV direct-to.",source:"@site/docs/framework/interfaces/SetVnavDirectToData.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/SetVnavDirectToData",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/SetVnavDirectToData",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"SetVnavDirectToData",title:"Interface: SetVnavDirectToData",sidebar_label:"SetVnavDirectToData",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"ScreenStateEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/ScreenStateEvent"},next:{title:"SimbriefAirport",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/SimbriefAirport"}},c={},p=[{value:"Properties",id:"properties",level:2},{value:"fpa",id:"fpa",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"globalLegIndex",id:"globallegindex",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"planIndex",id:"planindex",level:3},{value:"Defined in",id:"defined-in-2",level:4}],d={toc:p},s="wrapper";function f(e){let{components:t,...n}=e;return(0,i.kt)(s,(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Data describing how to set a VNAV direct-to."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"fpa"},"fpa"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"fpa"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The flight path angle, in degrees, of the VNAV direct-to. If not defined, the default VNAV FPA will be applied.\nIgnored if ",(0,i.kt)("inlineCode",{parentName:"p"},"globalLegIndex")," is negative."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/vnav/VNavControlEvents.ts:21"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"globallegindex"},"globalLegIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"globalLegIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The global index of the flight plan leg containing the VNAV direct-to target constraint. Using a negative index\nwill cancel any existing VNAV direct-to."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/vnav/VNavControlEvents.ts:15"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"planindex"},"planIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"planIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The index of the flight plan for which to set the VNAV direct-to."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/vnav/VNavControlEvents.ts:9"))}f.isMDXComponent=!0}}]);