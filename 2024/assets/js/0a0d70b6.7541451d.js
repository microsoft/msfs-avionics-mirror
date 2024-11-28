"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["227319"],{385185:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>o,default:()=>h,assets:()=>d,toc:()=>c,frontMatter:()=>a});var r=JSON.parse('{"id":"api/garminsdk/type-aliases/AirspeedDefinitionContext","title":"Type Alias: AirspeedDefinitionContext","description":"AirspeedDefinitionContext: object","source":"@site/docs/api/garminsdk/type-aliases/AirspeedDefinitionContext.md","sourceDirName":"api/garminsdk/type-aliases","slug":"/api/garminsdk/type-aliases/AirspeedDefinitionContext","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/AirspeedDefinitionContext","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"AirspeedApproachCueBugOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/AirspeedApproachCueBugOptions"},"next":{"title":"AirspeedDefinitionFactory","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/AirspeedDefinitionFactory"}}'),s=i("785893"),t=i("250065");let a={},o="Type Alias: AirspeedDefinitionContext",d={},c=[{value:"Type declaration",id:"type-declaration",level:2},{value:"bus",id:"bus",level:3},{value:"machToKias",id:"machtokias",level:3},{value:"normAoaIasCoef",id:"normaoaiascoef",level:3},{value:"pressureAlt",id:"pressurealt",level:3},{value:"tasToIas",id:"tastoias",level:3},{value:"estimateIasFromNormAoa()",id:"estimateiasfromnormaoa",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:2}];function l(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,t.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"type-alias-airspeeddefinitioncontext",children:"Type Alias: AirspeedDefinitionContext"})}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"AirspeedDefinitionContext"}),": ",(0,s.jsx)(n.code,{children:"object"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["A context for a ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/AirspeedDefinitionFactory",children:"AirspeedDefinitionFactory"}),"."]}),"\n",(0,s.jsx)(n.h2,{id:"type-declaration",children:"Type declaration"}),"\n",(0,s.jsx)(n.h3,{id:"bus",children:"bus"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"bus"}),": ",(0,s.jsx)(n.code,{children:"EventBus"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The event bus."}),"\n",(0,s.jsx)(n.h3,{id:"machtokias",children:"machToKias"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"machToKias"}),": ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The current conversion factor from mach number to knots indicated airspeed."}),"\n",(0,s.jsx)(n.h3,{id:"normaoaiascoef",children:"normAoaIasCoef"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"normAoaIasCoef"}),": ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"number"})," | ",(0,s.jsx)(n.code,{children:"null"}),">"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The correlation coefficient between a given normalized angle of attack and the estimated indicated airspeed in\nknots required to maintain level flight at that angle of attack for the current aircraft configuration and\nenvironment, or ",(0,s.jsx)(n.code,{children:"null"})," if such a value cannot be calculated."]}),"\n",(0,s.jsx)(n.h3,{id:"pressurealt",children:"pressureAlt"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"pressureAlt"}),": ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The current pressure altitude, in feet."}),"\n",(0,s.jsx)(n.h3,{id:"tastoias",children:"tasToIas"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"tasToIas"}),": ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The current conversion factor from true airspeed to indicated airspeed."}),"\n",(0,s.jsx)(n.h3,{id:"estimateiasfromnormaoa",children:"estimateIasFromNormAoa()"}),"\n",(0,s.jsxs)(n.p,{children:["Estimates the indicated airspeed, in knots, required to maintain level flight at a given normalized angle of\nattack value for the current aircraft configuration and environment. Normalized angle of attack is defined such\nthat ",(0,s.jsx)(n.code,{children:"0"})," equals zero-lift AoA, and ",(0,s.jsx)(n.code,{children:"1"})," equals stall AoA."]}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"normAoa"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:"A normalized angle of attack value."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"number"})}),"\n",(0,s.jsxs)(n.p,{children:["The estimated indicated airspeed, in knots, required to maintain level flight at the specified angle of\nattack, or ",(0,s.jsx)(n.code,{children:"NaN"})," if an estimate cannot be made."]}),"\n",(0,s.jsx)(n.h2,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/airspeed/AirspeedDefinitionFactory.ts:8"})]})}function h(e={}){let{wrapper:n}={...(0,t.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return o},a:function(){return a}});var r=i(667294);let s={},t=r.createContext(s);function a(e){let n=r.useContext(t);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),r.createElement(t.Provider,{value:n},e.children)}}}]);