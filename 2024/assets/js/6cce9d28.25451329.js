"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["291386"],{468790:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>c,default:()=>h,assets:()=>l,toc:()=>a,frontMatter:()=>t});var r=JSON.parse('{"id":"api/framework/classes/APAltCapDirector","title":"Class: APAltCapDirector","description":"An altitude capture autopilot director.","source":"@site/docs/api/framework/classes/APAltCapDirector.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/APAltCapDirector","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/APAltCapDirector","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"AntiIcePublisher","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/AntiIcePublisher"},"next":{"title":"APAltDirector","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/APAltDirector"}}'),s=i("785893"),d=i("250065");let t={},c="Class: APAltCapDirector",l={},a=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new APAltCapDirector()",id:"new-apaltcapdirector",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"drivePitch()?",id:"drivepitch",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"onActivate()?",id:"onactivate",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"onArm()?",id:"onarm",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"state",id:"state",level:3},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"Methods",id:"methods",level:2},{value:"activate()",id:"activate",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"arm()",id:"arm",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Implementation of",id:"implementation-of-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"deactivate()",id:"deactivate",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Implementation of",id:"implementation-of-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"update()",id:"update",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Implementation of",id:"implementation-of-7",level:4},{value:"Defined in",id:"defined-in-8",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"class-apaltcapdirector",children:"Class: APAltCapDirector"})}),"\n",(0,s.jsx)(n.p,{children:"An altitude capture autopilot director."}),"\n",(0,s.jsx)(n.h2,{id:"implements",children:"Implements"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(n.code,{children:"PlaneDirector"})})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,s.jsx)(n.h3,{id:"new-apaltcapdirector",children:"new APAltCapDirector()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"new APAltCapDirector"}),"(",(0,s.jsx)(n.code,{children:"apValues"}),", ",(0,s.jsx)(n.code,{children:"options"}),"?): ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/APAltCapDirector",children:(0,s.jsx)(n.code,{children:"APAltCapDirector"})})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Creates an instance of the APAltCapDirector."}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"apValues"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/APValues",children:(0,s.jsx)(n.code,{children:"APValues"})})}),(0,s.jsx)(n.td,{children:"Autopilot data for this director."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"options"}),"?"]}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"Partial"}),"<",(0,s.jsx)(n.code,{children:"Readonly"}),"<",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/APAltCapDirectorOptions",children:(0,s.jsx)(n.code,{children:"APAltCapDirectorOptions"})}),">>"]}),(0,s.jsx)(n.td,{children:"Optional options object with these: --\x3e shouldActivate: An optional function which returns true if the capturing shall be activated. If not defined, a default function is used. --\x3e captureAltitude: An optional function which calculates desired pitch angles to capture a target altitude. If not defined, a default function is used."})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/APAltCapDirector",children:(0,s.jsx)(n.code,{children:"APAltCapDirector"})})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/autopilot/directors/APAltCapDirector.ts:85"}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"drivepitch",children:"drivePitch()?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"drivePitch"}),": (",(0,s.jsx)(n.code,{children:"pitch"}),", ",(0,s.jsx)(n.code,{children:"adjustForAoa"}),"?, ",(0,s.jsx)(n.code,{children:"adjustForVerticalWind"}),"?) => ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A function used to drive the autopilot commanded pitch angle toward a desired value while optionally correcting\nfor angle of attack and vertical wind."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"pitch"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"adjustForAoa"}),"?"]}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"boolean"})})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"adjustForVerticalWind"}),"?"]}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"boolean"})})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(n.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#drivepitch",children:(0,s.jsx)(n.code,{children:"drivePitch"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/autopilot/directors/APAltCapDirector.ts:70"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"onactivate",children:"onActivate()?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"onActivate"}),": () => ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A callback called when a mode signals it should\nbe activated."}),"\n",(0,s.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-1",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(n.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#onactivate",children:(0,s.jsx)(n.code,{children:"onActivate"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/autopilot/directors/APAltCapDirector.ts:64"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"onarm",children:"onArm()?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"onArm"}),": () => ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A callback called when a mode signals it should\nbe armed."}),"\n",(0,s.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-2",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(n.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#onarm",children:(0,s.jsx)(n.code,{children:"onArm"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/autopilot/directors/APAltCapDirector.ts:67"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"state",children:"state"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"state"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/DirectorState",children:(0,s.jsx)(n.code,{children:"DirectorState"})})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The current director state."}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-3",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(n.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#state",children:(0,s.jsx)(n.code,{children:"state"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/autopilot/directors/APAltCapDirector.ts:61"}),"\n",(0,s.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(n.h3,{id:"activate",children:"activate()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"activate"}),"(",(0,s.jsx)(n.code,{children:"vs"}),"?, ",(0,s.jsx)(n.code,{children:"alt"}),"?): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Activates this director."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"vs"}),"?"]}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:"Optionally, the current vertical speed, in FPM."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"alt"}),"?"]}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:"Optionally, the current indicated altitude, in Feet."})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-4",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(n.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#activate",children:(0,s.jsx)(n.code,{children:"activate"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/autopilot/directors/APAltCapDirector.ts:104"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"arm",children:"arm()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"arm"}),"(): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Arms this director.\nThis director has no armed mode, so it activates immediately."}),"\n",(0,s.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-5",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(n.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#arm",children:(0,s.jsx)(n.code,{children:"arm"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/autopilot/directors/APAltCapDirector.ts:120"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"deactivate",children:"deactivate()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"deactivate"}),"(",(0,s.jsx)(n.code,{children:"captured"}),"): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Deactivates this director."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Default value"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"captured"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"boolean"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"false"})}),(0,s.jsx)(n.td,{children:"is whether the altitude was captured."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-6",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(n.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#deactivate",children:(0,s.jsx)(n.code,{children:"deactivate"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/autopilot/directors/APAltCapDirector.ts:131"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"update",children:"update()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"update"}),"(): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Updates this director."}),"\n",(0,s.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-7",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector",children:(0,s.jsx)(n.code,{children:"PlaneDirector"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PlaneDirector#update",children:(0,s.jsx)(n.code,{children:"update"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/autopilot/directors/APAltCapDirector.ts:141"})]})}function h(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(o,{...e})}):o(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return c},a:function(){return t}});var r=i(667294);let s={},d=r.createContext(s);function t(e){let n=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:t(e.components),r.createElement(d.Provider,{value:n},e.children)}}}]);