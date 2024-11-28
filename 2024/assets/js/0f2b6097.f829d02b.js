"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["193320"],{690674:function(e,s,n){n.r(s),n.d(s,{metadata:()=>r,contentTitle:()=>c,default:()=>o,assets:()=>l,toc:()=>a,frontMatter:()=>t});var r=JSON.parse('{"id":"api/garminsdk/classes/TerrainSystemUtils","title":"Class: TerrainSystemUtils","description":"A utility class for working with Garmin terrain alerting systems.","source":"@site/docs/api/garminsdk/classes/TerrainSystemUtils.md","sourceDirName":"api/garminsdk/classes","slug":"/api/garminsdk/classes/TerrainSystemUtils","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/TerrainSystemUtils","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"TerrainSystemAnnunciation","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/TerrainSystemAnnunciation"},"next":{"title":"TimeDisplay","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/TimeDisplay"}}'),i=n("785893"),d=n("250065");let t={},c="Class: TerrainSystemUtils",l={},a=[{value:"Constructors",id:"constructors",level:2},{value:"new TerrainSystemUtils()",id:"new-terrainsystemutils",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"getIdSuffix()",id:"getidsuffix",level:3},{value:"Type Parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"onEvent()",id:"onevent",level:3},{value:"onEvent(id, bus, baseTopic)",id:"oneventid-bus-basetopic",level:4},{value:"Type Parameters",id:"type-parameters-1",level:5},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Defined in",id:"defined-in-1",level:5},{value:"onEvent(id, subscriber, baseTopic)",id:"oneventid-subscriber-basetopic",level:4},{value:"Type Parameters",id:"type-parameters-2",level:5},{value:"Parameters",id:"parameters-2",level:5},{value:"Returns",id:"returns-3",level:5},{value:"Defined in",id:"defined-in-2",level:5}];function h(e){let s={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(s.header,{children:(0,i.jsx)(s.h1,{id:"class-terrainsystemutils",children:"Class: TerrainSystemUtils"})}),"\n",(0,i.jsx)(s.p,{children:"A utility class for working with Garmin terrain alerting systems."}),"\n",(0,i.jsx)(s.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(s.h3,{id:"new-terrainsystemutils",children:"new TerrainSystemUtils()"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.strong,{children:"new TerrainSystemUtils"}),"(): ",(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/TerrainSystemUtils",children:(0,i.jsx)(s.code,{children:"TerrainSystemUtils"})})]}),"\n"]}),"\n",(0,i.jsx)(s.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/TerrainSystemUtils",children:(0,i.jsx)(s.code,{children:"TerrainSystemUtils"})})}),"\n",(0,i.jsx)(s.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(s.h3,{id:"getidsuffix",children:"getIdSuffix()"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"static"})," ",(0,i.jsx)(s.strong,{children:"getIdSuffix"}),"<",(0,i.jsx)(s.code,{children:"ID"}),">(",(0,i.jsx)(s.code,{children:"id"}),"): ",(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/TerrainSystemEventSuffix",children:(0,i.jsx)(s.code,{children:"TerrainSystemEventSuffix"})}),"<",(0,i.jsx)(s.code,{children:"ID"}),">"]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Gets the event bus topic suffix for a terrain system ID."}),"\n",(0,i.jsx)(s.h4,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsx)(s.tr,{children:(0,i.jsx)(s.th,{children:"Type Parameter"})})}),(0,i.jsx)(s.tbody,{children:(0,i.jsx)(s.tr,{children:(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"ID"})," ",(0,i.jsx)(s.em,{children:"extends"})," ",(0,i.jsx)(s.code,{children:"string"})]})})})]}),"\n",(0,i.jsx)(s.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.th,{children:"Parameter"}),(0,i.jsx)(s.th,{children:"Type"}),(0,i.jsx)(s.th,{children:"Description"})]})}),(0,i.jsx)(s.tbody,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"id"})}),(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"ID"})}),(0,i.jsx)(s.td,{children:"The ID for which to get the suffix."})]})})]}),"\n",(0,i.jsx)(s.h4,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/TerrainSystemEventSuffix",children:(0,i.jsx)(s.code,{children:"TerrainSystemEventSuffix"})}),"<",(0,i.jsx)(s.code,{children:"ID"}),">"]}),"\n",(0,i.jsx)(s.p,{children:"The event bus topic suffix for the specified terrain system ID."}),"\n",(0,i.jsx)(s.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(s.p,{children:"src/garminsdk/terrain/TerrainSystemUtils.ts:14"}),"\n",(0,i.jsx)(s.hr,{}),"\n",(0,i.jsx)(s.h3,{id:"onevent",children:"onEvent()"}),"\n",(0,i.jsx)(s.h4,{id:"oneventid-bus-basetopic",children:"onEvent(id, bus, baseTopic)"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"static"})," ",(0,i.jsx)(s.strong,{children:"onEvent"}),"<",(0,i.jsx)(s.code,{children:"ID"}),", ",(0,i.jsx)(s.code,{children:"K"}),">(",(0,i.jsx)(s.code,{children:"id"}),", ",(0,i.jsx)(s.code,{children:"bus"}),", ",(0,i.jsx)(s.code,{children:"baseTopic"}),"): ",(0,i.jsx)(s.code,{children:"Consumer"}),"<",(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/BaseTerrainSystemEvents",children:(0,i.jsx)(s.code,{children:"BaseTerrainSystemEvents"})}),"[",(0,i.jsx)(s.code,{children:"K"}),"]>"]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Subscribes to one of the event bus topics related to a terrain system with a given ID."}),"\n",(0,i.jsx)(s.h5,{id:"type-parameters-1",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsx)(s.tr,{children:(0,i.jsx)(s.th,{children:"Type Parameter"})})}),(0,i.jsxs)(s.tbody,{children:[(0,i.jsx)(s.tr,{children:(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"ID"})," ",(0,i.jsx)(s.em,{children:"extends"})," ",(0,i.jsx)(s.code,{children:"string"})]})}),(0,i.jsx)(s.tr,{children:(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"K"})," ",(0,i.jsx)(s.em,{children:"extends"})," keyof ",(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/BaseTerrainSystemEvents",children:(0,i.jsx)(s.code,{children:"BaseTerrainSystemEvents"})})]})})]})]}),"\n",(0,i.jsx)(s.h5,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.th,{children:"Parameter"}),(0,i.jsx)(s.th,{children:"Type"}),(0,i.jsx)(s.th,{children:"Description"})]})}),(0,i.jsxs)(s.tbody,{children:[(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"id"})}),(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"ID"})}),(0,i.jsx)(s.td,{children:"The ID of the terrain system."})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"bus"})}),(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"EventBus"})}),(0,i.jsx)(s.td,{children:"The event bus to which to subscribe."})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"baseTopic"})}),(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"K"})}),(0,i.jsx)(s.td,{children:"The base name of the topic to which to subscribe."})]})]})]}),"\n",(0,i.jsx)(s.h5,{id:"returns-2",children:"Returns"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"Consumer"}),"<",(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/BaseTerrainSystemEvents",children:(0,i.jsx)(s.code,{children:"BaseTerrainSystemEvents"})}),"[",(0,i.jsx)(s.code,{children:"K"}),"]>"]}),"\n",(0,i.jsx)(s.p,{children:"A consumer for the specified event bus topic."}),"\n",(0,i.jsx)(s.h5,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(s.p,{children:"src/garminsdk/terrain/TerrainSystemUtils.ts:25"}),"\n",(0,i.jsx)(s.h4,{id:"oneventid-subscriber-basetopic",children:"onEvent(id, subscriber, baseTopic)"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"static"})," ",(0,i.jsx)(s.strong,{children:"onEvent"}),"<",(0,i.jsx)(s.code,{children:"ID"}),", ",(0,i.jsx)(s.code,{children:"K"}),">(",(0,i.jsx)(s.code,{children:"id"}),", ",(0,i.jsx)(s.code,{children:"subscriber"}),", ",(0,i.jsx)(s.code,{children:"baseTopic"}),"): ",(0,i.jsx)(s.code,{children:"Consumer"}),"<",(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/BaseTerrainSystemEvents",children:(0,i.jsx)(s.code,{children:"BaseTerrainSystemEvents"})}),"[",(0,i.jsx)(s.code,{children:"K"}),"]>"]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Subscribes to one of the event bus topics related to a terrain system with a given ID."}),"\n",(0,i.jsx)(s.h5,{id:"type-parameters-2",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsx)(s.tr,{children:(0,i.jsx)(s.th,{children:"Type Parameter"})})}),(0,i.jsxs)(s.tbody,{children:[(0,i.jsx)(s.tr,{children:(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"ID"})," ",(0,i.jsx)(s.em,{children:"extends"})," ",(0,i.jsx)(s.code,{children:"string"})]})}),(0,i.jsx)(s.tr,{children:(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"K"})," ",(0,i.jsx)(s.em,{children:"extends"})," keyof ",(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/BaseTerrainSystemEvents",children:(0,i.jsx)(s.code,{children:"BaseTerrainSystemEvents"})})]})})]})]}),"\n",(0,i.jsx)(s.h5,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.th,{children:"Parameter"}),(0,i.jsx)(s.th,{children:"Type"}),(0,i.jsx)(s.th,{children:"Description"})]})}),(0,i.jsxs)(s.tbody,{children:[(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"id"})}),(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"ID"})}),(0,i.jsx)(s.td,{children:"The ID of the terrain system."})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"subscriber"})}),(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"EventSubscriber"}),"<",(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/TerrainSystemEventsForId",children:(0,i.jsx)(s.code,{children:"TerrainSystemEventsForId"})}),"<",(0,i.jsx)(s.code,{children:"ID"}),">>"]}),(0,i.jsx)(s.td,{children:"The event subscriber to use to subscribe."})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"baseTopic"})}),(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"K"})}),(0,i.jsx)(s.td,{children:"The base name of the topic to which to subscribe."})]})]})]}),"\n",(0,i.jsx)(s.h5,{id:"returns-3",children:"Returns"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"Consumer"}),"<",(0,i.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/BaseTerrainSystemEvents",children:(0,i.jsx)(s.code,{children:"BaseTerrainSystemEvents"})}),"[",(0,i.jsx)(s.code,{children:"K"}),"]>"]}),"\n",(0,i.jsx)(s.p,{children:"A consumer for the specified event bus topic."}),"\n",(0,i.jsx)(s.h5,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(s.p,{children:"src/garminsdk/terrain/TerrainSystemUtils.ts:37"})]})}function o(e={}){let{wrapper:s}={...(0,d.a)(),...e.components};return s?(0,i.jsx)(s,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},250065:function(e,s,n){n.d(s,{Z:function(){return c},a:function(){return t}});var r=n(667294);let i={},d=r.createContext(i);function t(e){let s=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(s):{...s,...e}},[s,e])}function c(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:t(e.components),r.createElement(d.Provider,{value:s},e.children)}}}]);