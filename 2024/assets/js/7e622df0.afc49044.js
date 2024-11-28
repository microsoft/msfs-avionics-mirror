"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["887261"],{188047:function(e,n,s){s.r(n),s.d(n,{metadata:()=>i,contentTitle:()=>l,default:()=>o,assets:()=>t,toc:()=>a,frontMatter:()=>c});var i=JSON.parse('{"id":"api/framework/interfaces/Subscribable","title":"Interface: Subscribable\\\\<T\\\\>","description":"An item which allows others to subscribe to be notified of changes in its state.","source":"@site/docs/api/framework/interfaces/Subscribable.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/Subscribable","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscribable","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"SubEventInterface","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/SubEventInterface"},"next":{"title":"SubscribableArray","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/SubscribableArray"}}'),r=s("785893"),d=s("250065");let c={},l="Interface: Subscribable<T>",t={},a=[{value:"Extends",id:"extends",level:2},{value:"Extended by",id:"extended-by",level:2},{value:"Type Parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"isSubscribable",id:"issubscribable",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"get()",id:"get",level:3},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"map()",id:"map",level:3},{value:"map(fn, equalityFunc)",id:"mapfn-equalityfunc",level:4},{value:"Type Parameters",id:"type-parameters-1",level:5},{value:"Parameters",id:"parameters",level:5},{value:"Returns",id:"returns-1",level:5},{value:"Defined in",id:"defined-in-2",level:5},{value:"map(fn, equalityFunc, mutateFunc, initialVal)",id:"mapfn-equalityfunc-mutatefunc-initialval",level:4},{value:"Type Parameters",id:"type-parameters-2",level:5},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Defined in",id:"defined-in-3",level:5},{value:"pipe()",id:"pipe",level:3},{value:"pipe(to, paused)",id:"pipeto-paused",level:4},{value:"Parameters",id:"parameters-2",level:5},{value:"Returns",id:"returns-3",level:5},{value:"Defined in",id:"defined-in-4",level:5},{value:"pipe(to, map, paused)",id:"pipeto-map-paused",level:4},{value:"Type Parameters",id:"type-parameters-3",level:5},{value:"Parameters",id:"parameters-3",level:5},{value:"Returns",id:"returns-4",level:5},{value:"Defined in",id:"defined-in-5",level:5},{value:"sub()",id:"sub",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-6",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"interface-subscribablet",children:"Interface: Subscribable<T>"})}),"\n",(0,r.jsx)(n.p,{children:"An item which allows others to subscribe to be notified of changes in its state."}),"\n",(0,r.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Accessible",children:(0,r.jsx)(n.code,{children:"Accessible"})}),"<",(0,r.jsx)(n.code,{children:"T"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"extended-by",children:"Extended by"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MappedSubscribable",children:(0,r.jsx)(n.code,{children:"MappedSubscribable"})})}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MutableSubscribable",children:(0,r.jsx)(n.code,{children:"MutableSubscribable"})})}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.th,{children:"Type Parameter"})})}),(0,r.jsx)(n.tbody,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"T"})})})})]}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"issubscribable",children:"isSubscribable"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"isSubscribable"}),": ",(0,r.jsx)(n.code,{children:"true"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Flags this object as a Subscribable."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/sub/Subscribable.ts:9"}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"get",children:"get()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"get"}),"(): ",(0,r.jsx)(n.code,{children:"T"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Gets this item's state."}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"T"})}),"\n",(0,r.jsx)(n.p,{children:"This item's state."}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Accessible",children:(0,r.jsx)(n.code,{children:"Accessible"})}),".",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Accessible#get",children:(0,r.jsx)(n.code,{children:"get"})})]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/sub/Accessible.ts:9"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"map",children:"map()"}),"\n",(0,r.jsx)(n.h4,{id:"mapfn-equalityfunc",children:"map(fn, equalityFunc)"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"map"}),"<",(0,r.jsx)(n.code,{children:"M"}),">(",(0,r.jsx)(n.code,{children:"fn"}),", ",(0,r.jsx)(n.code,{children:"equalityFunc"}),"?): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MappedSubscribable",children:(0,r.jsx)(n.code,{children:"MappedSubscribable"})}),"<",(0,r.jsx)(n.code,{children:"M"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Maps this subscribable to a new subscribable."}),"\n",(0,r.jsx)(n.h5,{id:"type-parameters-1",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.th,{children:"Type Parameter"})})}),(0,r.jsx)(n.tbody,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"M"})})})})]}),"\n",(0,r.jsx)(n.h5,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"fn"})}),(0,r.jsxs)(n.td,{children:["(",(0,r.jsx)(n.code,{children:"input"}),", ",(0,r.jsx)(n.code,{children:"previousVal"}),"?) => ",(0,r.jsx)(n.code,{children:"M"})]}),(0,r.jsx)(n.td,{children:"The function to use to map to the new subscribable."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"equalityFunc"}),"?"]}),(0,r.jsxs)(n.td,{children:["(",(0,r.jsx)(n.code,{children:"a"}),", ",(0,r.jsx)(n.code,{children:"b"}),") => ",(0,r.jsx)(n.code,{children:"boolean"})]}),(0,r.jsxs)(n.td,{children:["The function to use to check for equality between mapped values. Defaults to the strict equality comparison (",(0,r.jsx)(n.code,{children:"==="}),")."]})]})]})]}),"\n",(0,r.jsx)(n.h5,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MappedSubscribable",children:(0,r.jsx)(n.code,{children:"MappedSubscribable"})}),"<",(0,r.jsx)(n.code,{children:"M"}),">"]}),"\n",(0,r.jsx)(n.p,{children:"The mapped subscribable."}),"\n",(0,r.jsx)(n.h5,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/sub/Subscribable.ts:28"}),"\n",(0,r.jsx)(n.h4,{id:"mapfn-equalityfunc-mutatefunc-initialval",children:"map(fn, equalityFunc, mutateFunc, initialVal)"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"map"}),"<",(0,r.jsx)(n.code,{children:"M"}),">(",(0,r.jsx)(n.code,{children:"fn"}),", ",(0,r.jsx)(n.code,{children:"equalityFunc"}),", ",(0,r.jsx)(n.code,{children:"mutateFunc"}),", ",(0,r.jsx)(n.code,{children:"initialVal"}),"): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MappedSubscribable",children:(0,r.jsx)(n.code,{children:"MappedSubscribable"})}),"<",(0,r.jsx)(n.code,{children:"M"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Maps this subscribable to a new subscribable with a persistent, cached value which is mutated when it changes."}),"\n",(0,r.jsx)(n.h5,{id:"type-parameters-2",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.th,{children:"Type Parameter"})})}),(0,r.jsx)(n.tbody,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"M"})})})})]}),"\n",(0,r.jsx)(n.h5,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"fn"})}),(0,r.jsxs)(n.td,{children:["(",(0,r.jsx)(n.code,{children:"input"}),", ",(0,r.jsx)(n.code,{children:"previousVal"}),"?) => ",(0,r.jsx)(n.code,{children:"M"})]}),(0,r.jsx)(n.td,{children:"The function to use to map to the new subscribable."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"equalityFunc"})}),(0,r.jsxs)(n.td,{children:["(",(0,r.jsx)(n.code,{children:"a"}),", ",(0,r.jsx)(n.code,{children:"b"}),") => ",(0,r.jsx)(n.code,{children:"boolean"})]}),(0,r.jsx)(n.td,{children:"The function to use to check for equality between mapped values."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"mutateFunc"})}),(0,r.jsxs)(n.td,{children:["(",(0,r.jsx)(n.code,{children:"oldVal"}),", ",(0,r.jsx)(n.code,{children:"newVal"}),") => ",(0,r.jsx)(n.code,{children:"void"})]}),(0,r.jsx)(n.td,{children:"The function to use to change the value of the mapped subscribable."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"initialVal"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"M"})}),(0,r.jsx)(n.td,{children:"The initial value of the mapped subscribable."})]})]})]}),"\n",(0,r.jsx)(n.h5,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MappedSubscribable",children:(0,r.jsx)(n.code,{children:"MappedSubscribable"})}),"<",(0,r.jsx)(n.code,{children:"M"}),">"]}),"\n",(0,r.jsx)(n.p,{children:"The mapped subscribable."}),"\n",(0,r.jsx)(n.h5,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/sub/Subscribable.ts:37"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"pipe",children:"pipe()"}),"\n",(0,r.jsx)(n.h4,{id:"pipeto-paused",children:"pipe(to, paused)"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"pipe"}),"(",(0,r.jsx)(n.code,{children:"to"}),", ",(0,r.jsx)(n.code,{children:"paused"}),"?): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscription",children:(0,r.jsx)(n.code,{children:"Subscription"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Subscribes to and pipes this subscribable's state to a mutable subscribable. Whenever an update of this\nsubscribable's state is received through the subscription, it will be used as an input to change the other\nsubscribable's state."}),"\n",(0,r.jsx)(n.h5,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"to"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MutableSubscribable",children:(0,r.jsx)(n.code,{children:"MutableSubscribable"})}),"<",(0,r.jsx)(n.code,{children:"any"}),", ",(0,r.jsx)(n.code,{children:"T"}),">"]}),(0,r.jsx)(n.td,{children:"The mutable subscribable to which to pipe this subscribable's state."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"paused"}),"?"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"boolean"})}),(0,r.jsxs)(n.td,{children:["Whether the new subscription should be initialized as paused. Defaults to ",(0,r.jsx)(n.code,{children:"false"}),"."]})]})]})]}),"\n",(0,r.jsx)(n.h5,{id:"returns-3",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscription",children:(0,r.jsx)(n.code,{children:"Subscription"})})}),"\n",(0,r.jsx)(n.p,{children:"The new subscription."}),"\n",(0,r.jsx)(n.h5,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/sub/Subscribable.ts:52"}),"\n",(0,r.jsx)(n.h4,{id:"pipeto-map-paused",children:"pipe(to, map, paused)"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"pipe"}),"<",(0,r.jsx)(n.code,{children:"M"}),">(",(0,r.jsx)(n.code,{children:"to"}),", ",(0,r.jsx)(n.code,{children:"map"}),", ",(0,r.jsx)(n.code,{children:"paused"}),"?): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscription",children:(0,r.jsx)(n.code,{children:"Subscription"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Subscribes to this subscribable's state and pipes a mapped version to a mutable subscribable. Whenever an update\nof this subscribable's state is received through the subscription, it will be transformed by the specified mapping\nfunction, and the transformed state will be used as an input to change the other subscribable's state."}),"\n",(0,r.jsx)(n.h5,{id:"type-parameters-3",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.th,{children:"Type Parameter"})})}),(0,r.jsx)(n.tbody,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"M"})})})})]}),"\n",(0,r.jsx)(n.h5,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"to"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MutableSubscribable",children:(0,r.jsx)(n.code,{children:"MutableSubscribable"})}),"<",(0,r.jsx)(n.code,{children:"any"}),", ",(0,r.jsx)(n.code,{children:"M"}),">"]}),(0,r.jsx)(n.td,{children:"The mutable subscribable to which to pipe this subscribable's mapped state."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"map"})}),(0,r.jsxs)(n.td,{children:["(",(0,r.jsx)(n.code,{children:"fromVal"}),", ",(0,r.jsx)(n.code,{children:"toVal"}),") => ",(0,r.jsx)(n.code,{children:"M"})]}),(0,r.jsx)(n.td,{children:"The function to use to transform inputs."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"paused"}),"?"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"boolean"})}),(0,r.jsxs)(n.td,{children:["Whether the new subscription should be initialized as paused. Defaults to ",(0,r.jsx)(n.code,{children:"false"}),"."]})]})]})]}),"\n",(0,r.jsx)(n.h5,{id:"returns-4",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscription",children:(0,r.jsx)(n.code,{children:"Subscription"})})}),"\n",(0,r.jsx)(n.p,{children:"The new subscription."}),"\n",(0,r.jsx)(n.h5,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/sub/Subscribable.ts:62"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"sub",children:"sub()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"sub"}),"(",(0,r.jsx)(n.code,{children:"handler"}),", ",(0,r.jsx)(n.code,{children:"initialNotify"}),"?, ",(0,r.jsx)(n.code,{children:"paused"}),"?): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscription",children:(0,r.jsx)(n.code,{children:"Subscription"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Subscribes to changes in this subscribable's state."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"handler"})}),(0,r.jsxs)(n.td,{children:["(",(0,r.jsx)(n.code,{children:"value"}),") => ",(0,r.jsx)(n.code,{children:"void"})]}),(0,r.jsx)(n.td,{children:"A function which is called when this subscribable's state changes."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"initialNotify"}),"?"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"boolean"})}),(0,r.jsxs)(n.td,{children:["Whether to immediately invoke the callback function with this subscribable's current state. Defaults to ",(0,r.jsx)(n.code,{children:"false"}),". This argument is ignored if the subscription is initialized as paused."]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"paused"}),"?"]}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"boolean"})}),(0,r.jsxs)(n.td,{children:["Whether the new subscription should be initialized as paused. Defaults to ",(0,r.jsx)(n.code,{children:"false"}),"."]})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscription",children:(0,r.jsx)(n.code,{children:"Subscription"})})}),"\n",(0,r.jsx)(n.p,{children:"The new subscription."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/sub/Subscribable.ts:19"})]})}function o(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return l},a:function(){return c}});var i=s(667294);let r={},d=i.createContext(r);function c(e){let n=i.useContext(d);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:c(e.components),i.createElement(d.Provider,{value:n},e.children)}}}]);