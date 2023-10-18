"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[3392],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>h});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},l=Object.keys(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var d=n.createContext({}),o=function(e){var t=n.useContext(d),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},u=function(e){var t=o(e.components);return n.createElement(d.Provider,{value:t},e.children)},p="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,l=e.originalType,d=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),p=o(r),c=a,h=p["".concat(d,".").concat(c)]||p[c]||k[c]||l;return r?n.createElement(h,s(s({ref:t},u),{},{components:r})):n.createElement(h,s({ref:t},u))}));function h(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=r.length,s=new Array(l);s[0]=c;var i={};for(var d in t)hasOwnProperty.call(t,d)&&(i[d]=t[d]);i.originalType=e,i[p]="string"==typeof e?e:a,s[1]=i;for(var o=2;o<l;o++)s[o]=r[o];return n.createElement.apply(null,s)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},38871:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>d,contentTitle:()=>s,default:()=>k,frontMatter:()=>l,metadata:()=>i,toc:()=>o});var n=r(87462),a=(r(67294),r(3905));const l={id:"index.ThrottledTaskQueueProcess",title:"Class: ThrottledTaskQueueProcess",sidebar_label:"ThrottledTaskQueueProcess",custom_edit_url:null},s=void 0,i={unversionedId:"framework/classes/index.ThrottledTaskQueueProcess",id:"framework/classes/index.ThrottledTaskQueueProcess",title:"Class: ThrottledTaskQueueProcess",description:"index.ThrottledTaskQueueProcess",source:"@site/docs/framework/classes/index.ThrottledTaskQueueProcess.md",sourceDirName:"framework/classes",slug:"/framework/classes/index.ThrottledTaskQueueProcess",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.ThrottledTaskQueueProcess",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.ThrottledTaskQueueProcess",title:"Class: ThrottledTaskQueueProcess",sidebar_label:"ThrottledTaskQueueProcess",custom_edit_url:null},sidebar:"sidebar",previous:{title:"ThrottleLeverManager",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.ThrottleLeverManager"},next:{title:"ToggleLabel",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.ToggleLabel"}},d={},o=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"_hasEnded",id:"_hasended",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"_hasStarted",id:"_hasstarted",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"_shouldAbort",id:"_shouldabort",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"handler",id:"handler",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"queue",id:"queue",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"Methods",id:"methods",level:2},{value:"abort",id:"abort",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"hasEnded",id:"hasended",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"hasStarted",id:"hasstarted",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"processQueue",id:"processqueue",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"start",id:"start",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-10",level:4}],u={toc:o},p="wrapper";function k(e){let{components:t,...r}=e;return(0,a.kt)(p,(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".ThrottledTaskQueueProcess"),(0,a.kt)("p",null,"A process which dispatches tasks in a task queue potentially over multiple frames."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new ThrottledTaskQueueProcess"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"queue"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"handler"),")"),(0,a.kt)("p",null,"Constructor."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"queue")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.TaskQueue"},(0,a.kt)("inlineCode",{parentName:"a"},"TaskQueue"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The queue to process.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"handler")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.ThrottledTaskQueueHandler"},(0,a.kt)("inlineCode",{parentName:"a"},"ThrottledTaskQueueHandler"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"A handler which defines the behavior of this process.")))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/task/ThrottledTaskQueueProcess.ts:56"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"_hasended"},"_","hasEnded"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"_","hasEnded"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"false")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/task/ThrottledTaskQueueProcess.ts:48"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"_hasstarted"},"_","hasStarted"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"_","hasStarted"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"false")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/task/ThrottledTaskQueueProcess.ts:47"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"_shouldabort"},"_","shouldAbort"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"_","shouldAbort"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"false")),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/task/ThrottledTaskQueueProcess.ts:49"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"handler"},"handler"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"handler"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.ThrottledTaskQueueHandler"},(0,a.kt)("inlineCode",{parentName:"a"},"ThrottledTaskQueueHandler"))),(0,a.kt)("p",null,"A handler which defines the behavior of this process."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/task/ThrottledTaskQueueProcess.ts:56"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"queue"},"queue"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"queue"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.TaskQueue"},(0,a.kt)("inlineCode",{parentName:"a"},"TaskQueue"))),(0,a.kt)("p",null,"The queue to process."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/task/ThrottledTaskQueueProcess.ts:56"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"abort"},"abort"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"abort"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Aborts this process. Has no effect if the process has not been started or if it has already ended."),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/task/ThrottledTaskQueueProcess.ts:116"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"hasended"},"hasEnded"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"hasEnded"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Checks whether this process has ended."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"whether this process has ended."),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/task/ThrottledTaskQueueProcess.ts:71"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"hasstarted"},"hasStarted"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"hasStarted"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Checks whether this process has been started."),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"whether this process has been started."),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/task/ThrottledTaskQueueProcess.ts:63"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"processqueue"},"processQueue"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"processQueue"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"elapsedFrameCount"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Processes the queue."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"elapsedFrameCount")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The number of frames elapsed since queue processing started.")))),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/task/ThrottledTaskQueueProcess.ts:87"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"start"},"start"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"start"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Starts this process."),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/task/ThrottledTaskQueueProcess.ts:78"))}k.isMDXComponent=!0}}]);