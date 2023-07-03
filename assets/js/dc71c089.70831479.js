"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[45040],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>f});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function d(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},l=Object.keys(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var o=i.createContext({}),p=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):d(d({},t),e)),n},s=function(e){var t=p(e.components);return i.createElement(o.Provider,{value:t},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},k=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,l=e.originalType,o=e.parentName,s=a(e,["components","mdxType","originalType","parentName"]),c=p(n),k=r,f=c["".concat(o,".").concat(k)]||c[k]||u[k]||l;return n?i.createElement(f,d(d({ref:t},s),{},{components:n})):i.createElement(f,d({ref:t},s))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=n.length,d=new Array(l);d[0]=k;var a={};for(var o in t)hasOwnProperty.call(t,o)&&(a[o]=t[o]);a.originalType=e,a[c]="string"==typeof e?e:r,d[1]=a;for(var p=2;p<l;p++)d[p]=n[p];return i.createElement.apply(null,d)}return i.createElement.apply(null,n)}k.displayName="MDXCreateElement"},94617:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>d,default:()=>u,frontMatter:()=>l,metadata:()=>a,toc:()=>p});var i=n(87462),r=(n(67294),n(3905));const l={id:"index.SyncedPredictions",title:"Interface: SyncedPredictions",sidebar_label:"SyncedPredictions",custom_edit_url:null},d=void 0,a={unversionedId:"framework/interfaces/index.SyncedPredictions",id:"framework/interfaces/index.SyncedPredictions",title:"Interface: SyncedPredictions",description:"index.SyncedPredictions",source:"@site/docs/framework/interfaces/index.SyncedPredictions.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.SyncedPredictions",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.SyncedPredictions",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.SyncedPredictions",title:"Interface: SyncedPredictions",sidebar_label:"SyncedPredictions",custom_edit_url:null},sidebar:"sidebar",previous:{title:"SynVisProps",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.SynVisProps"},next:{title:"SystemAlertEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.SystemAlertEvents"}},o={},p=[{value:"Properties",id:"properties",level:2},{value:"altitude",id:"altitude",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"distance",id:"distance",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"duration",id:"duration",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"estimatedTimeOfArrival",id:"estimatedtimeofarrival",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"fob",id:"fob",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"ident",id:"ident",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"isSpeedMach",id:"isspeedmach",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"position",id:"position",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"speed",id:"speed",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"valid",id:"valid",level:3},{value:"Defined in",id:"defined-in-9",level:4}],s={toc:p},c="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(c,(0,i.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".SyncedPredictions"),(0,r.kt)("p",null,"Predictions that have been serialized into JSON and back, causing NaN to become null."),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"altitude"},"altitude"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"altitude"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The altitude predicted at this point, in metres"),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/predictions/FlightPlanPredictionProvider.ts:115"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"distance"},"distance"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"distance"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The distance to the point, in metres. Can be a mix of along-path and great-circle distance based on the available data."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/predictions/FlightPlanPredictionProvider.ts:106"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"duration"},"duration"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"duration"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The total duration of the leg in seconds."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/predictions/FlightPlanPredictionProvider.ts:124"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"estimatedtimeofarrival"},"estimatedTimeOfArrival"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"estimatedTimeOfArrival"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The estimated time of arrival, in UNIX timestamp seconds"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/predictions/FlightPlanPredictionProvider.ts:109"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fob"},"fob"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"fob"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The weight predicted at the point, in pounds"),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/predictions/FlightPlanPredictionProvider.ts:112"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ident"},"ident"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"ident"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("p",null,"A string identifier associated with this prediction"),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/predictions/FlightPlanPredictionProvider.ts:91"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isspeedmach"},"isSpeedMach"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"isSpeedMach"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether or not the speed is a mach or CAS value."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/predictions/FlightPlanPredictionProvider.ts:121"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"position"},"position"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"position"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Object")),(0,r.kt)("p",null,"The location of this point"),(0,r.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"lat")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The latitude, in degrees.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"lon")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The longitude, in degrees.")))),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/predictions/FlightPlanPredictionProvider.ts:94"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"speed"},"speed"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"speed"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The predicted leg speed."),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/predictions/FlightPlanPredictionProvider.ts:118"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"valid"},"valid"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"valid"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether the contents of this prediction are valid and up-to-date"),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/predictions/FlightPlanPredictionProvider.ts:103"))}u.isMDXComponent=!0}}]);