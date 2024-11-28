"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["781019"],{338102:function(e,n,i){i.r(n),i.d(n,{metadata:()=>d,contentTitle:()=>a,default:()=>h,assets:()=>t,toc:()=>o,frontMatter:()=>l});var d=JSON.parse('{"id":"api/framework/interfaces/APConfig","title":"Interface: APConfig","description":"An autopilot configuration.","source":"@site/docs/api/framework/interfaces/APConfig.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/APConfig","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/APConfig","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"AntiIceNonIndexedEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/AntiIceNonIndexedEvents"},"next":{"title":"APEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/APEvents"}}'),r=i("785893"),s=i("250065");let l={},a="Interface: APConfig",t={},o=[{value:"Properties",id:"properties",level:2},{value:"altitudeHoldSlotIndex?",id:"altitudeholdslotindex",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"autoEngageFd?",id:"autoengagefd",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"autopilotDriverOptions?",id:"autopilotdriveroptions",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"cdiId?",id:"cdiid",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"deactivateAutopilotOnGa?",id:"deactivateautopilotonga",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"defaultLateralMode",id:"defaultlateralmode",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"defaultMaxBankAngle?",id:"defaultmaxbankangle",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"defaultMaxNoseDownPitchAngle?",id:"defaultmaxnosedownpitchangle",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"defaultMaxNoseUpPitchAngle?",id:"defaultmaxnoseuppitchangle",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"defaultVerticalMode",id:"defaultverticalmode",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"headingHoldSlotIndex?",id:"headingholdslotindex",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"independentFds?",id:"independentfds",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"onlyDisarmLnavOnOffEvent?",id:"onlydisarmlnavonoffevent",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"publishAutopilotModesAsLVars?",id:"publishautopilotmodesaslvars",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"Methods",id:"methods",level:2},{value:"createLateralDirectors()?",id:"createlateraldirectors",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"createNavToNavManager()?",id:"createnavtonavmanager",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"createVariableBankManager()?",id:"createvariablebankmanager",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"createVerticalDirectors()?",id:"createverticaldirectors",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"createVNavManager()?",id:"createvnavmanager",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-18",level:4}];function c(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,s.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"interface-apconfig",children:"Interface: APConfig"})}),"\n",(0,r.jsx)(n.p,{children:"An autopilot configuration."}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"altitudeholdslotindex",children:"altitudeHoldSlotIndex?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"altitudeHoldSlotIndex"}),": ",(0,r.jsx)(n.code,{children:"2"})," | ",(0,r.jsx)(n.code,{children:"1"})," | ",(0,r.jsx)(n.code,{children:"3"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The altitude hold slot index to use. Defaults to 1"}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:83"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"autoengagefd",children:"autoEngageFd?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"autoEngageFd"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Whether to automatically engage the FD(s) with AP or mode button presses, defaults to true.\nLateral/Vertical press events will be ignored if this is false and neither AP nor FDs are engaged."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:103"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"autopilotdriveroptions",children:"autopilotDriverOptions?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"autopilotDriverOptions"}),": ",(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/AutopilotDriverOptions",children:(0,r.jsx)(n.code,{children:"AutopilotDriverOptions"})}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Options for the Autopilot Driver"}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:113"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"cdiid",children:"cdiId?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"cdiId"}),": ",(0,r.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The ID of the CDI associated with the autopilot. Defaults to the empty string ",(0,r.jsx)(n.code,{children:"''"}),"."]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:89"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"deactivateautopilotonga",children:"deactivateAutopilotOnGa?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"deactivateAutopilotOnGa"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Whether to deactivate the autopilot when GA mode is armed in response to a TO/GA mode button press. Defaults to ",(0,r.jsx)(n.code,{children:"true"}),"."]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:97"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"defaultlateralmode",children:"defaultLateralMode"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"defaultLateralMode"}),": ",(0,r.jsx)(n.code,{children:"number"})," | () => ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The autopilot's default lateral mode."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:59"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"defaultmaxbankangle",children:"defaultMaxBankAngle?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"defaultMaxBankAngle"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The default maximum bank angle the autopilot may command in degrees.\nIf not defined, then the maximum bank angle will be sourced from the AUTOPILOT MAX BANK SimVar"}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:68"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"defaultmaxnosedownpitchangle",children:"defaultMaxNoseDownPitchAngle?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"defaultMaxNoseDownPitchAngle"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The default maximum nose down pitch angle the autopilot may command in degrees.\nIf not defined, then the maximum angle will be 15 degrees."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:80"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"defaultmaxnoseuppitchangle",children:"defaultMaxNoseUpPitchAngle?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"defaultMaxNoseUpPitchAngle"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The default maximum nose up pitch angle the autopilot may command in degrees.\nIf not defined, then the maximum angle will be 15 degrees."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:74"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"defaultverticalmode",children:"defaultVerticalMode"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"defaultVerticalMode"}),": ",(0,r.jsx)(n.code,{children:"number"})," | () => ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The autopilot's default vertical mode."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:62"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"headingholdslotindex",children:"headingHoldSlotIndex?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"headingHoldSlotIndex"}),": ",(0,r.jsx)(n.code,{children:"2"})," | ",(0,r.jsx)(n.code,{children:"1"})," | ",(0,r.jsx)(n.code,{children:"3"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The heading hold slot index to use. Defaults to 1"}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:86"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"independentfds",children:"independentFds?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"independentFds"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Whether to have independent flight directors that can be switched on/off separately. Defaults to false."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:108"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"onlydisarmlnavonoffevent",children:"onlyDisarmLnavOnOffEvent?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"onlyDisarmLnavOnOffEvent"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Whether to only allow disarming (not deactivating) LNAV when receiving the ",(0,r.jsx)(n.code,{children:"AP_NAV1_HOLD_OFF"})," event"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:94"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"publishautopilotmodesaslvars",children:"publishAutopilotModesAsLVars?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"publishAutopilotModesAsLVars"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Whether to publish the active and armed autopilot modes as LVars. Defaults to false."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:118"}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"createlateraldirectors",children:"createLateralDirectors()?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"createLateralDirectors"}),"(",(0,r.jsx)(n.code,{children:"apValues"}),"): ",(0,r.jsx)(n.code,{children:"Iterable"}),"<",(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/APConfigDirectorEntry",children:(0,r.jsx)(n.code,{children:"APConfigDirectorEntry"})}),">>"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Creates the autopilot's lateral mode directors. Mode ",(0,r.jsx)(n.code,{children:"APLateralModes.NONE"})," (0) is ignored."]}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"apValues"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/APValues",children:(0,r.jsx)(n.code,{children:"APValues"})})}),(0,r.jsx)(n.td,{children:"The autopilot's state values."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Iterable"}),"<",(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/APConfigDirectorEntry",children:(0,r.jsx)(n.code,{children:"APConfigDirectorEntry"})}),">>"]}),"\n",(0,r.jsx)(n.p,{children:"An iterable of lateral mode directors to add to the autopilot."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:49"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"createnavtonavmanager",children:"createNavToNavManager()?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"createNavToNavManager"}),"(",(0,r.jsx)(n.code,{children:"apValues"}),"): ",(0,r.jsx)(n.code,{children:"undefined"})," | ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/NavToNavManager2",children:(0,r.jsx)(n.code,{children:"NavToNavManager2"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Creates the autopilot's nav-to-nav manager."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"apValues"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/APValues",children:(0,r.jsx)(n.code,{children:"APValues"})})}),(0,r.jsx)(n.td,{children:"The autopilot's state values."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"undefined"})," | ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/NavToNavManager2",children:(0,r.jsx)(n.code,{children:"NavToNavManager2"})})]}),"\n",(0,r.jsx)(n.p,{children:"The autopilot's nav-to-nav manager."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:35"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"createvariablebankmanager",children:"createVariableBankManager()?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"createVariableBankManager"}),"(",(0,r.jsx)(n.code,{children:"apValues"}),"): ",(0,r.jsx)(n.code,{children:"undefined"})," | ",(0,r.jsx)(n.code,{children:"Record"}),"<",(0,r.jsx)(n.code,{children:"any"}),", ",(0,r.jsx)(n.code,{children:"any"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Creates the autopilot's variable bank manager."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"apValues"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/APValues",children:(0,r.jsx)(n.code,{children:"APValues"})})}),(0,r.jsx)(n.td,{children:"The autopilot's state values."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"undefined"})," | ",(0,r.jsx)(n.code,{children:"Record"}),"<",(0,r.jsx)(n.code,{children:"any"}),", ",(0,r.jsx)(n.code,{children:"any"}),">"]}),"\n",(0,r.jsx)(n.p,{children:"The autopilot's variable bank manager."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:42"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"createverticaldirectors",children:"createVerticalDirectors()?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"createVerticalDirectors"}),"(",(0,r.jsx)(n.code,{children:"apValues"}),"): ",(0,r.jsx)(n.code,{children:"Iterable"}),"<",(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/APConfigDirectorEntry",children:(0,r.jsx)(n.code,{children:"APConfigDirectorEntry"})}),">>"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Creates the autopilot's vertical mode directors. Mode ",(0,r.jsx)(n.code,{children:"APVerticalModes.NONE"})," (0) is ignored."]}),"\n",(0,r.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"apValues"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/APValues",children:(0,r.jsx)(n.code,{children:"APValues"})})}),(0,r.jsx)(n.td,{children:"The autopilot's state values."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Iterable"}),"<",(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/APConfigDirectorEntry",children:(0,r.jsx)(n.code,{children:"APConfigDirectorEntry"})}),">>"]}),"\n",(0,r.jsx)(n.p,{children:"An iterable of vertical mode directors to add to the autopilot."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:56"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"createvnavmanager",children:"createVNavManager()?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"createVNavManager"}),"(",(0,r.jsx)(n.code,{children:"apValues"}),"): ",(0,r.jsx)(n.code,{children:"undefined"})," | ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavManager",children:(0,r.jsx)(n.code,{children:"VNavManager"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Creates the autopilot's VNAV Manager."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"apValues"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/APValues",children:(0,r.jsx)(n.code,{children:"APValues"})})}),(0,r.jsx)(n.td,{children:"The autopilot's state values."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"undefined"})," | ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavManager",children:(0,r.jsx)(n.code,{children:"VNavManager"})})]}),"\n",(0,r.jsx)(n.p,{children:"The autopilot's VNAV Manager."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/APConfig.ts:28"})]})}function h(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(c,{...e})}):c(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return a},a:function(){return l}});var d=i(667294);let r={},s=d.createContext(r);function l(e){let n=d.useContext(s);return d.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),d.createElement(s.Provider,{value:n},e.children)}}}]);