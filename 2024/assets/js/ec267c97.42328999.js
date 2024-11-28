"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["547172"],{49747:function(e,i,n){n.r(i),n.d(i,{metadata:()=>r,contentTitle:()=>l,default:()=>h,assets:()=>t,toc:()=>a,frontMatter:()=>c});var r=JSON.parse('{"id":"api/framework/classes/APVNavPathDirector","title":"Class: APVNavPathDirector","description":"A VNAV Path autopilot director.","source":"@site/docs/api/framework/classes/APVNavPathDirector.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/APVNavPathDirector","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/APVNavPathDirector","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"APTrkHoldDirector","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/APTrkHoldDirector"},"next":{"title":"APVSDirector","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/APVSDirector"}}'),d=n("785893"),s=n("250065");let c={},l="Class: APVNavPathDirector",t={},a=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new APVNavPathDirector()",id:"new-apvnavpathdirector",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"deviationSimVar",id:"deviationsimvar",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"drivePitch()?",id:"drivepitch",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"fpaSimVar",id:"fpasimvar",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"getDeviationFunc()",id:"getdeviationfunc",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"getFpaFunc()",id:"getfpafunc",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"guidance?",id:"guidance",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"isGuidanceValidFunc()",id:"isguidancevalidfunc",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"onActivate()?",id:"onactivate",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"onArm()?",id:"onarm",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"onDeactivate()?",id:"ondeactivate",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"state",id:"state",level:3},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"verticalWindAverage",id:"verticalwindaverage",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"vnavIndex?",id:"vnavindex",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"Methods",id:"methods",level:2},{value:"activate()",id:"activate",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Implementation of",id:"implementation-of-5",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"arm()",id:"arm",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Implementation of",id:"implementation-of-6",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"deactivate()",id:"deactivate",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Implementation of",id:"implementation-of-7",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"getDesiredPitch()",id:"getdesiredpitch",level:3},{value:"Returns",id:"returns-11",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"update()",id:"update",level:3},{value:"Returns",id:"returns-12",level:4},{value:"Implementation of",id:"implementation-of-8",level:4},{value:"Defined in",id:"defined-in-18",level:4}];function o(e){let i={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(i.header,{children:(0,d.jsx)(i.h1,{id:"class-apvnavpathdirector",children:"Class: APVNavPathDirector"})}),"\n",(0,d.jsx)(i.p,{children:"A VNAV Path autopilot director."}),"\n",(0,d.jsx)(i.h2,{id:"implements",children:"Implements"}),"\n",(0,d.jsxs)(i.ul,{children:["\n",(0,d.jsx)(i.li,{children:(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,d.jsx)(i.code,{children:"PlaneDirector"})})}),"\n"]}),"\n",(0,d.jsx)(i.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(i.h3,{id:"new-apvnavpathdirector",children:"new APVNavPathDirector()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.strong,{children:"new APVNavPathDirector"}),"(",(0,d.jsx)(i.code,{children:"bus"}),", ",(0,d.jsx)(i.code,{children:"options"}),"?): ",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/APVNavPathDirector",children:(0,d.jsx)(i.code,{children:"APVNavPathDirector"})})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"Creates a new instance of APVNavPathDirector."}),"\n",(0,d.jsx)(i.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(i.table,{children:[(0,d.jsx)(i.thead,{children:(0,d.jsxs)(i.tr,{children:[(0,d.jsx)(i.th,{children:"Parameter"}),(0,d.jsx)(i.th,{children:"Type"}),(0,d.jsx)(i.th,{children:"Description"})]})}),(0,d.jsxs)(i.tbody,{children:[(0,d.jsxs)(i.tr,{children:[(0,d.jsx)(i.td,{children:(0,d.jsx)(i.code,{children:"bus"})}),(0,d.jsx)(i.td,{children:(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/EventBus",children:(0,d.jsx)(i.code,{children:"EventBus"})})}),(0,d.jsx)(i.td,{children:"The event bus."})]}),(0,d.jsxs)(i.tr,{children:[(0,d.jsxs)(i.td,{children:[(0,d.jsx)(i.code,{children:"options"}),"?"]}),(0,d.jsxs)(i.td,{children:[(0,d.jsx)(i.code,{children:"Readonly"}),"<",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/APVNavPathDirectorOptions",children:(0,d.jsx)(i.code,{children:"APVNavPathDirectorOptions"})}),">"]}),(0,d.jsx)(i.td,{children:"Options with which to configure the director."})]})]})]}),"\n",(0,d.jsx)(i.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/APVNavPathDirector",children:(0,d.jsx)(i.code,{children:"APVNavPathDirector"})})}),"\n",(0,d.jsx)(i.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:86"}),"\n",(0,d.jsx)(i.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(i.h3,{id:"deviationsimvar",children:"deviationSimVar"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"protected"})," ",(0,d.jsx)(i.strong,{children:"deviationSimVar"}),": ",(0,d.jsx)(i.code,{children:"string"})," = ",(0,d.jsx)(i.code,{children:"VNavVars.VerticalDeviation"})]}),"\n"]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:74"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"drivepitch",children:"drivePitch()?"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"optional"})," ",(0,d.jsx)(i.strong,{children:"drivePitch"}),": (",(0,d.jsx)(i.code,{children:"pitch"}),", ",(0,d.jsx)(i.code,{children:"adjustForAoa"}),"?, ",(0,d.jsx)(i.code,{children:"adjustForVerticalWind"}),"?) => ",(0,d.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"A function used to drive the autopilot commanded pitch angle toward a desired value while optionally correcting\nfor angle of attack and vertical wind."}),"\n",(0,d.jsx)(i.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(i.table,{children:[(0,d.jsx)(i.thead,{children:(0,d.jsxs)(i.tr,{children:[(0,d.jsx)(i.th,{children:"Parameter"}),(0,d.jsx)(i.th,{children:"Type"})]})}),(0,d.jsxs)(i.tbody,{children:[(0,d.jsxs)(i.tr,{children:[(0,d.jsx)(i.td,{children:(0,d.jsx)(i.code,{children:"pitch"})}),(0,d.jsx)(i.td,{children:(0,d.jsx)(i.code,{children:"number"})})]}),(0,d.jsxs)(i.tr,{children:[(0,d.jsxs)(i.td,{children:[(0,d.jsx)(i.code,{children:"adjustForAoa"}),"?"]}),(0,d.jsx)(i.td,{children:(0,d.jsx)(i.code,{children:"boolean"})})]}),(0,d.jsxs)(i.tr,{children:[(0,d.jsxs)(i.td,{children:[(0,d.jsx)(i.code,{children:"adjustForVerticalWind"}),"?"]}),(0,d.jsx)(i.td,{children:(0,d.jsx)(i.code,{children:"boolean"})})]})]})]}),"\n",(0,d.jsx)(i.h4,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"void"})}),"\n",(0,d.jsx)(i.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,d.jsx)(i.code,{children:"PlaneDirector"})}),".",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#drivepitch",children:(0,d.jsx)(i.code,{children:"drivePitch"})})]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:66"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"fpasimvar",children:"fpaSimVar"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"protected"})," ",(0,d.jsx)(i.strong,{children:"fpaSimVar"}),": ",(0,d.jsx)(i.code,{children:"string"})," = ",(0,d.jsx)(i.code,{children:"VNavVars.FPA"})]}),"\n"]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:75"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"getdeviationfunc",children:"getDeviationFunc()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"protected"})," ",(0,d.jsx)(i.code,{children:"readonly"})," ",(0,d.jsx)(i.strong,{children:"getDeviationFunc"}),": () => ",(0,d.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,d.jsx)(i.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"number"})}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:79"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"getfpafunc",children:"getFpaFunc()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"protected"})," ",(0,d.jsx)(i.code,{children:"readonly"})," ",(0,d.jsx)(i.strong,{children:"getFpaFunc"}),": () => ",(0,d.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,d.jsx)(i.h4,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"number"})}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:78"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"guidance",children:"guidance?"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"protected"})," ",(0,d.jsx)(i.code,{children:"readonly"})," ",(0,d.jsx)(i.code,{children:"optional"})," ",(0,d.jsx)(i.strong,{children:"guidance"}),": ",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Accessible",children:(0,d.jsx)(i.code,{children:"Accessible"})}),"<",(0,d.jsx)(i.code,{children:"Readonly"}),"<",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/APVNavPathDirectorGuidance",children:(0,d.jsx)(i.code,{children:"APVNavPathDirectorGuidance"})}),">>"]}),"\n"]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:70"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"isguidancevalidfunc",children:"isGuidanceValidFunc()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"protected"})," ",(0,d.jsx)(i.code,{children:"readonly"})," ",(0,d.jsx)(i.strong,{children:"isGuidanceValidFunc"}),": () => ",(0,d.jsx)(i.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsx)(i.h4,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"boolean"})}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:77"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"onactivate",children:"onActivate()?"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"optional"})," ",(0,d.jsx)(i.strong,{children:"onActivate"}),": () => ",(0,d.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"A callback called when a mode signals it should\nbe activated."}),"\n",(0,d.jsx)(i.h4,{id:"returns-5",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"void"})}),"\n",(0,d.jsx)(i.h4,{id:"implementation-of-1",children:"Implementation of"}),"\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,d.jsx)(i.code,{children:"PlaneDirector"})}),".",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#onactivate",children:(0,d.jsx)(i.code,{children:"onActivate"})})]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:57"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"onarm",children:"onArm()?"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"optional"})," ",(0,d.jsx)(i.strong,{children:"onArm"}),": () => ",(0,d.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"A callback called when a mode signals it should\nbe armed."}),"\n",(0,d.jsx)(i.h4,{id:"returns-6",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"void"})}),"\n",(0,d.jsx)(i.h4,{id:"implementation-of-2",children:"Implementation of"}),"\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,d.jsx)(i.code,{children:"PlaneDirector"})}),".",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#onarm",children:(0,d.jsx)(i.code,{children:"onArm"})})]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:60"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"ondeactivate",children:"onDeactivate()?"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"optional"})," ",(0,d.jsx)(i.strong,{children:"onDeactivate"}),": () => ",(0,d.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"A callback called when a mode signals it should\nbe deactivated."}),"\n",(0,d.jsx)(i.h4,{id:"returns-7",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"void"})}),"\n",(0,d.jsx)(i.h4,{id:"implementation-of-3",children:"Implementation of"}),"\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,d.jsx)(i.code,{children:"PlaneDirector"})}),".",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#ondeactivate",children:(0,d.jsx)(i.code,{children:"onDeactivate"})})]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:63"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"state",children:"state"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.strong,{children:"state"}),": ",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/DirectorState",children:(0,d.jsx)(i.code,{children:"DirectorState"})})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"The current director state."}),"\n",(0,d.jsx)(i.h4,{id:"implementation-of-4",children:"Implementation of"}),"\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,d.jsx)(i.code,{children:"PlaneDirector"})}),".",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#state",children:(0,d.jsx)(i.code,{children:"state"})})]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:54"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"verticalwindaverage",children:"verticalWindAverage"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"protected"})," ",(0,d.jsx)(i.strong,{children:"verticalWindAverage"}),": ",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/SimpleMovingAverage",children:(0,d.jsx)(i.code,{children:"SimpleMovingAverage"})})]}),"\n"]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:68"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"vnavindex",children:"vnavIndex?"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"protected"})," ",(0,d.jsx)(i.code,{children:"readonly"})," ",(0,d.jsx)(i.code,{children:"optional"})," ",(0,d.jsx)(i.strong,{children:"vnavIndex"}),": ",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscribable",children:(0,d.jsx)(i.code,{children:"Subscribable"})}),"<",(0,d.jsx)(i.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:72"}),"\n",(0,d.jsx)(i.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(i.h3,{id:"activate",children:"activate()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.strong,{children:"activate"}),"(): ",(0,d.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"Activates the guidance mode."}),"\n",(0,d.jsx)(i.h4,{id:"returns-8",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"void"})}),"\n",(0,d.jsx)(i.h4,{id:"implementation-of-5",children:"Implementation of"}),"\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,d.jsx)(i.code,{children:"PlaneDirector"})}),".",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#activate",children:(0,d.jsx)(i.code,{children:"activate"})})]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:115"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"arm",children:"arm()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.strong,{children:"arm"}),"(): ",(0,d.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"Arms the guidance mode."}),"\n",(0,d.jsx)(i.h4,{id:"returns-9",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"void"})}),"\n",(0,d.jsx)(i.h4,{id:"implementation-of-6",children:"Implementation of"}),"\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,d.jsx)(i.code,{children:"PlaneDirector"})}),".",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#arm",children:(0,d.jsx)(i.code,{children:"arm"})})]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:124"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"deactivate",children:"deactivate()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.strong,{children:"deactivate"}),"(): ",(0,d.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"Deactivates the guidance mode."}),"\n",(0,d.jsx)(i.h4,{id:"returns-10",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"void"})}),"\n",(0,d.jsx)(i.h4,{id:"implementation-of-7",children:"Implementation of"}),"\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,d.jsx)(i.code,{children:"PlaneDirector"})}),".",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#deactivate",children:(0,d.jsx)(i.code,{children:"deactivate"})})]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:134"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"getdesiredpitch",children:"getDesiredPitch()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"protected"})," ",(0,d.jsx)(i.strong,{children:"getDesiredPitch"}),"(): ",(0,d.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"Gets a desired pitch from the FPA, AOA and Deviation."}),"\n",(0,d.jsx)(i.h4,{id:"returns-11",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"number"})}),"\n",(0,d.jsx)(i.p,{children:"The desired pitch angle."}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:155"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"update",children:"update()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.strong,{children:"update"}),"(): ",(0,d.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"Updates the guidance mode control loops."}),"\n",(0,d.jsx)(i.h4,{id:"returns-12",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"void"})}),"\n",(0,d.jsx)(i.h4,{id:"implementation-of-8",children:"Implementation of"}),"\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,d.jsx)(i.code,{children:"PlaneDirector"})}),".",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#update",children:(0,d.jsx)(i.code,{children:"update"})})]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"src/sdk/autopilot/directors/APVNavPathDirector.ts:140"})]})}function h(e={}){let{wrapper:i}={...(0,s.a)(),...e.components};return i?(0,d.jsx)(i,{...e,children:(0,d.jsx)(o,{...e})}):o(e)}},250065:function(e,i,n){n.d(i,{Z:function(){return l},a:function(){return c}});var r=n(667294);let d={},s=r.createContext(d);function c(e){let i=r.useContext(s);return r.useMemo(function(){return"function"==typeof e?e(i):{...i,...e}},[i,e])}function l(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:c(e.components),r.createElement(s.Provider,{value:i},e.children)}}}]);