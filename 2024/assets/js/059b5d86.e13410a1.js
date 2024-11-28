"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["574255"],{998034:function(e,n,s){s.r(n),s.d(n,{metadata:()=>i,contentTitle:()=>t,default:()=>a,assets:()=>c,toc:()=>o,frontMatter:()=>l});var i=JSON.parse('{"id":"api/wt21fmc/classes/LegsPageController","title":"Class: LegsPageController","description":"LEGS PAGE Controller","source":"@site/docs/api/wt21fmc/classes/LegsPageController.md","sourceDirName":"api/wt21fmc/classes","slug":"/api/wt21fmc/classes/LegsPageController","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/LegsPageController","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"LegsPage","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/LegsPage"},"next":{"title":"LegsPageStore","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/LegsPageStore"}}'),r=s("785893"),d=s("250065");let l={},t="Class: LegsPageController",c={},o=[{value:"Constructors",id:"constructors",level:2},{value:"new LegsPageController()",id:"new-legspagecontroller",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"currentPage",id:"currentpage",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"isForHoldSelection",id:"isforholdselection",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"legsList",id:"legslist",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"lnavSequencing",id:"lnavsequencing",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"pageCount",id:"pagecount",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"ppos",id:"ppos",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"activeHeaderString",id:"activeheaderstring",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"discoAltitudeString",id:"discoaltitudestring",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"discoCourseString",id:"discocoursestring",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"discoIdentString",id:"discoidentstring",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"modHeaderString",id:"modheaderstring",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"init()",id:"init",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"insertCurrentFplnHoldFacility()",id:"insertcurrentfplnholdfacility",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"isFmcPageInDirectToExistingState()",id:"isfmcpageindirecttoexistingstate",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"renderPageRows()",id:"renderpagerows",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"renderRow()",id:"renderrow",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"setDirectToCourse()",id:"setdirecttocourse",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-18",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"class-legspagecontroller",children:"Class: LegsPageController"})}),"\n",(0,r.jsx)(n.p,{children:"LEGS PAGE Controller"}),"\n",(0,r.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(n.h3,{id:"new-legspagecontroller",children:"new LegsPageController()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"new LegsPageController"}),"(",(0,r.jsx)(n.code,{children:"eventBus"}),", ",(0,r.jsx)(n.code,{children:"fms"}),", ",(0,r.jsx)(n.code,{children:"store"}),", ",(0,r.jsx)(n.code,{children:"page"}),"): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/LegsPageController",children:(0,r.jsx)(n.code,{children:"LegsPageController"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Creates the Controller."}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"eventBus"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"EventBus"})}),(0,r.jsx)(n.td,{children:"The event bus"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"fms"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/WT21Fms",children:(0,r.jsx)(n.code,{children:"WT21Fms"})})}),(0,r.jsx)(n.td,{children:"The Fms"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"store"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/LegsPageStore",children:(0,r.jsx)(n.code,{children:"LegsPageStore"})})}),(0,r.jsx)(n.td,{children:"The Store"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"page"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/WT21FmcPage",children:(0,r.jsx)(n.code,{children:"WT21FmcPage"})}),"<",(0,r.jsx)(n.code,{children:"null"}),">"]}),(0,r.jsx)(n.td,{children:"The FMC Page"})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/LegsPageController",children:(0,r.jsx)(n.code,{children:"LegsPageController"})})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:174"}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"currentpage",children:"currentPage"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"currentPage"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:30"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"isforholdselection",children:"isForHoldSelection"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"isForHoldSelection"}),": ",(0,r.jsx)(n.code,{children:"boolean"})," = ",(0,r.jsx)(n.code,{children:"false"})]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:22"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"legslist",children:"legsList"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"legsList"}),": ",(0,r.jsx)(n.code,{children:"FmcListUtility"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/LegPageItem",children:(0,r.jsx)(n.code,{children:"LegPageItem"})}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:163"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"lnavsequencing",children:"lnavSequencing"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"lnavSequencing"}),": ",(0,r.jsx)(n.code,{children:"boolean"})," = ",(0,r.jsx)(n.code,{children:"true"})]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:50"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"pagecount",children:"pageCount"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"pageCount"}),": ",(0,r.jsx)(n.code,{children:"ComputedSubject"}),"<",(0,r.jsx)(n.code,{children:"number"}),", ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:31"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"ppos",children:"ppos"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"ppos"}),": ",(0,r.jsx)(n.code,{children:"ConsumerSubject"}),"<",(0,r.jsx)(n.code,{children:"LatLongAlt"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:52"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"activeheaderstring",children:"activeHeaderString"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.code,{children:"static"})," ",(0,r.jsx)(n.strong,{children:"activeHeaderString"}),": ",(0,r.jsx)(n.code,{children:'" ACT LEGS[blue]"'})," = ",(0,r.jsx)(n.code,{children:"' ACT LEGS[blue]'"})]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:27"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"discoaltitudestring",children:"discoAltitudeString"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.code,{children:"static"})," ",(0,r.jsx)(n.strong,{children:"discoAltitudeString"}),": ",(0,r.jsx)(n.code,{children:'"- DISCONTINUITY - "'})," = ",(0,r.jsx)(n.code,{children:"'- DISCONTINUITY - '"})]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:25"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"discocoursestring",children:"discoCourseString"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.code,{children:"static"})," ",(0,r.jsx)(n.strong,{children:"discoCourseString"}),": ",(0,r.jsx)(n.code,{children:'" THEN"'})," = ",(0,r.jsx)(n.code,{children:"' THEN'"})]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:26"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"discoidentstring",children:"discoIdentString"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.code,{children:"static"})," ",(0,r.jsx)(n.strong,{children:"discoIdentString"}),": ",(0,r.jsx)(n.code,{children:'"\u25A1\u25A1\u25A1\u25A1\u25A1"'})," = ",(0,r.jsx)(n.code,{children:"'\u25A1\u25A1\u25A1\u25A1\u25A1'"})]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:24"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"modheaderstring",children:"modHeaderString"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.code,{children:"static"})," ",(0,r.jsx)(n.strong,{children:"modHeaderString"}),": ",(0,r.jsx)(n.code,{children:'" MOD[white] LEGS[blue]"'})," = ",(0,r.jsx)(n.code,{children:"' MOD[white] LEGS[blue]'"})]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:28"}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"destroy"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Destroys the Controller."}),"\n",(0,r.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:212"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"init",children:"init()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"init"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Initializes the Controller"}),"\n",(0,r.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:184"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"insertcurrentfplnholdfacility",children:"insertCurrentFplnHoldFacility()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"insertCurrentFplnHoldFacility"}),"(): ",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Inserts a flight plan hold based on the HOLD AT facility being the parent leg already present in the flight plan"}),"\n",(0,r.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"})]}),"\n",(0,r.jsx)(n.p,{children:"the index of the inserted hold leg"}),"\n",(0,r.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,r.jsx)(n.p,{children:"if an error occurs during the process"}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:467"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"isfmcpageindirecttoexistingstate",children:"isFmcPageInDirectToExistingState()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"isFmcPageInDirectToExistingState"}),"(): ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Checks if we are in a Direct To Existing state for ACT plan, or MOD when plan is in MOD."}),"\n",(0,r.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"boolean"})}),"\n",(0,r.jsx)(n.p,{children:"Whether we are in a Direct To Existing state for ACT plan, or MOD when plan is in MOD."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:809"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"renderpagerows",children:"renderPageRows()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"renderPageRows"}),"(): ",(0,r.jsx)(n.code,{children:"FmcRenderTemplate"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Renders the Page"}),"\n",(0,r.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"FmcRenderTemplate"})}),"\n",(0,r.jsx)(n.p,{children:"The FmcRenderTemplate"}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:339"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"renderrow",children:"renderRow()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"renderRow"}),"(",(0,r.jsx)(n.code,{children:"page"}),", ",(0,r.jsx)(n.code,{children:"indexInDisplay"}),", ",(0,r.jsx)(n.code,{children:"prevData"}),", ",(0,r.jsx)(n.code,{children:"data"}),", ",(0,r.jsx)(n.code,{children:"nextData"}),"?): ",(0,r.jsx)(n.code,{children:"FmcRenderTemplateRow"}),"[]"]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"page"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"AbstractFmcPage"}),"<",(0,r.jsx)(n.code,{children:"any"}),">"]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"indexInDisplay"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"prevData"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"undefined"})," | ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/LegPageItem",children:(0,r.jsx)(n.code,{children:"LegPageItem"})})]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"data"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"undefined"})," | ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/LegPageItem",children:(0,r.jsx)(n.code,{children:"LegPageItem"})})]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"nextData"}),"?"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/LegPageItem",children:(0,r.jsx)(n.code,{children:"LegPageItem"})})})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"FmcRenderTemplateRow"}),"[]"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:54"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"setdirecttocourse",children:"setDirectToCourse()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"setDirectToCourse"}),"(",(0,r.jsx)(n.code,{children:"modPlan"}),", ",(0,r.jsx)(n.code,{children:"newCourse"}),"): ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Sets the Direct To INTC CRS."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"modPlan"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"FlightPlan"})}),(0,r.jsx)(n.td,{children:"The MOD Flight Plan."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"newCourse"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})}),(0,r.jsx)(n.td,{children:"The scratchpad contents"})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"boolean"})}),"\n",(0,r.jsx)(n.p,{children:"whether this was successfully completed."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Pages/LegsPageController.ts:906"})]})}function a(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return t},a:function(){return l}});var i=s(667294);let r={},d=i.createContext(r);function l(e){let n=i.useContext(d);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),i.createElement(d.Provider,{value:n},e.children)}}}]);