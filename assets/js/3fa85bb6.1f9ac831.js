"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[19869],{3905:(e,t,n)=>{n.d(t,{Zo:()=>o,kt:()=>c});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function d(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=a.createContext({}),m=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):d(d({},t),e)),n},o=function(e){var t=m(e.components);return a.createElement(p.Provider,{value:t},e.children)},s="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},N=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,p=e.parentName,o=l(e,["components","mdxType","originalType","parentName"]),s=m(n),N=i,c=s["".concat(p,".").concat(N)]||s[N]||k[N]||r;return n?a.createElement(c,d(d({ref:t},o),{},{components:n})):a.createElement(c,d({ref:t},o))}));function c(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,d=new Array(r);d[0]=N;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[s]="string"==typeof e?e:i,d[1]=l;for(var m=2;m<r;m++)d[m]=n[m];return a.createElement.apply(null,d)}return a.createElement.apply(null,n)}N.displayName="MDXCreateElement"},79329:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>d,default:()=>k,frontMatter:()=>r,metadata:()=>l,toc:()=>m});var a=n(87462),i=(n(67294),n(3905));const r={id:"TasSensitivity",title:"Class: TasSensitivity",sidebar_label:"TasSensitivity",sidebar_position:0,custom_edit_url:null},d=void 0,l={unversionedId:"garminsdk/classes/TasSensitivity",id:"garminsdk/classes/TasSensitivity",title:"Class: TasSensitivity",description:"An implementation of TCASSensitivity which provides sensitivity parameters for the Garmin Traffic Advisory",source:"@site/docs/garminsdk/classes/TasSensitivity.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/TasSensitivity",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/TasSensitivity",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TasSensitivity",title:"Class: TasSensitivity",sidebar_label:"TasSensitivity",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"SyntheticVision",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/SyntheticVision"},next:{title:"TasSensitivityParameters",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/TasSensitivityParameters"}},p={},m=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Properties",id:"properties",level:2},{value:"activeParams",id:"activeparams",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"adsbParams",id:"adsbparams",level:3},{value:"Type declaration",id:"type-declaration-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"adsbTASensitivity",id:"adsbtasensitivity",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"tasParams",id:"tasparams",level:3},{value:"Type declaration",id:"type-declaration-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"tasSensitivity",id:"tassensitivity",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"Methods",id:"methods",level:2},{value:"selectParameters",id:"selectparameters",level:3},{value:"Returns",id:"returns",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"selectRAAlim",id:"selectraalim",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"update",id:"update",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-7",level:4}],o={toc:m},s="wrapper";function k(e){let{components:t,...n}=e;return(0,i.kt)(s,(0,a.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"An implementation of TCASSensitivity which provides sensitivity parameters for the Garmin Traffic Advisory\nSystem (TAS). When ADS-B is operating, Traffic Advisory sensitivity is selected based on the ADS-B Conflict\nSituational Awareness (CSA) algorithm. When ADS-B is not operating, Traffic Advisory sensitivity is selected based\non the TAS algorithm."),(0,i.kt)("h2",{id:"implements"},"Implements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"TcasSensitivity"))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new TasSensitivity"),"()"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"activeparams"},"activeParams"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("strong",{parentName:"p"},"activeParams"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Object")),(0,i.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersPA")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"TcasAdvisoryParameters"))),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA")),(0,i.kt)("td",{parentName:"tr",align:"left"},"{ ",(0,i.kt)("inlineCode",{parentName:"td"},"alim"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"," ; ",(0,i.kt)("inlineCode",{parentName:"td"},"protectedHeight"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"," ; ",(0,i.kt)("inlineCode",{parentName:"td"},"protectedRadius"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"," ; ",(0,i.kt)("inlineCode",{parentName:"td"},"tau"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Duration"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Duration"),">",">","  }")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA.alim")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA.protectedHeight")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA.protectedRadius")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA.tau")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Duration"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Duration"),">",">")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersTA")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"TcasTcaParameters"))))),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"garminsdk/traffic/TrafficAdvisorySystem.ts:262"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"adsbparams"},"adsbParams"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"adsbParams"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Object")),(0,i.kt)("h4",{id:"type-declaration-1"},"Type declaration"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersPA")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"TcasAdvisoryParameters"))),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA")),(0,i.kt)("td",{parentName:"tr",align:"left"},"{ ",(0,i.kt)("inlineCode",{parentName:"td"},"alim"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"," ; ",(0,i.kt)("inlineCode",{parentName:"td"},"protectedHeight"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"," ; ",(0,i.kt)("inlineCode",{parentName:"td"},"protectedRadius"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"," ; ",(0,i.kt)("inlineCode",{parentName:"td"},"tau"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Duration"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Duration"),">",">","  }")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA.alim")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA.protectedHeight")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA.protectedRadius")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA.tau")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Duration"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Duration"),">",">")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersTA")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"TcasTcaParameters"))))),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"garminsdk/traffic/TrafficAdvisorySystem.ts:249"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"adsbtasensitivity"},"adsbTASensitivity"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"adsbTASensitivity"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/AdsbSensitivityParameters"},(0,i.kt)("inlineCode",{parentName:"a"},"AdsbSensitivityParameters"))),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"garminsdk/traffic/TrafficAdvisorySystem.ts:233"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"tasparams"},"tasParams"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"tasParams"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Object")),(0,i.kt)("h4",{id:"type-declaration-2"},"Type declaration"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersPA")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"TcasAdvisoryParameters"))),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA")),(0,i.kt)("td",{parentName:"tr",align:"left"},"{ ",(0,i.kt)("inlineCode",{parentName:"td"},"alim"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"," ; ",(0,i.kt)("inlineCode",{parentName:"td"},"protectedHeight"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"," ; ",(0,i.kt)("inlineCode",{parentName:"td"},"protectedRadius"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"," ; ",(0,i.kt)("inlineCode",{parentName:"td"},"tau"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Duration"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Duration"),">",">","  }")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA.alim")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA.protectedHeight")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA.protectedRadius")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersRA.tau")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Duration"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"SimpleUnit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Duration"),">",">")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"parametersTA")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"TcasTcaParameters"))))),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"garminsdk/traffic/TrafficAdvisorySystem.ts:236"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"tassensitivity"},"tasSensitivity"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"tasSensitivity"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/TasSensitivityParameters"},(0,i.kt)("inlineCode",{parentName:"a"},"TasSensitivityParameters"))),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"garminsdk/traffic/TrafficAdvisorySystem.ts:234"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"selectparameters"},"selectParameters"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"selectParameters"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"TcasSensitivityParameters")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"TcasSensitivityParameters")),(0,i.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,i.kt)("p",null,"TcasSensitivity.selectParameters"),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"garminsdk/traffic/TrafficAdvisorySystem.ts:265"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"selectraalim"},"selectRAAlim"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"selectRAAlim"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),">",">"),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Distance"),">",">"),(0,i.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,i.kt)("p",null,"TcasSensitivity.selectRAAlim"),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"garminsdk/traffic/TrafficAdvisorySystem.ts:270"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"update"},"update"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"update"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"adsbMode"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"altitude"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"groundSpeed"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"cdiScalingLabel"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"radarAltitude?"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Updates the sensitivity."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"adsbMode")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"AdsbOperatingMode")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The ADS-B operating mode.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"altitude")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnitInterface"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"Unit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"),(0,i.kt)("td",{parentName:"tr",align:"left"},"The indicated altitude of the own airplane.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"groundSpeed")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnitInterface"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Speed"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"Unit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Speed"),">",">"),(0,i.kt)("td",{parentName:"tr",align:"left"},"The ground speed of the own airplane.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"cdiScalingLabel")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/CDIScaleLabel"},(0,i.kt)("inlineCode",{parentName:"a"},"CDIScaleLabel"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The CDI scaling sensitivity of the own airplane.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"radarAltitude?")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"NumberUnitInterface"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"Unit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"),(0,i.kt)("td",{parentName:"tr",align:"left"},"The radar altitude of the own airplane.")))),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"garminsdk/traffic/TrafficAdvisorySystem.ts:282"))}k.isMDXComponent=!0}}]);