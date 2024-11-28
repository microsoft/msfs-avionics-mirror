"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["802520"],{659416:function(e,n,i){i.r(n),i.d(n,{metadata:()=>s,contentTitle:()=>t,default:()=>o,assets:()=>c,toc:()=>l,frontMatter:()=>a});var s=JSON.parse('{"id":"api/garminsdk/classes/GarminHeadingSyncManager","title":"Class: GarminHeadingSyncManager","description":"A manager which handles heading sync events for the Garmin autopilot. The manager syncs the autopilot\'s selected","source":"@site/docs/api/garminsdk/classes/GarminHeadingSyncManager.md","sourceDirName":"api/garminsdk/classes","slug":"/api/garminsdk/classes/GarminHeadingSyncManager","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/GarminHeadingSyncManager","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"GarminGoAroundManager","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/GarminGoAroundManager"},"next":{"title":"GarminLowBankManager","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/GarminLowBankManager"}}'),r=i("785893"),d=i("250065");let a={},t="Class: GarminHeadingSyncManager",c={},l=[{value:"Constructors",id:"constructors",level:2},{value:"new GarminHeadingSyncManager()",id:"new-garminheadingsyncmanager",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"init()",id:"init",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"pause()",id:"pause",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Throws",id:"throws-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"reset()",id:"reset",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"resume()",id:"resume",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Throws",id:"throws-2",level:4},{value:"Defined in",id:"defined-in-5",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"class-garminheadingsyncmanager",children:"Class: GarminHeadingSyncManager"})}),"\n",(0,r.jsx)(n.p,{children:"A manager which handles heading sync events for the Garmin autopilot. The manager syncs the autopilot's selected\nheading to current heading in response to heading sync H events. In addition, the manager has option support for\nautomatic adjustment of selected heading during turns while HDG mode is active and for heading sync mode while an\nautopilot NAV mode is active."}),"\n",(0,r.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(n.h3,{id:"new-garminheadingsyncmanager",children:"new GarminHeadingSyncManager()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"new GarminHeadingSyncManager"}),"(",(0,r.jsx)(n.code,{children:"bus"}),", ",(0,r.jsx)(n.code,{children:"ahrsIndex"}),", ",(0,r.jsx)(n.code,{children:"options"}),"?): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/GarminHeadingSyncManager",children:(0,r.jsx)(n.code,{children:"GarminHeadingSyncManager"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Creates a new instance of GarminHeadingSyncManager. The new manager is created uninitialized and paused."}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"bus"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"EventBus"})}),(0,r.jsx)(n.td,{children:"The event bus."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"ahrsIndex"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"number"})," | ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"number"}),">"]}),(0,r.jsx)(n.td,{children:"The index of the AHRS used by the autopilot."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"options"}),"?"]}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/GarminHeadingSyncManagerOptions",children:(0,r.jsx)(n.code,{children:"GarminHeadingSyncManagerOptions"})}),">"]}),(0,r.jsx)(n.td,{children:"Options with which to configure the manager."})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/GarminHeadingSyncManager",children:(0,r.jsx)(n.code,{children:"GarminHeadingSyncManager"})})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/autopilot/GarminHeadingSyncManager.ts:112"}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"destroy"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Destroys this manager."}),"\n",(0,r.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/autopilot/GarminHeadingSyncManager.ts:398"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"init",children:"init()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"init"}),"(): ",(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"void"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Initializes this manager. Once this manager is initialized, it will automatically adjust the autopilot's selected\nheading in response to heading sync H events and whether turn heading adjustment or heading sync mode are active."}),"\n",(0,r.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"void"}),">"]}),"\n",(0,r.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,r.jsx)(n.p,{children:"Error if this manager has been destroyed."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/autopilot/GarminHeadingSyncManager.ts:155"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"pause",children:"pause()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"pause"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Pauses this manager. Once paused, this manager will no longer automatically adjust the autopilot's selected\nheading."}),"\n",(0,r.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"throws-1",children:"Throws"}),"\n",(0,r.jsx)(n.p,{children:"Error if this manager has been destroyed."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/autopilot/GarminHeadingSyncManager.ts:234"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"reset",children:"reset()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"reset"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Resets this manager. Deactivates both turn heading adjustment and heading sync mode if they were active."}),"\n",(0,r.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/autopilot/GarminHeadingSyncManager.ts:258"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"resume",children:"resume()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"resume"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Resumes this manager. Once resumed, this manager will automatically adjust the autopilot's selected heading in\nresponse to heading sync H events and whether turn heading adjustment or heading sync mode are active."}),"\n",(0,r.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"throws-2",children:"Throws"}),"\n",(0,r.jsx)(n.p,{children:"Error if this manager has been destroyed."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/autopilot/GarminHeadingSyncManager.ts:208"})]})}function o(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return t},a:function(){return a}});var s=i(667294);let r={},d=s.createContext(r);function a(e){let n=s.useContext(d);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:a(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);