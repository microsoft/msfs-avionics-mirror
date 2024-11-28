"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["18226"],{433142:function(n,e,r){r.r(e),r.d(e,{metadata:()=>s,contentTitle:()=>c,default:()=>h,assets:()=>d,toc:()=>o,frontMatter:()=>a});var s=JSON.parse('{"id":"api/framework/classes/XMLWarningFactory","title":"Class: XMLWarningFactory","description":"Create a list of system warnings.","source":"@site/docs/api/framework/classes/XMLWarningFactory.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/XMLWarningFactory","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/XMLWarningFactory","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"XMLGaugeConfigFactory","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/XMLGaugeConfigFactory"},"next":{"title":"XPDRInstrument","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/XPDRInstrument"}}'),i=r("785893"),t=r("250065");let a={},c="Class: XMLWarningFactory",d={},o=[{value:"Constructors",id:"constructors",level:2},{value:"new XMLWarningFactory()",id:"new-xmlwarningfactory",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"parseConfig()",id:"parseconfig",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4}];function l(n){let e={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,t.a)(),...n.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(e.header,{children:(0,i.jsx)(e.h1,{id:"class-xmlwarningfactory",children:"Class: XMLWarningFactory"})}),"\n",(0,i.jsx)(e.p,{children:"Create a list of system warnings."}),"\n",(0,i.jsx)(e.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(e.h3,{id:"new-xmlwarningfactory",children:"new XMLWarningFactory()"}),"\n",(0,i.jsxs)(e.blockquote,{children:["\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.strong,{children:"new XMLWarningFactory"}),"(",(0,i.jsx)(e.code,{children:"instrument"}),"): ",(0,i.jsx)(e.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/XMLWarningFactory",children:(0,i.jsx)(e.code,{children:"XMLWarningFactory"})})]}),"\n"]}),"\n",(0,i.jsx)(e.p,{children:"Create an XMLWarningFactory."}),"\n",(0,i.jsx)(e.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(e.table,{children:[(0,i.jsx)(e.thead,{children:(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.th,{children:"Parameter"}),(0,i.jsx)(e.th,{children:"Type"}),(0,i.jsx)(e.th,{children:"Description"})]})}),(0,i.jsx)(e.tbody,{children:(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:(0,i.jsx)(e.code,{children:"instrument"})}),(0,i.jsx)(e.td,{children:(0,i.jsx)(e.code,{children:"BaseInstrument"})}),(0,i.jsx)(e.td,{children:"The instrument that the warnings run in."})]})})]}),"\n",(0,i.jsx)(e.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsx)(e.p,{children:(0,i.jsx)(e.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/XMLWarningFactory",children:(0,i.jsx)(e.code,{children:"XMLWarningFactory"})})}),"\n",(0,i.jsx)(e.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(e.p,{children:"src/sdk/components/Warnings/XMLWarningAdapter.ts:14"}),"\n",(0,i.jsx)(e.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(e.h3,{id:"parseconfig",children:"parseConfig()"}),"\n",(0,i.jsxs)(e.blockquote,{children:["\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.strong,{children:"parseConfig"}),"(",(0,i.jsx)(e.code,{children:"document"}),"): ",(0,i.jsx)(e.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/Warning",children:(0,i.jsx)(e.code,{children:"Warning"})}),"[]"]}),"\n"]}),"\n",(0,i.jsx)(e.p,{children:"Parse a panel.xml configuration to create a list of warnings.  The warning\npriority is defined by their order in panel.xml, with higher priority\nwarnings coming sooner in the file."}),"\n",(0,i.jsx)(e.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(e.table,{children:[(0,i.jsx)(e.thead,{children:(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.th,{children:"Parameter"}),(0,i.jsx)(e.th,{children:"Type"}),(0,i.jsx)(e.th,{children:"Description"})]})}),(0,i.jsx)(e.tbody,{children:(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:(0,i.jsx)(e.code,{children:"document"})}),(0,i.jsx)(e.td,{children:(0,i.jsx)(e.code,{children:"Document"})}),(0,i.jsx)(e.td,{children:"The configuration as an XML document."})]})})]}),"\n",(0,i.jsx)(e.h4,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/Warning",children:(0,i.jsx)(e.code,{children:"Warning"})}),"[]"]}),"\n",(0,i.jsx)(e.p,{children:"An array of Warnings"}),"\n",(0,i.jsx)(e.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(e.p,{children:"src/sdk/components/Warnings/XMLWarningAdapter.ts:25"})]})}function h(n={}){let{wrapper:e}={...(0,t.a)(),...n.components};return e?(0,i.jsx)(e,{...n,children:(0,i.jsx)(l,{...n})}):l(n)}},250065:function(n,e,r){r.d(e,{Z:function(){return c},a:function(){return a}});var s=r(667294);let i={},t=s.createContext(i);function a(n){let e=s.useContext(t);return s.useMemo(function(){return"function"==typeof n?n(e):{...e,...n}},[e,n])}function c(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(i):n.components||i:a(n.components),s.createElement(t.Provider,{value:e},n.children)}}}]);