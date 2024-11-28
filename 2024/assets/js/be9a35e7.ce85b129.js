"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["562778"],{31102:function(e,n,r){r.r(n),r.d(n,{metadata:()=>s,contentTitle:()=>o,default:()=>u,assets:()=>a,toc:()=>l,frontMatter:()=>t});var s=JSON.parse('{"id":"api/framework/interfaces/SoundServerEvents","title":"Interface: SoundServerEvents","description":"Events published by SoundServer.","source":"@site/docs/api/framework/interfaces/SoundServerEvents.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/SoundServerEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/SoundServerEvents","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"SoundServerControlEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/SoundServerControlEvents"},"next":{"title":"StallWarningEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/StallWarningEvents"}}'),i=r("785893"),d=r("250065");let t={},o="Interface: SoundServerEvents",a={},l=[{value:"Properties",id:"properties",level:2},{value:"sound_server_initialized",id:"sound_server_initialized",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"sound_server_is_awake",id:"sound_server_is_awake",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"sound_server_packet_ended",id:"sound_server_packet_ended",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"sound_server_packet_started",id:"sound_server_packet_started",level:3},{value:"Defined in",id:"defined-in-3",level:4}];function c(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",...(0,d.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"interface-soundserverevents",children:"Interface: SoundServerEvents"})}),"\n",(0,i.jsxs)(n.p,{children:["Events published by ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/SoundServer",children:"SoundServer"}),"."]}),"\n",(0,i.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,i.jsx)(n.h3,{id:"sound_server_initialized",children:"sound_server_initialized"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"sound_server_initialized"}),": ",(0,i.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Whether the sound server is initialized. The sound server will only respond to commands when it has been initialized."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:38"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"sound_server_is_awake",children:"sound_server_is_awake"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"sound_server_is_awake"}),": ",(0,i.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Whether the sound server is awake."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:47"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"sound_server_packet_ended",children:"sound_server_packet_ended"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"sound_server_packet_ended"}),": ",(0,i.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"A sound packet has finished playing. The event data is the key of the packet."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:44"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"sound_server_packet_started",children:"sound_server_packet_started"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"sound_server_packet_started"}),": ",(0,i.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"A sound packet has started playing. The event data is the key of the packet."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:41"})]})}function u(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(c,{...e})}):c(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return o},a:function(){return t}});var s=r(667294);let i={},d=s.createContext(i);function t(e){let n=s.useContext(d);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:t(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);