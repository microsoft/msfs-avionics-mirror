"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["866998"],{447128:function(e,n,s){s.r(n),s.d(n,{metadata:()=>r,contentTitle:()=>c,default:()=>h,assets:()=>l,toc:()=>t,frontMatter:()=>o});var r=JSON.parse('{"id":"api/framework/classes/DisplayComponent","title":"Class: abstract DisplayComponent\\\\<P, Contexts\\\\>","description":"A display component in the component framework.","source":"@site/docs/api/framework/classes/DisplayComponent.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/DisplayComponent","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"DiscontinuityLegCalculator","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/DiscontinuityLegCalculator"},"next":{"title":"DisplayField","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayField"}}'),i=s("785893"),d=s("250065");let o={},c="Class: abstract DisplayComponent<P, Contexts>",l={},t=[{value:"Extended by",id:"extended-by",level:2},{value:"Type Parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new DisplayComponent()",id:"new-displaycomponent",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context?",id:"context",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"contextType?",id:"contexttype",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"props",id:"props",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"getContext()",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"onAfterRender()",id:"onafterrender",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"onBeforeRender()",id:"onbeforerender",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"render()",id:"render",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-8",level:4}];function a(e){let n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsxs)(n.h1,{id:"class-abstract-displaycomponentp-contexts",children:["Class: ",(0,i.jsx)(n.code,{children:"abstract"})," DisplayComponent<P, Contexts>"]})}),"\n",(0,i.jsx)(n.p,{children:"A display component in the component framework."}),"\n",(0,i.jsx)(n.h2,{id:"extended-by",children:"Extended by"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BingComponent",children:(0,i.jsx)(n.code,{children:"BingComponent"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractNumberUnitDisplay",children:(0,i.jsx)(n.code,{children:"AbstractNumberUnitDisplay"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DigitScroller",children:(0,i.jsx)(n.code,{children:"DigitScroller"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DurationDisplay",children:(0,i.jsx)(n.code,{children:"DurationDisplay"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/LatLonDisplay",children:(0,i.jsx)(n.code,{children:"LatLonDisplay"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HardwareUiControl",children:(0,i.jsx)(n.code,{children:"HardwareUiControl"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HorizonSharedCanvasSubLayer",children:(0,i.jsx)(n.code,{children:"HorizonSharedCanvasSubLayer"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HorizonComponent",children:(0,i.jsx)(n.code,{children:"HorizonComponent"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HorizonLayer",children:(0,i.jsx)(n.code,{children:"HorizonLayer"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DefaultMapLabeledRingLabel",children:(0,i.jsx)(n.code,{children:"DefaultMapLabeledRingLabel"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapComponent",children:(0,i.jsx)(n.code,{children:"MapComponent"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapLayer",children:(0,i.jsx)(n.code,{children:"MapLayer"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSharedCachedCanvasSubLayer",children:(0,i.jsx)(n.code,{children:"MapSharedCachedCanvasSubLayer"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapSharedCanvasSubLayer",children:(0,i.jsx)(n.code,{children:"MapSharedCanvasSubLayer"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/SynVisComponent",children:(0,i.jsx)(n.code,{children:"SynVisComponent"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/CollectionComponent",children:(0,i.jsx)(n.code,{children:"CollectionComponent"})})}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Type Parameter"}),(0,i.jsx)(n.th,{children:"Default type"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"P"})}),(0,i.jsx)(n.td,{children:"-"})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"Contexts"})," ",(0,i.jsx)(n.em,{children:"extends"})," ",(0,i.jsx)(n.code,{children:"unknown"}),"[]"]}),(0,i.jsx)(n.td,{children:"[]"})]})]})]}),"\n",(0,i.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(n.h3,{id:"new-displaycomponent",children:"new DisplayComponent()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"new DisplayComponent"}),"<",(0,i.jsx)(n.code,{children:"P"}),", ",(0,i.jsx)(n.code,{children:"Contexts"}),">(",(0,i.jsx)(n.code,{children:"props"}),"): ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent",children:(0,i.jsx)(n.code,{children:"DisplayComponent"})}),"<",(0,i.jsx)(n.code,{children:"P"}),", ",(0,i.jsx)(n.code,{children:"Contexts"}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Creates an instance of a DisplayComponent."}),"\n",(0,i.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"props"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"P"})}),(0,i.jsx)(n.td,{children:"The propertis of the component."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/DisplayComponent",children:(0,i.jsx)(n.code,{children:"DisplayComponent"})}),"<",(0,i.jsx)(n.code,{children:"P"}),", ",(0,i.jsx)(n.code,{children:"Contexts"}),">"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:73"}),"\n",(0,i.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,i.jsx)(n.h3,{id:"context",children:"context?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"context"}),": [",(0,i.jsx)(n.code,{children:"...ContextSubcriptions<Contexts>[]"}),"] = ",(0,i.jsx)(n.code,{children:"undefined"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"The context on this component, if any."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:64"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"contexttype",children:"contextType?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"contextType"}),": readonly [",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/ContextTypes",children:(0,i.jsx)(n.code,{children:"ContextTypes"})}),"<",(0,i.jsx)(n.code,{children:"Contexts"}),">] = ",(0,i.jsx)(n.code,{children:"undefined"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"The type of context for this component, if any."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:67"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"props",children:"props"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"props"}),": ",(0,i.jsx)(n.code,{children:"P"})," & ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/ComponentProps",children:(0,i.jsx)(n.code,{children:"ComponentProps"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"The properties of the component."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:61"}),"\n",(0,i.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"destroy"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Destroys this component."}),"\n",(0,i.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:98"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"getcontext",children:"getContext()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.strong,{children:"getContext"}),"(",(0,i.jsx)(n.code,{children:"context"}),"): ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/ContextSubcriptions",children:(0,i.jsx)(n.code,{children:"ContextSubcriptions"})}),"<",(0,i.jsx)(n.code,{children:"Contexts"}),">[",(0,i.jsx)(n.code,{children:"number"}),"]"]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Gets a context data subscription from the context collection."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"context"})}),(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/ContextTypes",children:(0,i.jsx)(n.code,{children:"ContextTypes"})}),"<",(0,i.jsx)(n.code,{children:"Contexts"}),">[",(0,i.jsx)(n.code,{children:"number"}),"]"]}),(0,i.jsx)(n.td,{children:"The context to get the subscription for."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/ContextSubcriptions",children:(0,i.jsx)(n.code,{children:"ContextSubcriptions"})}),"<",(0,i.jsx)(n.code,{children:"Contexts"}),">[",(0,i.jsx)(n.code,{children:"number"}),"]"]}),"\n",(0,i.jsx)(n.p,{children:"The requested context."}),"\n",(0,i.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,i.jsx)(n.p,{children:"An error if no data for the specified context type could be found."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:106"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onafterrender",children:"onAfterRender()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onAfterRender"}),"(",(0,i.jsx)(n.code,{children:"node"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"A callback that is called after the component is rendered."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"node"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNode",children:(0,i.jsx)(n.code,{children:"VNode"})})}),(0,i.jsx)(n.td,{children:"The component's VNode."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:87"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onbeforerender",children:"onBeforeRender()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onBeforeRender"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"A callback that is called before the component is rendered."}),"\n",(0,i.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:80"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"render",children:"render()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"abstract"})," ",(0,i.jsx)(n.strong,{children:"render"}),"(): ",(0,i.jsx)(n.code,{children:"null"})," | ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNode",children:(0,i.jsx)(n.code,{children:"VNode"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Renders the component."}),"\n",(0,i.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"null"})," | ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/VNode",children:(0,i.jsx)(n.code,{children:"VNode"})})]}),"\n",(0,i.jsx)(n.p,{children:"A JSX element to be rendered."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:93"})]})}function h(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(a,{...e})}):a(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return c},a:function(){return o}});var r=s(667294);let i={},d=r.createContext(i);function o(e){let n=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),r.createElement(d.Provider,{value:n},e.children)}}}]);