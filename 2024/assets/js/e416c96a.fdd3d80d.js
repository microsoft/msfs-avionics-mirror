"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["553046"],{736155:function(e,n,r){r.r(n),r.d(n,{metadata:()=>i,contentTitle:()=>l,default:()=>h,assets:()=>c,toc:()=>t,frontMatter:()=>d});var i=JSON.parse('{"id":"api/wt21shared/classes/PerformancePlanProxy","title":"Class: PerformancePlanProxy","description":"Proxy for accessing the performance plan data for the currently used flight plan.","source":"@site/docs/api/wt21shared/classes/PerformancePlanProxy.md","sourceDirName":"api/wt21shared/classes","slug":"/api/wt21shared/classes/PerformancePlanProxy","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/PerformancePlanProxy","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"PerformancePlan","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/PerformancePlan"},"next":{"title":"PerformancePlanRepository","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/PerformancePlanRepository"}}'),s=r("785893"),a=r("250065");let d={},l="Class: PerformancePlanProxy",c={},t=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new PerformancePlanProxy()",id:"new-performanceplanproxy",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"averagePassengerWeight",id:"averagepassengerweight",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"basicOperatingWeight",id:"basicoperatingweight",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"cargoWeight",id:"cargoweight",level:3},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"climbSpeedLimitAltitude",id:"climbspeedlimitaltitude",level:3},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"climbSpeedLimitIas",id:"climbspeedlimitias",level:3},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"climbTargetSpeedIas",id:"climbtargetspeedias",level:3},{value:"Implementation of",id:"implementation-of-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"climbTargetSpeedMach",id:"climbtargetspeedmach",level:3},{value:"Implementation of",id:"implementation-of-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"cruiseAltitude",id:"cruisealtitude",level:3},{value:"Implementation of",id:"implementation-of-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"cruiseTargetSpeedIas",id:"cruisetargetspeedias",level:3},{value:"Implementation of",id:"implementation-of-8",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"cruiseTargetSpeedMach",id:"cruisetargetspeedmach",level:3},{value:"Implementation of",id:"implementation-of-9",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"defaultValuesPlan",id:"defaultvaluesplan",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"descentSpeedLimitAltitude",id:"descentspeedlimitaltitude",level:3},{value:"Implementation of",id:"implementation-of-10",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"descentSpeedLimitIas",id:"descentspeedlimitias",level:3},{value:"Implementation of",id:"implementation-of-11",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"descentTargetSpeedIas",id:"descenttargetspeedias",level:3},{value:"Implementation of",id:"implementation-of-12",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"descentTargetSpeedMach",id:"descenttargetspeedmach",level:3},{value:"Implementation of",id:"implementation-of-13",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"descentVPA",id:"descentvpa",level:3},{value:"Implementation of",id:"implementation-of-14",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"manualGw",id:"manualgw",level:3},{value:"Implementation of",id:"implementation-of-15",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"manualLw",id:"manuallw",level:3},{value:"Implementation of",id:"implementation-of-16",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"manualZfw",id:"manualzfw",level:3},{value:"Implementation of",id:"implementation-of-17",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"onAfterEdit()",id:"onafteredit",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"onBeforeEdit()",id:"onbeforeedit",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"paxNumber",id:"paxnumber",level:3},{value:"Implementation of",id:"implementation-of-18",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"reserveFuel",id:"reservefuel",level:3},{value:"Implementation of",id:"implementation-of-19",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"transitionAltitude",id:"transitionaltitude",level:3},{value:"Implementation of",id:"implementation-of-20",level:4},{value:"Defined in",id:"defined-in-24",level:4},{value:"Methods",id:"methods",level:2},{value:"switchToPlan()",id:"switchtoplan",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-25",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,a.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"class-performanceplanproxy",children:"Class: PerformancePlanProxy"})}),"\n",(0,s.jsx)(n.p,{children:"Proxy for accessing the performance plan data for the currently used flight plan."}),"\n",(0,s.jsxs)(n.p,{children:["This exposes all mutable subscribables defined in ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:"PerformancePlanData"}),", but reflects them on the\nappropriate flight plan automatically. It handles switching around subscriptions and notifying the FMS before editing a\nvalue (so that a MOD plan can be created)."]}),"\n",(0,s.jsx)(n.p,{children:"This is used to tie FMC pages and FMC components to the relevant mutSubs without having to manually switch them around\ndepending on MOD/ACT."}),"\n",(0,s.jsx)(n.h2,{id:"implements",children:"Implements"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,s.jsx)(n.h3,{id:"new-performanceplanproxy",children:"new PerformancePlanProxy()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"new PerformancePlanProxy"}),"(",(0,s.jsx)(n.code,{children:"defaultValuesPlan"}),", ",(0,s.jsx)(n.code,{children:"onBeforeEdit"}),", ",(0,s.jsx)(n.code,{children:"onAfterEdit"}),"): ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/PerformancePlanProxy",children:(0,s.jsx)(n.code,{children:"PerformancePlanProxy"})})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Ctor"}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"defaultValuesPlan"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})})}),(0,s.jsx)(n.td,{children:"plan containing default values"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"onBeforeEdit"})}),(0,s.jsxs)(n.td,{children:["(",(0,s.jsx)(n.code,{children:"property"}),", ",(0,s.jsx)(n.code,{children:"newValue"}),") => ",(0,s.jsx)(n.code,{children:"void"})]}),(0,s.jsx)(n.td,{children:"callback fired before an edit is performed"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"onAfterEdit"})}),(0,s.jsxs)(n.td,{children:["(",(0,s.jsx)(n.code,{children:"property"}),", ",(0,s.jsx)(n.code,{children:"newValue"}),") => ",(0,s.jsx)(n.code,{children:"void"})]}),(0,s.jsx)(n.td,{children:"callback fired after an edit is performed"})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/PerformancePlanProxy",children:(0,s.jsx)(n.code,{children:"PerformancePlanProxy"})})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:67"}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"averagepassengerweight",children:"averagePassengerWeight"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"averagePassengerWeight"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"averagePassengerWeight"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#averagepassengerweight",children:(0,s.jsx)(n.code,{children:"averagePassengerWeight"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:18"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"basicoperatingweight",children:"basicOperatingWeight"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"basicOperatingWeight"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"basicOperatingWeight"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-1",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#basicoperatingweight",children:(0,s.jsx)(n.code,{children:"basicOperatingWeight"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:20"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"cargoweight",children:"cargoWeight"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"cargoWeight"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"cargoWeight"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-2",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#cargoweight",children:(0,s.jsx)(n.code,{children:"cargoWeight"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:22"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"climbspeedlimitaltitude",children:"climbSpeedLimitAltitude"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"climbSpeedLimitAltitude"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"climbSpeedLimitAltitude"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-3",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#climbspeedlimitaltitude",children:(0,s.jsx)(n.code,{children:"climbSpeedLimitAltitude"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:36"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"climbspeedlimitias",children:"climbSpeedLimitIas"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"climbSpeedLimitIas"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"climbSpeedLimitIas"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-4",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#climbspeedlimitias",children:(0,s.jsx)(n.code,{children:"climbSpeedLimitIas"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:34"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"climbtargetspeedias",children:"climbTargetSpeedIas"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"climbTargetSpeedIas"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"climbTargetSpeedIas"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-5",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#climbtargetspeedias",children:(0,s.jsx)(n.code,{children:"climbTargetSpeedIas"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:30"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"climbtargetspeedmach",children:"climbTargetSpeedMach"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"climbTargetSpeedMach"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"climbTargetSpeedMach"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-6",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#climbtargetspeedmach",children:(0,s.jsx)(n.code,{children:"climbTargetSpeedMach"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:32"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"cruisealtitude",children:"cruiseAltitude"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"cruiseAltitude"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"cruiseAltitude"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The cruise altitude in feet, or null when not set."}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-7",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#cruisealtitude",children:(0,s.jsx)(n.code,{children:"cruiseAltitude"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:43"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"cruisetargetspeedias",children:"cruiseTargetSpeedIas"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"cruiseTargetSpeedIas"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"cruiseTargetSpeedIas"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-8",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#cruisetargetspeedias",children:(0,s.jsx)(n.code,{children:"cruiseTargetSpeedIas"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:38"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"cruisetargetspeedmach",children:"cruiseTargetSpeedMach"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"cruiseTargetSpeedMach"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"cruiseTargetSpeedMach"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-9",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#cruisetargetspeedmach",children:(0,s.jsx)(n.code,{children:"cruiseTargetSpeedMach"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:40"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"defaultvaluesplan",children:"defaultValuesPlan"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"defaultValuesPlan"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"plan containing default values"}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:68"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"descentspeedlimitaltitude",children:"descentSpeedLimitAltitude"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"descentSpeedLimitAltitude"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"descentSpeedLimitAltitude"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-10",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#descentspeedlimitaltitude",children:(0,s.jsx)(n.code,{children:"descentSpeedLimitAltitude"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:51"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"descentspeedlimitias",children:"descentSpeedLimitIas"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"descentSpeedLimitIas"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"descentSpeedLimitIas"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-11",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#descentspeedlimitias",children:(0,s.jsx)(n.code,{children:"descentSpeedLimitIas"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:49"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"descenttargetspeedias",children:"descentTargetSpeedIas"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"descentTargetSpeedIas"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"descentTargetSpeedIas"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-12",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#descenttargetspeedias",children:(0,s.jsx)(n.code,{children:"descentTargetSpeedIas"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:45"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"descenttargetspeedmach",children:"descentTargetSpeedMach"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"descentTargetSpeedMach"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"descentTargetSpeedMach"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-13",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#descenttargetspeedmach",children:(0,s.jsx)(n.code,{children:"descentTargetSpeedMach"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:47"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"descentvpa",children:"descentVPA"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"descentVPA"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"descentVPA"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-14",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#descentvpa",children:(0,s.jsx)(n.code,{children:"descentVPA"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:53"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"manualgw",children:"manualGw"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"manualGw"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"manualGw"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-15",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#manualgw",children:(0,s.jsx)(n.code,{children:"manualGw"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:28"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"manuallw",children:"manualLw"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"manualLw"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"manualLw"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-16",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#manuallw",children:(0,s.jsx)(n.code,{children:"manualLw"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:26"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"manualzfw",children:"manualZfw"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"manualZfw"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"manualZfw"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-17",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#manualzfw",children:(0,s.jsx)(n.code,{children:"manualZfw"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-19",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:24"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"onafteredit",children:"onAfterEdit()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"onAfterEdit"}),": (",(0,s.jsx)(n.code,{children:"property"}),", ",(0,s.jsx)(n.code,{children:"newValue"}),") => ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"callback fired after an edit is performed"}),"\n",(0,s.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"property"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<keyof ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),">"]})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"newValue"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"any"})})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-20",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:70"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"onbeforeedit",children:"onBeforeEdit()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"onBeforeEdit"}),": (",(0,s.jsx)(n.code,{children:"property"}),", ",(0,s.jsx)(n.code,{children:"newValue"}),") => ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"callback fired before an edit is performed"}),"\n",(0,s.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"property"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<keyof ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),">"]})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"newValue"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"any"})})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-21",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:69"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"paxnumber",children:"paxNumber"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"paxNumber"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"paxNumber"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-18",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#paxnumber",children:(0,s.jsx)(n.code,{children:"paxNumber"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-22",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:16"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"reservefuel",children:"reserveFuel"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"reserveFuel"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"reserveFuel"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-19",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#reservefuel",children:(0,s.jsx)(n.code,{children:"reserveFuel"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-23",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:57"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"transitionaltitude",children:"transitionAltitude"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"transitionAltitude"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/ProxiedPerformancePlanProperty",children:(0,s.jsx)(n.code,{children:"ProxiedPerformancePlanProperty"})}),"<",(0,s.jsx)(n.code,{children:'"transitionAltitude"'}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-20",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData",children:(0,s.jsx)(n.code,{children:"PerformancePlanData"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PerformancePlanData#transitionaltitude",children:(0,s.jsx)(n.code,{children:"transitionAltitude"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-24",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:55"}),"\n",(0,s.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(n.h3,{id:"switchtoplan",children:"switchToPlan()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"switchToPlan"}),"(",(0,s.jsx)(n.code,{children:"plan"}),", ",(0,s.jsx)(n.code,{children:"initial"}),"): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Switches the proxy to another performance plan"}),"\n",(0,s.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Default value"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"plan"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/PerformancePlan",children:(0,s.jsx)(n.code,{children:"PerformancePlan"})})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"undefined"})}),(0,s.jsx)(n.td,{children:"the performance plan to switch to"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"initial"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"boolean"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"false"})}),(0,s.jsx)(n.td,{children:"whether this is the initial setting of the backing performance plan"})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-25",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Performance/PerformancePlanProxy.ts:80"})]})}function h(e={}){let{wrapper:n}={...(0,a.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(o,{...e})}):o(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return l},a:function(){return d}});var i=r(667294);let s={},a=i.createContext(s);function d(e){let n=i.useContext(a);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:d(e.components),i.createElement(a.Provider,{value:n},e.children)}}}]);