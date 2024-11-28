"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["785956"],{583480:function(e,n,r){r.r(n),r.d(n,{metadata:()=>s,contentTitle:()=>c,default:()=>h,assets:()=>o,toc:()=>t,frontMatter:()=>l});var s=JSON.parse('{"id":"api/framework/classes/MapSystemController","title":"Class: abstract MapSystemController\\\\<Modules, Layers, Controllers, Context\\\\>","description":"A map controller.","source":"@site/docs/api/framework/classes/MapSystemController.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/MapSystemController","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSystemController","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"MapSystemComponent","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSystemComponent"},"next":{"title":"MapSystemFlightPlanLayer","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSystemFlightPlanLayer"}}'),d=r("785893"),i=r("250065");let l={},c="Class: abstract MapSystemController<Modules, Layers, Controllers, Context>",o={},t=[{value:"Extended by",id:"extended-by",level:2},{value:"Type Parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new MapSystemController()",id:"new-mapsystemcontroller",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context",id:"context",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Accessors",id:"accessors",level:2},{value:"isAlive",id:"isalive",level:3},{value:"Get Signature",id:"get-signature",level:4},{value:"Returns",id:"returns-1",level:5},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"onAfterMapRender()",id:"onaftermaprender",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"onAfterUpdated()",id:"onafterupdated",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"onBeforeUpdated()",id:"onbeforeupdated",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"onDeadZoneChanged()",id:"ondeadzonechanged",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"onMapDestroyed()",id:"onmapdestroyed",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"onMapProjectionChanged()",id:"onmapprojectionchanged",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"onSleep()",id:"onsleep",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"onWake()",id:"onwake",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Defined in",id:"defined-in-11",level:4}];function a(e){let n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,i.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsxs)(n.h1,{id:"class-abstract-mapsystemcontrollermodules-layers-controllers-context",children:["Class: ",(0,d.jsx)(n.code,{children:"abstract"})," MapSystemController<Modules, Layers, Controllers, Context>"]})}),"\n",(0,d.jsx)(n.p,{children:"A map controller."}),"\n",(0,d.jsx)(n.h2,{id:"extended-by",children:"Extended by"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsx)(n.li,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapBindingsController",children:(0,d.jsx)(n.code,{children:"MapBindingsController"})})}),"\n",(0,d.jsx)(n.li,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapClockUpdateController",children:(0,d.jsx)(n.code,{children:"MapClockUpdateController"})})}),"\n",(0,d.jsx)(n.li,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapFlightPlanController",children:(0,d.jsx)(n.code,{children:"MapFlightPlanController"})})}),"\n",(0,d.jsx)(n.li,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapFollowAirplaneController",children:(0,d.jsx)(n.code,{children:"MapFollowAirplaneController"})})}),"\n",(0,d.jsx)(n.li,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapOwnAirplaneIconOrientationController",children:(0,d.jsx)(n.code,{children:"MapOwnAirplaneIconOrientationController"})})}),"\n",(0,d.jsx)(n.li,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapOwnAirplanePropsController",children:(0,d.jsx)(n.code,{children:"MapOwnAirplanePropsController"})})}),"\n",(0,d.jsx)(n.li,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapRotationController",children:(0,d.jsx)(n.code,{children:"MapRotationController"})})}),"\n",(0,d.jsx)(n.li,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSystemGenericController",children:(0,d.jsx)(n.code,{children:"MapSystemGenericController"})})}),"\n"]}),"\n",(0,d.jsx)(n.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Type Parameter"}),(0,d.jsx)(n.th,{children:"Default type"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Modules"})," ",(0,d.jsx)(n.em,{children:"extends"})," ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/ModuleRecord",children:(0,d.jsx)(n.code,{children:"ModuleRecord"})})]}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"any"})})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Layers"})," ",(0,d.jsx)(n.em,{children:"extends"})," ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/LayerRecord",children:(0,d.jsx)(n.code,{children:"LayerRecord"})})]}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"any"})})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Controllers"})," ",(0,d.jsx)(n.em,{children:"extends"})," ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/ControllerRecord",children:(0,d.jsx)(n.code,{children:"ControllerRecord"})})]}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"any"})})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Context"})," ",(0,d.jsx)(n.em,{children:"extends"})," ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/ContextRecord",children:(0,d.jsx)(n.code,{children:"ContextRecord"})})]}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"any"})})]})]})]}),"\n",(0,d.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(n.h3,{id:"new-mapsystemcontroller",children:"new MapSystemController()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"new MapSystemController"}),"<",(0,d.jsx)(n.code,{children:"Modules"}),", ",(0,d.jsx)(n.code,{children:"Layers"}),", ",(0,d.jsx)(n.code,{children:"Controllers"}),", ",(0,d.jsx)(n.code,{children:"Context"}),">(",(0,d.jsx)(n.code,{children:"context"}),"): ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSystemController",children:(0,d.jsx)(n.code,{children:"MapSystemController"})}),"<",(0,d.jsx)(n.code,{children:"Modules"}),", ",(0,d.jsx)(n.code,{children:"Layers"}),", ",(0,d.jsx)(n.code,{children:"Controllers"}),", ",(0,d.jsx)(n.code,{children:"Context"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Constructor."}),"\n",(0,d.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"context"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/MapSystemContext",children:(0,d.jsx)(n.code,{children:"MapSystemContext"})}),"<",(0,d.jsx)(n.code,{children:"Modules"}),", ",(0,d.jsx)(n.code,{children:"Layers"}),", ",(0,d.jsx)(n.code,{children:"any"}),", ",(0,d.jsx)(n.code,{children:"Context"}),">"]}),(0,d.jsx)(n.td,{children:"This controller's map context."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSystemController",children:(0,d.jsx)(n.code,{children:"MapSystemController"})}),"<",(0,d.jsx)(n.code,{children:"Modules"}),", ",(0,d.jsx)(n.code,{children:"Layers"}),", ",(0,d.jsx)(n.code,{children:"Controllers"}),", ",(0,d.jsx)(n.code,{children:"Context"}),">"]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:30"}),"\n",(0,d.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(n.h3,{id:"context",children:"context"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"context"}),": ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/MapSystemContext",children:(0,d.jsx)(n.code,{children:"MapSystemContext"})}),"<",(0,d.jsx)(n.code,{children:"Modules"}),", ",(0,d.jsx)(n.code,{children:"Layers"}),", ",(0,d.jsx)(n.code,{children:"Controllers"}),", ",(0,d.jsx)(n.code,{children:"Context"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:24"}),"\n",(0,d.jsx)(n.h2,{id:"accessors",children:"Accessors"}),"\n",(0,d.jsx)(n.h3,{id:"isalive",children:"isAlive"}),"\n",(0,d.jsx)(n.h4,{id:"get-signature",children:"Get Signature"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"get"})," ",(0,d.jsx)(n.strong,{children:"isAlive"}),"(): ",(0,d.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Whether this controller is alive."}),"\n",(0,d.jsx)(n.h5,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"boolean"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:20"}),"\n",(0,d.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"destroy"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Destroys this controller."}),"\n",(0,d.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:106"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onaftermaprender",children:"onAfterMapRender()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onAfterMapRender"}),"(",(0,d.jsx)(n.code,{children:"ref"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called after this controller' map is rendered."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"ref"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSystemComponent",children:(0,d.jsx)(n.code,{children:"MapSystemComponent"})}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapSystemComponentProps",children:(0,d.jsx)(n.code,{children:"MapSystemComponentProps"})}),"<",(0,d.jsx)(n.code,{children:"any"}),">>"]}),(0,d.jsx)(n.td,{children:"A reference to the rendered map."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:39"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onafterupdated",children:"onAfterUpdated()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onAfterUpdated"}),"(",(0,d.jsx)(n.code,{children:"time"}),", ",(0,d.jsx)(n.code,{children:"elapsed"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called immediately after this controller's map updates its layers."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"time"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The current time, as a Javascript timestamp."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"elapsed"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The elapsed time, in milliseconds, since the last update."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:78"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onbeforeupdated",children:"onBeforeUpdated()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onBeforeUpdated"}),"(",(0,d.jsx)(n.code,{children:"time"}),", ",(0,d.jsx)(n.code,{children:"elapsed"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called immediately before this controller's map updates its layers."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"time"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The current time, as a Javascript timestamp."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"elapsed"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The elapsed time, in milliseconds, since the last update."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:68"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"ondeadzonechanged",children:"onDeadZoneChanged()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onDeadZoneChanged"}),"(",(0,d.jsx)(n.code,{children:"deadZone"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when the dead zone of this controller's map changes."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"deadZone"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.code,{children:"Omit"}),"<",(0,d.jsx)(n.code,{children:"Float64Array"}),", ",(0,d.jsx)(n.code,{children:'"set"'})," | ",(0,d.jsx)(n.code,{children:'"sort"'})," | ",(0,d.jsx)(n.code,{children:'"copyWithin"'}),">>"]}),(0,d.jsx)(n.td,{children:"The map's new dead zone."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:48"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onmapdestroyed",children:"onMapDestroyed()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onMapDestroyed"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when this controller's map is destroyed."}),"\n",(0,d.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:99"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onmapprojectionchanged",children:"onMapProjectionChanged()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onMapProjectionChanged"}),"(",(0,d.jsx)(n.code,{children:"mapProjection"}),", ",(0,d.jsx)(n.code,{children:"changeFlags"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when the projection of this controller's map changes."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"mapProjection"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapProjection",children:(0,d.jsx)(n.code,{children:"MapProjection"})})}),(0,d.jsx)(n.td,{children:"The map projection."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"changeFlags"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"Bit flags describing the type of change."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:58"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onsleep",children:"onSleep()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onSleep"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when this controller's map is put to sleep."}),"\n",(0,d.jsx)(n.h4,{id:"returns-9",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:92"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onwake",children:"onWake()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onWake"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when this controller's map is awakened."}),"\n",(0,d.jsx)(n.h4,{id:"returns-10",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:85"})]})}function h(e={}){let{wrapper:n}={...(0,i.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(a,{...e})}):a(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return c},a:function(){return l}});var s=r(667294);let d={},i=s.createContext(d);function l(e){let n=s.useContext(i);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:l(e.components),s.createElement(i.Provider,{value:n},e.children)}}}]);