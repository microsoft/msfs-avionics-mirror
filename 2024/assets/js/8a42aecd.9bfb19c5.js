"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["131556"],{743864:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>t,default:()=>o,assets:()=>l,toc:()=>c,frontMatter:()=>d});var r=JSON.parse('{"id":"api/framework/interfaces/BaseVNavEvents","title":"Interface: BaseVNavEvents","description":"VNAV events keyed by base topic names.","source":"@site/docs/api/framework/interfaces/BaseVNavEvents.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/BaseVNavEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavEvents","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"BaseVNavDataEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavDataEvents"},"next":{"title":"BaseVNavSimVarEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents"}}'),a=i("785893"),s=i("250065");let d={},t="Interface: BaseVNavEvents",l={},c=[{value:"Extends",id:"extends",level:2},{value:"Extended by",id:"extended-by",level:2},{value:"Properties",id:"properties",level:2},{value:"gp_approach_mode",id:"gp_approach_mode",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"gp_distance",id:"gp_distance",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"gp_fpa",id:"gp_fpa",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"gp_required_vs",id:"gp_required_vs",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"gp_service_level",id:"gp_service_level",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"gp_vertical_deviation",id:"gp_vertical_deviation",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"vnav_altitude_capture_type",id:"vnav_altitude_capture_type",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"vnav_altitude_constraint_details",id:"vnav_altitude_constraint_details",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"vnav_availability",id:"vnav_availability",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"vnav_boc_distance",id:"vnav_boc_distance",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"vnav_boc_global_leg_index",id:"vnav_boc_global_leg_index",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"vnav_bod_distance",id:"vnav_bod_distance",level:3},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"vnav_bod_global_leg_index",id:"vnav_bod_global_leg_index",level:3},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"vnav_constraint_altitude",id:"vnav_constraint_altitude",level:3},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"vnav_constraint_global_leg_index",id:"vnav_constraint_global_leg_index",level:3},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"vnav_fpa",id:"vnav_fpa",level:3},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"vnav_next_constraint_altitude",id:"vnav_next_constraint_altitude",level:3},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"vnav_path_available",id:"vnav_path_available",level:3},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"vnav_path_calculated",id:"vnav_path_calculated",level:3},{value:"Defined in",id:"defined-in-18",level:4},{value:"vnav_path_mode",id:"vnav_path_mode",level:3},{value:"Inherited from",id:"inherited-from-16",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"vnav_required_vs",id:"vnav_required_vs",level:3},{value:"Inherited from",id:"inherited-from-17",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"vnav_state",id:"vnav_state",level:3},{value:"Inherited from",id:"inherited-from-18",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"vnav_target_altitude",id:"vnav_target_altitude",level:3},{value:"Inherited from",id:"inherited-from-19",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"vnav_toc_distance",id:"vnav_toc_distance",level:3},{value:"Inherited from",id:"inherited-from-20",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"vnav_toc_global_leg_index",id:"vnav_toc_global_leg_index",level:3},{value:"Inherited from",id:"inherited-from-21",level:4},{value:"Defined in",id:"defined-in-24",level:4},{value:"vnav_toc_leg_distance",id:"vnav_toc_leg_distance",level:3},{value:"Inherited from",id:"inherited-from-22",level:4},{value:"Defined in",id:"defined-in-25",level:4},{value:"vnav_tod_distance",id:"vnav_tod_distance",level:3},{value:"Inherited from",id:"inherited-from-23",level:4},{value:"Defined in",id:"defined-in-26",level:4},{value:"vnav_tod_global_leg_index",id:"vnav_tod_global_leg_index",level:3},{value:"Inherited from",id:"inherited-from-24",level:4},{value:"Defined in",id:"defined-in-27",level:4},{value:"vnav_tod_leg_distance",id:"vnav_tod_leg_distance",level:3},{value:"Inherited from",id:"inherited-from-25",level:4},{value:"Defined in",id:"defined-in-28",level:4},{value:"vnav_vertical_deviation",id:"vnav_vertical_deviation",level:3},{value:"Inherited from",id:"inherited-from-26",level:4},{value:"Defined in",id:"defined-in-29",level:4}];function v(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...(0,s.a)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.header,{children:(0,a.jsx)(n.h1,{id:"interface-basevnavevents",children:"Interface: BaseVNavEvents"})}),"\n",(0,a.jsx)(n.p,{children:"VNAV events keyed by base topic names."}),"\n",(0,a.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})})}),"\n"]}),"\n",(0,a.jsx)(n.h2,{id:"extended-by",children:"Extended by"}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavEvents",children:(0,a.jsx)(n.code,{children:"VNavEvents"})})}),"\n"]}),"\n",(0,a.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,a.jsx)(n.h3,{id:"gp_approach_mode",children:"gp_approach_mode"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"gp_approach_mode"}),": ",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/ApproachGuidanceMode",children:(0,a.jsx)(n.code,{children:"ApproachGuidanceMode"})})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The VNAV approach guidance mode."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#gp_approach_mode",children:(0,a.jsx)(n.code,{children:"gp_approach_mode"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:187"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"gp_distance",children:"gp_distance"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"gp_distance"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The current distance to the glidepath endpoint, in feet."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#gp_distance",children:(0,a.jsx)(n.code,{children:"gp_distance"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:193"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"gp_fpa",children:"gp_fpa"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"gp_fpa"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The current glidepath FPA."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#gp_fpa",children:(0,a.jsx)(n.code,{children:"gp_fpa"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:196"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"gp_required_vs",children:"gp_required_vs"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"gp_required_vs"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The vertical speed, in feet per minute, required for the airplane to reach the glidepath target."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#gp_required_vs",children:(0,a.jsx)(n.code,{children:"gp_required_vs"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:199"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"gp_service_level",children:"gp_service_level"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"gp_service_level"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The approach glidepath service level."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#gp_service_level",children:(0,a.jsx)(n.code,{children:"gp_service_level"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:202"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"gp_vertical_deviation",children:"gp_vertical_deviation"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"gp_vertical_deviation"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The current glidepath vertical deviation, in feet."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#gp_vertical_deviation",children:(0,a.jsx)(n.code,{children:"gp_vertical_deviation"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:190"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_altitude_capture_type",children:"vnav_altitude_capture_type"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_altitude_capture_type"}),": ",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/VNavAltCaptureType",children:(0,a.jsx)(n.code,{children:"VNavAltCaptureType"})})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The VNAV current alt capture type."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-6",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_altitude_capture_type",children:(0,a.jsx)(n.code,{children:"vnav_altitude_capture_type"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:119"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_altitude_constraint_details",children:"vnav_altitude_constraint_details"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_altitude_constraint_details"}),": ",(0,a.jsx)(n.code,{children:"Readonly"}),"<",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/AltitudeConstraintDetails",children:(0,a.jsx)(n.code,{children:"AltitudeConstraintDetails"})}),">"]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The current VNAV target altitude restriction feet and type."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:228"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_availability",children:"vnav_availability"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_availability"}),": ",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/VNavAvailability",children:(0,a.jsx)(n.code,{children:"VNavAvailability"})})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The current availability of VNAV from the director."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:225"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_boc_distance",children:"vnav_boc_distance"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_boc_distance"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The distance along the flight path from the airplane's present position to the next VNAV BOC, in meters."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-7",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_boc_distance",children:(0,a.jsx)(n.code,{children:"vnav_boc_distance"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:152"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_boc_global_leg_index",children:"vnav_boc_global_leg_index"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_boc_global_leg_index"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The global index of the flight plan leg that contains the next VNAV BOC, or -1 if there is no such BOC. The BOC\nis always located at the beginning of its containing leg."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-8",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_boc_global_leg_index",children:(0,a.jsx)(n.code,{children:"vnav_boc_global_leg_index"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:163"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_bod_distance",children:"vnav_bod_distance"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_bod_distance"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The distance along the flight path from the airplane's present position to the next VNAV BOD, in meters."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-9",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_bod_distance",children:(0,a.jsx)(n.code,{children:"vnav_bod_distance"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:128"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_bod_global_leg_index",children:"vnav_bod_global_leg_index"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_bod_global_leg_index"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The global index of the flight plan leg that contains the next VNAV BOD, or -1 if there is no BOD. The next BOD\nis defined as the next point in the flight path including or after the active leg where the VNAV profile\ntransitions from a descent to a level-off, discontinuity, or the end of the flight path. The BOD is always located\nat the end of its containing leg."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-10",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_bod_global_leg_index",children:(0,a.jsx)(n.code,{children:"vnav_bod_global_leg_index"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:143"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_constraint_altitude",children:"vnav_constraint_altitude"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_constraint_altitude"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The VNAV current constraint altitude in feet."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-11",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_constraint_altitude",children:(0,a.jsx)(n.code,{children:"vnav_constraint_altitude"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:169"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_constraint_global_leg_index",children:"vnav_constraint_global_leg_index"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_constraint_global_leg_index"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The global index of the leg that contains the current VNAV constraint."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-12",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_constraint_global_leg_index",children:(0,a.jsx)(n.code,{children:"vnav_constraint_global_leg_index"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:166"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_fpa",children:"vnav_fpa"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_fpa"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The flight path angle, in degrees, for the currently active VNAV path segment. Positive angles represent\ndescending paths."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-13",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_fpa",children:(0,a.jsx)(n.code,{children:"vnav_fpa"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:178"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_next_constraint_altitude",children:"vnav_next_constraint_altitude"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_next_constraint_altitude"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The VNAV next constraint altitude in feet."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-14",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_next_constraint_altitude",children:(0,a.jsx)(n.code,{children:"vnav_next_constraint_altitude"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:172"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_path_available",children:"vnav_path_available"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_path_available"}),": ",(0,a.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"Whether a VNAV Path Exists for the current leg."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-15",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_path_available",children:(0,a.jsx)(n.code,{children:"vnav_path_available"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:113"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_path_calculated",children:"vnav_path_calculated"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_path_calculated"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"VNAV path calculations were updated for the specified vertical flight plan."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:222"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_path_mode",children:"vnav_path_mode"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_path_mode"}),": ",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/VNavPathMode",children:(0,a.jsx)(n.code,{children:"VNavPathMode"})})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The VNAV path mode."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-16",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_path_mode",children:(0,a.jsx)(n.code,{children:"vnav_path_mode"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-19",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:110"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_required_vs",children:"vnav_required_vs"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_required_vs"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The vertical speed, in feet per minute, required for the airplane to meet the next VNAV altitude constraint if it\nstarts climbing/descending from its current altitude immediately."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-17",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_required_vs",children:(0,a.jsx)(n.code,{children:"vnav_required_vs"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-20",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:184"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_state",children:"vnav_state"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_state"}),": ",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/VNavState",children:(0,a.jsx)(n.code,{children:"VNavState"})})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The VNAV state."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-18",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_state",children:(0,a.jsx)(n.code,{children:"vnav_state"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-21",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:116"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_target_altitude",children:"vnav_target_altitude"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_target_altitude"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The target altitude, in feet, of the currently active VNAV constraint."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-19",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_target_altitude",children:(0,a.jsx)(n.code,{children:"vnav_target_altitude"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-22",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:107"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_toc_distance",children:"vnav_toc_distance"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_toc_distance"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The distance along the flight path from the airplane's present position to the current VNAV TOC, in meters."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-20",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_toc_distance",children:(0,a.jsx)(n.code,{children:"vnav_toc_distance"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-23",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:146"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_toc_global_leg_index",children:"vnav_toc_global_leg_index"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_toc_global_leg_index"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The global index of the flight plan leg that contains the current VNAV TOC, or -1 if there is no such TOC."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-21",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_toc_global_leg_index",children:(0,a.jsx)(n.code,{children:"vnav_toc_global_leg_index"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-24",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:157"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_toc_leg_distance",children:"vnav_toc_leg_distance"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_toc_leg_distance"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The distance along the flight path from the current VNAV TOC to the end of its containing leg, in meters."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-22",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_toc_leg_distance",children:(0,a.jsx)(n.code,{children:"vnav_toc_leg_distance"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-25",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:149"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_tod_distance",children:"vnav_tod_distance"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_tod_distance"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The distance along the flight path from the airplane's present position to the current VNAV TOD, in meters."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-23",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_tod_distance",children:(0,a.jsx)(n.code,{children:"vnav_tod_distance"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-26",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:122"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_tod_global_leg_index",children:"vnav_tod_global_leg_index"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_tod_global_leg_index"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The global index of the flight plan leg that contains the TOD associated with the next VNAV BOD, or -1 if there is\nno such TOD. The TOD is defined as the point along the flight path at which the aircraft will intercept the VNAV\nprofile continuing to the next BOD if it continues to fly level at its current altitude."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-24",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_tod_global_leg_index",children:(0,a.jsx)(n.code,{children:"vnav_tod_global_leg_index"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-27",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:135"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_tod_leg_distance",children:"vnav_tod_leg_distance"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_tod_leg_distance"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The distance from the current VNAV TOD to the end of its containing leg, in meters."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-25",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_tod_leg_distance",children:(0,a.jsx)(n.code,{children:"vnav_tod_leg_distance"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-28",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:125"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"vnav_vertical_deviation",children:"vnav_vertical_deviation"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"vnav_vertical_deviation"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The vertical deviation, in feet, of the calculated VNAV path from the airplane's indicated altitude. Positive\nvalues indicate the path lies above the airplane."}),"\n",(0,a.jsx)(n.h4,{id:"inherited-from-26",children:"Inherited from"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents",children:(0,a.jsx)(n.code,{children:"BaseVNavSimVarEvents"})}),".",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavSimVarEvents#vnav_vertical_deviation",children:(0,a.jsx)(n.code,{children:"vnav_vertical_deviation"})})]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-29",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavEvents.ts:104"})]})}function o(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(v,{...e})}):v(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return t},a:function(){return d}});var r=i(667294);let a={},s=r.createContext(a);function d(e){let n=r.useContext(s);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:d(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);