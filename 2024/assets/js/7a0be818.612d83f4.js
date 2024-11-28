"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["385620"],{994838:function(e,n,s){s.r(n),s.d(n,{metadata:()=>r,contentTitle:()=>c,default:()=>h,assets:()=>o,toc:()=>l,frontMatter:()=>t});var r=JSON.parse('{"id":"api/framework/classes/NavComInstrument","title":"Class: NavComInstrument","description":"The core instrument that will drive all of a system\'s radios.","source":"@site/docs/api/framework/classes/NavComInstrument.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/NavComInstrument","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/NavComInstrument","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"NavComConfig","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/NavComConfig"},"next":{"title":"NavComSimVarPublisher","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/NavComSimVarPublisher"}}'),i=s("785893"),d=s("250065");let t={},c="Class: NavComInstrument",o={},l=[{value:"Constructors",id:"constructors",level:2},{value:"new NavComInstrument()",id:"new-navcominstrument",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"init()",id:"init",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"onUpdate()",id:"onupdate",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4}];function a(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"class-navcominstrument",children:"Class: NavComInstrument"})}),"\n",(0,i.jsx)(n.p,{children:"The core instrument that will drive all of a system's radios."}),"\n",(0,i.jsxs)(n.p,{children:["Requires that the topics defined in ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/NavComEvents",children:"NavComEvents"})," are published to the event bus."]}),"\n",(0,i.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(n.h3,{id:"new-navcominstrument",children:"new NavComInstrument()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"new NavComInstrument"}),"(",(0,i.jsx)(n.code,{children:"bus"}),", ",(0,i.jsx)(n.code,{children:"config"}),", ",(0,i.jsx)(n.code,{children:"numNavRadios"}),", ",(0,i.jsx)(n.code,{children:"numComRadios"}),", ",(0,i.jsx)(n.code,{children:"sync"}),"): ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/NavComInstrument",children:(0,i.jsx)(n.code,{children:"NavComInstrument"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Create a NavComController."}),"\n",(0,i.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Default value"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"bus"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/EventBus",children:(0,i.jsx)(n.code,{children:"EventBus"})})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"undefined"})}),(0,i.jsx)(n.td,{children:"The event bus to publish to."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"config"})}),(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"undefined"})," | ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/NavComConfig",children:(0,i.jsx)(n.code,{children:"NavComConfig"})})]}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"undefined"})}),(0,i.jsx)(n.td,{children:"A NavComConfig object defining the radio configuration."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"numNavRadios"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"number"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"undefined"})}),(0,i.jsx)(n.td,{children:"The number of nav radios in the system."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"numComRadios"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"number"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"undefined"})}),(0,i.jsx)(n.td,{children:"The number of com radios in the system."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"sync"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"boolean"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"true"})}),(0,i.jsx)(n.td,{children:"Whether to sync events or not, default true."})]})]})]}),"\n",(0,i.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/NavComInstrument",children:(0,i.jsx)(n.code,{children:"NavComInstrument"})})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/instruments/NavComInstrument.ts:144"}),"\n",(0,i.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(n.h3,{id:"init",children:"init()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"init"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Initialize the instrument."}),"\n",(0,i.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/instruments/NavComInstrument.ts:182"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onupdate",children:"onUpdate()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onUpdate"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Perform events for the update loop."}),"\n",(0,i.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/instruments/NavComInstrument.ts:260"})]})}function h(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(a,{...e})}):a(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return c},a:function(){return t}});var r=s(667294);let i={},d=r.createContext(i);function t(e){let n=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:t(e.components),r.createElement(d.Provider,{value:n},e.children)}}}]);