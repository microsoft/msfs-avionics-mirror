"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[83124],{3905:(e,a,t)=>{t.d(a,{Zo:()=>v,kt:()=>f});var n=t(67294);function r(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}function i(e,a){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);a&&(n=n.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),t.push.apply(t,n)}return t}function d(e){for(var a=1;a<arguments.length;a++){var t=null!=arguments[a]?arguments[a]:{};a%2?i(Object(t),!0).forEach((function(a){r(e,a,t[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))}))}return e}function l(e,a){if(null==e)return{};var t,n,r=function(e,a){if(null==e)return{};var t,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],a.indexOf(t)>=0||(r[t]=e[t]);return r}(e,a);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],a.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var o=n.createContext({}),s=function(e){var a=n.useContext(o),t=a;return e&&(t="function"==typeof e?e(a):d(d({},a),e)),t},v=function(e){var a=s(e.components);return n.createElement(o.Provider,{value:a},e.children)},m="mdxType",p={inlineCode:"code",wrapper:function(e){var a=e.children;return n.createElement(n.Fragment,{},a)}},c=n.forwardRef((function(e,a){var t=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,v=l(e,["components","mdxType","originalType","parentName"]),m=s(t),c=r,f=m["".concat(o,".").concat(c)]||m[c]||p[c]||i;return t?n.createElement(f,d(d({ref:a},v),{},{components:t})):n.createElement(f,d({ref:a},v))}));function f(e,a){var t=arguments,r=a&&a.mdxType;if("string"==typeof e||r){var i=t.length,d=new Array(i);d[0]=c;var l={};for(var o in a)hasOwnProperty.call(a,o)&&(l[o]=a[o]);l.originalType=e,l[m]="string"==typeof e?e:r,d[1]=l;for(var s=2;s<i;s++)d[s]=t[s];return n.createElement.apply(null,d)}return n.createElement.apply(null,t)}c.displayName="MDXCreateElement"},91521:(e,a,t)=>{t.r(a),t.d(a,{assets:()=>o,contentTitle:()=>d,default:()=>p,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var n=t(87462),r=(t(67294),t(3905));const i={id:"LNavDataEvents",title:"Interface: LNavDataEvents",sidebar_label:"LNavDataEvents",sidebar_position:0,custom_edit_url:null},d=void 0,l={unversionedId:"framework/interfaces/LNavDataEvents",id:"framework/interfaces/LNavDataEvents",title:"Interface: LNavDataEvents",description:"Events related to LNAV data.",source:"@site/docs/framework/interfaces/LNavDataEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/LNavDataEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"LNavDataEvents",title:"Interface: LNavDataEvents",sidebar_label:"LNavDataEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"JetFadecMode",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/JetFadecMode"},next:{title:"LNavDataSimVarEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents"}},o={},s=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"lnavdata_cdi_scale",id:"lnavdata_cdi_scale",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"lnavdata_destination_distance",id:"lnavdata_destination_distance",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"lnavdata_dtk_mag",id:"lnavdata_dtk_mag",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"lnavdata_dtk_true",id:"lnavdata_dtk_true",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"lnavdata_waypoint_bearing_mag",id:"lnavdata_waypoint_bearing_mag",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"lnavdata_waypoint_bearing_true",id:"lnavdata_waypoint_bearing_true",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"lnavdata_waypoint_distance",id:"lnavdata_waypoint_distance",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"lnavdata_waypoint_ident",id:"lnavdata_waypoint_ident",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"lnavdata_xtk",id:"lnavdata_xtk",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-8",level:4}],v={toc:s},m="wrapper";function p(e){let{components:a,...t}=e;return(0,r.kt)(m,(0,n.Z)({},v,t,{components:a,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Events related to LNAV data."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents"},(0,r.kt)("inlineCode",{parentName:"a"},"LNavDataSimVarEvents"))),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"LNavDataEvents"))))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"lnavdata_cdi_scale"},"lnavdata","_","cdi","_","scale"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnavdata","_","cdi","_","scale"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The current CDI scale, in nautical miles."),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents"},"LNavDataSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents#lnavdata_cdi_scale"},"lnavdata_cdi_scale")),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/data/LNavDataEvents.ts:54"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnavdata_destination_distance"},"lnavdata","_","destination","_","distance"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnavdata","_","destination","_","distance"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The nominal distance remaining to the destination, in nautical miles."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents"},"LNavDataSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents#lnavdata_destination_distance"},"lnavdata_destination_distance")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/data/LNavDataEvents.ts:66"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnavdata_dtk_mag"},"lnavdata","_","dtk","_","mag"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnavdata","_","dtk","_","mag"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The current nominal desired track, in degrees magnetic."),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents"},"LNavDataSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents#lnavdata_dtk_mag"},"lnavdata_dtk_mag")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/data/LNavDataEvents.ts:45"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnavdata_dtk_true"},"lnavdata","_","dtk","_","true"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnavdata","_","dtk","_","true"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The current nominal desired track, in degrees true."),(0,r.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents"},"LNavDataSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents#lnavdata_dtk_true"},"lnavdata_dtk_true")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/data/LNavDataEvents.ts:42"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnavdata_waypoint_bearing_mag"},"lnavdata","_","waypoint","_","bearing","_","mag"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnavdata","_","waypoint","_","bearing","_","mag"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The nominal bearing to the next waypoint tracked by LNAV, in degrees magnetic."),(0,r.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents"},"LNavDataSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents#lnavdata_waypoint_bearing_mag"},"lnavdata_waypoint_bearing_mag")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/data/LNavDataEvents.ts:60"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnavdata_waypoint_bearing_true"},"lnavdata","_","waypoint","_","bearing","_","true"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnavdata","_","waypoint","_","bearing","_","true"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The nominal bearing to the next waypoint currently tracked by LNAV, in degrees true."),(0,r.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents"},"LNavDataSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents#lnavdata_waypoint_bearing_true"},"lnavdata_waypoint_bearing_true")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/data/LNavDataEvents.ts:57"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnavdata_waypoint_distance"},"lnavdata","_","waypoint","_","distance"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnavdata","_","waypoint","_","distance"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The nominal distance remaining to the next waypoint currently tracked by LNAV, in nautical miles."),(0,r.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents"},"LNavDataSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents#lnavdata_waypoint_distance"},"lnavdata_waypoint_distance")),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/data/LNavDataEvents.ts:63"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnavdata_waypoint_ident"},"lnavdata","_","waypoint","_","ident"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnavdata","_","waypoint","_","ident"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("p",null,"The nominal ident of the next waypoint tracked by LNAV."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/data/LNavDataEvents.ts:74"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnavdata_xtk"},"lnavdata","_","xtk"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnavdata","_","xtk"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The current nominal crosstrack error, in nautical miles. Negative values indicate deviation to the left, as viewed\nwhen facing in the direction of the track. Positive values indicate deviation to the right."),(0,r.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents"},"LNavDataSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LNavDataSimVarEvents#lnavdata_xtk"},"lnavdata_xtk")),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/data/LNavDataEvents.ts:51"))}p.isMDXComponent=!0}}]);