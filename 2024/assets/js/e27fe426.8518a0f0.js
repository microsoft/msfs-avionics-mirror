"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["337829"],{942656:function(e,n,s){s.r(n),s.d(n,{metadata:()=>r,contentTitle:()=>l,default:()=>o,assets:()=>a,toc:()=>c,frontMatter:()=>t});var r=JSON.parse('{"id":"api/g3000common/classes/G3000UserSettingSaveManager","title":"Class: G3000UserSettingSaveManager","description":"A manager for G3000 user settings that are saved and persistent across flight sessions.","source":"@site/docs/api/g3000common/classes/G3000UserSettingSaveManager.md","sourceDirName":"api/g3000common/classes","slug":"/api/g3000common/classes/G3000UserSettingSaveManager","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/G3000UserSettingSaveManager","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"G3000RadioUtils","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/G3000RadioUtils"},"next":{"title":"G3000Version","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/G3000Version"}}'),i=s("785893"),d=s("250065");let t={},l="Class: G3000UserSettingSaveManager",a={},c=[{value:"Extends",id:"extends",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new G3000UserSettingSaveManager()",id:"new-g3000usersettingsavemanager",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"load()",id:"load",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Throws",id:"throws",level:4},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"save()",id:"save",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Throws",id:"throws-1",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"startAutoSave()",id:"startautosave",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Throws",id:"throws-2",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"stopAutoSave()",id:"stopautosave",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Throws",id:"throws-3",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"class-g3000usersettingsavemanager",children:"Class: G3000UserSettingSaveManager"})}),"\n",(0,i.jsx)(n.p,{children:"A manager for G3000 user settings that are saved and persistent across flight sessions."}),"\n",(0,i.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.code,{children:"UserSettingSaveManager"})}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(n.h3,{id:"new-g3000usersettingsavemanager",children:"new G3000UserSettingSaveManager()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"new G3000UserSettingSaveManager"}),"(",(0,i.jsx)(n.code,{children:"bus"}),", ",(0,i.jsx)(n.code,{children:"config"}),", ",(0,i.jsx)(n.code,{children:"pluginSettings"}),", ",(0,i.jsx)(n.code,{children:"fmsSpeedSettingManager"}),", ",(0,i.jsx)(n.code,{children:"weightBalanceSettingManager"}),"): ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/G3000UserSettingSaveManager",children:(0,i.jsx)(n.code,{children:"G3000UserSettingSaveManager"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Constructor."}),"\n",(0,i.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"bus"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"EventBus"})}),(0,i.jsx)(n.td,{children:"The event bus."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"config"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/AvionicsConfig",children:(0,i.jsx)(n.code,{children:"AvionicsConfig"})})}),(0,i.jsx)(n.td,{children:"A configuration object defining avionics options."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"pluginSettings"})}),(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"Iterable"}),"<",(0,i.jsx)(n.code,{children:"UserSetting"}),"<",(0,i.jsx)(n.code,{children:"any"}),">>"]}),(0,i.jsx)(n.td,{children:"Additional settings to manage defined by plugins."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"fmsSpeedSettingManager"})}),(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"undefined"})," | ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/FmsSpeedUserSettingManager",children:(0,i.jsx)(n.code,{children:"FmsSpeedUserSettingManager"})})]}),(0,i.jsxs)(n.td,{children:["A setting manager for FMS speed user settings, or ",(0,i.jsx)(n.code,{children:"undefined"})," if FMS speed is not supported."]})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"weightBalanceSettingManager"})}),(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"undefined"})," | ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/WeightBalanceUserSettingManager",children:(0,i.jsx)(n.code,{children:"WeightBalanceUserSettingManager"})})]}),(0,i.jsxs)(n.td,{children:["A setting manager for weight and balance user setting, or ",(0,i.jsx)(n.code,{children:"undefined"})," if weight and balance is not supported."]})]})]})]}),"\n",(0,i.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/G3000UserSettingSaveManager",children:(0,i.jsx)(n.code,{children:"G3000UserSettingSaveManager"})})}),"\n",(0,i.jsx)(n.h4,{id:"overrides",children:"Overrides"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"UserSettingSaveManager.constructor"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/workingtitle-instruments-g3000/html_ui/Shared/Settings/PersistentSettings/G3000UserSettingSaveManager.ts:93"}),"\n",(0,i.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"destroy"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Destroys this manager. Once this manager is destroyed, all active autosaves will be stopped, and attempting to\nsave, load, or start another autosave from this manager will cause an error to be thrown."}),"\n",(0,i.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"UserSettingSaveManager.destroy"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/settings/UserSettingSaveManager.ts:150"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"load",children:"load()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"load"}),"(",(0,i.jsx)(n.code,{children:"key"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Loads the saved values of this manager's settings."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"key"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"string"})}),(0,i.jsx)(n.td,{children:"The key from which to load the values."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,i.jsx)(n.p,{children:"Error if this manager has been destroyed."}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"UserSettingSaveManager.load"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/settings/UserSettingSaveManager.ts:68"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"save",children:"save()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"save"}),"(",(0,i.jsx)(n.code,{children:"key"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Saves the current values of this manager's settings."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"key"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"string"})}),(0,i.jsx)(n.td,{children:"The key to which to save the values."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"throws-1",children:"Throws"}),"\n",(0,i.jsx)(n.p,{children:"Error if this manager has been destroyed."}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"UserSettingSaveManager.save"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/settings/UserSettingSaveManager.ts:88"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"startautosave",children:"startAutoSave()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"startAutoSave"}),"(",(0,i.jsx)(n.code,{children:"key"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Starts automatically saving this manager's settings when their values change."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"key"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"string"})}),(0,i.jsx)(n.td,{children:"The key to which to save the values."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"throws-2",children:"Throws"}),"\n",(0,i.jsx)(n.p,{children:"Error if this manager has been destroyed."}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"UserSettingSaveManager.startAutoSave"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/settings/UserSettingSaveManager.ts:105"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"stopautosave",children:"stopAutoSave()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"stopAutoSave"}),"(",(0,i.jsx)(n.code,{children:"key"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Stops automatically saving this manager's settings when their values change."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"key"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"string"})}),(0,i.jsx)(n.td,{children:"The key to which to stop saving the values."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"throws-3",children:"Throws"}),"\n",(0,i.jsx)(n.p,{children:"Error if this manager has been destroyed."}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"UserSettingSaveManager.stopAutoSave"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/settings/UserSettingSaveManager.ts:128"})]})}function o(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return l},a:function(){return t}});var r=s(667294);let i={},d=r.createContext(i);function t(e){let n=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:t(e.components),r.createElement(d.Provider,{value:n},e.children)}}}]);