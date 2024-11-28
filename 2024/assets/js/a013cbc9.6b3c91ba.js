"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["37980"],{831112:function(e,n,s){s.r(n),s.d(n,{metadata:()=>r,contentTitle:()=>l,default:()=>a,assets:()=>o,toc:()=>t,frontMatter:()=>c});var r=JSON.parse('{"id":"api/framework/classes/MapComponent","title":"Class: abstract MapComponent\\\\<P\\\\>","description":"A component which displays a map. A map projects geographic coordinates onto a planar pixel grid. Each map component","source":"@site/docs/api/framework/classes/MapComponent.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/MapComponent","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapComponent","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"MapClockUpdateController","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapClockUpdateController"},"next":{"title":"MapCullableLocationTextLabel","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapCullableLocationTextLabel"}}'),d=s("785893"),i=s("250065");let c={},l="Class: abstract MapComponent<P>",o={},t=[{value:"Extends",id:"extends",level:2},{value:"Extended by",id:"extended-by",level:2},{value:"Type Parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new MapComponent()",id:"new-mapcomponent",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherit Doc",id:"inherit-doc",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context?",id:"context",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"contextType?",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"mapProjection",id:"mapprojection",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"Accessors",id:"accessors",level:2},{value:"isAwake",id:"isawake",level:3},{value:"Get Signature",id:"get-signature",level:4},{value:"Returns",id:"returns-1",level:5},{value:"Defined in",id:"defined-in-5",level:4},{value:"Methods",id:"methods",level:2},{value:"attachLayer()",id:"attachlayer",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"attachLayers()",id:"attachlayers",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"detachLayer()",id:"detachlayer",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"getContext()",id:"getcontext",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Throws",id:"throws",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"getProjectedSize()",id:"getprojectedsize",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"onAfterRender()",id:"onafterrender",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"onBeforeRender()",id:"onbeforerender",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"onMapProjectionChanged()",id:"onmapprojectionchanged",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-10",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"onProjectedSizeChanged()",id:"onprojectedsizechanged",level:3},{value:"Returns",id:"returns-11",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"onSleep()",id:"onsleep",level:3},{value:"Returns",id:"returns-12",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"onUpdated()",id:"onupdated",level:3},{value:"Parameters",id:"parameters-7",level:4},{value:"Returns",id:"returns-13",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"onWake()",id:"onwake",level:3},{value:"Returns",id:"returns-14",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"render()",id:"render",level:3},{value:"Returns",id:"returns-15",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"sleep()",id:"sleep",level:3},{value:"Returns",id:"returns-16",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"sleepLayers()",id:"sleeplayers",level:3},{value:"Returns",id:"returns-17",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"update()",id:"update",level:3},{value:"Parameters",id:"parameters-8",level:4},{value:"Returns",id:"returns-18",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"updateLayers()",id:"updatelayers",level:3},{value:"Parameters",id:"parameters-9",level:4},{value:"Returns",id:"returns-19",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"wake()",id:"wake",level:3},{value:"Returns",id:"returns-20",level:4},{value:"Defined in",id:"defined-in-24",level:4},{value:"wakeLayers()",id:"wakelayers",level:3},{value:"Returns",id:"returns-21",level:4},{value:"Defined in",id:"defined-in-25",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,i.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsxs)(n.h1,{id:"class-abstract-mapcomponentp",children:["Class: ",(0,d.jsx)(n.code,{children:"abstract"})," MapComponent<P>"]})}),"\n",(0,d.jsx)(n.p,{children:"A component which displays a map. A map projects geographic coordinates onto a planar pixel grid. Each map component\nmaintains a MapProjection instance which handles the details of the projection. MapLayer objects added to the map\nas children determine what is drawn on the map."}),"\n",(0,d.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent",children:(0,d.jsx)(n.code,{children:"DisplayComponent"})}),"<",(0,d.jsx)(n.code,{children:"P"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.h2,{id:"extended-by",children:"Extended by"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsx)(n.li,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSystemComponent",children:(0,d.jsx)(n.code,{children:"MapSystemComponent"})})}),"\n"]}),"\n",(0,d.jsx)(n.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Type Parameter"}),(0,d.jsx)(n.th,{children:"Default type"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"P"})," ",(0,d.jsx)(n.em,{children:"extends"})," ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapComponentProps",children:(0,d.jsx)(n.code,{children:"MapComponentProps"})}),"<",(0,d.jsx)(n.code,{children:"any"}),">"]}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapComponentProps",children:(0,d.jsx)(n.code,{children:"MapComponentProps"})}),"<",(0,d.jsx)(n.code,{children:"any"}),">"]})]})})]}),"\n",(0,d.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(n.h3,{id:"new-mapcomponent",children:"new MapComponent()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"new MapComponent"}),"<",(0,d.jsx)(n.code,{children:"P"}),">(",(0,d.jsx)(n.code,{children:"props"}),"): ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapComponent",children:(0,d.jsx)(n.code,{children:"MapComponent"})}),"<",(0,d.jsx)(n.code,{children:"P"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"props"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"P"})})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapComponent",children:(0,d.jsx)(n.code,{children:"MapComponent"})}),"<",(0,d.jsx)(n.code,{children:"P"}),">"]}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides",children:"Overrides"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent",children:(0,d.jsx)(n.code,{children:"DisplayComponent"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent#constructors",children:(0,d.jsx)(n.code,{children:"constructor"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:57"}),"\n",(0,d.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(n.h3,{id:"context",children:"context?"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"optional"})," ",(0,d.jsx)(n.strong,{children:"context"}),": [] = ",(0,d.jsx)(n.code,{children:"undefined"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The context on this component, if any."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent",children:(0,d.jsx)(n.code,{children:"DisplayComponent"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent#context",children:(0,d.jsx)(n.code,{children:"context"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:64"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"contexttype",children:"contextType?"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.code,{children:"optional"})," ",(0,d.jsx)(n.strong,{children:"contextType"}),": readonly [] = ",(0,d.jsx)(n.code,{children:"undefined"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The type of context for this component, if any."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent",children:(0,d.jsx)(n.code,{children:"DisplayComponent"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent#contexttype",children:(0,d.jsx)(n.code,{children:"contextType"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:67"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"mapprojection",children:"mapProjection"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"mapProjection"}),": ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapProjection",children:(0,d.jsx)(n.code,{children:"MapProjection"})})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This map component's projection model."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:42"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"props",children:"props"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"props"}),": ",(0,d.jsx)(n.code,{children:"P"})," & ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/ComponentProps",children:(0,d.jsx)(n.code,{children:"ComponentProps"})})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The properties of the component."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent",children:(0,d.jsx)(n.code,{children:"DisplayComponent"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent#props",children:(0,d.jsx)(n.code,{children:"props"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:61"}),"\n",(0,d.jsx)(n.h2,{id:"accessors",children:"Accessors"}),"\n",(0,d.jsx)(n.h3,{id:"isawake",children:"isAwake"}),"\n",(0,d.jsx)(n.h4,{id:"get-signature",children:"Get Signature"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"get"})," ",(0,d.jsx)(n.strong,{children:"isAwake"}),"(): ",(0,d.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Whether this map is awake."}),"\n",(0,d.jsx)(n.h5,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"boolean"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:82"}),"\n",(0,d.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(n.h3,{id:"attachlayer",children:"attachLayer()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"attachLayer"}),"(",(0,d.jsx)(n.code,{children:"layer"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Attaches a layer to this map component. If the layer is already attached, then this method has no effect."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"layer"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,d.jsx)(n.code,{children:"MapLayer"})}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapLayerProps",children:(0,d.jsx)(n.code,{children:"MapLayerProps"})}),"<",(0,d.jsx)(n.code,{children:"any"}),">>"]}),(0,d.jsx)(n.td,{children:"The layer to attach."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:209"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"attachlayers",children:"attachLayers()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"attachLayers"}),"(",(0,d.jsx)(n.code,{children:"thisNode"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Scans this component's VNode sub-tree for MapLayer components and attaches them when found. Only the top-most\nlevel of MapLayer components are attached; layers that are themselves children of other layers are not attached."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"thisNode"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNode",children:(0,d.jsx)(n.code,{children:"VNode"})})}),(0,d.jsx)(n.td,{children:"This component's VNode."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:140"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"destroy"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Destroys this component."}),"\n",(0,d.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent",children:(0,d.jsx)(n.code,{children:"DisplayComponent"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent#destroy",children:(0,d.jsx)(n.code,{children:"destroy"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:272"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"detachlayer",children:"detachLayer()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"detachLayer"}),"(",(0,d.jsx)(n.code,{children:"layer"}),"): ",(0,d.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Detaches a layer from this map component."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"layer"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,d.jsx)(n.code,{children:"MapLayer"})}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapLayerProps",children:(0,d.jsx)(n.code,{children:"MapLayerProps"})}),"<",(0,d.jsx)(n.code,{children:"any"}),">>"]}),(0,d.jsx)(n.td,{children:"The layer to detach."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"boolean"})}),"\n",(0,d.jsx)(n.p,{children:"Whether the layer was succesfully detached."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:224"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"getcontext",children:"getContext()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"getContext"}),"(",(0,d.jsx)(n.code,{children:"context"}),"): ",(0,d.jsx)(n.code,{children:"never"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Gets a context data subscription from the context collection."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"context"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"never"})}),(0,d.jsx)(n.td,{children:"The context to get the subscription for."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"never"})}),"\n",(0,d.jsx)(n.p,{children:"The requested context."}),"\n",(0,d.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"An error if no data for the specified context type could be found."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent",children:(0,d.jsx)(n.code,{children:"DisplayComponent"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent#getcontext",children:(0,d.jsx)(n.code,{children:"getContext"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:106"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"getprojectedsize",children:"getProjectedSize()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"getProjectedSize"}),"(): ",(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.code,{children:"Omit"}),"<",(0,d.jsx)(n.code,{children:"Float64Array"}),", ",(0,d.jsx)(n.code,{children:'"set"'})," | ",(0,d.jsx)(n.code,{children:'"sort"'})," | ",(0,d.jsx)(n.code,{children:'"copyWithin"'}),">>"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Gets the size of this map's projected window, in pixels."}),"\n",(0,d.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.code,{children:"Omit"}),"<",(0,d.jsx)(n.code,{children:"Float64Array"}),", ",(0,d.jsx)(n.code,{children:'"set"'})," | ",(0,d.jsx)(n.code,{children:'"sort"'})," | ",(0,d.jsx)(n.code,{children:'"copyWithin"'}),">>"]}),"\n",(0,d.jsx)(n.p,{children:"The size of this map's projected window."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:74"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onafterrender",children:"onAfterRender()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onAfterRender"}),"(",(0,d.jsx)(n.code,{children:"thisNode"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"A callback that is called after the component is rendered."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"thisNode"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNode",children:(0,d.jsx)(n.code,{children:"VNode"})})}),(0,d.jsx)(n.td,{children:"The component's VNode."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"overrides-2",children:"Overrides"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent",children:(0,d.jsx)(n.code,{children:"DisplayComponent"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent#onafterrender",children:(0,d.jsx)(n.code,{children:"onAfterRender"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:115"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onbeforerender",children:"onBeforeRender()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onBeforeRender"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"A callback that is called before the component is rendered."}),"\n",(0,d.jsx)(n.h4,{id:"returns-9",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent",children:(0,d.jsx)(n.code,{children:"DisplayComponent"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent#onbeforerender",children:(0,d.jsx)(n.code,{children:"onBeforeRender"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:80"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onmapprojectionchanged",children:"onMapProjectionChanged()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"onMapProjectionChanged"}),"(",(0,d.jsx)(n.code,{children:"mapProjection"}),", ",(0,d.jsx)(n.code,{children:"changeFlags"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when the map projection changes."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-6",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"mapProjection"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapProjection",children:(0,d.jsx)(n.code,{children:"MapProjection"})})}),(0,d.jsx)(n.td,{children:"This layer's map projection."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"changeFlags"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The types of changes made to the projection."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-10",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:189"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onprojectedsizechanged",children:"onProjectedSizeChanged()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"abstract"})," ",(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"onProjectedSizeChanged"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when the size of this map's projected window changes."}),"\n",(0,d.jsx)(n.h4,{id:"returns-11",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:203"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onsleep",children:"onSleep()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"onSleep"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when the map is put to sleep."}),"\n",(0,d.jsx)(n.h4,{id:"returns-12",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:170"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onupdated",children:"onUpdated()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"onUpdated"}),"(",(0,d.jsx)(n.code,{children:"time"}),", ",(0,d.jsx)(n.code,{children:"elapsed"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called once every update cycle."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-7",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"time"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The current real time as a UNIX timestamp in milliseconds."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"elapsed"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The elapsed time, in milliseconds, since the last update."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-13",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:254"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onwake",children:"onWake()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"onWake"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when the map is awakened."}),"\n",(0,d.jsx)(n.h4,{id:"returns-14",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:153"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"render",children:"render()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"abstract"})," ",(0,d.jsx)(n.strong,{children:"render"}),"(): ",(0,d.jsx)(n.code,{children:"null"})," | ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNode",children:(0,d.jsx)(n.code,{children:"VNode"})})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Renders the component."}),"\n",(0,d.jsx)(n.h4,{id:"returns-15",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"null"})," | ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNode",children:(0,d.jsx)(n.code,{children:"VNode"})})]}),"\n",(0,d.jsx)(n.p,{children:"A JSX element to be rendered."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent",children:(0,d.jsx)(n.code,{children:"DisplayComponent"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent#render",children:(0,d.jsx)(n.code,{children:"render"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-19",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:93"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"sleep",children:"sleep()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"sleep"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Puts this map to sleep. While asleep, this map will not be updated."}),"\n",(0,d.jsx)(n.h4,{id:"returns-16",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-20",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:89"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"sleeplayers",children:"sleepLayers()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"sleepLayers"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Calls the onSleep() method of this map's layers."}),"\n",(0,d.jsx)(n.h4,{id:"returns-17",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-21",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:177"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"update",children:"update()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"update"}),"(",(0,d.jsx)(n.code,{children:"time"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Updates this map."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-8",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"time"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The current real time as a UNIX timestamp in milliseconds."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-18",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-22",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:240"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"updatelayers",children:"updateLayers()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"updateLayers"}),"(",(0,d.jsx)(n.code,{children:"time"}),", ",(0,d.jsx)(n.code,{children:"elapsed"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Updates this map's attached layers."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-9",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"time"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The current real time as a UNIX timestamp in milliseconds."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"elapsed"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The elapsed time, in milliseconds, since the last update."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-19",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-23",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:264"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"wake",children:"wake()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"wake"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Wakes this map, allowing it to be updated."}),"\n",(0,d.jsx)(n.h4,{id:"returns-20",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-24",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:96"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"wakelayers",children:"wakeLayers()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"wakeLayers"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Calls the onWake() method of this map's layers."}),"\n",(0,d.jsx)(n.h4,{id:"returns-21",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-25",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/map/MapComponent.ts:160"})]})}function a(e={}){let{wrapper:n}={...(0,i.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(h,{...e})}):h(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return l},a:function(){return c}});var r=s(667294);let d={},i=r.createContext(d);function c(e){let n=r.useContext(i);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:c(e.components),r.createElement(i.Provider,{value:n},e.children)}}}]);