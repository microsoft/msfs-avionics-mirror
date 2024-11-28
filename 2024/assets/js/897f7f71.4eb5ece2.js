"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["850167"],{999798:function(e,n,i){i.r(n),i.d(n,{metadata:()=>t,contentTitle:()=>l,default:()=>h,assets:()=>s,toc:()=>c,frontMatter:()=>d});var t=JSON.parse('{"id":"api/framework/interfaces/FlightPlanDirectToDataEvent","title":"Interface: FlightPlanDirectToDataEvent","description":"An event generated when direct to data is changed in the flight plan.","source":"@site/docs/api/framework/interfaces/FlightPlanDirectToDataEvent.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/FlightPlanDirectToDataEvent","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPlanDirectToDataEvent","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"FlightPlanCopiedEvent","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPlanCopiedEvent"},"next":{"title":"FlightPlanIndicationEvent","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPlanIndicationEvent"}}'),r=i("785893"),a=i("250065");let d={},l="Interface: FlightPlanDirectToDataEvent",s={},c=[{value:"Properties",id:"properties",level:2},{value:"batch?",id:"batch",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"directToData",id:"directtodata",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"planIndex",id:"planindex",level:3},{value:"Defined in",id:"defined-in-2",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",...(0,a.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"interface-flightplandirecttodataevent",children:"Interface: FlightPlanDirectToDataEvent"})}),"\n",(0,r.jsx)(n.p,{children:"An event generated when direct to data is changed in the flight plan."}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"batch",children:"batch?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"batch"}),": readonly ",(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/FlightPlanModBatch",children:(0,r.jsx)(n.code,{children:"FlightPlanModBatch"})}),">[]"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if\nthe change was not assigned to any batches."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanner.ts:322"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"directtodata",children:"directToData"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"directToData"}),": ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPlanLegIndexes",children:(0,r.jsx)(n.code,{children:"FlightPlanLegIndexes"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The direct to data."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanner.ts:316"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"planindex",children:"planIndex"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"planIndex"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The index of the flight plan."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanner.ts:313"})]})}function h(e={}){let{wrapper:n}={...(0,a.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(o,{...e})}):o(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return l},a:function(){return d}});var t=i(667294);let r={},a=t.createContext(r);function d(e){let n=t.useContext(a);return t.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:d(e.components),t.createElement(a.Provider,{value:n},e.children)}}}]);