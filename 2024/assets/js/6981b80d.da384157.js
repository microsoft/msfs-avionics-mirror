"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["373366"],{979766:function(e,s,n){n.r(s),n.d(s,{metadata:()=>i,contentTitle:()=>l,default:()=>a,assets:()=>c,toc:()=>o,frontMatter:()=>d});var i=JSON.parse('{"id":"api/epic2shared/classes/AoaSystemSelector","title":"Class: AoaSystemSelector","description":"Automatically selects the best AOA system.","source":"@site/docs/api/epic2shared/classes/AoaSystemSelector.md","sourceDirName":"api/epic2shared/classes","slug":"/api/epic2shared/classes/AoaSystemSelector","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/AoaSystemSelector","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"AoaSystem","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/AoaSystem"},"next":{"title":"AutopilotConfig","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/AutopilotConfig"}}'),r=n("785893"),t=n("250065");let d={},l="Class: AoaSystemSelector",c={},o=[{value:"Constructors",id:"constructors",level:2},{value:"new AoaSystemSelector()",id:"new-aoasystemselector",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"selectedIndex",id:"selectedindex",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"init()",id:"init",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-3",level:4}];function h(e){let s={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,t.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(s.header,{children:(0,r.jsx)(s.h1,{id:"class-aoasystemselector",children:"Class: AoaSystemSelector"})}),"\n",(0,r.jsx)(s.p,{children:"Automatically selects the best AOA system."}),"\n",(0,r.jsx)(s.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(s.h3,{id:"new-aoasystemselector",children:"new AoaSystemSelector()"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.strong,{children:"new AoaSystemSelector"}),"(",(0,r.jsx)(s.code,{children:"index"}),", ",(0,r.jsx)(s.code,{children:"bus"}),", ",(0,r.jsx)(s.code,{children:"candidateSystemIndexes"}),", ",(0,r.jsx)(s.code,{children:"systemPriorities"}),"?): ",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/AoaSystemSelector",children:(0,r.jsx)(s.code,{children:"AoaSystemSelector"})})]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:"Ctor"}),"\n",(0,r.jsx)(s.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(s.table,{children:[(0,r.jsx)(s.thead,{children:(0,r.jsxs)(s.tr,{children:[(0,r.jsx)(s.th,{children:"Parameter"}),(0,r.jsx)(s.th,{children:"Type"}),(0,r.jsx)(s.th,{children:"Description"})]})}),(0,r.jsxs)(s.tbody,{children:[(0,r.jsxs)(s.tr,{children:[(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"index"})}),(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"number"})}),(0,r.jsx)(s.td,{children:"The index of this selector."})]}),(0,r.jsxs)(s.tr,{children:[(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"bus"})}),(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"EventBus"})}),(0,r.jsx)(s.td,{children:"The instrument event bus."})]}),(0,r.jsxs)(s.tr,{children:[(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"candidateSystemIndexes"})}),(0,r.jsxs)(s.td,{children:[(0,r.jsx)(s.code,{children:"Iterable"}),"<",(0,r.jsx)(s.code,{children:"number"}),"> | ",(0,r.jsx)(s.code,{children:"SubscribableSet"}),"<",(0,r.jsx)(s.code,{children:"number"}),">"]}),(0,r.jsx)(s.td,{children:"The indexes of the AOA systems from which to select."})]}),(0,r.jsxs)(s.tr,{children:[(0,r.jsxs)(s.td,{children:[(0,r.jsx)(s.code,{children:"systemPriorities"}),"?"]}),(0,r.jsxs)(s.td,{children:["readonly ",(0,r.jsx)(s.code,{children:"number"}),"[] | ",(0,r.jsx)(s.code,{children:"SubscribableMap"}),"<",(0,r.jsx)(s.code,{children:"number"}),", ",(0,r.jsx)(s.code,{children:"number"}),"> | ",(0,r.jsx)(s.code,{children:"ReadonlyMap"}),"<",(0,r.jsx)(s.code,{children:"number"}),", ",(0,r.jsx)(s.code,{children:"number"}),">"]}),(0,r.jsxs)(s.td,{children:["The priorities for selecting individual AOA systems. If two systems have the same desirability, then the one with the higher priority will be selected. If a system's priority is not defined, then it will default to a value of ",(0,r.jsx)(s.code,{children:"0"}),". The priorities can be specified as an array of AOA system indexes or a map of AOA system indexes to the priorities for selecting those systems. If specified as an array of indexes, then each system whose index appears in the array will be assigned a priority equal to ",(0,r.jsx)(s.code,{children:"array.length - array.indexOf(index)"}),"."]})]})]})]}),"\n",(0,r.jsx)(s.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(s.p,{children:(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/AoaSystemSelector",children:(0,r.jsx)(s.code,{children:"AoaSystemSelector"})})}),"\n",(0,r.jsx)(s.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(s.p,{children:"workingtitle-instruments-epic2/shared/Systems/AoaSystemSelector.ts:56"}),"\n",(0,r.jsx)(s.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(s.h3,{id:"selectedindex",children:"selectedIndex"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"readonly"})," ",(0,r.jsx)(s.strong,{children:"selectedIndex"}),": ",(0,r.jsx)(s.code,{children:"Subscribable"}),"<",(0,r.jsx)(s.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(s.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(s.p,{children:"workingtitle-instruments-epic2/shared/Systems/AoaSystemSelector.ts:22"}),"\n",(0,r.jsx)(s.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(s.h3,{id:"destroy",children:"destroy()"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.strong,{children:"destroy"}),"(): ",(0,r.jsx)(s.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:"Destroys this selector."}),"\n",(0,r.jsx)(s.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsx)(s.p,{children:(0,r.jsx)(s.code,{children:"void"})}),"\n",(0,r.jsx)(s.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(s.p,{children:"workingtitle-instruments-epic2/shared/Systems/AoaSystemSelector.ts:182"}),"\n",(0,r.jsx)(s.hr,{}),"\n",(0,r.jsx)(s.h3,{id:"init",children:"init()"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.strong,{children:"init"}),"(): ",(0,r.jsx)(s.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:"Initializes this selector. Once initialized, this selector will automatically select the best ADC among its\ncandidates."}),"\n",(0,r.jsx)(s.h4,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsx)(s.p,{children:(0,r.jsx)(s.code,{children:"void"})}),"\n",(0,r.jsx)(s.h4,{id:"throws",children:"Throws"}),"\n",(0,r.jsx)(s.p,{children:"Error if this selector has been destroyed."}),"\n",(0,r.jsx)(s.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(s.p,{children:"workingtitle-instruments-epic2/shared/Systems/AoaSystemSelector.ts:86"})]})}function a(e={}){let{wrapper:s}={...(0,t.a)(),...e.components};return s?(0,r.jsx)(s,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},250065:function(e,s,n){n.d(s,{Z:function(){return l},a:function(){return d}});var i=n(667294);let r={},t=i.createContext(r);function d(e){let s=i.useContext(t);return i.useMemo(function(){return"function"==typeof e?e(s):{...s,...e}},[s,e])}function l(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:d(e.components),i.createElement(t.Provider,{value:s},e.children)}}}]);