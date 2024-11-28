"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["208414"],{738645:function(e,s,r){r.r(s),r.d(s,{metadata:()=>i,contentTitle:()=>c,default:()=>t,assets:()=>h,toc:()=>o,frontMatter:()=>l});var i=JSON.parse('{"id":"api/framework/classes/ClockPublisher","title":"Class: ClockPublisher","description":"A publisher of clock events.","source":"@site/docs/api/framework/classes/ClockPublisher.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/ClockPublisher","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/ClockPublisher","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"Clock","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/Clock"},"next":{"title":"CollectionComponent","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/CollectionComponent"}}'),n=r("785893"),d=r("250065");let l={},c="Class: ClockPublisher",h={},o=[{value:"Extends",id:"extends",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new ClockPublisher()",id:"new-clockpublisher",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"bus",id:"bus",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"pacer",id:"pacer",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"publishActive",id:"publishactive",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"publisher",id:"publisher",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"Methods",id:"methods",level:2},{value:"isPublishing()",id:"ispublishing",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"onUpdate()",id:"onupdate",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"publish()",id:"publish",level:3},{value:"Type Parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"startPublish()",id:"startpublish",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"stopPublish()",id:"stoppublish",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-9",level:4}];function a(e){let s={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(s.header,{children:(0,n.jsx)(s.h1,{id:"class-clockpublisher",children:"Class: ClockPublisher"})}),"\n",(0,n.jsx)(s.p,{children:"A publisher of clock events."}),"\n",(0,n.jsx)(s.h2,{id:"extends",children:"Extends"}),"\n",(0,n.jsxs)(s.ul,{children:["\n",(0,n.jsxs)(s.li,{children:[(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher",children:(0,n.jsx)(s.code,{children:"BasePublisher"})}),"<",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/ClockEvents",children:(0,n.jsx)(s.code,{children:"ClockEvents"})}),">"]}),"\n"]}),"\n",(0,n.jsx)(s.h2,{id:"constructors",children:"Constructors"}),"\n",(0,n.jsx)(s.h3,{id:"new-clockpublisher",children:"new ClockPublisher()"}),"\n",(0,n.jsxs)(s.blockquote,{children:["\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.strong,{children:"new ClockPublisher"}),"(",(0,n.jsx)(s.code,{children:"bus"}),", ",(0,n.jsx)(s.code,{children:"pacer"}),"?): ",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/ClockPublisher",children:(0,n.jsx)(s.code,{children:"ClockPublisher"})})]}),"\n"]}),"\n",(0,n.jsx)(s.p,{children:"Creates a new instance of ClockPublisher."}),"\n",(0,n.jsx)(s.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,n.jsxs)(s.table,{children:[(0,n.jsx)(s.thead,{children:(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.th,{children:"Parameter"}),(0,n.jsx)(s.th,{children:"Type"}),(0,n.jsx)(s.th,{children:"Description"})]})}),(0,n.jsxs)(s.tbody,{children:[(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"bus"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/EventBus",children:(0,n.jsx)(s.code,{children:"EventBus"})})}),(0,n.jsx)(s.td,{children:"The event bus."})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsxs)(s.td,{children:[(0,n.jsx)(s.code,{children:"pacer"}),"?"]}),(0,n.jsxs)(s.td,{children:[(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PublishPacer",children:(0,n.jsx)(s.code,{children:"PublishPacer"})}),"<",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/ClockEvents",children:(0,n.jsx)(s.code,{children:"ClockEvents"})}),">"]}),(0,n.jsx)(s.td,{children:"An optional pacer to control the rate of publishing."})]})]})]}),"\n",(0,n.jsx)(s.h4,{id:"returns",children:"Returns"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/ClockPublisher",children:(0,n.jsx)(s.code,{children:"ClockPublisher"})})}),"\n",(0,n.jsx)(s.h4,{id:"overrides",children:"Overrides"}),"\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher",children:(0,n.jsx)(s.code,{children:"BasePublisher"})}),".",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher#constructors",children:(0,n.jsx)(s.code,{children:"constructor"})})]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:"src/sdk/instruments/Clock.ts:92"}),"\n",(0,n.jsx)(s.h2,{id:"properties",children:"Properties"}),"\n",(0,n.jsx)(s.h3,{id:"bus",children:"bus"}),"\n",(0,n.jsxs)(s.blockquote,{children:["\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.code,{children:"protected"})," ",(0,n.jsx)(s.code,{children:"readonly"})," ",(0,n.jsx)(s.strong,{children:"bus"}),": ",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/EventBus",children:(0,n.jsx)(s.code,{children:"EventBus"})})]}),"\n"]}),"\n",(0,n.jsx)(s.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher",children:(0,n.jsx)(s.code,{children:"BasePublisher"})}),".",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher#bus",children:(0,n.jsx)(s.code,{children:"bus"})})]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:"src/sdk/instruments/BasePublishers.ts:10"}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"pacer",children:"pacer"}),"\n",(0,n.jsxs)(s.blockquote,{children:["\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.code,{children:"protected"})," ",(0,n.jsx)(s.code,{children:"readonly"})," ",(0,n.jsx)(s.strong,{children:"pacer"}),": ",(0,n.jsx)(s.code,{children:"undefined"})," | ",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/PublishPacer",children:(0,n.jsx)(s.code,{children:"PublishPacer"})}),"<",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/ClockEvents",children:(0,n.jsx)(s.code,{children:"ClockEvents"})}),">"]}),"\n"]}),"\n",(0,n.jsx)(s.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher",children:(0,n.jsx)(s.code,{children:"BasePublisher"})}),".",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher#pacer",children:(0,n.jsx)(s.code,{children:"pacer"})})]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:"src/sdk/instruments/BasePublishers.ts:13"}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"publishactive",children:"publishActive"}),"\n",(0,n.jsxs)(s.blockquote,{children:["\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.code,{children:"protected"})," ",(0,n.jsx)(s.strong,{children:"publishActive"}),": ",(0,n.jsx)(s.code,{children:"boolean"})]}),"\n"]}),"\n",(0,n.jsx)(s.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher",children:(0,n.jsx)(s.code,{children:"BasePublisher"})}),".",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher#publishactive",children:(0,n.jsx)(s.code,{children:"publishActive"})})]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:"src/sdk/instruments/BasePublishers.ts:12"}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"publisher",children:"publisher"}),"\n",(0,n.jsxs)(s.blockquote,{children:["\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.code,{children:"protected"})," ",(0,n.jsx)(s.code,{children:"readonly"})," ",(0,n.jsx)(s.strong,{children:"publisher"}),": ",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Publisher",children:(0,n.jsx)(s.code,{children:"Publisher"})}),"<",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/ClockEvents",children:(0,n.jsx)(s.code,{children:"ClockEvents"})}),">"]}),"\n"]}),"\n",(0,n.jsx)(s.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher",children:(0,n.jsx)(s.code,{children:"BasePublisher"})}),".",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher#publisher",children:(0,n.jsx)(s.code,{children:"publisher"})})]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:"src/sdk/instruments/BasePublishers.ts:11"}),"\n",(0,n.jsx)(s.h2,{id:"methods",children:"Methods"}),"\n",(0,n.jsx)(s.h3,{id:"ispublishing",children:"isPublishing()"}),"\n",(0,n.jsxs)(s.blockquote,{children:["\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.strong,{children:"isPublishing"}),"(): ",(0,n.jsx)(s.code,{children:"boolean"})]}),"\n"]}),"\n",(0,n.jsx)(s.p,{children:"Tells whether or not the publisher is currently active."}),"\n",(0,n.jsx)(s.h4,{id:"returns-1",children:"Returns"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.code,{children:"boolean"})}),"\n",(0,n.jsx)(s.p,{children:"True if the publisher is active, false otherwise."}),"\n",(0,n.jsx)(s.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher",children:(0,n.jsx)(s.code,{children:"BasePublisher"})}),".",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher#ispublishing",children:(0,n.jsx)(s.code,{children:"isPublishing"})})]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:"src/sdk/instruments/BasePublishers.ts:45"}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"onupdate",children:"onUpdate()"}),"\n",(0,n.jsxs)(s.blockquote,{children:["\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.strong,{children:"onUpdate"}),"(): ",(0,n.jsx)(s.code,{children:"void"})]}),"\n"]}),"\n",(0,n.jsx)(s.p,{children:"A callback called when the publisher receives an update cycle."}),"\n",(0,n.jsx)(s.h4,{id:"returns-2",children:"Returns"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.code,{children:"void"})}),"\n",(0,n.jsx)(s.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher",children:(0,n.jsx)(s.code,{children:"BasePublisher"})}),".",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher#onupdate",children:(0,n.jsx)(s.code,{children:"onUpdate"})})]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:"src/sdk/instruments/Clock.ts:184"}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"publish",children:"publish()"}),"\n",(0,n.jsxs)(s.blockquote,{children:["\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.code,{children:"protected"})," ",(0,n.jsx)(s.strong,{children:"publish"}),"<",(0,n.jsx)(s.code,{children:"K"}),">(",(0,n.jsx)(s.code,{children:"topic"}),", ",(0,n.jsx)(s.code,{children:"data"}),", ",(0,n.jsx)(s.code,{children:"sync"}),", ",(0,n.jsx)(s.code,{children:"isCached"}),"): ",(0,n.jsx)(s.code,{children:"void"})]}),"\n"]}),"\n",(0,n.jsx)(s.p,{children:"Publish a message if publishing is acpive"}),"\n",(0,n.jsx)(s.h4,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,n.jsxs)(s.table,{children:[(0,n.jsx)(s.thead,{children:(0,n.jsx)(s.tr,{children:(0,n.jsx)(s.th,{children:"Type Parameter"})})}),(0,n.jsx)(s.tbody,{children:(0,n.jsx)(s.tr,{children:(0,n.jsxs)(s.td,{children:[(0,n.jsx)(s.code,{children:"K"})," ",(0,n.jsx)(s.em,{children:"extends"})," keyof ",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/ClockEvents",children:(0,n.jsx)(s.code,{children:"ClockEvents"})})]})})})]}),"\n",(0,n.jsx)(s.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,n.jsxs)(s.table,{children:[(0,n.jsx)(s.thead,{children:(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.th,{children:"Parameter"}),(0,n.jsx)(s.th,{children:"Type"}),(0,n.jsx)(s.th,{children:"Default value"}),(0,n.jsx)(s.th,{children:"Description"})]})}),(0,n.jsxs)(s.tbody,{children:[(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"topic"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"K"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"undefined"})}),(0,n.jsx)(s.td,{children:"The topic key to publish to."})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"data"})}),(0,n.jsxs)(s.td,{children:[(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/ClockEvents",children:(0,n.jsx)(s.code,{children:"ClockEvents"})}),"[",(0,n.jsx)(s.code,{children:"K"}),"]"]}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"undefined"})}),(0,n.jsx)(s.td,{children:"The data type for chosen topic."})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"sync"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"boolean"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"false"})}),(0,n.jsxs)(s.td,{children:["Whether or not the event should be synced to other instruments. Defaults to ",(0,n.jsx)(s.code,{children:"false"}),"."]})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"isCached"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"boolean"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"true"})}),(0,n.jsxs)(s.td,{children:["Whether or not the event should be cached. Defaults to ",(0,n.jsx)(s.code,{children:"true"}),"."]})]})]})]}),"\n",(0,n.jsx)(s.h4,{id:"returns-3",children:"Returns"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.code,{children:"void"})}),"\n",(0,n.jsx)(s.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher",children:(0,n.jsx)(s.code,{children:"BasePublisher"})}),".",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher#publish",children:(0,n.jsx)(s.code,{children:"publish"})})]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:"src/sdk/instruments/BasePublishers.ts:63"}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"startpublish",children:"startPublish()"}),"\n",(0,n.jsxs)(s.blockquote,{children:["\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.strong,{children:"startPublish"}),"(): ",(0,n.jsx)(s.code,{children:"void"})]}),"\n"]}),"\n",(0,n.jsx)(s.p,{children:"Start publishing."}),"\n",(0,n.jsx)(s.h4,{id:"returns-4",children:"Returns"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.code,{children:"void"})}),"\n",(0,n.jsx)(s.h4,{id:"overrides-2",children:"Overrides"}),"\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher",children:(0,n.jsx)(s.code,{children:"BasePublisher"})}),".",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher#startpublish",children:(0,n.jsx)(s.code,{children:"startPublish"})})]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:"src/sdk/instruments/Clock.ts:161"}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"stoppublish",children:"stopPublish()"}),"\n",(0,n.jsxs)(s.blockquote,{children:["\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.strong,{children:"stopPublish"}),"(): ",(0,n.jsx)(s.code,{children:"void"})]}),"\n"]}),"\n",(0,n.jsx)(s.p,{children:"Stop publishing."}),"\n",(0,n.jsx)(s.h4,{id:"returns-5",children:"Returns"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.code,{children:"void"})}),"\n",(0,n.jsx)(s.h4,{id:"overrides-3",children:"Overrides"}),"\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher",children:(0,n.jsx)(s.code,{children:"BasePublisher"})}),".",(0,n.jsx)(s.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BasePublisher#stoppublish",children:(0,n.jsx)(s.code,{children:"stopPublish"})})]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:"src/sdk/instruments/Clock.ts:172"})]})}function t(e={}){let{wrapper:s}={...(0,d.a)(),...e.components};return s?(0,n.jsx)(s,{...e,children:(0,n.jsx)(a,{...e})}):a(e)}},250065:function(e,s,r){r.d(s,{Z:function(){return c},a:function(){return l}});var i=r(667294);let n={},d=i.createContext(n);function l(e){let s=i.useContext(d);return i.useMemo(function(){return"function"==typeof e?e(s):{...s,...e}},[s,e])}function c(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:l(e.components),i.createElement(d.Provider,{value:s},e.children)}}}]);