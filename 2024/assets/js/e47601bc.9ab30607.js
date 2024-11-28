"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["455910"],{740926:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>l,default:()=>a,assets:()=>o,toc:()=>h,frontMatter:()=>t});var r=JSON.parse('{"id":"api/g3xtouchcommon/classes/TabbedContainer","title":"Class: TabbedContainer","description":"A container which displays content organized into an arbitrary number of tabs. Only the content associated with one","source":"@site/docs/api/g3xtouchcommon/classes/TabbedContainer.md","sourceDirName":"api/g3xtouchcommon/classes","slug":"/api/g3xtouchcommon/classes/TabbedContainer","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/TabbedContainer","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"StatusBar","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/StatusBar"},"next":{"title":"TimeSetupView","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/TimeSetupView"}}'),d=i("785893"),s=i("250065");let t={},l="Class: TabbedContainer",o={},h=[{value:"Extends",id:"extends",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new TabbedContainer()",id:"new-tabbedcontainer",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context?",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"contextType?",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"knobLabelState",id:"knoblabelstate",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"Methods",id:"methods",level:2},{value:"close()",id:"close",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Inherit Doc",id:"inherit-doc",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"getContext()",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Throws",id:"throws-1",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"onAfterRender()",id:"onafterrender",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Inherit Doc",id:"inherit-doc-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"onBeforeRender()",id:"onbeforerender",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"onUiInteractionEvent()",id:"onuiinteractionevent",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"open()",id:"open",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Throws",id:"throws-2",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"pause()",id:"pause",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Throws",id:"throws-3",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"render()",id:"render",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Inherit Doc",id:"inherit-doc-2",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"resume()",id:"resume",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Throws",id:"throws-4",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"selectFirstTab()",id:"selectfirsttab",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Throws",id:"throws-5",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"selectLastTab()",id:"selectlasttab",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-12",level:4},{value:"Throws",id:"throws-6",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"selectNextTab()",id:"selectnexttab",level:3},{value:"Returns",id:"returns-13",level:4},{value:"Throws",id:"throws-7",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"selectPrevTab()",id:"selectprevtab",level:3},{value:"Returns",id:"returns-14",level:4},{value:"Throws",id:"throws-8",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"selectTabIndex()",id:"selecttabindex",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-15",level:4},{value:"Throws",id:"throws-9",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"update()",id:"update",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-16",level:4},{value:"Throws",id:"throws-10",level:4},{value:"Defined in",id:"defined-in-20",level:4}];function c(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"class-tabbedcontainer",children:"Class: TabbedContainer"})}),"\n",(0,d.jsx)(n.p,{children:"A container which displays content organized into an arbitrary number of tabs. Only the content associated with one\ntab is displayed at any given time. Tabs are displayed on one of the four edges of the container in a list which\nsupports scrolling if the total number of tabs exceeds the amount that can be displayed simultaneously."}),"\n",(0,d.jsxs)(n.p,{children:["The container's contents are added as children that implement the ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/TabbedContent",children:"TabbedContent"})," interface. It is forbidden\nto add children to TabbedContainer that do not implement TabbedContent. Each TabbedContent child defines one tab and\nits contents. The order in which tabs are presented in the container's tab list is the same as the order in which\ntheir associated TabbedContents were added to the container as children."]}),"\n",(0,d.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"DisplayComponent"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/TabbedContainerProps",children:(0,d.jsx)(n.code,{children:"TabbedContainerProps"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.h2,{id:"implements",children:"Implements"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsx)(n.li,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/UiInteractionHandler",children:(0,d.jsx)(n.code,{children:"UiInteractionHandler"})})}),"\n"]}),"\n",(0,d.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(n.h3,{id:"new-tabbedcontainer",children:"new TabbedContainer()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"new TabbedContainer"}),"(",(0,d.jsx)(n.code,{children:"props"}),"): ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/TabbedContainer",children:(0,d.jsx)(n.code,{children:"TabbedContainer"})})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Creates an instance of a DisplayComponent."}),"\n",(0,d.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"props"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/TabbedContainerProps",children:(0,d.jsx)(n.code,{children:"TabbedContainerProps"})})}),(0,d.jsx)(n.td,{children:"The propertis of the component."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/TabbedContainer",children:(0,d.jsx)(n.code,{children:"TabbedContainer"})})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"DisplayComponent<TabbedContainerProps>.constructor"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:73"}),"\n",(0,d.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(n.h3,{id:"context",children:"context?"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"optional"})," ",(0,d.jsx)(n.strong,{children:"context"}),": [] = ",(0,d.jsx)(n.code,{children:"undefined"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The context on this component, if any."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"DisplayComponent.context"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:64"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"contexttype",children:"contextType?"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.code,{children:"optional"})," ",(0,d.jsx)(n.strong,{children:"contextType"}),": readonly [] = ",(0,d.jsx)(n.code,{children:"undefined"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The type of context for this component, if any."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"DisplayComponent.contextType"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:67"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"knoblabelstate",children:"knobLabelState"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"knobLabelState"}),": ",(0,d.jsx)(n.code,{children:"SubscribableMap"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/enumerations/UiKnobId",children:(0,d.jsx)(n.code,{children:"UiKnobId"})}),", ",(0,d.jsx)(n.code,{children:"string"}),"> & ",(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/type-aliases/UiKnobRequestedLabelState",children:(0,d.jsx)(n.code,{children:"UiKnobRequestedLabelState"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The bezel rotary knob label state requested by this container."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:171"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"props",children:"props"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"props"}),": ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/TabbedContainerProps",children:(0,d.jsx)(n.code,{children:"TabbedContainerProps"})})," & ",(0,d.jsx)(n.code,{children:"ComponentProps"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The properties of the component."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"DisplayComponent.props"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:61"}),"\n",(0,d.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(n.h3,{id:"close",children:"close()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"close"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Closes this container. This will close the currently selected tab, if one exists. If the container is resumed,\nthen this will also pause the container before closing it."}),"\n",(0,d.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"Error if this container has been destroyed."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:316"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"destroy"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"DisplayComponent.destroy"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:849"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"getcontext",children:"getContext()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"getContext"}),"(",(0,d.jsx)(n.code,{children:"context"}),"): ",(0,d.jsx)(n.code,{children:"never"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Gets a context data subscription from the context collection."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"context"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"never"})}),(0,d.jsx)(n.td,{children:"The context to get the subscription for."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"never"})}),"\n",(0,d.jsx)(n.p,{children:"The requested context."}),"\n",(0,d.jsx)(n.h4,{id:"throws-1",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"An error if no data for the specified context type could be found."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"DisplayComponent.getContext"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:106"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onafterrender",children:"onAfterRender()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onAfterRender"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-1",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"DisplayComponent.onAfterRender"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:183"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onbeforerender",children:"onBeforeRender()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onBeforeRender"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"A callback that is called before the component is rendered."}),"\n",(0,d.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"DisplayComponent.onBeforeRender"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:80"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onuiinteractionevent",children:"onUiInteractionEvent()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onUiInteractionEvent"}),"(",(0,d.jsx)(n.code,{children:"event"}),"): ",(0,d.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsxs)(n.p,{children:["Handles a ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/enumerations/UiInteractionEvent",children:"UiInteractionEvent"}),"."]}),"\n",(0,d.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"event"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/enumerations/UiInteractionEvent",children:(0,d.jsx)(n.code,{children:"UiInteractionEvent"})})}),(0,d.jsx)(n.td,{children:"The event to handle."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"boolean"})}),"\n",(0,d.jsx)(n.p,{children:"Whether the event was handled."}),"\n",(0,d.jsx)(n.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/UiInteractionHandler",children:(0,d.jsx)(n.code,{children:"UiInteractionHandler"})}),".",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/UiInteractionHandler#onuiinteractionevent",children:(0,d.jsx)(n.code,{children:"onUiInteractionEvent"})})]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:595"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"open",children:"open()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"open"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Opens this container. This will open the currently selected tab, if one exists. While open, this container can\nbe updated."}),"\n",(0,d.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"throws-2",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"Error if this container has been destroyed."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:290"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"pause",children:"pause()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"pause"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Pauses this container. This will pause the currently selected tab, if one exists."}),"\n",(0,d.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"throws-3",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"Error if this container has been destroyed."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:377"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"render",children:"render()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"render"}),"(): ",(0,d.jsx)(n.code,{children:"VNode"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"returns-9",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"VNode"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-2",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-2",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"DisplayComponent.render"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:713"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"resume",children:"resume()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"resume"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Resumes this container. This will resume the currently selected tab, if one exists. If the container is closed,\nthen this will also open the container before resuming it. While resumed, the container will forward requested\nbezel rotary knob label states from the selected tab and handle UI interaction events (including routing events\nto the selected tab)."}),"\n",(0,d.jsx)(n.h4,{id:"returns-10",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"throws-4",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"Error if this container has been destroyed."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:346"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"selectfirsttab",children:"selectFirstTab()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"selectFirstTab"}),"(",(0,d.jsx)(n.code,{children:"startIndex"}),"): ",(0,d.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Selects the lowest-indexed enabled tab. Tabs are indexed in the order in which they were added to this container\nas children."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Default value"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"startIndex"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"0"})}),(0,d.jsxs)(n.td,{children:["The index from which to start the search for enabled tabs to select. Defaults to ",(0,d.jsx)(n.code,{children:"0"}),"."]})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-11",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"number"})}),"\n",(0,d.jsxs)(n.p,{children:["The index of the selected tab, or ",(0,d.jsx)(n.code,{children:"-1"})," if there were no enabled tabs to select."]}),"\n",(0,d.jsx)(n.h4,{id:"throws-5",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"Error if this container has been destroyed or has not been rendered."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:546"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"selectlasttab",children:"selectLastTab()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"selectLastTab"}),"(",(0,d.jsx)(n.code,{children:"startIndex"}),"): ",(0,d.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Selects the highest-indexed enabled tab. Tabs are indexed in the order in which they were added to this container\nas children."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"startIndex"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The index from which to start the search for enabled tabs to select. Defaults to the index of this container's highest-indexed tab."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-12",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"number"})}),"\n",(0,d.jsxs)(n.p,{children:["The index of the selected tab, or ",(0,d.jsx)(n.code,{children:"-1"})," if there were no enabled tabs to select."]}),"\n",(0,d.jsx)(n.h4,{id:"throws-6",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"Error if this container has been destroyed or has not been rendered."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:574"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"selectnexttab",children:"selectNextTab()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"selectNextTab"}),"(): ",(0,d.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Selects the lowest-indexed enabled tab with a higher index than the currently selected tab. If there is no\ncurrently selected tab, then selects the overall lowest-indexed enabled tab. Tabs are indexed in the order in\nwhich they were added to this container as children."}),"\n",(0,d.jsx)(n.h4,{id:"returns-13",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"number"})}),"\n",(0,d.jsxs)(n.p,{children:["The index of the selected tab, or ",(0,d.jsx)(n.code,{children:"-1"})," if there were no enabled tabs to select."]}),"\n",(0,d.jsx)(n.h4,{id:"throws-7",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"Error if this container has been destroyed or has not been rendered."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:508"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"selectprevtab",children:"selectPrevTab()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"selectPrevTab"}),"(): ",(0,d.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Selects the highest-indexed enabled tab with a lower index than the currently selected tab. If there is no\ncurrently selected tab, then selects the overall highest-indexed enabled tab. Tabs are indexed in the order in\nwhich they were added to this container as children."}),"\n",(0,d.jsx)(n.h4,{id:"returns-14",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"number"})}),"\n",(0,d.jsxs)(n.p,{children:["The index of the selected tab, or ",(0,d.jsx)(n.code,{children:"-1"})," if there were no enabled tabs to select."]}),"\n",(0,d.jsx)(n.h4,{id:"throws-8",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"Error if this container has been destroyed or has not been rendered."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:527"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"selecttabindex",children:"selectTabIndex()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"selectTabIndex"}),"(",(0,d.jsx)(n.code,{children:"index"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Selects a tab by index. Tabs are indexed in the order in which they were added to this container as children."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"index"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsxs)(n.td,{children:["The index of the tab to select, or ",(0,d.jsx)(n.code,{children:"-1"})," to deselect the currently selected tab without selecting a new tab."]})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-15",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"throws-9",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"Error if this container has been destroyed or has not been rendered."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-19",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:428"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"update",children:"update()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"update"}),"(",(0,d.jsx)(n.code,{children:"time"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Updates this container. This will update the currently selected tab, if one exists. If this container is closed,\nthen this method does nothing."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-6",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"time"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The current real (operating system) time, as a Javascript timestamp."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-16",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"throws-10",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"Error if this container has been destroyed."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-20",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TabbedContainer/TabbedContainer.tsx:407"})]})}function a(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(c,{...e})}):c(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return l},a:function(){return t}});var r=i(667294);let d={},s=r.createContext(d);function t(e){let n=r.useContext(s);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:t(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);