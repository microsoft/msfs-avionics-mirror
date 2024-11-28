"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["446064"],{610055:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>l,default:()=>h,assets:()=>c,toc:()=>t,frontMatter:()=>a});var r=JSON.parse('{"id":"api/garminsdk/classes/DefaultTcasRaCommandDataProvider","title":"Class: DefaultTcasRaCommandDataProvider","description":"A default implementation of TcasRaCommandDataProvider.","source":"@site/docs/api/garminsdk/classes/DefaultTcasRaCommandDataProvider.md","sourceDirName":"api/garminsdk/classes","slug":"/api/garminsdk/classes/DefaultTcasRaCommandDataProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/DefaultTcasRaCommandDataProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"DefaultRadarAltimeterDataProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/DefaultRadarAltimeterDataProvider"},"next":{"title":"DefaultTerrainSystemDataProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/DefaultTerrainSystemDataProvider"}}'),s=i("785893"),d=i("250065");let a={},l="Class: DefaultTcasRaCommandDataProvider",c={},t=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new DefaultTcasRaCommandDataProvider()",id:"new-defaulttcasracommanddataprovider",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"raFlyToMaxVs",id:"raflytomaxvs",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"raFlyToMinVs",id:"raflytominvs",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"raMaxVs",id:"ramaxvs",level:3},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"raMinVs",id:"raminvs",level:3},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"tcas",id:"tcas",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"init()",id:"init",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"pause()",id:"pause",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Throws",id:"throws-1",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"resume()",id:"resume",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Throws",id:"throws-2",level:4},{value:"Defined in",id:"defined-in-9",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"class-defaulttcasracommanddataprovider",children:"Class: DefaultTcasRaCommandDataProvider"})}),"\n",(0,s.jsxs)(n.p,{children:["A default implementation of ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/TcasRaCommandDataProvider",children:"TcasRaCommandDataProvider"}),"."]}),"\n",(0,s.jsx)(n.h2,{id:"implements",children:"Implements"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/TcasRaCommandDataProvider",children:(0,s.jsx)(n.code,{children:"TcasRaCommandDataProvider"})})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,s.jsx)(n.h3,{id:"new-defaulttcasracommanddataprovider",children:"new DefaultTcasRaCommandDataProvider()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"new DefaultTcasRaCommandDataProvider"}),"(",(0,s.jsx)(n.code,{children:"bus"}),", ",(0,s.jsx)(n.code,{children:"tcas"}),"): ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/DefaultTcasRaCommandDataProvider",children:(0,s.jsx)(n.code,{children:"DefaultTcasRaCommandDataProvider"})})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Constructor."}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"bus"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"EventBus"})}),(0,s.jsx)(n.td,{children:"The event bus."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"tcas"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"Tcas"}),"<",(0,s.jsx)(n.code,{children:"AbstractTcasIntruder"}),", ",(0,s.jsx)(n.code,{children:"TcasSensitivity"}),"<",(0,s.jsx)(n.code,{children:"TcasIntruder"}),">>"]}),(0,s.jsx)(n.td,{children:"The TCAS which from which this data provider sources resolution advisory commands."})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/DefaultTcasRaCommandDataProvider",children:(0,s.jsx)(n.code,{children:"DefaultTcasRaCommandDataProvider"})})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/traffic/TcasRaCommandDataProvider.ts:67"}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"raflytomaxvs",children:"raFlyToMaxVs"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"raFlyToMaxVs"}),": ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"null"})," | ",(0,s.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The upper bound vertical speed, in feet per minute, of the current resolution advisory's fly-to command, or\n",(0,s.jsx)(n.code,{children:"null"})," if there is no such value."]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/TcasRaCommandDataProvider",children:(0,s.jsx)(n.code,{children:"TcasRaCommandDataProvider"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/TcasRaCommandDataProvider#raflytomaxvs",children:(0,s.jsx)(n.code,{children:"raFlyToMaxVs"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/traffic/TcasRaCommandDataProvider.ts:54"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"raflytominvs",children:"raFlyToMinVs"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"raFlyToMinVs"}),": ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"null"})," | ",(0,s.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The lower bound vertical speed, in feet per minute, of the current resolution advisory's fly-to command, or\n",(0,s.jsx)(n.code,{children:"null"})," if there is no such value."]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-1",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/TcasRaCommandDataProvider",children:(0,s.jsx)(n.code,{children:"TcasRaCommandDataProvider"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/TcasRaCommandDataProvider#raflytominvs",children:(0,s.jsx)(n.code,{children:"raFlyToMinVs"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/traffic/TcasRaCommandDataProvider.ts:50"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"ramaxvs",children:"raMaxVs"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"raMaxVs"}),": ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"null"})," | ",(0,s.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The maximum allowed vertical speed, in feet per minute, commanded by the current resolution advisory, or ",(0,s.jsx)(n.code,{children:"null"}),"\nif there is no such value."]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-2",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/TcasRaCommandDataProvider",children:(0,s.jsx)(n.code,{children:"TcasRaCommandDataProvider"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/TcasRaCommandDataProvider#ramaxvs",children:(0,s.jsx)(n.code,{children:"raMaxVs"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/traffic/TcasRaCommandDataProvider.ts:46"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"raminvs",children:"raMinVs"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"raMinVs"}),": ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"null"})," | ",(0,s.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The minimum allowed vertical speed, in feet per minute, commanded by the current resolution advisory, or ",(0,s.jsx)(n.code,{children:"null"}),"\nif there is no such value."]}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-3",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/TcasRaCommandDataProvider",children:(0,s.jsx)(n.code,{children:"TcasRaCommandDataProvider"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/TcasRaCommandDataProvider#raminvs",children:(0,s.jsx)(n.code,{children:"raMinVs"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/traffic/TcasRaCommandDataProvider.ts:42"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"tcas",children:"tcas"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"tcas"}),": ",(0,s.jsx)(n.code,{children:"Tcas"}),"<",(0,s.jsx)(n.code,{children:"AbstractTcasIntruder"}),", ",(0,s.jsx)(n.code,{children:"TcasSensitivity"}),"<",(0,s.jsx)(n.code,{children:"TcasIntruder"}),">>"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The TCAS which from which this data provider sources resolution advisory commands."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/traffic/TcasRaCommandDataProvider.ts:67"}),"\n",(0,s.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"destroy"}),"(): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can\nno longer be paused or resumed."}),"\n",(0,s.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/traffic/TcasRaCommandDataProvider.ts:219"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"init",children:"init()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"init"}),"(",(0,s.jsx)(n.code,{children:"paused"}),"): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Initializes this data provider. Once initialized, this data provider will continuously update its data until\npaused or destroyed."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Default value"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"paused"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"boolean"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"false"})}),(0,s.jsxs)(n.td,{children:["Whether to initialize this data provider as paused. If ",(0,s.jsx)(n.code,{children:"true"}),", this data provider will provide an initial set of data but will not update the provided data until it is resumed. Defaults to ",(0,s.jsx)(n.code,{children:"false"}),"."]})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,s.jsx)(n.p,{children:"Error if this data provider has been destroyed."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/traffic/TcasRaCommandDataProvider.ts:77"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"pause",children:"pause()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"pause"}),"(): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Pauses this data provider. Once paused, this data provider will not update its data until it is resumed."}),"\n",(0,s.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"throws-1",children:"Throws"}),"\n",(0,s.jsx)(n.p,{children:"Error if this data provider has been destroyed."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/traffic/TcasRaCommandDataProvider.ts:201"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"resume",children:"resume()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"resume"}),"(): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or\ndestroyed."}),"\n",(0,s.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"throws-2",children:"Throws"}),"\n",(0,s.jsx)(n.p,{children:"Error if this data provider has been destroyed."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/traffic/TcasRaCommandDataProvider.ts:182"})]})}function h(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(o,{...e})}):o(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return l},a:function(){return a}});var r=i(667294);let s={},d=r.createContext(s);function a(e){let n=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),r.createElement(d.Provider,{value:n},e.children)}}}]);