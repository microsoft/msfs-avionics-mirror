"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[94930],{3905:(e,a,t)=>{t.d(a,{Zo:()=>o,kt:()=>p});var n=t(67294);function i(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}function r(e,a){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);a&&(n=n.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),t.push.apply(t,n)}return t}function d(e){for(var a=1;a<arguments.length;a++){var t=null!=arguments[a]?arguments[a]:{};a%2?r(Object(t),!0).forEach((function(a){i(e,a,t[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))}))}return e}function l(e,a){if(null==e)return{};var t,n,i=function(e,a){if(null==e)return{};var t,n,i={},r=Object.keys(e);for(n=0;n<r.length;n++)t=r[n],a.indexOf(t)>=0||(i[t]=e[t]);return i}(e,a);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)t=r[n],a.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var s=n.createContext({}),v=function(e){var a=n.useContext(s),t=a;return e&&(t="function"==typeof e?e(a):d(d({},a),e)),t},o=function(e){var a=v(e.components);return n.createElement(s.Provider,{value:a},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var a=e.children;return n.createElement(n.Fragment,{},a)}},c=n.forwardRef((function(e,a){var t=e.components,i=e.mdxType,r=e.originalType,s=e.parentName,o=l(e,["components","mdxType","originalType","parentName"]),m=v(t),c=i,p=m["".concat(s,".").concat(c)]||m[c]||k[c]||r;return t?n.createElement(p,d(d({ref:a},o),{},{components:t})):n.createElement(p,d({ref:a},o))}));function p(e,a){var t=arguments,i=a&&a.mdxType;if("string"==typeof e||i){var r=t.length,d=new Array(r);d[0]=c;var l={};for(var s in a)hasOwnProperty.call(a,s)&&(l[s]=a[s]);l.originalType=e,l[m]="string"==typeof e?e:i,d[1]=l;for(var v=2;v<r;v++)d[v]=t[v];return n.createElement.apply(null,d)}return n.createElement.apply(null,t)}c.displayName="MDXCreateElement"},3232:(e,a,t)=>{t.r(a),t.d(a,{assets:()=>s,contentTitle:()=>d,default:()=>k,frontMatter:()=>r,metadata:()=>l,toc:()=>v});var n=t(87462),i=(t(67294),t(3905));const r={id:"LNavDataEvents",title:"Interface: LNavDataEvents",sidebar_label:"LNavDataEvents",sidebar_position:0,custom_edit_url:null},d=void 0,l={unversionedId:"garminsdk/interfaces/LNavDataEvents",id:"garminsdk/interfaces/LNavDataEvents",title:"Interface: LNavDataEvents",description:"Events related to Garmin LNAV.",source:"@site/docs/garminsdk/interfaces/LNavDataEvents.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/LNavDataEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/LNavDataEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"LNavDataEvents",title:"Interface: LNavDataEvents",sidebar_label:"LNavDataEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"ImgTouchButtonProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/ImgTouchButtonProps"},next:{title:"LNavDataSimVarEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/LNavDataSimVarEvents"}},s={},v=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"lnavdata_cdi_scale",id:"lnavdata_cdi_scale",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"lnavdata_cdi_scale_label",id:"lnavdata_cdi_scale_label",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"lnavdata_destination_distance",id:"lnavdata_destination_distance",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"lnavdata_destination_icao",id:"lnavdata_destination_icao",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"lnavdata_destination_ident",id:"lnavdata_destination_ident",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"lnavdata_destination_runway_icao",id:"lnavdata_destination_runway_icao",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"lnavdata_dtk_mag",id:"lnavdata_dtk_mag",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"lnavdata_dtk_true",id:"lnavdata_dtk_true",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"lnavdata_dtk_vector",id:"lnavdata_dtk_vector",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"lnavdata_egress_distance",id:"lnavdata_egress_distance",level:3},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"lnavdata_next_dtk_mag",id:"lnavdata_next_dtk_mag",level:3},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"lnavdata_next_dtk_true",id:"lnavdata_next_dtk_true",level:3},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"lnavdata_next_dtk_vector",id:"lnavdata_next_dtk_vector",level:3},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"lnavdata_waypoint_bearing_mag",id:"lnavdata_waypoint_bearing_mag",level:3},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"lnavdata_waypoint_bearing_true",id:"lnavdata_waypoint_bearing_true",level:3},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"lnavdata_waypoint_distance",id:"lnavdata_waypoint_distance",level:3},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"lnavdata_waypoint_ident",id:"lnavdata_waypoint_ident",level:3},{value:"Inherited from",id:"inherited-from-16",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"lnavdata_xtk",id:"lnavdata_xtk",level:3},{value:"Inherited from",id:"inherited-from-17",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"obs_available",id:"obs_available",level:3},{value:"Inherited from",id:"inherited-from-18",level:4},{value:"Defined in",id:"defined-in-18",level:4}],o={toc:v},m="wrapper";function k(e){let{components:a,...t}=e;return(0,i.kt)(m,(0,n.Z)({},o,t,{components:a,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Events related to Garmin LNAV."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},(0,i.kt)("inlineCode",{parentName:"a"},"BaseLNavDataEvents")))),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#indexedlnavdataevents"},(0,i.kt)("inlineCode",{parentName:"a"},"IndexedLNavDataEvents"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"LNavDataEvents"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"lnavdata_cdi_scale"},"lnavdata","_","cdi","_","scale"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","cdi","_","scale"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The current CDI scale, in nautical miles."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_cdi_scale"},"lnavdata_cdi_scale")),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:55"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_cdi_scale_label"},"lnavdata","_","cdi","_","scale","_","label"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","cdi","_","scale","_","label"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/CDIScaleLabel"},(0,i.kt)("inlineCode",{parentName:"a"},"CDIScaleLabel"))),(0,i.kt)("p",null,"The current CDI scale label."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_cdi_scale_label"},"lnavdata_cdi_scale_label")),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:68"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_destination_distance"},"lnavdata","_","destination","_","distance"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","destination","_","distance"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal distance remaining to the destination, in nautical miles."),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_destination_distance"},"lnavdata_destination_distance")),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:67"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_destination_icao"},"lnavdata","_","destination","_","icao"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","destination","_","icao"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The ICAO of the active flight plan destination, or the empty string if there is no destination."),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_destination_icao"},"lnavdata_destination_icao")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:86"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_destination_ident"},"lnavdata","_","destination","_","ident"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","destination","_","ident"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The ident of the active flight plan destination, or the empty string if there is no destination."),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_destination_ident"},"lnavdata_destination_ident")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:89"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_destination_runway_icao"},"lnavdata","_","destination","_","runway","_","icao"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","destination","_","runway","_","icao"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The ICAO of the active flight plan destination runway, or the empty string if there is no destination runway."),(0,i.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_destination_runway_icao"},"lnavdata_destination_runway_icao")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:92"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_dtk_mag"},"lnavdata","_","dtk","_","mag"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","dtk","_","mag"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The current nominal desired track, in degrees magnetic."),(0,i.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_dtk_mag"},"lnavdata_dtk_mag")),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:46"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_dtk_true"},"lnavdata","_","dtk","_","true"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","dtk","_","true"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The current nominal desired track, in degrees true."),(0,i.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_dtk_true"},"lnavdata_dtk_true")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:43"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_dtk_vector"},"lnavdata","_","dtk","_","vector"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","dtk","_","vector"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#lnavdatadtkvector"},(0,i.kt)("inlineCode",{parentName:"a"},"LNavDataDtkVector"))),(0,i.kt)("p",null,"Information on the nominal current desired track vector."),(0,i.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_dtk_vector"},"lnavdata_dtk_vector")),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:95"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_egress_distance"},"lnavdata","_","egress","_","distance"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","egress","_","distance"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal along-track distance remaining to the egress transition of the currently tracked flight plan leg, in nautical miles."),(0,i.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_egress_distance"},"lnavdata_egress_distance")),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:71"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_next_dtk_mag"},"lnavdata","_","next","_","dtk","_","mag"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","next","_","dtk","_","mag"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal desired track at the beginning of the flight plan leg following the currently tracked leg, in degrees magnetic."),(0,i.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_next_dtk_mag"},"lnavdata_next_dtk_mag")),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:65"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_next_dtk_true"},"lnavdata","_","next","_","dtk","_","true"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","next","_","dtk","_","true"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal desired track at the beginning of the flight plan leg following the currently tracked leg, in degrees true."),(0,i.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_next_dtk_true"},"lnavdata_next_dtk_true")),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:62"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_next_dtk_vector"},"lnavdata","_","next","_","dtk","_","vector"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","next","_","dtk","_","vector"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#lnavdatadtkvector"},(0,i.kt)("inlineCode",{parentName:"a"},"LNavDataDtkVector"))),(0,i.kt)("p",null,"Information on the nominal next desired track vector."),(0,i.kt)("h4",{id:"inherited-from-12"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_next_dtk_vector"},"lnavdata_next_dtk_vector")),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:98"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_waypoint_bearing_mag"},"lnavdata","_","waypoint","_","bearing","_","mag"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","waypoint","_","bearing","_","mag"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal bearing to the next waypoint tracked by LNAV, in degrees magnetic."),(0,i.kt)("h4",{id:"inherited-from-13"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_waypoint_bearing_mag"},"lnavdata_waypoint_bearing_mag")),(0,i.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:61"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_waypoint_bearing_true"},"lnavdata","_","waypoint","_","bearing","_","true"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","waypoint","_","bearing","_","true"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal bearing to the next waypoint currently tracked by LNAV, in degrees true."),(0,i.kt)("h4",{id:"inherited-from-14"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_waypoint_bearing_true"},"lnavdata_waypoint_bearing_true")),(0,i.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:58"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_waypoint_distance"},"lnavdata","_","waypoint","_","distance"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","waypoint","_","distance"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The nominal distance remaining to the next waypoint currently tracked by LNAV, in nautical miles."),(0,i.kt)("h4",{id:"inherited-from-15"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_waypoint_distance"},"lnavdata_waypoint_distance")),(0,i.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:64"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_waypoint_ident"},"lnavdata","_","waypoint","_","ident"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","waypoint","_","ident"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The nominal ident of the next waypoint tracked by LNAV."),(0,i.kt)("h4",{id:"inherited-from-16"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_waypoint_ident"},"lnavdata_waypoint_ident")),(0,i.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:82"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lnavdata_xtk"},"lnavdata","_","xtk"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"lnavdata","_","xtk"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The current nominal crosstrack error, in nautical miles. Negative values indicate deviation to the left, as viewed\nwhen facing in the direction of the track. Positive values indicate deviation to the right."),(0,i.kt)("h4",{id:"inherited-from-17"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#lnavdata_xtk"},"lnavdata_xtk")),(0,i.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/lnav/LNavDataEvents.ts:52"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"obs_available"},"obs","_","available"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"obs","_","available"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether OBS mode can be activated on the current active flight plan leg."),(0,i.kt)("h4",{id:"inherited-from-18"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents"},"BaseLNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseLNavDataEvents#obs_available"},"obs_available")),(0,i.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navigation/LNavDataEvents.ts:101"))}k.isMDXComponent=!0}}]);