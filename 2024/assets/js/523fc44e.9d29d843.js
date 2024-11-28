"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["127175"],{115481:function(e,r,n){n.r(r),n.d(r,{metadata:()=>i,contentTitle:()=>t,default:()=>h,assets:()=>o,toc:()=>c,frontMatter:()=>l});var i=JSON.parse('{"id":"api/framework/classes/APRollSteerDirector","title":"Class: APRollSteerDirector","description":"An autopilot roll-steering director. This director uses roll-steering commands to drive flight director bank","source":"@site/docs/api/framework/classes/APRollSteerDirector.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/APRollSteerDirector","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/APRollSteerDirector","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"APRollDirector","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/APRollDirector"},"next":{"title":"APStateManager","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/APStateManager"}}'),s=n("785893"),d=n("250065");let l={},t="Class: APRollSteerDirector",o={},c=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new APRollSteerDirector()",id:"new-aprollsteerdirector",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"driveBank()?",id:"drivebank",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"onActivate()?",id:"onactivate",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"onArm()?",id:"onarm",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"onDeactivate()?",id:"ondeactivate",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"state",id:"state",level:3},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"Methods",id:"methods",level:2},{value:"activate()",id:"activate",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Implementation of",id:"implementation-of-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"arm()",id:"arm",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Implementation of",id:"implementation-of-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"deactivate()",id:"deactivate",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Implementation of",id:"implementation-of-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"update()",id:"update",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Implementation of",id:"implementation-of-8",level:4},{value:"Defined in",id:"defined-in-9",level:4}];function a(e){let r={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(r.header,{children:(0,s.jsx)(r.h1,{id:"class-aprollsteerdirector",children:"Class: APRollSteerDirector"})}),"\n",(0,s.jsx)(r.p,{children:"An autopilot roll-steering director. This director uses roll-steering commands to drive flight director bank\ncommands."}),"\n",(0,s.jsx)(r.h2,{id:"implements",children:"Implements"}),"\n",(0,s.jsxs)(r.ul,{children:["\n",(0,s.jsx)(r.li,{children:(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(r.code,{children:"PlaneDirector"})})}),"\n"]}),"\n",(0,s.jsx)(r.h2,{id:"constructors",children:"Constructors"}),"\n",(0,s.jsx)(r.h3,{id:"new-aprollsteerdirector",children:"new APRollSteerDirector()"}),"\n",(0,s.jsxs)(r.blockquote,{children:["\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.strong,{children:"new APRollSteerDirector"}),"(",(0,s.jsx)(r.code,{children:"apValues"}),", ",(0,s.jsx)(r.code,{children:"steerCommand"}),", ",(0,s.jsx)(r.code,{children:"options"}),"?): ",(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/APRollSteerDirector",children:(0,s.jsx)(r.code,{children:"APRollSteerDirector"})})]}),"\n"]}),"\n",(0,s.jsx)(r.p,{children:"Creates a new instance of APRollSteerDirector."}),"\n",(0,s.jsx)(r.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(r.table,{children:[(0,s.jsx)(r.thead,{children:(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.th,{children:"Parameter"}),(0,s.jsx)(r.th,{children:"Type"}),(0,s.jsx)(r.th,{children:"Description"})]})}),(0,s.jsxs)(r.tbody,{children:[(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.code,{children:"apValues"})}),(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/APValues",children:(0,s.jsx)(r.code,{children:"APValues"})})}),(0,s.jsx)(r.td,{children:"Autopilot values from this director's parent autopilot."})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.code,{children:"steerCommand"})}),(0,s.jsxs)(r.td,{children:[(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Accessible",children:(0,s.jsx)(r.code,{children:"Accessible"})}),"<",(0,s.jsx)(r.code,{children:"Readonly"}),"<",(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/APRollSteerDirectorSteerCommand",children:(0,s.jsx)(r.code,{children:"APRollSteerDirectorSteerCommand"})}),">>"]}),(0,s.jsx)(r.td,{children:"The steering command used by this director."})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsxs)(r.td,{children:[(0,s.jsx)(r.code,{children:"options"}),"?"]}),(0,s.jsxs)(r.td,{children:[(0,s.jsx)(r.code,{children:"Readonly"}),"<",(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/APRollSteerDirectorOptions",children:(0,s.jsx)(r.code,{children:"APRollSteerDirectorOptions"})}),">"]}),(0,s.jsx)(r.td,{children:"Options to configure the new director."})]})]})]}),"\n",(0,s.jsx)(r.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(r.p,{children:(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/APRollSteerDirector",children:(0,s.jsx)(r.code,{children:"APRollSteerDirector"})})}),"\n",(0,s.jsx)(r.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(r.p,{children:"src/sdk/autopilot/directors/APRollSteerDirector.ts:137"}),"\n",(0,s.jsx)(r.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(r.h3,{id:"drivebank",children:"driveBank()?"}),"\n",(0,s.jsxs)(r.blockquote,{children:["\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.code,{children:"optional"})," ",(0,s.jsx)(r.strong,{children:"driveBank"}),": (",(0,s.jsx)(r.code,{children:"bank"}),", ",(0,s.jsx)(r.code,{children:"rate"}),"?) => ",(0,s.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(r.p,{children:"A function used to drive the autopilot commanded bank angle toward a desired value."}),"\n",(0,s.jsx)(r.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(r.table,{children:[(0,s.jsx)(r.thead,{children:(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.th,{children:"Parameter"}),(0,s.jsx)(r.th,{children:"Type"})]})}),(0,s.jsxs)(r.tbody,{children:[(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.code,{children:"bank"})}),(0,s.jsx)(r.td,{children:(0,s.jsx)(r.code,{children:"number"})})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsxs)(r.td,{children:[(0,s.jsx)(r.code,{children:"rate"}),"?"]}),(0,s.jsx)(r.td,{children:(0,s.jsx)(r.code,{children:"number"})})]})]})]}),"\n",(0,s.jsx)(r.h4,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsx)(r.p,{children:(0,s.jsx)(r.code,{children:"void"})}),"\n",(0,s.jsx)(r.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(r.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#drivebank",children:(0,s.jsx)(r.code,{children:"driveBank"})})]}),"\n",(0,s.jsx)(r.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(r.p,{children:"src/sdk/autopilot/directors/APRollSteerDirector.ts:113"}),"\n",(0,s.jsx)(r.hr,{}),"\n",(0,s.jsx)(r.h3,{id:"onactivate",children:"onActivate()?"}),"\n",(0,s.jsxs)(r.blockquote,{children:["\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.code,{children:"optional"})," ",(0,s.jsx)(r.strong,{children:"onActivate"}),": () => ",(0,s.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(r.p,{children:"A callback called when a mode signals it should\nbe activated."}),"\n",(0,s.jsx)(r.h4,{id:"returns-2",children:"Returns"}),"\n",(0,s.jsx)(r.p,{children:(0,s.jsx)(r.code,{children:"void"})}),"\n",(0,s.jsx)(r.h4,{id:"implementation-of-1",children:"Implementation of"}),"\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(r.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#onactivate",children:(0,s.jsx)(r.code,{children:"onActivate"})})]}),"\n",(0,s.jsx)(r.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(r.p,{children:"src/sdk/autopilot/directors/APRollSteerDirector.ts:104"}),"\n",(0,s.jsx)(r.hr,{}),"\n",(0,s.jsx)(r.h3,{id:"onarm",children:"onArm()?"}),"\n",(0,s.jsxs)(r.blockquote,{children:["\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.code,{children:"optional"})," ",(0,s.jsx)(r.strong,{children:"onArm"}),": () => ",(0,s.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(r.p,{children:"A callback called when a mode signals it should\nbe armed."}),"\n",(0,s.jsx)(r.h4,{id:"returns-3",children:"Returns"}),"\n",(0,s.jsx)(r.p,{children:(0,s.jsx)(r.code,{children:"void"})}),"\n",(0,s.jsx)(r.h4,{id:"implementation-of-2",children:"Implementation of"}),"\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(r.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#onarm",children:(0,s.jsx)(r.code,{children:"onArm"})})]}),"\n",(0,s.jsx)(r.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(r.p,{children:"src/sdk/autopilot/directors/APRollSteerDirector.ts:107"}),"\n",(0,s.jsx)(r.hr,{}),"\n",(0,s.jsx)(r.h3,{id:"ondeactivate",children:"onDeactivate()?"}),"\n",(0,s.jsxs)(r.blockquote,{children:["\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.code,{children:"optional"})," ",(0,s.jsx)(r.strong,{children:"onDeactivate"}),": () => ",(0,s.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(r.p,{children:"A callback called when a mode signals it should\nbe deactivated."}),"\n",(0,s.jsx)(r.h4,{id:"returns-4",children:"Returns"}),"\n",(0,s.jsx)(r.p,{children:(0,s.jsx)(r.code,{children:"void"})}),"\n",(0,s.jsx)(r.h4,{id:"implementation-of-3",children:"Implementation of"}),"\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(r.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#ondeactivate",children:(0,s.jsx)(r.code,{children:"onDeactivate"})})]}),"\n",(0,s.jsx)(r.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(r.p,{children:"src/sdk/autopilot/directors/APRollSteerDirector.ts:110"}),"\n",(0,s.jsx)(r.hr,{}),"\n",(0,s.jsx)(r.h3,{id:"state",children:"state"}),"\n",(0,s.jsxs)(r.blockquote,{children:["\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.strong,{children:"state"}),": ",(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/DirectorState",children:(0,s.jsx)(r.code,{children:"DirectorState"})})]}),"\n"]}),"\n",(0,s.jsx)(r.p,{children:"The current director state."}),"\n",(0,s.jsx)(r.h4,{id:"implementation-of-4",children:"Implementation of"}),"\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(r.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#state",children:(0,s.jsx)(r.code,{children:"state"})})]}),"\n",(0,s.jsx)(r.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,s.jsx)(r.p,{children:"src/sdk/autopilot/directors/APRollSteerDirector.ts:101"}),"\n",(0,s.jsx)(r.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(r.h3,{id:"activate",children:"activate()"}),"\n",(0,s.jsxs)(r.blockquote,{children:["\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.strong,{children:"activate"}),"(): ",(0,s.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(r.p,{children:"Activates the guidance mode."}),"\n",(0,s.jsx)(r.h4,{id:"returns-5",children:"Returns"}),"\n",(0,s.jsx)(r.p,{children:(0,s.jsx)(r.code,{children:"void"})}),"\n",(0,s.jsx)(r.h4,{id:"implementation-of-5",children:"Implementation of"}),"\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(r.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#activate",children:(0,s.jsx)(r.code,{children:"activate"})})]}),"\n",(0,s.jsx)(r.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,s.jsx)(r.p,{children:"src/sdk/autopilot/directors/APRollSteerDirector.ts:192"}),"\n",(0,s.jsx)(r.hr,{}),"\n",(0,s.jsx)(r.h3,{id:"arm",children:"arm()"}),"\n",(0,s.jsxs)(r.blockquote,{children:["\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.strong,{children:"arm"}),"(): ",(0,s.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(r.p,{children:"Arms the guidance mode."}),"\n",(0,s.jsx)(r.h4,{id:"returns-6",children:"Returns"}),"\n",(0,s.jsx)(r.p,{children:(0,s.jsx)(r.code,{children:"void"})}),"\n",(0,s.jsx)(r.h4,{id:"implementation-of-6",children:"Implementation of"}),"\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(r.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#arm",children:(0,s.jsx)(r.code,{children:"arm"})})]}),"\n",(0,s.jsx)(r.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,s.jsx)(r.p,{children:"src/sdk/autopilot/directors/APRollSteerDirector.ts:200"}),"\n",(0,s.jsx)(r.hr,{}),"\n",(0,s.jsx)(r.h3,{id:"deactivate",children:"deactivate()"}),"\n",(0,s.jsxs)(r.blockquote,{children:["\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.strong,{children:"deactivate"}),"(): ",(0,s.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(r.p,{children:"Deactivates the guidance mode."}),"\n",(0,s.jsx)(r.h4,{id:"returns-7",children:"Returns"}),"\n",(0,s.jsx)(r.p,{children:(0,s.jsx)(r.code,{children:"void"})}),"\n",(0,s.jsx)(r.h4,{id:"implementation-of-7",children:"Implementation of"}),"\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(r.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#deactivate",children:(0,s.jsx)(r.code,{children:"deactivate"})})]}),"\n",(0,s.jsx)(r.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,s.jsx)(r.p,{children:"src/sdk/autopilot/directors/APRollSteerDirector.ts:212"}),"\n",(0,s.jsx)(r.hr,{}),"\n",(0,s.jsx)(r.h3,{id:"update",children:"update()"}),"\n",(0,s.jsxs)(r.blockquote,{children:["\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.strong,{children:"update"}),"(): ",(0,s.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(r.p,{children:"Updates the guidance mode control loops."}),"\n",(0,s.jsx)(r.h4,{id:"returns-8",children:"Returns"}),"\n",(0,s.jsx)(r.p,{children:(0,s.jsx)(r.code,{children:"void"})}),"\n",(0,s.jsx)(r.h4,{id:"implementation-of-8",children:"Implementation of"}),"\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(r.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#update",children:(0,s.jsx)(r.code,{children:"update"})})]}),"\n",(0,s.jsx)(r.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,s.jsx)(r.p,{children:"src/sdk/autopilot/directors/APRollSteerDirector.ts:220"})]})}function h(e={}){let{wrapper:r}={...(0,d.a)(),...e.components};return r?(0,s.jsx)(r,{...e,children:(0,s.jsx)(a,{...e})}):a(e)}},250065:function(e,r,n){n.d(r,{Z:function(){return t},a:function(){return l}});var i=n(667294);let s={},d=i.createContext(s);function l(e){let r=i.useContext(d);return i.useMemo(function(){return"function"==typeof e?e(r):{...r,...e}},[r,e])}function t(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:l(e.components),i.createElement(d.Provider,{value:r},e.children)}}}]);