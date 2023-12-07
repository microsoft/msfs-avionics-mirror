"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[69140],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function d(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=a.createContext({}),s=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):d(d({},t),e)),n},p=function(e){var t=s(e.components);return a.createElement(l.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,l=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=s(n),c=i,f=m["".concat(l,".").concat(c)]||m[c]||k[c]||r;return n?a.createElement(f,d(d({ref:t},p),{},{components:n})):a.createElement(f,d({ref:t},p))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,d=new Array(r);d[0]=c;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[m]="string"==typeof e?e:i,d[1]=o;for(var s=2;s<r;s++)d[s]=n[s];return a.createElement.apply(null,d)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},20:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>d,default:()=>k,frontMatter:()=>r,metadata:()=>o,toc:()=>s});var a=n(87462),i=(n(67294),n(3905));const r={id:"DefaultAirspeedIndicatorDataProvider",title:"Class: DefaultAirspeedIndicatorDataProvider",sidebar_label:"DefaultAirspeedIndicatorDataProvider",sidebar_position:0,custom_edit_url:null},d=void 0,o={unversionedId:"garminsdk/classes/DefaultAirspeedIndicatorDataProvider",id:"garminsdk/classes/DefaultAirspeedIndicatorDataProvider",title:"Class: DefaultAirspeedIndicatorDataProvider",description:"A default implementation of AirspeedIndicatorDataProvider.",source:"@site/docs/garminsdk/classes/DefaultAirspeedIndicatorDataProvider.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/DefaultAirspeedIndicatorDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultAirspeedIndicatorDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"DefaultAirspeedIndicatorDataProvider",title:"Class: DefaultAirspeedIndicatorDataProvider",sidebar_label:"DefaultAirspeedIndicatorDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"DateTimeUserSettings",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DateTimeUserSettings"},next:{title:"DefaultAltimeterDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultAltimeterDataProvider"}},l={},s=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"airspeedAlerts",id:"airspeedalerts",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"iasKnots",id:"iasknots",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"iasTrend",id:"iastrend",level:3},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"isAirspeedHoldActive",id:"isairspeedholdactive",level:3},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"isDataFailed",id:"isdatafailed",level:3},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"isOverspeedProtectionActive",id:"isoverspeedprotectionactive",level:3},{value:"Implementation of",id:"implementation-of-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"isUnderspeedProtectionActive",id:"isunderspeedprotectionactive",level:3},{value:"Implementation of",id:"implementation-of-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"mach",id:"mach",level:3},{value:"Implementation of",id:"implementation-of-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"machToKias",id:"machtokias",level:3},{value:"Implementation of",id:"implementation-of-8",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"normAoaIasCoef",id:"normaoaiascoef",level:3},{value:"Implementation of",id:"implementation-of-9",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"overspeedThreshold",id:"overspeedthreshold",level:3},{value:"Implementation of",id:"implementation-of-10",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"pressureAlt",id:"pressurealt",level:3},{value:"Implementation of",id:"implementation-of-11",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"referenceIas",id:"referenceias",level:3},{value:"Implementation of",id:"implementation-of-12",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"referenceIsManual",id:"referenceismanual",level:3},{value:"Implementation of",id:"implementation-of-13",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"referenceMach",id:"referencemach",level:3},{value:"Implementation of",id:"implementation-of-14",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"tasKnots",id:"tasknots",level:3},{value:"Implementation of",id:"implementation-of-15",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"tasToIas",id:"tastoias",level:3},{value:"Implementation of",id:"implementation-of-16",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"estimateIasFromNormAoa",id:"estimateiasfromnormaoa",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of-17",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"init",id:"init",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"pause",id:"pause",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"resume",id:"resume",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-22",level:4}],p={toc:s},m="wrapper";function k(e){let{components:t,...n}=e;return(0,i.kt)(m,(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A default implementation of ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),"."),(0,i.kt)("h2",{id:"implements"},"Implements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"AirspeedIndicatorDataProvider")))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new DefaultAirspeedIndicatorDataProvider"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"adcIndex"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"options"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"aoaDataProvider?"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"trendInputSmoothingTau?"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"trendTrendSmoothingTau?"),")"),(0,i.kt)("p",null,"Constructor."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"bus")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"adcIndex")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"number"),">"),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The index of the ADC that is the source of this provider's data.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"options")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/modules#airspeedindicatordataprovideroptions"},(0,i.kt)("inlineCode",{parentName:"a"},"AirspeedIndicatorDataProviderOptions")),">"),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Configuration options for this provider.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"aoaDataProvider?")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedAoaDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"AirspeedAoaDataProvider"))),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"A provider of angle of attack data.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"trendInputSmoothingTau")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"DefaultAirspeedIndicatorDataProvider.DEFAULT_IAS_TREND_INPUT_SMOOTHING_TAU")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The smoothing time constant, in milliseconds, to apply to the IAS lookahead trend's input values. Defaults to ",(0,i.kt)("inlineCode",{parentName:"td"},"2000 / ln(2)"),".")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"trendTrendSmoothingTau")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"DefaultAirspeedIndicatorDataProvider.DEFAULT_IAS_TREND_TREND_SMOOTHING_TAU")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The smoothing time constant, in milliseconds, to apply to the IAS lookahead trend values. Defaults to ",(0,i.kt)("inlineCode",{parentName:"td"},"1000 / ln(2)"),".")))),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:235"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"airspeedalerts"},"airspeedAlerts"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"airspeedAlerts"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current active airspeed alerts, as bitflags."),(0,i.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#airspeedalerts"},"airspeedAlerts")),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:164"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"iasknots"},"iasKnots"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"iasKnots"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current indicated airspeed, in knots."),(0,i.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#iasknots"},"iasKnots")),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:121"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"iastrend"},"iasTrend"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"iasTrend"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current airspeed trend, in knots."),(0,i.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#iastrend"},"iasTrend")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:145"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isairspeedholdactive"},"isAirspeedHoldActive"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"isAirspeedHoldActive"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether an airspeed hold mode is active on the flight director."),(0,i.kt)("h4",{id:"implementation-of-3"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#isairspeedholdactive"},"isAirspeedHoldActive")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:160"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isdatafailed"},"isDataFailed"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"isDataFailed"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether airspeed data is in a failure state."),(0,i.kt)("h4",{id:"implementation-of-4"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#isdatafailed"},"isDataFailed")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:179"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isoverspeedprotectionactive"},"isOverspeedProtectionActive"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"isOverspeedProtectionActive"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether autopilot overspeed protection is active."),(0,i.kt)("h4",{id:"implementation-of-5"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#isoverspeedprotectionactive"},"isOverspeedProtectionActive")),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:168"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isunderspeedprotectionactive"},"isUnderspeedProtectionActive"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"isUnderspeedProtectionActive"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether autopilot underspeed protection is active."),(0,i.kt)("h4",{id:"implementation-of-6"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#isunderspeedprotectionactive"},"isUnderspeedProtectionActive")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:172"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"mach"},"mach"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"mach"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current mach number."),(0,i.kt)("h4",{id:"implementation-of-7"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#mach"},"mach")),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:129"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"machtokias"},"machToKias"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"machToKias"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current conversion factor from mach number to knots indicated airspeed."),(0,i.kt)("h4",{id:"implementation-of-8"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#machtokias"},"machToKias")),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:133"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"normaoaiascoef"},"normAoaIasCoef"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"normAoaIasCoef"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The correlation coefficient between a given normalized angle of attack and the estimated indicated airspeed in\nknots required to maintain level flight at that angle of attack for the current aircraft configuration and\nenvironment, or ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," if such a value cannot be calculated."),(0,i.kt)("h4",{id:"implementation-of-9"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#normaoaiascoef"},"normAoaIasCoef")),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:175"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"overspeedthreshold"},"overspeedThreshold"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"overspeedThreshold"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current threshold for an overspeed condition."),(0,i.kt)("h4",{id:"implementation-of-10"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#overspeedthreshold"},"overspeedThreshold")),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:207"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"pressurealt"},"pressureAlt"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"pressureAlt"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current pressure altitude, in feet."),(0,i.kt)("h4",{id:"implementation-of-11"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#pressurealt"},"pressureAlt")),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:141"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"referenceias"},"referenceIas"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"referenceIas"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current reference indicated airspeed, or ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," if no such value exists."),(0,i.kt)("h4",{id:"implementation-of-12"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#referenceias"},"referenceIas")),(0,i.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:149"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"referenceismanual"},"referenceIsManual"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"referenceIsManual"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether the current reference airspeed was set manually."),(0,i.kt)("h4",{id:"implementation-of-13"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#referenceismanual"},"referenceIsManual")),(0,i.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:157"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"referencemach"},"referenceMach"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"referenceMach"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current reference mach number, or ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," if no such value exists."),(0,i.kt)("h4",{id:"implementation-of-14"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#referencemach"},"referenceMach")),(0,i.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:153"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"tasknots"},"tasKnots"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"tasKnots"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current true airspeed, in knots."),(0,i.kt)("h4",{id:"implementation-of-15"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#tasknots"},"tasKnots")),(0,i.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:125"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"tastoias"},"tasToIas"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"tasToIas"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current conversion factor from true airspeed to indicated airspeed."),(0,i.kt)("h4",{id:"implementation-of-16"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#tastoias"},"tasToIas")),(0,i.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:137"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"destroy"},"destroy"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can\nno longer be paused or resumed."),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:492"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"estimateiasfromnormaoa"},"estimateIasFromNormAoa"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"estimateIasFromNormAoa"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"normAoa"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"Estimates the indicated airspeed, in knots, required to maintain level flight at a given normalized angle of\nattack value for the current aircraft configuration and environment. Normalized angle of attack is defined such\nthat ",(0,i.kt)("inlineCode",{parentName:"p"},"0")," equals zero-lift AoA, and ",(0,i.kt)("inlineCode",{parentName:"p"},"1")," equals stall AoA."),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"normAoa")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},"A normalized angle of attack value.")))),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The estimated indicated airspeed, in knots, required to maintain level flight at the specified angle of\nattack, or ",(0,i.kt)("inlineCode",{parentName:"p"},"NaN")," if an estimate cannot be made."),(0,i.kt)("h4",{id:"implementation-of-17"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider"},"AirspeedIndicatorDataProvider"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/AirspeedIndicatorDataProvider#estimateiasfromnormaoa"},"estimateIasFromNormAoa")),(0,i.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:398"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"init"},"init"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"init"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Initializes this data provider. Once initialized"),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"Error if this data provider is dead."),(0,i.kt)("h4",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"paused")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"false")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether to initialize this data provider as paused. If ",(0,i.kt)("inlineCode",{parentName:"td"},"true"),", this data provider will provide an initial set of data but will not update the provided data until it is resumed. Defaults to ",(0,i.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:290"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"pause"},"pause"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"pause"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Pauses this data provider. Once paused, this data provider will not update its data until it is resumed."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"Error if this data provider is dead."),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:447"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"resume"},"resume"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"resume"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or\ndestroyed."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"Error if this data provider is dead."),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/airspeed/AirspeedIndicatorDataProvider.ts:407"))}k.isMDXComponent=!0}}]);