"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[63625],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>h});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=i.createContext({}),p=function(e){var t=i.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=p(e.components);return i.createElement(s.Provider,{value:t},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),d=p(n),u=a,h=d["".concat(s,".").concat(u)]||d[u]||m[u]||r;return n?i.createElement(h,o(o({ref:t},c),{},{components:n})):i.createElement(h,o({ref:t},c))}));function h(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,o=new Array(r);o[0]=u;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[d]="string"==typeof e?e:a,o[1]=l;for(var p=2;p<r;p++)o[p]=n[p];return i.createElement.apply(null,o)}return i.createElement.apply(null,n)}u.displayName="MDXCreateElement"},91882:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>m,frontMatter:()=>r,metadata:()=>l,toc:()=>p});var i=n(87462),a=(n(67294),n(3905));const r={id:"FlightPlanAddWaypointDataItem",title:"Interface: FlightPlanAddWaypointDataItem",sidebar_label:"FlightPlanAddWaypointDataItem",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"g3xtouchcommon/interfaces/FlightPlanAddWaypointDataItem",id:"g3xtouchcommon/interfaces/FlightPlanAddWaypointDataItem",title:"Interface: FlightPlanAddWaypointDataItem",description:"A data item describing an 'Add Waypoint' item in a list.",source:"@site/docs/g3xtouchcommon/interfaces/FlightPlanAddWaypointDataItem.md",sourceDirName:"g3xtouchcommon/interfaces",slug:"/g3xtouchcommon/interfaces/FlightPlanAddWaypointDataItem",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/FlightPlanAddWaypointDataItem",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPlanAddWaypointDataItem",title:"Interface: FlightPlanAddWaypointDataItem",sidebar_label:"FlightPlanAddWaypointDataItem",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlapsGaugeProps",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/FlapsGaugeProps"},next:{title:"FlightPlanApproachLegPreviewDataItem",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/FlightPlanApproachLegPreviewDataItem"}},s={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"isVisible",id:"isvisible",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"type",id:"type",level:3},{value:"Defined in",id:"defined-in-1",level:4}],c={toc:p},d="wrapper";function m(e){let{components:t,...n}=e;return(0,a.kt)(d,(0,i.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A data item describing an 'Add Waypoint' item in a list."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"p"},"FlightPlanBaseDataItem")),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"FlightPlanAddWaypointDataItem"))))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"isvisible"},"isVisible"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"isVisible"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether this item should be visible when displayed in a list format."),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,"FlightPlanBaseDataItem.isVisible"),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/FlightPlan/FlightPlanDataItem.ts:20"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"type"},"type"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"type"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/enums/FlightPlanDataItemType#addwaypoint"},(0,a.kt)("inlineCode",{parentName:"a"},"AddWaypoint"))),(0,a.kt)("p",null,"The type of this data item."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/FlightPlan/FlightPlanDataItem.ts:100"))}m.isMDXComponent=!0}}]);