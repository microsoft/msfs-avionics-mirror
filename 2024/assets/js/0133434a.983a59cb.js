"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["617012"],{287408:function(e,s,n){n.r(s),n.d(s,{metadata:()=>i,contentTitle:()=>d,default:()=>m,assets:()=>t,toc:()=>l,frontMatter:()=>a});var i=JSON.parse('{"id":"api/garminsdk/type-aliases/AglSystemOptions","title":"Type Alias: AglSystemOptions","description":"AglSystemOptions: object","source":"@site/docs/api/garminsdk/type-aliases/AglSystemOptions.md","sourceDirName":"api/garminsdk/type-aliases","slug":"/api/garminsdk/type-aliases/AglSystemOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/AglSystemOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"AdcSystemSelectorOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/AdcSystemSelectorOptions"},"next":{"title":"AglSystemSmootherParams","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/AglSystemSmootherParams"}}'),r=n("785893"),o=n("250065");let a={},d="Type Alias: AglSystemOptions",t={},l=[{value:"Type declaration",id:"type-declaration",level:2},{value:"fmsPosIndex?",id:"fmsposindex",level:3},{value:"gpsAglSmootherParams?",id:"gpsaglsmootherparams",level:3},{value:"maxRadarAlt?",id:"maxradaralt",level:3},{value:"radarAltIndex?",id:"radaraltindex",level:3},{value:"radarAltSmootherParams?",id:"radaraltsmootherparams",level:3},{value:"validFmsPosModes?",id:"validfmsposmodes",level:3},{value:"Defined in",id:"defined-in",level:2}];function c(e){let s={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",strong:"strong",...(0,o.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(s.header,{children:(0,r.jsx)(s.h1,{id:"type-alias-aglsystemoptions",children:"Type Alias: AglSystemOptions"})}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.strong,{children:"AglSystemOptions"}),": ",(0,r.jsx)(s.code,{children:"object"})]}),"\n"]}),"\n",(0,r.jsxs)(s.p,{children:["Configuration options for ",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/AglSystem",children:"AglSystem"}),"."]}),"\n",(0,r.jsx)(s.h2,{id:"type-declaration",children:"Type declaration"}),"\n",(0,r.jsx)(s.h3,{id:"fmsposindex",children:"fmsPosIndex?"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"optional"})," ",(0,r.jsx)(s.strong,{children:"fmsPosIndex"}),": ",(0,r.jsx)(s.code,{children:"number"})," | ",(0,r.jsx)(s.code,{children:"Subscribable"}),"<",(0,r.jsx)(s.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(s.p,{children:["The index of the FMS position system from which to source data. Specifying an invalid index (less than or equal to\nzero) will prevent the system from sourcing position data. Defaults to ",(0,r.jsx)(s.code,{children:"-1"}),"."]}),"\n",(0,r.jsx)(s.h3,{id:"gpsaglsmootherparams",children:"gpsAglSmootherParams?"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"optional"})," ",(0,r.jsx)(s.strong,{children:"gpsAglSmootherParams"}),": ",(0,r.jsx)(s.code,{children:"Readonly"}),"<",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/AglSystemSmootherParams",children:(0,r.jsx)(s.code,{children:"AglSystemSmootherParams"})}),">"]}),"\n"]}),"\n",(0,r.jsxs)(s.p,{children:["Parameters for smoothing applied to GPS above ground height. ",(0,r.jsx)(s.code,{children:"tau"})," defaults to ",(0,r.jsx)(s.code,{children:"1000 / Math.LN2"}),", ",(0,r.jsx)(s.code,{children:"tauVelocity"}),"\ndefaults to undefined, and ",(0,r.jsx)(s.code,{children:"tauAccel"})," defaults to `undefined."]}),"\n",(0,r.jsx)(s.h3,{id:"maxradaralt",children:"maxRadarAlt?"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"optional"})," ",(0,r.jsx)(s.strong,{children:"maxRadarAlt"}),": ",(0,r.jsx)(s.code,{children:"number"})," | ",(0,r.jsx)(s.code,{children:"Accessible"}),"<",(0,r.jsx)(s.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(s.p,{children:["The maximum reliable radar altitude, in feet. Radar altitude values above the maximum will be clamped to the\nmaximum and cannot be used to calculate height rate. Defaults to ",(0,r.jsx)(s.code,{children:"Infinity"}),"."]}),"\n",(0,r.jsx)(s.h3,{id:"radaraltindex",children:"radarAltIndex?"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"optional"})," ",(0,r.jsx)(s.strong,{children:"radarAltIndex"}),": ",(0,r.jsx)(s.code,{children:"number"})," | ",(0,r.jsx)(s.code,{children:"Subscribable"}),"<",(0,r.jsx)(s.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(s.p,{children:["The index of the radar altimeter system from which to source data. Specifying an invalid index (less than or equal\nto zero) will prevent the system from sourcing radar altitude data. Defaults to ",(0,r.jsx)(s.code,{children:"-1"}),"."]}),"\n",(0,r.jsx)(s.h3,{id:"radaraltsmootherparams",children:"radarAltSmootherParams?"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"optional"})," ",(0,r.jsx)(s.strong,{children:"radarAltSmootherParams"}),": ",(0,r.jsx)(s.code,{children:"Readonly"}),"<",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/AglSystemSmootherParams",children:(0,r.jsx)(s.code,{children:"AglSystemSmootherParams"})}),">"]}),"\n"]}),"\n",(0,r.jsxs)(s.p,{children:["Parameters for smoothing applied to radar altitude. ",(0,r.jsx)(s.code,{children:"tau"})," defaults to ",(0,r.jsx)(s.code,{children:"1000 / Math.LN2"}),", ",(0,r.jsx)(s.code,{children:"tauVelocity"})," defaults to\nundefined, and ",(0,r.jsx)(s.code,{children:"tauAccel"})," defaults to `undefined."]}),"\n",(0,r.jsx)(s.h3,{id:"validfmsposmodes",children:"validFmsPosModes?"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"optional"})," ",(0,r.jsx)(s.strong,{children:"validFmsPosModes"}),": ",(0,r.jsx)(s.code,{children:"Iterable"}),"<",(0,r.jsx)(s.code,{children:"Exclude"}),"<",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/enumerations/FmsPositionMode",children:(0,r.jsx)(s.code,{children:"FmsPositionMode"})}),", ",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/enumerations/FmsPositionMode#none",children:(0,r.jsx)(s.code,{children:"None"})}),">>"]}),"\n"]}),"\n",(0,r.jsxs)(s.p,{children:["The FMS position system data modes that provide valid position data for calculating AGL data. Defaults to\n",(0,r.jsx)(s.code,{children:"[FmsPositionMode.Gps, FmsPositionMode.Hns, FmsPositionMode.Dme]"}),"."]}),"\n",(0,r.jsx)(s.h2,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(s.p,{children:"src/garminsdk/system/AglSystem.ts:78"})]})}function m(e={}){let{wrapper:s}={...(0,o.a)(),...e.components};return s?(0,r.jsx)(s,{...e,children:(0,r.jsx)(c,{...e})}):c(e)}},250065:function(e,s,n){n.d(s,{Z:function(){return d},a:function(){return a}});var i=n(667294);let r={},o=i.createContext(r);function a(e){let s=i.useContext(o);return i.useMemo(function(){return"function"==typeof e?e(s):{...s,...e}},[s,e])}function d(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:a(e.components),i.createElement(o.Provider,{value:s},e.children)}}}]);