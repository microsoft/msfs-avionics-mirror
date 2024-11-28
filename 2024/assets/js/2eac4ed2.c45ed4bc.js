"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["823758"],{757833:function(e,r,n){n.r(r),n.d(r,{metadata:()=>i,contentTitle:()=>t,default:()=>a,assets:()=>l,toc:()=>o,frontMatter:()=>c});var i=JSON.parse('{"id":"api/g1000common/classes/MFDSelectDepartureStore","title":"Class: MFDSelectDepartureStore","description":"A data store for the MFD departure selection component.","source":"@site/docs/api/g1000common/classes/MFDSelectDepartureStore.md","sourceDirName":"api/g1000common/classes","slug":"/api/g1000common/classes/MFDSelectDepartureStore","permalink":"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/MFDSelectDepartureStore","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"MFDSelectDepartureController","permalink":"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/MFDSelectDepartureController"},"next":{"title":"MFDSelectProcedurePage","permalink":"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/MFDSelectProcedurePage"}}'),d=n("785893"),s=n("250065");let c={},t="Class: MFDSelectDepartureStore",l={},o=[{value:"Extends",id:"extends",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new MFDSelectDepartureStore()",id:"new-mfdselectdeparturestore",level:3},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"_procedures",id:"_procedures",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"previewPlan",id:"previewplan",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"procedures",id:"procedures",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"runways",id:"runways",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"selectedFacility",id:"selectedfacility",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"selectedProcedure",id:"selectedprocedure",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"selectedProcIndex",id:"selectedprocindex",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"selectedRwyTransIndex",id:"selectedrwytransindex",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"selectedTransIndex",id:"selectedtransindex",level:3},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"sequence",id:"sequence",level:3},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"transitionPreviewPlan",id:"transitionpreviewplan",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"transitions",id:"transitions",level:3},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"Methods",id:"methods",level:2},{value:"getOneWayRunway()",id:"getonewayrunway",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"getProcedures()",id:"getprocedures",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"getRunways()",id:"getrunways",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"getRunwayString()",id:"getrunwaystring",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"getTransitionName()",id:"gettransitionname",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-16",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"getTransitions()",id:"gettransitions",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-17",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"onSelectedFacilityChanged()",id:"onselectedfacilitychanged",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-18",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"onSelectedProcedureChanged()",id:"onselectedprocedurechanged",level:3},{value:"Parameters",id:"parameters-7",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-19",level:4},{value:"Defined in",id:"defined-in-20",level:4}];function h(e){let r={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(r.header,{children:(0,d.jsx)(r.h1,{id:"class-mfdselectdeparturestore",children:"Class: MFDSelectDepartureStore"})}),"\n",(0,d.jsx)(r.p,{children:"A data store for the MFD departure selection component."}),"\n",(0,d.jsx)(r.h2,{id:"extends",children:"Extends"}),"\n",(0,d.jsxs)(r.ul,{children:["\n",(0,d.jsx)(r.li,{children:(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})})}),"\n"]}),"\n",(0,d.jsx)(r.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(r.h3,{id:"new-mfdselectdeparturestore",children:"new MFDSelectDepartureStore()"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.strong,{children:"new MFDSelectDepartureStore"}),"(): ",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/MFDSelectDepartureStore",children:(0,d.jsx)(r.code,{children:"MFDSelectDepartureStore"})})]}),"\n"]}),"\n",(0,d.jsx)(r.p,{children:"Constructor."}),"\n",(0,d.jsx)(r.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(r.p,{children:(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/MFDSelectDepartureStore",children:(0,d.jsx)(r.code,{children:"MFDSelectDepartureStore"})})}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#constructors",children:(0,d.jsx)(r.code,{children:"constructor"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/SelectProcedureStore.ts:19"}),"\n",(0,d.jsx)(r.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(r.h3,{id:"_procedures",children:"_procedures"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"protected"})," ",(0,d.jsx)(r.code,{children:"readonly"})," ",(0,d.jsx)(r.strong,{children:"_procedures"}),": ",(0,d.jsx)(r.code,{children:"ArraySubject"}),"<",(0,d.jsx)(r.code,{children:"Procedure"}),">"]}),"\n"]}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#_procedures",children:(0,d.jsx)(r.code,{children:"_procedures"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/SelectProcedureStore.ts:9"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"previewplan",children:"previewPlan"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"readonly"})," ",(0,d.jsx)(r.strong,{children:"previewPlan"}),": ",(0,d.jsx)(r.code,{children:"Subject"}),"<",(0,d.jsx)(r.code,{children:"null"})," | ",(0,d.jsx)(r.code,{children:"FlightPlan"}),">"]}),"\n"]}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#previewplan",children:(0,d.jsx)(r.code,{children:"previewPlan"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/SelectProcedureStore.ts:14"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"procedures",children:"procedures"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"readonly"})," ",(0,d.jsx)(r.strong,{children:"procedures"}),": ",(0,d.jsx)(r.code,{children:"SubscribableArray"}),"<",(0,d.jsx)(r.code,{children:"Procedure"}),">"]}),"\n"]}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#procedures",children:(0,d.jsx)(r.code,{children:"procedures"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/SelectProcedureStore.ts:10"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"runways",children:"runways"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"readonly"})," ",(0,d.jsx)(r.strong,{children:"runways"}),": ",(0,d.jsx)(r.code,{children:"ArraySubject"}),"<",(0,d.jsx)(r.code,{children:"RunwayTransition"}),">"]}),"\n"]}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#runways",children:(0,d.jsx)(r.code,{children:"runways"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/DepArr/SelectDepArrStore.ts:15"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"selectedfacility",children:"selectedFacility"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"readonly"})," ",(0,d.jsx)(r.strong,{children:"selectedFacility"}),": ",(0,d.jsx)(r.code,{children:"Subject"}),"<",(0,d.jsx)(r.code,{children:"undefined"})," | ",(0,d.jsx)(r.code,{children:"AirportFacility"}),">"]}),"\n"]}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#selectedfacility",children:(0,d.jsx)(r.code,{children:"selectedFacility"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/SelectProcedureStore.ts:7"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"selectedprocedure",children:"selectedProcedure"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"readonly"})," ",(0,d.jsx)(r.strong,{children:"selectedProcedure"}),": ",(0,d.jsx)(r.code,{children:"Subject"}),"<",(0,d.jsx)(r.code,{children:"undefined"})," | ",(0,d.jsx)(r.code,{children:"Procedure"}),">"]}),"\n"]}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-6",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#selectedprocedure",children:(0,d.jsx)(r.code,{children:"selectedProcedure"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/SelectProcedureStore.ts:12"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"selectedprocindex",children:"selectedProcIndex"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"readonly"})," ",(0,d.jsx)(r.strong,{children:"selectedProcIndex"}),": ",(0,d.jsx)(r.code,{children:"Subject"}),"<",(0,d.jsx)(r.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-7",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#selectedprocindex",children:(0,d.jsx)(r.code,{children:"selectedProcIndex"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/DepArr/SelectDepArrStore.ts:11"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"selectedrwytransindex",children:"selectedRwyTransIndex"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"readonly"})," ",(0,d.jsx)(r.strong,{children:"selectedRwyTransIndex"}),": ",(0,d.jsx)(r.code,{children:"Subject"}),"<",(0,d.jsx)(r.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-8",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#selectedrwytransindex",children:(0,d.jsx)(r.code,{children:"selectedRwyTransIndex"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/DepArr/SelectDepArrStore.ts:12"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"selectedtransindex",children:"selectedTransIndex"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"readonly"})," ",(0,d.jsx)(r.strong,{children:"selectedTransIndex"}),": ",(0,d.jsx)(r.code,{children:"Subject"}),"<",(0,d.jsx)(r.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-9",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#selectedtransindex",children:(0,d.jsx)(r.code,{children:"selectedTransIndex"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/DepArr/SelectDepArrStore.ts:13"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"sequence",children:"sequence"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"readonly"})," ",(0,d.jsx)(r.strong,{children:"sequence"}),": ",(0,d.jsx)(r.code,{children:"ArraySubject"}),"<",(0,d.jsx)(r.code,{children:"Subject"}),"<",(0,d.jsx)(r.code,{children:"LegDefinition"}),">>"]}),"\n"]}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-10",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#sequence",children:(0,d.jsx)(r.code,{children:"sequence"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/SelectProcedureStore.ts:16"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"transitionpreviewplan",children:"transitionPreviewPlan"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"readonly"})," ",(0,d.jsx)(r.strong,{children:"transitionPreviewPlan"}),": ",(0,d.jsx)(r.code,{children:"Subject"}),"<",(0,d.jsx)(r.code,{children:"null"})," | ",(0,d.jsx)(r.code,{children:"FlightPlan"}),">"]}),"\n"]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/MFD/Components/UI/Procedure/DepArr/MFDSelectDepartureStore.ts:9"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"transitions",children:"transitions"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"readonly"})," ",(0,d.jsx)(r.strong,{children:"transitions"}),": ",(0,d.jsx)(r.code,{children:"ArraySubject"}),"<",(0,d.jsx)(r.code,{children:"EnrouteTransition"}),">"]}),"\n"]}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-11",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#transitions",children:(0,d.jsx)(r.code,{children:"transitions"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/DepArr/SelectDepArrStore.ts:16"}),"\n",(0,d.jsx)(r.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(r.h3,{id:"getonewayrunway",children:"getOneWayRunway()"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.strong,{children:"getOneWayRunway"}),"(",(0,d.jsx)(r.code,{children:"airport"}),", ",(0,d.jsx)(r.code,{children:"procedure"}),", ",(0,d.jsx)(r.code,{children:"rwyTransIndex"}),"): ",(0,d.jsx)(r.code,{children:"undefined"})," | ",(0,d.jsx)(r.code,{children:"OneWayRunway"})]}),"\n"]}),"\n",(0,d.jsx)(r.p,{children:"Gets the one-way runway of a procedure runway transition."}),"\n",(0,d.jsx)(r.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(r.table,{children:[(0,d.jsx)(r.thead,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.th,{children:"Parameter"}),(0,d.jsx)(r.th,{children:"Type"}),(0,d.jsx)(r.th,{children:"Description"})]})}),(0,d.jsxs)(r.tbody,{children:[(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"airport"})}),(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"AirportFacility"})}),(0,d.jsx)(r.td,{children:"The airport of the procedure for which to get the runway."})]}),(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"procedure"})}),(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"Procedure"})}),(0,d.jsx)(r.td,{children:"A procedure for which to get the runway."})]}),(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"rwyTransIndex"})}),(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"number"})}),(0,d.jsx)(r.td,{children:"The index of the runway transition for which to get the runway."})]})]})]}),"\n",(0,d.jsx)(r.h4,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"undefined"})," | ",(0,d.jsx)(r.code,{children:"OneWayRunway"})]}),"\n",(0,d.jsx)(r.p,{children:"The one-way runway of the specified procedure runway transition, or undefined if there is no such runway."}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-12",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#getonewayrunway",children:(0,d.jsx)(r.code,{children:"getOneWayRunway"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/DepArr/SelectDepArrStore.ts:44"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"getprocedures",children:"getProcedures()"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"protected"})," ",(0,d.jsx)(r.strong,{children:"getProcedures"}),"(",(0,d.jsx)(r.code,{children:"airport"}),"): readonly ",(0,d.jsx)(r.code,{children:"Procedure"}),"[]"]}),"\n"]}),"\n",(0,d.jsx)(r.p,{children:"Gets the procedures array from an airport."}),"\n",(0,d.jsx)(r.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(r.table,{children:[(0,d.jsx)(r.thead,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.th,{children:"Parameter"}),(0,d.jsx)(r.th,{children:"Type"}),(0,d.jsx)(r.th,{children:"Description"})]})}),(0,d.jsx)(r.tbody,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"airport"})}),(0,d.jsxs)(r.td,{children:[(0,d.jsx)(r.code,{children:"undefined"})," | ",(0,d.jsx)(r.code,{children:"AirportFacility"})]}),(0,d.jsx)(r.td,{children:"An airport facility."})]})})]}),"\n",(0,d.jsx)(r.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsxs)(r.p,{children:["readonly ",(0,d.jsx)(r.code,{children:"Procedure"}),"[]"]}),"\n",(0,d.jsx)(r.p,{children:"The procedures array from the specified airport."}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-13",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#getprocedures",children:(0,d.jsx)(r.code,{children:"getProcedures"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/DepArr/SelectDepartureStore.ts:11"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"getrunways",children:"getRunways()"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"protected"})," ",(0,d.jsx)(r.strong,{children:"getRunways"}),"(",(0,d.jsx)(r.code,{children:"procedure"}),"): readonly ",(0,d.jsx)(r.code,{children:"RunwayTransition"}),"[]"]}),"\n"]}),"\n",(0,d.jsx)(r.p,{children:"Gets the runway transitions of a procedure."}),"\n",(0,d.jsx)(r.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(r.table,{children:[(0,d.jsx)(r.thead,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.th,{children:"Parameter"}),(0,d.jsx)(r.th,{children:"Type"}),(0,d.jsx)(r.th,{children:"Description"})]})}),(0,d.jsx)(r.tbody,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"procedure"})}),(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"Procedure"})}),(0,d.jsx)(r.td,{children:"A procedure."})]})})]}),"\n",(0,d.jsx)(r.h4,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsxs)(r.p,{children:["readonly ",(0,d.jsx)(r.code,{children:"RunwayTransition"}),"[]"]}),"\n",(0,d.jsx)(r.p,{children:"The runway transitions of the procedure."}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-14",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#getrunways",children:(0,d.jsx)(r.code,{children:"getRunways"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/DepArr/SelectDepArrStore.ts:70"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"getrunwaystring",children:"getRunwayString()"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.strong,{children:"getRunwayString"}),"(",(0,d.jsx)(r.code,{children:"runwayTransition"}),"): ",(0,d.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,d.jsx)(r.p,{children:"Gets a runway designation string from a runway transition."}),"\n",(0,d.jsx)(r.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(r.table,{children:[(0,d.jsx)(r.thead,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.th,{children:"Parameter"}),(0,d.jsx)(r.th,{children:"Type"}),(0,d.jsx)(r.th,{children:"Description"})]})}),(0,d.jsx)(r.tbody,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"runwayTransition"})}),(0,d.jsxs)(r.td,{children:[(0,d.jsx)(r.code,{children:"undefined"})," | ",(0,d.jsx)(r.code,{children:"RunwayTransition"})]}),(0,d.jsx)(r.td,{children:"A runway transition."})]})})]}),"\n",(0,d.jsx)(r.h4,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsx)(r.p,{children:(0,d.jsx)(r.code,{children:"string"})}),"\n",(0,d.jsx)(r.p,{children:"The runway designation string of the runway transition."}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-15",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#getrunwaystring",children:(0,d.jsx)(r.code,{children:"getRunwayString"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/DepArr/SelectDepArrStore.ts:58"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"gettransitionname",children:"getTransitionName()"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.strong,{children:"getTransitionName"}),"(",(0,d.jsx)(r.code,{children:"procedure"}),", ",(0,d.jsx)(r.code,{children:"transitionIndex"}),", ",(0,d.jsx)(r.code,{children:"rwyTransitionIndex"}),"): ",(0,d.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,d.jsx)(r.p,{children:"Gets the transition name and creates a default transition when the procedure has no transitions."}),"\n",(0,d.jsx)(r.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(r.table,{children:[(0,d.jsx)(r.thead,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.th,{children:"Parameter"}),(0,d.jsx)(r.th,{children:"Type"}),(0,d.jsx)(r.th,{children:"Description"})]})}),(0,d.jsxs)(r.tbody,{children:[(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"procedure"})}),(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"Procedure"})}),(0,d.jsx)(r.td,{children:"-"})]}),(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"transitionIndex"})}),(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"number"})}),(0,d.jsx)(r.td,{children:"is the index of the transition in the procedure"})]}),(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"rwyTransitionIndex"})}),(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"number"})}),(0,d.jsx)(r.td,{children:"-"})]})]})]}),"\n",(0,d.jsx)(r.h4,{id:"returns-5",children:"Returns"}),"\n",(0,d.jsx)(r.p,{children:(0,d.jsx)(r.code,{children:"string"})}),"\n",(0,d.jsx)(r.p,{children:"The transition name string."}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-16",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#gettransitionname",children:(0,d.jsx)(r.code,{children:"getTransitionName"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/DepArr/SelectDepartureStore.ts:16"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"gettransitions",children:"getTransitions()"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"protected"})," ",(0,d.jsx)(r.strong,{children:"getTransitions"}),"(",(0,d.jsx)(r.code,{children:"procedure"}),"): readonly ",(0,d.jsx)(r.code,{children:"EnrouteTransition"}),"[]"]}),"\n"]}),"\n",(0,d.jsx)(r.p,{children:"Gets the enroute transitions of a procedure."}),"\n",(0,d.jsx)(r.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(r.table,{children:[(0,d.jsx)(r.thead,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.th,{children:"Parameter"}),(0,d.jsx)(r.th,{children:"Type"}),(0,d.jsx)(r.th,{children:"Description"})]})}),(0,d.jsx)(r.tbody,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"procedure"})}),(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"Procedure"})}),(0,d.jsx)(r.td,{children:"A procedure."})]})})]}),"\n",(0,d.jsx)(r.h4,{id:"returns-6",children:"Returns"}),"\n",(0,d.jsxs)(r.p,{children:["readonly ",(0,d.jsx)(r.code,{children:"EnrouteTransition"}),"[]"]}),"\n",(0,d.jsx)(r.p,{children:"The enroute transitions of the procedure."}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-17",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#gettransitions",children:(0,d.jsx)(r.code,{children:"getTransitions"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/DepArr/SelectDepArrStore.ts:79"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"onselectedfacilitychanged",children:"onSelectedFacilityChanged()"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"protected"})," ",(0,d.jsx)(r.strong,{children:"onSelectedFacilityChanged"}),"(",(0,d.jsx)(r.code,{children:"facility"}),"): ",(0,d.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(r.p,{children:"Responds to changes in the selected airport facility."}),"\n",(0,d.jsx)(r.h4,{id:"parameters-6",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(r.table,{children:[(0,d.jsx)(r.thead,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.th,{children:"Parameter"}),(0,d.jsx)(r.th,{children:"Type"}),(0,d.jsx)(r.th,{children:"Description"})]})}),(0,d.jsx)(r.tbody,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"facility"})}),(0,d.jsxs)(r.td,{children:[(0,d.jsx)(r.code,{children:"undefined"})," | ",(0,d.jsx)(r.code,{children:"AirportFacility"})]}),(0,d.jsx)(r.td,{children:"The selected airport facility."})]})})]}),"\n",(0,d.jsx)(r.h4,{id:"returns-7",children:"Returns"}),"\n",(0,d.jsx)(r.p,{children:(0,d.jsx)(r.code,{children:"void"})}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-18",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#onselectedfacilitychanged",children:(0,d.jsx)(r.code,{children:"onSelectedFacilityChanged"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-19",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/DepArr/SelectDepArrStore.ts:19"}),"\n",(0,d.jsx)(r.hr,{}),"\n",(0,d.jsx)(r.h3,{id:"onselectedprocedurechanged",children:"onSelectedProcedureChanged()"}),"\n",(0,d.jsxs)(r.blockquote,{children:["\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.code,{children:"protected"})," ",(0,d.jsx)(r.strong,{children:"onSelectedProcedureChanged"}),"(",(0,d.jsx)(r.code,{children:"proc"}),"): ",(0,d.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(r.p,{children:"Responds to changes in the selected procedure."}),"\n",(0,d.jsx)(r.h4,{id:"parameters-7",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(r.table,{children:[(0,d.jsx)(r.thead,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.th,{children:"Parameter"}),(0,d.jsx)(r.th,{children:"Type"}),(0,d.jsx)(r.th,{children:"Description"})]})}),(0,d.jsx)(r.tbody,{children:(0,d.jsxs)(r.tr,{children:[(0,d.jsx)(r.td,{children:(0,d.jsx)(r.code,{children:"proc"})}),(0,d.jsxs)(r.td,{children:[(0,d.jsx)(r.code,{children:"undefined"})," | ",(0,d.jsx)(r.code,{children:"Procedure"})]}),(0,d.jsx)(r.td,{children:"The selected procedure."})]})})]}),"\n",(0,d.jsx)(r.h4,{id:"returns-8",children:"Returns"}),"\n",(0,d.jsx)(r.p,{children:(0,d.jsx)(r.code,{children:"void"})}),"\n",(0,d.jsx)(r.h4,{id:"inherited-from-19",children:"Inherited from"}),"\n",(0,d.jsxs)(r.p,{children:[(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore",children:(0,d.jsx)(r.code,{children:"SelectDepartureStore"})}),".",(0,d.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/SelectDepartureStore#onselectedprocedurechanged",children:(0,d.jsx)(r.code,{children:"onSelectedProcedureChanged"})})]}),"\n",(0,d.jsx)(r.h4,{id:"defined-in-20",children:"Defined in"}),"\n",(0,d.jsx)(r.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/Procedure/DepArr/SelectDepArrStore.ts:32"})]})}function a(e={}){let{wrapper:r}={...(0,s.a)(),...e.components};return r?(0,d.jsx)(r,{...e,children:(0,d.jsx)(h,{...e})}):h(e)}},250065:function(e,r,n){n.d(r,{Z:function(){return t},a:function(){return c}});var i=n(667294);let d={},s=i.createContext(d);function c(e){let r=i.useContext(s);return i.useMemo(function(){return"function"==typeof e?e(r):{...r,...e}},[r,e])}function t(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:c(e.components),i.createElement(s.Provider,{value:r},e.children)}}}]);