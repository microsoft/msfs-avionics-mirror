"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["279573"],{136594:function(e,n,r){r.r(n),r.d(n,{metadata:()=>i,contentTitle:()=>s,default:()=>a,assets:()=>o,toc:()=>l,frontMatter:()=>c});var i=JSON.parse('{"id":"api/framework/classes/TurnToJoinGreatCircleAtPointVectorBuilder","title":"Class: TurnToJoinGreatCircleAtPointVectorBuilder","description":"Builds vectors representing paths connecting initial great circle paths to final great circle paths via a turn","source":"@site/docs/api/framework/classes/TurnToJoinGreatCircleAtPointVectorBuilder.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/TurnToJoinGreatCircleAtPointVectorBuilder","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/TurnToJoinGreatCircleAtPointVectorBuilder","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"TurnToFixLegCalculator","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/TurnToFixLegCalculator"},"next":{"title":"TurnToJoinGreatCircleVectorBuilder","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/TurnToJoinGreatCircleVectorBuilder"}}'),t=r("785893"),d=r("250065");let c={},s="Class: TurnToJoinGreatCircleAtPointVectorBuilder",o={},l=[{value:"Constructors",id:"constructors",level:2},{value:"new TurnToJoinGreatCircleAtPointVectorBuilder()",id:"new-turntojoingreatcircleatpointvectorbuilder",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"build()",id:"build",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"class-turntojoingreatcircleatpointvectorbuilder",children:"Class: TurnToJoinGreatCircleAtPointVectorBuilder"})}),"\n",(0,t.jsx)(n.p,{children:"Builds vectors representing paths connecting initial great circle paths to final great circle paths via a turn\nstarting at the start point and a turn ending at the end point, connected by a great-circle path."}),"\n",(0,t.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,t.jsx)(n.h3,{id:"new-turntojoingreatcircleatpointvectorbuilder",children:"new TurnToJoinGreatCircleAtPointVectorBuilder()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"new TurnToJoinGreatCircleAtPointVectorBuilder"}),"(): ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/TurnToJoinGreatCircleAtPointVectorBuilder",children:(0,t.jsx)(n.code,{children:"TurnToJoinGreatCircleAtPointVectorBuilder"})})]}),"\n"]}),"\n",(0,t.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/TurnToJoinGreatCircleAtPointVectorBuilder",children:(0,t.jsx)(n.code,{children:"TurnToJoinGreatCircleAtPointVectorBuilder"})})}),"\n",(0,t.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,t.jsx)(n.h3,{id:"build",children:"build()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"build"}),"(",(0,t.jsx)(n.code,{children:"vectors"}),", ",(0,t.jsx)(n.code,{children:"index"}),", ",(0,t.jsx)(n.code,{children:"start"}),", ",(0,t.jsx)(n.code,{children:"startPath"}),", ",(0,t.jsx)(n.code,{children:"startTurnRadius"}),", ",(0,t.jsx)(n.code,{children:"startTurnDirection"}),", ",(0,t.jsx)(n.code,{children:"end"}),", ",(0,t.jsx)(n.code,{children:"endPath"}),", ",(0,t.jsx)(n.code,{children:"endTurnRadius"}),", ",(0,t.jsx)(n.code,{children:"endTurnDirection"}),", ",(0,t.jsx)(n.code,{children:"startTurnVectorFlags"}),", ",(0,t.jsx)(n.code,{children:"endTurnVectorFlags"}),", ",(0,t.jsx)(n.code,{children:"connectVectorFlags"}),", ",(0,t.jsx)(n.code,{children:"heading"}),", ",(0,t.jsx)(n.code,{children:"isHeadingTrue"}),"): ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Builds a sequence of vectors representing a path from a defined start point and initial course which turns and\nconnects with another turn via a great-circle path to terminate at a defined end point and final course."}),"\n",(0,t.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Default value"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"vectors"})}),(0,t.jsxs)(n.td,{children:[(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPathVector",children:(0,t.jsx)(n.code,{children:"FlightPathVector"})}),"[]"]}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"undefined"})}),(0,t.jsx)(n.td,{children:"The flight path vector array to which to add the vectors."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"index"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"undefined"})}),(0,t.jsx)(n.td,{children:"The index in the array at which to add the vectors."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"start"})}),(0,t.jsxs)(n.td,{children:[(0,t.jsx)(n.code,{children:"Readonly"}),"<",(0,t.jsx)(n.code,{children:"Omit"}),"<",(0,t.jsx)(n.code,{children:"Float64Array"}),", ",(0,t.jsx)(n.code,{children:'"set"'})," | ",(0,t.jsx)(n.code,{children:'"sort"'})," | ",(0,t.jsx)(n.code,{children:'"copyWithin"'}),">> | ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/LatLonInterface",children:(0,t.jsx)(n.code,{children:"LatLonInterface"})})]}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"undefined"})}),(0,t.jsx)(n.td,{children:"The start point."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"startPath"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/GeoCircle",children:(0,t.jsx)(n.code,{children:"GeoCircle"})})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"undefined"})}),(0,t.jsx)(n.td,{children:"A GeoCircle that defines the initial course. Must be a great circle."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"startTurnRadius"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"undefined"})}),(0,t.jsx)(n.td,{children:"The radius of the initial turn, in meters."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"startTurnDirection"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/VectorTurnDirection",children:(0,t.jsx)(n.code,{children:"VectorTurnDirection"})})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"undefined"})}),(0,t.jsx)(n.td,{children:"The direction of the initial turn."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"end"})}),(0,t.jsxs)(n.td,{children:[(0,t.jsx)(n.code,{children:"Readonly"}),"<",(0,t.jsx)(n.code,{children:"Omit"}),"<",(0,t.jsx)(n.code,{children:"Float64Array"}),", ",(0,t.jsx)(n.code,{children:'"set"'})," | ",(0,t.jsx)(n.code,{children:'"sort"'})," | ",(0,t.jsx)(n.code,{children:'"copyWithin"'}),">> | ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/LatLonInterface",children:(0,t.jsx)(n.code,{children:"LatLonInterface"})})]}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"undefined"})}),(0,t.jsx)(n.td,{children:"The end point."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"endPath"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/GeoCircle",children:(0,t.jsx)(n.code,{children:"GeoCircle"})})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"undefined"})}),(0,t.jsx)(n.td,{children:"A GeoCircle that defines the final course. Must be a great circle."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"endTurnRadius"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"undefined"})}),(0,t.jsx)(n.td,{children:"The radius of the final turn, in meters."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"endTurnDirection"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/VectorTurnDirection",children:(0,t.jsx)(n.code,{children:"VectorTurnDirection"})})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"undefined"})}),(0,t.jsx)(n.td,{children:"The direction of the final turn."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"startTurnVectorFlags"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"0"})}),(0,t.jsx)(n.td,{children:"The flags to set on the initial turn vector. Defaults to none (0)."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"endTurnVectorFlags"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"0"})}),(0,t.jsx)(n.td,{children:"The flags to set on the final turn vector. Defaults to none (0)."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"connectVectorFlags"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"number"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"0"})}),(0,t.jsx)(n.td,{children:"The flags to set on the vector along the great-circle path connecting the turns. Defaults to none (0)."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"heading"})}),(0,t.jsxs)(n.td,{children:[(0,t.jsx)(n.code,{children:"null"})," | ",(0,t.jsx)(n.code,{children:"number"})]}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"null"})}),(0,t.jsxs)(n.td,{children:["The heading-to-fly to assign to all built vectors, in degrees, or ",(0,t.jsx)(n.code,{children:"null"})," if no heading is to be assigned. Defaults to ",(0,t.jsx)(n.code,{children:"null"}),"."]})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"isHeadingTrue"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"boolean"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"false"})}),(0,t.jsxs)(n.td,{children:["Whether the heading-to-fly assigned to built vectors is relative to true north instead of magnetic north. Defaults to ",(0,t.jsx)(n.code,{children:"false"}),"."]})]})]})]}),"\n",(0,t.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.code,{children:"number"})}),"\n",(0,t.jsx)(n.p,{children:"The number of vectors that were built and added to the array."}),"\n",(0,t.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,t.jsx)(n.p,{children:"Error if either the start or end path is not a great circle."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/sdk/flightplan/flightpath/vectorbuilders/TurnToJoinGreatCircleAtPointVectorBuilder.ts:44"})]})}function a(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(h,{...e})}):h(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return s},a:function(){return c}});var i=r(667294);let t={},d=i.createContext(t);function c(e){let n=i.useContext(d);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function s(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:c(e.components),i.createElement(d.Provider,{value:n},e.children)}}}]);