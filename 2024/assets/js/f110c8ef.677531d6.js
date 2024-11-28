"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["925419"],{354151:function(e,n,r){r.r(n),r.d(n,{metadata:()=>d,contentTitle:()=>c,default:()=>a,assets:()=>l,toc:()=>h,frontMatter:()=>t});var d=JSON.parse('{"id":"api/garminsdk/classes/PfdDeclutterManager","title":"Class: PfdDeclutterManager","description":"A manager for the PFD declutter feature. Keeps track of whether the PFD should be decluttered due to unusual","source":"@site/docs/api/garminsdk/classes/PfdDeclutterManager.md","sourceDirName":"api/garminsdk/classes","slug":"/api/garminsdk/classes/PfdDeclutterManager","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/PfdDeclutterManager","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"NumberUnitDisplay","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NumberUnitDisplay"},"next":{"title":"PfdTrafficAnnunciation","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/PfdTrafficAnnunciation"}}'),s=r("785893"),i=r("250065");let t={},c="Class: PfdDeclutterManager",l={},h=[{value:"Constructors",id:"constructors",level:2},{value:"new PfdDeclutterManager()",id:"new-pfddecluttermanager",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"declutter",id:"declutter",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"init()",id:"init",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-3",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,i.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"class-pfddecluttermanager",children:"Class: PfdDeclutterManager"})}),"\n",(0,s.jsxs)(n.p,{children:["A manager for the PFD declutter feature. Keeps track of whether the PFD should be decluttered due to unusual\nairplane attitudes and exposes that information as a subscribable through the ",(0,s.jsx)(n.code,{children:"declutter"})," property."]}),"\n",(0,s.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,s.jsx)(n.h3,{id:"new-pfddecluttermanager",children:"new PfdDeclutterManager()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"new PfdDeclutterManager"}),"(",(0,s.jsx)(n.code,{children:"bus"}),", ",(0,s.jsx)(n.code,{children:"ahrsIndex"}),", ",(0,s.jsx)(n.code,{children:"pitchUpThreshold"}),", ",(0,s.jsx)(n.code,{children:"pitchDownThreshold"}),", ",(0,s.jsx)(n.code,{children:"rollThreshold"}),", ",(0,s.jsx)(n.code,{children:"pitchUpHysteresis"}),", ",(0,s.jsx)(n.code,{children:"pitchDownHysteresis"}),", ",(0,s.jsx)(n.code,{children:"rollHysteresis"}),"): ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/PfdDeclutterManager",children:(0,s.jsx)(n.code,{children:"PfdDeclutterManager"})})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Constructor."}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Default value"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"bus"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"EventBus"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"undefined"})}),(0,s.jsx)(n.td,{children:"The event bus."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"ahrsIndex"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"number"})," | ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"undefined"})}),(0,s.jsx)(n.td,{children:"The index of the AHRS that is the source of the attitude data used by this manager."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"pitchUpThreshold"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"number"})," | ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"30"})}),(0,s.jsx)(n.td,{children:"The pitch up threshold for declutter, in degrees. Defaults to 30 degrees."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"pitchDownThreshold"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"number"})," | ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"-20"})}),(0,s.jsx)(n.td,{children:"The pitch down threshold for declutter, in degrees. Defaults to -20 degrees."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"rollThreshold"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"number"})," | ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"65"})}),(0,s.jsx)(n.td,{children:"The roll threshold for declutter, in degrees, in either direction. Defaults to 65 degrees."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"pitchUpHysteresis"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"number"})," | ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"5"})}),(0,s.jsx)(n.td,{children:"The hysteresis to apply for the pitch up threshold, in degrees. Defaults to 5 degrees."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"pitchDownHysteresis"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"number"})," | ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"5"})}),(0,s.jsx)(n.td,{children:"The hysteresis to apply for the pitch down threshold, in degrees. Defaults to 5 degrees."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"rollHysteresis"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"number"})," | ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"5"})}),(0,s.jsx)(n.td,{children:"The hysteresis to apply for the roll threshold, in degrees. Defaults to 5 degrees."})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/PfdDeclutterManager",children:(0,s.jsx)(n.code,{children:"PfdDeclutterManager"})})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/PfdDeclutterManager.ts:48"}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"declutter",children:"declutter"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"declutter"}),": ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Whether the PFD should be decluttered."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/PfdDeclutterManager.ts:11"}),"\n",(0,s.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"destroy"}),"(): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Destroys this manager."}),"\n",(0,s.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/PfdDeclutterManager.ts:122"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"init",children:"init()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"init"}),"(): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Initializes this manager. Once initialized, this manager will automatically keep track of whether the PFD should\nbe decluttered until it is destroyed."}),"\n",(0,s.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,s.jsx)(n.p,{children:"Error if this manager has been destroyed."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/PfdDeclutterManager.ts:72"})]})}function a(e={}){let{wrapper:n}={...(0,i.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(o,{...e})}):o(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return c},a:function(){return t}});var d=r(667294);let s={},i=d.createContext(s);function t(e){let n=d.useContext(i);return d.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:t(e.components),d.createElement(i.Provider,{value:n},e.children)}}}]);