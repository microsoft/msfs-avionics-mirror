"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["849307"],{608882:function(e,n,t){t.r(n),t.d(n,{metadata:()=>r,contentTitle:()=>d,default:()=>h,assets:()=>a,toc:()=>l,frontMatter:()=>c});var r=JSON.parse('{"id":"api/g3000gtc/classes/GtcKnobHandler","title":"Class: GtcKnobHandler","description":"Handles default behavior for the physical GTC knobs and buttons.","source":"@site/docs/api/g3000gtc/classes/GtcKnobHandler.md","sourceDirName":"api/g3000gtc/classes","slug":"/api/g3000gtc/classes/GtcKnobHandler","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000gtc/classes/GtcKnobHandler","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"GtcIntersectionInfoPage","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000gtc/classes/GtcIntersectionInfoPage"},"next":{"title":"GtcKnobStatesManager","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000gtc/classes/GtcKnobStatesManager"}}'),s=t("785893"),i=t("250065");let c={},d="Class: GtcKnobHandler",a={},l=[{value:"Constructors",id:"constructors",level:2},{value:"new GtcKnobHandler()",id:"new-gtcknobhandler",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"handleDefaultInteractionBehavior()",id:"handledefaultinteractionbehavior",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,i.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"class-gtcknobhandler",children:"Class: GtcKnobHandler"})}),"\n",(0,s.jsx)(n.p,{children:"Handles default behavior for the physical GTC knobs and buttons."}),"\n",(0,s.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,s.jsx)(n.h3,{id:"new-gtcknobhandler",children:"new GtcKnobHandler()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"new GtcKnobHandler"}),"(",(0,s.jsx)(n.code,{children:"gtcService"}),"): ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000gtc/classes/GtcKnobHandler",children:(0,s.jsx)(n.code,{children:"GtcKnobHandler"})})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The GtcKnobHandler constructor."}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"gtcService"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000gtc/classes/GtcService",children:(0,s.jsx)(n.code,{children:"GtcService"})})}),(0,s.jsx)(n.td,{children:"The GTC service instance for the GTC with which this handler is associated."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000gtc/classes/GtcKnobHandler",children:(0,s.jsx)(n.code,{children:"GtcKnobHandler"})})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/GtcService/GtcKnobHandler.ts:72"}),"\n",(0,s.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(n.h3,{id:"handledefaultinteractionbehavior",children:"handleDefaultInteractionBehavior()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"handleDefaultInteractionBehavior"}),"(",(0,s.jsx)(n.code,{children:"event"}),"): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Handles GtcInteractionEvents in the case that a GtcView has not overridden the knob behavior."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"event"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000gtc/type-aliases/GtcInteractionEvent",children:(0,s.jsx)(n.code,{children:"GtcInteractionEvent"})})}),(0,s.jsx)(n.td,{children:"The event."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/GtcService/GtcKnobHandler.ts:81"})]})}function h(e={}){let{wrapper:n}={...(0,i.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(o,{...e})}):o(e)}},250065:function(e,n,t){t.d(n,{Z:function(){return d},a:function(){return c}});var r=t(667294);let s={},i=r.createContext(s);function c(e){let n=r.useContext(i);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:c(e.components),r.createElement(i.Provider,{value:n},e.children)}}}]);