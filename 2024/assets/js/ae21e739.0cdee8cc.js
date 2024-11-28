"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["327021"],{8248:function(e,n,i){i.r(n),i.d(n,{metadata:()=>d,contentTitle:()=>a,default:()=>h,assets:()=>l,toc:()=>c,frontMatter:()=>t});var d=JSON.parse('{"id":"api/garminsdk/classes/DefaultVSpeedAnnunciationDataProvider","title":"Class: DefaultVSpeedAnnunciationDataProvider","description":"A default implementation of VSpeedAnnunciationDataProvider.","source":"@site/docs/api/garminsdk/classes/DefaultVSpeedAnnunciationDataProvider.md","sourceDirName":"api/garminsdk/classes","slug":"/api/garminsdk/classes/DefaultVSpeedAnnunciationDataProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/DefaultVSpeedAnnunciationDataProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"DefaultVsiDataProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/DefaultVsiDataProvider"},"next":{"title":"DefaultWaypointIconImageCache","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/DefaultWaypointIconImageCache"}}'),r=i("785893"),s=i("250065");let t={},a="Class: DefaultVSpeedAnnunciationDataProvider",l={},c=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new DefaultVSpeedAnnunciationDataProvider()",id:"new-defaultvspeedannunciationdataprovider",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"annunciation",id:"annunciation",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"init()",id:"init",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"pause()",id:"pause",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Throws",id:"throws-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"reset()",id:"reset",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"resume()",id:"resume",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Throws",id:"throws-2",level:4},{value:"Defined in",id:"defined-in-6",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"class-defaultvspeedannunciationdataprovider",children:"Class: DefaultVSpeedAnnunciationDataProvider"})}),"\n",(0,r.jsxs)(n.p,{children:["A default implementation of ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/VSpeedAnnunciationDataProvider",children:"VSpeedAnnunciationDataProvider"}),"."]}),"\n",(0,r.jsx)(n.h2,{id:"implements",children:"Implements"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/VSpeedAnnunciationDataProvider",children:(0,r.jsx)(n.code,{children:"VSpeedAnnunciationDataProvider"})})}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(n.h3,{id:"new-defaultvspeedannunciationdataprovider",children:"new DefaultVSpeedAnnunciationDataProvider()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"new DefaultVSpeedAnnunciationDataProvider"}),"(",(0,r.jsx)(n.code,{children:"bus"}),", ",(0,r.jsx)(n.code,{children:"vSpeedSettingManager"}),", ",(0,r.jsx)(n.code,{children:"takeoffVSpeedNames"}),", ",(0,r.jsx)(n.code,{children:"landingVSpeedNames"}),", ",(0,r.jsx)(n.code,{children:"options"}),"?): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/DefaultVSpeedAnnunciationDataProvider",children:(0,r.jsx)(n.code,{children:"DefaultVSpeedAnnunciationDataProvider"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Constructor."}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"bus"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"EventBus"})}),(0,r.jsx)(n.td,{children:"The event bus."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"vSpeedSettingManager"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"UserSettingManager"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/VSpeedUserSettingTypes",children:(0,r.jsx)(n.code,{children:"VSpeedUserSettingTypes"})}),">"]}),(0,r.jsx)(n.td,{children:"A manager for V-speed user settings."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"takeoffVSpeedNames"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"Iterable"}),"<",(0,r.jsx)(n.code,{children:"string"}),">"]}),(0,r.jsx)(n.td,{children:"The names of every takeoff V-speed."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"landingVSpeedNames"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"Iterable"}),"<",(0,r.jsx)(n.code,{children:"string"}),">"]}),(0,r.jsx)(n.td,{children:"The names of every landing V-speed."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"options"}),"?"]}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/DefaultVSpeedAnnunciationDataProviderOptions",children:(0,r.jsx)(n.code,{children:"DefaultVSpeedAnnunciationDataProviderOptions"})}),">"]}),(0,r.jsx)(n.td,{children:"Options with which to configure the data provider."})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/DefaultVSpeedAnnunciationDataProvider",children:(0,r.jsx)(n.code,{children:"DefaultVSpeedAnnunciationDataProvider"})})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/airspeed/VSpeedAnnunciationDataProvider.ts:81"}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"annunciation",children:"annunciation"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"annunciation"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/enumerations/VSpeedAnnunciation",children:(0,r.jsx)(n.code,{children:"VSpeedAnnunciation"})}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The currently active V-speed annunciation."}),"\n",(0,r.jsx)(n.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/VSpeedAnnunciationDataProvider",children:(0,r.jsx)(n.code,{children:"VSpeedAnnunciationDataProvider"})}),".",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/VSpeedAnnunciationDataProvider#annunciation",children:(0,r.jsx)(n.code,{children:"annunciation"})})]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/airspeed/VSpeedAnnunciationDataProvider.ts:47"}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"destroy"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can\nno longer be paused or resumed."}),"\n",(0,r.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/airspeed/VSpeedAnnunciationDataProvider.ts:243"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"init",children:"init()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"init"}),"(",(0,r.jsx)(n.code,{children:"paused"}),"): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Initializes this data provider. Once initialized"}),"\n",(0,r.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Default value"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"paused"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"boolean"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"false"})}),(0,r.jsxs)(n.td,{children:["Whether to initialize this data provider as paused. If ",(0,r.jsx)(n.code,{children:"true"}),", this data provider will provide an initial set of data but will not update the provided data until it is resumed. Defaults to ",(0,r.jsx)(n.code,{children:"false"}),"."]})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,r.jsx)(n.p,{children:"Error if this data provider is dead."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/airspeed/VSpeedAnnunciationDataProvider.ts:115"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"pause",children:"pause()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"pause"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Pauses this data provider. Once paused, this data provider will not update its data until it is resumed."}),"\n",(0,r.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"throws-1",children:"Throws"}),"\n",(0,r.jsx)(n.p,{children:"Error if this data provider is dead."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/airspeed/VSpeedAnnunciationDataProvider.ts:211"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"reset",children:"reset()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"reset"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Resets this data provider to provide an annunciation type of ",(0,r.jsx)(n.code,{children:"VSpeedAnnunciation.None"}),"."]}),"\n",(0,r.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/airspeed/VSpeedAnnunciationDataProvider.ts:235"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"resume",children:"resume()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"resume"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or\ndestroyed."}),"\n",(0,r.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"throws-2",children:"Throws"}),"\n",(0,r.jsx)(n.p,{children:"Error if this data provider is dead."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/airspeed/VSpeedAnnunciationDataProvider.ts:188"})]})}function h(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(o,{...e})}):o(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return a},a:function(){return t}});var d=i(667294);let r={},s=d.createContext(r);function t(e){let n=d.useContext(s);return d.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:t(e.components),d.createElement(s.Provider,{value:n},e.children)}}}]);