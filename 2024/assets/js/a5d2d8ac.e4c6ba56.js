"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["377339"],{65927:function(e,i,s){s.r(i),s.d(i,{metadata:()=>r,contentTitle:()=>l,default:()=>a,assets:()=>t,toc:()=>o,frontMatter:()=>c});var r=JSON.parse('{"id":"api/framework/classes/SubscribableSetPipe","title":"Class: SubscribableSetPipe\\\\<I, O, HandlerType\\\\>","description":"A pipe from an input subscribable set to an output mutable subscribable set. Each key added/removed notification","source":"@site/docs/api/framework/classes/SubscribableSetPipe.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/SubscribableSetPipe","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/SubscribableSetPipe","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"SubscribablePipe","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/SubscribablePipe"},"next":{"title":"SubscribableUtils","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/SubscribableUtils"}}'),n=s("785893"),d=s("250065");let c={},l="Class: SubscribableSetPipe<I, O, HandlerType>",t={},o=[{value:"Extends",id:"extends",level:2},{value:"Type Parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new SubscribableSetPipe()",id:"new-subscribablesetpipe",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"new SubscribableSetPipe()",id:"new-subscribablesetpipe-1",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"Properties",id:"properties",level:2},{value:"canInitialNotify",id:"caninitialnotify",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"handler",id:"handler",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"isAlive",id:"isalive",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"isPaused",id:"ispaused",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"initialNotify()",id:"initialnotify",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Throws",id:"throws",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"pause()",id:"pause",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Throws",id:"throws-1",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"resume()",id:"resume",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Throws",id:"throws-2",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-9",level:4}];function h(e){let i={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(i.header,{children:(0,n.jsx)(i.h1,{id:"class-subscribablesetpipei-o-handlertype",children:"Class: SubscribableSetPipe<I, O, HandlerType>"})}),"\n",(0,n.jsx)(i.p,{children:"A pipe from an input subscribable set to an output mutable subscribable set. Each key added/removed notification\nreceived by the pipe is used to add/remove keys to/from the output set."}),"\n",(0,n.jsx)(i.h2,{id:"extends",children:"Extends"}),"\n",(0,n.jsxs)(i.ul,{children:["\n",(0,n.jsxs)(i.li,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription",children:(0,n.jsx)(i.code,{children:"HandlerSubscription"})}),"<",(0,n.jsx)(i.code,{children:"HandlerType"}),">"]}),"\n"]}),"\n",(0,n.jsx)(i.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,n.jsxs)(i.table,{children:[(0,n.jsx)(i.thead,{children:(0,n.jsx)(i.tr,{children:(0,n.jsx)(i.th,{children:"Type Parameter"})})}),(0,n.jsxs)(i.tbody,{children:[(0,n.jsx)(i.tr,{children:(0,n.jsx)(i.td,{children:(0,n.jsx)(i.code,{children:"I"})})}),(0,n.jsx)(i.tr,{children:(0,n.jsx)(i.td,{children:(0,n.jsx)(i.code,{children:"O"})})}),(0,n.jsx)(i.tr,{children:(0,n.jsxs)(i.td,{children:[(0,n.jsx)(i.code,{children:"HandlerType"})," ",(0,n.jsx)(i.em,{children:"extends"})," (",(0,n.jsx)(i.code,{children:"set"}),", ",(0,n.jsx)(i.code,{children:"type"}),", ",(0,n.jsx)(i.code,{children:"key"}),", ...",(0,n.jsx)(i.code,{children:"args"}),") => ",(0,n.jsx)(i.code,{children:"void"})]})})]})]}),"\n",(0,n.jsx)(i.h2,{id:"constructors",children:"Constructors"}),"\n",(0,n.jsx)(i.h3,{id:"new-subscribablesetpipe",children:"new SubscribableSetPipe()"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"new SubscribableSetPipe"}),"<",(0,n.jsx)(i.code,{children:"I"}),", ",(0,n.jsx)(i.code,{children:"O"}),", ",(0,n.jsx)(i.code,{children:"HandlerType"}),">(",(0,n.jsx)(i.code,{children:"from"}),", ",(0,n.jsx)(i.code,{children:"to"}),", ",(0,n.jsx)(i.code,{children:"onDestroy"}),"): ",(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/SubscribableSetPipe",children:(0,n.jsx)(i.code,{children:"SubscribableSetPipe"})}),"<",(0,n.jsx)(i.code,{children:"I"}),", ",(0,n.jsx)(i.code,{children:"O"}),", ",(0,n.jsx)(i.code,{children:"HandlerType"}),">"]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"Constructor."}),"\n",(0,n.jsx)(i.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,n.jsxs)(i.table,{children:[(0,n.jsx)(i.thead,{children:(0,n.jsxs)(i.tr,{children:[(0,n.jsx)(i.th,{children:"Parameter"}),(0,n.jsx)(i.th,{children:"Type"}),(0,n.jsx)(i.th,{children:"Description"})]})}),(0,n.jsxs)(i.tbody,{children:[(0,n.jsxs)(i.tr,{children:[(0,n.jsx)(i.td,{children:(0,n.jsx)(i.code,{children:"from"})}),(0,n.jsxs)(i.td,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/SubscribableSet",children:(0,n.jsx)(i.code,{children:"SubscribableSet"})}),"<",(0,n.jsx)(i.code,{children:"I"}),">"]}),(0,n.jsx)(i.td,{children:"The input subscribable set."})]}),(0,n.jsxs)(i.tr,{children:[(0,n.jsx)(i.td,{children:(0,n.jsx)(i.code,{children:"to"})}),(0,n.jsxs)(i.td,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MutableSubscribableSet",children:(0,n.jsx)(i.code,{children:"MutableSubscribableSet"})}),"<",(0,n.jsx)(i.code,{children:"I"}),">"]}),(0,n.jsx)(i.td,{children:"The output mutable subscribable set."})]}),(0,n.jsxs)(i.tr,{children:[(0,n.jsx)(i.td,{children:(0,n.jsx)(i.code,{children:"onDestroy"})}),(0,n.jsxs)(i.td,{children:["(",(0,n.jsx)(i.code,{children:"sub"}),") => ",(0,n.jsx)(i.code,{children:"void"})]}),(0,n.jsx)(i.td,{children:"A function which is called when this subscription is destroyed."})]})]})]}),"\n",(0,n.jsx)(i.h4,{id:"returns",children:"Returns"}),"\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/SubscribableSetPipe",children:(0,n.jsx)(i.code,{children:"SubscribableSetPipe"})}),"<",(0,n.jsx)(i.code,{children:"I"}),", ",(0,n.jsx)(i.code,{children:"O"}),", ",(0,n.jsx)(i.code,{children:"HandlerType"}),">"]}),"\n",(0,n.jsx)(i.h4,{id:"overrides",children:"Overrides"}),"\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription",children:(0,n.jsx)(i.code,{children:"HandlerSubscription"})}),".",(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription#constructors",children:(0,n.jsx)(i.code,{children:"constructor"})})]}),"\n",(0,n.jsx)(i.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"src/sdk/sub/SubscribableSetPipe.ts:17"}),"\n",(0,n.jsx)(i.h3,{id:"new-subscribablesetpipe-1",children:"new SubscribableSetPipe()"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"new SubscribableSetPipe"}),"<",(0,n.jsx)(i.code,{children:"I"}),", ",(0,n.jsx)(i.code,{children:"O"}),", ",(0,n.jsx)(i.code,{children:"HandlerType"}),">(",(0,n.jsx)(i.code,{children:"from"}),", ",(0,n.jsx)(i.code,{children:"to"}),", ",(0,n.jsx)(i.code,{children:"map"}),", ",(0,n.jsx)(i.code,{children:"onDestroy"}),"): ",(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/SubscribableSetPipe",children:(0,n.jsx)(i.code,{children:"SubscribableSetPipe"})}),"<",(0,n.jsx)(i.code,{children:"I"}),", ",(0,n.jsx)(i.code,{children:"O"}),", ",(0,n.jsx)(i.code,{children:"HandlerType"}),">"]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"Constructor."}),"\n",(0,n.jsx)(i.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,n.jsxs)(i.table,{children:[(0,n.jsx)(i.thead,{children:(0,n.jsxs)(i.tr,{children:[(0,n.jsx)(i.th,{children:"Parameter"}),(0,n.jsx)(i.th,{children:"Type"}),(0,n.jsx)(i.th,{children:"Description"})]})}),(0,n.jsxs)(i.tbody,{children:[(0,n.jsxs)(i.tr,{children:[(0,n.jsx)(i.td,{children:(0,n.jsx)(i.code,{children:"from"})}),(0,n.jsxs)(i.td,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/SubscribableSet",children:(0,n.jsx)(i.code,{children:"SubscribableSet"})}),"<",(0,n.jsx)(i.code,{children:"I"}),">"]}),(0,n.jsx)(i.td,{children:"The input subscribable set."})]}),(0,n.jsxs)(i.tr,{children:[(0,n.jsx)(i.td,{children:(0,n.jsx)(i.code,{children:"to"})}),(0,n.jsxs)(i.td,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MutableSubscribableSet",children:(0,n.jsx)(i.code,{children:"MutableSubscribableSet"})}),"<",(0,n.jsx)(i.code,{children:"O"}),">"]}),(0,n.jsx)(i.td,{children:"The output mutable subscribable set."})]}),(0,n.jsxs)(i.tr,{children:[(0,n.jsx)(i.td,{children:(0,n.jsx)(i.code,{children:"map"})}),(0,n.jsxs)(i.td,{children:["(",(0,n.jsx)(i.code,{children:"from"}),") => ",(0,n.jsx)(i.code,{children:"O"})]}),(0,n.jsx)(i.td,{children:"A function which transforms this pipe's input keys."})]}),(0,n.jsxs)(i.tr,{children:[(0,n.jsx)(i.td,{children:(0,n.jsx)(i.code,{children:"onDestroy"})}),(0,n.jsxs)(i.td,{children:["(",(0,n.jsx)(i.code,{children:"sub"}),") => ",(0,n.jsx)(i.code,{children:"void"})]}),(0,n.jsx)(i.td,{children:"A function which is called when this subscription is destroyed."})]})]})]}),"\n",(0,n.jsx)(i.h4,{id:"returns-1",children:"Returns"}),"\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/SubscribableSetPipe",children:(0,n.jsx)(i.code,{children:"SubscribableSetPipe"})}),"<",(0,n.jsx)(i.code,{children:"I"}),", ",(0,n.jsx)(i.code,{children:"O"}),", ",(0,n.jsx)(i.code,{children:"HandlerType"}),">"]}),"\n",(0,n.jsx)(i.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"HandlerSubscription<HandlerType>.constructor"})}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"src/sdk/sub/SubscribableSetPipe.ts:25"}),"\n",(0,n.jsx)(i.h2,{id:"properties",children:"Properties"}),"\n",(0,n.jsx)(i.h3,{id:"caninitialnotify",children:"canInitialNotify"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.code,{children:"readonly"})," ",(0,n.jsx)(i.strong,{children:"canInitialNotify"}),": ",(0,n.jsx)(i.code,{children:"boolean"})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"Whether this subscription supports initial notifications on resume."}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription",children:(0,n.jsx)(i.code,{children:"HandlerSubscription"})}),".",(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription#caninitialnotify",children:(0,n.jsx)(i.code,{children:"canInitialNotify"})})]}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"src/sdk/sub/HandlerSubscription.ts:26"}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"handler",children:"handler"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.code,{children:"readonly"})," ",(0,n.jsx)(i.strong,{children:"handler"}),": ",(0,n.jsx)(i.code,{children:"HandlerType"})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"This subscription's handler. The handler will be called each time this subscription receives a\nnotification from its source."}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription",children:(0,n.jsx)(i.code,{children:"HandlerSubscription"})}),".",(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription#handler",children:(0,n.jsx)(i.code,{children:"handler"})})]}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"src/sdk/sub/HandlerSubscription.ts:37"}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"isalive",children:"isAlive"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.code,{children:"readonly"})," ",(0,n.jsx)(i.strong,{children:"isAlive"}),": ",(0,n.jsx)(i.code,{children:"true"})," = ",(0,n.jsx)(i.code,{children:"true"})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"Whether this subscription is alive. Live subscriptions can be freely paused and resumed. Dead subscriptions no\nlonger receive notifications from their sources and will throw an error when attempting to pause or resume them."}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription",children:(0,n.jsx)(i.code,{children:"HandlerSubscription"})}),".",(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription#isalive",children:(0,n.jsx)(i.code,{children:"isAlive"})})]}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"src/sdk/sub/HandlerSubscription.ts:14"}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"ispaused",children:"isPaused"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.code,{children:"readonly"})," ",(0,n.jsx)(i.strong,{children:"isPaused"}),": ",(0,n.jsx)(i.code,{children:"false"})," = ",(0,n.jsx)(i.code,{children:"false"})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"Whether this subscription is paused. Paused subscriptions do not receive notifications from their sources until\nthey are resumed."}),"\n",(0,n.jsxs)(i.p,{children:["Note that ",(0,n.jsx)(i.code,{children:"!isAlive"})," implies ",(0,n.jsx)(i.code,{children:"isPaused"})," for ",(0,n.jsx)(i.code,{children:"HandlerSubscription"})]}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription",children:(0,n.jsx)(i.code,{children:"HandlerSubscription"})}),".",(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription#ispaused",children:(0,n.jsx)(i.code,{children:"isPaused"})})]}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"src/sdk/sub/HandlerSubscription.ts:23"}),"\n",(0,n.jsx)(i.h2,{id:"methods",children:"Methods"}),"\n",(0,n.jsx)(i.h3,{id:"destroy",children:"destroy()"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"destroy"}),"(): ",(0,n.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"Destroys this subscription. Once destroyed, this subscription will no longer receive notifications from its\nsource and will throw an error when attempting to pause or resume it."}),"\n",(0,n.jsx)(i.h4,{id:"returns-2",children:"Returns"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"void"})}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription",children:(0,n.jsx)(i.code,{children:"HandlerSubscription"})}),".",(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription#destroy",children:(0,n.jsx)(i.code,{children:"destroy"})})]}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"src/sdk/sub/HandlerSubscription.ts:87"}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"initialnotify",children:"initialNotify()"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"initialNotify"}),"(): ",(0,n.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"Sends an initial notification to this subscription."}),"\n",(0,n.jsx)(i.h4,{id:"returns-3",children:"Returns"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"void"})}),"\n",(0,n.jsx)(i.h4,{id:"throws",children:"Throws"}),"\n",(0,n.jsx)(i.p,{children:"Error if this subscription is not alive."}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription",children:(0,n.jsx)(i.code,{children:"HandlerSubscription"})}),".",(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription#initialnotify",children:(0,n.jsx)(i.code,{children:"initialNotify"})})]}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"src/sdk/sub/HandlerSubscription.ts:48"}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"pause",children:"pause()"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"pause"}),"(): ",(0,n.jsx)(i.code,{children:"this"})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"Pauses this subscription. Once paused, this subscription will not receive notifications from its source until it\nis resumed."}),"\n",(0,n.jsx)(i.h4,{id:"returns-4",children:"Returns"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"this"})}),"\n",(0,n.jsx)(i.p,{children:"This subscription, after it has been paused."}),"\n",(0,n.jsx)(i.h4,{id:"throws-1",children:"Throws"}),"\n",(0,n.jsx)(i.p,{children:"Error if this subscription is not alive."}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from-6",children:"Inherited from"}),"\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription",children:(0,n.jsx)(i.code,{children:"HandlerSubscription"})}),".",(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription#pause",children:(0,n.jsx)(i.code,{children:"pause"})})]}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"src/sdk/sub/HandlerSubscription.ts:57"}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"resume",children:"resume()"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"resume"}),"(",(0,n.jsx)(i.code,{children:"initialNotify"}),"): ",(0,n.jsx)(i.code,{children:"this"})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"Resumes this subscription. Once resumed, this subscription will receive notifications from its source."}),"\n",(0,n.jsx)(i.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,n.jsxs)(i.table,{children:[(0,n.jsx)(i.thead,{children:(0,n.jsxs)(i.tr,{children:[(0,n.jsx)(i.th,{children:"Parameter"}),(0,n.jsx)(i.th,{children:"Type"}),(0,n.jsx)(i.th,{children:"Default value"}),(0,n.jsx)(i.th,{children:"Description"})]})}),(0,n.jsx)(i.tbody,{children:(0,n.jsxs)(i.tr,{children:[(0,n.jsx)(i.td,{children:(0,n.jsx)(i.code,{children:"initialNotify"})}),(0,n.jsx)(i.td,{children:(0,n.jsx)(i.code,{children:"boolean"})}),(0,n.jsx)(i.td,{children:(0,n.jsx)(i.code,{children:"false"})}),(0,n.jsxs)(i.td,{children:["Whether to immediately send a notification to this subscription's handler when it is resumed if this subscription supports initial notifications. Defaults to ",(0,n.jsx)(i.code,{children:"false"}),"."]})]})})]}),"\n",(0,n.jsx)(i.h4,{id:"returns-5",children:"Returns"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"this"})}),"\n",(0,n.jsx)(i.p,{children:"This subscription, after it has been resumed."}),"\n",(0,n.jsx)(i.h4,{id:"throws-2",children:"Throws"}),"\n",(0,n.jsx)(i.p,{children:"Error if this subscription is not alive."}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from-7",children:"Inherited from"}),"\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription",children:(0,n.jsx)(i.code,{children:"HandlerSubscription"})}),".",(0,n.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/HandlerSubscription#resume",children:(0,n.jsx)(i.code,{children:"resume"})})]}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"src/sdk/sub/HandlerSubscription.ts:68"})]})}function a(e={}){let{wrapper:i}={...(0,d.a)(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(h,{...e})}):h(e)}},250065:function(e,i,s){s.d(i,{Z:function(){return l},a:function(){return c}});var r=s(667294);let n={},d=r.createContext(n);function c(e){let i=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(i):{...i,...e}},[i,e])}function l(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:c(e.components),r.createElement(d.Provider,{value:i},e.children)}}}]);