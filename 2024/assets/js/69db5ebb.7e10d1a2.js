"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["900652"],{87676:function(e,n,s){s.r(n),s.d(n,{metadata:()=>i,contentTitle:()=>l,default:()=>a,assets:()=>c,toc:()=>h,frontMatter:()=>t});var i=JSON.parse('{"id":"api/epic2shared/classes/Gpws","title":"Class: Gpws","description":"A GPWS system.","source":"@site/docs/api/epic2shared/classes/Gpws.md","sourceDirName":"api/epic2shared/classes","slug":"/api/epic2shared/classes/Gpws","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/Gpws","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"GpsSource","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/GpsSource"},"next":{"title":"HeadingBug","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/HeadingBug"}}'),d=s("785893"),r=s("250065");let t={},l="Class: Gpws",c={},h=[{value:"Constructors",id:"constructors",level:2},{value:"new Gpws()",id:"new-gpws",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"addModule()",id:"addmodule",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"init()",id:"init",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"isPowered()",id:"ispowered",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"setPowered()",id:"setpowered",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-5",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,r.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"class-gpws",children:"Class: Gpws"})}),"\n",(0,d.jsx)(n.p,{children:"A GPWS system."}),"\n",(0,d.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(n.h3,{id:"new-gpws",children:"new Gpws()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"new Gpws"}),"(",(0,d.jsx)(n.code,{children:"bus"}),", ",(0,d.jsx)(n.code,{children:"fmsPosIndex"}),", ",(0,d.jsx)(n.code,{children:"facLoader"}),", ",(0,d.jsx)(n.code,{children:"apDataProvider"}),"): ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/Gpws",children:(0,d.jsx)(n.code,{children:"Gpws"})})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Creates a new instance of Gpws."}),"\n",(0,d.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"bus"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"EventBus"})}),(0,d.jsx)(n.td,{children:"The event bus."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"fmsPosIndex"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"number"})," | ",(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"number"}),">"]}),(0,d.jsx)(n.td,{children:"The index of the FMS geo-positioning system from which to source data."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"facLoader"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"FacilityLoader"})}),(0,d.jsx)(n.td,{children:"The facility loader."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"apDataProvider"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/AutopilotDataProvider",children:(0,d.jsx)(n.code,{children:"AutopilotDataProvider"})})}),(0,d.jsx)(n.td,{children:"The autopilot data provider."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/Gpws",children:(0,d.jsx)(n.code,{children:"Gpws"})})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/GPWS/Gpws.ts:109"}),"\n",(0,d.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(n.h3,{id:"addmodule",children:"addModule()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"addModule"}),"(",(0,d.jsx)(n.code,{children:"module"}),"): ",(0,d.jsx)(n.code,{children:"this"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Adds a module to this system."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"module"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/GpwsModule",children:(0,d.jsx)(n.code,{children:"GpwsModule"})})}),(0,d.jsx)(n.td,{children:"The module to add."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"this"})}),"\n",(0,d.jsx)(n.p,{children:"This system, after the module has been added."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/GPWS/Gpws.ts:144"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"destroy"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Destroys this system."}),"\n",(0,d.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/GPWS/Gpws.ts:364"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"init",children:"init()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"init"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Initializes this system. Once this system is initialized, it will begin collecting data and updating its modules."}),"\n",(0,d.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"Error if this system has been destroyed."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/GPWS/Gpws.ts:158"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"ispowered",children:"isPowered()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"isPowered"}),"(): ",(0,d.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Checks if this system is powered."}),"\n",(0,d.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"boolean"})}),"\n",(0,d.jsx)(n.p,{children:"Whether this is system is powered."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/GPWS/Gpws.ts:238"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"setpowered",children:"setPowered()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"setPowered"}),"(",(0,d.jsx)(n.code,{children:"isPowered"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Sets whether this system is powered."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"isPowered"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"boolean"})}),(0,d.jsx)(n.td,{children:"Whether this system is powered."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/GPWS/Gpws.ts:246"})]})}function a(e={}){let{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(o,{...e})}):o(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return l},a:function(){return t}});var i=s(667294);let d={},r=i.createContext(d);function t(e){let n=i.useContext(r);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:t(e.components),i.createElement(r.Provider,{value:n},e.children)}}}]);