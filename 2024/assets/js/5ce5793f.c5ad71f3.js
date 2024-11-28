"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["255107"],{516652:function(e,n,s){s.r(n),s.d(n,{metadata:()=>d,contentTitle:()=>c,default:()=>x,assets:()=>o,toc:()=>l,frontMatter:()=>t});var d=JSON.parse('{"id":"api/g3xtouchcommon/classes/ImgTouchButton","title":"Class: ImgTouchButton","description":"A touchscreen button which displays an optional label and image.","source":"@site/docs/api/g3xtouchcommon/classes/ImgTouchButton.md","sourceDirName":"api/g3xtouchcommon/classes","slug":"/api/g3xtouchcommon/classes/ImgTouchButton","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/ImgTouchButton","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"HsiUpperDeviationIndicator","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/HsiUpperDeviationIndicator"},"next":{"title":"InstrumentConfig","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/InstrumentConfig"}}'),i=s("785893"),r=s("250065");let t={},c="Class: ImgTouchButton",o={},l=[{value:"Extends",id:"extends",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new ImgTouchButton()",id:"new-imgtouchbutton",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"buttonRef",id:"buttonref",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"context?",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"contextType?",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"cssClassSet",id:"cssclassset",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"cssClassSub?",id:"cssclasssub",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"imgSrc",id:"imgsrc",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"RESERVED_CSS_CLASSES",id:"reserved_css_classes",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherit Doc",id:"inherit-doc",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"getContext()",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Throws",id:"throws",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"getReservedCssClasses()",id:"getreservedcssclasses",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"getRootElement()",id:"getrootelement",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Throws",id:"throws-1",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"onAfterRender()",id:"onafterrender",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"onBeforeRender()",id:"onbeforerender",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"render()",id:"render",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Inherit Doc",id:"inherit-doc-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"renderImg()",id:"renderimg",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"simulatePressed()",id:"simulatepressed",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-17",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,r.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"class-imgtouchbutton",children:"Class: ImgTouchButton"})}),"\n",(0,i.jsx)(n.p,{children:"A touchscreen button which displays an optional label and image."}),"\n",(0,i.jsxs)(n.p,{children:["The root element of the button contains the ",(0,i.jsx)(n.code,{children:"touch-button-img"})," CSS class by default, in addition to all\nroot-element classes used by ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/TouchButton",children:"TouchButton"}),"."]}),"\n",(0,i.jsxs)(n.p,{children:["The root element contains an optional child ",(0,i.jsx)(n.code,{children:"<img>"})," element with the CSS class ",(0,i.jsx)(n.code,{children:"touch-button-img-img"})," and an\noptional label element with the CSS class ",(0,i.jsx)(n.code,{children:"touch-button-label"}),"."]}),"\n",(0,i.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"DisplayComponent"}),"<",(0,i.jsx)(n.code,{children:"ImgTouchButtonProps"}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(n.h3,{id:"new-imgtouchbutton",children:"new ImgTouchButton()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"new ImgTouchButton"}),"(",(0,i.jsx)(n.code,{children:"props"}),"): ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/ImgTouchButton",children:(0,i.jsx)(n.code,{children:"ImgTouchButton"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Creates an instance of a DisplayComponent."}),"\n",(0,i.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"props"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"ImgTouchButtonProps"})}),(0,i.jsx)(n.td,{children:"The propertis of the component."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/ImgTouchButton",children:(0,i.jsx)(n.code,{children:"ImgTouchButton"})})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"DisplayComponent<ImgTouchButtonProps>.constructor"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:73"}),"\n",(0,i.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,i.jsx)(n.h3,{id:"buttonref",children:"buttonRef"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.strong,{children:"buttonRef"}),": ",(0,i.jsx)(n.code,{children:"NodeReference"}),"<",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/TouchButton",children:(0,i.jsx)(n.code,{children:"TouchButton"})}),"<",(0,i.jsx)(n.code,{children:"TouchButtonProps"}),">>"]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/garminsdk/components/touchbutton/ImgTouchButton.tsx:24"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"context",children:"context?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"context"}),": [] = ",(0,i.jsx)(n.code,{children:"undefined"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"The context on this component, if any."}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"DisplayComponent.context"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:64"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"contexttype",children:"contextType?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"contextType"}),": readonly [] = ",(0,i.jsx)(n.code,{children:"undefined"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"The type of context for this component, if any."}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"DisplayComponent.contextType"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:67"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"cssclassset",children:"cssClassSet"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.strong,{children:"cssClassSet"}),": ",(0,i.jsx)(n.code,{children:"SetSubject"}),"<",(0,i.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/garminsdk/components/touchbutton/ImgTouchButton.tsx:26"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"cssclasssub",children:"cssClassSub?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"cssClassSub"}),": ",(0,i.jsx)(n.code,{children:"Subscription"})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/garminsdk/components/touchbutton/ImgTouchButton.tsx:32"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"imgsrc",children:"imgSrc"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.strong,{children:"imgSrc"}),": ",(0,i.jsx)(n.code,{children:"undefined"})," | ",(0,i.jsx)(n.code,{children:"MappedSubscribable"}),"<",(0,i.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/garminsdk/components/touchbutton/ImgTouchButton.tsx:28"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"props",children:"props"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"props"}),": ",(0,i.jsx)(n.code,{children:"ImgTouchButtonProps"})," & ",(0,i.jsx)(n.code,{children:"ComponentProps"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"The properties of the component."}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"DisplayComponent.props"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:61"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"reserved_css_classes",children:"RESERVED_CSS_CLASSES"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"RESERVED_CSS_CLASSES"}),": ",(0,i.jsx)(n.code,{children:"Set"}),"<",(0,i.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/garminsdk/components/touchbutton/ImgTouchButton.tsx:22"}),"\n",(0,i.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"destroy"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherit-doc",children:"Inherit Doc"}),"\n",(0,i.jsx)(n.h4,{id:"overrides",children:"Overrides"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"DisplayComponent.destroy"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/garminsdk/components/touchbutton/ImgTouchButton.tsx:113"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"getcontext",children:"getContext()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.strong,{children:"getContext"}),"(",(0,i.jsx)(n.code,{children:"context"}),"): ",(0,i.jsx)(n.code,{children:"never"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Gets a context data subscription from the context collection."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"context"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"never"})}),(0,i.jsx)(n.td,{children:"The context to get the subscription for."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"never"})}),"\n",(0,i.jsx)(n.p,{children:"The requested context."}),"\n",(0,i.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,i.jsx)(n.p,{children:"An error if no data for the specified context type could be found."}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"DisplayComponent.getContext"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:106"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"getreservedcssclasses",children:"getReservedCssClasses()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.strong,{children:"getReservedCssClasses"}),"(): ",(0,i.jsx)(n.code,{children:"ReadonlySet"}),"<",(0,i.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Gets the CSS classes that are reserved for this button's root element."}),"\n",(0,i.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"ReadonlySet"}),"<",(0,i.jsx)(n.code,{children:"string"}),">"]}),"\n",(0,i.jsx)(n.p,{children:"The CSS classes that are reserved for this button's root element."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/garminsdk/components/touchbutton/ImgTouchButton.tsx:108"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"getrootelement",children:"getRootElement()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"getRootElement"}),"(): ",(0,i.jsx)(n.code,{children:"HTMLElement"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Gets this button's root HTML element."}),"\n",(0,i.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"HTMLElement"})}),"\n",(0,i.jsx)(n.p,{children:"This button's root HTML element."}),"\n",(0,i.jsx)(n.h4,{id:"throws-1",children:"Throws"}),"\n",(0,i.jsx)(n.p,{children:"Error if this button has not yet been rendered."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/garminsdk/components/touchbutton/ImgTouchButton.tsx:39"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onafterrender",children:"onAfterRender()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onAfterRender"}),"(",(0,i.jsx)(n.code,{children:"node"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"A callback that is called after the component is rendered."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"node"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"VNode"})}),(0,i.jsx)(n.td,{children:"The component's VNode."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"DisplayComponent.onAfterRender"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:87"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onbeforerender",children:"onBeforeRender()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onBeforeRender"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"A callback that is called before the component is rendered."}),"\n",(0,i.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-6",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"DisplayComponent.onBeforeRender"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:80"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"render",children:"render()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"render"}),"(): ",(0,i.jsx)(n.code,{children:"VNode"})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"VNode"})}),"\n",(0,i.jsx)(n.h4,{id:"inherit-doc-1",children:"Inherit Doc"}),"\n",(0,i.jsx)(n.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"DisplayComponent.render"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/garminsdk/components/touchbutton/ImgTouchButton.tsx:53"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"renderimg",children:"renderImg()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.strong,{children:"renderImg"}),"(): ",(0,i.jsx)(n.code,{children:"null"})," | ",(0,i.jsx)(n.code,{children:"VNode"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Renders this button's image."}),"\n",(0,i.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"null"})," | ",(0,i.jsx)(n.code,{children:"VNode"})]}),"\n",(0,i.jsxs)(n.p,{children:["This button's rendered image, or ",(0,i.jsx)(n.code,{children:"null"})," if this button does not have an image."]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/garminsdk/components/touchbutton/ImgTouchButton.tsx:92"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"simulatepressed",children:"simulatePressed()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"simulatePressed"}),"(",(0,i.jsx)(n.code,{children:"ignoreDisabled"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["Simulates this button being pressed. This will execute the ",(0,i.jsx)(n.code,{children:"onPressed()"})," callback if one is defined."]}),"\n",(0,i.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Default value"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"ignoreDisabled"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"boolean"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"false"})}),(0,i.jsxs)(n.td,{children:["Whether to simulate the button being pressed regardless of whether the button is disabled. Defaults to ",(0,i.jsx)(n.code,{children:"false"}),"."]})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-9",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/garminsdk/components/touchbutton/ImgTouchButton.tsx:48"})]})}function x(e={}){let{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return c},a:function(){return t}});var d=s(667294);let i={},r=d.createContext(i);function t(e){let n=d.useContext(r);return d.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:t(e.components),d.createElement(r.Provider,{value:n},e.children)}}}]);