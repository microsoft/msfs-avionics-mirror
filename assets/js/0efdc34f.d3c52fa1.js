"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[94930],{3905:(a,e,t)=>{t.d(e,{Zo:()=>v,kt:()=>f});var n=t(67294);function i(a,e,t){return e in a?Object.defineProperty(a,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):a[e]=t,a}function r(a,e){var t=Object.keys(a);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(a);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(a,e).enumerable}))),t.push.apply(t,n)}return t}function d(a){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?r(Object(t),!0).forEach((function(e){i(a,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(e){Object.defineProperty(a,e,Object.getOwnPropertyDescriptor(t,e))}))}return a}function l(a,e){if(null==a)return{};var t,n,i=function(a,e){if(null==a)return{};var t,n,i={},r=Object.keys(a);for(n=0;n<r.length;n++)t=r[n],e.indexOf(t)>=0||(i[t]=a[t]);return i}(a,e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(a);for(n=0;n<r.length;n++)t=r[n],e.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(a,t)&&(i[t]=a[t])}return i}var s=n.createContext({}),o=function(a){var e=n.useContext(s),t=e;return a&&(t="function"==typeof a?a(e):d(d({},e),a)),t},v=function(a){var e=o(a.components);return n.createElement(s.Provider,{value:e},a.children)},m="mdxType",k={inlineCode:"code",wrapper:function(a){var e=a.children;return n.createElement(n.Fragment,{},e)}},c=n.forwardRef((function(a,e){var t=a.components,i=a.mdxType,r=a.originalType,s=a.parentName,v=l(a,["components","mdxType","originalType","parentName"]),m=o(t),c=i,f=m["".concat(s,".").concat(c)]||m[c]||k[c]||r;return t?n.createElement(f,d(d({ref:e},v),{},{components:t})):n.createElement(f,d({ref:e},v))}));function f(a,e){var t=arguments,i=e&&e.mdxType;if("string"==typeof a||i){var r=t.length,d=new Array(r);d[0]=c;var l={};for(var s in e)hasOwnProperty.call(e,s)&&(l[s]=e[s]);l.originalType=a,l[m]="string"==typeof a?a:i,d[1]=l;for(var o=2;o<r;o++)d[o]=t[o];return n.createElement.apply(null,d)}return n.createElement.apply(null,t)}c.displayName="MDXCreateElement"},3232:(a,e,t)=>{t.r(e),t.d(e,{assets:()=>s,contentTitle:()=>d,default:()=>k,frontMatter:()=>r,metadata:()=>l,toc:()=>o});var n=t(87462),i=(t(67294),t(3905));const r={id:"LNavDataEvents",title:"Interface: LNavDataEvents",sidebar_label:"LNavDataEvents",sidebar_position:0,custom_edit_url:null},d=void 0,l={unversionedId:"garminsdk/interfaces/LNavDataEvents",id:"garminsdk/interfaces/LNavDataEvents",title:"Interface: LNavDataEvents",description:"Events related to Garmin LNAV.",source:"@site/docs/garminsdk/interfaces/LNavDataEvents.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/LNavDataEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/LNavDataEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"LNavDataEvents",title:"Interface: LNavDataEvents",sidebar_label:"LNavDataEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"ImgTouchButtonProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/ImgTouchButtonProps"},next:{title:"LNavDataSimVarEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/LNavDataSimVarEvents"}},s={},o=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"lnavdata_cdi_scale",id:"lnavdata_cdi_scale",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"lnavdata_cdi_scale_label",id:"lnavdata_cdi_scale_label",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"lnavdata_destination_distance",id:"lnavdata_destination_distance",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"lnavdata_destination_icao",id:"lnavdata_destination_icao",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"lnavdata_destination_ident",id:"lnavdata_destination_ident",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"lnavdata_destination_runway_icao",id:"lnavdata_destination_runway_icao",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"lnavdata_dtk_mag",id:"lnavdata_dtk_mag",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"lnavdata_dtk_true",id:"lnavdata_dtk_true",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"lnavdata_dtk_vector",id:"lnavdata_dtk_vector",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"lnavdata_egress_distance",id:"lnavdata_egress_distance",level:3},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"lnavdata_next_dtk_mag",id:"lnavdata_next_dtk_mag",level:3},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"lnavdata_next_dtk_true",id:"lnavdata_next_dtk_true",level:3},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"lnavdata_next_dtk_vector",id:"lnavdata_next_dtk_vector",level:3},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"lnavdata_tofrom",id:"lnavdata_tofrom",level:3},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"lnavdata_waypoint_bearing_mag",id:"lnavdata_waypoint_bearing_mag",level:3},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"lnavdata_waypoint_bearing_true",id:"lnavdata_waypoint_bearing_true",level:3},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"lnavdata_waypoint_distance",id:"lnavdata_waypoint_distance",level:3},{value:"Inherited from",id:"inherited-from-16",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"lnavdata_waypoint_ident",id:"lnavdata_waypoint_ident",level:3},{value:"Inherited from",id:"inherited-from-17",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"lnavdata_xtk",id:"lnavdata_xtk",level:3},{value:"Inherited from",id:"inherited-from-18",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"obs_available",id:"obs_available",level:3},{value:"Inherited from",id:"inherited-from-19",level:4},{value:"Defined in",id:"defined-in-19",level:4}],v={toc:o},m="wrapper";function k(a){let{components:e,...t}=a;return(0,i.kt)(m,(0,n.Z)({},v,t,{components:e,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Events related to Garmin LNAV."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},(0,i.kt)("inlineCode",{parentName:"a"},"BaseLNavDataEvents")))),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#indexedlnavdataevents"},(0,i.kt)("inlineCode",{parentName:"a"},"IndexedLNavDataEvents"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"LNavDataEvents"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"lnavdata_cdi_scale"},"lnavdata","_","cdi","_","scale"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","cdi","_","scale"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The current CDI scale, in nautical miles."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_cdi_scale"},"lnavdata_cdi_scale")),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:55"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_cdi_scale_label"},"lnavdata","_","cdi","_","scale","_","label"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","cdi","_","scale","_","label"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/CDIScaleLabel"},(0,i.kt)("inlineCode",{parentName:"a"},"CDIScaleLabel"))),(0,i.kt)("p",null,"The current CDI scale label."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_cdi_scale_label"},"lnavdata_cdi_scale_label")),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:74"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_destination_distance"},"lnavdata","_","destination","_","distance"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","destination","_","distance"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal distance remaining to the destination, in nautical miles."),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_destination_distance"},"lnavdata_destination_distance")),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:67"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_destination_icao"},"lnavdata","_","destination","_","icao"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","destination","_","icao"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The ICAO of the active flight plan destination, or the empty string if there is no destination."),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_destination_icao"},"lnavdata_destination_icao")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:95"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_destination_ident"},"lnavdata","_","destination","_","ident"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","destination","_","ident"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The ident of the active flight plan destination, or the empty string if there is no destination."),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_destination_ident"},"lnavdata_destination_ident")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:98"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_destination_runway_icao"},"lnavdata","_","destination","_","runway","_","icao"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","destination","_","runway","_","icao"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The ICAO of the active flight plan destination runway, or the empty string if there is no destination runway."),(0,i.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_destination_runway_icao"},"lnavdata_destination_runway_icao")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:101"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_dtk_mag"},"lnavdata","_","dtk","_","mag"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","dtk","_","mag"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The current nominal desired track, in degrees magnetic."),(0,i.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_dtk_mag"},"lnavdata_dtk_mag")),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:46"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_dtk_true"},"lnavdata","_","dtk","_","true"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","dtk","_","true"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The current nominal desired track, in degrees true."),(0,i.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_dtk_true"},"lnavdata_dtk_true")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:43"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_dtk_vector"},"lnavdata","_","dtk","_","vector"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","dtk","_","vector"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#lnavdatadtkvector"},(0,i.kt)("inlineCode",{parentName:"a"},"LNavDataDtkVector"))),(0,i.kt)("p",null,"Information on the nominal current desired track vector."),(0,i.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_dtk_vector"},"lnavdata_dtk_vector")),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:104"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_egress_distance"},"lnavdata","_","egress","_","distance"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","egress","_","distance"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal along-track distance remaining to the egress transition of the currently tracked flight plan leg, in nautical miles."),(0,i.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_egress_distance"},"lnavdata_egress_distance")),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:77"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_next_dtk_mag"},"lnavdata","_","next","_","dtk","_","mag"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","next","_","dtk","_","mag"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal desired track at the beginning of the flight plan leg following the currently tracked leg, in degrees magnetic."),(0,i.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_next_dtk_mag"},"lnavdata_next_dtk_mag")),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:71"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_next_dtk_true"},"lnavdata","_","next","_","dtk","_","true"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","next","_","dtk","_","true"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal desired track at the beginning of the flight plan leg following the currently tracked leg, in degrees true."),(0,i.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_next_dtk_true"},"lnavdata_next_dtk_true")),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:68"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_next_dtk_vector"},"lnavdata","_","next","_","dtk","_","vector"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","next","_","dtk","_","vector"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#lnavdatadtkvector"},(0,i.kt)("inlineCode",{parentName:"a"},"LNavDataDtkVector"))),(0,i.kt)("p",null,"Information on the nominal next desired track vector."),(0,i.kt)("h4",{id:"inherited-from-12"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_next_dtk_vector"},"lnavdata_next_dtk_vector")),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:107"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_tofrom"},"lnavdata","_","tofrom"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","tofrom"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"VorToFrom")),(0,i.kt)("p",null,"The nominal TO/FROM flag."),(0,i.kt)("h4",{id:"inherited-from-13"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_tofrom"},"lnavdata_tofrom")),(0,i.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:80"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_waypoint_bearing_mag"},"lnavdata","_","waypoint","_","bearing","_","mag"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","waypoint","_","bearing","_","mag"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal bearing to the next waypoint tracked by LNAV, in degrees magnetic."),(0,i.kt)("h4",{id:"inherited-from-14"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_waypoint_bearing_mag"},"lnavdata_waypoint_bearing_mag")),(0,i.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:61"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_waypoint_bearing_true"},"lnavdata","_","waypoint","_","bearing","_","true"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","waypoint","_","bearing","_","true"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal bearing to the next waypoint currently tracked by LNAV, in degrees true."),(0,i.kt)("h4",{id:"inherited-from-15"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_waypoint_bearing_true"},"lnavdata_waypoint_bearing_true")),(0,i.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:58"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_waypoint_distance"},"lnavdata","_","waypoint","_","distance"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","waypoint","_","distance"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal distance remaining to the next waypoint currently tracked by LNAV, in nautical miles."),(0,i.kt)("h4",{id:"inherited-from-16"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_waypoint_distance"},"lnavdata_waypoint_distance")),(0,i.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:64"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_waypoint_ident"},"lnavdata","_","waypoint","_","ident"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","waypoint","_","ident"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The nominal ident of the next waypoint tracked by LNAV."),(0,i.kt)("h4",{id:"inherited-from-17"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_waypoint_ident"},"lnavdata_waypoint_ident")),(0,i.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:82"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_xtk"},"lnavdata","_","xtk"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","xtk"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The current nominal crosstrack error, in nautical miles. Negative values indicate deviation to the left, as viewed\nwhen facing in the direction of the track. Positive values indicate deviation to the right."),(0,i.kt)("h4",{id:"inherited-from-18"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_xtk"},"lnavdata_xtk")),(0,i.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:52"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"obs_available"},"obs","_","available"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"obs","_","available"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether OBS mode can be activated on the current active flight plan leg."),(0,i.kt)("h4",{id:"inherited-from-19"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#obs_available"},"obs_available")),(0,i.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:110"))}k.isMDXComponent=!0}}]);