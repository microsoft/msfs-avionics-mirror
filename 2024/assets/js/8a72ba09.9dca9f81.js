"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["707883"],{307180:function(e,s,n){n.r(s),n.d(s,{metadata:()=>t,contentTitle:()=>d,default:()=>h,assets:()=>c,toc:()=>l,frontMatter:()=>o});var t=JSON.parse('{"id":"api/wt21fmc/classes/WT21CoordinatesUtils","title":"Class: WT21CoordinatesUtils","description":"Utilities for parsing coordinates in the WT21 supported formats","source":"@site/docs/api/wt21fmc/classes/WT21CoordinatesUtils.md","sourceDirName":"api/wt21fmc/classes","slug":"/api/wt21fmc/classes/WT21CoordinatesUtils","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/WT21CoordinatesUtils","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"WT21CduDisplay","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/WT21CduDisplay"},"next":{"title":"WT21FixInfoPageController","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/WT21FixInfoPageController"}}'),r=n("785893"),i=n("250065");let o={},d="Class: WT21CoordinatesUtils",c={},l=[{value:"Constructors",id:"constructors",level:2},{value:"new WT21CoordinatesUtils()",id:"new-wt21coordinatesutils",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"parseLatLong()",id:"parselatlong",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4}];function a(e){let s={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,i.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(s.header,{children:(0,r.jsx)(s.h1,{id:"class-wt21coordinatesutils",children:"Class: WT21CoordinatesUtils"})}),"\n",(0,r.jsx)(s.p,{children:"Utilities for parsing coordinates in the WT21 supported formats"}),"\n",(0,r.jsx)(s.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(s.h3,{id:"new-wt21coordinatesutils",children:"new WT21CoordinatesUtils()"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.strong,{children:"new WT21CoordinatesUtils"}),"(): ",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/WT21CoordinatesUtils",children:(0,r.jsx)(s.code,{children:"WT21CoordinatesUtils"})})]}),"\n"]}),"\n",(0,r.jsx)(s.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(s.p,{children:(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21fmc/classes/WT21CoordinatesUtils",children:(0,r.jsx)(s.code,{children:"WT21CoordinatesUtils"})})}),"\n",(0,r.jsx)(s.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(s.h3,{id:"parselatlong",children:"parseLatLong()"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"static"})," ",(0,r.jsx)(s.strong,{children:"parseLatLong"}),"(",(0,r.jsx)(s.code,{children:"str"}),", ",(0,r.jsx)(s.code,{children:"acceptShortForm"}),"): ",(0,r.jsx)(s.code,{children:"null"})," | ",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21fmc/interfaces/CoordinatesInput",children:(0,r.jsx)(s.code,{children:"CoordinatesInput"})})]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:"Parses a string according to the LAT LONG format"}),"\n",(0,r.jsx)(s.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(s.table,{children:[(0,r.jsx)(s.thead,{children:(0,r.jsxs)(s.tr,{children:[(0,r.jsx)(s.th,{children:"Parameter"}),(0,r.jsx)(s.th,{children:"Type"}),(0,r.jsx)(s.th,{children:"Default value"}),(0,r.jsx)(s.th,{children:"Description"})]})}),(0,r.jsxs)(s.tbody,{children:[(0,r.jsxs)(s.tr,{children:[(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"str"})}),(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"string"})}),(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"undefined"})}),(0,r.jsx)(s.td,{children:"the string to parse"})]}),(0,r.jsxs)(s.tr,{children:[(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"acceptShortForm"})}),(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"boolean"})}),(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"true"})}),(0,r.jsx)(s.td,{children:"whether to accept the short (XYYZUU/XYYUUZ) formats"})]})]})]}),"\n",(0,r.jsx)(s.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"null"})," | ",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21fmc/interfaces/CoordinatesInput",children:(0,r.jsx)(s.code,{children:"CoordinatesInput"})})]}),"\n",(0,r.jsxs)(s.p,{children:["a LatLongInterface object if a valid PBPB definition and ",(0,r.jsx)(s.code,{children:"null"})," otherwise"]}),"\n",(0,r.jsx)(s.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(s.p,{children:"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/FMC/Navigation/WT21CoordinatesUtils.ts:34"})]})}function h(e={}){let{wrapper:s}={...(0,i.a)(),...e.components};return s?(0,r.jsx)(s,{...e,children:(0,r.jsx)(a,{...e})}):a(e)}},250065:function(e,s,n){n.d(s,{Z:function(){return d},a:function(){return o}});var t=n(667294);let r={},i=t.createContext(r);function o(e){let s=t.useContext(i);return t.useMemo(function(){return"function"==typeof e?e(s):{...s,...e}},[s,e])}function d(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:o(e.components),t.createElement(i.Provider,{value:s},e.children)}}}]);