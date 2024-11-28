"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["340757"],{235388:function(e,n,s){s.r(n),s.d(n,{metadata:()=>i,contentTitle:()=>c,default:()=>o,assets:()=>a,toc:()=>d,frontMatter:()=>l});var i=JSON.parse('{"id":"api/g3xtouchcommon/classes/G3XBacklightManager","title":"Class: G3XBacklightManager","description":"A manager for G3X Touch backlight levels. The manager calculates backlight levels for a single GDU based on the","source":"@site/docs/api/g3xtouchcommon/classes/G3XBacklightManager.md","sourceDirName":"api/g3xtouchcommon/classes","slug":"/api/g3xtouchcommon/classes/G3XBacklightManager","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XBacklightManager","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"G3XAutoBacklightManager","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XAutoBacklightManager"},"next":{"title":"G3XBacklightPublisher","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XBacklightPublisher"}}'),r=s("785893"),t=s("250065");let l={},c="Class: G3XBacklightManager",a={},d=[{value:"Constructors",id:"constructors",level:2},{value:"new G3XBacklightManager()",id:"new-g3xbacklightmanager",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"sleep()",id:"sleep",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"wake()",id:"wake",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Throws",id:"throws-1",level:4},{value:"Defined in",id:"defined-in-3",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,t.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"class-g3xbacklightmanager",children:"Class: G3XBacklightManager"})}),"\n",(0,r.jsxs)(n.p,{children:["A manager for G3X Touch backlight levels. The manager calculates backlight levels for a single GDU based on the\nuser-selected backlight mode and publishes the values to a standard G3X backlight level SimVar\n(",(0,r.jsx)(n.code,{children:"L:1:WTG3X_Screen_Backlight_[index]"})," where ",(0,r.jsx)(n.code,{children:"[index]"})," is the GDU index)."]}),"\n",(0,r.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(n.h3,{id:"new-g3xbacklightmanager",children:"new G3XBacklightManager()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"new G3XBacklightManager"}),"(",(0,r.jsx)(n.code,{children:"gduIndex"}),", ",(0,r.jsx)(n.code,{children:"bus"}),", ",(0,r.jsx)(n.code,{children:"settingManager"}),", ",(0,r.jsx)(n.code,{children:"config"}),"): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XBacklightManager",children:(0,r.jsx)(n.code,{children:"G3XBacklightManager"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Creates a new instance of G3XBacklightManager. The manager is initialized as asleep."}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"gduIndex"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})}),(0,r.jsx)(n.td,{children:"The index of this manager's parent GDU."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"bus"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"EventBus"})}),(0,r.jsx)(n.td,{children:"The event bus."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"settingManager"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"UserSettingManager"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/type-aliases/BacklightUserSettingTypes",children:(0,r.jsx)(n.code,{children:"BacklightUserSettingTypes"})}),">"]}),(0,r.jsx)(n.td,{children:"A manager for backlight user settings."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"config"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/BacklightConfig",children:(0,r.jsx)(n.code,{children:"BacklightConfig"})})}),(0,r.jsx)(n.td,{children:"The backlight configuration object."})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XBacklightManager",children:(0,r.jsx)(n.code,{children:"G3XBacklightManager"})})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Backlight/G3XBacklightManager.ts:44"}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"destroy"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Destroys this manager. Once this manager is destroyed, it will no longer publish backlight levels, and cannot be\nawakened or put to sleep."}),"\n",(0,r.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Backlight/G3XBacklightManager.ts:175"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"sleep",children:"sleep()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"sleep"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Puts this manager to sleep. When this manager is asleep, it stops publishing backlight levels."}),"\n",(0,r.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,r.jsx)(n.p,{children:"Error if this manager has been destroyed."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Backlight/G3XBacklightManager.ts:109"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"wake",children:"wake()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"wake"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Wakes this manager. When this manager is awake, it publishes backlight levels for its GDU to the appropriate\nSimVar (",(0,r.jsx)(n.code,{children:"L:1:WTG3X_Screen_Backlight_[index]"})," where ",(0,r.jsx)(n.code,{children:"[index]"})," is the GDU index)."]}),"\n",(0,r.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"throws-1",children:"Throws"}),"\n",(0,r.jsx)(n.p,{children:"Error if this manager has been destroyed."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Backlight/G3XBacklightManager.ts:89"})]})}function o(e={}){let{wrapper:n}={...(0,t.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return c},a:function(){return l}});var i=s(667294);let r={},t=i.createContext(r);function l(e){let n=i.useContext(t);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),i.createElement(t.Provider,{value:n},e.children)}}}]);