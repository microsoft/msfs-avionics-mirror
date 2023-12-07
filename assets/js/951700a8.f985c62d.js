"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[1525],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>f});var n=a(67294);function i(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function r(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?r(Object(a),!0).forEach((function(t){i(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function d(e,t){if(null==e)return{};var a,n,i=function(e,t){if(null==e)return{};var a,n,i={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(i[a]=e[a]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}var s=n.createContext({}),v=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},p=function(e){var t=v(e.components);return n.createElement(s.Provider,{value:t},e.children)},o="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var a=e.components,i=e.mdxType,r=e.originalType,s=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),o=v(a),c=i,f=o["".concat(s,".").concat(c)]||o[c]||u[c]||r;return a?n.createElement(f,l(l({ref:t},p),{},{components:a})):n.createElement(f,l({ref:t},p))}));function f(e,t){var a=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=a.length,l=new Array(r);l[0]=c;var d={};for(var s in t)hasOwnProperty.call(t,s)&&(d[s]=t[s]);d.originalType=e,d[o]="string"==typeof e?e:i,l[1]=d;for(var v=2;v<r;v++)l[v]=a[v];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}c.displayName="MDXCreateElement"},15913:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>u,frontMatter:()=>r,metadata:()=>d,toc:()=>v});var n=a(87462),i=(a(67294),a(3905));const r={id:"VNavDataEvents",title:"Interface: VNavDataEvents",sidebar_label:"VNavDataEvents",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/interfaces/VNavDataEvents",id:"garminsdk/interfaces/VNavDataEvents",title:"Interface: VNavDataEvents",description:"Events related to Garmin VNAV data.",source:"@site/docs/garminsdk/interfaces/VNavDataEvents.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/VNavDataEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/VNavDataEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"VNavDataEvents",title:"Interface: VNavDataEvents",sidebar_label:"VNavDataEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"UnitsUserSettingManager",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/UnitsUserSettingManager"},next:{title:"VNavDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/VNavDataProvider"}},s={},v=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"approach_supports_gp",id:"approach_supports_gp",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"gp_available",id:"gp_available",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"gp_gsi_scaling",id:"gp_gsi_scaling",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"vnav_active_constraint_global_leg_index",id:"vnav_active_constraint_global_leg_index",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"vnav_active_leg_alt",id:"vnav_active_leg_alt",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"vnav_cruise_altitude",id:"vnav_cruise_altitude",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"vnav_flight_phase",id:"vnav_flight_phase",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"vnav_path_display",id:"vnav_path_display",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"vnav_tracking_phase",id:"vnav_tracking_phase",level:3},{value:"Defined in",id:"defined-in-8",level:4}],p={toc:v},o="wrapper";function u(e){let{components:t,...a}=e;return(0,i.kt)(o,(0,n.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Events related to Garmin VNAV data."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"p"},"VNavDataEvents")),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"VNavDataEvents"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"approach_supports_gp"},"approach","_","supports","_","gp"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"approach","_","supports","_","gp"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether or not a loaded and active GPS Approach can support vertical guidance (GP)."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,"BaseVNavDataEvents.approach","_","supports","_","gp"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"sdk/autopilot/data/VNavDataEvents.ts:11"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"gp_available"},"gp","_","available"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"gp","_","available"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether or not vertical guidance (GP) is currently available for display and guidance."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,"BaseVNavDataEvents.gp","_","available"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"sdk/autopilot/data/VNavDataEvents.ts:20"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"gp_gsi_scaling"},"gp","_","gsi","_","scaling"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"gp","_","gsi","_","scaling"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The full scale deflection of the vertical GSI due to GPS glidepath deviation, in feet."),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,"BaseVNavDataEvents.gp","_","gsi","_","scaling"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"sdk/autopilot/data/VNavDataEvents.ts:23"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnav_active_constraint_global_leg_index"},"vnav","_","active","_","constraint","_","global","_","leg","_","index"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"vnav","_","active","_","constraint","_","global","_","leg","_","index"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The global index of the leg that contains the active VNAV constraint."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/data/VNavDataEvents.ts:38"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnav_active_leg_alt"},"vnav","_","active","_","leg","_","alt"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"vnav","_","active","_","leg","_","alt"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The active leg vnav calculated target altitude in meters."),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,"BaseVNavDataEvents.vnav","_","active","_","leg","_","alt"),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"sdk/autopilot/data/VNavDataEvents.ts:17"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnav_cruise_altitude"},"vnav","_","cruise","_","altitude"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"vnav","_","cruise","_","altitude"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The current VNAV cruise altitude, in feet."),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/data/VNavDataEvents.ts:29"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnav_flight_phase"},"vnav","_","flight","_","phase"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"vnav","_","flight","_","phase"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/GarminVNavFlightPhase"},(0,i.kt)("inlineCode",{parentName:"a"},"GarminVNavFlightPhase"))),(0,i.kt)("p",null,"The current VNAV flight phase."),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/data/VNavDataEvents.ts:32"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnav_path_display"},"vnav","_","path","_","display"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"vnav","_","path","_","display"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether VNAV path details should be displayed."),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,"BaseVNavDataEvents.vnav","_","path","_","display"),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"sdk/autopilot/data/VNavDataEvents.ts:14"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnav_tracking_phase"},"vnav","_","tracking","_","phase"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"vnav","_","tracking","_","phase"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/GarminVNavTrackingPhase"},(0,i.kt)("inlineCode",{parentName:"a"},"GarminVNavTrackingPhase"))),(0,i.kt)("p",null,"The current VNAV tracking phase."),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"garminsdk/autopilot/data/VNavDataEvents.ts:35"))}u.isMDXComponent=!0}}]);