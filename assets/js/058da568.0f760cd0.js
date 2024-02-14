"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[52459],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>c});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},l=Object.keys(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=r.createContext({}),m=function(e){var t=r.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=m(e.components);return r.createElement(o.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,o=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),d=m(n),k=a,c=d["".concat(o,".").concat(k)]||d[k]||u[k]||l;return n?r.createElement(c,i(i({ref:t},p),{},{components:n})):r.createElement(c,i({ref:t},p))}));function c(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,i=new Array(l);i[0]=k;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s[d]="string"==typeof e?e:a,i[1]=s;for(var m=2;m<l;m++)i[m]=n[m];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}k.displayName="MDXCreateElement"},81539:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>i,default:()=>u,frontMatter:()=>l,metadata:()=>s,toc:()=>m});var r=n(87462),a=(n(67294),n(3905));const l={id:"AlertsSubject",title:"Class: AlertsSubject",sidebar_label:"AlertsSubject",sidebar_position:0,custom_edit_url:null},i=void 0,s={unversionedId:"g1000common/classes/AlertsSubject",id:"g1000common/classes/AlertsSubject",title:"Class: AlertsSubject",description:"A subject that tracks G1000 alert messages.",source:"@site/docs/g1000common/classes/AlertsSubject.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/AlertsSubject",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/AlertsSubject",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AlertsSubject",title:"Class: AlertsSubject",sidebar_label:"AlertsSubject",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"Alerts",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/Alerts"},next:{title:"Altimeter",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/Altimeter"}},o={},m=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Accessors",id:"accessors",level:2},{value:"length",id:"length",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"get",id:"get",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"getArray",id:"getarray",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"sub",id:"sub",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"tryGet",id:"tryget",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"unsub",id:"unsub",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Implementation of",id:"implementation-of-5",level:4},{value:"Defined in",id:"defined-in-6",level:4}],p={toc:m},d="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(d,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A subject that tracks G1000 alert messages."),(0,a.kt)("h2",{id:"implements"},"Implements"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"SubscribableArray"),"<",(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/AlertMessage"},(0,a.kt)("inlineCode",{parentName:"a"},"AlertMessage")),">")),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new AlertsSubject"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/AlertsSubject"},(0,a.kt)("inlineCode",{parentName:"a"},"AlertsSubject"))),(0,a.kt)("p",null,"Creates an instance of a AlertsSubject."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,a.kt)("td",{parentName:"tr",align:"left"},"An instance of the event bus.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/AlertsSubject"},(0,a.kt)("inlineCode",{parentName:"a"},"AlertsSubject"))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/UI/Alerts/AlertsSubject.ts:51"),(0,a.kt)("h2",{id:"accessors"},"Accessors"),(0,a.kt)("h3",{id:"length"},"length"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"get")," ",(0,a.kt)("strong",{parentName:"p"},"length"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,a.kt)("p",null,"SubscribableArray.length"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/UI/Alerts/AlertsSubject.ts:113"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"get"},"get"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"get"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"index"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/AlertMessage"},(0,a.kt)("inlineCode",{parentName:"a"},"AlertMessage"))),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number"))))),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/AlertMessage"},(0,a.kt)("inlineCode",{parentName:"a"},"AlertMessage"))),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,a.kt)("p",null,"SubscribableArray.get"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/UI/Alerts/AlertsSubject.ts:118"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"getarray"},"getArray"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"getArray"),"(): readonly ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/AlertMessage"},(0,a.kt)("inlineCode",{parentName:"a"},"AlertMessage")),"[]"),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,"readonly ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/AlertMessage"},(0,a.kt)("inlineCode",{parentName:"a"},"AlertMessage")),"[]"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,a.kt)("p",null,"SubscribableArray.getArray"),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/UI/Alerts/AlertsSubject.ts:128"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"sub"},"sub"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"sub"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"handler"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"initialNotify?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Default value"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"handler")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"SubscribableArrayHandler"),"<",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/AlertMessage"},(0,a.kt)("inlineCode",{parentName:"a"},"AlertMessage")),">"),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"initialNotify")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"false"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"paused")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"false"))))),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-3"},"Implementation of"),(0,a.kt)("p",null,"SubscribableArray.sub"),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/UI/Alerts/AlertsSubject.ts:133"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"tryget"},"tryGet"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"tryGet"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"index"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/AlertMessage"},(0,a.kt)("inlineCode",{parentName:"a"},"AlertMessage"))),(0,a.kt)("h4",{id:"parameters-3"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number"))))),(0,a.kt)("h4",{id:"returns-5"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/AlertMessage"},(0,a.kt)("inlineCode",{parentName:"a"},"AlertMessage"))),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-4"},"Implementation of"),(0,a.kt)("p",null,"SubscribableArray.tryGet"),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/UI/Alerts/AlertsSubject.ts:123"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"unsub"},"unsub"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"unsub"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"handler"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"parameters-4"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"handler")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"SubscribableArrayHandler"),"<",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/AlertMessage"},(0,a.kt)("inlineCode",{parentName:"a"},"AlertMessage")),">")))),(0,a.kt)("h4",{id:"returns-6"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-5"},"Implementation of"),(0,a.kt)("p",null,"SubscribableArray.unsub"),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/UI/Alerts/AlertsSubject.ts:138"))}u.isMDXComponent=!0}}]);