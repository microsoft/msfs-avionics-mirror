"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[54385],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>k});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var o=n.createContext({}),d=function(e){var t=n.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=d(e.components);return n.createElement(o.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,o=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=d(r),c=a,k=u["".concat(o,".").concat(c)]||u[c]||m[c]||i;return r?n.createElement(k,l(l({ref:t},p),{},{components:r})):n.createElement(k,l({ref:t},p))}));function k(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,l=new Array(i);l[0]=c;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s[u]="string"==typeof e?e:a,l[1]=s;for(var d=2;d<i;d++)l[d]=r[d];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},84666:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>m,frontMatter:()=>i,metadata:()=>s,toc:()=>d});var n=r(87462),a=(r(67294),r(3905));const i={id:"index.AuralAlertSystemWarningAdapter",title:"Class: AuralAlertSystemWarningAdapter",sidebar_label:"AuralAlertSystemWarningAdapter",custom_edit_url:null},l=void 0,s={unversionedId:"framework/classes/index.AuralAlertSystemWarningAdapter",id:"framework/classes/index.AuralAlertSystemWarningAdapter",title:"Class: AuralAlertSystemWarningAdapter",description:"index.AuralAlertSystemWarningAdapter",source:"@site/docs/framework/classes/index.AuralAlertSystemWarningAdapter.md",sourceDirName:"framework/classes",slug:"/framework/classes/index.AuralAlertSystemWarningAdapter",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.AuralAlertSystemWarningAdapter",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.AuralAlertSystemWarningAdapter",title:"Class: AuralAlertSystemWarningAdapter",sidebar_label:"AuralAlertSystemWarningAdapter",custom_edit_url:null},sidebar:"sidebar",previous:{title:"AuralAlertSystem",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.AuralAlertSystem"},next:{title:"AuralAlertSystemXmlAdapter",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.AuralAlertSystemXmlAdapter"}},o={},d=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"auralRegistrationManager",id:"auralregistrationmanager",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"logicHost",id:"logichost",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"publisher",id:"publisher",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"queue",id:"queue",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"warnings",id:"warnings",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"Methods",id:"methods",level:2},{value:"start",id:"start",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-7",level:4}],p={toc:d},u="wrapper";function m(e){let{components:t,...r}=e;return(0,a.kt)(u,(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".AuralAlertSystemWarningAdapter"),(0,a.kt)("p",null,"Adapts ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.Warning"},"Warning")," to ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AuralAlertSystem"},"AuralAlertSystem"),". Given a list of warnings, the adapter will register one aural\nalert for each warning that defines a ",(0,a.kt)("inlineCode",{parentName:"p"},"soundId"),". Alerts are set to repeat while active unless the warning is defined\nto play only once. The adapter also manages activation/deactivation of the alerts using the condition logic of their\nassociated warnings. All alerts are assigned to the same queue."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new AuralAlertSystemWarningAdapter"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"logicHost"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"warnings"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"queue"),")"),(0,a.kt)("p",null,"Creates a new instance of AuralAlertSystemWarningAdapter."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.EventBus"},(0,a.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"logicHost")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.CompositeLogicXMLHost"},(0,a.kt)("inlineCode",{parentName:"a"},"CompositeLogicXMLHost"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The XML logic host used to run this adapter's warning condition logic.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"warnings")),(0,a.kt)("td",{parentName:"tr",align:"left"},"readonly ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.Warning"},(0,a.kt)("inlineCode",{parentName:"a"},"Warning")),"[]"),(0,a.kt)("td",{parentName:"tr",align:"left"},"This adapter's warnings, in order of decreasing priority.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"queue")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The aural alert queue to assign this adapter's alerts.")))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemWarningAdapter.ts:26"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"auralregistrationmanager"},"auralRegistrationManager"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"auralRegistrationManager"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AuralAlertRegistrationManager"},(0,a.kt)("inlineCode",{parentName:"a"},"AuralAlertRegistrationManager"))),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemWarningAdapter.ts:17"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"bus"},"bus"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"bus"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.EventBus"},(0,a.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,a.kt)("p",null,"The event bus."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemWarningAdapter.ts:27"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"logichost"},"logicHost"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"logicHost"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.CompositeLogicXMLHost"},(0,a.kt)("inlineCode",{parentName:"a"},"CompositeLogicXMLHost"))),(0,a.kt)("p",null,"The XML logic host used to run this adapter's warning condition logic."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemWarningAdapter.ts:28"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"publisher"},"publisher"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"publisher"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.Publisher"},(0,a.kt)("inlineCode",{parentName:"a"},"Publisher")),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.AuralAlertControlEvents"},(0,a.kt)("inlineCode",{parentName:"a"},"AuralAlertControlEvents")),">"),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemWarningAdapter.ts:15"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"queue"},"queue"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"queue"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"The aural alert queue to assign this adapter's alerts."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemWarningAdapter.ts:30"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"warnings"},"warnings"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"warnings"),": readonly ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.Warning"},(0,a.kt)("inlineCode",{parentName:"a"},"Warning")),"[]"),(0,a.kt)("p",null,"This adapter's warnings, in order of decreasing priority."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemWarningAdapter.ts:29"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"start"},"start"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"start"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Registers this adapter's alerts with ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AuralAlertSystem"},"AuralAlertSystem")," and starts automatically managing alert states."),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/sound/AuralAlertSystemWarningAdapter.ts:38"))}m.isMDXComponent=!0}}]);