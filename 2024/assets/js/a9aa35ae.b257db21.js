"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["56945"],{144431:function(e,n,r){r.r(n),r.d(n,{metadata:()=>s,contentTitle:()=>d,default:()=>h,assets:()=>o,toc:()=>l,frontMatter:()=>i});var s=JSON.parse('{"id":"api/wt21shared/classes/WT21TCASTransponderManager","title":"Class: WT21TCASTransponderManager","description":"Manages automatic setting of TCAS and transponder modes such that TCAS is set to standby if transponder mode is not","source":"@site/docs/api/wt21shared/classes/WT21TCASTransponderManager.md","sourceDirName":"api/wt21shared/classes","slug":"/api/wt21shared/classes/WT21TCASTransponderManager","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/WT21TCASTransponderManager","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"WT21TCAS","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/WT21TCAS"},"next":{"title":"WT21UiControl","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/WT21UiControl"}}'),t=r("785893"),a=r("250065");let i={},d="Class: WT21TCASTransponderManager",o={},l=[{value:"Constructors",id:"constructors",level:2},{value:"new WT21TCASTransponderManager()",id:"new-wt21tcastranspondermanager",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"init()",id:"init",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4}];function c(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,a.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"class-wt21tcastranspondermanager",children:"Class: WT21TCASTransponderManager"})}),"\n",(0,t.jsx)(n.p,{children:"Manages automatic setting of TCAS and transponder modes such that TCAS is set to standby if transponder mode is not\naltitude reporting and transponder is set to altitude reporting if TCAS mode is not standby."}),"\n",(0,t.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,t.jsx)(n.h3,{id:"new-wt21tcastranspondermanager",children:"new WT21TCASTransponderManager()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"new WT21TCASTransponderManager"}),"(",(0,t.jsx)(n.code,{children:"bus"}),"): ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/WT21TCASTransponderManager",children:(0,t.jsx)(n.code,{children:"WT21TCASTransponderManager"})})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Constructor."}),"\n",(0,t.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Parameter"}),(0,t.jsx)(n.th,{children:"Type"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsx)(n.tbody,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"bus"})}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"EventBus"})}),(0,t.jsx)(n.td,{children:"The event bus."})]})})]}),"\n",(0,t.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/WT21TCASTransponderManager",children:(0,t.jsx)(n.code,{children:"WT21TCASTransponderManager"})})}),"\n",(0,t.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Traffic/WT21TCASTransponderManager.ts:16"}),"\n",(0,t.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,t.jsx)(n.h3,{id:"init",children:"init()"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"init"}),"(): ",(0,t.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Initializes this manager. Once initialized, the manager will automatically set transponder mode to altitude\nreporting if TCAS is set to any mode other than standby, and set TCAS mode to standby if transponder is set to\nany mode other than altitude reporting."}),"\n",(0,t.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.code,{children:"void"})}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Traffic/WT21TCASTransponderManager.ts:24"})]})}function h(e={}){let{wrapper:n}={...(0,a.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(c,{...e})}):c(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return d},a:function(){return i}});var s=r(667294);let t={},a=s.createContext(t);function i(e){let n=s.useContext(a);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:i(e.components),s.createElement(a.Provider,{value:n},e.children)}}}]);