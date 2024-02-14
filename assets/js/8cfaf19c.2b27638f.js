"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[86647],{3905:(e,n,t)=>{t.d(n,{Zo:()=>m,kt:()=>c});var i=t(67294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,i,a=function(e,n){if(null==e)return{};var t,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var d=i.createContext({}),p=function(e){var n=i.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},m=function(e){var n=p(e.components);return i.createElement(d.Provider,{value:n},e.children)},s="mdxType",k={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},u=i.forwardRef((function(e,n){var t=e.components,a=e.mdxType,r=e.originalType,d=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),s=p(t),u=a,c=s["".concat(d,".").concat(u)]||s[u]||k[u]||r;return t?i.createElement(c,l(l({ref:n},m),{},{components:t})):i.createElement(c,l({ref:n},m))}));function c(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var r=t.length,l=new Array(r);l[0]=u;var o={};for(var d in n)hasOwnProperty.call(n,d)&&(o[d]=n[d]);o.originalType=e,o[s]="string"==typeof e?e:a,l[1]=o;for(var p=2;p<r;p++)l[p]=t[p];return i.createElement.apply(null,l)}return i.createElement.apply(null,t)}u.displayName="MDXCreateElement"},47325:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>l,default:()=>k,frontMatter:()=>r,metadata:()=>o,toc:()=>p});var i=t(87462),a=(t(67294),t(3905));const r={id:"NearestAirportNavSource",title:"Class: NearestAirportNavSource<NameType>",sidebar_label:"NearestAirportNavSource",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"g3xtouchcommon/classes/NearestAirportNavSource",id:"g3xtouchcommon/classes/NearestAirportNavSource",title:"Class: NearestAirportNavSource<NameType>",description:"A NavReferenceSource that tracks the nearest airport to the airplane and provides information on the airport's",source:"@site/docs/g3xtouchcommon/classes/NearestAirportNavSource.md",sourceDirName:"g3xtouchcommon/classes",slug:"/g3xtouchcommon/classes/NearestAirportNavSource",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NearestAirportNavSource",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NearestAirportNavSource",title:"Class: NearestAirportNavSource<NameType>",sidebar_label:"NearestAirportNavSource",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"NavSourceFormatter",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NavSourceFormatter"},next:{title:"NearestFacilityWaypointArray",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NearestFacilityWaypointArray"}},d={},p=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"activeFrequency",id:"activefrequency",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"bearing",id:"bearing",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"course",id:"course",level:3},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"distance",id:"distance",level:3},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"fields",id:"fields",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"hasDme",id:"hasdme",level:3},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"hasGlideSlope",id:"hasglideslope",level:3},{value:"Implementation of",id:"implementation-of-5",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"hasLocalizer",id:"haslocalizer",level:3},{value:"Implementation of",id:"implementation-of-6",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"hasNav",id:"hasnav",level:3},{value:"Implementation of",id:"implementation-of-7",level:4},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"ident",id:"ident",level:3},{value:"Implementation of",id:"implementation-of-8",level:4},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"index",id:"index",level:3},{value:"Implementation of",id:"implementation-of-9",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"isLocalizer",id:"islocalizer",level:3},{value:"Implementation of",id:"implementation-of-10",level:4},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"lateralDeviation",id:"lateraldeviation",level:3},{value:"Implementation of",id:"implementation-of-11",level:4},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"lateralDeviationScale",id:"lateraldeviationscale",level:3},{value:"Implementation of",id:"implementation-of-12",level:4},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"lateralDeviationScalingMode",id:"lateraldeviationscalingmode",level:3},{value:"Implementation of",id:"implementation-of-13",level:4},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"localizerCourse",id:"localizercourse",level:3},{value:"Implementation of",id:"implementation-of-14",level:4},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"location",id:"location",level:3},{value:"Implementation of",id:"implementation-of-15",level:4},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"name",id:"name",level:3},{value:"Implementation of",id:"implementation-of-16",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"signalStrength",id:"signalstrength",level:3},{value:"Implementation of",id:"implementation-of-17",level:4},{value:"Inherited from",id:"inherited-from-16",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"toFrom",id:"tofrom",level:3},{value:"Implementation of",id:"implementation-of-18",level:4},{value:"Inherited from",id:"inherited-from-17",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"verticalDeviation",id:"verticaldeviation",level:3},{value:"Implementation of",id:"implementation-of-19",level:4},{value:"Inherited from",id:"inherited-from-18",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"verticalDeviationScale",id:"verticaldeviationscale",level:3},{value:"Implementation of",id:"implementation-of-20",level:4},{value:"Inherited from",id:"inherited-from-19",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"Methods",id:"methods",level:2},{value:"clearAll",id:"clearall",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-20",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"getType",id:"gettype",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Implementation of",id:"implementation-of-21",level:4},{value:"Defined in",id:"defined-in-24",level:4}],m={toc:p},s="wrapper";function k(e){let{components:n,...t}=e;return(0,a.kt)(s,(0,i.Z)({},m,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A ",(0,a.kt)("inlineCode",{parentName:"p"},"NavReferenceSource")," that tracks the nearest airport to the airplane and provides information on the airport's\nident, location, bearing, and distance."),(0,a.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"NameType")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"string"))))),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"p"},"AbstractNavReferenceBase")),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"NearestAirportNavSource"))))),(0,a.kt)("h2",{id:"implements"},"Implements"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"NavReferenceSource"),"<",(0,a.kt)("inlineCode",{parentName:"li"},"NameType"),">")),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new NearestAirportNavSource"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NameType"),">","(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"name"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"index"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"fmsPosIndex"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NearestAirportNavSource"},(0,a.kt)("inlineCode",{parentName:"a"},"NearestAirportNavSource")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NameType"),">"),(0,a.kt)("p",null,"Creates a new instance of NearestAirportNavSource."),(0,a.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"NameType")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"string"))))),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"name")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"NameType")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The name of this source.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index of this source.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"fmsPosIndex")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"number"),">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index of the")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NearestAirportNavSource"},(0,a.kt)("inlineCode",{parentName:"a"},"NearestAirportNavSource")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NameType"),">"),(0,a.kt)("h4",{id:"overrides"},"Overrides"),(0,a.kt)("p",null,"AbstractNavReferenceBase.constructor"),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/NavReference/NearestAirportNavSource.ts:41"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"activefrequency"},"activeFrequency"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"activeFrequency"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.activeFrequency"),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.activeFrequency"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:138"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"bearing"},"bearing"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"bearing"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.bearing"),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.bearing"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:86"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"course"},"course"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"course"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.course"),(0,a.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.course"),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:92"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"distance"},"distance"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"distance"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-3"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.distance"),(0,a.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.distance"),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:89"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"fields"},"fields"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"fields"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Map"),"<keyof ",(0,a.kt)("inlineCode",{parentName:"p"},"NavReferenceBase"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"MutableSubscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"any"),">",">"),(0,a.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.fields"),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:158"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"hasdme"},"hasDme"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"hasDme"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-4"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.hasDme"),(0,a.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.hasDme"),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:129"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"hasglideslope"},"hasGlideSlope"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"hasGlideSlope"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-5"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.hasGlideSlope"),(0,a.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.hasGlideSlope"),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:135"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"haslocalizer"},"hasLocalizer"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"hasLocalizer"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-6"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.hasLocalizer"),(0,a.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.hasLocalizer"),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:132"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"hasnav"},"hasNav"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"hasNav"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-7"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.hasNav"),(0,a.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.hasNav"),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:126"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ident"},"ident"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"ident"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-8"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.ident"),(0,a.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.ident"),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:80"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"index"},"index"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"index"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The index of this source."),(0,a.kt)("h4",{id:"implementation-of-9"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.index"),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/NavReference/NearestAirportNavSource.ts:44"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"islocalizer"},"isLocalizer"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"isLocalizer"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-10"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.isLocalizer"),(0,a.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.isLocalizer"),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:123"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"lateraldeviation"},"lateralDeviation"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"lateralDeviation"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-11"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.lateralDeviation"),(0,a.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.lateralDeviation"),(0,a.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:144"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"lateraldeviationscale"},"lateralDeviationScale"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"lateralDeviationScale"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-12"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.lateralDeviationScale"),(0,a.kt)("h4",{id:"inherited-from-12"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.lateralDeviationScale"),(0,a.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:147"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"lateraldeviationscalingmode"},"lateralDeviationScalingMode"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"lateralDeviationScalingMode"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-13"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.lateralDeviationScalingMode"),(0,a.kt)("h4",{id:"inherited-from-13"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.lateralDeviationScalingMode"),(0,a.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:150"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"localizercourse"},"localizerCourse"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"localizerCourse"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-14"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.localizerCourse"),(0,a.kt)("h4",{id:"inherited-from-14"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.localizerCourse"),(0,a.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:95"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"location"},"location"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"location"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"ComputedSubject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"LatLonInterface"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"GeoPointInterface"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-15"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.location"),(0,a.kt)("h4",{id:"inherited-from-15"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.location"),(0,a.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:106"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"name"},"name"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"name"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"NameType")),(0,a.kt)("p",null,"The name of this source."),(0,a.kt)("h4",{id:"implementation-of-16"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.name"),(0,a.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/NavReference/NearestAirportNavSource.ts:43"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"signalstrength"},"signalStrength"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"signalStrength"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-17"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.signalStrength"),(0,a.kt)("h4",{id:"inherited-from-16"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.signalStrength"),(0,a.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:83"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"tofrom"},"toFrom"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"toFrom"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"VorToFrom"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-18"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.toFrom"),(0,a.kt)("h4",{id:"inherited-from-17"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.toFrom"),(0,a.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:141"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"verticaldeviation"},"verticalDeviation"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"verticalDeviation"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-19"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.verticalDeviation"),(0,a.kt)("h4",{id:"inherited-from-18"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.verticalDeviation"),(0,a.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:153"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"verticaldeviationscale"},"verticalDeviationScale"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"verticalDeviationScale"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-20"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.verticalDeviationScale"),(0,a.kt)("h4",{id:"inherited-from-19"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.verticalDeviationScale"),(0,a.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:156"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"clearall"},"clearAll"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"clearAll"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Sets all fields to ",(0,a.kt)("inlineCode",{parentName:"p"},"null"),"."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-20"},"Inherited from"),(0,a.kt)("p",null,"AbstractNavReferenceBase.clearAll"),(0,a.kt)("h4",{id:"defined-in-23"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:183"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"gettype"},"getType"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"getType"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"Gps")),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Gps")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-21"},"Implementation of"),(0,a.kt)("p",null,"NavReferenceSource.getType"),(0,a.kt)("h4",{id:"defined-in-24"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/NavReference/NearestAirportNavSource.ts:77"))}k.isMDXComponent=!0}}]);