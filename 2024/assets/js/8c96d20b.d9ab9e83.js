"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["16548"],{270955:function(e,n,r){r.r(n),r.d(n,{metadata:()=>s,contentTitle:()=>o,default:()=>l,assets:()=>d,toc:()=>c,frontMatter:()=>a});var s=JSON.parse('{"id":"api/framework/interfaces/VNavControlEvents","title":"Interface: VNavControlEvents","description":"Events used to control VNAV.","source":"@site/docs/api/framework/interfaces/VNavControlEvents.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/VNavControlEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavControlEvents","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"VNavConstraint","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavConstraint"},"next":{"title":"VNavDataEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNavDataEvents"}}'),t=r("785893"),i=r("250065");let a={},o="Interface: VNavControlEvents",d={},c=[{value:"Extends",id:"extends",level:2},{value:"Properties",id:"properties",level:2},{value:"vnav_set_current_fpa",id:"vnav_set_current_fpa",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"vnav_set_default_fpa",id:"vnav_set_default_fpa",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"vnav_set_state",id:"vnav_set_state",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"vnav_set_vnav_direct_to",id:"vnav_set_vnav_direct_to",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4}];function v(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...(0,i.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"interface-vnavcontrolevents",children:"Interface: VNavControlEvents"})}),"\n",(0,t.jsx)(n.p,{children:"Events used to control VNAV."}),"\n",(0,t.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavControlEvents",children:(0,t.jsx)(n.code,{children:"BaseVNavControlEvents"})}),".",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/IndexedVNavControlEvents",children:(0,t.jsx)(n.code,{children:"IndexedVNavControlEvents"})})]}),"\n"]}),"\n",(0,t.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,t.jsx)(n.h3,{id:"vnav_set_current_fpa",children:"vnav_set_current_fpa"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"vnav_set_current_fpa"}),": ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Event to set the FPA of the current VNAV path segment."}),"\n",(0,t.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavControlEvents",children:(0,t.jsx)(n.code,{children:"BaseVNavControlEvents"})}),".",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavControlEvents#vnav_set_current_fpa",children:(0,t.jsx)(n.code,{children:"vnav_set_current_fpa"})})]}),"\n",(0,t.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavControlEvents.ts:35"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"vnav_set_default_fpa",children:"vnav_set_default_fpa"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"vnav_set_default_fpa"}),": ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Sets the default FPA of VNAV descent paths, in degrees. Increasingly positive values indicate increasingly steep\ndescent paths."}),"\n",(0,t.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavControlEvents",children:(0,t.jsx)(n.code,{children:"BaseVNavControlEvents"})}),".",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavControlEvents#vnav_set_default_fpa",children:(0,t.jsx)(n.code,{children:"vnav_set_default_fpa"})})]}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavControlEvents.ts:32"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"vnav_set_state",children:"vnav_set_state"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"vnav_set_state"}),": ",(0,t.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Sets whether VNAV is enabled."}),"\n",(0,t.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavControlEvents",children:(0,t.jsx)(n.code,{children:"BaseVNavControlEvents"})}),".",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavControlEvents#vnav_set_state",children:(0,t.jsx)(n.code,{children:"vnav_set_state"})})]}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavControlEvents.ts:41"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"vnav_set_vnav_direct_to",children:"vnav_set_vnav_direct_to"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"vnav_set_vnav_direct_to"}),": ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/SetVnavDirectToData",children:(0,t.jsx)(n.code,{children:"SetVnavDirectToData"})})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Event to set the vnav direct to leg."}),"\n",(0,t.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavControlEvents",children:(0,t.jsx)(n.code,{children:"BaseVNavControlEvents"})}),".",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/BaseVNavControlEvents#vnav_set_vnav_direct_to",children:(0,t.jsx)(n.code,{children:"vnav_set_vnav_direct_to"})})]}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/autopilot/vnav/VNavControlEvents.ts:38"})]})}function l(e={}){let{wrapper:n}={...(0,i.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(v,{...e})}):v(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return o},a:function(){return a}});var s=r(667294);let t={},i=s.createContext(t);function a(e){let n=s.useContext(i);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:a(e.components),s.createElement(i.Provider,{value:n},e.children)}}}]);