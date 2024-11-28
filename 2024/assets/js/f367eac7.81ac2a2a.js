"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["593117"],{194963:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>o,default:()=>h,assets:()=>t,toc:()=>l,frontMatter:()=>s});var r=JSON.parse('{"id":"api/garminsdk/interfaces/AoaDataProvider","title":"Interface: AoaDataProvider","description":"A provider of angle of attack data.","source":"@site/docs/api/garminsdk/interfaces/AoaDataProvider.md","sourceDirName":"api/garminsdk/interfaces","slug":"/api/garminsdk/interfaces/AoaDataProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/AoaDataProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"AltitudeAlerterControlEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/AltitudeAlerterControlEvents"},"next":{"title":"AoAIndicatorProps","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/AoAIndicatorProps"}}'),a=i("785893"),d=i("250065");let s={},o="Interface: AoaDataProvider",t={},l=[{value:"Properties",id:"properties",level:2},{value:"aoa",id:"aoa",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"isDataFailed",id:"isdatafailed",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"isOnGround",id:"isonground",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"normAoa",id:"normaoa",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"normAoaIasCoef",id:"normaoaiascoef",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"stallAoa",id:"stallaoa",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"zeroLiftAoa",id:"zeroliftaoa",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"Methods",id:"methods",level:2},{value:"aoaToNormAoa()",id:"aoatonormaoa",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"estimateIasFromAoa()",id:"estimateiasfromaoa",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"estimateIasFromNormAoa()",id:"estimateiasfromnormaoa",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"normAoaToAoa()",id:"normaoatoaoa",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-10",level:4}];function c(e){let n={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.header,{children:(0,a.jsx)(n.h1,{id:"interface-aoadataprovider",children:"Interface: AoaDataProvider"})}),"\n",(0,a.jsx)(n.p,{children:"A provider of angle of attack data."}),"\n",(0,a.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,a.jsx)(n.h3,{id:"aoa",children:"aoa"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.code,{children:"readonly"})," ",(0,a.jsx)(n.strong,{children:"aoa"}),": ",(0,a.jsx)(n.code,{children:"Subscribable"}),"<",(0,a.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The current angle of attack, in degrees."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:13"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"isdatafailed",children:"isDataFailed"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.code,{children:"readonly"})," ",(0,a.jsx)(n.strong,{children:"isDataFailed"}),": ",(0,a.jsx)(n.code,{children:"Subscribable"}),"<",(0,a.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"Whether this provider's AoA data is in a failed state."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:35"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"isonground",children:"isOnGround"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.code,{children:"readonly"})," ",(0,a.jsx)(n.strong,{children:"isOnGround"}),": ",(0,a.jsx)(n.code,{children:"Subscribable"}),"<",(0,a.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"Whether the airplane is on the ground."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:32"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"normaoa",children:"normAoa"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.code,{children:"readonly"})," ",(0,a.jsx)(n.strong,{children:"normAoa"}),": ",(0,a.jsx)(n.code,{children:"Subscribable"}),"<",(0,a.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,a.jsxs)(n.p,{children:["The current normalized angle of attack. A value of ",(0,a.jsx)(n.code,{children:"0"})," is equal to zero-lift AoA, and a value of ",(0,a.jsx)(n.code,{children:"1"})," is equal to stall AoA."]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:16"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"normaoaiascoef",children:"normAoaIasCoef"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.code,{children:"readonly"})," ",(0,a.jsx)(n.strong,{children:"normAoaIasCoef"}),": ",(0,a.jsx)(n.code,{children:"Subscribable"}),"<",(0,a.jsx)(n.code,{children:"null"})," | ",(0,a.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,a.jsxs)(n.p,{children:["The correlation coefficient between a given normalized angle of attack and the estimated indicated airspeed in\nknots required to maintain level flight at that angle of attack for the current aircraft configuration and\nenvironment, or ",(0,a.jsx)(n.code,{children:"null"})," if such a value cannot be calculated."]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:29"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"stallaoa",children:"stallAoa"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.code,{children:"readonly"})," ",(0,a.jsx)(n.strong,{children:"stallAoa"}),": ",(0,a.jsx)(n.code,{children:"Subscribable"}),"<",(0,a.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The current stall (critical) angle of attack, in degrees."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:19"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"zeroliftaoa",children:"zeroLiftAoa"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.code,{children:"readonly"})," ",(0,a.jsx)(n.strong,{children:"zeroLiftAoa"}),": ",(0,a.jsx)(n.code,{children:"Subscribable"}),"<",(0,a.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The current zero-lift angle of attack, in degrees."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:22"}),"\n",(0,a.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,a.jsx)(n.h3,{id:"aoatonormaoa",children:"aoaToNormAoa()"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"aoaToNormAoa"}),"(",(0,a.jsx)(n.code,{children:"aoa"}),"): ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsxs)(n.p,{children:["Converts an absolute angle of attack value in degrees to a normalized angle of attack value. Normalized angle of\nattack is defined such that ",(0,a.jsx)(n.code,{children:"0"})," equals zero-lift AoA, and ",(0,a.jsx)(n.code,{children:"1"})," equals stall AoA."]}),"\n",(0,a.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,a.jsxs)(n.table,{children:[(0,a.jsx)(n.thead,{children:(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.th,{children:"Parameter"}),(0,a.jsx)(n.th,{children:"Type"}),(0,a.jsx)(n.th,{children:"Description"})]})}),(0,a.jsx)(n.tbody,{children:(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.code,{children:"aoa"})}),(0,a.jsx)(n.td,{children:(0,a.jsx)(n.code,{children:"number"})}),(0,a.jsx)(n.td,{children:"An absolute angle of attack value, in degrees."})]})})]}),"\n",(0,a.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.code,{children:"number"})}),"\n",(0,a.jsx)(n.p,{children:"The normalized equivalent of the specified angle of attack."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:43"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"estimateiasfromaoa",children:"estimateIasFromAoa()"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"estimateIasFromAoa"}),"(",(0,a.jsx)(n.code,{children:"aoa"}),"): ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"Estimates the indicated airspeed, in knots, required to maintain level flight at a given angle of attack value\nfor the current aircraft configuration and environment."}),"\n",(0,a.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,a.jsxs)(n.table,{children:[(0,a.jsx)(n.thead,{children:(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.th,{children:"Parameter"}),(0,a.jsx)(n.th,{children:"Type"}),(0,a.jsx)(n.th,{children:"Description"})]})}),(0,a.jsx)(n.tbody,{children:(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.code,{children:"aoa"})}),(0,a.jsx)(n.td,{children:(0,a.jsx)(n.code,{children:"number"})}),(0,a.jsx)(n.td,{children:"An angle of attack value, in degrees."})]})})]}),"\n",(0,a.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.code,{children:"number"})}),"\n",(0,a.jsxs)(n.p,{children:["The estimated indicated airspeed, in knots, required to maintain level flight at the specified angle of\nattack, or ",(0,a.jsx)(n.code,{children:"NaN"})," if an estimate cannot be made."]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:60"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"estimateiasfromnormaoa",children:"estimateIasFromNormAoa()"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"estimateIasFromNormAoa"}),"(",(0,a.jsx)(n.code,{children:"normAoa"}),"): ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsxs)(n.p,{children:["Estimates the indicated airspeed, in knots, required to maintain level flight at a given normalized angle of\nattack value for the current aircraft configuration and environment. Normalized angle of attack is defined such\nthat ",(0,a.jsx)(n.code,{children:"0"})," equals zero-lift AoA, and ",(0,a.jsx)(n.code,{children:"1"})," equals stall AoA."]}),"\n",(0,a.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,a.jsxs)(n.table,{children:[(0,a.jsx)(n.thead,{children:(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.th,{children:"Parameter"}),(0,a.jsx)(n.th,{children:"Type"}),(0,a.jsx)(n.th,{children:"Description"})]})}),(0,a.jsx)(n.tbody,{children:(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.code,{children:"normAoa"})}),(0,a.jsx)(n.td,{children:(0,a.jsx)(n.code,{children:"number"})}),(0,a.jsx)(n.td,{children:"A normalized angle of attack value."})]})})]}),"\n",(0,a.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.code,{children:"number"})}),"\n",(0,a.jsxs)(n.p,{children:["The estimated indicated airspeed, in knots, required to maintain level flight at the specified angle of\nattack, or ",(0,a.jsx)(n.code,{children:"NaN"})," if an estimate cannot be made."]}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:70"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"normaoatoaoa",children:"normAoaToAoa()"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"normAoaToAoa"}),"(",(0,a.jsx)(n.code,{children:"normAoa"}),"): ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsxs)(n.p,{children:["Converts a normalized angle of attack value to an absolute angle of attack value in degrees. Normalized angle of\nattack is defined such that ",(0,a.jsx)(n.code,{children:"0"})," equals zero-lift AoA, and ",(0,a.jsx)(n.code,{children:"1"})," equals stall AoA."]}),"\n",(0,a.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,a.jsxs)(n.table,{children:[(0,a.jsx)(n.thead,{children:(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.th,{children:"Parameter"}),(0,a.jsx)(n.th,{children:"Type"}),(0,a.jsx)(n.th,{children:"Description"})]})}),(0,a.jsx)(n.tbody,{children:(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.code,{children:"normAoa"})}),(0,a.jsx)(n.td,{children:(0,a.jsx)(n.code,{children:"number"})}),(0,a.jsx)(n.td,{children:"A normalized angle of attack value."})]})})]}),"\n",(0,a.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.code,{children:"number"})}),"\n",(0,a.jsx)(n.p,{children:"The absolute equivalent of the specified normalized angle of attack, in degrees."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/aoa/AoaDataProvider.ts:51"})]})}function h(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(c,{...e})}):c(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return o},a:function(){return s}});var r=i(667294);let a={},d=r.createContext(a);function s(e){let n=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:s(e.components),r.createElement(d.Provider,{value:n},e.children)}}}]);