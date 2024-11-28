"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["119052"],{703168:function(e,n,i){i.r(n),i.d(n,{metadata:()=>l,contentTitle:()=>t,default:()=>a,assets:()=>o,toc:()=>c,frontMatter:()=>d});var l=JSON.parse('{"id":"api/g1000common/classes/FPLDetailsController","title":"Class: FPLDetailsController","description":"Controller for FPLDetails","source":"@site/docs/api/g1000common/classes/FPLDetailsController.md","sourceDirName":"api/g1000common/classes","slug":"/api/g1000common/classes/FPLDetailsController","permalink":"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/FPLDetailsController","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"FPLDetails","permalink":"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/FPLDetails"},"next":{"title":"FPLDetailsStore","permalink":"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/FPLDetailsStore"}}'),s=i("785893"),r=i("250065");let d={},t="Class: FPLDetailsController",o={},c=[{value:"Constructors",id:"constructors",level:2},{value:"new FPLDetailsController()",id:"new-fpldetailscontroller",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"airwaysCollapsed",id:"airwayscollapsed",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"hasVnav",id:"hasvnav",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"legArrowRef",id:"legarrowref",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"originRef",id:"originref",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"scrollMode",id:"scrollmode",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"sectionRefs",id:"sectionrefs",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"Methods",id:"methods",level:2},{value:"collapseAirways()",id:"collapseairways",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"initActiveLeg()",id:"initactiveleg",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"initDtoLeg()",id:"initdtoleg",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"initialize()",id:"initialize",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-10",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,r.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"class-fpldetailscontroller",children:"Class: FPLDetailsController"})}),"\n",(0,s.jsx)(n.p,{children:"Controller for FPLDetails"}),"\n",(0,s.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,s.jsx)(n.h3,{id:"new-fpldetailscontroller",children:"new FPLDetailsController()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"new FPLDetailsController"}),"(",(0,s.jsx)(n.code,{children:"store"}),", ",(0,s.jsx)(n.code,{children:"fms"}),", ",(0,s.jsx)(n.code,{children:"bus"}),", ",(0,s.jsx)(n.code,{children:"scrollToActiveLegCb"}),"): ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/FPLDetailsController",children:(0,s.jsx)(n.code,{children:"FPLDetailsController"})})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Constructor"}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"store"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/FPLDetailsStore",children:(0,s.jsx)(n.code,{children:"FPLDetailsStore"})})}),(0,s.jsx)(n.td,{children:"the store instance"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"fms"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"Fms"}),"<",(0,s.jsx)(n.code,{children:"any"}),">"]}),(0,s.jsx)(n.td,{children:"the fms"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"bus"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"EventBus"})}),(0,s.jsx)(n.td,{children:"the bus"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"scrollToActiveLegCb"})}),(0,s.jsxs)(n.td,{children:["() => ",(0,s.jsx)(n.code,{children:"void"})]}),(0,s.jsx)(n.td,{children:"the callback for scroll to active leg"})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/FPLDetailsController",children:(0,s.jsx)(n.code,{children:"FPLDetailsController"})})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsController.ts:46"}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"airwayscollapsed",children:"airwaysCollapsed"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"airwaysCollapsed"}),": ",(0,s.jsx)(n.code,{children:"boolean"})," = ",(0,s.jsx)(n.code,{children:"false"})]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsController.ts:34"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"hasvnav",children:"hasVnav"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"hasVnav"}),": ",(0,s.jsx)(n.code,{children:"boolean"})," = ",(0,s.jsx)(n.code,{children:"false"})]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsController.ts:32"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"legarrowref",children:"legArrowRef"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"legArrowRef"}),": ",(0,s.jsx)(n.code,{children:"NodeReference"}),"<",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/FplActiveLegArrow",children:(0,s.jsx)(n.code,{children:"FplActiveLegArrow"})}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsController.ts:31"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"originref",children:"originRef"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"originRef"}),": ",(0,s.jsx)(n.code,{children:"NodeReference"}),"<",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/FPLOrigin",children:(0,s.jsx)(n.code,{children:"FPLOrigin"})}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsController.ts:30"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"scrollmode",children:"scrollMode"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"scrollMode"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/enumerations/ScrollMode",children:(0,s.jsx)(n.code,{children:"ScrollMode"})})," = ",(0,s.jsx)(n.code,{children:"ScrollMode.MANUAL"})]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsController.ts:35"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"sectionrefs",children:"sectionRefs"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"sectionRefs"}),": ",(0,s.jsx)(n.code,{children:"NodeReference"}),"<",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/FPLSection",children:(0,s.jsx)(n.code,{children:"FPLSection"})}),">[] = ",(0,s.jsx)(n.code,{children:"[]"})]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsController.ts:29"}),"\n",(0,s.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(n.h3,{id:"collapseairways",children:"collapseAirways()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"collapseAirways"}),"(): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A method called to collapse the airways."}),"\n",(0,s.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsController.ts:503"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"initactiveleg",children:"initActiveLeg()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"initActiveLeg"}),"(): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A method to initialize the active leg.\nTODO: REMOVE THIS WHEN THE ROOT PROBLEM IS FIXED"}),"\n",(0,s.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsController.ts:130"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"initdtoleg",children:"initDtoLeg()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"initDtoLeg"}),"(): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A method to initialize the dto leg.\nTODO: REMOVE THIS WHEN THE ROOT PROBLEM IS FIXED"}),"\n",(0,s.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsController.ts:138"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"initialize",children:"initialize()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"initialize"}),"(): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Initializes fpldetails controller"}),"\n",(0,s.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsController.ts:53"})]})}function a(e={}){let{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return t},a:function(){return d}});var l=i(667294);let s={},r=l.createContext(s);function d(e){let n=l.useContext(r);return l.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:d(e.components),l.createElement(r.Provider,{value:n},e.children)}}}]);