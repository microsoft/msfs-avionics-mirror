"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["865818"],{476418:function(e,r,n){n.r(r),n.d(r,{metadata:()=>s,contentTitle:()=>t,default:()=>a,assets:()=>l,toc:()=>h,frontMatter:()=>c});var s=JSON.parse('{"id":"api/framework/classes/CustomFlightPathLegRenderer","title":"Class: CustomFlightPathLegRenderer\\\\<Args\\\\>","description":"Renders flight plan leg paths one vector at a time, optionally excluding the ingress and/or egress transition","source":"@site/docs/api/framework/classes/CustomFlightPathLegRenderer.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/CustomFlightPathLegRenderer","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/CustomFlightPathLegRenderer","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"CssTranslateZTransform","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/CssTranslateZTransform"},"next":{"title":"CustomWaypoint","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/CustomWaypoint"}}'),i=n("785893"),d=n("250065");let c={},t="Class: CustomFlightPathLegRenderer<Args>",l={},h=[{value:"Extends",id:"extends",level:2},{value:"Type Parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new CustomFlightPathLegRenderer()",id:"new-customflightpathlegrenderer",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"renderVector()",id:"rendervector",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"tempVector",id:"tempvector",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"geoCircleCache",id:"geocirclecache",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"geoPointCache",id:"geopointcache",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"Methods",id:"methods",level:2},{value:"render()",id:"render",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4}];function o(e){let r={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(r.header,{children:(0,i.jsx)(r.h1,{id:"class-customflightpathlegrendererargs",children:"Class: CustomFlightPathLegRenderer<Args>"})}),"\n",(0,i.jsx)(r.p,{children:"Renders flight plan leg paths one vector at a time, optionally excluding the ingress and/or egress transition\nvectors. The rendering behavior for each vector is controlled by a function passed to the class constructor."}),"\n",(0,i.jsx)(r.h2,{id:"extends",children:"Extends"}),"\n",(0,i.jsxs)(r.ul,{children:["\n",(0,i.jsxs)(r.li,{children:[(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractFlightPathLegRenderer",children:(0,i.jsx)(r.code,{children:"AbstractFlightPathLegRenderer"})}),"<",(0,i.jsx)(r.code,{children:"Args"}),">"]}),"\n"]}),"\n",(0,i.jsx)(r.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(r.table,{children:[(0,i.jsx)(r.thead,{children:(0,i.jsx)(r.tr,{children:(0,i.jsx)(r.th,{children:"Type Parameter"})})}),(0,i.jsx)(r.tbody,{children:(0,i.jsx)(r.tr,{children:(0,i.jsxs)(r.td,{children:[(0,i.jsx)(r.code,{children:"Args"})," ",(0,i.jsx)(r.em,{children:"extends"})," ",(0,i.jsx)(r.code,{children:"any"}),"[]"]})})})]}),"\n",(0,i.jsx)(r.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(r.h3,{id:"new-customflightpathlegrenderer",children:"new CustomFlightPathLegRenderer()"}),"\n",(0,i.jsxs)(r.blockquote,{children:["\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.strong,{children:"new CustomFlightPathLegRenderer"}),"<",(0,i.jsx)(r.code,{children:"Args"}),">(",(0,i.jsx)(r.code,{children:"renderVector"}),"): ",(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/CustomFlightPathLegRenderer",children:(0,i.jsx)(r.code,{children:"CustomFlightPathLegRenderer"})}),"<",(0,i.jsx)(r.code,{children:"Args"}),">"]}),"\n"]}),"\n",(0,i.jsx)(r.p,{children:"Constructor."}),"\n",(0,i.jsx)(r.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(r.table,{children:[(0,i.jsx)(r.thead,{children:(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.th,{children:"Parameter"}),(0,i.jsx)(r.th,{children:"Type"}),(0,i.jsx)(r.th,{children:"Description"})]})}),(0,i.jsx)(r.tbody,{children:(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"renderVector"})}),(0,i.jsxs)(r.td,{children:["(",(0,i.jsx)(r.code,{children:"vector"}),", ",(0,i.jsx)(r.code,{children:"isIngress"}),", ",(0,i.jsx)(r.code,{children:"isEgress"}),", ",(0,i.jsx)(r.code,{children:"leg"}),", ",(0,i.jsx)(r.code,{children:"context"}),", ",(0,i.jsx)(r.code,{children:"streamStack"}),", ...",(0,i.jsx)(r.code,{children:"args"}),") => ",(0,i.jsx)(r.code,{children:"void"})]}),(0,i.jsx)(r.td,{children:"A function which renders individual flight path vectors."})]})})]}),"\n",(0,i.jsx)(r.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/CustomFlightPathLegRenderer",children:(0,i.jsx)(r.code,{children:"CustomFlightPathLegRenderer"})}),"<",(0,i.jsx)(r.code,{children:"Args"}),">"]}),"\n",(0,i.jsx)(r.h4,{id:"overrides",children:"Overrides"}),"\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractFlightPathLegRenderer",children:(0,i.jsx)(r.code,{children:"AbstractFlightPathLegRenderer"})}),".",(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractFlightPathLegRenderer#constructors",children:(0,i.jsx)(r.code,{children:"constructor"})})]}),"\n",(0,i.jsx)(r.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(r.p,{children:"src/sdk/components/map/CustomFlightPathLegRenderer.ts:14"}),"\n",(0,i.jsx)(r.h2,{id:"properties",children:"Properties"}),"\n",(0,i.jsx)(r.h3,{id:"rendervector",children:"renderVector()"}),"\n",(0,i.jsxs)(r.blockquote,{children:["\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.code,{children:"protected"})," ",(0,i.jsx)(r.code,{children:"readonly"})," ",(0,i.jsx)(r.strong,{children:"renderVector"}),": (",(0,i.jsx)(r.code,{children:"vector"}),", ",(0,i.jsx)(r.code,{children:"isIngress"}),", ",(0,i.jsx)(r.code,{children:"isEgress"}),", ",(0,i.jsx)(r.code,{children:"leg"}),", ",(0,i.jsx)(r.code,{children:"context"}),", ",(0,i.jsx)(r.code,{children:"streamStack"}),", ...",(0,i.jsx)(r.code,{children:"args"}),") => ",(0,i.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(r.p,{children:"A function which renders individual flight path vectors."}),"\n",(0,i.jsx)(r.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(r.table,{children:[(0,i.jsx)(r.thead,{children:(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.th,{children:"Parameter"}),(0,i.jsx)(r.th,{children:"Type"})]})}),(0,i.jsxs)(r.tbody,{children:[(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"vector"})}),(0,i.jsxs)(r.td,{children:[(0,i.jsx)(r.code,{children:"Readonly"}),"<",(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPathVector",children:(0,i.jsx)(r.code,{children:"FlightPathVector"})}),">"]})]}),(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"isIngress"})}),(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"boolean"})})]}),(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"isEgress"})}),(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"boolean"})})]}),(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"leg"})}),(0,i.jsx)(r.td,{children:(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/LegDefinition",children:(0,i.jsx)(r.code,{children:"LegDefinition"})})})]}),(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"context"})}),(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"CanvasRenderingContext2D"})})]}),(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"streamStack"})}),(0,i.jsx)(r.td,{children:(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/GeoProjectionPathStreamStack",children:(0,i.jsx)(r.code,{children:"GeoProjectionPathStreamStack"})})})]}),(0,i.jsxs)(r.tr,{children:[(0,i.jsxs)(r.td,{children:["...",(0,i.jsx)(r.code,{children:"args"})]}),(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"Args"})})]})]})]}),"\n",(0,i.jsx)(r.h4,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsx)(r.p,{children:(0,i.jsx)(r.code,{children:"void"})}),"\n",(0,i.jsx)(r.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractFlightPathLegRenderer",children:(0,i.jsx)(r.code,{children:"AbstractFlightPathLegRenderer"})}),".",(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractFlightPathLegRenderer#rendervector",children:(0,i.jsx)(r.code,{children:"renderVector"})})]}),"\n",(0,i.jsx)(r.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(r.p,{children:"src/sdk/components/map/CustomFlightPathLegRenderer.ts:15"}),"\n",(0,i.jsx)(r.hr,{}),"\n",(0,i.jsx)(r.h3,{id:"tempvector",children:"tempVector"}),"\n",(0,i.jsxs)(r.blockquote,{children:["\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.code,{children:"protected"})," ",(0,i.jsx)(r.code,{children:"readonly"})," ",(0,i.jsx)(r.strong,{children:"tempVector"}),": ",(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FlightPathVector",children:(0,i.jsx)(r.code,{children:"FlightPathVector"})})]}),"\n"]}),"\n",(0,i.jsx)(r.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractFlightPathLegRenderer",children:(0,i.jsx)(r.code,{children:"AbstractFlightPathLegRenderer"})}),".",(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractFlightPathLegRenderer#tempvector",children:(0,i.jsx)(r.code,{children:"tempVector"})})]}),"\n",(0,i.jsx)(r.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(r.p,{children:"src/sdk/components/map/AbstractFlightPathLegRenderer.ts:34"}),"\n",(0,i.jsx)(r.hr,{}),"\n",(0,i.jsx)(r.h3,{id:"geocirclecache",children:"geoCircleCache"}),"\n",(0,i.jsxs)(r.blockquote,{children:["\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.code,{children:"protected"})," ",(0,i.jsx)(r.code,{children:"readonly"})," ",(0,i.jsx)(r.code,{children:"static"})," ",(0,i.jsx)(r.strong,{children:"geoCircleCache"}),": ",(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/GeoCircle",children:(0,i.jsx)(r.code,{children:"GeoCircle"})}),"[]"]}),"\n"]}),"\n",(0,i.jsx)(r.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractFlightPathLegRenderer",children:(0,i.jsx)(r.code,{children:"AbstractFlightPathLegRenderer"})}),".",(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractFlightPathLegRenderer#geocirclecache",children:(0,i.jsx)(r.code,{children:"geoCircleCache"})})]}),"\n",(0,i.jsx)(r.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,i.jsx)(r.p,{children:"src/sdk/components/map/AbstractFlightPathLegRenderer.ts:32"}),"\n",(0,i.jsx)(r.hr,{}),"\n",(0,i.jsx)(r.h3,{id:"geopointcache",children:"geoPointCache"}),"\n",(0,i.jsxs)(r.blockquote,{children:["\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.code,{children:"protected"})," ",(0,i.jsx)(r.code,{children:"readonly"})," ",(0,i.jsx)(r.code,{children:"static"})," ",(0,i.jsx)(r.strong,{children:"geoPointCache"}),": ",(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/GeoPoint",children:(0,i.jsx)(r.code,{children:"GeoPoint"})}),"[]"]}),"\n"]}),"\n",(0,i.jsx)(r.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractFlightPathLegRenderer",children:(0,i.jsx)(r.code,{children:"AbstractFlightPathLegRenderer"})}),".",(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractFlightPathLegRenderer#geopointcache",children:(0,i.jsx)(r.code,{children:"geoPointCache"})})]}),"\n",(0,i.jsx)(r.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,i.jsx)(r.p,{children:"src/sdk/components/map/AbstractFlightPathLegRenderer.ts:31"}),"\n",(0,i.jsx)(r.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(r.h3,{id:"render",children:"render()"}),"\n",(0,i.jsxs)(r.blockquote,{children:["\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.strong,{children:"render"}),"(",(0,i.jsx)(r.code,{children:"leg"}),", ",(0,i.jsx)(r.code,{children:"context"}),", ",(0,i.jsx)(r.code,{children:"streamStack"}),", ",(0,i.jsx)(r.code,{children:"partsToRender"}),", ...",(0,i.jsx)(r.code,{children:"args"}),"): ",(0,i.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(r.p,{children:"Renders a flight plan leg path to a canvas."}),"\n",(0,i.jsx)(r.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(r.table,{children:[(0,i.jsx)(r.thead,{children:(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.th,{children:"Parameter"}),(0,i.jsx)(r.th,{children:"Type"}),(0,i.jsx)(r.th,{children:"Description"})]})}),(0,i.jsxs)(r.tbody,{children:[(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"leg"})}),(0,i.jsx)(r.td,{children:(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/LegDefinition",children:(0,i.jsx)(r.code,{children:"LegDefinition"})})}),(0,i.jsx)(r.td,{children:"The flight plan leg to render."})]}),(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"context"})}),(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"CanvasRenderingContext2D"})}),(0,i.jsx)(r.td,{children:"The canvas 2D rendering context to which to render."})]}),(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"streamStack"})}),(0,i.jsx)(r.td,{children:(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/GeoProjectionPathStreamStack",children:(0,i.jsx)(r.code,{children:"GeoProjectionPathStreamStack"})})}),(0,i.jsx)(r.td,{children:"The path stream stack to which to render."})]}),(0,i.jsxs)(r.tr,{children:[(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"partsToRender"})}),(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"number"})}),(0,i.jsxs)(r.td,{children:["The parts of the leg to render, as a combination of ",(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/FlightPathLegRenderPart",children:"FlightPathLegRenderPart"})," values."]})]}),(0,i.jsxs)(r.tr,{children:[(0,i.jsxs)(r.td,{children:["...",(0,i.jsx)(r.code,{children:"args"})]}),(0,i.jsx)(r.td,{children:(0,i.jsx)(r.code,{children:"Args"})}),(0,i.jsx)(r.td,{children:"Additional arguments."})]})]})]}),"\n",(0,i.jsx)(r.h4,{id:"returns-2",children:"Returns"}),"\n",(0,i.jsx)(r.p,{children:(0,i.jsx)(r.code,{children:"void"})}),"\n",(0,i.jsx)(r.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractFlightPathLegRenderer",children:(0,i.jsx)(r.code,{children:"AbstractFlightPathLegRenderer"})}),".",(0,i.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractFlightPathLegRenderer#render",children:(0,i.jsx)(r.code,{children:"render"})})]}),"\n",(0,i.jsx)(r.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,i.jsx)(r.p,{children:"src/sdk/components/map/AbstractFlightPathLegRenderer.ts:45"})]})}function a(e={}){let{wrapper:r}={...(0,d.a)(),...e.components};return r?(0,i.jsx)(r,{...e,children:(0,i.jsx)(o,{...e})}):o(e)}},250065:function(e,r,n){n.d(r,{Z:function(){return t},a:function(){return c}});var s=n(667294);let i={},d=s.createContext(i);function c(e){let r=s.useContext(d);return s.useMemo(function(){return"function"==typeof e?e(r):{...r,...e}},[r,e])}function t(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:c(e.components),s.createElement(d.Provider,{value:r},e.children)}}}]);