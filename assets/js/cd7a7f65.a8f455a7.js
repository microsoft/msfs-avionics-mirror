"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[54469],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>k});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=i.createContext({}),p=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},d=function(e){var t=p(e.components);return i.createElement(o.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},c=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,o=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),u=p(n),c=a,k=u["".concat(o,".").concat(c)]||u[c]||m[c]||r;return n?i.createElement(k,s(s({ref:t},d),{},{components:n})):i.createElement(k,s({ref:t},d))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,s=new Array(r);s[0]=c;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l[u]="string"==typeof e?e:a,s[1]=l;for(var p=2;p<r;p++)s[p]=n[p];return i.createElement.apply(null,s)}return i.createElement.apply(null,n)}c.displayName="MDXCreateElement"},7716:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>s,default:()=>m,frontMatter:()=>r,metadata:()=>l,toc:()=>p});var i=n(87462),a=(n(67294),n(3905));const r={id:"G3XNearestContext",title:"Class: G3XNearestContext",sidebar_label:"G3XNearestContext",sidebar_position:0,custom_edit_url:null},s=void 0,l={unversionedId:"g3xtouchcommon/classes/G3XNearestContext",id:"g3xtouchcommon/classes/G3XNearestContext",title:"Class: G3XNearestContext",description:"A G3X Touch nearest facilities context. Maintains search subscriptions for the nearest airports, VORs, NDBs,",source:"@site/docs/g3xtouchcommon/classes/G3XNearestContext.md",sourceDirName:"g3xtouchcommon/classes",slug:"/g3xtouchcommon/classes/G3XNearestContext",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XNearestContext",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"G3XNearestContext",title:"Class: G3XNearestContext",sidebar_label:"G3XNearestContext",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"G3XNearestAirportUserSettings",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XNearestAirportUserSettings"},next:{title:"G3XNearestMapBuilder",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XNearestMapBuilder"}},o={},p=[{value:"Properties",id:"properties",level:2},{value:"airports",id:"airports",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"intersections",id:"intersections",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"ndbs",id:"ndbs",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"updateEvent",id:"updateevent",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"usrs",id:"usrs",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"vors",id:"vors",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"Methods",id:"methods",level:2},{value:"getNearest",id:"getnearest",level:3},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"getRegionLetter",id:"getregionletter",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"update",id:"update",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"getInstance",id:"getinstance",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"initializeInstance",id:"initializeinstance",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-10",level:4}],d={toc:p},u="wrapper";function m(e){let{components:t,...n}=e;return(0,a.kt)(u,(0,i.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A G3X Touch nearest facilities context. Maintains search subscriptions for the nearest airports, VORs, NDBs,\nintersections, and user waypoints to the airplane's position."),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"airports"},"airports"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"airports"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"NearestSubscription"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"AirportFacility"),">"),(0,a.kt)("p",null,"The nearest airports."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Nearest/G3XNearestContext.ts:25"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"intersections"},"intersections"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"intersections"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"NearestSubscription"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"IntersectionFacility"),">"),(0,a.kt)("p",null,"The nearest intersections."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Nearest/G3XNearestContext.ts:31"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ndbs"},"ndbs"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"ndbs"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"NearestSubscription"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NdbFacility"),">"),(0,a.kt)("p",null,"The nearest NDB stations."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Nearest/G3XNearestContext.ts:34"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"updateevent"},"updateEvent"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"updateEvent"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"ReadonlySubEvent"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XNearestContext"},(0,a.kt)("inlineCode",{parentName:"a"},"G3XNearestContext")),", ",(0,a.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,a.kt)("p",null,"A subscribable event which fires when this context is updated."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Nearest/G3XNearestContext.ts:41"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"usrs"},"usrs"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"usrs"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"NearestSubscription"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"UserFacility"),">"),(0,a.kt)("p",null,"The nearest USR facilities."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Nearest/G3XNearestContext.ts:37"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"vors"},"vors"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"vors"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"NearestSubscription"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"VorFacility"),">"),(0,a.kt)("p",null,"The nearest VOR stations."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Nearest/G3XNearestContext.ts:28"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"getnearest"},"getNearest"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"getNearest"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),">","(",(0,a.kt)("inlineCode",{parentName:"p"},"facilityType"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"FacilityTypeMap"),"[",(0,a.kt)("inlineCode",{parentName:"p"},"T"),"]"),(0,a.kt)("p",null,"Gets the nearest facility for a given type."),(0,a.kt)("h4",{id:"type-parameters"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"T")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"FacilityType"))))),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"facilityType")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"T")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The type of facility.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"FacilityTypeMap"),"[",(0,a.kt)("inlineCode",{parentName:"p"},"T"),"]"),(0,a.kt)("p",null,"The nearest facility for a given type."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Nearest/G3XNearestContext.ts:160"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"getregionletter"},"getRegionLetter"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"getRegionLetter"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Gets the airport region letter to use for the first character in waypoint inputs."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"The airport region letter."),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Nearest/G3XNearestContext.ts:151"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"update"},"update"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"update"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,a.kt)("p",null,"Updates this context."),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Nearest/G3XNearestContext.ts:167"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"getinstance"},"getInstance"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"getInstance"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XNearestContext"},(0,a.kt)("inlineCode",{parentName:"a"},"G3XNearestContext")),">"),(0,a.kt)("p",null,"Gets the ",(0,a.kt)("inlineCode",{parentName:"p"},"G3XNearestContext")," instance on the local instrument."),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XNearestContext"},(0,a.kt)("inlineCode",{parentName:"a"},"G3XNearestContext")),">"),(0,a.kt)("p",null,"A Promise which will be fulfilled with the ",(0,a.kt)("inlineCode",{parentName:"p"},"G3XNearestContext")," instance on the local instrument once it\nis initialized."),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Nearest/G3XNearestContext.ts:181"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"initializeinstance"},"initializeInstance"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"initializeInstance"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"facilityLoader"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"fmsPosIndex"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XNearestContext"},(0,a.kt)("inlineCode",{parentName:"a"},"G3XNearestContext"))),(0,a.kt)("p",null,"Initializes and returns the ",(0,a.kt)("inlineCode",{parentName:"p"},"G3XNearestContext")," instance on the local instrument. If the instance is already\ninitialized, this method returns the instance without performing any other actions."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"facilityLoader")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"FacilityLoader")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A facility loader.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"fmsPosIndex")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"number"),">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index of the FMS geo-positioning system used by the context to get the airplane's position.")))),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XNearestContext"},(0,a.kt)("inlineCode",{parentName:"a"},"G3XNearestContext"))),(0,a.kt)("p",null,"The initialized ",(0,a.kt)("inlineCode",{parentName:"p"},"G3XNearestContext")," instance on the local instrument."),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Nearest/G3XNearestContext.ts:193"))}m.isMDXComponent=!0}}]);