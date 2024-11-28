"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["971073"],{680206:function(e,t,r){r.r(t),r.d(t,{metadata:()=>n,contentTitle:()=>d,default:()=>h,assets:()=>a,toc:()=>l,frontMatter:()=>o});var n=JSON.parse('{"id":"api/epic2shared/interfaces/AutothrottleDataProvider","title":"Interface: AutothrottleDataProvider","description":"Auto throttle data provided.","source":"@site/docs/api/epic2shared/interfaces/AutothrottleDataProvider.md","sourceDirName":"api/epic2shared/interfaces","slug":"/api/epic2shared/interfaces/AutothrottleDataProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/AutothrottleDataProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"AutopilotDataProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/AutopilotDataProvider"},"next":{"title":"BarTouchButtonArrowProps","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/BarTouchButtonArrowProps"}}'),i=r("785893"),s=r("250065");let o={},d="Interface: AutothrottleDataProvider",a={},l=[{value:"Properties",id:"properties",level:2},{value:"mode",id:"mode",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"speedProtectionAvailable",id:"speedprotectionavailable",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"state",id:"state",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"targetCasConverted",id:"targetcasconverted",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"thrustDirectorTargetSpeed",id:"thrustdirectortargetspeed",level:3},{value:"Defined in",id:"defined-in-4",level:4}];function c(e){let t={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",...(0,s.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t.header,{children:(0,i.jsx)(t.h1,{id:"interface-autothrottledataprovider",children:"Interface: AutothrottleDataProvider"})}),"\n",(0,i.jsx)(t.p,{children:"Auto throttle data provided."}),"\n",(0,i.jsx)(t.h2,{id:"properties",children:"Properties"}),"\n",(0,i.jsx)(t.h3,{id:"mode",children:"mode"}),"\n",(0,i.jsxs)(t.blockquote,{children:["\n",(0,i.jsxs)(t.p,{children:[(0,i.jsx)(t.strong,{children:"mode"}),": ",(0,i.jsx)(t.code,{children:"Subscribable"}),"<",(0,i.jsx)(t.code,{children:"null"})," | ",(0,i.jsx)(t.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/enumerations/AutothrottleMode",children:(0,i.jsx)(t.code,{children:"AutothrottleMode"})}),">"]}),"\n"]}),"\n",(0,i.jsx)(t.p,{children:"The current autothrottle mode, or null when invalid."}),"\n",(0,i.jsx)(t.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(t.p,{children:"workingtitle-instruments-epic2/shared/Instruments/AutothrottleDataProvider.ts:36"}),"\n",(0,i.jsx)(t.hr,{}),"\n",(0,i.jsx)(t.h3,{id:"speedprotectionavailable",children:"speedProtectionAvailable"}),"\n",(0,i.jsxs)(t.blockquote,{children:["\n",(0,i.jsxs)(t.p,{children:[(0,i.jsx)(t.strong,{children:"speedProtectionAvailable"}),": ",(0,i.jsx)(t.code,{children:"boolean"})]}),"\n"]}),"\n",(0,i.jsx)(t.p,{children:"Are autothrottle speed protections available?"}),"\n",(0,i.jsx)(t.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(t.p,{children:"workingtitle-instruments-epic2/shared/Instruments/AutothrottleDataProvider.ts:42"}),"\n",(0,i.jsx)(t.hr,{}),"\n",(0,i.jsx)(t.h3,{id:"state",children:"state"}),"\n",(0,i.jsxs)(t.blockquote,{children:["\n",(0,i.jsxs)(t.p,{children:[(0,i.jsx)(t.strong,{children:"state"}),": ",(0,i.jsx)(t.code,{children:"Subscribable"}),"<",(0,i.jsx)(t.code,{children:"null"})," | ",(0,i.jsx)(t.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/enumerations/AutothrottleState",children:(0,i.jsx)(t.code,{children:"AutothrottleState"})}),">"]}),"\n"]}),"\n",(0,i.jsx)(t.p,{children:"The current autothrottle state, or null when invalid."}),"\n",(0,i.jsx)(t.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(t.p,{children:"workingtitle-instruments-epic2/shared/Instruments/AutothrottleDataProvider.ts:33"}),"\n",(0,i.jsx)(t.hr,{}),"\n",(0,i.jsx)(t.h3,{id:"targetcasconverted",children:"targetCasConverted"}),"\n",(0,i.jsxs)(t.blockquote,{children:["\n",(0,i.jsxs)(t.p,{children:[(0,i.jsx)(t.strong,{children:"targetCasConverted"}),": ",(0,i.jsx)(t.code,{children:"Subscribable"}),"<",(0,i.jsx)(t.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,i.jsx)(t.p,{children:"What is the current target calibrated airspeed,\naccounting for a conversion from target mach to target cas if AT is targetting a mach number"}),"\n",(0,i.jsx)(t.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,i.jsx)(t.p,{children:"workingtitle-instruments-epic2/shared/Instruments/AutothrottleDataProvider.ts:48"}),"\n",(0,i.jsx)(t.hr,{}),"\n",(0,i.jsx)(t.h3,{id:"thrustdirectortargetspeed",children:"thrustDirectorTargetSpeed"}),"\n",(0,i.jsxs)(t.blockquote,{children:["\n",(0,i.jsxs)(t.p,{children:[(0,i.jsx)(t.strong,{children:"thrustDirectorTargetSpeed"}),": ",(0,i.jsx)(t.code,{children:"Subscribable"}),"<",(0,i.jsx)(t.code,{children:"null"})," | ",(0,i.jsx)(t.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,i.jsx)(t.p,{children:"The thrust director target throttle speed in range [0, 1], or null when the thrust director is disabled."}),"\n",(0,i.jsx)(t.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,i.jsx)(t.p,{children:"workingtitle-instruments-epic2/shared/Instruments/AutothrottleDataProvider.ts:39"})]})}function h(e={}){let{wrapper:t}={...(0,s.a)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(c,{...e})}):c(e)}},250065:function(e,t,r){r.d(t,{Z:function(){return d},a:function(){return o}});var n=r(667294);let i={},s=n.createContext(i);function o(e){let t=n.useContext(s);return n.useMemo(function(){return"function"==typeof e?e(t):{...t,...e}},[t,e])}function d(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),n.createElement(s.Provider,{value:t},e.children)}}}]);