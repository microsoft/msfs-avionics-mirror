"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["465183"],{563076:function(e,n,s){s.r(n),s.d(n,{metadata:()=>r,contentTitle:()=>t,default:()=>o,assets:()=>a,toc:()=>l,frontMatter:()=>c});var r=JSON.parse('{"id":"api/framework/classes/CasSystem","title":"Class: CasSystem","description":"A system for CAS management.","source":"@site/docs/api/framework/classes/CasSystem.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/CasSystem","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/CasSystem","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"CasRegistrationManager","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/CasRegistrationManager"},"next":{"title":"CasSystemLegacyAdapter","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/CasSystemLegacyAdapter"}}'),i=s("785893"),d=s("250065");let c={},t="Class: CasSystem",a={},l=[{value:"Constructors",id:"constructors",level:2},{value:"new CasSystem()",id:"new-cassystem",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"casActiveMessageSubject",id:"casactivemessagesubject",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"acknowledgeMessage()",id:"acknowledgemessage",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"checkForActiveType()",id:"checkforactivetype",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"handleAcknowledgement()",id:"handleacknowledgement",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"handleSingleAcknowledgement()",id:"handlesingleacknowledgement",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-5",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"class-cassystem",children:"Class: CasSystem"})}),"\n",(0,i.jsx)(n.p,{children:"A system for CAS management."}),"\n",(0,i.jsx)(n.p,{children:"Every avionics system must have exactly one instance of CasSystem configured as the primary system. This is the one\nthat is responsible for triggering sim-level master caution/warning alerts and intercepting and handling master\nacknowledge events."}),"\n",(0,i.jsxs)(n.p,{children:["Each JS instrument should have at most one instance of CasSystem. Multiple instances of CasSystem on a single\ninstrument will cause duplicated events to be published to the topics defined by ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/CasStateEvents",children:"CasStateEvents"}),"."]}),"\n",(0,i.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(n.h3,{id:"new-cassystem",children:"new CasSystem()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"new CasSystem"}),"(",(0,i.jsx)(n.code,{children:"bus"}),", ",(0,i.jsx)(n.code,{children:"primary"}),"): ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/CasSystem",children:(0,i.jsx)(n.code,{children:"CasSystem"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Create a CasSystem."}),"\n",(0,i.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Default value"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"bus"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/EventBus",children:(0,i.jsx)(n.code,{children:"EventBus"})})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"undefined"})}),(0,i.jsx)(n.td,{children:"The event bus."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"primary"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"boolean"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"false"})}),(0,i.jsx)(n.td,{children:"Whether or not this is the system responsible for managing alerts at the sim level."})]})]})]}),"\n",(0,i.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/CasSystem",children:(0,i.jsx)(n.code,{children:"CasSystem"})})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/cas/CasSystem.ts:244"}),"\n",(0,i.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,i.jsx)(n.h3,{id:"casactivemessagesubject",children:"casActiveMessageSubject"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.strong,{children:"casActiveMessageSubject"}),": ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/SubscribableArray",children:(0,i.jsx)(n.code,{children:"SubscribableArray"})}),"<",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/CasActiveMessage",children:(0,i.jsx)(n.code,{children:"CasActiveMessage"})}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/cas/CasSystem.ts:237"}),"\n",(0,i.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(n.h3,{id:"acknowledgemessage",children:"acknowledgeMessage()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.strong,{children:"acknowledgeMessage"}),"(",(0,i.jsx)(n.code,{children:"message"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Acknowledge a single message by mutating it."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"message"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/CasActiveMessage",children:(0,i.jsx)(n.code,{children:"CasActiveMessage"})})}),(0,i.jsxs)(n.td,{children:["The message to be acknowledged from CasSystem's ",(0,i.jsx)(n.code,{children:"allMessages"})]})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/cas/CasSystem.ts:615"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"checkforactivetype",children:"checkForActiveType()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.strong,{children:"checkForActiveType"}),"(",(0,i.jsx)(n.code,{children:"type"}),"): ",(0,i.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"See if there is still an active, unacked annunciation of the given type."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"type"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/AnnunciationType",children:(0,i.jsx)(n.code,{children:"AnnunciationType"})})}),(0,i.jsx)(n.td,{children:"The annunciation type to check for."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"boolean"})}),"\n",(0,i.jsx)(n.p,{children:"True if there is an active, unacked annunciation of the given type, false otherwise."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/cas/CasSystem.ts:753"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"handleacknowledgement",children:"handleAcknowledgement()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.strong,{children:"handleAcknowledgement"}),"(",(0,i.jsx)(n.code,{children:"type"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Handle a master warning or caution acknowledgement."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"type"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/AnnunciationType",children:(0,i.jsx)(n.code,{children:"AnnunciationType"})})}),(0,i.jsx)(n.td,{children:"The type of alert to acknowledge."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/cas/CasSystem.ts:579"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"handlesingleacknowledgement",children:"handleSingleAcknowledgement()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.strong,{children:"handleSingleAcknowledgement"}),"(",(0,i.jsx)(n.code,{children:"key"}),", ",(0,i.jsx)(n.code,{children:"priority"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Handle acknowledgement of a single message"}),"\n",(0,i.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"key"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/CasAlertKey",children:(0,i.jsx)(n.code,{children:"CasAlertKey"})})}),(0,i.jsx)(n.td,{children:"The UUID and optional suffix of the alert to handle."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"priority"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/AnnunciationType",children:(0,i.jsx)(n.code,{children:"AnnunciationType"})})}),(0,i.jsx)(n.td,{children:"The priority of the alert to handle."})]})]})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/cas/CasSystem.ts:600"})]})}function o(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return t},a:function(){return c}});var r=s(667294);let i={},d=r.createContext(i);function c(e){let n=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:c(e.components),r.createElement(d.Provider,{value:n},e.children)}}}]);