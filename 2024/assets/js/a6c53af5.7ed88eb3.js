"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["551049"],{920580:function(e,r,l){l.r(r),l.d(r,{metadata:()=>a,contentTitle:()=>s,default:()=>u,assets:()=>d,toc:()=>c,frontMatter:()=>t});var a=JSON.parse('{"id":"api/framework/interfaces/AuralAlertControlEvents","title":"Interface: AuralAlertControlEvents","description":"Events used to send commands to AuralAlertSystem.","source":"@site/docs/api/framework/interfaces/AuralAlertControlEvents.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/AuralAlertControlEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/AuralAlertControlEvents","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"APValues","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/APValues"},"next":{"title":"AuralAlertEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/AuralAlertEvents"}}'),n=l("785893"),i=l("250065");let t={},s="Interface: AuralAlertControlEvents",d={},c=[{value:"Properties",id:"properties",level:2},{value:"aural_alert_activate",id:"aural_alert_activate",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"aural_alert_deactivate",id:"aural_alert_deactivate",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"aural_alert_deactivate_all",id:"aural_alert_deactivate_all",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"aural_alert_kill",id:"aural_alert_kill",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"aural_alert_kill_all",id:"aural_alert_kill_all",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"aural_alert_register",id:"aural_alert_register",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"aural_alert_trigger",id:"aural_alert_trigger",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"aural_alert_untrigger",id:"aural_alert_untrigger",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"aural_alert_untrigger_all",id:"aural_alert_untrigger_all",level:3},{value:"Defined in",id:"defined-in-8",level:4}];function o(e){let r={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",...(0,i.a)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.header,{children:(0,n.jsx)(r.h1,{id:"interface-auralalertcontrolevents",children:"Interface: AuralAlertControlEvents"})}),"\n",(0,n.jsxs)(r.p,{children:["Events used to send commands to ",(0,n.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AuralAlertSystem",children:"AuralAlertSystem"}),"."]}),"\n",(0,n.jsx)(r.h2,{id:"properties",children:"Properties"}),"\n",(0,n.jsx)(r.h3,{id:"aural_alert_activate",children:"aural_alert_activate"}),"\n",(0,n.jsxs)(r.blockquote,{children:["\n",(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:"aural_alert_activate"}),": ",(0,n.jsx)(r.code,{children:"string"})," | ",(0,n.jsx)(r.code,{children:"Readonly"}),"<",(0,n.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/AuralAlertActivation",children:(0,n.jsx)(r.code,{children:"AuralAlertActivation"})}),">"]}),"\n"]}),"\n",(0,n.jsx)(r.p,{children:"Activates an aural alert. The event data should be the unique ID of the alert or an activation data object that\ncontains the unique ID and optional override parameters. If no override parameters are provided, then the alert\nwill play as it was defined during registration."}),"\n",(0,n.jsx)(r.p,{children:"Once activated, the alert will be queued to play once all higher-priority alerts that are playing or queued have\nfinished playing. If the alert is already active, then this command has no effect."}),"\n",(0,n.jsx)(r.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,n.jsx)(r.p,{children:"src/sdk/utils/sound/AuralAlertSystem.ts:170"}),"\n",(0,n.jsx)(r.hr,{}),"\n",(0,n.jsx)(r.h3,{id:"aural_alert_deactivate",children:"aural_alert_deactivate"}),"\n",(0,n.jsxs)(r.blockquote,{children:["\n",(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:"aural_alert_deactivate"}),": ",(0,n.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,n.jsx)(r.p,{children:"Deactivates an aural alert. The event data should be an (optionally suffixed) alert ID. An alert is considered\ndeactivated only when all of its suffixes are deactivated (the un-suffixed ID also counts as a suffix)."}),"\n",(0,n.jsx)(r.p,{children:"Deactivating an alert will clear any queued activated instances of the alert. If the activated alert is already\nplaying, it will finish playing but will not loop if it is continuous."}),"\n",(0,n.jsx)(r.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,n.jsx)(r.p,{children:"src/sdk/utils/sound/AuralAlertSystem.ts:179"}),"\n",(0,n.jsx)(r.hr,{}),"\n",(0,n.jsx)(r.h3,{id:"aural_alert_deactivate_all",children:"aural_alert_deactivate_all"}),"\n",(0,n.jsxs)(r.blockquote,{children:["\n",(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:"aural_alert_deactivate_all"}),": ",(0,n.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,n.jsx)(r.p,{children:"Deactivates all aural alerts."}),"\n",(0,n.jsx)(r.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,n.jsx)(r.p,{children:"src/sdk/utils/sound/AuralAlertSystem.ts:211"}),"\n",(0,n.jsx)(r.hr,{}),"\n",(0,n.jsx)(r.h3,{id:"aural_alert_kill",children:"aural_alert_kill"}),"\n",(0,n.jsxs)(r.blockquote,{children:["\n",(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:"aural_alert_kill"}),": ",(0,n.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,n.jsx)(r.p,{children:"Kills an aural alert. The event data should be an (optionally suffixed) alert ID."}),"\n",(0,n.jsx)(r.p,{children:"Killing an alert will deactivate and untrigger the alert. If the alert is already playing, it will be stopped at\nthe earliest opportunity."}),"\n",(0,n.jsx)(r.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,n.jsx)(r.p,{children:"src/sdk/utils/sound/AuralAlertSystem.ts:208"}),"\n",(0,n.jsx)(r.hr,{}),"\n",(0,n.jsx)(r.h3,{id:"aural_alert_kill_all",children:"aural_alert_kill_all"}),"\n",(0,n.jsxs)(r.blockquote,{children:["\n",(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:"aural_alert_kill_all"}),": ",(0,n.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,n.jsx)(r.p,{children:"Kills all aural alerts."}),"\n",(0,n.jsx)(r.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,n.jsx)(r.p,{children:"src/sdk/utils/sound/AuralAlertSystem.ts:217"}),"\n",(0,n.jsx)(r.hr,{}),"\n",(0,n.jsx)(r.h3,{id:"aural_alert_register",children:"aural_alert_register"}),"\n",(0,n.jsxs)(r.blockquote,{children:["\n",(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:"aural_alert_register"}),": ",(0,n.jsx)(r.code,{children:"Readonly"}),"<",(0,n.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/AuralAlertDefinition",children:(0,n.jsx)(r.code,{children:"AuralAlertDefinition"})}),">"]}),"\n"]}),"\n",(0,n.jsx)(r.p,{children:"Registers an aural alert. Alerts must be registered before they can be activated."}),"\n",(0,n.jsx)(r.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,n.jsx)(r.p,{children:"src/sdk/utils/sound/AuralAlertSystem.ts:160"}),"\n",(0,n.jsx)(r.hr,{}),"\n",(0,n.jsx)(r.h3,{id:"aural_alert_trigger",children:"aural_alert_trigger"}),"\n",(0,n.jsxs)(r.blockquote,{children:["\n",(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:"aural_alert_trigger"}),": ",(0,n.jsx)(r.code,{children:"string"})," | ",(0,n.jsx)(r.code,{children:"Readonly"}),"<",(0,n.jsx)(r.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/AuralAlertActivation",children:(0,n.jsx)(r.code,{children:"AuralAlertActivation"})}),">"]}),"\n"]}),"\n",(0,n.jsx)(r.p,{children:"Triggers an aural alert. The event data should be the unique ID of the alert or an activation data object that\ncontains the unique ID and optional override parameters. If no override parameters are provided, then the alert\nwill play as it was defined during registration."}),"\n",(0,n.jsx)(r.p,{children:"Once triggered, the alert will be queued to play once all higher-priority alerts that are playing or queued have\nfinished playing. A triggered alert is not considered active. Triggering an alert while an existing triggered\ninstance is queued will replace the existing instance with the new instance. Triggered alerts automatically\nrevert to an untriggered state after they are finished playing."}),"\n",(0,n.jsx)(r.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,n.jsx)(r.p,{children:"src/sdk/utils/sound/AuralAlertSystem.ts:191"}),"\n",(0,n.jsx)(r.hr,{}),"\n",(0,n.jsx)(r.h3,{id:"aural_alert_untrigger",children:"aural_alert_untrigger"}),"\n",(0,n.jsxs)(r.blockquote,{children:["\n",(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:"aural_alert_untrigger"}),": ",(0,n.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,n.jsx)(r.p,{children:"Untriggers an aural alert. The event data should be an (optionally suffixed) alert ID. An alert is considered\nuntriggered only when all of its suffixes are deactivated (the un-suffixed ID also counts as a suffix)."}),"\n",(0,n.jsx)(r.p,{children:"Untriggering an alert will clear any queued triggered instances of the alert. If the triggered alert is already\nplaying, it will finish playing but will not loop if it is continuous."}),"\n",(0,n.jsx)(r.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,n.jsx)(r.p,{children:"src/sdk/utils/sound/AuralAlertSystem.ts:200"}),"\n",(0,n.jsx)(r.hr,{}),"\n",(0,n.jsx)(r.h3,{id:"aural_alert_untrigger_all",children:"aural_alert_untrigger_all"}),"\n",(0,n.jsxs)(r.blockquote,{children:["\n",(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:"aural_alert_untrigger_all"}),": ",(0,n.jsx)(r.code,{children:"void"})]}),"\n"]}),"\n",(0,n.jsx)(r.p,{children:"Untriggers all aural alerts."}),"\n",(0,n.jsx)(r.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,n.jsx)(r.p,{children:"src/sdk/utils/sound/AuralAlertSystem.ts:214"})]})}function u(e={}){let{wrapper:r}={...(0,i.a)(),...e.components};return r?(0,n.jsx)(r,{...e,children:(0,n.jsx)(o,{...e})}):o(e)}},250065:function(e,r,l){l.d(r,{Z:function(){return s},a:function(){return t}});var a=l(667294);let n={},i=a.createContext(n);function t(e){let r=a.useContext(i);return a.useMemo(function(){return"function"==typeof e?e(r):{...r,...e}},[r,e])}function s(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:t(e.components),a.createElement(i.Provider,{value:r},e.children)}}}]);