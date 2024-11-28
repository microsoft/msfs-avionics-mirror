"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["542673"],{435146:function(e,n,i){i.r(n),i.d(n,{metadata:()=>d,contentTitle:()=>t,default:()=>o,assets:()=>c,toc:()=>h,frontMatter:()=>l});var d=JSON.parse('{"id":"api/framework/interfaces/OneWayRunway","title":"Interface: OneWayRunway","description":"Describes a selected one way runway.","source":"@site/docs/api/framework/interfaces/OneWayRunway.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/OneWayRunway","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/OneWayRunway","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"NumberUnitInterface","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/NumberUnitInterface"},"next":{"title":"PageConstructor","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PageConstructor"}}'),r=i("785893"),s=i("250065");let l={},t="Interface: OneWayRunway",c={},h=[{value:"Properties",id:"properties",level:2},{value:"course",id:"course",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"designation",id:"designation",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"direction",id:"direction",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"elevation",id:"elevation",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"elevationEnd",id:"elevationend",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"endThresholdLength",id:"endthresholdlength",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"gradient",id:"gradient",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"ilsFrequency?",id:"ilsfrequency",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"latitude",id:"latitude",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"length",id:"length",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"lighting",id:"lighting",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"longitude",id:"longitude",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"parentRunwayIndex",id:"parentrunwayindex",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"runwayDesignator",id:"runwaydesignator",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"startThresholdLength",id:"startthresholdlength",level:3},{value:"Defined in",id:"defined-in-14",level:4},{value:"surface",id:"surface",level:3},{value:"Defined in",id:"defined-in-15",level:4},{value:"width",id:"width",level:3},{value:"Defined in",id:"defined-in-16",level:4}];function a(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",...(0,s.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"interface-onewayrunway",children:"Interface: OneWayRunway"})}),"\n",(0,r.jsx)(n.p,{children:"Describes a selected one way runway."}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"course",children:"course"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"course"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The true course of this runway in degrees."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1253"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"designation",children:"designation"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"designation"}),": ",(0,r.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The designation of this runway."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1235"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"direction",children:"direction"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"direction"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The runway number of this runway (as the numerical value of the one way designation)."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1229"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"elevation",children:"elevation"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"elevation"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The elevation of this runway, at the displaced threshold, in meters."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1244"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"elevationend",children:"elevationEnd"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"elevationEnd"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The elevation of this runway, at the opposite displaced threshold, in meters."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1247"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"endthresholdlength",children:"endThresholdLength"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"endThresholdLength"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The distance, in meters, between the end of this runway and the displaced threshold on that end."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1268"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"gradient",children:"gradient"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"gradient"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The gradient of this runway, in percent. Positive values indicate an upward slope from the start to the end."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1250"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"ilsfrequency",children:"ilsFrequency?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"ilsFrequency"}),": ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FacilityILSFrequency",children:(0,r.jsx)(n.code,{children:"FacilityILSFrequency"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The ILS frequency for this runway."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1256"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"latitude",children:"latitude"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"latitude"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The latitude of the threshold of this runway."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1238"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"length",children:"length"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"length"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The total length of this runway, including displaced thresholds, in meters."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1259"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"lighting",children:"lighting"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"lighting"}),": ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/RunwayLightingType",children:(0,r.jsx)(n.code,{children:"RunwayLightingType"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The lighting available for this runway."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1274"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"longitude",children:"longitude"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"longitude"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The longitude of the threshold of this runway."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1241"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"parentrunwayindex",children:"parentRunwayIndex"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"parentRunwayIndex"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The index of this runway's parent AirportRunway object in the airport facility."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1226"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"runwaydesignator",children:"runwayDesignator"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"runwayDesignator"}),": ",(0,r.jsx)(n.code,{children:"RunwayDesignator"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The runwayDesignator of this runway."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1232"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"startthresholdlength",children:"startThresholdLength"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"startThresholdLength"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The distance, in meters, between the start of this runway and the displaced threshold on that end."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1265"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"surface",children:"surface"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"surface"}),": ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/RunwaySurfaceType",children:(0,r.jsx)(n.code,{children:"RunwaySurfaceType"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The surface type of this runway."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1271"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"width",children:"width"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"width"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The width of this runway in meters."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/navigation/Facilities.ts:1262"})]})}function o(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(a,{...e})}):a(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return t},a:function(){return l}});var d=i(667294);let r={},s=d.createContext(r);function l(e){let n=d.useContext(s);return d.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),d.createElement(s.Provider,{value:n},e.children)}}}]);