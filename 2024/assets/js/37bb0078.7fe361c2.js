"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["348033"],{475787:function(e,s,n){n.r(s),n.d(s,{metadata:()=>r,contentTitle:()=>d,default:()=>h,assets:()=>l,toc:()=>o,frontMatter:()=>c});var r=JSON.parse('{"id":"api/garminsdk/classes/GpsReceiverSelector","title":"Class: GpsReceiverSelector","description":"Automatically selects the best GPS receiver from a set of candidates based on the current states of all receivers.","source":"@site/docs/api/garminsdk/classes/GpsReceiverSelector.md","sourceDirName":"api/garminsdk/classes","slug":"/api/garminsdk/classes/GpsReceiverSelector","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/GpsReceiverSelector","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"GpsNavSource","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/GpsNavSource"},"next":{"title":"GpsReceiverSystem","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/GpsReceiverSystem"}}'),i=n("785893"),t=n("250065");let c={},d="Class: GpsReceiverSelector",l={},o=[{value:"Constructors",id:"constructors",level:2},{value:"new GpsReceiverSelector()",id:"new-gpsreceiverselector",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"selectedIndex",id:"selectedindex",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"init()",id:"init",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-3",level:4}];function a(e){let s={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,t.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(s.header,{children:(0,i.jsx)(s.h1,{id:"class-gpsreceiverselector",children:"Class: GpsReceiverSelector"})}),"\n",(0,i.jsx)(s.p,{children:"Automatically selects the best GPS receiver from a set of candidates based on the current states of all receivers.\nReceivers that have computed a 3D position solution with differential corrections are favored over those that have\ncomputed a 3D solution without corrections, and either of these are favored over those that have not computed any\nposition solution."}),"\n",(0,i.jsx)(s.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(s.h3,{id:"new-gpsreceiverselector",children:"new GpsReceiverSelector()"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.strong,{children:"new GpsReceiverSelector"}),"(",(0,i.jsx)(s.code,{children:"bus"}),", ",(0,i.jsx)(s.code,{children:"candidateReceiverIndexes"}),", ",(0,i.jsx)(s.code,{children:"options"}),"?): ",(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/GpsReceiverSelector",children:(0,i.jsx)(s.code,{children:"GpsReceiverSelector"})})]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Creates a new instance of GpsReceiverSelector."}),"\n",(0,i.jsx)(s.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.th,{children:"Parameter"}),(0,i.jsx)(s.th,{children:"Type"}),(0,i.jsx)(s.th,{children:"Description"})]})}),(0,i.jsxs)(s.tbody,{children:[(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"bus"})}),(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"EventBus"})}),(0,i.jsx)(s.td,{children:"The event bus."})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"candidateReceiverIndexes"})}),(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"Iterable"}),"<",(0,i.jsx)(s.code,{children:"number"}),"> | ",(0,i.jsx)(s.code,{children:"SubscribableSet"}),"<",(0,i.jsx)(s.code,{children:"number"}),">"]}),(0,i.jsx)(s.td,{children:"The indexes of the GPS receivers from which to select."})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"options"}),"?"]}),(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"Readonly"}),"<",(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/GpsReceiverSelectorOptions",children:(0,i.jsx)(s.code,{children:"GpsReceiverSelectorOptions"})}),">"]}),(0,i.jsx)(s.td,{children:"Options with which to configure the selector."})]})]})]}),"\n",(0,i.jsx)(s.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/GpsReceiverSelector",children:(0,i.jsx)(s.code,{children:"GpsReceiverSelector"})})}),"\n",(0,i.jsx)(s.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(s.p,{children:"src/garminsdk/navigation/GpsReceiverSelector.ts:93"}),"\n",(0,i.jsx)(s.h2,{id:"properties",children:"Properties"}),"\n",(0,i.jsx)(s.h3,{id:"selectedindex",children:"selectedIndex"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"readonly"})," ",(0,i.jsx)(s.strong,{children:"selectedIndex"}),": ",(0,i.jsx)(s.code,{children:"Subscribable"}),"<",(0,i.jsx)(s.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,i.jsx)(s.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(s.p,{children:"src/garminsdk/navigation/GpsReceiverSelector.ts:66"}),"\n",(0,i.jsx)(s.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(s.h3,{id:"destroy",children:"destroy()"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.strong,{children:"destroy"}),"(): ",(0,i.jsx)(s.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Destroys this selector."}),"\n",(0,i.jsx)(s.h4,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:"void"})}),"\n",(0,i.jsx)(s.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(s.p,{children:"src/garminsdk/navigation/GpsReceiverSelector.ts:223"}),"\n",(0,i.jsx)(s.hr,{}),"\n",(0,i.jsx)(s.h3,{id:"init",children:"init()"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.strong,{children:"init"}),"(): ",(0,i.jsx)(s.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Initializes this selector. Once initialized, this selector will automatically select the best GPS receiver among\nits candidates."}),"\n",(0,i.jsx)(s.h4,{id:"returns-2",children:"Returns"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:"void"})}),"\n",(0,i.jsx)(s.h4,{id:"throws",children:"Throws"}),"\n",(0,i.jsx)(s.p,{children:"Error if this selector has been destroyed."}),"\n",(0,i.jsx)(s.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,i.jsx)(s.p,{children:"src/garminsdk/navigation/GpsReceiverSelector.ts:120"})]})}function h(e={}){let{wrapper:s}={...(0,t.a)(),...e.components};return s?(0,i.jsx)(s,{...e,children:(0,i.jsx)(a,{...e})}):a(e)}},250065:function(e,s,n){n.d(s,{Z:function(){return d},a:function(){return c}});var r=n(667294);let i={},t=r.createContext(i);function c(e){let s=r.useContext(t);return r.useMemo(function(){return"function"==typeof e?e(s):{...s,...e}},[s,e])}function d(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:c(e.components),r.createElement(t.Provider,{value:s},e.children)}}}]);