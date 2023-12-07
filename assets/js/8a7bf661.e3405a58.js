"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[82271],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>f});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),m=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},d=function(e){var t=m(e.components);return r.createElement(l.Provider,{value:t},e.children)},u="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),u=m(n),c=a,f=u["".concat(l,".").concat(c)]||u[c]||p[c]||i;return n?r.createElement(f,s(s({ref:t},d),{},{components:n})):r.createElement(f,s({ref:t},d))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,s=new Array(i);s[0]=c;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[u]="string"==typeof e?e:a,s[1]=o;for(var m=2;m<i;m++)s[m]=n[m];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},30501:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>s,default:()=>p,frontMatter:()=>i,metadata:()=>o,toc:()=>m});var r=n(87462),a=(n(67294),n(3905));const i={id:"APRadioNavInstrument",title:"Class: APRadioNavInstrument",sidebar_label:"APRadioNavInstrument",sidebar_position:0,custom_edit_url:null},s=void 0,o={unversionedId:"framework/classes/APRadioNavInstrument",id:"framework/classes/APRadioNavInstrument",title:"Class: APRadioNavInstrument",description:"An instrument that gathers localizer and glideslope information for use by",source:"@site/docs/framework/classes/APRadioNavInstrument.md",sourceDirName:"framework/classes",slug:"/framework/classes/APRadioNavInstrument",permalink:"/msfs-avionics-mirror/docs/framework/classes/APRadioNavInstrument",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"APRadioNavInstrument",title:"Class: APRadioNavInstrument",sidebar_label:"APRadioNavInstrument",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"APPitchLvlDirector",permalink:"/msfs-avionics-mirror/docs/framework/classes/APPitchLvlDirector"},next:{title:"APRollDirector",permalink:"/msfs-avionics-mirror/docs/framework/classes/APRollDirector"}},l={},m=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"init",id:"init",level:3},{value:"Returns",id:"returns",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"onUpdate",id:"onupdate",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4}],d={toc:m},u="wrapper";function p(e){let{components:t,...n}=e;return(0,a.kt)(u,(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"An instrument that gathers localizer and glideslope information for use by\nthe AP systems."),(0,a.kt)("p",null,"Requires that the topics defined in ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/NavComEvents"},"NavComEvents")," are published to the event bus."),(0,a.kt)("h2",{id:"implements"},"Implements"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/interfaces/Instrument"},(0,a.kt)("inlineCode",{parentName:"a"},"Instrument")))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new APRadioNavInstrument"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),")"),(0,a.kt)("p",null,"Creates an instance of the APRadioNavInstrument."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/EventBus"},(0,a.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event bus to use with this instance.")))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/APRadioNavInstrument.ts:136"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"init"},"init"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"init"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Initializes this instrument."),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Instrument"},"Instrument"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Instrument#init"},"init")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/APRadioNavInstrument.ts:141"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onupdate"},"onUpdate"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onUpdate"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Updates this instrument."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Instrument"},"Instrument"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Instrument#onupdate"},"onUpdate")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/APRadioNavInstrument.ts:180"))}p.isMDXComponent=!0}}]);