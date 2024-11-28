"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["919926"],{551131:function(e,n,s){s.r(n),s.d(n,{metadata:()=>i,contentTitle:()=>o,default:()=>c,assets:()=>l,toc:()=>a,frontMatter:()=>t});var i=JSON.parse('{"id":"api/framework/interfaces/SoundServerControlEvents","title":"Interface: SoundServerControlEvents","description":"Events used to send commands to a SoundServer.","source":"@site/docs/api/framework/interfaces/SoundServerControlEvents.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/SoundServerControlEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/SoundServerControlEvents","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"SimpleFmcRendererOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/SimpleFmcRendererOptions"},"next":{"title":"SoundServerEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/SoundServerEvents"}}'),r=s("785893"),d=s("250065");let t={},o="Interface: SoundServerControlEvents",l={},a=[{value:"Properties",id:"properties",level:2},{value:"sound_server_interrupt",id:"sound_server_interrupt",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"sound_server_kill",id:"sound_server_kill",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"sound_server_kill_all",id:"sound_server_kill_all",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"sound_server_play",id:"sound_server_play",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"sound_server_play_sound",id:"sound_server_play_sound",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"sound_server_queue",id:"sound_server_queue",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"sound_server_start_sound",id:"sound_server_start_sound",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"sound_server_stop",id:"sound_server_stop",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"sound_server_stop_all",id:"sound_server_stop_all",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"sound_server_stop_sound",id:"sound_server_stop_sound",level:3},{value:"Defined in",id:"defined-in-9",level:4}];function u(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",...(0,d.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"interface-soundservercontrolevents",children:"Interface: SoundServerControlEvents"})}),"\n",(0,r.jsxs)(n.p,{children:["Events used to send commands to a ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/SoundServer",children:"SoundServer"}),"."]}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"sound_server_interrupt",children:"sound_server_interrupt"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"sound_server_interrupt"}),": ",(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/SoundPacket",children:(0,r.jsx)(n.code,{children:"SoundPacket"})}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Requests a sound packet to be played at the earliest opportunity. If there is no existing packet with the same key\ncurrently being played, the packet will begin playing immediately. Otherwise, the existing packet will be stopped\nthe next time one of its sound atoms finishes playing, any queued packets with the same key will be discarded, and\nthe new packet will begin playing at that time."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:72"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"sound_server_kill",children:"sound_server_kill"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"sound_server_kill"}),": ",(0,r.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Requests that a sound packet stop playing at the earliest opportunity (the next time one of its sound atoms\nfinishes playing). The event data should be the key of the packet to kill. This also prevents any queued packets\nwith the same key from playing."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:86"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"sound_server_kill_all",children:"sound_server_kill_all"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"sound_server_kill_all"}),": ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Requests that all currently playing sound packets stop playing at the earliest opportunity (the next time one of\ntheir sound atoms finishes playing). This also clears all queued packets."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:98"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"sound_server_play",children:"sound_server_play"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"sound_server_play"}),": ",(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/SoundPacket",children:(0,r.jsx)(n.code,{children:"SoundPacket"})}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Requests a sound packet to be played if there is no existing packet with the same key currently being played."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:57"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"sound_server_play_sound",children:"sound_server_play_sound"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"sound_server_play_sound"}),": ",(0,r.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Requests a single sound atom to be played non-continuously. The event data should be the ID of the sound atom to\nplay. Publishing this command is an alias for publishing a ",(0,r.jsx)(n.code,{children:"sound_server_play"})," command with the packet:\n",(0,r.jsx)(n.code,{children:"{ key: id, sequence: id, continuous: false }"}),"."]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:105"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"sound_server_queue",children:"sound_server_queue"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"sound_server_queue"}),": ",(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/SoundPacket",children:(0,r.jsx)(n.code,{children:"SoundPacket"})}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Requests a sound packet to be queued. If there is no existing packet with the same key currently being played, the\npacket will begin playing immediately. Otherwise, the new packet will begin playing after the existing packet and\nany other queued packets with the same key are finished playing."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:64"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"sound_server_start_sound",children:"sound_server_start_sound"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"sound_server_start_sound"}),": ",(0,r.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Requests a single sound atom to be played continuously. The event data should be the ID of the sound atom to play.\nPublishing this command is an alias for publishing a ",(0,r.jsx)(n.code,{children:"sound_server_play"})," command with the packet:\n",(0,r.jsx)(n.code,{children:"{ key: id, sequence: id, continuous: true }"}),"."]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:112"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"sound_server_stop",children:"sound_server_stop"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"sound_server_stop"}),": ",(0,r.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Requests that a continuous sound packet stop playing instead of looping the next time its sequence finishes. The\nevent data should be the key of the packet to stop. This also prevents any queued packets with the same key from\nplaying."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:79"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"sound_server_stop_all",children:"sound_server_stop_all"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"sound_server_stop_all"}),": ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Requests that all currently playing continuous sound packets stop playing instead of looping the next time their\nsequences finish. This also clears all queued packets."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:92"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"sound_server_stop_sound",children:"sound_server_stop_sound"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"sound_server_stop_sound"}),": ",(0,r.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Requests that a continuous sound packet stop playing instead of looping the next time its sequence finishes. The\nevent data should be the key of the packet to stop. This command is an alias for ",(0,r.jsx)(n.code,{children:"sound_server_stop"}),"."]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/sound/SoundServer.ts:118"})]})}function c(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(u,{...e})}):u(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return o},a:function(){return t}});var i=s(667294);let r={},d=i.createContext(r);function t(e){let n=i.useContext(d);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:t(e.components),i.createElement(d.Provider,{value:n},e.children)}}}]);