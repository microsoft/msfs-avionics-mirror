"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["860333"],{691996:function(e,n,r){r.r(n),r.d(n,{metadata:()=>i,contentTitle:()=>s,default:()=>o,assets:()=>a,toc:()=>c,frontMatter:()=>d});var i=JSON.parse('{"id":"api/framework/interfaces/VNavPathCalculator","title":"Interface: VNavPathCalculator","description":"VNav Path Calculator Interface","source":"@site/docs/api/framework/interfaces/VNavPathCalculator.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/VNavPathCalculator","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavPathCalculator","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"VNavManager","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavManager"},"next":{"title":"VNavPlanSegment","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavPlanSegment"}}'),t=r("785893"),l=r("250065");let d={},s="Interface: VNavPathCalculator",a={},c=[{value:"Properties",id:"properties",level:2},{value:"flightPathAngle",id:"flightpathangle",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"maxFlightPathAngle",id:"maxflightpathangle",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"planBuilt",id:"planbuilt",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"vnavCalculated",id:"vnavcalculated",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"activateVerticalDirect()",id:"activateverticaldirect",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"createVerticalPlan()",id:"createverticalplan",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"getCurrentConstraintAltitude()",id:"getcurrentconstraintaltitude",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"getCurrentConstraintDetails()",id:"getcurrentconstraintdetails",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"getFirstDescentConstraintAltitude()",id:"getfirstdescentconstraintaltitude",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"getFlightPhase()",id:"getflightphase",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"getNextConstraintAltitude()",id:"getnextconstraintaltitude",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"getNextRestrictionForFlightPhase()",id:"getnextrestrictionforflightphase",level:3},{value:"Parameters",id:"parameters-7",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"getTargetAltitude()",id:"gettargetaltitude",level:3},{value:"Parameters",id:"parameters-8",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"getTargetConstraint()",id:"gettargetconstraint",level:3},{value:"Parameters",id:"parameters-9",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"getTargetConstraintIndex()",id:"gettargetconstraintindex",level:3},{value:"Parameters",id:"parameters-10",level:4},{value:"Returns",id:"returns-10",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"getVerticalFlightPlan()",id:"getverticalflightplan",level:3},{value:"Parameters",id:"parameters-11",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"requestPathCompute()",id:"requestpathcompute",level:3},{value:"Parameters",id:"parameters-12",level:4},{value:"Returns",id:"returns-12",level:4},{value:"Defined in",id:"defined-in-16",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,l.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"interface-vnavpathcalculator",children:"Interface: VNavPathCalculator"})}),"\n",(0,t.jsx)(n.p,{children:"VNav Path Calculator Interface"}),"\n",(0,t.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,t.jsx)(n.h3,{id:"flightpathangle",children:"flightPathAngle"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"flightPathAngle"}),": ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The default FPA for this path calculator"}),"\n",(0,t.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:11"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"maxflightpathangle",children:"maxFlightPathAngle"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"maxFlightPathAngle"}),": ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The maximum FPA allowed for path calculator"}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:14"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"planbuilt",children:"planBuilt"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"readonly"})," ",(0,t.jsx)(n.strong,{children:"planBuilt"}),": ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/ReadonlySubEvent",children:(0,t.jsx)(n.code,{children:"ReadonlySubEvent"})}),"<",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavPathCalculator",children:(0,t.jsx)(n.code,{children:"VNavPathCalculator"})}),", ",(0,t.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"An event fired when a vertical plan has been built or rebuilt, with the index of the plan as the event data."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:17"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"vnavcalculated",children:"vnavCalculated"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"readonly"})," ",(0,t.jsx)(n.strong,{children:"vnavCalculated"}),": ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/ReadonlySubEvent",children:(0,t.jsx)(n.code,{children:"ReadonlySubEvent"})}),"<",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavPathCalculator",children:(0,t.jsx)(n.code,{children:"VNavPathCalculator"})}),", ",(0,t.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"An event fired when a path has been calculated, with the index of the plan as the event data."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:20"}),"\n",(0,t.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,t.jsx)(n.h3,{id:"activateverticaldirect",children:"activateVerticalDirect()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"activateVerticalDirect"}),"(",(0,t.jsx)(n.code,{children:"planIndex"}),", ",(0,t.jsx)(n.code,{children:"constraintGlobalLegIndex"}),"): ",(0,t.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Activates a vertical direct to a constraint index."}),"\n",(0,t.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"planIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The vertical flight plan index."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"constraintGlobalLegIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The global leg index of the constraint to go direct to."})]})]})]}),"\n",(0,t.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.code,{children:"void"})}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:116"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"createverticalplan",children:"createVerticalPlan()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"createVerticalPlan"}),"(",(0,t.jsx)(n.code,{children:"planIndex"}),"): ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VerticalFlightPlan",children:(0,t.jsx)(n.code,{children:"VerticalFlightPlan"})})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Creates an empty vertical plan at a specified index."}),"\n",(0,t.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsx)(n.tbody,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"planIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The Vertical Plan Index to create."})]})})]}),"\n",(0,t.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VerticalFlightPlan",children:(0,t.jsx)(n.code,{children:"VerticalFlightPlan"})})}),"\n",(0,t.jsx)(n.p,{children:"The newly created Vertical Plan."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:35"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"getcurrentconstraintaltitude",children:"getCurrentConstraintAltitude()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"getCurrentConstraintAltitude"}),"(",(0,t.jsx)(n.code,{children:"planIndex"}),", ",(0,t.jsx)(n.code,{children:"globalLegIndex"}),"): ",(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Gets and returns the current constraint altitude in meters."}),"\n",(0,t.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"planIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The vertical flight plan index."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"globalLegIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The global index of the leg for which to get the current constraint."})]})]})]}),"\n",(0,t.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.code,{children:"number"})]}),"\n",(0,t.jsxs)(n.p,{children:["The current constraint altitude in meters, or ",(0,t.jsx)(n.code,{children:"undefined"})," if there is no current constraint."]}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:76"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"getcurrentconstraintdetails",children:"getCurrentConstraintDetails()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"getCurrentConstraintDetails"}),"(",(0,t.jsx)(n.code,{children:"planIndex"}),", ",(0,t.jsx)(n.code,{children:"globalLegIndex"}),"): ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/AltitudeConstraintDetails",children:(0,t.jsx)(n.code,{children:"AltitudeConstraintDetails"})})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Gets and returns the current constraint details."}),"\n",(0,t.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"planIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The vertical flight plan index."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"globalLegIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"is the global leg index to check."})]})]})]}),"\n",(0,t.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/AltitudeConstraintDetails",children:(0,t.jsx)(n.code,{children:"AltitudeConstraintDetails"})})}),"\n",(0,t.jsx)(n.p,{children:"the VNavConstraintDetails."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:84"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"getfirstdescentconstraintaltitude",children:"getFirstDescentConstraintAltitude()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"getFirstDescentConstraintAltitude"}),"(",(0,t.jsx)(n.code,{children:"planIndex"}),"): ",(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Gets the first VNAV Constraint Altitude."}),"\n",(0,t.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsx)(n.tbody,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"planIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The vertical flight plan index."})]})})]}),"\n",(0,t.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.code,{children:"number"})]}),"\n",(0,t.jsx)(n.p,{children:"The first VNAV constraint altitude in the plan."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:109"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"getflightphase",children:"getFlightPhase()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"getFlightPhase"}),"(",(0,t.jsx)(n.code,{children:"planIndex"}),"): ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/VerticalFlightPhase",children:(0,t.jsx)(n.code,{children:"VerticalFlightPhase"})})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Gets and returns the Current Vertical Flight Phase."}),"\n",(0,t.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsx)(n.tbody,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"planIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The vertical flight plan index."})]})})]}),"\n",(0,t.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/VerticalFlightPhase",children:(0,t.jsx)(n.code,{children:"VerticalFlightPhase"})})}),"\n",(0,t.jsx)(n.p,{children:"the VerticalFlightPhase."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:68"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"getnextconstraintaltitude",children:"getNextConstraintAltitude()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"getNextConstraintAltitude"}),"(",(0,t.jsx)(n.code,{children:"planIndex"}),", ",(0,t.jsx)(n.code,{children:"globalLegIndex"}),"): ",(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Gets and returns the next constraint altitude in meters."}),"\n",(0,t.jsx)(n.h4,{id:"parameters-6",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"planIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The vertical flight plan index."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"globalLegIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The global index of the leg for which to get the next constraint."})]})]})]}),"\n",(0,t.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.code,{children:"number"})]}),"\n",(0,t.jsxs)(n.p,{children:["The next constraint altitude in meters or ",(0,t.jsx)(n.code,{children:"undefined"})," if there is no next constraint."]}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:92"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"getnextrestrictionforflightphase",children:"getNextRestrictionForFlightPhase()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"getNextRestrictionForFlightPhase"}),"(",(0,t.jsx)(n.code,{children:"planIndex"}),", ",(0,t.jsx)(n.code,{children:"activeLateralLeg"}),"): ",(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavConstraint",children:(0,t.jsx)(n.code,{children:"VNavConstraint"})})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Gets the next altitude limit for the current phase of flight. (used to calculate the required VS and is not always the next constraint)\nIn descent, this will return the next above altitude in the vertical plan.\nIn climb, this will return the next below altitude in the vertical plan."}),"\n",(0,t.jsx)(n.h4,{id:"parameters-7",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"planIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The vertical flight plan index."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"activeLateralLeg"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The current active lateral leg."})]})]})]}),"\n",(0,t.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavConstraint",children:(0,t.jsx)(n.code,{children:"VNavConstraint"})})]}),"\n",(0,t.jsx)(n.p,{children:"The VNavConstraint not to exceed appropriate to the current phase of flight, or undefined if one does not exist."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:102"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"gettargetaltitude",children:"getTargetAltitude()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"getTargetAltitude"}),"(",(0,t.jsx)(n.code,{children:"planIndex"}),", ",(0,t.jsx)(n.code,{children:"globalLegIndex"}),"): ",(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Gets the VNAV target altitude for a flight plan leg."}),"\n",(0,t.jsx)(n.h4,{id:"parameters-8",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"planIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The flight plan index."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"globalLegIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The global index of the flight plan leg."})]})]})]}),"\n",(0,t.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.code,{children:"number"})]}),"\n",(0,t.jsxs)(n.p,{children:["The VNAV target altitude for the specified flight plan leg, or ",(0,t.jsx)(n.code,{children:"undefined"})," if none exists."]}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:61"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"gettargetconstraint",children:"getTargetConstraint()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"getTargetConstraint"}),"(",(0,t.jsx)(n.code,{children:"planIndex"}),", ",(0,t.jsx)(n.code,{children:"globalLegIndex"}),"): ",(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavConstraint",children:(0,t.jsx)(n.code,{children:"VNavConstraint"})})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Gets the VNAV constraint defining the target VNAV altitude for a flight plan leg."}),"\n",(0,t.jsx)(n.h4,{id:"parameters-9",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"planIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The flight plan index."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"globalLegIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The global index of the flight plan leg."})]})]})]}),"\n",(0,t.jsx)(n.h4,{id:"returns-9",children:"Returns"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavConstraint",children:(0,t.jsx)(n.code,{children:"VNavConstraint"})})]}),"\n",(0,t.jsxs)(n.p,{children:["The VNAV constraint defining the target VNAV altitude for the specified flight plan leg, or ",(0,t.jsx)(n.code,{children:"undefined"}),"\nif one could not be found."]}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:53"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"gettargetconstraintindex",children:"getTargetConstraintIndex()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"getTargetConstraintIndex"}),"(",(0,t.jsx)(n.code,{children:"planIndex"}),", ",(0,t.jsx)(n.code,{children:"globalLegIndex"}),"): ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Gets the index of the VNAV constraint defining the target VNAV altitude for a flight plan leg."}),"\n",(0,t.jsx)(n.h4,{id:"parameters-10",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"planIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The flight plan index."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"globalLegIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The global index of the flight plan leg."})]})]})]}),"\n",(0,t.jsx)(n.h4,{id:"returns-10",children:"Returns"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.code,{children:"number"})}),"\n",(0,t.jsxs)(n.p,{children:["The index of the VNAV constraint defining the target VNAV altitude for the specified flight plan leg, or\n",(0,t.jsx)(n.code,{children:"-1"})," if one could not be found."]}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:44"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"getverticalflightplan",children:"getVerticalFlightPlan()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"getVerticalFlightPlan"}),"(",(0,t.jsx)(n.code,{children:"planIndex"}),"): ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VerticalFlightPlan",children:(0,t.jsx)(n.code,{children:"VerticalFlightPlan"})})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Gets a vertical flight plan by index, or throws not found if the plan does not exist."}),"\n",(0,t.jsx)(n.h4,{id:"parameters-11",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsx)(n.tbody,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"planIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The vertical flight plan index."})]})})]}),"\n",(0,t.jsx)(n.h4,{id:"returns-11",children:"Returns"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VerticalFlightPlan",children:(0,t.jsx)(n.code,{children:"VerticalFlightPlan"})})}),"\n",(0,t.jsx)(n.p,{children:"The requested vertical flight plan."}),"\n",(0,t.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,t.jsx)(n.p,{children:"Not found if the flight plan index is not valid."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:28"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"requestpathcompute",children:"requestPathCompute()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"requestPathCompute"}),"(",(0,t.jsx)(n.code,{children:"planIndex"}),"): ",(0,t.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Request an out-of-cycle path computation for a specified vertical flight plan."}),"\n",(0,t.jsx)(n.h4,{id:"parameters-12",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsx)(n.tbody,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"planIndex"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:"The vertical flight plan index."})]})})]}),"\n",(0,t.jsx)(n.h4,{id:"returns-12",children:"Returns"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.code,{children:"boolean"})}),"\n",(0,t.jsx)(n.p,{children:"Whether or not the computation was completed successfully."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/calculators/VNavPathCalculator.ts:123"})]})}function o(e={}){let{wrapper:n}={...(0,l.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(h,{...e})}):h(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return s},a:function(){return d}});var i=r(667294);let t={},l=i.createContext(t);function d(e){let n=i.useContext(l);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function s(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:d(e.components),i.createElement(l.Provider,{value:n},e.children)}}}]);