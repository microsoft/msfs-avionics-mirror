"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[67799],{3905:(e,a,n)=>{n.d(a,{Zo:()=>o,kt:()=>f});var t=n(67294);function i(e,a,n){return a in e?Object.defineProperty(e,a,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[a]=n,e}function r(e,a){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);a&&(t=t.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),n.push.apply(n,t)}return n}function s(e){for(var a=1;a<arguments.length;a++){var n=null!=arguments[a]?arguments[a]:{};a%2?r(Object(n),!0).forEach((function(a){i(e,a,n[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(n,a))}))}return e}function l(e,a){if(null==e)return{};var n,t,i=function(e,a){if(null==e)return{};var n,t,i={},r=Object.keys(e);for(t=0;t<r.length;t++)n=r[t],a.indexOf(n)>=0||(i[n]=e[n]);return i}(e,a);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(t=0;t<r.length;t++)n=r[t],a.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var v=t.createContext({}),d=function(e){var a=t.useContext(v),n=a;return e&&(n="function"==typeof e?e(a):s(s({},a),e)),n},o=function(e){var a=d(e.components);return t.createElement(v.Provider,{value:a},e.children)},p="mdxType",m={inlineCode:"code",wrapper:function(e){var a=e.children;return t.createElement(t.Fragment,{},a)}},c=t.forwardRef((function(e,a){var n=e.components,i=e.mdxType,r=e.originalType,v=e.parentName,o=l(e,["components","mdxType","originalType","parentName"]),p=d(n),c=i,f=p["".concat(v,".").concat(c)]||p[c]||m[c]||r;return n?t.createElement(f,s(s({ref:a},o),{},{components:n})):t.createElement(f,s({ref:a},o))}));function f(e,a){var n=arguments,i=a&&a.mdxType;if("string"==typeof e||i){var r=n.length,s=new Array(r);s[0]=c;var l={};for(var v in a)hasOwnProperty.call(a,v)&&(l[v]=a[v]);l.originalType=e,l[p]="string"==typeof e?e:i,s[1]=l;for(var d=2;d<r;d++)s[d]=n[d];return t.createElement.apply(null,s)}return t.createElement.apply(null,n)}c.displayName="MDXCreateElement"},29117:(e,a,n)=>{n.r(a),n.d(a,{assets:()=>v,contentTitle:()=>s,default:()=>m,frontMatter:()=>r,metadata:()=>l,toc:()=>d});var t=n(87462),i=(n(67294),n(3905));const r={id:"GarminVNavDataEvents",title:"Interface: GarminVNavDataEvents",sidebar_label:"GarminVNavDataEvents",sidebar_position:0,custom_edit_url:null},s=void 0,l={unversionedId:"garminsdk/interfaces/GarminVNavDataEvents",id:"garminsdk/interfaces/GarminVNavDataEvents",title:"Interface: GarminVNavDataEvents",description:"Events related to Garmin VNAV data.",source:"@site/docs/garminsdk/interfaces/GarminVNavDataEvents.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/GarminVNavDataEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/GarminVNavDataEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GarminVNavDataEvents",title:"Interface: GarminVNavDataEvents",sidebar_label:"GarminVNavDataEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GarminVNavComputerOptions",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/GarminVNavComputerOptions"},next:{title:"GarminVNavEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/GarminVNavEvents"}},v={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"approach_supports_gp",id:"approach_supports_gp",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"gp_available",id:"gp_available",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"gp_gsi_scaling",id:"gp_gsi_scaling",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"vnav_active_constraint_global_leg_index",id:"vnav_active_constraint_global_leg_index",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"vnav_active_leg_alt",id:"vnav_active_leg_alt",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"vnav_cruise_altitude",id:"vnav_cruise_altitude",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"vnav_flight_phase",id:"vnav_flight_phase",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"vnav_path_display",id:"vnav_path_display",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"vnav_tracking_phase",id:"vnav_tracking_phase",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-8",level:4}],o={toc:d},p="wrapper";function m(e){let{components:a,...n}=e;return(0,i.kt)(p,(0,t.Z)({},o,n,{components:a,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Events related to Garmin VNAV data."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents"},(0,i.kt)("inlineCode",{parentName:"a"},"BaseGarminVNavDataEvents")))),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#indexedgarminvnavdataevents"},(0,i.kt)("inlineCode",{parentName:"a"},"IndexedGarminVNavDataEvents"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"GarminVNavDataEvents"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"approach_supports_gp"},"approach","_","supports","_","gp"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"approach","_","supports","_","gp"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether or not a loaded and active GPS Approach can support vertical guidance (GP)."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents"},"BaseGarminVNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents#approach_supports_gp"},"approach_supports_gp")),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/vnav/VNavDataEvents.ts:9"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"gp_available"},"gp","_","available"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"gp","_","available"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether or not vertical guidance (GP) is currently available for display and guidance."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents"},"BaseGarminVNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents#gp_available"},"gp_available")),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/vnav/VNavDataEvents.ts:18"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"gp_gsi_scaling"},"gp","_","gsi","_","scaling"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"gp","_","gsi","_","scaling"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The full scale deflection of the vertical GSI due to GPS glidepath deviation, in feet."),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents"},"BaseGarminVNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents#gp_gsi_scaling"},"gp_gsi_scaling")),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/vnav/VNavDataEvents.ts:21"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnav_active_constraint_global_leg_index"},"vnav","_","active","_","constraint","_","global","_","leg","_","index"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"vnav","_","active","_","constraint","_","global","_","leg","_","index"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The global index of the leg that contains the active VNAV constraint."),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents"},"BaseGarminVNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents#vnav_active_constraint_global_leg_index"},"vnav_active_constraint_global_leg_index")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavDataEvents.ts:38"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnav_active_leg_alt"},"vnav","_","active","_","leg","_","alt"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"vnav","_","active","_","leg","_","alt"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The active leg vnav calculated target altitude in meters."),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents"},"BaseGarminVNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents#vnav_active_leg_alt"},"vnav_active_leg_alt")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/vnav/VNavDataEvents.ts:15"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnav_cruise_altitude"},"vnav","_","cruise","_","altitude"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"vnav","_","cruise","_","altitude"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The current VNAV cruise altitude, in feet."),(0,i.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents"},"BaseGarminVNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents#vnav_cruise_altitude"},"vnav_cruise_altitude")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavDataEvents.ts:29"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnav_flight_phase"},"vnav","_","flight","_","phase"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"vnav","_","flight","_","phase"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/GarminVNavFlightPhase"},(0,i.kt)("inlineCode",{parentName:"a"},"GarminVNavFlightPhase"))),(0,i.kt)("p",null,"The current VNAV flight phase."),(0,i.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents"},"BaseGarminVNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents#vnav_flight_phase"},"vnav_flight_phase")),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavDataEvents.ts:32"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnav_path_display"},"vnav","_","path","_","display"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"vnav","_","path","_","display"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether VNAV path details should be displayed."),(0,i.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents"},"BaseGarminVNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents#vnav_path_display"},"vnav_path_display")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/sdk/autopilot/vnav/VNavDataEvents.ts:12"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vnav_tracking_phase"},"vnav","_","tracking","_","phase"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"vnav","_","tracking","_","phase"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/GarminVNavTrackingPhase"},(0,i.kt)("inlineCode",{parentName:"a"},"GarminVNavTrackingPhase"))),(0,i.kt)("p",null,"The current VNAV tracking phase."),(0,i.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents"},"BaseGarminVNavDataEvents"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/BaseGarminVNavDataEvents#vnav_tracking_phase"},"vnav_tracking_phase")),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavDataEvents.ts:35"))}m.isMDXComponent=!0}}]);