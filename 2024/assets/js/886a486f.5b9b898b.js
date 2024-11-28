"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["449678"],{100984:function(e,n,i){i.r(n),i.d(n,{metadata:()=>s,contentTitle:()=>c,default:()=>o,assets:()=>l,toc:()=>a,frontMatter:()=>t});var s=JSON.parse('{"id":"api/framework/classes/Wait","title":"Class: Wait","description":"A utility class for generating Promises that wait for certain conditions before they are fulfilled.","source":"@site/docs/api/framework/classes/Wait.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/Wait","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/Wait","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"VNavWaypoint","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/VNavWaypoint"},"next":{"title":"Warning","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/Warning"}}'),r=i("785893"),d=i("250065");let t={},c="Class: Wait",l={},a=[{value:"Constructors",id:"constructors",level:2},{value:"new Wait()",id:"new-wait",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"awaitCondition()",id:"awaitcondition",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"awaitConsumer()",id:"awaitconsumer",level:3},{value:"Type Parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"awaitDelay()",id:"awaitdelay",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"awaitFrames()",id:"awaitframes",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"awaitSubEvent()",id:"awaitsubevent",level:3},{value:"Type Parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"awaitSubscribable()",id:"awaitsubscribable",level:3},{value:"Type Parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-5",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"class-wait",children:"Class: Wait"})}),"\n",(0,r.jsx)(n.p,{children:"A utility class for generating Promises that wait for certain conditions before they are fulfilled."}),"\n",(0,r.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(n.h3,{id:"new-wait",children:"new Wait()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"new Wait"}),"(): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/Wait",children:(0,r.jsx)(n.code,{children:"Wait"})})]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/Wait",children:(0,r.jsx)(n.code,{children:"Wait"})})}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"awaitcondition",children:"awaitCondition()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"static"})," ",(0,r.jsx)(n.strong,{children:"awaitCondition"}),"(",(0,r.jsx)(n.code,{children:"predicate"}),", ",(0,r.jsx)(n.code,{children:"interval"}),", ",(0,r.jsx)(n.code,{children:"timeout"}),"): ",(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"void"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Waits for a condition to be satisfied."}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Default value"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"predicate"})}),(0,r.jsxs)(n.td,{children:["() => ",(0,r.jsx)(n.code,{children:"boolean"})]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"undefined"})}),(0,r.jsx)(n.td,{children:"A function which evaluates whether the condition is satisfied."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"interval"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"0"})}),(0,r.jsx)(n.td,{children:"The interval, in milliseconds, at which to evaluate the condition. A zero or negative value causes the condition to be evaluated every frame. Defaults to 0."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"timeout"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"0"})}),(0,r.jsx)(n.td,{children:"The amount of time, in milliseconds, before the returned Promise is rejected if the condition is not satisfied. A zero or negative value causes the Promise to never be rejected and the condition to be continually evaluated until it is satisfied. Defaults to 0."})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"void"}),">"]}),"\n",(0,r.jsx)(n.p,{children:"a Promise which is fulfilled when the condition is satisfied."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/time/Wait.ts:59"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"awaitconsumer",children:"awaitConsumer()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"static"})," ",(0,r.jsx)(n.strong,{children:"awaitConsumer"}),"<",(0,r.jsx)(n.code,{children:"T"}),">(",(0,r.jsx)(n.code,{children:"consumer"}),", ",(0,r.jsx)(n.code,{children:"predicate"}),"?, ",(0,r.jsx)(n.code,{children:"initialCheck"}),"?, ",(0,r.jsx)(n.code,{children:"timeout"}),"?): ",(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"T"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Waits for an event from a ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Consumer",children:"Consumer"}),", with an optional condition to end the wait based on the value of the\nconsumed event."]}),"\n",(0,r.jsx)(n.h4,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.th,{children:"Type Parameter"})})}),(0,r.jsx)(n.tbody,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"T"})})})})]}),"\n",(0,r.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Default value"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"consumer"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Consumer",children:(0,r.jsx)(n.code,{children:"Consumer"})}),"<",(0,r.jsx)(n.code,{children:"T"}),">"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"undefined"})}),(0,r.jsx)(n.td,{children:"The event consumer to wait for."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"predicate"}),"?"]}),(0,r.jsxs)(n.td,{children:["(",(0,r.jsx)(n.code,{children:"value"}),") => ",(0,r.jsx)(n.code,{children:"boolean"})]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"undefined"})}),(0,r.jsx)(n.td,{children:"A function which evaluates whether the value of the consumed event satisfies the condition for the wait to end. If not defined, any value is considered satisfactory."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"initialCheck"}),"?"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"boolean"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"false"})}),(0,r.jsxs)(n.td,{children:["Whether to immediately receive an event from the event consumer at the start of the wait. Defaults to ",(0,r.jsx)(n.code,{children:"false"}),"."]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"timeout"}),"?"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"0"})}),(0,r.jsx)(n.td,{children:"The amount of time, in milliseconds, before the returned Promise is rejected if the condition is not satisfied. A zero or negative value causes the Promise to never be rejected. Defaults to 0."})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"T"}),">"]}),"\n",(0,r.jsx)(n.p,{children:"A Promise which is fulfilled with the value of the consumed event when an event is received with a\nvalue that satisfies the condition for the wait to end."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/time/Wait.ts:132"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"awaitdelay",children:"awaitDelay()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"static"})," ",(0,r.jsx)(n.strong,{children:"awaitDelay"}),"(",(0,r.jsx)(n.code,{children:"delay"}),"): ",(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"void"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Waits for a set amount of time."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"delay"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})}),(0,r.jsx)(n.td,{children:"The amount of time to wait in milliseconds."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"void"}),">"]}),"\n",(0,r.jsx)(n.p,{children:"a Promise which is fulfilled after the delay."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/time/Wait.ts:13"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"awaitframes",children:"awaitFrames()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"static"})," ",(0,r.jsx)(n.strong,{children:"awaitFrames"}),"(",(0,r.jsx)(n.code,{children:"count"}),", ",(0,r.jsx)(n.code,{children:"glassCockpitRefresh"}),"): ",(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"void"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Waits for a certain number of frames to elapse."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Default value"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"count"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"undefined"})}),(0,r.jsx)(n.td,{children:"The number of frames to wait."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"glassCockpitRefresh"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"boolean"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"false"})}),(0,r.jsxs)(n.td,{children:["Whether to wait for glass cockpit refresh frames instead of CoherentGT frames. Defaults to ",(0,r.jsx)(n.code,{children:"false"}),"."]})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"void"}),">"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/time/Wait.ts:23"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"awaitsubevent",children:"awaitSubEvent()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"static"})," ",(0,r.jsx)(n.strong,{children:"awaitSubEvent"}),"<",(0,r.jsx)(n.code,{children:"SenderType"}),", ",(0,r.jsx)(n.code,{children:"DataType"}),">(",(0,r.jsx)(n.code,{children:"event"}),", ",(0,r.jsx)(n.code,{children:"predicate"}),"?, ",(0,r.jsx)(n.code,{children:"timeout"}),"?): ",(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"DataType"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Waits for an event from a ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/ReadonlySubEvent",children:"ReadonlySubEvent"}),", with an optional condition to end the wait based on the sender\nand data of the event."]}),"\n",(0,r.jsx)(n.h4,{id:"type-parameters-1",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.th,{children:"Type Parameter"})})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"SenderType"})})}),(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"DataType"})})})]})]}),"\n",(0,r.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Default value"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"event"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/ReadonlySubEvent",children:(0,r.jsx)(n.code,{children:"ReadonlySubEvent"})}),"<",(0,r.jsx)(n.code,{children:"SenderType"}),", ",(0,r.jsx)(n.code,{children:"DataType"}),">"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"undefined"})}),(0,r.jsx)(n.td,{children:"The event to wait for."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"predicate"}),"?"]}),(0,r.jsxs)(n.td,{children:["(",(0,r.jsx)(n.code,{children:"data"}),", ",(0,r.jsx)(n.code,{children:"sender"}),") => ",(0,r.jsx)(n.code,{children:"boolean"})]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"undefined"})}),(0,r.jsx)(n.td,{children:"A function which evaluates whether the sender and data of the event satisfy the condition for the wait to end. If not defined, any sender/data is considered satisfactory."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"timeout"}),"?"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"0"})}),(0,r.jsx)(n.td,{children:"The amount of time, in milliseconds, before the returned Promise is rejected if the condition is not satisfied. A zero or negative value causes the Promise to never be rejected. Defaults to 0."})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"DataType"}),">"]}),"\n",(0,r.jsx)(n.p,{children:"A Promise which is fulfilled with the data of the event when an event is received with a sender and data\nthat satisfy the condition for the wait to end."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/time/Wait.ts:164"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"awaitsubscribable",children:"awaitSubscribable()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"static"})," ",(0,r.jsx)(n.strong,{children:"awaitSubscribable"}),"<",(0,r.jsx)(n.code,{children:"T"}),">(",(0,r.jsx)(n.code,{children:"subscribable"}),", ",(0,r.jsx)(n.code,{children:"predicate"}),"?, ",(0,r.jsx)(n.code,{children:"initialCheck"}),"?, ",(0,r.jsx)(n.code,{children:"timeout"}),"?): ",(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"T"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Waits for a notification from a ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscribable",children:"Subscribable"}),", with an optional condition to end the wait based on the value\nof the subscribable."]}),"\n",(0,r.jsx)(n.h4,{id:"type-parameters-2",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.th,{children:"Type Parameter"})})}),(0,r.jsx)(n.tbody,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"T"})})})})]}),"\n",(0,r.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Default value"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"subscribable"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscribable",children:(0,r.jsx)(n.code,{children:"Subscribable"})}),"<",(0,r.jsx)(n.code,{children:"T"}),">"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"undefined"})}),(0,r.jsx)(n.td,{children:"The subscribable to wait for."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"predicate"}),"?"]}),(0,r.jsxs)(n.td,{children:["(",(0,r.jsx)(n.code,{children:"value"}),") => ",(0,r.jsx)(n.code,{children:"boolean"})]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"undefined"})}),(0,r.jsx)(n.td,{children:"A function which evaluates whether the value of the subscribable satisfies the condition for the wait to end. If not defined, any value is considered satisfactory."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"initialCheck"}),"?"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"boolean"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"false"})}),(0,r.jsxs)(n.td,{children:["Whether to immediately receive a notification from the subscribable at the start of the wait. Defaults to ",(0,r.jsx)(n.code,{children:"false"}),"."]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"timeout"}),"?"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"0"})}),(0,r.jsx)(n.td,{children:"The amount of time, in milliseconds, before the returned Promise is rejected if the condition is not satisfied. A zero or negative value causes the Promise to never be rejected. Defaults to 0."})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"T"}),">"]}),"\n",(0,r.jsx)(n.p,{children:"A Promise which is fulfilled with the value of the subscribable when a notification is received with a\nvalue that satisfies the condition for the wait to end."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/time/Wait.ts:98"})]})}function o(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return c},a:function(){return t}});var s=i(667294);let r={},d=s.createContext(r);function t(e){let n=s.useContext(d);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:t(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);