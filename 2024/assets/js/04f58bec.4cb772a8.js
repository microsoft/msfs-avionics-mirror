"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["95868"],{480577:function(e,i,n){n.r(i),n.d(i,{metadata:()=>t,contentTitle:()=>s,default:()=>u,assets:()=>a,toc:()=>c,frontMatter:()=>d});var t=JSON.parse('{"id":"api/g3000gtc/interfaces/GtcTemperatureDialogInput","title":"Interface: GtcTemperatureDialogInput","description":"A request input for GtcTemperatureDialog.","source":"@site/docs/api/g3000gtc/interfaces/GtcTemperatureDialogInput.md","sourceDirName":"api/g3000gtc/interfaces","slug":"/api/g3000gtc/interfaces/GtcTemperatureDialogInput","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000gtc/interfaces/GtcTemperatureDialogInput","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"GtcTakeoffDataPageProps","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000gtc/interfaces/GtcTakeoffDataPageProps"},"next":{"title":"GtcTemperatureDialogOutput","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000gtc/interfaces/GtcTemperatureDialogOutput"}}'),r=n("785893"),l=n("250065");let d={},s="Interface: GtcTemperatureDialogInput",a={},c=[{value:"Extends",id:"extends",level:2},{value:"Properties",id:"properties",level:2},{value:"digitCount?",id:"digitcount",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"initialUnit?",id:"initialunit",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"initialValue",id:"initialvalue",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"maximumValue",id:"maximumvalue",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"minimumValue",id:"minimumvalue",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"title?",id:"title",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"unitType",id:"unittype",level:3},{value:"Defined in",id:"defined-in-6",level:4}];function o(e){let i={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...(0,l.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(i.header,{children:(0,r.jsx)(i.h1,{id:"interface-gtctemperaturedialoginput",children:"Interface: GtcTemperatureDialogInput"})}),"\n",(0,r.jsxs)(i.p,{children:["A request input for ",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000gtc/classes/GtcTemperatureDialog",children:"GtcTemperatureDialog"}),"."]}),"\n",(0,r.jsx)(i.h2,{id:"extends",children:"Extends"}),"\n",(0,r.jsxs)(i.ul,{children:["\n",(0,r.jsx)(i.li,{children:(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000gtc/interfaces/GtcNumberDialogInput",children:(0,r.jsx)(i.code,{children:"GtcNumberDialogInput"})})}),"\n"]}),"\n",(0,r.jsx)(i.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(i.h3,{id:"digitcount",children:"digitCount?"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"optional"})," ",(0,r.jsx)(i.strong,{children:"digitCount"}),": ",(0,r.jsx)(i.code,{children:"2"})," | ",(0,r.jsx)(i.code,{children:"4"})," | ",(0,r.jsx)(i.code,{children:"3"})]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"The number of digits supported by the dialog's input. If not defined, the number of digits will default to the\nminimum number of digits required to accommodate both the minimum and maximum valid values."}),"\n",(0,r.jsx)(i.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Dialog/GtcTemperatureDialog.tsx:30"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"initialunit",children:"initialUnit?"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"optional"})," ",(0,r.jsx)(i.strong,{children:"initialUnit"}),": ",(0,r.jsx)(i.code,{children:"Unit"}),"<",(0,r.jsx)(i.code,{children:"Temperature"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"The initial temperature unit. If not defined, the initial unit will default to the dialog's unit type."}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Dialog/GtcTemperatureDialog.tsx:21"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"initialvalue",children:"initialValue"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.strong,{children:"initialValue"}),": ",(0,r.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"The value initially loaded into the dialog at the start of a request."}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000gtc/interfaces/GtcNumberDialogInput",children:(0,r.jsx)(i.code,{children:"GtcNumberDialogInput"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000gtc/interfaces/GtcNumberDialogInput#initialvalue",children:(0,r.jsx)(i.code,{children:"initialValue"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Dialog/AbstractGtcNumberDialog.tsx:23"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"maximumvalue",children:"maximumValue"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.strong,{children:"maximumValue"}),": ",(0,r.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"The maximum valid numeric value allowed by the dialog's input."}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Dialog/GtcTemperatureDialog.tsx:36"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"minimumvalue",children:"minimumValue"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.strong,{children:"minimumValue"}),": ",(0,r.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"The minimum valid numeric value allowed by the dialog's input."}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Dialog/GtcTemperatureDialog.tsx:33"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"title",children:"title?"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"optional"})," ",(0,r.jsx)(i.strong,{children:"title"}),": ",(0,r.jsx)(i.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"The GTC view title to display with the message."}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Dialog/GtcTemperatureDialog.tsx:39"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"unittype",children:"unitType"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.strong,{children:"unitType"}),": ",(0,r.jsx)(i.code,{children:"Unit"}),"<",(0,r.jsx)(i.code,{children:"Temperature"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"The unit type in which the dialog should operate."}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Dialog/GtcTemperatureDialog.tsx:24"})]})}function u(e={}){let{wrapper:i}={...(0,l.a)(),...e.components};return i?(0,r.jsx)(i,{...e,children:(0,r.jsx)(o,{...e})}):o(e)}},250065:function(e,i,n){n.d(i,{Z:function(){return s},a:function(){return d}});var t=n(667294);let r={},l=t.createContext(r);function d(e){let i=t.useContext(l);return t.useMemo(function(){return"function"==typeof e?e(i):{...i,...e}},[i,e])}function s(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:d(e.components),t.createElement(l.Provider,{value:i},e.children)}}}]);