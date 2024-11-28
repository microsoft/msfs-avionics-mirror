"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["643272"],{923599:function(e,n,i){i.r(n),i.d(n,{metadata:()=>s,contentTitle:()=>l,default:()=>a,assets:()=>t,toc:()=>h,frontMatter:()=>c});var s=JSON.parse('{"id":"api/g1000common/classes/ViewService","title":"Class: abstract ViewService","description":"A service to manage views.","source":"@site/docs/api/g1000common/classes/ViewService.md","sourceDirName":"api/g1000common/classes","slug":"/api/g1000common/classes/ViewService","permalink":"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/ViewService","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"ViewMenu","permalink":"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/ViewMenu"},"next":{"title":"VNavAlertForwarder","permalink":"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/VNavAlertForwarder"}}'),r=i("785893"),d=i("250065");let c={},l="Class: abstract ViewService",t={},h=[{value:"Extended by",id:"extended-by",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new ViewService()",id:"new-viewservice",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"activeView",id:"activeview",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"activeViewKey",id:"activeviewkey",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"fmsEventMap",id:"fmseventmap",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"ignorePageHistory",id:"ignorepagehistory",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"openPage",id:"openpage",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"openPageKey",id:"openpagekey",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"pageHistory",id:"pagehistory",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"Methods",id:"methods",level:2},{value:"clearPageHistory()",id:"clearpagehistory",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"clearStack()",id:"clearstack",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"closeActiveView()",id:"closeactiveview",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"closeAllViews()",id:"closeallviews",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"getOpenViews()",id:"getopenviews",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"onInteractionEvent()",id:"oninteractionevent",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"open()",id:"open",level:3},{value:"Type Parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"openLastPage()",id:"openlastpage",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"registerView()",id:"registerview",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"routeInteractionEventToViews()",id:"routeinteractioneventtoviews",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-10",level:4},{value:"Defined in",id:"defined-in-18",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsxs)(n.h1,{id:"class-abstract-viewservice",children:["Class: ",(0,r.jsx)(n.code,{children:"abstract"})," ViewService"]})}),"\n",(0,r.jsx)(n.p,{children:"A service to manage views."}),"\n",(0,r.jsx)(n.h2,{id:"extended-by",children:"Extended by"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/MFDViewService",children:(0,r.jsx)(n.code,{children:"MFDViewService"})})}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/PFDViewService",children:(0,r.jsx)(n.code,{children:"PFDViewService"})})}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(n.h3,{id:"new-viewservice",children:"new ViewService()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"new ViewService"}),"(",(0,r.jsx)(n.code,{children:"bus"}),"): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/ViewService",children:(0,r.jsx)(n.code,{children:"ViewService"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Constructs the view service."}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"bus"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"EventBus"})}),(0,r.jsx)(n.td,{children:"The event bus."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/ViewService",children:(0,r.jsx)(n.code,{children:"ViewService"})})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:53"}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"activeview",children:"activeView"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"activeView"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/UiView",children:(0,r.jsx)(n.code,{children:"UiView"})}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/interfaces/UiViewProps",children:(0,r.jsx)(n.code,{children:"UiViewProps"})}),", ",(0,r.jsx)(n.code,{children:"any"}),", ",(0,r.jsx)(n.code,{children:"any"}),">>"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The currently active view."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:39"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"activeviewkey",children:"activeViewKey"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"activeViewKey"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The key of the currently active view."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:37"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"bus",children:"bus"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"protected"})," ",(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"bus"}),": ",(0,r.jsx)(n.code,{children:"EventBus"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The event bus."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:53"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"fmseventmap",children:"fmsEventMap"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"protected"})," ",(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"fmsEventMap"}),": ",(0,r.jsx)(n.code,{children:"Map"}),"<",(0,r.jsx)(n.code,{children:"string"}),", ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/enumerations/FmsHEvent",children:(0,r.jsx)(n.code,{children:"FmsHEvent"})}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"override in child class"}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:45"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"ignorepagehistory",children:"ignorePageHistory"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"protected"})," ",(0,r.jsx)(n.strong,{children:"ignorePageHistory"}),": ",(0,r.jsx)(n.code,{children:"boolean"})," = ",(0,r.jsx)(n.code,{children:"false"})]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:42"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"openpage",children:"openPage"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"openPage"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/UiPage",children:(0,r.jsx)(n.code,{children:"UiPage"})}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/interfaces/UiPageProps",children:(0,r.jsx)(n.code,{children:"UiPageProps"})}),">>"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The currently open page."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:33"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"openpagekey",children:"openPageKey"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"openPageKey"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The key of the currently open page."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:31"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"pagehistory",children:"pageHistory"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"protected"})," ",(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"pageHistory"}),": ",(0,r.jsx)(n.code,{children:"ViewEntry"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/UiView",children:(0,r.jsx)(n.code,{children:"UiView"})}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/interfaces/UiViewProps",children:(0,r.jsx)(n.code,{children:"UiViewProps"})}),", ",(0,r.jsx)(n.code,{children:"any"}),", ",(0,r.jsx)(n.code,{children:"any"}),">>[] = ",(0,r.jsx)(n.code,{children:"[]"})]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:41"}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"clearpagehistory",children:"clearPageHistory()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"clearPageHistory"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Clears this view service's page history."}),"\n",(0,r.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:237"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"clearstack",children:"clearStack()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"protected"})," ",(0,r.jsx)(n.strong,{children:"clearStack"}),"(",(0,r.jsx)(n.code,{children:"closePage"}),"): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Closes all open views and clears the stack."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"closePage"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"boolean"})}),(0,r.jsx)(n.td,{children:"Whether to close the currently open page, if one exists."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:259"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"closeactiveview",children:"closeActiveView()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"closeActiveView"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Closes the currently active view."}),"\n",(0,r.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:244"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"closeallviews",children:"closeAllViews()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"closeAllViews"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Closes all open views except for the currently open page, if one exists."}),"\n",(0,r.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:251"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"getopenviews",children:"getOpenViews()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"getOpenViews"}),"(): readonly ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/UiView",children:(0,r.jsx)(n.code,{children:"UiView"})}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/interfaces/UiViewProps",children:(0,r.jsx)(n.code,{children:"UiViewProps"})}),", ",(0,r.jsx)(n.code,{children:"any"}),", ",(0,r.jsx)(n.code,{children:"any"}),">[]"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Gets an array of all currently open views."}),"\n",(0,r.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:["readonly ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/UiView",children:(0,r.jsx)(n.code,{children:"UiView"})}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/interfaces/UiViewProps",children:(0,r.jsx)(n.code,{children:"UiViewProps"})}),", ",(0,r.jsx)(n.code,{children:"any"}),", ",(0,r.jsx)(n.code,{children:"any"}),">[]"]}),"\n",(0,r.jsx)(n.p,{children:"an array of all currently open views."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:96"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"oninteractionevent",children:"onInteractionEvent()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"protected"})," ",(0,r.jsx)(n.strong,{children:"onInteractionEvent"}),"(",(0,r.jsx)(n.code,{children:"hEvent"}),"): ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Routes the HEvents to the views."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"hEvent"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"string"})}),(0,r.jsx)(n.td,{children:"The event identifier."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"boolean"})}),"\n",(0,r.jsx)(n.p,{children:"whether the event was handled"}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:67"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"open",children:"open()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"open"}),"<",(0,r.jsx)(n.code,{children:"T"}),">(",(0,r.jsx)(n.code,{children:"type"}),", ",(0,r.jsx)(n.code,{children:"isSubView"}),"): ",(0,r.jsx)(n.code,{children:"T"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Opens a view. The opened view can be a page, regular view, or subview. Opening a page will close all other views,\nincluding the currently open page. Opening a regular view will close all other views except the currently open\npage. Opening a subview does not close any other views. The opened view will immediately become the active view,\nand the previously active view (if one exists) will be paused."}),"\n",(0,r.jsx)(n.h4,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Type Parameter"}),(0,r.jsx)(n.th,{children:"Default type"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"T"})," ",(0,r.jsx)(n.em,{children:"extends"})," ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/UiView",children:(0,r.jsx)(n.code,{children:"UiView"})}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/interfaces/UiViewProps",children:(0,r.jsx)(n.code,{children:"UiViewProps"})}),", ",(0,r.jsx)(n.code,{children:"any"}),", ",(0,r.jsx)(n.code,{children:"any"}),">"]}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/UiView",children:(0,r.jsx)(n.code,{children:"UiView"})}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/interfaces/UiViewProps",children:(0,r.jsx)(n.code,{children:"UiViewProps"})}),", ",(0,r.jsx)(n.code,{children:"any"}),", ",(0,r.jsx)(n.code,{children:"any"}),">"]})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Default value"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"type"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"string"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"undefined"})}),(0,r.jsx)(n.td,{children:"The type of the view to open."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"isSubView"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"boolean"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"false"})}),(0,r.jsx)(n.td,{children:"A boolean indicating if the view to be opened is a subview."})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"T"})}),"\n",(0,r.jsx)(n.p,{children:"The view that was opened."}),"\n",(0,r.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,r.jsx)(n.p,{children:"Error if the view type is not registered with this service."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:120"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"openlastpage",children:"openLastPage()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"openLastPage"}),"(): ",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/UiPage",children:(0,r.jsx)(n.code,{children:"UiPage"})}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/interfaces/UiPageProps",children:(0,r.jsx)(n.code,{children:"UiPageProps"})}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Opens the page that was most recently closed."}),"\n",(0,r.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/UiPage",children:(0,r.jsx)(n.code,{children:"UiPage"})}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/interfaces/UiPageProps",children:(0,r.jsx)(n.code,{children:"UiPageProps"})}),">"]}),"\n",(0,r.jsx)(n.p,{children:"The page that was opened."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:223"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"registerview",children:"registerView()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"registerView"}),"(",(0,r.jsx)(n.code,{children:"type"}),"?, ",(0,r.jsx)(n.code,{children:"vnodeFn"}),"?): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Registers a view with the service."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"type"}),"?"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"string"})}),(0,r.jsx)(n.td,{children:"The type of the view."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"vnodeFn"}),"?"]}),(0,r.jsxs)(n.td,{children:["() => ",(0,r.jsx)(n.code,{children:"VNode"})]}),(0,r.jsx)(n.td,{children:"A function creating the VNode."})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-9",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:105"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"routeinteractioneventtoviews",children:"routeInteractionEventToViews()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"protected"})," ",(0,r.jsx)(n.strong,{children:"routeInteractionEventToViews"}),"(",(0,r.jsx)(n.code,{children:"evt"}),"): ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Routes an interaction to the active view, and if it is not handled, re-routes the interaction to the currently\nopen page if it exists and is not the active view."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"evt"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/enumerations/FmsHEvent",children:(0,r.jsx)(n.code,{children:"FmsHEvent"})})}),(0,r.jsx)(n.td,{children:"An interaction event."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-10",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"boolean"})}),"\n",(0,r.jsx)(n.p,{children:"Whether the event was handled."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/ViewService.ts:84"})]})}function a(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(o,{...e})}):o(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return l},a:function(){return c}});var s=i(667294);let r={},d=s.createContext(r);function c(e){let n=s.useContext(d);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:c(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);