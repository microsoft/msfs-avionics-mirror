"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[30058],{3905:(e,t,r)=>{r.d(t,{Zo:()=>f,kt:()=>m});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var o=a.createContext({}),c=function(e){var t=a.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},f=function(e){var t=c(e.components);return a.createElement(o.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},p=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,o=e.parentName,f=s(e,["components","mdxType","originalType","parentName"]),d=c(r),p=n,m=d["".concat(o,".").concat(p)]||d[p]||u[p]||i;return r?a.createElement(m,l(l({ref:t},f),{},{components:r})):a.createElement(m,l({ref:t},f))}));function m(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,l=new Array(i);l[0]=p;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s[d]="string"==typeof e?e:n,l[1]=s;for(var c=2;c<i;c++)l[c]=r[c];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}p.displayName="MDXCreateElement"},69126:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>s,toc:()=>c});var a=r(87462),n=(r(67294),r(3905));const i={id:"TrafficAuralAlertManager",title:"Class: TrafficAuralAlertManager",sidebar_label:"TrafficAuralAlertManager",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"g3000pfd/classes/TrafficAuralAlertManager",id:"g3000pfd/classes/TrafficAuralAlertManager",title:"Class: TrafficAuralAlertManager",description:"A manager which handles registration and activation of aural alerts in response to traffic and resolution",source:"@site/docs/g3000pfd/classes/TrafficAuralAlertManager.md",sourceDirName:"g3000pfd/classes",slug:"/g3000pfd/classes/TrafficAuralAlertManager",permalink:"/msfs-avionics-mirror/docs/g3000pfd/classes/TrafficAuralAlertManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TrafficAuralAlertManager",title:"Class: TrafficAuralAlertManager",sidebar_label:"TrafficAuralAlertManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"TimeInfo",permalink:"/msfs-avionics-mirror/docs/g3000pfd/classes/TimeInfo"},next:{title:"TrafficInsetMap",permalink:"/msfs-avionics-mirror/docs/g3000pfd/classes/TrafficInsetMap"}},o={},c=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"init",id:"init",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4}],f={toc:c},d="wrapper";function u(e){let{components:t,...r}=e;return(0,n.kt)(d,(0,a.Z)({},f,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A manager which handles registration and activation of aural alerts in response to traffic and resolution\nadvisories."),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new TrafficAuralAlertManager"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"trafficSystem"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/classes/TrafficAuralAlertManager"},(0,n.kt)("inlineCode",{parentName:"a"},"TrafficAuralAlertManager"))),(0,n.kt)("p",null,"Creates a new instance of TrafficAuralAlertManager."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"bus")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"trafficSystem")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"TrafficSystem")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The traffic system.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/classes/TrafficAuralAlertManager"},(0,n.kt)("inlineCode",{parentName:"a"},"TrafficAuralAlertManager"))),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:146"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"destroy"},"destroy"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Destroys this manager."),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:371"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"init"},"init"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"init"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Initializes this manager. Once this manager is initialized, it will automatically trigger aural alerts in response\nto traffic and resolution advisories."),(0,n.kt)("h4",{id:"returns-2"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,n.kt)("p",null,"Error if this manager has been destroyed."),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:175"))}u.isMDXComponent=!0}}]);