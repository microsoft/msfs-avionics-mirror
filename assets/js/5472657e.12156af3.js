"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[99309],{3905:(e,t,n)=>{n.d(t,{Zo:()=>o,kt:()=>_});var i=n(67294);function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function d(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?d(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):d(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function r(e,t){if(null==e)return{};var n,i,l=function(e,t){if(null==e)return{};var n,i,l={},d=Object.keys(e);for(i=0;i<d.length;i++)n=d[i],t.indexOf(n)>=0||(l[n]=e[n]);return l}(e,t);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(e);for(i=0;i<d.length;i++)n=d[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(l[n]=e[n])}return l}var p=i.createContext({}),s=function(e){var t=i.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},o=function(e){var t=s(e.components);return i.createElement(p.Provider,{value:t},e.children)},h="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},k=i.forwardRef((function(e,t){var n=e.components,l=e.mdxType,d=e.originalType,p=e.parentName,o=r(e,["components","mdxType","originalType","parentName"]),h=s(n),k=l,_=h["".concat(p,".").concat(k)]||h[k]||u[k]||d;return n?i.createElement(_,a(a({ref:t},o),{},{components:n})):i.createElement(_,a({ref:t},o))}));function _(e,t){var n=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var d=n.length,a=new Array(d);a[0]=k;var r={};for(var p in t)hasOwnProperty.call(t,p)&&(r[p]=t[p]);r.originalType=e,r[h]="string"==typeof e?e:l,a[1]=r;for(var s=2;s<d;s++)a[s]=n[s];return i.createElement.apply(null,a)}return i.createElement.apply(null,n)}k.displayName="MDXCreateElement"},29763:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>a,default:()=>u,frontMatter:()=>d,metadata:()=>r,toc:()=>s});var i=n(87462),l=(n(67294),n(3905));const d={id:"APEvents",title:"Interface: APEvents",sidebar_label:"APEvents",sidebar_position:0,custom_edit_url:null},a=void 0,r={unversionedId:"framework/interfaces/APEvents",id:"framework/interfaces/APEvents",title:"Interface: APEvents",description:"The events related to an autopilot",source:"@site/docs/framework/interfaces/APEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/APEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/APEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"APEvents",title:"Interface: APEvents",sidebar_label:"APEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"APConfig",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/APConfig"},next:{title:"APModePressEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/APModePressEvent"}},p={},s=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"ap_alt_hold",id:"ap_alt_hold",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"ap_altitude_selected",id:"ap_altitude_selected",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"ap_approach_hold",id:"ap_approach_hold",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"ap_backcourse_hold",id:"ap_backcourse_hold",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"ap_bank_hold",id:"ap_bank_hold",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"ap_disengage_status",id:"ap_disengage_status",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"ap_flc_hold",id:"ap_flc_hold",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"ap_fpa_selected",id:"ap_fpa_selected",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"ap_glideslope_hold",id:"ap_glideslope_hold",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"ap_heading_hold",id:"ap_heading_hold",level:3},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"ap_heading_selected",id:"ap_heading_selected",level:3},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"ap_ias_selected",id:"ap_ias_selected",level:3},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"ap_lock_release",id:"ap_lock_release",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"ap_lock_set",id:"ap_lock_set",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"ap_mach_selected",id:"ap_mach_selected",level:3},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"ap_master_off",id:"ap_master_off",level:3},{value:"Defined in",id:"defined-in-15",level:4},{value:"ap_master_on",id:"ap_master_on",level:3},{value:"Defined in",id:"defined-in-16",level:4},{value:"ap_master_status",id:"ap_master_status",level:3},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"ap_max_bank_id",id:"ap_max_bank_id",level:3},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"ap_max_bank_value",id:"ap_max_bank_value",level:3},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"ap_nav_hold",id:"ap_nav_hold",level:3},{value:"Inherited from",id:"inherited-from-16",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"ap_pitch_hold",id:"ap_pitch_hold",level:3},{value:"Inherited from",id:"inherited-from-17",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"ap_pitch_selected",id:"ap_pitch_selected",level:3},{value:"Inherited from",id:"inherited-from-18",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"ap_selected_speed_is_mach",id:"ap_selected_speed_is_mach",level:3},{value:"Inherited from",id:"inherited-from-19",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"ap_selected_speed_is_manual",id:"ap_selected_speed_is_manual",level:3},{value:"Inherited from",id:"inherited-from-20",level:4},{value:"Defined in",id:"defined-in-24",level:4},{value:"ap_toga_hold",id:"ap_toga_hold",level:3},{value:"Inherited from",id:"inherited-from-21",level:4},{value:"Defined in",id:"defined-in-25",level:4},{value:"ap_vs_hold",id:"ap_vs_hold",level:3},{value:"Inherited from",id:"inherited-from-22",level:4},{value:"Defined in",id:"defined-in-26",level:4},{value:"ap_vs_selected",id:"ap_vs_selected",level:3},{value:"Inherited from",id:"inherited-from-23",level:4},{value:"Defined in",id:"defined-in-27",level:4},{value:"ap_wing_lvl_hold",id:"ap_wing_lvl_hold",level:3},{value:"Inherited from",id:"inherited-from-24",level:4},{value:"Defined in",id:"defined-in-28",level:4},{value:"ap_yd_off",id:"ap_yd_off",level:3},{value:"Defined in",id:"defined-in-29",level:4},{value:"ap_yd_on",id:"ap_yd_on",level:3},{value:"Defined in",id:"defined-in-30",level:4},{value:"ap_yd_status",id:"ap_yd_status",level:3},{value:"Inherited from",id:"inherited-from-25",level:4},{value:"Defined in",id:"defined-in-31",level:4},{value:"flight_director_bank",id:"flight_director_bank",level:3},{value:"Inherited from",id:"inherited-from-26",level:4},{value:"Defined in",id:"defined-in-32",level:4},{value:"flight_director_pitch",id:"flight_director_pitch",level:3},{value:"Inherited from",id:"inherited-from-27",level:4},{value:"Defined in",id:"defined-in-33",level:4},{value:"vnav_active",id:"vnav_active",level:3},{value:"Inherited from",id:"inherited-from-28",level:4},{value:"Defined in",id:"defined-in-34",level:4}],o={toc:s},h="wrapper";function u(e){let{components:t,...n}=e;return(0,l.kt)(h,(0,i.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"The events related to an autopilot"),(0,l.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"p"},"APSimVarEvents")),(0,l.kt)("p",{parentName:"li"},"\u21b3 ",(0,l.kt)("strong",{parentName:"p"},(0,l.kt)("inlineCode",{parentName:"strong"},"APEvents"))))),(0,l.kt)("h2",{id:"properties"},"Properties"),(0,l.kt)("h3",{id:"ap_alt_hold"},"ap","_","alt","_","hold"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","alt","_","hold"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot is in altitude hold mode."),(0,l.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","alt","_","hold"),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:49"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_altitude_selected"},"ap","_","altitude","_","selected"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","altitude","_","selected"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The autopilot's selected altitude in slot 1, in feet."),(0,l.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","altitude","_","selected"),(0,l.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:70"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_approach_hold"},"ap","_","approach","_","hold"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","approach","_","hold"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot is in approach mode."),(0,l.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","approach","_","hold"),(0,l.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:25"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_backcourse_hold"},"ap","_","backcourse","_","hold"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","backcourse","_","hold"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot is in backcourse mode."),(0,l.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","backcourse","_","hold"),(0,l.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:28"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_bank_hold"},"ap","_","bank","_","hold"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","bank","_","hold"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot is in bank hold mode."),(0,l.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","bank","_","hold"),(0,l.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:31"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_disengage_status"},"ap","_","disengage","_","status"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","disengage","_","status"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot is disengaged."),(0,l.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","disengage","_","status"),(0,l.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:16"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_flc_hold"},"ap","_","flc","_","hold"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","flc","_","hold"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot is in flight level change mode."),(0,l.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","flc","_","hold"),(0,l.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:46"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_fpa_selected"},"ap","_","fpa","_","selected"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","fpa","_","selected"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The autopilot's selected flight path angle target in slot 1, in degrees."),(0,l.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","fpa","_","selected"),(0,l.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:82"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_glideslope_hold"},"ap","_","glideslope","_","hold"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","glideslope","_","hold"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot is in glideslope hold mode."),(0,l.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","glideslope","_","hold"),(0,l.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:52"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_heading_hold"},"ap","_","heading","_","hold"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","heading","_","hold"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot is in heading hold mode."),(0,l.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","heading","_","hold"),(0,l.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:19"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_heading_selected"},"ap","_","heading","_","selected"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","heading","_","selected"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The autopilot's selected heading in slot 1, in degrees."),(0,l.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","heading","_","selected"),(0,l.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:64"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_ias_selected"},"ap","_","ias","_","selected"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","ias","_","selected"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The autopilot's selected airspeed target in slot 1, in knots."),(0,l.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","ias","_","selected"),(0,l.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:88"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_lock_release"},"ap","_","lock","_","release"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","lock","_","release"),": ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/APLockType"},(0,l.kt)("inlineCode",{parentName:"a"},"APLockType"))),(0,l.kt)("p",null,"An autopilot lock has been released."),(0,l.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:151"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_lock_set"},"ap","_","lock","_","set"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","lock","_","set"),": ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/APLockType"},(0,l.kt)("inlineCode",{parentName:"a"},"APLockType"))),(0,l.kt)("p",null,"An autopilot lock has been set."),(0,l.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:148"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_mach_selected"},"ap","_","mach","_","selected"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","mach","_","selected"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The autopilot's selected mach target in slot 1."),(0,l.kt)("h4",{id:"inherited-from-12"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","mach","_","selected"),(0,l.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:94"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_master_off"},"ap","_","master","_","off"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","master","_","off"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"true")),(0,l.kt)("p",null,"The autopilot has been deactivated."),(0,l.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:139"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_master_on"},"ap","_","master","_","on"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","master","_","on"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"true")),(0,l.kt)("p",null,"The autopilot has been activated."),(0,l.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:136"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_master_status"},"ap","_","master","_","status"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","master","_","status"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot master is active."),(0,l.kt)("h4",{id:"inherited-from-13"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","master","_","status"),(0,l.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:10"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_max_bank_id"},"ap","_","max","_","bank","_","id"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","max","_","bank","_","id"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The autopilot max bank value ID (usually 0 for standard, 1 for half bank)."),(0,l.kt)("h4",{id:"inherited-from-14"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","max","_","bank","_","id"),(0,l.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:34"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_max_bank_value"},"ap","_","max","_","bank","_","value"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","max","_","bank","_","value"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The current set autopilot max bank value in absolute degrees."),(0,l.kt)("h4",{id:"inherited-from-15"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","max","_","bank","_","value"),(0,l.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:37"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_nav_hold"},"ap","_","nav","_","hold"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","nav","_","hold"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot is in NAV mode."),(0,l.kt)("h4",{id:"inherited-from-16"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","nav","_","hold"),(0,l.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:22"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_pitch_hold"},"ap","_","pitch","_","hold"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","pitch","_","hold"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot is in pitch hold mode."),(0,l.kt)("h4",{id:"inherited-from-17"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","pitch","_","hold"),(0,l.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:55"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_pitch_selected"},"ap","_","pitch","_","selected"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","pitch","_","selected"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The autopilot's selected pitch target, in degrees."),(0,l.kt)("h4",{id:"inherited-from-18"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","pitch","_","selected"),(0,l.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:61"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_selected_speed_is_mach"},"ap","_","selected","_","speed","_","is","_","mach"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","selected","_","speed","_","is","_","mach"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot's selected airspeed target is in mach."),(0,l.kt)("h4",{id:"inherited-from-19"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","selected","_","speed","_","is","_","mach"),(0,l.kt)("h4",{id:"defined-in-23"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:100"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_selected_speed_is_manual"},"ap","_","selected","_","speed","_","is","_","manual"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","selected","_","speed","_","is","_","manual"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot's selected airspeed target is manually set."),(0,l.kt)("h4",{id:"inherited-from-20"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","selected","_","speed","_","is","_","manual"),(0,l.kt)("h4",{id:"defined-in-24"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:103"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_toga_hold"},"ap","_","toga","_","hold"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","toga","_","hold"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot is in TO/GA mode."),(0,l.kt)("h4",{id:"inherited-from-21"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","toga","_","hold"),(0,l.kt)("h4",{id:"defined-in-25"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:58"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_vs_hold"},"ap","_","vs","_","hold"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","vs","_","hold"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot is in vertical speed hold mode."),(0,l.kt)("h4",{id:"inherited-from-22"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","vs","_","hold"),(0,l.kt)("h4",{id:"defined-in-26"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:43"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_vs_selected"},"ap","_","vs","_","selected"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","vs","_","selected"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The autopilot's selected vertical speed target in slot 1, in feet per minute."),(0,l.kt)("h4",{id:"inherited-from-23"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","vs","_","selected"),(0,l.kt)("h4",{id:"defined-in-27"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:76"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_wing_lvl_hold"},"ap","_","wing","_","lvl","_","hold"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","wing","_","lvl","_","hold"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the autopilot is in wings level mode."),(0,l.kt)("h4",{id:"inherited-from-24"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","wing","_","lvl","_","hold"),(0,l.kt)("h4",{id:"defined-in-28"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:40"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_yd_off"},"ap","_","yd","_","off"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","yd","_","off"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"true")),(0,l.kt)("p",null,"The yaw damper has been deactivated."),(0,l.kt)("h4",{id:"defined-in-29"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:145"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_yd_on"},"ap","_","yd","_","on"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","yd","_","on"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"true")),(0,l.kt)("p",null,"The yaw damper has been activated."),(0,l.kt)("h4",{id:"defined-in-30"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:142"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ap_yd_status"},"ap","_","yd","_","status"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ap","_","yd","_","status"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the yaw damper is active."),(0,l.kt)("h4",{id:"inherited-from-25"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.ap","_","yd","_","status"),(0,l.kt)("h4",{id:"defined-in-31"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:13"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"flight_director_bank"},"flight","_","director","_","bank"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"flight","_","director","_","bank"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The bank commanded by the flight director, in degrees."),(0,l.kt)("h4",{id:"inherited-from-26"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.flight","_","director","_","bank"),(0,l.kt)("h4",{id:"defined-in-32"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:106"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"flight_director_pitch"},"flight","_","director","_","pitch"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"flight","_","director","_","pitch"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The pitch commanded by the flight director, in degrees."),(0,l.kt)("h4",{id:"inherited-from-27"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.flight","_","director","_","pitch"),(0,l.kt)("h4",{id:"defined-in-33"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:109"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"vnav_active"},"vnav","_","active"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"vnav","_","active"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether VNAV is active."),(0,l.kt)("h4",{id:"inherited-from-28"},"Inherited from"),(0,l.kt)("p",null,"APSimVarEvents.vnav","_","active"),(0,l.kt)("h4",{id:"defined-in-34"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/APPublisher.ts:115"))}u.isMDXComponent=!0}}]);