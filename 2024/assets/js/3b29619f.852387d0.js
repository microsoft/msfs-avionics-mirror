"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["563768"],{675174:function(e,n,t){t.r(n),t.d(n,{metadata:()=>s,contentTitle:()=>d,default:()=>v,assets:()=>o,toc:()=>l,frontMatter:()=>i});var s=JSON.parse('{"id":"api/framework/interfaces/BaseVNavControlEvents","title":"Interface: BaseVNavControlEvents","description":"Events used to control VNAV keyed by base topic names.","source":"@site/docs/api/framework/interfaces/BaseVNavControlEvents.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/BaseVNavControlEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavControlEvents","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"BaseLNavObsSimVarEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseLNavObsSimVarEvents"},"next":{"title":"BaseVNavDataEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavDataEvents"}}'),r=t("785893"),a=t("250065");let i={},d="Interface: BaseVNavControlEvents",o={},l=[{value:"Extended by",id:"extended-by",level:2},{value:"Properties",id:"properties",level:2},{value:"vnav_set_current_fpa",id:"vnav_set_current_fpa",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"vnav_set_default_fpa",id:"vnav_set_default_fpa",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"vnav_set_state",id:"vnav_set_state",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"vnav_set_vnav_direct_to",id:"vnav_set_vnav_direct_to",level:3},{value:"Defined in",id:"defined-in-3",level:4}];function c(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...(0,a.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"interface-basevnavcontrolevents",children:"Interface: BaseVNavControlEvents"})}),"\n",(0,r.jsx)(n.p,{children:"Events used to control VNAV keyed by base topic names."}),"\n",(0,r.jsx)(n.h2,{id:"extended-by",children:"Extended by"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavControlEvents",children:(0,r.jsx)(n.code,{children:"VNavControlEvents"})})}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"vnav_set_current_fpa",children:"vnav_set_current_fpa"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"vnav_set_current_fpa"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Event to set the FPA of the current VNAV path segment."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavControlEvents.ts:35"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"vnav_set_default_fpa",children:"vnav_set_default_fpa"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"vnav_set_default_fpa"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Sets the default FPA of VNAV descent paths, in degrees. Increasingly positive values indicate increasingly steep\ndescent paths."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavControlEvents.ts:32"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"vnav_set_state",children:"vnav_set_state"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"vnav_set_state"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Sets whether VNAV is enabled."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavControlEvents.ts:41"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"vnav_set_vnav_direct_to",children:"vnav_set_vnav_direct_to"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"vnav_set_vnav_direct_to"}),": ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/SetVnavDirectToData",children:(0,r.jsx)(n.code,{children:"SetVnavDirectToData"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Event to set the vnav direct to leg."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavControlEvents.ts:38"})]})}function v(e={}){let{wrapper:n}={...(0,a.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(c,{...e})}):c(e)}},250065:function(e,n,t){t.d(n,{Z:function(){return d},a:function(){return i}});var s=t(667294);let r={},a=s.createContext(r);function i(e){let n=s.useContext(a);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:i(e.components),s.createElement(a.Provider,{value:n},e.children)}}}]);