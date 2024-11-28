"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["88475"],{283361:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>a,default:()=>h,assets:()=>l,toc:()=>c,frontMatter:()=>s});var r=JSON.parse('{"id":"api/framework/interfaces/FlightPlanOriginDestEvent","title":"Interface: FlightPlanOriginDestEvent","description":"An event generated when the origin and/or destination information","source":"@site/docs/api/framework/interfaces/FlightPlanOriginDestEvent.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/FlightPlanOriginDestEvent","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPlanOriginDestEvent","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"FlightPlanModBatchEvent","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPlanModBatchEvent"},"next":{"title":"FlightPlanPredictionsProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPlanPredictionsProvider"}}'),t=i("785893"),d=i("250065");let s={},a="Interface: FlightPlanOriginDestEvent",l={},c=[{value:"Properties",id:"properties",level:2},{value:"<del>airport?</del>",id:"airport",level:3},{value:"Deprecated",id:"deprecated",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"airportIcao?",id:"airporticao",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"batch?",id:"batch",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"planIndex",id:"planindex",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"type",id:"type",level:3},{value:"Defined in",id:"defined-in-4",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",del:"del",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",...(0,d.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"interface-flightplanorigindestevent",children:"Interface: FlightPlanOriginDestEvent"})}),"\n",(0,t.jsx)(n.p,{children:"An event generated when the origin and/or destination information\nis updated."}),"\n",(0,t.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,t.jsx)(n.h3,{id:"airport",children:(0,t.jsx)(n.del,{children:"airport?"})}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"readonly"})," ",(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"airport"}),": ",(0,t.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The ICAO string (V1) of the airport that was changed."}),"\n",(0,t.jsx)(n.h4,{id:"deprecated",children:"Deprecated"}),"\n",(0,t.jsxs)(n.p,{children:["Please use ",(0,t.jsx)(n.code,{children:"airportIcao"})," instead."]}),"\n",(0,t.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanner.ts:200"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"airporticao",children:"airportIcao?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"readonly"})," ",(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"airportIcao"}),": ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/IcaoValue",children:(0,t.jsx)(n.code,{children:"IcaoValue"})})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The ICAO value of the airport that was changed."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanner.ts:194"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"batch",children:"batch?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"readonly"})," ",(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"batch"}),": readonly ",(0,t.jsx)(n.code,{children:"Readonly"}),"<",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/FlightPlanModBatch",children:(0,t.jsx)(n.code,{children:"FlightPlanModBatch"})}),">[]"]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if\nthe change was not assigned to any batches."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanner.ts:206"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"planindex",children:"planIndex"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"readonly"})," ",(0,t.jsx)(n.strong,{children:"planIndex"}),": ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The index of the flight plan."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanner.ts:191"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"type",children:"type"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"readonly"})," ",(0,t.jsx)(n.strong,{children:"type"}),": ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/OriginDestChangeType",children:(0,t.jsx)(n.code,{children:"OriginDestChangeType"})})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The type of change."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanner.ts:188"})]})}function h(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(o,{...e})}):o(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return a},a:function(){return s}});var r=i(667294);let t={},d=r.createContext(t);function s(e){let n=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:s(e.components),r.createElement(d.Provider,{value:n},e.children)}}}]);