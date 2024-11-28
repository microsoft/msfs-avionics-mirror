"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["26985"],{294410:function(e,i,n){n.r(i),n.d(i,{metadata:()=>r,contentTitle:()=>l,default:()=>h,assets:()=>a,toc:()=>o,frontMatter:()=>s});var r=JSON.parse('{"id":"api/epic2shared/classes/DefaultRadioAltimeterDataProvider","title":"Class: DefaultRadioAltimeterDataProvider","description":"An altitude air data provider implementation.","source":"@site/docs/api/epic2shared/classes/DefaultRadioAltimeterDataProvider.md","sourceDirName":"api/epic2shared/classes","slug":"/api/epic2shared/classes/DefaultRadioAltimeterDataProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/DefaultRadioAltimeterDataProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"DefaultNavigationSourceDataProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/DefaultNavigationSourceDataProvider"},"next":{"title":"DefaultStallWarningDataProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/DefaultStallWarningDataProvider"}}'),d=n("785893"),t=n("250065");let s={},l="Class: DefaultRadioAltimeterDataProvider",a={},o=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new DefaultRadioAltimeterDataProvider()",id:"new-defaultradioaltimeterdataprovider",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"radioAltitude",id:"radioaltitude",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"init()",id:"init",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherit Doc",id:"inherit-doc",level:4},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"onUpdate()",id:"onupdate",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Inherit Doc",id:"inherit-doc-1",level:4},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"pause()",id:"pause",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"resume()",id:"resume",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-5",level:4}];function c(e){let i={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,t.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(i.header,{children:(0,d.jsx)(i.h1,{id:"class-defaultradioaltimeterdataprovider",children:"Class: DefaultRadioAltimeterDataProvider"})}),"\n",(0,d.jsx)(i.p,{children:"An altitude air data provider implementation."}),"\n",(0,d.jsx)(i.h2,{id:"implements",children:"Implements"}),"\n",(0,d.jsxs)(i.ul,{children:["\n",(0,d.jsx)(i.li,{children:(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/RadioAltimeterDataProvider",children:(0,d.jsx)(i.code,{children:"RadioAltimeterDataProvider"})})}),"\n",(0,d.jsx)(i.li,{children:(0,d.jsx)(i.code,{children:"Instrument"})}),"\n"]}),"\n",(0,d.jsx)(i.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(i.h3,{id:"new-defaultradioaltimeterdataprovider",children:"new DefaultRadioAltimeterDataProvider()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.strong,{children:"new DefaultRadioAltimeterDataProvider"}),"(",(0,d.jsx)(i.code,{children:"bus"}),", ",(0,d.jsx)(i.code,{children:"raIndex"}),"): ",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/DefaultRadioAltimeterDataProvider",children:(0,d.jsx)(i.code,{children:"DefaultRadioAltimeterDataProvider"})})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"Ctor."}),"\n",(0,d.jsx)(i.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(i.table,{children:[(0,d.jsx)(i.thead,{children:(0,d.jsxs)(i.tr,{children:[(0,d.jsx)(i.th,{children:"Parameter"}),(0,d.jsx)(i.th,{children:"Type"}),(0,d.jsx)(i.th,{children:"Description"})]})}),(0,d.jsxs)(i.tbody,{children:[(0,d.jsxs)(i.tr,{children:[(0,d.jsx)(i.td,{children:(0,d.jsx)(i.code,{children:"bus"})}),(0,d.jsx)(i.td,{children:(0,d.jsx)(i.code,{children:"EventBus"})}),(0,d.jsx)(i.td,{children:"The instrument event bus."})]}),(0,d.jsxs)(i.tr,{children:[(0,d.jsx)(i.td,{children:(0,d.jsx)(i.code,{children:"raIndex"})}),(0,d.jsxs)(i.td,{children:[(0,d.jsx)(i.code,{children:"number"})," | ",(0,d.jsx)(i.code,{children:"Subscribable"}),"<",(0,d.jsx)(i.code,{children:"number"}),">"]}),(0,d.jsx)(i.td,{children:"The radio altimeter to use."})]})]})]}),"\n",(0,d.jsx)(i.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/DefaultRadioAltimeterDataProvider",children:(0,d.jsx)(i.code,{children:"DefaultRadioAltimeterDataProvider"})})}),"\n",(0,d.jsx)(i.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Instruments/RadioAltimeterDataProvider.ts:41"}),"\n",(0,d.jsx)(i.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(i.h3,{id:"radioaltitude",children:"radioAltitude"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.code,{children:"readonly"})," ",(0,d.jsx)(i.strong,{children:"radioAltitude"}),": ",(0,d.jsx)(i.code,{children:"Subscribable"}),"<",(0,d.jsx)(i.code,{children:"null"})," | ",(0,d.jsx)(i.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"The current radio altitude, or null when invalid."}),"\n",(0,d.jsx)(i.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/RadioAltimeterDataProvider",children:(0,d.jsx)(i.code,{children:"RadioAltimeterDataProvider"})}),".",(0,d.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/RadioAltimeterDataProvider#radioaltitude",children:(0,d.jsx)(i.code,{children:"radioAltitude"})})]}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Instruments/RadioAltimeterDataProvider.ts:21"}),"\n",(0,d.jsx)(i.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(i.h3,{id:"init",children:"init()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.strong,{children:"init"}),"(): ",(0,d.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(i.h4,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"void"})}),"\n",(0,d.jsx)(i.h4,{id:"inherit-doc",children:"Inherit Doc"}),"\n",(0,d.jsx)(i.h4,{id:"implementation-of-1",children:"Implementation of"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"Instrument.init"})}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Instruments/RadioAltimeterDataProvider.ts:73"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"onupdate",children:"onUpdate()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.strong,{children:"onUpdate"}),"(): ",(0,d.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(i.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"void"})}),"\n",(0,d.jsx)(i.h4,{id:"inherit-doc-1",children:"Inherit Doc"}),"\n",(0,d.jsx)(i.h4,{id:"implementation-of-2",children:"Implementation of"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"Instrument.onUpdate"})}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Instruments/RadioAltimeterDataProvider.ts:78"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"pause",children:"pause()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.strong,{children:"pause"}),"(): ",(0,d.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"Pause the data output."}),"\n",(0,d.jsx)(i.h4,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"void"})}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Instruments/RadioAltimeterDataProvider.ts:93"}),"\n",(0,d.jsx)(i.hr,{}),"\n",(0,d.jsx)(i.h3,{id:"resume",children:"resume()"}),"\n",(0,d.jsxs)(i.blockquote,{children:["\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.strong,{children:"resume"}),"(): ",(0,d.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(i.p,{children:"Resume the data output."}),"\n",(0,d.jsx)(i.h4,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsx)(i.code,{children:"void"})}),"\n",(0,d.jsx)(i.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Instruments/RadioAltimeterDataProvider.ts:100"})]})}function h(e={}){let{wrapper:i}={...(0,t.a)(),...e.components};return i?(0,d.jsx)(i,{...e,children:(0,d.jsx)(c,{...e})}):c(e)}},250065:function(e,i,n){n.d(i,{Z:function(){return l},a:function(){return s}});var r=n(667294);let d={},t=r.createContext(d);function s(e){let i=r.useContext(t);return r.useMemo(function(){return"function"==typeof e?e(i):{...i,...e}},[i,e])}function l(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:s(e.components),r.createElement(t.Provider,{value:i},e.children)}}}]);