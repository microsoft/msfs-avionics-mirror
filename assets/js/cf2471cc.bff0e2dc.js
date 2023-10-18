"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[30058],{3905:(e,t,n)=>{n.d(t,{Zo:()=>o,kt:()=>f});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),p=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},o=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},u="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,o=d(e,["components","mdxType","originalType","parentName"]),u=p(n),m=r,f=u["".concat(s,".").concat(m)]||u[m]||k[m]||i;return n?a.createElement(f,l(l({ref:t},o),{},{components:n})):a.createElement(f,l({ref:t},o))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=m;var d={};for(var s in t)hasOwnProperty.call(t,s)&&(d[s]=t[s]);d.originalType=e,d[u]="string"==typeof e?e:r,l[1]=d;for(var p=2;p<i;p++)l[p]=n[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},69126:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>k,frontMatter:()=>i,metadata:()=>d,toc:()=>p});var a=n(87462),r=(n(67294),n(3905));const i={id:"TrafficAuralAlertManager",title:"Class: TrafficAuralAlertManager",sidebar_label:"TrafficAuralAlertManager",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"g3000pfd/classes/TrafficAuralAlertManager",id:"g3000pfd/classes/TrafficAuralAlertManager",title:"Class: TrafficAuralAlertManager",description:"A manager which handles registration and activation of aural alerts in response to traffic and resolution",source:"@site/docs/g3000pfd/classes/TrafficAuralAlertManager.md",sourceDirName:"g3000pfd/classes",slug:"/g3000pfd/classes/TrafficAuralAlertManager",permalink:"/msfs-avionics-mirror/docs/g3000pfd/classes/TrafficAuralAlertManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TrafficAuralAlertManager",title:"Class: TrafficAuralAlertManager",sidebar_label:"TrafficAuralAlertManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"TimeInfo",permalink:"/msfs-avionics-mirror/docs/g3000pfd/classes/TimeInfo"},next:{title:"TrafficInsetMap",permalink:"/msfs-avionics-mirror/docs/g3000pfd/classes/TrafficInsetMap"}},s={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"airplaneHeadingTrue",id:"airplaneheadingtrue",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"auralRegistrationManager",id:"auralregistrationmanager",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"isAlive",id:"isalive",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"isInit",id:"isinit",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"publisher",id:"publisher",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"subscriptions",id:"subscriptions",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"taIntruders",id:"taintruders",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"trafficSystem",id:"trafficsystem",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"voice",id:"voice",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"ALTITUDE_AURAL_IDS",id:"altitude_aural_ids",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"BEARING_AURAL_IDS",id:"bearing_aural_ids",level:3},{value:"Type declaration",id:"type-declaration-1",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"DISTANCE_AURAL_IDS",id:"distance_aural_ids",level:3},{value:"Type declaration",id:"type-declaration-2",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"RA_CORRECTIVE_AURAL_IDS",id:"ra_corrective_aural_ids",level:3},{value:"Type declaration",id:"type-declaration-3",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"generateResolutionAdvisorySequence",id:"generateresolutionadvisorysequence",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"generateTrafficAdvisoryAlertSequence",id:"generatetrafficadvisoryalertsequence",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"init",id:"init",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"onIntruderAlertChanged",id:"onintruderalertchanged",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"onIntruderRemoved",id:"onintruderremoved",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"onResolutionAdvisoryCanceled",id:"onresolutionadvisorycanceled",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"onResolutionAdvisoryIssued",id:"onresolutionadvisoryissued",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"onResolutionAdvisoryUpdated",id:"onresolutionadvisoryupdated",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"onTrafficAdvisoryCanceled",id:"ontrafficadvisorycanceled",level:3},{value:"Parameters",id:"parameters-7",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-24",level:4},{value:"onTrafficAdvisoryIssued",id:"ontrafficadvisoryissued",level:3},{value:"Parameters",id:"parameters-8",level:4},{value:"Returns",id:"returns-10",level:4},{value:"Defined in",id:"defined-in-25",level:4},{value:"getTrafficAdvisoryAlias",id:"gettrafficadvisoryalias",level:3},{value:"Parameters",id:"parameters-9",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Defined in",id:"defined-in-26",level:4}],o={toc:p},u="wrapper";function k(e){let{components:t,...n}=e;return(0,r.kt)(u,(0,a.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A manager which handles registration and activation of aural alerts in response to traffic and resolution\nadvisories."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new TrafficAuralAlertManager"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"trafficSystem"),")"),(0,r.kt)("p",null,"Creates a new instance of TrafficAuralAlertManager."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"trafficSystem")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"TrafficSystem")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The traffic system.")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:146"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"airplaneheadingtrue"},"airplaneHeadingTrue"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"airplaneHeadingTrue"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"ConsumerValue"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:130"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"auralregistrationmanager"},"auralRegistrationManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"auralRegistrationManager"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"AuralAlertRegistrationManager")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:128"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"bus"},"bus"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"bus"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,r.kt)("p",null,"The event bus."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:146"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isalive"},"isAlive"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"isAlive"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:136"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isinit"},"isInit"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"isInit"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"false")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:137"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"publisher"},"publisher"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"publisher"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Publisher"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"AuralAlertControlEvents"),">"),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:126"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"subscriptions"},"subscriptions"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"subscriptions"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscription"),"[] = ",(0,r.kt)("inlineCode",{parentName:"p"},"[]")),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:139"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"taintruders"},"taIntruders"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"taIntruders"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Map"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"TcasIntruder"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:132"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"trafficsystem"},"trafficSystem"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"trafficSystem"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"TrafficSystem")),(0,r.kt)("p",null,"The traffic system."),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:146"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"voice"},"voice"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"voice"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"AuralAlertVoiceSetting"),">"),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:134"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"altitude_aural_ids"},"ALTITUDE","_","AURAL","_","IDS"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"ALTITUDE","_","AURAL","_","IDS"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Object")),(0,r.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Female")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string"),"[]")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Male")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string"),"[]")))),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:47"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"bearing_aural_ids"},"BEARING","_","AURAL","_","IDS"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"BEARING","_","AURAL","_","IDS"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Object")),(0,r.kt)("h4",{id:"type-declaration-1"},"Type declaration"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Female")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string"),"[]")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Male")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string"),"[]")))),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:16"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"distance_aural_ids"},"DISTANCE","_","AURAL","_","IDS"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"DISTANCE","_","AURAL","_","IDS"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Object")),(0,r.kt)("h4",{id:"type-declaration-2"},"Type declaration"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Female")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string"),"[]")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Male")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string"),"[]")))),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:60"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ra_corrective_aural_ids"},"RA","_","CORRECTIVE","_","AURAL","_","IDS"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"RA","_","CORRECTIVE","_","AURAL","_","IDS"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Object")),(0,r.kt)("h4",{id:"type-declaration-3"},"Type declaration"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Female")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Partial"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Record"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"TcasResolutionAdvisoryType"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"string")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"string"),"[]",">",">")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Male")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Partial"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Record"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"TcasResolutionAdvisoryType"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"string")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"string"),"[]",">",">")))),(0,r.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:91"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"destroy"},"destroy"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Destroys this manager."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:371"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"generateresolutionadvisorysequence"},"generateResolutionAdvisorySequence"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"generateResolutionAdvisorySequence"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"raHost"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"Object")),(0,r.kt)("p",null,"Generates a sound atom sequence for a resolution advisory."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"raHost")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"TcasResolutionAdvisoryHost")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A host containing information on the resolution advisory.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Object")),(0,r.kt)("p",null,"The sound atom sequence and timeout for a traffic advisory for the specified resolution advisory."),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"sequence")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"string"),"[]"),(0,r.kt)("td",{parentName:"tr",align:"left"},"A sound atom sequence.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"timeout")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A timeout, in milliseconds, for the sequence.")))),(0,r.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:343"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"generatetrafficadvisoryalertsequence"},"generateTrafficAdvisoryAlertSequence"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"generateTrafficAdvisoryAlertSequence"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"intruder"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"Object")),(0,r.kt)("p",null,"Generates a sound atom sequence for a traffic advisory."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"intruder")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"TcasIntruder")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The intruder for which the traffic advisory was issued.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Object")),(0,r.kt)("p",null,"The sound atom sequence and timeout for a traffic advisory for the specified intruder."),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"sequence")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string"),"[]"),(0,r.kt)("td",{parentName:"tr",align:"left"},"A sound atom sequence.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"timeout")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A timeout, in milliseconds, for the sequence.")))),(0,r.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:260"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"init"},"init"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"init"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Initializes this manager. Once this manager is initialized, it will automatically trigger aural alerts in response\nto traffic and resolution advisories."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if this manager has been destroyed."),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:175"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onintruderalertchanged"},"onIntruderAlertChanged"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"onIntruderAlertChanged"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"intruder"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Responds to when the alert level of an intruder changes."),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"intruder")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"TcasIntruder")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The intruder whose alert level changed.")))),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:206"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onintruderremoved"},"onIntruderRemoved"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"onIntruderRemoved"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"intruder"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Responds to when an intruder is removed."),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"intruder")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"TcasIntruder")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The removed intruder.")))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:222"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onresolutionadvisorycanceled"},"onResolutionAdvisoryCanceled"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"onResolutionAdvisoryCanceled"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Responds to when a resolution advisory is canceled."),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:331"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onresolutionadvisoryissued"},"onResolutionAdvisoryIssued"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"onResolutionAdvisoryIssued"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"raHost"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Responds to when a new resolution advisory is issued."),(0,r.kt)("h4",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"raHost")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"TcasResolutionAdvisoryHost")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A host for information on the resolution advisory.")))),(0,r.kt)("h4",{id:"returns-7"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:310"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onresolutionadvisoryupdated"},"onResolutionAdvisoryUpdated"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"onResolutionAdvisoryUpdated"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"raHost"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Responds to when an existing resolution advisory is updated."),(0,r.kt)("h4",{id:"parameters-6"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"raHost")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"TcasResolutionAdvisoryHost")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A host for information on the resolution advisory.")))),(0,r.kt)("h4",{id:"returns-8"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-23"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:320"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ontrafficadvisorycanceled"},"onTrafficAdvisoryCanceled"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"onTrafficAdvisoryCanceled"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"intruder"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Responds to when a traffic advisory is canceled."),(0,r.kt)("h4",{id:"parameters-7"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"intruder")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"TcasIntruder")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The intruder for which the traffic advisory was canceled.")))),(0,r.kt)("h4",{id:"returns-9"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-24"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:245"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ontrafficadvisoryissued"},"onTrafficAdvisoryIssued"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"onTrafficAdvisoryIssued"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"intruder"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Responds to when a new traffic advisory is issued."),(0,r.kt)("h4",{id:"parameters-8"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"intruder")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"TcasIntruder")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The intruder for which the traffic advisory was issued.")))),(0,r.kt)("h4",{id:"returns-10"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-25"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:232"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"gettrafficadvisoryalias"},"getTrafficAdvisoryAlias"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"getTrafficAdvisoryAlias"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"intruder"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("p",null,"Gets an aural alert alias for a traffic advisory."),(0,r.kt)("h4",{id:"parameters-9"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"intruder")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"TcasIntruder")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The intruder for which the traffic advisory was issued.")))),(0,r.kt)("h4",{id:"returns-11"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("p",null,"An aural alert alias for a traffic advisory for the specified intruder."),(0,r.kt)("h4",{id:"defined-in-26"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Traffic/TrafficAuralAlertManager.ts:386"))}k.isMDXComponent=!0}}]);