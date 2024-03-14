"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[60564],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>h});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},l=Object.keys(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=i.createContext({}),d=function(e){var t=i.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},p=function(e){var t=d(e.components);return i.createElement(s.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=d(n),u=a,h=m["".concat(s,".").concat(u)]||m[u]||c[u]||l;return n?i.createElement(h,r(r({ref:t},p),{},{components:n})):i.createElement(h,r({ref:t},p))}));function h(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,r=new Array(l);r[0]=u;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[m]="string"==typeof e?e:a,r[1]=o;for(var d=2;d<l;d++)r[d]=n[d];return i.createElement.apply(null,r)}return i.createElement.apply(null,n)}u.displayName="MDXCreateElement"},77227:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>r,default:()=>c,frontMatter:()=>l,metadata:()=>o,toc:()=>d});var i=n(87462),a=(n(67294),n(3905));const l={id:"FlightPlanLegDataItem",title:"Interface: FlightPlanLegDataItem",sidebar_label:"FlightPlanLegDataItem",sidebar_position:0,custom_edit_url:null},r=void 0,o={unversionedId:"g3xtouchcommon/interfaces/FlightPlanLegDataItem",id:"g3xtouchcommon/interfaces/FlightPlanLegDataItem",title:"Interface: FlightPlanLegDataItem",description:"A data item describing a flight plan leg.",source:"@site/docs/g3xtouchcommon/interfaces/FlightPlanLegDataItem.md",sourceDirName:"g3xtouchcommon/interfaces",slug:"/g3xtouchcommon/interfaces/FlightPlanLegDataItem",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/FlightPlanLegDataItem",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPlanLegDataItem",title:"Interface: FlightPlanLegDataItem",sidebar_label:"FlightPlanLegDataItem",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPlanDataFieldFactory",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/FlightPlanDataFieldFactory"},next:{title:"FlightPlanStore",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/FlightPlanStore"}},s={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"activeStatus",id:"activestatus",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"approachData",id:"approachdata",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"dataFields",id:"datafields",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"fixIcao",id:"fixicao",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"flightPlan",id:"flightplan",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"isVisible",id:"isvisible",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"leg",id:"leg",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"type",id:"type",level:3},{value:"Defined in",id:"defined-in-7",level:4}],p={toc:d},m="wrapper";function c(e){let{components:t,...n}=e;return(0,a.kt)(m,(0,i.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A data item describing a flight plan leg."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"p"},"FlightPlanBaseDataItem")),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"FlightPlanLegDataItem"))))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"activestatus"},"activeStatus"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"activeStatus"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/enums/FlightPlanLegDataItemActiveStatus"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPlanLegDataItemActiveStatus")),">"),(0,a.kt)("p",null,"The status of this item's flight plan leg relative to the active leg."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/FlightPlan/FlightPlanDataItem.ts:69"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"approachdata"},"approachData"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"approachData"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#g3xfmsfplloadedapproachdata"},(0,a.kt)("inlineCode",{parentName:"a"},"G3XFmsFplLoadedApproachData")),">"),(0,a.kt)("p",null,"Data describing the approach to which this item's flight plan leg belongs, or ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," if the leg does not\nbelong to an approach."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/FlightPlan/FlightPlanDataItem.ts:66"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"datafields"},"dataFields"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"dataFields"),": readonly ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/FlightPlanDataField"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPlanDataField")),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/enums/FlightPlanDataFieldType"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPlanDataFieldType")),">",">","[]"),(0,a.kt)("p",null,"This item's data fields."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/FlightPlan/FlightPlanDataItem.ts:72"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"fixicao"},"fixIcao"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"fixIcao"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"The ICAO of the waypoint fix associated with this item's flight plan leg, or the empty string if no such waypoint\nfix exists."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/FlightPlan/FlightPlanDataItem.ts:60"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"flightplan"},"flightPlan"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"flightPlan"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"FlightPlan")),(0,a.kt)("p",null,"This item's parent flight plan."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/FlightPlan/FlightPlanDataItem.ts:51"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isvisible"},"isVisible"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"isVisible"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether this item should be visible when displayed in a list format."),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,"FlightPlanBaseDataItem.isVisible"),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/FlightPlan/FlightPlanDataItem.ts:20"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"leg"},"leg"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"leg"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"LegDefinition")),(0,a.kt)("p",null,"This item's associated flight plan leg."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/FlightPlan/FlightPlanDataItem.ts:54"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"type"},"type"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"type"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/enums/FlightPlanDataItemType#leg"},(0,a.kt)("inlineCode",{parentName:"a"},"Leg"))),(0,a.kt)("p",null,"The type of this data item."),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/FlightPlan/FlightPlanDataItem.ts:48"))}c.isMDXComponent=!0}}]);