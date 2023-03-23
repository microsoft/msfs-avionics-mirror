"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[14482],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),o=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=o(e.components);return r.createElement(s.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),m=o(n),k=a,f=m["".concat(s,".").concat(k)]||m[k]||u[k]||i;return n?r.createElement(f,l(l({ref:t},p),{},{components:n})):r.createElement(f,l({ref:t},p))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=k;var d={};for(var s in t)hasOwnProperty.call(t,s)&&(d[s]=t[s]);d.originalType=e,d[m]="string"==typeof e?e:a,l[1]=d;for(var o=2;o<i;o++)l[o]=n[o];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}k.displayName="MDXCreateElement"},56529:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>d,toc:()=>o});var r=n(87462),a=(n(67294),n(3905));const i={id:"index.XPDRInstrument",title:"Class: XPDRInstrument",sidebar_label:"XPDRInstrument",custom_edit_url:null},l=void 0,d={unversionedId:"framework/classes/index.XPDRInstrument",id:"framework/classes/index.XPDRInstrument",title:"Class: XPDRInstrument",description:"index.XPDRInstrument",source:"@site/docs/framework/classes/index.XPDRInstrument.md",sourceDirName:"framework/classes",slug:"/framework/classes/index.XPDRInstrument",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.XPDRInstrument",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.XPDRInstrument",title:"Class: XPDRInstrument",sidebar_label:"XPDRInstrument",custom_edit_url:null},sidebar:"sidebar",previous:{title:"XMLWarningFactory",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.XMLWarningFactory"},next:{title:"XPDRSimVarPublisher",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.XPDRSimVarPublisher"}},s={},o=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"controlSubscriber",id:"controlsubscriber",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"identDebounceTimers",id:"identdebouncetimers",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"simVarPublisher",id:"simvarpublisher",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"transponderCount",id:"transpondercount",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"Methods",id:"methods",level:2},{value:"getXpdrMode",id:"getxpdrmode",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"init",id:"init",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"onUpdate",id:"onupdate",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"sendIdent",id:"sendident",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"setXpdrCode",id:"setxpdrcode",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"setXpdrMode",id:"setxpdrmode",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-11",level:4}],p={toc:o},m="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(m,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".XPDRInstrument"),(0,a.kt)("p",null,"A transponder."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new XPDRInstrument"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"transponderCount?"),")"),(0,a.kt)("p",null,"Create an XPDRInstrument."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.EventBus"},(0,a.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event bus to publish to.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"transponderCount")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"1")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The number of transponders supported by this instrument. Defaults to ",(0,a.kt)("inlineCode",{parentName:"td"},"1"),".")))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/XPDR.ts:60"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"bus"},"bus"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"bus"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.EventBus"},(0,a.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,a.kt)("p",null,"The event bus to publish to."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/XPDR.ts:60"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"controlsubscriber"},"controlSubscriber"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"controlSubscriber"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.EventSubscriber"},(0,a.kt)("inlineCode",{parentName:"a"},"EventSubscriber")),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.ControlEvents"},(0,a.kt)("inlineCode",{parentName:"a"},"ControlEvents")),">"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/XPDR.ts:51"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"identdebouncetimers"},"identDebounceTimers"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"identDebounceTimers"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DebounceTimer"},(0,a.kt)("inlineCode",{parentName:"a"},"DebounceTimer")),"[]"),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/XPDR.ts:53"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"simvarpublisher"},"simVarPublisher"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"simVarPublisher"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.XPDRSimVarPublisher"},(0,a.kt)("inlineCode",{parentName:"a"},"XPDRSimVarPublisher"))),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/XPDR.ts:50"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"transpondercount"},"transponderCount"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"transponderCount"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"1")),(0,a.kt)("p",null,"The number of transponders supported by this instrument. Defaults to ",(0,a.kt)("inlineCode",{parentName:"p"},"1"),"."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/XPDR.ts:60"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"getxpdrmode"},"getXpdrMode"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"getXpdrMode"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"index"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/index.XPDRMode"},(0,a.kt)("inlineCode",{parentName:"a"},"XPDRMode"))),(0,a.kt)("p",null,"Gets xpdr mode from the sim."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index of the transponder.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/index.XPDRMode"},(0,a.kt)("inlineCode",{parentName:"a"},"XPDRMode"))),(0,a.kt)("p",null,"The xpdr mode."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/XPDR.ts:114"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"init"},"init"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"init"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Initialize the instrument."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/XPDR.ts:67"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onupdate"},"onUpdate"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onUpdate"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Perform events for the update loop."),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/XPDR.ts:85"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"sendident"},"sendIdent"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"sendIdent"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"index"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Sends ident to ATC for 18 seconds."),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index of the transponder.")))),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/XPDR.ts:122"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"setxpdrcode"},"setXpdrCode"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"setXpdrCode"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"index"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"code"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Set the transponder code in the sim."),(0,a.kt)("h4",{id:"parameters-3"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index of the transponder.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"code")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The xpdr code.")))),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/XPDR.ts:95"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"setxpdrmode"},"setXpdrMode"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"setXpdrMode"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"index"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"mode"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Set the transponder mode in the sim."),(0,a.kt)("h4",{id:"parameters-4"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index of the transponder.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"mode")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/enums/index.XPDRMode"},(0,a.kt)("inlineCode",{parentName:"a"},"XPDRMode"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The transponder mode.")))),(0,a.kt)("h4",{id:"returns-5"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/XPDR.ts:105"))}u.isMDXComponent=!0}}]);