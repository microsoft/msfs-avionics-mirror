"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[28959],{3905:(e,n,t)=>{t.d(n,{Zo:()=>p,kt:()=>u});var r=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var d=r.createContext({}),s=function(e){var n=r.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},p=function(e){var n=s(e.components);return r.createElement(d.Provider,{value:n},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},f=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,a=e.originalType,d=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),c=s(t),f=i,u=c["".concat(d,".").concat(f)]||c[f]||m[f]||a;return t?r.createElement(u,l(l({ref:n},p),{},{components:t})):r.createElement(u,l({ref:n},p))}));function u(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var a=t.length,l=new Array(a);l[0]=f;var o={};for(var d in n)hasOwnProperty.call(n,d)&&(o[d]=n[d]);o.originalType=e,o[c]="string"==typeof e?e:i,l[1]=o;for(var s=2;s<a;s++)l[s]=t[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,t)}f.displayName="MDXCreateElement"},17769:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>l,default:()=>m,frontMatter:()=>a,metadata:()=>o,toc:()=>s});var r=t(87462),i=(t(67294),t(3905));const a={id:"FlightPlanSegmentEvent",title:"Interface: FlightPlanSegmentEvent",sidebar_label:"FlightPlanSegmentEvent",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/interfaces/FlightPlanSegmentEvent",id:"framework/interfaces/FlightPlanSegmentEvent",title:"Interface: FlightPlanSegmentEvent",description:"An event fired when there are segment related changes.",source:"@site/docs/framework/interfaces/FlightPlanSegmentEvent.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/FlightPlanSegmentEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanSegmentEvent",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPlanSegmentEvent",title:"Interface: FlightPlanSegmentEvent",sidebar_label:"FlightPlanSegmentEvent",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPlanResponseEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanResponseEvent"},next:{title:"FlightPlanUserDataEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanUserDataEvent"}},d={},s=[{value:"Properties",id:"properties",level:2},{value:"batch",id:"batch",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"planIndex",id:"planindex",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"segment",id:"segment",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"segmentIndex",id:"segmentindex",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"type",id:"type",level:3},{value:"Defined in",id:"defined-in-4",level:4}],p={toc:s},c="wrapper";function m(e){let{components:n,...t}=e;return(0,i.kt)(c,(0,r.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"An event fired when there are segment related changes."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"batch"},"batch"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"batch"),": readonly ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#flightplanmodbatch"},(0,i.kt)("inlineCode",{parentName:"a"},"FlightPlanModBatch")),">","[]"),(0,i.kt)("p",null,"The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if\nthe change was not assigned to any batches."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:177"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"planindex"},"planIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"planIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The index of the flight plan."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:165"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"segment"},"segment"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"segment"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanSegment"},(0,i.kt)("inlineCode",{parentName:"a"},"FlightPlanSegment"))),(0,i.kt)("p",null,"The segment that was added, removed, or changed."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:171"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"segmentindex"},"segmentIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"segmentIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The current leg selected."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:168"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"type"},"type"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"type"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/SegmentEventType"},(0,i.kt)("inlineCode",{parentName:"a"},"SegmentEventType"))),(0,i.kt)("p",null,"The type of the leg change."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/sdk/flightplan/FlightPlanner.ts:162"))}m.isMDXComponent=!0}}]);