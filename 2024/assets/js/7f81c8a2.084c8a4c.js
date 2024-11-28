"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["897402"],{345284:function(e,s,n){n.r(s),n.d(s,{metadata:()=>t,contentTitle:()=>c,default:()=>h,assets:()=>d,toc:()=>l,frontMatter:()=>a});var t=JSON.parse('{"id":"api/g1000common/classes/DateTimeUserSettings","title":"Class: DateTimeUserSettings","description":"Utility class for retrieving date/time user setting managers.","source":"@site/docs/api/g1000common/classes/DateTimeUserSettings.md","sourceDirName":"api/g1000common/classes","slug":"/api/g1000common/classes/DateTimeUserSettings","permalink":"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/DateTimeUserSettings","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"CylinderTempGaugeTwin","permalink":"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/CylinderTempGaugeTwin"},"next":{"title":"DefaultConfigFactory","permalink":"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/DefaultConfigFactory"}}'),r=n("785893"),i=n("250065");let a={},c="Class: DateTimeUserSettings",d={},l=[{value:"Constructors",id:"constructors",level:2},{value:"new DateTimeUserSettings()",id:"new-datetimeusersettings",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"getLocalManager()",id:"getlocalmanager",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"getManager()",id:"getmanager",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-1",level:4}];function o(e){let s={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,i.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(s.header,{children:(0,r.jsx)(s.h1,{id:"class-datetimeusersettings",children:"Class: DateTimeUserSettings"})}),"\n",(0,r.jsx)(s.p,{children:"Utility class for retrieving date/time user setting managers."}),"\n",(0,r.jsx)(s.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(s.h3,{id:"new-datetimeusersettings",children:"new DateTimeUserSettings()"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.strong,{children:"new DateTimeUserSettings"}),"(): ",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/DateTimeUserSettings",children:(0,r.jsx)(s.code,{children:"DateTimeUserSettings"})})]}),"\n"]}),"\n",(0,r.jsx)(s.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(s.p,{children:(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/classes/DateTimeUserSettings",children:(0,r.jsx)(s.code,{children:"DateTimeUserSettings"})})}),"\n",(0,r.jsx)(s.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(s.h3,{id:"getlocalmanager",children:"getLocalManager()"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"static"})," ",(0,r.jsx)(s.strong,{children:"getLocalManager"}),"(",(0,r.jsx)(s.code,{children:"bus"}),"): ",(0,r.jsx)(s.code,{children:"UserSettingManager"}),"<",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/type-aliases/DateTimeUserSettingTypes",children:(0,r.jsx)(s.code,{children:"DateTimeUserSettingTypes"})}),">"]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:"Retrieves a manager for instrument-local date/time user settings."}),"\n",(0,r.jsx)(s.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(s.table,{children:[(0,r.jsx)(s.thead,{children:(0,r.jsxs)(s.tr,{children:[(0,r.jsx)(s.th,{children:"Parameter"}),(0,r.jsx)(s.th,{children:"Type"}),(0,r.jsx)(s.th,{children:"Description"})]})}),(0,r.jsx)(s.tbody,{children:(0,r.jsxs)(s.tr,{children:[(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"bus"})}),(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"EventBus"})}),(0,r.jsx)(s.td,{children:"The event bus."})]})})]}),"\n",(0,r.jsx)(s.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"UserSettingManager"}),"<",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/type-aliases/DateTimeUserSettingTypes",children:(0,r.jsx)(s.code,{children:"DateTimeUserSettingTypes"})}),">"]}),"\n",(0,r.jsx)(s.p,{children:"A manager for instrument-local date/time user settings."}),"\n",(0,r.jsx)(s.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(s.p,{children:"garminsdk/settings/DateTimeUserSettings.ts:59"}),"\n",(0,r.jsx)(s.hr,{}),"\n",(0,r.jsx)(s.h3,{id:"getmanager",children:"getManager()"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"static"})," ",(0,r.jsx)(s.strong,{children:"getManager"}),"(",(0,r.jsx)(s.code,{children:"bus"}),"): ",(0,r.jsx)(s.code,{children:"UserSettingManager"}),"<",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/type-aliases/DateTimeUserSettingTypes",children:(0,r.jsx)(s.code,{children:"DateTimeUserSettingTypes"})}),">"]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:"Retrieves a manager for date/time user settings."}),"\n",(0,r.jsx)(s.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(s.table,{children:[(0,r.jsx)(s.thead,{children:(0,r.jsxs)(s.tr,{children:[(0,r.jsx)(s.th,{children:"Parameter"}),(0,r.jsx)(s.th,{children:"Type"}),(0,r.jsx)(s.th,{children:"Description"})]})}),(0,r.jsx)(s.tbody,{children:(0,r.jsxs)(s.tr,{children:[(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"bus"})}),(0,r.jsx)(s.td,{children:(0,r.jsx)(s.code,{children:"EventBus"})}),(0,r.jsx)(s.td,{children:"The event bus."})]})})]}),"\n",(0,r.jsx)(s.h4,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"UserSettingManager"}),"<",(0,r.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/g1000common/type-aliases/DateTimeUserSettingTypes",children:(0,r.jsx)(s.code,{children:"DateTimeUserSettingTypes"})}),">"]}),"\n",(0,r.jsx)(s.p,{children:"A manager for date/time user settings."}),"\n",(0,r.jsx)(s.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(s.p,{children:"garminsdk/settings/DateTimeUserSettings.ts:42"})]})}function h(e={}){let{wrapper:s}={...(0,i.a)(),...e.components};return s?(0,r.jsx)(s,{...e,children:(0,r.jsx)(o,{...e})}):o(e)}},250065:function(e,s,n){n.d(s,{Z:function(){return c},a:function(){return a}});var t=n(667294);let r={},i=t.createContext(r);function a(e){let s=t.useContext(i);return t.useMemo(function(){return"function"==typeof e?e(s):{...s,...e}},[s,e])}function c(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:a(e.components),t.createElement(i.Provider,{value:s},e.children)}}}]);