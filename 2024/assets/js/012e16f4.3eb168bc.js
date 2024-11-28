"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["584238"],{900514:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>t,default:()=>h,assets:()=>c,toc:()=>l,frontMatter:()=>a});var r=JSON.parse('{"id":"api/garminsdk/classes/APExternalGuidanceProvider","title":"Class: APExternalGuidanceProvider","description":"A provider of external autopilot guidance data. Data are sourced from indexed SimVars whose roots are defined in","source":"@site/docs/api/garminsdk/classes/APExternalGuidanceProvider.md","sourceDirName":"api/garminsdk/classes","slug":"/api/garminsdk/classes/APExternalGuidanceProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/APExternalGuidanceProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"AoaSystem","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/AoaSystem"},"next":{"title":"ApproachNameDisplay","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/ApproachNameDisplay"}}'),d=i("785893"),s=i("250065");let a={},t="Class: APExternalGuidanceProvider",c={},l=[{value:"Constructors",id:"constructors",level:2},{value:"new APExternalGuidanceProvider()",id:"new-apexternalguidanceprovider",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Accessors",id:"accessors",level:2},{value:"glidepathGuidance",id:"glidepathguidance",level:3},{value:"Get Signature",id:"get-signature",level:4},{value:"Returns",id:"returns-1",level:5},{value:"Defined in",id:"defined-in-1",level:4},{value:"gpsSteerCommand",id:"gpssteercommand",level:3},{value:"Get Signature",id:"get-signature-1",level:4},{value:"Returns",id:"returns-2",level:5},{value:"Defined in",id:"defined-in-2",level:4},{value:"verticalPathGuidance",id:"verticalpathguidance",level:3},{value:"Get Signature",id:"get-signature-2",level:4},{value:"Returns",id:"returns-3",level:5},{value:"Defined in",id:"defined-in-3",level:4},{value:"vnavGuidance",id:"vnavguidance",level:3},{value:"Get Signature",id:"get-signature-3",level:4},{value:"Returns",id:"returns-4",level:5},{value:"Defined in",id:"defined-in-4",level:4},{value:"Methods",id:"methods",level:2},{value:"update()",id:"update",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-5",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,s.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"class-apexternalguidanceprovider",children:"Class: APExternalGuidanceProvider"})}),"\n",(0,d.jsxs)(n.p,{children:["A provider of external autopilot guidance data. Data are sourced from indexed SimVars whose roots are defined in\n",(0,d.jsx)(n.code,{children:"APExternalGpsSteerCommandSimVars"}),", ",(0,d.jsx)(n.code,{children:"APExternalVNavGuidanceSimVars"}),", ",(0,d.jsx)(n.code,{children:"APExternalVerticalPathGuidanceSimVars"}),", and\n",(0,d.jsx)(n.code,{children:"APExternalGlidepathGuidanceSimVars"}),"."]}),"\n",(0,d.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(n.h3,{id:"new-apexternalguidanceprovider",children:"new APExternalGuidanceProvider()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"new APExternalGuidanceProvider"}),"(",(0,d.jsx)(n.code,{children:"index"}),", ",(0,d.jsx)(n.code,{children:"options"}),"?): ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/APExternalGuidanceProvider",children:(0,d.jsx)(n.code,{children:"APExternalGuidanceProvider"})})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Creates a new instance of APExternalGuidanceProvider."}),"\n",(0,d.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"index"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The index of the guidance SimVars from which this provider sources data."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"options"}),"?"]}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/APExternalGuidanceProviderOptions",children:(0,d.jsx)(n.code,{children:"APExternalGuidanceProviderOptions"})}),">"]}),(0,d.jsx)(n.td,{children:"Options with which to configure the provider."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/APExternalGuidanceProvider",children:(0,d.jsx)(n.code,{children:"APExternalGuidanceProvider"})})}),"\n",(0,d.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,d.jsxs)(n.p,{children:["Error if ",(0,d.jsx)(n.code,{children:"index"})," is not a non-negative integer."]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/autopilot/data/APExternalGuidanceProvider.ts:135"}),"\n",(0,d.jsx)(n.h2,{id:"accessors",children:"Accessors"}),"\n",(0,d.jsx)(n.h3,{id:"glidepathguidance",children:"glidepathGuidance"}),"\n",(0,d.jsx)(n.h4,{id:"get-signature",children:"Get Signature"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"get"})," ",(0,d.jsx)(n.strong,{children:"glidepathGuidance"}),"(): ",(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/GarminVNavGlidepathGuidance",children:(0,d.jsx)(n.code,{children:"GarminVNavGlidepathGuidance"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The current external glidepath guidance."}),"\n",(0,d.jsx)(n.h5,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/GarminVNavGlidepathGuidance",children:(0,d.jsx)(n.code,{children:"GarminVNavGlidepathGuidance"})}),">"]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/autopilot/data/APExternalGuidanceProvider.ts:125"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"gpssteercommand",children:"gpsSteerCommand"}),"\n",(0,d.jsx)(n.h4,{id:"get-signature-1",children:"Get Signature"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"get"})," ",(0,d.jsx)(n.strong,{children:"gpsSteerCommand"}),"(): ",(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.code,{children:"APGpsSteerDirectorSteerCommand"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The current external GPS steer command."}),"\n",(0,d.jsx)(n.h5,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.code,{children:"APGpsSteerDirectorSteerCommand"}),">"]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/autopilot/data/APExternalGuidanceProvider.ts:85"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"verticalpathguidance",children:"verticalPathGuidance"}),"\n",(0,d.jsx)(n.h4,{id:"get-signature-2",children:"Get Signature"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"get"})," ",(0,d.jsx)(n.strong,{children:"verticalPathGuidance"}),"(): ",(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/GarminVNavPathGuidance",children:(0,d.jsx)(n.code,{children:"GarminVNavPathGuidance"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The current external vertical path guidance."}),"\n",(0,d.jsx)(n.h5,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/GarminVNavPathGuidance",children:(0,d.jsx)(n.code,{children:"GarminVNavPathGuidance"})}),">"]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/autopilot/data/APExternalGuidanceProvider.ts:112"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"vnavguidance",children:"vnavGuidance"}),"\n",(0,d.jsx)(n.h4,{id:"get-signature-3",children:"Get Signature"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"get"})," ",(0,d.jsx)(n.strong,{children:"vnavGuidance"}),"(): ",(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/GarminVNavGuidance",children:(0,d.jsx)(n.code,{children:"GarminVNavGuidance"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The current external VNAV guidance."}),"\n",(0,d.jsx)(n.h5,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/GarminVNavGuidance",children:(0,d.jsx)(n.code,{children:"GarminVNavGuidance"})}),">"]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/autopilot/data/APExternalGuidanceProvider.ts:101"}),"\n",(0,d.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(n.h3,{id:"update",children:"update()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"update"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Updates this provider's data."}),"\n",(0,d.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/autopilot/data/APExternalGuidanceProvider.ts:162"})]})}function h(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(o,{...e})}):o(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return t},a:function(){return a}});var r=i(667294);let d={},s=r.createContext(d);function a(e){let n=r.useContext(s);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:a(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);