"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[5313],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return m}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var d=r.createContext({}),o=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=o(e.components);return r.createElement(d.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,d=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),k=o(n),m=a,h=k["".concat(d,".").concat(m)]||k[m]||u[m]||i;return n?r.createElement(h,l(l({ref:t},p),{},{components:n})):r.createElement(h,l({ref:t},p))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=k;var s={};for(var d in t)hasOwnProperty.call(t,d)&&(s[d]=t[d]);s.originalType=e,s.mdxType="string"==typeof e?e:a,l[1]=s;for(var o=2;o<i;o++)l[o]=n[o];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}k.displayName="MDXCreateElement"},1975:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return s},contentTitle:function(){return d},metadata:function(){return o},toc:function(){return p},default:function(){return k}});var r=n(7462),a=n(3366),i=(n(7294),n(3905)),l=["components"],s={id:"ClockPublisher",title:"Class: ClockPublisher",sidebar_label:"ClockPublisher",sidebar_position:0,custom_edit_url:null},d=void 0,o={unversionedId:"framework/classes/ClockPublisher",id:"framework/classes/ClockPublisher",isDocsHomePage:!1,title:"Class: ClockPublisher",description:"A publisher of clock events.",source:"@site/docs/framework/classes/ClockPublisher.md",sourceDirName:"framework/classes",slug:"/framework/classes/ClockPublisher",permalink:"/msfs-avionics-mirror/docs/framework/classes/ClockPublisher",editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"ClockPublisher",title:"Class: ClockPublisher",sidebar_label:"ClockPublisher",sidebar_position:0,custom_edit_url:null},sidebar:"docsSidebar",previous:{title:"Clock",permalink:"/msfs-avionics-mirror/docs/framework/classes/Clock"},next:{title:"CollectionComponent",permalink:"/msfs-avionics-mirror/docs/framework/classes/CollectionComponent"}},p=[{value:"Hierarchy",id:"hierarchy",children:[],level:2},{value:"Constructors",id:"constructors",children:[{value:"constructor",id:"constructor",children:[{value:"Parameters",id:"parameters",children:[],level:4},{value:"Inherited from",id:"inherited-from",children:[],level:4},{value:"Defined in",id:"defined-in",children:[],level:4}],level:3}],level:2},{value:"Methods",id:"methods",children:[{value:"isPublishing",id:"ispublishing",children:[{value:"Returns",id:"returns",children:[],level:4},{value:"Inherited from",id:"inherited-from-1",children:[],level:4},{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"onUpdate",id:"onupdate",children:[{value:"Returns",id:"returns-1",children:[],level:4},{value:"Overrides",id:"overrides",children:[],level:4},{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3},{value:"publish",id:"publish",children:[{value:"Type parameters",id:"type-parameters",children:[],level:4},{value:"Parameters",id:"parameters-1",children:[],level:4},{value:"Returns",id:"returns-2",children:[],level:4},{value:"Inherited from",id:"inherited-from-2",children:[],level:4},{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3},{value:"startPublish",id:"startpublish",children:[{value:"Returns",id:"returns-3",children:[],level:4},{value:"Inherited from",id:"inherited-from-3",children:[],level:4},{value:"Defined in",id:"defined-in-4",children:[],level:4}],level:3},{value:"stopPublish",id:"stoppublish",children:[{value:"Returns",id:"returns-4",children:[],level:4},{value:"Inherited from",id:"inherited-from-4",children:[],level:4},{value:"Defined in",id:"defined-in-5",children:[],level:4}],level:3},{value:"absoluteTimeToUNIXTime",id:"absolutetimetounixtime",children:[{value:"Parameters",id:"parameters-2",children:[],level:4},{value:"Returns",id:"returns-5",children:[],level:4},{value:"Defined in",id:"defined-in-6",children:[],level:4}],level:3}],level:2}],u={toc:p};function k(e){var t=e.components,n=(0,a.Z)(e,l);return(0,i.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A publisher of clock events."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"BasePublisher"},(0,i.kt)("inlineCode",{parentName:"a"},"BasePublisher")),"<",(0,i.kt)("a",{parentName:"p",href:"../interfaces/ClockEvents"},(0,i.kt)("inlineCode",{parentName:"a"},"ClockEvents")),">"),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"ClockPublisher"))))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new ClockPublisher"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"pacer?"),")"),(0,i.kt)("p",null,"Creates an instance of BasePublisher."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"bus")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"EventBus"},(0,i.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The common event bus.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"pacer")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,i.kt)("a",{parentName:"td",href:"../interfaces/PublishPacer"},(0,i.kt)("inlineCode",{parentName:"a"},"PublishPacer")),"<",(0,i.kt)("a",{parentName:"td",href:"../interfaces/ClockEvents"},(0,i.kt)("inlineCode",{parentName:"a"},"ClockEvents")),">"),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"An optional pacer to control the rate of publishing.")))),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"BasePublisher"},"BasePublisher"),".",(0,i.kt)("a",{parentName:"p",href:"BasePublisher#constructor"},"constructor")),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/BasePublishers.ts:19"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"ispublishing"},"isPublishing"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"isPublishing"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Tells whether or not the publisher is currently active."),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"True if the publisher is active, false otherwise."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"BasePublisher"},"BasePublisher"),".",(0,i.kt)("a",{parentName:"p",href:"BasePublisher#ispublishing"},"isPublishing")),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/BasePublishers.ts:44"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onupdate"},"onUpdate"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onUpdate"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback called when the publisher receives an update cycle."),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"overrides"},"Overrides"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"BasePublisher"},"BasePublisher"),".",(0,i.kt)("a",{parentName:"p",href:"BasePublisher#onupdate"},"onUpdate")),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Clock.ts:20"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"publish"},"publish"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("strong",{parentName:"p"},"publish"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,i.kt)("inlineCode",{parentName:"p"},"topic"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"data"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"sync?"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"isCached?"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Publish a message if publishing is acpive"),(0,i.kt)("h4",{id:"type-parameters"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"K")),(0,i.kt)("td",{parentName:"tr",align:"left"},"extends keyof ",(0,i.kt)("a",{parentName:"td",href:"../interfaces/ClockEvents"},(0,i.kt)("inlineCode",{parentName:"a"},"ClockEvents")))))),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"topic")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"K")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The topic key to publish to.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"data")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"../interfaces/ClockEvents"},(0,i.kt)("inlineCode",{parentName:"a"},"ClockEvents")),"[",(0,i.kt)("inlineCode",{parentName:"td"},"K"),"]"),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The data type for chosen topic.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"sync")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"false")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether or not the event should be synced via local storage.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"isCached")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"true")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether or not the event should be cached.")))),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"BasePublisher"},"BasePublisher"),".",(0,i.kt)("a",{parentName:"p",href:"BasePublisher#publish"},"publish")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/BasePublishers.ts:62"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"startpublish"},"startPublish"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"startPublish"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Start publishing."),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"BasePublisher"},"BasePublisher"),".",(0,i.kt)("a",{parentName:"p",href:"BasePublisher#startpublish"},"startPublish")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/BasePublishers.ts:29"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"stoppublish"},"stopPublish"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"stopPublish"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Stop publishing."),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"BasePublisher"},"BasePublisher"),".",(0,i.kt)("a",{parentName:"p",href:"BasePublisher#stoppublish"},"stopPublish")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/BasePublishers.ts:36"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"absolutetimetounixtime"},"absoluteTimeToUNIXTime"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("strong",{parentName:"p"},"absoluteTimeToUNIXTime"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"absoluteTime"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"Converts the sim's absolute time to a UNIX timestamp. The sim's absolute time value is equivalent to a .NET\nDateTime.Ticks value (epoch = 00:00:00 01 Jan 0001)."),(0,i.kt)("h4",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"absoluteTime")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},"an absolute time value, in units of seconds.")))),(0,i.kt)("h4",{id:"returns-5"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"the UNIX timestamp corresponding to the absolute time value."),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Clock.ts:31"))}k.isMDXComponent=!0}}]);