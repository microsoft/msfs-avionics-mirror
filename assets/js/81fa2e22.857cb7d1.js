"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[49834],{3905:(e,t,r)=>{r.d(t,{Zo:()=>m,kt:()=>k});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var o=a.createContext({}),d=function(e){var t=a.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},m=function(e){var t=d(e.components);return a.createElement(o.Provider,{value:t},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,o=e.parentName,m=s(e,["components","mdxType","originalType","parentName"]),p=d(r),c=n,k=p["".concat(o,".").concat(c)]||p[c]||u[c]||i;return r?a.createElement(k,l(l({ref:t},m),{},{components:r})):a.createElement(k,l({ref:t},m))}));function k(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,l=new Array(i);l[0]=c;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s[p]="string"==typeof e?e:n,l[1]=s;for(var d=2;d<i;d++)l[d]=r[d];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}c.displayName="MDXCreateElement"},57442:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>s,toc:()=>d});var a=r(87462),n=(r(67294),r(3905));const i={id:"index.AuralAlertSystemXmlAdapter",title:"Class: AuralAlertSystemXmlAdapter",sidebar_label:"AuralAlertSystemXmlAdapter",custom_edit_url:null},l=void 0,s={unversionedId:"framework/classes/index.AuralAlertSystemXmlAdapter",id:"framework/classes/index.AuralAlertSystemXmlAdapter",title:"Class: AuralAlertSystemXmlAdapter",description:"index.AuralAlertSystemXmlAdapter",source:"@site/docs/framework/classes/index.AuralAlertSystemXmlAdapter.md",sourceDirName:"framework/classes",slug:"/framework/classes/index.AuralAlertSystemXmlAdapter",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.AuralAlertSystemXmlAdapter",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.AuralAlertSystemXmlAdapter",title:"Class: AuralAlertSystemXmlAdapter",sidebar_label:"AuralAlertSystemXmlAdapter",custom_edit_url:null},sidebar:"sidebar",previous:{title:"AuralAlertSystemWarningAdapter",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.AuralAlertSystemWarningAdapter"},next:{title:"Autopilot",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.Autopilot"}},o={},d=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"alertDefinitions",id:"alertdefinitions",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"auralRegistrationManager",id:"auralregistrationmanager",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"casSystem",id:"cassystem",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"logicHost",id:"logichost",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"publisher",id:"publisher",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"Methods",id:"methods",level:2},{value:"start",id:"start",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-7",level:4}],m={toc:d},p="wrapper";function u(e){let{components:t,...r}=e;return(0,n.kt)(p,(0,a.Z)({},m,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".AuralAlertSystemXmlAdapter"),(0,n.kt)("p",null,"Adapts XML-defined aural alerts to ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AuralAlertSystem"},"AuralAlertSystem"),". Handles the registration of the alerts and management\nof alert state."),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new AuralAlertSystemXmlAdapter"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"logicHost"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"casSystem"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"alertDefsRoot"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"parser"),")"),(0,n.kt)("p",null,"Creates a new instance of AuralAlertSystemXmlAdapter."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"bus")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.EventBus"},(0,n.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"logicHost")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.CompositeLogicXMLHost"},(0,n.kt)("inlineCode",{parentName:"a"},"CompositeLogicXMLHost"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The XML logic host used to run this adapter's XML logic.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"casSystem")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.CasSystem"},(0,n.kt)("inlineCode",{parentName:"a"},"CasSystem"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The CAS system.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"alertDefsRoot")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},"Element")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The root XML document element containing the aural alert definitions to use.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"parser")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.XmlAuralAlertParser"},(0,n.kt)("inlineCode",{parentName:"a"},"XmlAuralAlertParser"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The parser to use to parse alert definitions from the XML document.")))),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemXmlAdapter.ts:287"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"alertdefinitions"},"alertDefinitions"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"alertDefinitions"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/#xmlauralalertdefinition"},(0,n.kt)("inlineCode",{parentName:"a"},"XmlAuralAlertDefinition")),"[]"),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemXmlAdapter.ts:277"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"auralregistrationmanager"},"auralRegistrationManager"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"auralRegistrationManager"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AuralAlertRegistrationManager"},(0,n.kt)("inlineCode",{parentName:"a"},"AuralAlertRegistrationManager"))),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemXmlAdapter.ts:275"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"bus"},"bus"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"bus"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.EventBus"},(0,n.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,n.kt)("p",null,"The event bus."),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemXmlAdapter.ts:288"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"cassystem"},"casSystem"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"casSystem"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.CasSystem"},(0,n.kt)("inlineCode",{parentName:"a"},"CasSystem"))),(0,n.kt)("p",null,"The CAS system."),(0,n.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,n.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemXmlAdapter.ts:290"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"logichost"},"logicHost"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"logicHost"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.CompositeLogicXMLHost"},(0,n.kt)("inlineCode",{parentName:"a"},"CompositeLogicXMLHost"))),(0,n.kt)("p",null,"The XML logic host used to run this adapter's XML logic."),(0,n.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,n.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemXmlAdapter.ts:289"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"publisher"},"publisher"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"publisher"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.Publisher"},(0,n.kt)("inlineCode",{parentName:"a"},"Publisher")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.AuralAlertControlEvents"},(0,n.kt)("inlineCode",{parentName:"a"},"AuralAlertControlEvents")),">"),(0,n.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,n.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemXmlAdapter.ts:273"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"start"},"start"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"start"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Registers this adapter's alerts with ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AuralAlertSystem"},"AuralAlertSystem")," and starts automatically managing alert states."),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,n.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemXmlAdapter.ts:311"))}u.isMDXComponent=!0}}]);