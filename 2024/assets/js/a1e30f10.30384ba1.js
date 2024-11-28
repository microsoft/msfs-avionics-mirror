"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["560462"],{368261:function(e,n,r){r.r(n),r.d(n,{metadata:()=>i,contentTitle:()=>t,default:()=>a,assets:()=>h,toc:()=>l,frontMatter:()=>c});var i=JSON.parse('{"id":"api/framework/interfaces/TransformingPathStream","title":"Interface: TransformingPathStream","description":"A path stream which sends a transformed version of its input to be consumed by another stream.","source":"@site/docs/api/framework/interfaces/TransformingPathStream.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/TransformingPathStream","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/TransformingPathStream","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"TrafficEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/TrafficEvents"},"next":{"title":"TurbopropFadecMode","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/TurbopropFadecMode"}}'),d=r("785893"),s=r("250065");let c={},t="Interface: TransformingPathStream",h={},l=[{value:"Extends",id:"extends",level:2},{value:"Methods",id:"methods",level:2},{value:"arc()",id:"arc",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"beginPath()",id:"beginpath",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"bezierCurveTo()",id:"beziercurveto",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"closePath()",id:"closepath",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"getConsumer()",id:"getconsumer",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"lineTo()",id:"lineto",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"moveTo()",id:"moveto",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"quadraticCurveTo()",id:"quadraticcurveto",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"setConsumer()",id:"setconsumer",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-8",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"interface-transformingpathstream",children:"Interface: TransformingPathStream"})}),"\n",(0,d.jsx)(n.p,{children:"A path stream which sends a transformed version of its input to be consumed by another stream."}),"\n",(0,d.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsx)(n.li,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream",children:(0,d.jsx)(n.code,{children:"PathStream"})})}),"\n"]}),"\n",(0,d.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(n.h3,{id:"arc",children:"arc()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"arc"}),"(",(0,d.jsx)(n.code,{children:"x"}),", ",(0,d.jsx)(n.code,{children:"y"}),", ",(0,d.jsx)(n.code,{children:"radius"}),", ",(0,d.jsx)(n.code,{children:"startAngle"}),", ",(0,d.jsx)(n.code,{children:"endAngle"}),", ",(0,d.jsx)(n.code,{children:"counterClockwise"}),"?): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Paths an arc."}),"\n",(0,d.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"x"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The x-coordinate of the center of the circle containing the arc."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"y"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The y-coordinate of the center of the circle containing the arc."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"radius"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The radius of the arc."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"startAngle"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The angle of the start of the arc, in radians."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"endAngle"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The angle of the end of the arc, in radians."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"counterClockwise"}),"?"]}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"boolean"})}),(0,d.jsx)(n.td,{children:"Whether the arc should be drawn counterclockwise. False by default."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream",children:(0,d.jsx)(n.code,{children:"PathStream"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream#arc",children:(0,d.jsx)(n.code,{children:"arc"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/graphics/path/PathStream.ts:53"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"beginpath",children:"beginPath()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"beginPath"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Begins a path. Erases all previous path state."}),"\n",(0,d.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream",children:(0,d.jsx)(n.code,{children:"PathStream"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream#beginpath",children:(0,d.jsx)(n.code,{children:"beginPath"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/graphics/path/PathStream.ts:8"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"beziercurveto",children:"bezierCurveTo()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"bezierCurveTo"}),"(",(0,d.jsx)(n.code,{children:"cp1x"}),", ",(0,d.jsx)(n.code,{children:"cp1y"}),", ",(0,d.jsx)(n.code,{children:"cp2x"}),", ",(0,d.jsx)(n.code,{children:"cp2y"}),", ",(0,d.jsx)(n.code,{children:"x"}),", ",(0,d.jsx)(n.code,{children:"y"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Paths a cubic Bezier curve from the current point to a specified point."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"cp1x"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The x-coordinate of the first control point."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"cp1y"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The y-coordinate of the first control point."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"cp2x"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The x-coordinate of the second control point."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"cp2y"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The y-coordinate of the second control point."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"x"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The x-coordinate of the end point."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"y"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The y-coordinate of the end point."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream",children:(0,d.jsx)(n.code,{children:"PathStream"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream#beziercurveto",children:(0,d.jsx)(n.code,{children:"bezierCurveTo"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/graphics/path/PathStream.ts:33"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"closepath",children:"closePath()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"closePath"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Paths a line from the current point to the first point defined by the current path."}),"\n",(0,d.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream",children:(0,d.jsx)(n.code,{children:"PathStream"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream#closepath",children:(0,d.jsx)(n.code,{children:"closePath"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/graphics/path/PathStream.ts:58"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"getconsumer",children:"getConsumer()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"getConsumer"}),"(): ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream",children:(0,d.jsx)(n.code,{children:"PathStream"})})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Gets the path stream that is consuming this stream's transformed output."}),"\n",(0,d.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream",children:(0,d.jsx)(n.code,{children:"PathStream"})})}),"\n",(0,d.jsx)(n.p,{children:"The path stream that is consuming this stream's transformed output."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/graphics/path/PathStream.ts:126"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"lineto",children:"lineTo()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"lineTo"}),"(",(0,d.jsx)(n.code,{children:"x"}),", ",(0,d.jsx)(n.code,{children:"y"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Paths a straight line from the current point to a specified point."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"x"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The x-coordinate of the end point."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"y"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The y-coordinate of the end point."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream",children:(0,d.jsx)(n.code,{children:"PathStream"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream#lineto",children:(0,d.jsx)(n.code,{children:"lineTo"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/graphics/path/PathStream.ts:22"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"moveto",children:"moveTo()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"moveTo"}),"(",(0,d.jsx)(n.code,{children:"x"}),", ",(0,d.jsx)(n.code,{children:"y"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Moves to a specified point."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"x"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The x-coordinate of the point to which to move."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"y"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The y-coordinate of the point to which to move."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream",children:(0,d.jsx)(n.code,{children:"PathStream"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream#moveto",children:(0,d.jsx)(n.code,{children:"moveTo"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/graphics/path/PathStream.ts:15"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"quadraticcurveto",children:"quadraticCurveTo()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"quadraticCurveTo"}),"(",(0,d.jsx)(n.code,{children:"cpx"}),", ",(0,d.jsx)(n.code,{children:"cpy"}),", ",(0,d.jsx)(n.code,{children:"x"}),", ",(0,d.jsx)(n.code,{children:"y"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Paths a quadrative Bezier curve from the current point to a specified point."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"cpx"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The x-coordinate of the control point."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"cpy"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The y-coordinate of the control point."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"x"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The x-coordinate of the end point."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"y"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The y-coordinate of the end point."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-6",children:"Inherited from"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream",children:(0,d.jsx)(n.code,{children:"PathStream"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream#quadraticcurveto",children:(0,d.jsx)(n.code,{children:"quadraticCurveTo"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/graphics/path/PathStream.ts:42"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"setconsumer",children:"setConsumer()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"setConsumer"}),"(",(0,d.jsx)(n.code,{children:"consumer"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Sets the path stream that consumes this stream's transformed output."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"consumer"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PathStream",children:(0,d.jsx)(n.code,{children:"PathStream"})})}),(0,d.jsx)(n.td,{children:"The new consuming path stream."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/graphics/path/PathStream.ts:132"})]})}function a(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(o,{...e})}):o(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return t},a:function(){return c}});var i=r(667294);let d={},s=i.createContext(d);function c(e){let n=i.useContext(s);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:c(e.components),i.createElement(s.Provider,{value:n},e.children)}}}]);