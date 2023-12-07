"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[75702],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>f});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},l=Object.keys(e);for(a=0;a<l.length;a++)r=l[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)r=l[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var o=a.createContext({}),m=function(e){var t=a.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},d=function(e){var t=m(e.components);return a.createElement(o.Provider,{value:t},e.children)},p="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,l=e.originalType,o=e.parentName,d=i(e,["components","mdxType","originalType","parentName"]),p=m(r),u=n,f=p["".concat(o,".").concat(u)]||p[u]||c[u]||l;return r?a.createElement(f,s(s({ref:t},d),{},{components:r})):a.createElement(f,s({ref:t},d))}));function f(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var l=r.length,s=new Array(l);s[0]=u;var i={};for(var o in t)hasOwnProperty.call(t,o)&&(i[o]=t[o]);i.originalType=e,i[p]="string"==typeof e?e:n,s[1]=i;for(var m=2;m<l;m++)s[m]=r[m];return a.createElement.apply(null,s)}return a.createElement.apply(null,r)}u.displayName="MDXCreateElement"},50383:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>o,contentTitle:()=>s,default:()=>c,frontMatter:()=>l,metadata:()=>i,toc:()=>m});var a=r(87462),n=(r(67294),r(3905));const l={id:"AuralAlertSystemXmlAdapter",title:"Class: AuralAlertSystemXmlAdapter",sidebar_label:"AuralAlertSystemXmlAdapter",sidebar_position:0,custom_edit_url:null},s=void 0,i={unversionedId:"framework/classes/AuralAlertSystemXmlAdapter",id:"framework/classes/AuralAlertSystemXmlAdapter",title:"Class: AuralAlertSystemXmlAdapter",description:"Adapts XML-defined aural alerts to AuralAlertSystem. Handles the registration of the alerts and management",source:"@site/docs/framework/classes/AuralAlertSystemXmlAdapter.md",sourceDirName:"framework/classes",slug:"/framework/classes/AuralAlertSystemXmlAdapter",permalink:"/msfs-avionics-mirror/docs/framework/classes/AuralAlertSystemXmlAdapter",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AuralAlertSystemXmlAdapter",title:"Class: AuralAlertSystemXmlAdapter",sidebar_label:"AuralAlertSystemXmlAdapter",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AuralAlertSystemWarningAdapter",permalink:"/msfs-avionics-mirror/docs/framework/classes/AuralAlertSystemWarningAdapter"},next:{title:"Autopilot",permalink:"/msfs-avionics-mirror/docs/framework/classes/Autopilot"}},o={},m=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"start",id:"start",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-1",level:4}],d={toc:m},p="wrapper";function c(e){let{components:t,...r}=e;return(0,n.kt)(p,(0,a.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Adapts XML-defined aural alerts to ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AuralAlertSystem"},"AuralAlertSystem"),". Handles the registration of the alerts and management\nof alert state."),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new AuralAlertSystemXmlAdapter"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"logicHost"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"casSystem"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"alertDefsRoot"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"parser"),")"),(0,n.kt)("p",null,"Creates a new instance of AuralAlertSystemXmlAdapter."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"bus")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/EventBus"},(0,n.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"logicHost")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/CompositeLogicXMLHost"},(0,n.kt)("inlineCode",{parentName:"a"},"CompositeLogicXMLHost"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The XML logic host used to run this adapter's XML logic.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"casSystem")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/CasSystem"},(0,n.kt)("inlineCode",{parentName:"a"},"CasSystem"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The CAS system.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"alertDefsRoot")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},"Element")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The root XML document element containing the aural alert definitions to use.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"parser")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/XmlAuralAlertParser"},(0,n.kt)("inlineCode",{parentName:"a"},"XmlAuralAlertParser"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The parser to use to parse alert definitions from the XML document.")))),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemXmlAdapter.ts:287"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"start"},"start"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"start"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Registers this adapter's alerts with ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AuralAlertSystem"},"AuralAlertSystem")," and starts automatically managing alert states."),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemXmlAdapter.ts:311"))}c.isMDXComponent=!0}}]);