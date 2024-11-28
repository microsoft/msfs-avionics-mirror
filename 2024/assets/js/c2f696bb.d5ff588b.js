"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["985919"],{155001:function(e,n,t){t.r(n),t.d(n,{metadata:()=>i,contentTitle:()=>c,default:()=>o,assets:()=>a,toc:()=>d,frontMatter:()=>s});var i=JSON.parse('{"id":"api/framework/classes/FlightPathCalculator","title":"Class: FlightPathCalculator","description":"Calculates the flight path vectors for a given set of legs.","source":"@site/docs/api/framework/classes/FlightPathCalculator.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/FlightPathCalculator","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/FlightPathCalculator","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"FixToManualLegCalculator","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/FixToManualLegCalculator"},"next":{"title":"FlightPathLegLineRenderer","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/FlightPathLegLineRenderer"}}'),l=t("785893"),r=t("250065");let s={},c="Class: FlightPathCalculator",a={},d=[{value:"Constructors",id:"constructors",level:2},{value:"new FlightPathCalculator()",id:"new-flightpathcalculator",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"calculateFlightPath()",id:"calculateflightpath",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,r.a)(),...e.components};return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(n.header,{children:(0,l.jsx)(n.h1,{id:"class-flightpathcalculator",children:"Class: FlightPathCalculator"})}),"\n",(0,l.jsx)(n.p,{children:"Calculates the flight path vectors for a given set of legs."}),"\n",(0,l.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,l.jsx)(n.h3,{id:"new-flightpathcalculator",children:"new FlightPathCalculator()"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"new FlightPathCalculator"}),"(",(0,l.jsx)(n.code,{children:"facilityClient"}),", ",(0,l.jsx)(n.code,{children:"options"}),", ",(0,l.jsx)(n.code,{children:"bus"}),"): ",(0,l.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/FlightPathCalculator",children:(0,l.jsx)(n.code,{children:"FlightPathCalculator"})})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"Creates an instance of the FlightPathCalculator."}),"\n",(0,l.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,l.jsxs)(n.table,{children:[(0,l.jsx)(n.thead,{children:(0,l.jsxs)(n.tr,{children:[(0,l.jsx)(n.th,{children:"Parameter"}),(0,l.jsx)(n.th,{children:"Type"}),(0,l.jsx)(n.th,{children:"Description"})]})}),(0,l.jsxs)(n.tbody,{children:[(0,l.jsxs)(n.tr,{children:[(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"facilityClient"})}),(0,l.jsx)(n.td,{children:(0,l.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FacilityClient",children:(0,l.jsx)(n.code,{children:"FacilityClient"})})}),(0,l.jsx)(n.td,{children:"The facility loader to use with this instance."})]}),(0,l.jsxs)(n.tr,{children:[(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"options"})}),(0,l.jsxs)(n.td,{children:[(0,l.jsx)(n.code,{children:"Readonly"}),"<",(0,l.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/FlightPathCalculatorInitOptions",children:(0,l.jsx)(n.code,{children:"FlightPathCalculatorInitOptions"})}),">"]}),(0,l.jsx)(n.td,{children:"The options to use with this flight path calculator."})]}),(0,l.jsxs)(n.tr,{children:[(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"bus"})}),(0,l.jsx)(n.td,{children:(0,l.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/EventBus",children:(0,l.jsx)(n.code,{children:"EventBus"})})}),(0,l.jsx)(n.td,{children:"An instance of the EventBus."})]})]})]}),"\n",(0,l.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,l.jsx)(n.p,{children:(0,l.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/FlightPathCalculator",children:(0,l.jsx)(n.code,{children:"FlightPathCalculator"})})}),"\n",(0,l.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/flightpath/FlightPathCalculator.ts:241"}),"\n",(0,l.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,l.jsx)(n.h3,{id:"calculateflightpath",children:"calculateFlightPath()"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"calculateFlightPath"}),"(",(0,l.jsx)(n.code,{children:"legs"}),", ",(0,l.jsx)(n.code,{children:"activeLegIndex"}),", ",(0,l.jsx)(n.code,{children:"initialIndex"}),", ",(0,l.jsx)(n.code,{children:"count"}),"): ",(0,l.jsx)(n.code,{children:"Promise"}),"<",(0,l.jsx)(n.code,{children:"void"}),">"]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"Calculates a flight path for a given set of flight plan legs."}),"\n",(0,l.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,l.jsxs)(n.table,{children:[(0,l.jsx)(n.thead,{children:(0,l.jsxs)(n.tr,{children:[(0,l.jsx)(n.th,{children:"Parameter"}),(0,l.jsx)(n.th,{children:"Type"}),(0,l.jsx)(n.th,{children:"Default value"}),(0,l.jsx)(n.th,{children:"Description"})]})}),(0,l.jsxs)(n.tbody,{children:[(0,l.jsxs)(n.tr,{children:[(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"legs"})}),(0,l.jsxs)(n.td,{children:[(0,l.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/LegDefinition",children:(0,l.jsx)(n.code,{children:"LegDefinition"})}),"[]"]}),(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"undefined"})}),(0,l.jsx)(n.td,{children:"The legs of the flight plan to calculate."})]}),(0,l.jsxs)(n.tr,{children:[(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"activeLegIndex"})}),(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"number"})}),(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"undefined"})}),(0,l.jsx)(n.td,{children:"The index of the active leg."})]}),(0,l.jsxs)(n.tr,{children:[(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"initialIndex"})}),(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"number"})}),(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"0"})}),(0,l.jsx)(n.td,{children:"The index of the leg at which to start the calculation."})]}),(0,l.jsxs)(n.tr,{children:[(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"count"})}),(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"number"})}),(0,l.jsx)(n.td,{children:(0,l.jsx)(n.code,{children:"Number.POSITIVE_INFINITY"})}),(0,l.jsx)(n.td,{children:"The number of legs to calculate."})]})]})]}),"\n",(0,l.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.code,{children:"Promise"}),"<",(0,l.jsx)(n.code,{children:"void"}),">"]}),"\n",(0,l.jsx)(n.p,{children:"A Promise which is fulfilled when the calculation is finished."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/flightplan/flightpath/FlightPathCalculator.ts:435"})]})}function o(e={}){let{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,l.jsx)(n,{...e,children:(0,l.jsx)(h,{...e})}):h(e)}},250065:function(e,n,t){t.d(n,{Z:function(){return c},a:function(){return s}});var i=t(667294);let l={},r=i.createContext(l);function s(e){let n=i.useContext(r);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(l):e.components||l:s(e.components),i.createElement(r.Provider,{value:n},e.children)}}}]);