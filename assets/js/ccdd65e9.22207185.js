"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[86934],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>k});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},l=Object.keys(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=i.createContext({}),d=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},p=function(e){var t=d(e.components);return i.createElement(o.Provider,{value:t},e.children)},m="mdxType",g={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,o=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),m=d(n),u=a,k=m["".concat(o,".").concat(u)]||m[u]||g[u]||l;return n?i.createElement(k,r(r({ref:t},p),{},{components:n})):i.createElement(k,r({ref:t},p))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,r=new Array(l);r[0]=u;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s[m]="string"==typeof e?e:a,r[1]=s;for(var d=2;d<l;d++)r[d]=n[d];return i.createElement.apply(null,r)}return i.createElement.apply(null,n)}u.displayName="MDXCreateElement"},94334:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>r,default:()=>g,frontMatter:()=>l,metadata:()=>s,toc:()=>d});var i=n(87462),a=(n(67294),n(3905));const l={id:"FlightPlanLegListData",title:"Class: FlightPlanLegListData",sidebar_label:"FlightPlanLegListData",sidebar_position:0,custom_edit_url:null},r=void 0,s={unversionedId:"g3000common/classes/FlightPlanLegListData",id:"g3000common/classes/FlightPlanLegListData",title:"Class: FlightPlanLegListData",description:"Represents a flight plan leg in a list.",source:"@site/docs/g3000common/classes/FlightPlanLegListData.md",sourceDirName:"g3000common/classes",slug:"/g3000common/classes/FlightPlanLegListData",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/FlightPlanLegListData",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPlanLegListData",title:"Class: FlightPlanLegListData",sidebar_label:"FlightPlanLegListData",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPlanLegData",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/FlightPlanLegData"},next:{title:"FlightPlanListManager",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/FlightPlanListManager"}},o={},d=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"airwayExitText",id:"airwayexittext",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"displayDistance",id:"displaydistance",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"displayDtk",id:"displaydtk",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"displayEte",id:"displayete",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"hasHiddenAirwayLegsBefore",id:"hashiddenairwaylegsbefore",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"isFirstVisibleLegInSegment",id:"isfirstvisibleleginsegment",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"isFullyCollapsedAirwayExit",id:"isfullycollapsedairwayexit",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"isVisible",id:"isvisible",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"legData",id:"legdata",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"segmentListData",id:"segmentlistdata",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"type",id:"type",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-12",level:4}],p={toc:d},m="wrapper";function g(e){let{components:t,...n}=e;return(0,a.kt)(m,(0,i.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Represents a flight plan leg in a list.\nWraps a ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/FlightPlanLegData"},"FlightPlanLegData")," object.\nContains fields specific to flight plan lists."),(0,a.kt)("h2",{id:"implements"},"Implements"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/FlightPlanBaseListData"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPlanBaseListData")))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new FlightPlanLegListData"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"legData"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"segmentListData"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"store"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"unitsSettingManager"),")"),(0,a.kt)("p",null,"FlightPlanLegListData constructor."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"legData")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000common/classes/FlightPlanLegData"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPlanLegData"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flight plan leg data to wrap.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"segmentListData")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000common/classes/FlightPlanSegmentListData"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPlanSegmentListData"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The segment list data that this leg belong's to. Not required for random direct to leg.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"store")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000common/classes/FlightPlanStore"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPlanStore"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flight plan store this belongs to.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"unitsSettingManager")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"UnitsUserSettingManager")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The units setting manager.")))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/FlightPlan/FlightPlanLegListData.ts:82"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"airwayexittext"},"airwayExitText"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"airwayExitText"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"MappedSubject"),"<","[",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"string"),"]",", ",(0,a.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,a.kt)("p",null,"Airway exit text."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/FlightPlan/FlightPlanLegListData.ts:35"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"displaydistance"},"displayDistance"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"displayDistance"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"NumberUnitSubject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"SimpleUnit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Distance"),">",">"),(0,a.kt)("p",null,"The leg distance, but meant for display in a list. Can change when active leg, and more.\nShows segment distance for collapsed airway exit."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/FlightPlan/FlightPlanLegListData.ts:65"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"displaydtk"},"displayDtk"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"displayDtk"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"BasicNavAngleSubject")),(0,a.kt)("p",null,"The leg DTK for displaying in certain places like the flight plan page.\nChanges when this is the active leg and stuff like that."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/FlightPlan/FlightPlanLegListData.ts:59"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"displayete"},"displayEte"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"displayEte"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"NumberUnitSubject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Duration"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"SimpleUnit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Duration"),">",">"),(0,a.kt)("p",null,"Estimated time Enroute of the leg, in seconds duration. How long it will take to fly the leg.\nShows the segment ETE for collapsed airway exit."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/FlightPlan/FlightPlanLegListData.ts:70"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"hashiddenairwaylegsbefore"},"hasHiddenAirwayLegsBefore"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"hasHiddenAirwayLegsBefore"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether there are hidden airway legs before this one, should only apply to last leg in collapsed airway."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/FlightPlan/FlightPlanLegListData.ts:32"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isfirstvisibleleginsegment"},"isFirstVisibleLegInSegment"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"isFirstVisibleLegInSegment"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether this leg is the first visible leg in a segment."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/FlightPlan/FlightPlanLegListData.ts:29"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isfullycollapsedairwayexit"},"isFullyCollapsedAirwayExit"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"isFullyCollapsedAirwayExit"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/FlightPlan/FlightPlanLegListData.ts:55"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isvisible"},"isVisible"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"isVisible"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether this list item is visible in the list."),(0,a.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/FlightPlanBaseListData"},"FlightPlanBaseListData"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/FlightPlanBaseListData#isvisible"},"isVisible")),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/FlightPlan/FlightPlanLegListData.ts:26"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"legdata"},"legData"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"legData"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/FlightPlanLegData"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPlanLegData"))),(0,a.kt)("p",null,"The flight plan leg data to wrap."),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/FlightPlan/FlightPlanLegListData.ts:83"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"segmentlistdata"},"segmentListData"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"segmentListData"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/FlightPlanSegmentListData"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPlanSegmentListData"))),(0,a.kt)("p",null,"The segment list data that this leg belong's to. Not required for random direct to leg."),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/FlightPlan/FlightPlanLegListData.ts:84"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"type"},"type"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},'"leg"')),(0,a.kt)("p",null,"The type of flight plan list item."),(0,a.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/FlightPlanBaseListData"},"FlightPlanBaseListData"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/FlightPlanBaseListData#type"},"type")),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/FlightPlan/FlightPlanLegListData.ts:22"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"destroy"},"destroy"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Call when this leg is removed from the list."),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/FlightPlan/FlightPlanLegListData.ts:211"))}g.isMDXComponent=!0}}]);