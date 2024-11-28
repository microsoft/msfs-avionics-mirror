"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["257324"],{72985:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>c,default:()=>a,assets:()=>h,toc:()=>t,frontMatter:()=>l});var r=JSON.parse('{"id":"api/garminsdk/classes/TcasRaPitchCueLayer","title":"Class: TcasRaPitchCueLayer","description":"A PFD TCAS-II resolution advisory pitch cue layer.","source":"@site/docs/api/garminsdk/classes/TcasRaPitchCueLayer.md","sourceDirName":"api/garminsdk/classes","slug":"/api/garminsdk/classes/TcasRaPitchCueLayer","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/TcasRaPitchCueLayer","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"TasSensitivityParameters","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/TasSensitivityParameters"},"next":{"title":"TerrainSystemAnnunciation","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/TerrainSystemAnnunciation"}}'),d=i("785893"),s=i("250065");let l={},c="Class: TcasRaPitchCueLayer",h={},t=[{value:"Extends",id:"extends",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new TcasRaPitchCueLayer()",id:"new-tcasrapitchcuelayer",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context?",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"contextType?",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherit Doc",id:"inherit-doc",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"getContext()",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Throws",id:"throws",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"isAttached()",id:"isattached",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"isVisible()",id:"isvisible",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"onAfterRender()",id:"onafterrender",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"onAttached()",id:"onattached",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Inherit Doc",id:"inherit-doc-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"onBeforeRender()",id:"onbeforerender",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"onDetached()",id:"ondetached",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Inherit Doc",id:"inherit-doc-2",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"onProjectionChanged()",id:"onprojectionchanged",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Inherit Doc",id:"inherit-doc-3",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"onSleep()",id:"onsleep",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Inherit Doc",id:"inherit-doc-4",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"onUpdated()",id:"onupdated",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Inherit Doc",id:"inherit-doc-5",level:4},{value:"Overrides",id:"overrides-5",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"onVisibilityChanged()",id:"onvisibilitychanged",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-12",level:4},{value:"Inherit Doc",id:"inherit-doc-6",level:4},{value:"Overrides",id:"overrides-6",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"onWake()",id:"onwake",level:3},{value:"Returns",id:"returns-13",level:4},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"render()",id:"render",level:3},{value:"Returns",id:"returns-14",level:4},{value:"Inherit Doc",id:"inherit-doc-7",level:4},{value:"Overrides",id:"overrides-7",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"setVisible()",id:"setvisible",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-15",level:4},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-18",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"class-tcasrapitchcuelayer",children:"Class: TcasRaPitchCueLayer"})}),"\n",(0,d.jsx)(n.p,{children:"A PFD TCAS-II resolution advisory pitch cue layer."}),"\n",(0,d.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"HorizonLayer"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/TcasRaPitchCueLayerProps",children:(0,d.jsx)(n.code,{children:"TcasRaPitchCueLayerProps"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(n.h3,{id:"new-tcasrapitchcuelayer",children:"new TcasRaPitchCueLayer()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"new TcasRaPitchCueLayer"}),"(",(0,d.jsx)(n.code,{children:"props"}),"): ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/TcasRaPitchCueLayer",children:(0,d.jsx)(n.code,{children:"TcasRaPitchCueLayer"})})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Creates an instance of a DisplayComponent."}),"\n",(0,d.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"props"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/TcasRaPitchCueLayerProps",children:(0,d.jsx)(n.code,{children:"TcasRaPitchCueLayerProps"})})}),(0,d.jsx)(n.td,{children:"The propertis of the component."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/TcasRaPitchCueLayer",children:(0,d.jsx)(n.code,{children:"TcasRaPitchCueLayer"})})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer<TcasRaPitchCueLayerProps>.constructor"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:73"}),"\n",(0,d.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(n.h3,{id:"context",children:"context?"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"optional"})," ",(0,d.jsx)(n.strong,{children:"context"}),": [] = ",(0,d.jsx)(n.code,{children:"undefined"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The context on this component, if any."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.context"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:64"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"contexttype",children:"contextType?"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.code,{children:"optional"})," ",(0,d.jsx)(n.strong,{children:"contextType"}),": readonly [] = ",(0,d.jsx)(n.code,{children:"undefined"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The type of context for this component, if any."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.contextType"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:67"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"props",children:"props"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"props"}),": ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/TcasRaPitchCueLayerProps",children:(0,d.jsx)(n.code,{children:"TcasRaPitchCueLayerProps"})})," & ",(0,d.jsx)(n.code,{children:"ComponentProps"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The properties of the component."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.props"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:61"}),"\n",(0,d.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"destroy"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.destroy"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/horizon/TcasRaPitchCueLayer.tsx:458"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"getcontext",children:"getContext()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"getContext"}),"(",(0,d.jsx)(n.code,{children:"context"}),"): ",(0,d.jsx)(n.code,{children:"never"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Gets a context data subscription from the context collection."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"context"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"never"})}),(0,d.jsx)(n.td,{children:"The context to get the subscription for."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"never"})}),"\n",(0,d.jsx)(n.p,{children:"The requested context."}),"\n",(0,d.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"An error if no data for the specified context type could be found."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.getContext"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:106"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"isattached",children:"isAttached()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"isAttached"}),"(): ",(0,d.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Checks whether this layer is attached to a horizon component."}),"\n",(0,d.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"boolean"})}),"\n",(0,d.jsx)(n.p,{children:"Whether this layer is attached to a horizon component."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.isAttached"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/horizon/HorizonLayer.ts:31"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"isvisible",children:"isVisible()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"isVisible"}),"(): ",(0,d.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Checks whether this layer is visible."}),"\n",(0,d.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"boolean"})}),"\n",(0,d.jsx)(n.p,{children:"whether this layer is visible."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-6",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.isVisible"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/horizon/HorizonLayer.ts:39"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onafterrender",children:"onAfterRender()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onAfterRender"}),"(",(0,d.jsx)(n.code,{children:"node"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"A callback that is called after the component is rendered."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"node"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"VNode"})}),(0,d.jsx)(n.td,{children:"The component's VNode."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-7",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.onAfterRender"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:87"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onattached",children:"onAttached()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onAttached"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-1",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.onAttached"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/horizon/TcasRaPitchCueLayer.tsx:135"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onbeforerender",children:"onBeforeRender()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onBeforeRender"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"A callback that is called before the component is rendered."}),"\n",(0,d.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-8",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.onBeforeRender"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:80"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"ondetached",children:"onDetached()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onDetached"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-2",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-2",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.onDetached"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/horizon/TcasRaPitchCueLayer.tsx:376"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onprojectionchanged",children:"onProjectionChanged()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onProjectionChanged"}),"(",(0,d.jsx)(n.code,{children:"projection"}),", ",(0,d.jsx)(n.code,{children:"changeFlags"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"projection"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"HorizonProjection"})})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"changeFlags"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-9",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-3",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-3",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.onProjectionChanged"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/horizon/TcasRaPitchCueLayer.tsx:185"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onsleep",children:"onSleep()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onSleep"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"returns-10",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-4",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-4",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.onSleep"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/horizon/TcasRaPitchCueLayer.tsx:193"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onupdated",children:"onUpdated()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onUpdated"}),"(",(0,d.jsx)(n.code,{children:"time"}),", ",(0,d.jsx)(n.code,{children:"elapsed"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"time"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"elapsed"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-11",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-5",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-5",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.onUpdated"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/horizon/TcasRaPitchCueLayer.tsx:199"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onvisibilitychanged",children:"onVisibilityChanged()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"onVisibilityChanged"}),"(",(0,d.jsx)(n.code,{children:"isVisible"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"isVisible"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"boolean"})})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-12",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-6",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-6",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.onVisibilityChanged"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/horizon/TcasRaPitchCueLayer.tsx:113"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onwake",children:"onWake()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onWake"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when this layer's parent horizon component is awakened."}),"\n",(0,d.jsx)(n.h4,{id:"returns-13",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-9",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.onWake"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/horizon/HorizonLayer.ts:81"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"render",children:"render()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"render"}),"(): ",(0,d.jsx)(n.code,{children:"VNode"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"returns-14",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"VNode"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-7",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-7",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.render"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/horizon/TcasRaPitchCueLayer.tsx:383"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"setvisible",children:"setVisible()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"setVisible"}),"(",(0,d.jsx)(n.code,{children:"val"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Sets this layer's visibility."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-6",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"val"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"boolean"})}),(0,d.jsx)(n.td,{children:"Whether this layer should be visible."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-15",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-10",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"HorizonLayer.setVisible"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/horizon/HorizonLayer.ts:47"})]})}function a(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(o,{...e})}):o(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return c},a:function(){return l}});var r=i(667294);let d={},s=r.createContext(d);function l(e){let n=r.useContext(s);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:l(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);