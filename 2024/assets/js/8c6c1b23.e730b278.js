"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["790118"],{23258:function(e,n,i){i.r(n),i.d(n,{metadata:()=>t,contentTitle:()=>o,default:()=>h,assets:()=>a,toc:()=>c,frontMatter:()=>s});var t=JSON.parse('{"id":"api/framework/type-aliases/AuralAlertDefinition","title":"Type Alias: AuralAlertDefinition","description":"AuralAlertDefinition: object","source":"@site/docs/api/framework/type-aliases/AuralAlertDefinition.md","sourceDirName":"api/framework/type-aliases","slug":"/api/framework/type-aliases/AuralAlertDefinition","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/AuralAlertDefinition","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"AuralAlertActivation","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/AuralAlertActivation"},"next":{"title":"AutopilotDriverOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/AutopilotDriverOptions"}}'),r=i("785893"),l=i("250065");let s={},o="Type Alias: AuralAlertDefinition",a={},c=[{value:"Type declaration",id:"type-declaration",level:2},{value:"continuous",id:"continuous",level:3},{value:"priority",id:"priority",level:3},{value:"queue",id:"queue",level:3},{value:"queuedLifetime?",id:"queuedlifetime",level:3},{value:"repeat",id:"repeat",level:3},{value:"sequence",id:"sequence",level:3},{value:"timeout?",id:"timeout",level:3},{value:"track?",id:"track",level:3},{value:"uuid",id:"uuid",level:3},{value:"Defined in",id:"defined-in",level:2}];function d(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",strong:"strong",...(0,l.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"type-alias-auralalertdefinition",children:"Type Alias: AuralAlertDefinition"})}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"AuralAlertDefinition"}),": ",(0,r.jsx)(n.code,{children:"object"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["A sound packet that can be played by ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/SoundServer",children:"SoundServer"}),"."]}),"\n",(0,r.jsx)(n.h2,{id:"type-declaration",children:"Type declaration"}),"\n",(0,r.jsx)(n.h3,{id:"continuous",children:"continuous"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"continuous"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Whether the alert's sound sequence should loop from the beginning when it is finished playing. If ",(0,r.jsx)(n.code,{children:"true"}),", then the\nalert effectively has an infinite duration, and once it starts playing it will never stop until forced to do so by\na deactivate, untrigger, or kill command."]}),"\n",(0,r.jsx)(n.h3,{id:"priority",children:"priority"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"priority"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The priority of the alert within its queue. If two alerts in the same queue become active at the same time, the\nalert with the higher priority will play first. However, alerts cannot interrupt other alerts that are already\nplaying, regardless of their relative priorities."}),"\n",(0,r.jsx)(n.h3,{id:"queue",children:"queue"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"queue"}),": ",(0,r.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The name of the queue to which the alert belongs. Only one alert from each queue can play simultaneously unless\nthey are on different tracks (see the documentation for ",(0,r.jsx)(n.code,{children:"track"})," for more information)."]}),"\n",(0,r.jsx)(n.h3,{id:"queuedlifetime",children:"queuedLifetime?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"queuedLifetime"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The amount of time, in milliseconds, that the alert can remain in the queue before it is automatically removed\nfrom the queue. Defaults to ",(0,r.jsx)(n.code,{children:"Infinity"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"repeat",children:"repeat"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"repeat"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Whether the alert should be requeued after it finishes playing if it is still active. If ",(0,r.jsx)(n.code,{children:"true"}),", then the alert\nwill play continuously while active as long as another alert of higher priority is not queued."]}),"\n",(0,r.jsx)(n.h3,{id:"sequence",children:"sequence"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"sequence"}),": ",(0,r.jsx)(n.code,{children:"string"})," | readonly ",(0,r.jsx)(n.code,{children:"string"}),"[]"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The sequence of sound atoms to play for the alert, as either a single ID or an array of IDs. Each atom is a single\nsound file."}),"\n",(0,r.jsx)(n.h3,{id:"timeout",children:"timeout?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"timeout"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The amount of time, in milliseconds, after the alert starts playing at which to forcibly stop the alert. It is\nrecommended to set this value to be at least several seconds longer than the expected length of the alert's\nentire sequence. If the alert is continuous, the timeout is reset with each loop. Defaults to 10000 milliseconds."}),"\n",(0,r.jsx)(n.h3,{id:"track",children:"track?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"track"}),": ",(0,r.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The name of the track on which to play the alert. Each queue has an arbitrary number of tracks. Alerts on\ndifferent tracks can play at the same time. However, an alert will still wait until all other alerts in the same\nqueue with higher priority are finished playing before it starts playing, even if the other alerts are playing on\ndifferent tracks. If not defined, then the alert will play on the default track (with name equal to ",(0,r.jsx)(n.code,{children:"''"}),")."]}),"\n",(0,r.jsx)(n.h3,{id:"uuid",children:"uuid"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"uuid"}),": ",(0,r.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The ID of the alert."}),"\n",(0,r.jsx)(n.h2,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/sound/AuralAlertSystem.ts:12"})]})}function h(e={}){let{wrapper:n}={...(0,l.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return o},a:function(){return s}});var t=i(667294);let r={},l=t.createContext(r);function s(e){let n=t.useContext(l);return t.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:s(e.components),t.createElement(l.Provider,{value:n},e.children)}}}]);