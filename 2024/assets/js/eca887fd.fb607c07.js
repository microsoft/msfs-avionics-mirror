"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["698205"],{58662:function(e,n,r){r.r(n),r.d(n,{metadata:()=>s,contentTitle:()=>c,default:()=>t,assets:()=>l,toc:()=>h,frontMatter:()=>a});var s=JSON.parse('{"id":"api/framework/classes/MapSharedCachedCanvasLayer","title":"Class: MapSharedCachedCanvasLayer","description":"A map layer containing a single canvas whose image can be cached and transformed as the map projection changes and","source":"@site/docs/api/framework/classes/MapSharedCachedCanvasLayer.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/MapSharedCachedCanvasLayer","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSharedCachedCanvasLayer","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"MapRotationModule","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapRotationModule"},"next":{"title":"MapSharedCachedCanvasSubLayer","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSharedCachedCanvasSubLayer"}}'),i=r("785893"),d=r("250065");let a={},c="Class: MapSharedCachedCanvasLayer",l={},h=[{value:"Extends",id:"extends",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new MapSharedCachedCanvasLayer()",id:"new-mapsharedcachedcanvaslayer",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context?",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"contextType?",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"getContext()",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Throws",id:"throws",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"isVisible()",id:"isvisible",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"onAfterRender()",id:"onafterrender",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"onAttached()",id:"onattached",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"onBeforeRender()",id:"onbeforerender",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"onDetached()",id:"ondetached",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"onMapProjectionChanged()",id:"onmapprojectionchanged",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"onSleep()",id:"onsleep",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"onUpdated()",id:"onupdated",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-10",level:4},{value:"Overrides",id:"overrides-5",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"onVisibilityChanged()",id:"onvisibilitychanged",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Overrides",id:"overrides-6",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"onWake()",id:"onwake",level:3},{value:"Returns",id:"returns-12",level:4},{value:"Overrides",id:"overrides-7",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"render()",id:"render",level:3},{value:"Returns",id:"returns-13",level:4},{value:"Overrides",id:"overrides-8",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"setVisible()",id:"setvisible",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-14",level:4},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-17",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"class-mapsharedcachedcanvaslayer",children:"Class: MapSharedCachedCanvasLayer"})}),"\n",(0,i.jsx)(n.p,{children:"A map layer containing a single canvas whose image can be cached and transformed as the map projection changes and\ncan be shared amongst multiple sublayers for rendering."}),"\n",(0,i.jsxs)(n.p,{children:["All of the layer's children are rendered on top of the shared canvas element. All children that extend\n",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSharedCachedCanvasSubLayer",children:"MapSharedCachedCanvasSubLayer"})," are treated as sublayers and can render to the shared canvas element."]}),"\n",(0,i.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),"<",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapSharedCachedCanvasLayerProps",children:(0,i.jsx)(n.code,{children:"MapSharedCachedCanvasLayerProps"})}),"<",(0,i.jsx)(n.code,{children:"any"}),">>"]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(n.h3,{id:"new-mapsharedcachedcanvaslayer",children:"new MapSharedCachedCanvasLayer()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"new MapSharedCachedCanvasLayer"}),"(",(0,i.jsx)(n.code,{children:"props"}),"): ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSharedCachedCanvasLayer",children:(0,i.jsx)(n.code,{children:"MapSharedCachedCanvasLayer"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Creates an instance of a DisplayComponent."}),"\n",(0,i.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"props"})}),(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapSharedCachedCanvasLayerProps",children:(0,i.jsx)(n.code,{children:"MapSharedCachedCanvasLayerProps"})}),"<",(0,i.jsx)(n.code,{children:"any"}),">"]}),(0,i.jsx)(n.td,{children:"The propertis of the component."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSharedCachedCanvasLayer",children:(0,i.jsx)(n.code,{children:"MapSharedCachedCanvasLayer"})})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#constructors",children:(0,i.jsx)(n.code,{children:"constructor"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:73"}),"\n",(0,i.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,i.jsx)(n.h3,{id:"context",children:"context?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"context"}),": [] = ",(0,i.jsx)(n.code,{children:"undefined"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"The context on this component, if any."}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#context",children:(0,i.jsx)(n.code,{children:"context"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:64"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"contexttype",children:"contextType?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"contextType"}),": readonly [] = ",(0,i.jsx)(n.code,{children:"undefined"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"The type of context for this component, if any."}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#contexttype",children:(0,i.jsx)(n.code,{children:"contextType"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:67"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"props",children:"props"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"props"}),": ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapSharedCachedCanvasLayerProps",children:(0,i.jsx)(n.code,{children:"MapSharedCachedCanvasLayerProps"})}),"<",(0,i.jsx)(n.code,{children:"any"}),"> & ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/ComponentProps",children:(0,i.jsx)(n.code,{children:"ComponentProps"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"The properties of the component."}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#props",children:(0,i.jsx)(n.code,{children:"props"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:61"}),"\n",(0,i.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"destroy"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Destroys this component."}),"\n",(0,i.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"overrides",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#destroy",children:(0,i.jsx)(n.code,{children:"destroy"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/map/layers/MapSharedCachedCanvasLayer.tsx:191"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"getcontext",children:"getContext()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.strong,{children:"getContext"}),"(",(0,i.jsx)(n.code,{children:"context"}),"): ",(0,i.jsx)(n.code,{children:"never"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Gets a context data subscription from the context collection."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"context"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"never"})}),(0,i.jsx)(n.td,{children:"The context to get the subscription for."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"never"})}),"\n",(0,i.jsx)(n.p,{children:"The requested context."}),"\n",(0,i.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,i.jsx)(n.p,{children:"An error if no data for the specified context type could be found."}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#getcontext",children:(0,i.jsx)(n.code,{children:"getContext"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:106"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"isvisible",children:"isVisible()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"isVisible"}),"(): ",(0,i.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Checks whether this layer is visible."}),"\n",(0,i.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"boolean"})}),"\n",(0,i.jsx)(n.p,{children:"whether this layer is visible."}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#isvisible",children:(0,i.jsx)(n.code,{children:"isVisible"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/map/MapLayer.ts:38"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onafterrender",children:"onAfterRender()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onAfterRender"}),"(",(0,i.jsx)(n.code,{children:"thisNode"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"A callback that is called after the component is rendered."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"thisNode"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNode",children:(0,i.jsx)(n.code,{children:"VNode"})})}),(0,i.jsx)(n.td,{children:"The component's VNode."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#onafterrender",children:(0,i.jsx)(n.code,{children:"onAfterRender"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/map/layers/MapSharedCachedCanvasLayer.tsx:81"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onattached",children:"onAttached()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onAttached"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"This method is called when this layer is attached to its parent map component."}),"\n",(0,i.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"overrides-2",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#onattached",children:(0,i.jsx)(n.code,{children:"onAttached"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/map/layers/MapSharedCachedCanvasLayer.tsx:99"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onbeforerender",children:"onBeforeRender()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onBeforeRender"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"A callback that is called before the component is rendered."}),"\n",(0,i.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-6",children:"Inherited from"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#onbeforerender",children:(0,i.jsx)(n.code,{children:"onBeforeRender"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:80"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"ondetached",children:"onDetached()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onDetached"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"This method is called when this layer is detached from its parent map component."}),"\n",(0,i.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-7",children:"Inherited from"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#ondetached",children:(0,i.jsx)(n.code,{children:"onDetached"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/map/MapLayer.ts:108"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onmapprojectionchanged",children:"onMapProjectionChanged()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onMapProjectionChanged"}),"(",(0,i.jsx)(n.code,{children:"projection"}),", ",(0,i.jsx)(n.code,{children:"changeFlags"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"This method is called when the map projection changes."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"projection"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapProjection",children:(0,i.jsx)(n.code,{children:"MapProjection"})})}),(0,i.jsx)(n.td,{children:"this layer's map projection."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"changeFlags"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"number"})}),(0,i.jsx)(n.td,{children:"The types of changes made to the projection."})]})]})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"overrides-3",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#onmapprojectionchanged",children:(0,i.jsx)(n.code,{children:"onMapProjectionChanged"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/map/layers/MapSharedCachedCanvasLayer.tsx:135"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onsleep",children:"onSleep()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onSleep"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"This method is called when this layer's parent map is put to sleep."}),"\n",(0,i.jsx)(n.h4,{id:"returns-9",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"overrides-4",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#onsleep",children:(0,i.jsx)(n.code,{children:"onSleep"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/map/layers/MapSharedCachedCanvasLayer.tsx:128"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onupdated",children:"onUpdated()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onUpdated"}),"(",(0,i.jsx)(n.code,{children:"time"}),", ",(0,i.jsx)(n.code,{children:"elapsed"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"This method is called once every map update cycle."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"time"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"number"})}),(0,i.jsx)(n.td,{children:"The current time as a UNIX timestamp."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"elapsed"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"number"})}),(0,i.jsx)(n.td,{children:"The elapsed time, in milliseconds, since the last update."})]})]})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-10",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"overrides-5",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#onupdated",children:(0,i.jsx)(n.code,{children:"onUpdated"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/map/layers/MapSharedCachedCanvasLayer.tsx:144"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onvisibilitychanged",children:"onVisibilityChanged()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onVisibilityChanged"}),"(",(0,i.jsx)(n.code,{children:"isVisible"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"This method is called when this layer's visibility changes."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"isVisible"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"boolean"})}),(0,i.jsx)(n.td,{children:"Whether the layer is now visible."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-11",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"overrides-6",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#onvisibilitychanged",children:(0,i.jsx)(n.code,{children:"onVisibilityChanged"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/map/layers/MapSharedCachedCanvasLayer.tsx:68"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onwake",children:"onWake()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onWake"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"This method is called when this layer's parent map is woken."}),"\n",(0,i.jsx)(n.h4,{id:"returns-12",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"overrides-7",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#onwake",children:(0,i.jsx)(n.code,{children:"onWake"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/map/layers/MapSharedCachedCanvasLayer.tsx:121"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"render",children:"render()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"render"}),"(): ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNode",children:(0,i.jsx)(n.code,{children:"VNode"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Renders the component."}),"\n",(0,i.jsx)(n.h4,{id:"returns-13",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNode",children:(0,i.jsx)(n.code,{children:"VNode"})})}),"\n",(0,i.jsx)(n.p,{children:"A JSX element to be rendered."}),"\n",(0,i.jsx)(n.h4,{id:"overrides-8",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#render",children:(0,i.jsx)(n.code,{children:"render"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/map/layers/MapSharedCachedCanvasLayer.tsx:175"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"setvisible",children:"setVisible()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"setVisible"}),"(",(0,i.jsx)(n.code,{children:"val"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Sets this layer's visibility."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-6",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"val"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"boolean"})}),(0,i.jsx)(n.td,{children:"Whether this layer should be visible."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-14",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-8",children:"Inherited from"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer#setvisible",children:(0,i.jsx)(n.code,{children:"setVisible"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/map/MapLayer.ts:46"})]})}function t(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(o,{...e})}):o(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return c},a:function(){return a}});var s=r(667294);let i={},d=s.createContext(i);function a(e){let n=s.useContext(d);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:a(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);