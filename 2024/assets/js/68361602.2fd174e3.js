"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["628952"],{253213:function(e,n,i){i.r(n),i.d(n,{metadata:()=>s,contentTitle:()=>r,default:()=>o,assets:()=>h,toc:()=>c,frontMatter:()=>t});var s=JSON.parse('{"id":"api/framework/interfaces/LegCalculations","title":"Interface: LegCalculations","description":"Metadata about a particular flight plan leg.","source":"@site/docs/api/framework/interfaces/LegCalculations.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/LegCalculations","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/LegCalculations","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"LatLonInterface","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/LatLonInterface"},"next":{"title":"LegDefinition","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/LegDefinition"}}'),l=i("785893"),d=i("250065");let t={},r="Interface: LegCalculations",h={},c=[{value:"Properties",id:"properties",level:2},{value:"courseMagVar",id:"coursemagvar",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"cumulativeDistance",id:"cumulativedistance",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"cumulativeDistanceWithTransitions",id:"cumulativedistancewithtransitions",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"distance",id:"distance",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"distanceWithTransitions",id:"distancewithtransitions",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"egress",id:"egress",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"egressJoinIndex",id:"egressjoinindex",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"endLat",id:"endlat",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"endLon",id:"endlon",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"endsInDiscontinuity",id:"endsindiscontinuity",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"endsInFallback",id:"endsinfallback",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"flightPath",id:"flightpath",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"ingress",id:"ingress",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"ingressJoinIndex",id:"ingressjoinindex",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"ingressToEgress",id:"ingresstoegress",level:3},{value:"Defined in",id:"defined-in-14",level:4},{value:"initialDtk",id:"initialdtk",level:3},{value:"Defined in",id:"defined-in-15",level:4},{value:"startLat",id:"startlat",level:3},{value:"Defined in",id:"defined-in-16",level:4},{value:"startLon",id:"startlon",level:3},{value:"Defined in",id:"defined-in-17",level:4}];function a(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",...(0,d.a)(),...e.components};return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(n.header,{children:(0,l.jsx)(n.h1,{id:"interface-legcalculations",children:"Interface: LegCalculations"})}),"\n",(0,l.jsx)(n.p,{children:"Metadata about a particular flight plan leg."}),"\n",(0,l.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,l.jsx)(n.h3,{id:"coursemagvar",children:"courseMagVar"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"courseMagVar"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The magnetic variation, in degrees, used when calculating this leg's course."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:165"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"cumulativedistance",children:"cumulativeDistance"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"cumulativeDistance"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The total distance of the leg's base flight path vectors summed with those of all prior legs in the same flight\nplan, in meters."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:177"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"cumulativedistancewithtransitions",children:"cumulativeDistanceWithTransitions"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"cumulativeDistanceWithTransitions"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The total distance of the leg's ingress, ingress-to-egress, and egress flight path vectors summed with those of\nall prior legs in the same flight plan, in meters."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:186"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"distance",children:"distance"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"distance"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The total distance of the leg's base flight path vectors, in meters."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:171"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"distancewithtransitions",children:"distanceWithTransitions"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"distanceWithTransitions"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The total distance, of the leg's ingress, ingress-to-egress, and egress flight path vectors, in meters."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:180"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"egress",children:"egress"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"egress"}),": ",(0,l.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPathVector",children:(0,l.jsx)(n.code,{children:"FlightPathVector"})}),"[]"]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The leg's flight path egress transition."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:216"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"egressjoinindex",children:"egressJoinIndex"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"egressJoinIndex"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsxs)(n.p,{children:["The index of the flight path vector in ",(0,l.jsx)(n.code,{children:"flightPath"})," to which the egress transition is joined."]}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:213"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"endlat",children:"endLat"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"endLat"}),": ",(0,l.jsx)(n.code,{children:"undefined"})," | ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The latitude of the end of the leg."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:195"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"endlon",children:"endLon"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"endLon"}),": ",(0,l.jsx)(n.code,{children:"undefined"})," | ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The longitude of the end of the leg."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:198"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"endsindiscontinuity",children:"endsInDiscontinuity"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"endsInDiscontinuity"}),": ",(0,l.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"Whether the leg's flight path ends in a discontinuity."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:219"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"endsinfallback",children:"endsInFallback"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"endsInFallback"}),": ",(0,l.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"Whether the leg's flight path ends in a fallback state."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:222"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"flightpath",children:"flightPath"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"flightPath"}),": ",(0,l.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPathVector",children:(0,l.jsx)(n.code,{children:"FlightPathVector"})}),"[]"]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The calculated base flight path for the leg."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:201"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"ingress",children:"ingress"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"ingress"}),": ",(0,l.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPathVector",children:(0,l.jsx)(n.code,{children:"FlightPathVector"})}),"[]"]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The leg's flight path ingress transition."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:204"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"ingressjoinindex",children:"ingressJoinIndex"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"ingressJoinIndex"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsxs)(n.p,{children:["The index of the flight path vector in ",(0,l.jsx)(n.code,{children:"flightPath"})," to which the ingress transition is joined."]}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:207"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"ingresstoegress",children:"ingressToEgress"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"ingressToEgress"}),": ",(0,l.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPathVector",children:(0,l.jsx)(n.code,{children:"FlightPathVector"})}),"[]"]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The leg's flight path between the ingress and egress transitions."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:210"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"initialdtk",children:"initialDtk"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"initialDtk"}),": ",(0,l.jsx)(n.code,{children:"undefined"})," | ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The initial DTK of the leg in degrees magnetic."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:168"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"startlat",children:"startLat"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"startLat"}),": ",(0,l.jsx)(n.code,{children:"undefined"})," | ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The latitude of the start of the leg."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:189"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"startlon",children:"startLon"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"startLon"}),": ",(0,l.jsx)(n.code,{children:"undefined"})," | ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The longitude of the start of the leg."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/FlightPlanning.ts:192"})]})}function o(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,l.jsx)(n,{...e,children:(0,l.jsx)(a,{...e})}):a(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return r},a:function(){return t}});var s=i(667294);let l={},d=s.createContext(l);function t(e){let n=s.useContext(d);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(l):e.components||l:t(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);