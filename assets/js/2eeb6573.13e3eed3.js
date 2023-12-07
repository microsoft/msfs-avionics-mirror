"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[75508],{3905:(e,t,a)=>{a.d(t,{Zo:()=>o,kt:()=>c});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},l=Object.keys(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var s=r.createContext({}),d=function(e){var t=r.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},o=function(e){var t=d(e.components);return r.createElement(s.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,l=e.originalType,s=e.parentName,o=p(e,["components","mdxType","originalType","parentName"]),m=d(a),u=n,c=m["".concat(s,".").concat(u)]||m[u]||k[u]||l;return a?r.createElement(c,i(i({ref:t},o),{},{components:a})):r.createElement(c,i({ref:t},o))}));function c(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var l=a.length,i=new Array(l);i[0]=u;var p={};for(var s in t)hasOwnProperty.call(t,s)&&(p[s]=t[s]);p.originalType=e,p[m]="string"==typeof e?e:n,i[1]=p;for(var d=2;d<l;d++)i[d]=a[d];return r.createElement.apply(null,i)}return r.createElement.apply(null,a)}u.displayName="MDXCreateElement"},21015:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>k,frontMatter:()=>l,metadata:()=>p,toc:()=>d});var r=a(87462),n=(a(67294),a(3905));const l={id:"EventRepublisher",title:"Class: EventRepublisher<SourceEvents, TargetEvents>",sidebar_label:"EventRepublisher",sidebar_position:0,custom_edit_url:null},i=void 0,p={unversionedId:"framework/classes/EventRepublisher",id:"framework/classes/EventRepublisher",title:"Class: EventRepublisher<SourceEvents, TargetEvents>",description:"Republishes event bus topics.",source:"@site/docs/framework/classes/EventRepublisher.md",sourceDirName:"framework/classes",slug:"/framework/classes/EventRepublisher",permalink:"/msfs-avionics-mirror/docs/framework/classes/EventRepublisher",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"EventRepublisher",title:"Class: EventRepublisher<SourceEvents, TargetEvents>",sidebar_label:"EventRepublisher",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"EventBus",permalink:"/msfs-avionics-mirror/docs/framework/classes/EventBus"},next:{title:"EventSubscriber",permalink:"/msfs-avionics-mirror/docs/framework/classes/EventSubscriber"}},s={},d=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"clearRepublishes",id:"clearrepublishes",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"startRepublish",id:"startrepublish",level:3},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"stopRepublish",id:"stoprepublish",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-4",level:4}],o={toc:d},m="wrapper";function k(e){let{components:t,...a}=e;return(0,n.kt)(m,(0,r.Z)({},o,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Republishes event bus topics."),(0,n.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"SourceEvents"))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"TargetEvents"))))),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new EventRepublisher"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"SourceEvents"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"TargetEvents"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"bus"),")"),(0,n.kt)("p",null,"Constructor."),(0,n.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"SourceEvents"))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"TargetEvents"))))),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"bus")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/EventBus"},(0,n.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/data/EventRepublisher.ts:27"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"clearrepublishes"},"clearRepublishes"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"clearRepublishes"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Clears all republishes from this publisher."),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/data/EventRepublisher.ts:121"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"startrepublish"},"startRepublish"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"startRepublish"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Source"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"Target"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"sourceTopic"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"targetTopic"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"sync"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"cache"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"Starts republishing data from a source topic to a target topic. Republishing will begin as soon as the target\ntopic has at least one subscriber, or immediately if the target topic data is synced across instruments."),(0,n.kt)("h4",{id:"type-parameters-2"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Source")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("inlineCode",{parentName:"td"},"string"))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Target")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("inlineCode",{parentName:"td"},"string")," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},"number")," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},"symbol"))))),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"sourceTopic")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Source")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The source topic.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"targetTopic")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Target")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The target topic.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"sync")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether the target topic should be synced across instruments.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"cache")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether the target topic data should be cached.")))),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"A unique ID associated with the republish."),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/data/EventRepublisher.ts:39"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"startRepublish"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Source"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"Target"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"sourceTopic"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"targetTopic"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"sync"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"cache"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"map"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"Starts republishing data from a source topic to a target topic after the data has been transformed by a mapping\nfunction. Republishing will begin as soon as the target topic has at least one subscriber, or immediately if the\ntarget topic data is synced across instruments."),(0,n.kt)("h4",{id:"type-parameters-3"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Source")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("inlineCode",{parentName:"td"},"string"))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Target")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("inlineCode",{parentName:"td"},"string"))))),(0,n.kt)("h4",{id:"parameters-2"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"sourceTopic")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Source")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The source topic.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"targetTopic")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Target")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The target topic.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"sync")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether the target topic should be synced across instruments.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"cache")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether the target topic data should be cached.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"map")),(0,n.kt)("td",{parentName:"tr",align:"left"},"(",(0,n.kt)("inlineCode",{parentName:"td"},"sourceData"),": ",(0,n.kt)("inlineCode",{parentName:"td"},"SourceEvents"),"[",(0,n.kt)("inlineCode",{parentName:"td"},"Source"),"]",") => ",(0,n.kt)("inlineCode",{parentName:"td"},"TargetEvents"),"[",(0,n.kt)("inlineCode",{parentName:"td"},"Target"),"]"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A mapping function to use to transform the source data.")))),(0,n.kt)("h4",{id:"returns-2"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"A unique ID associated with the republish."),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/sdk/data/EventRepublisher.ts:59"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"stoprepublish"},"stopRepublish"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"stopRepublish"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"id"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Stops a republish handled by this publisher."),(0,n.kt)("h4",{id:"parameters-3"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"id")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The unique ID associated with the republish to stop.")))),(0,n.kt)("h4",{id:"returns-3"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Whether the requested republish was stopped."),(0,n.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,n.kt)("p",null,"src/sdk/data/EventRepublisher.ts:105"))}k.isMDXComponent=!0}}]);