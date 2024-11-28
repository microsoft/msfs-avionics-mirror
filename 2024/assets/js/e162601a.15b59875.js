"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["413348"],{990217:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>c,default:()=>x,assets:()=>h,toc:()=>t,frontMatter:()=>l});var r=JSON.parse('{"id":"api/g3xtouchcommon/classes/G3XBacklightPublisher","title":"Class: G3XBacklightPublisher","description":"A publisher for G3X Touch backlight levels.","source":"@site/docs/api/g3xtouchcommon/classes/G3XBacklightPublisher.md","sourceDirName":"api/g3xtouchcommon/classes","slug":"/api/g3xtouchcommon/classes/G3XBacklightPublisher","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XBacklightPublisher","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"G3XBacklightManager","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XBacklightManager"},"next":{"title":"G3XBacklightUtils","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XBacklightUtils"}}'),d=i("785893"),s=i("250065");let l={},c="Class: G3XBacklightPublisher",h={},t=[{value:"Extends",id:"extends",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new G3XBacklightPublisher()",id:"new-g3xbacklightpublisher",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"bus",id:"bus",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"indexedSimVars",id:"indexedsimvars",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"pacer",id:"pacer",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"publishActive",id:"publishactive",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"publisher",id:"publisher",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"resolvedSimVars",id:"resolvedsimvars",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"subscribed",id:"subscribed",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"INDEXED_REGEX",id:"indexed_regex",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"Methods",id:"methods",level:2},{value:"getValue()",id:"getvalue",level:3},{value:"Type Parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"getValueFromEntry()",id:"getvaluefromentry",level:3},{value:"Type Parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"handleSubscribedTopic()",id:"handlesubscribedtopic",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"isPublishing()",id:"ispublishing",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"onTopicSubscribed()",id:"ontopicsubscribed",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"onUpdate()",id:"onupdate",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"publish()",id:"publish",level:3},{value:"Type Parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"publishTopic()",id:"publishtopic",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"resolveIndexedSimVar()",id:"resolveindexedsimvar",level:3},{value:"Parameters",id:"parameters-7",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Inherited from",id:"inherited-from-16",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"startPublish()",id:"startpublish",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Inherited from",id:"inherited-from-17",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"stopPublish()",id:"stoppublish",level:3},{value:"Returns",id:"returns-11",level:4},{value:"Inherited from",id:"inherited-from-18",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"tryMatchIndexedSubscribedTopic()",id:"trymatchindexedsubscribedtopic",level:3},{value:"Parameters",id:"parameters-8",level:4},{value:"Returns",id:"returns-12",level:4},{value:"Inherited from",id:"inherited-from-19",level:4},{value:"Defined in",id:"defined-in-20",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"class-g3xbacklightpublisher",children:"Class: G3XBacklightPublisher"})}),"\n",(0,d.jsx)(n.p,{children:"A publisher for G3X Touch backlight levels."}),"\n",(0,d.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"SimVarPublisher"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/G3XBacklightEvents",children:(0,d.jsx)(n.code,{children:"G3XBacklightEvents"})}),", ",(0,d.jsx)(n.code,{children:"G3XBacklightEventsRoot"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(n.h3,{id:"new-g3xbacklightpublisher",children:"new G3XBacklightPublisher()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"new G3XBacklightPublisher"}),"(",(0,d.jsx)(n.code,{children:"bus"}),", ",(0,d.jsx)(n.code,{children:"pacer"}),"?): ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XBacklightPublisher",children:(0,d.jsx)(n.code,{children:"G3XBacklightPublisher"})})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Creates a new instance of G3XBacklightPublisher."}),"\n",(0,d.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"bus"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"EventBus"})}),(0,d.jsx)(n.td,{children:"The EventBus to publish to."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"pacer"}),"?"]}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"PublishPacer"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/G3XBacklightEvents",children:(0,d.jsx)(n.code,{children:"G3XBacklightEvents"})}),">"]}),(0,d.jsx)(n.td,{children:"An optional pacer to use to control the rate of publishing."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XBacklightPublisher",children:(0,d.jsx)(n.code,{children:"G3XBacklightPublisher"})})}),"\n",(0,d.jsx)(n.h4,{id:"overrides",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher<G3XBacklightEvents, G3XBacklightEventsRoot>.constructor"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Backlight/G3XBacklightEvents.ts:35"}),"\n",(0,d.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(n.h3,{id:"bus",children:"bus"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"bus"}),": ",(0,d.jsx)(n.code,{children:"EventBus"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.bus"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:10"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"indexedsimvars",children:"indexedSimVars"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"indexedSimVars"}),": ",(0,d.jsx)(n.code,{children:"Map"}),"<",(0,d.jsx)(n.code,{children:'"g3x_backlight_auto_level"'})," | ",(0,d.jsx)(n.code,{children:'"g3x_backlight_screen_level"'}),", ",(0,d.jsx)(n.code,{children:"IndexedSimVarPublisherEntry"}),"<",(0,d.jsx)(n.code,{children:"any"}),">>"]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.indexedSimVars"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:153"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"pacer",children:"pacer"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"pacer"}),": ",(0,d.jsx)(n.code,{children:"undefined"})," | ",(0,d.jsx)(n.code,{children:"PublishPacer"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/G3XBacklightEvents",children:(0,d.jsx)(n.code,{children:"G3XBacklightEvents"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.pacer"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:13"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"publishactive",children:"publishActive"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"publishActive"}),": ",(0,d.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.publishActive"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:12"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"publisher",children:"publisher"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"publisher"}),": ",(0,d.jsx)(n.code,{children:"Publisher"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/G3XBacklightEvents",children:(0,d.jsx)(n.code,{children:"G3XBacklightEvents"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.publisher"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:11"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"resolvedsimvars",children:"resolvedSimVars"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"resolvedSimVars"}),": ",(0,d.jsx)(n.code,{children:"Map"}),"<`g3x_backlight_auto_level_${number}` | `g3x_backlight_screen_level_${number}`, ",(0,d.jsx)(n.code,{children:"ResolvedSimVarPublisherEntry"}),"<",(0,d.jsx)(n.code,{children:"any"}),">>"]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.resolvedSimVars"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:151"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"subscribed",children:"subscribed"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"subscribed"}),": ",(0,d.jsx)(n.code,{children:"Map"}),"<`g3x_backlight_auto_level_${number}` | `g3x_backlight_screen_level_${number}`, ",(0,d.jsx)(n.code,{children:"ResolvedSimVarPublisherEntry"}),"<",(0,d.jsx)(n.code,{children:"any"}),">>"]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-6",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.subscribed"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:155"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"indexed_regex",children:"INDEXED_REGEX"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.code,{children:"static"})," ",(0,d.jsx)(n.strong,{children:"INDEXED_REGEX"}),": ",(0,d.jsx)(n.code,{children:"RegExp"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-7",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.INDEXED_REGEX"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:149"}),"\n",(0,d.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(n.h3,{id:"getvalue",children:"getValue()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"getValue"}),"<",(0,d.jsx)(n.code,{children:"K"}),">(",(0,d.jsx)(n.code,{children:"topic"}),"): ",(0,d.jsx)(n.code,{children:"undefined"})," | ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/G3XBacklightEvents",children:(0,d.jsx)(n.code,{children:"G3XBacklightEvents"})}),"[",(0,d.jsx)(n.code,{children:"K"}),"]"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Gets the current value for a topic."}),"\n",(0,d.jsx)(n.h4,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsx)(n.tr,{children:(0,d.jsx)(n.th,{children:"Type Parameter"})})}),(0,d.jsx)(n.tbody,{children:(0,d.jsx)(n.tr,{children:(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"K"})," ",(0,d.jsx)(n.em,{children:"extends"})," `g3x_backlight_auto_level_${number}` | `g3x_backlight_screen_level_${number}`"]})})})]}),"\n",(0,d.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"topic"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"K"})}),(0,d.jsx)(n.td,{children:"A topic."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"undefined"})," | ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/G3XBacklightEvents",children:(0,d.jsx)(n.code,{children:"G3XBacklightEvents"})}),"[",(0,d.jsx)(n.code,{children:"K"}),"]"]}),"\n",(0,d.jsx)(n.p,{children:"The current value for the specified topic."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-8",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.getValue"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:328"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"getvaluefromentry",children:"getValueFromEntry()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"getValueFromEntry"}),"<",(0,d.jsx)(n.code,{children:"T"}),">(",(0,d.jsx)(n.code,{children:"entry"}),"): ",(0,d.jsx)(n.code,{children:"T"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Gets the current value for a resolved topic entry."}),"\n",(0,d.jsx)(n.h4,{id:"type-parameters-1",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsx)(n.tr,{children:(0,d.jsx)(n.th,{children:"Type Parameter"})})}),(0,d.jsx)(n.tbody,{children:(0,d.jsx)(n.tr,{children:(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"T"})})})})]}),"\n",(0,d.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"entry"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"ResolvedSimVarPublisherEntry"}),"<",(0,d.jsx)(n.code,{children:"T"}),">"]}),(0,d.jsx)(n.td,{children:"An entry for a resolved topic."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"T"})}),"\n",(0,d.jsx)(n.p,{children:"The current value for the specified entry."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-9",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.getValueFromEntry"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:342"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"handlesubscribedtopic",children:"handleSubscribedTopic()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"handleSubscribedTopic"}),"(",(0,d.jsx)(n.code,{children:"topic"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Handles when an event bus topic is subscribed to for the first time."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"topic"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"string"})}),(0,d.jsx)(n.td,{children:"The subscribed topic."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-10",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.handleSubscribedTopic"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:197"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"ispublishing",children:"isPublishing()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"isPublishing"}),"(): ",(0,d.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Tells whether or not the publisher is currently active."}),"\n",(0,d.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"boolean"})}),"\n",(0,d.jsx)(n.p,{children:"True if the publisher is active, false otherwise."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-11",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.isPublishing"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:45"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"ontopicsubscribed",children:"onTopicSubscribed()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"onTopicSubscribed"}),"(",(0,d.jsx)(n.code,{children:"topic"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Responds to when one of this publisher's topics is subscribed to for the first time."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"topic"})}),(0,d.jsx)(n.td,{children:"`g3x_backlight_auto_level_${number}` | `g3x_backlight_screen_level_${number}`"}),(0,d.jsx)(n.td,{children:"The topic that was subscribed to."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-12",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.onTopicSubscribed"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:283"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onupdate",children:"onUpdate()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onUpdate"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Publish all subscribed data points to the bus."}),"\n",(0,d.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-13",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.onUpdate"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:300"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"publish",children:"publish()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"publish"}),"<",(0,d.jsx)(n.code,{children:"K"}),">(",(0,d.jsx)(n.code,{children:"topic"}),", ",(0,d.jsx)(n.code,{children:"data"}),", ",(0,d.jsx)(n.code,{children:"sync"}),", ",(0,d.jsx)(n.code,{children:"isCached"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Publish a message if publishing is acpive"}),"\n",(0,d.jsx)(n.h4,{id:"type-parameters-2",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsx)(n.tr,{children:(0,d.jsx)(n.th,{children:"Type Parameter"})})}),(0,d.jsx)(n.tbody,{children:(0,d.jsx)(n.tr,{children:(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"K"})," ",(0,d.jsx)(n.em,{children:"extends"})," keyof ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/G3XBacklightEvents",children:(0,d.jsx)(n.code,{children:"G3XBacklightEvents"})})]})})})]}),"\n",(0,d.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Default value"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"topic"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"K"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"undefined"})}),(0,d.jsx)(n.td,{children:"The topic key to publish to."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"data"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/G3XBacklightEvents",children:(0,d.jsx)(n.code,{children:"G3XBacklightEvents"})}),"[",(0,d.jsx)(n.code,{children:"K"}),"]"]}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"undefined"})}),(0,d.jsx)(n.td,{children:"The data type for chosen topic."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"sync"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"boolean"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"false"})}),(0,d.jsxs)(n.td,{children:["Whether or not the event should be synced to other instruments. Defaults to ",(0,d.jsx)(n.code,{children:"false"}),"."]})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"isCached"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"boolean"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"true"})}),(0,d.jsxs)(n.td,{children:["Whether or not the event should be cached. Defaults to ",(0,d.jsx)(n.code,{children:"true"}),"."]})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-14",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.publish"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:63"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"publishtopic",children:"publishTopic()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"publishTopic"}),"(",(0,d.jsx)(n.code,{children:"topic"}),", ",(0,d.jsx)(n.code,{children:"entry"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Publishes data to the event bus for a topic."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-6",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"topic"})}),(0,d.jsx)(n.td,{children:"`g3x_backlight_auto_level_${number}` | `g3x_backlight_screen_level_${number}`"}),(0,d.jsx)(n.td,{children:"The topic to publish."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"entry"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"undefined"})," | ",(0,d.jsx)(n.code,{children:"ResolvedSimVarPublisherEntry"}),"<",(0,d.jsx)(n.code,{children:"any"}),">"]}),(0,d.jsx)(n.td,{children:"The entry corresponding to the topic"})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-15",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.publishTopic"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:311"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"resolveindexedsimvar",children:"resolveIndexedSimVar()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"resolveIndexedSimVar"}),"(",(0,d.jsx)(n.code,{children:"topic"}),", ",(0,d.jsx)(n.code,{children:"entry"}),", ",(0,d.jsx)(n.code,{children:"index"}),"): ",(0,d.jsx)(n.code,{children:"undefined"})," | ",(0,d.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Attempts to resolve an indexed topic with an index, generating a version of the topic which is mapped to an\nindexed simvar. The resolved indexed topic can then be published."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-7",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"topic"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:'"g3x_backlight_auto_level"'})," | ",(0,d.jsx)(n.code,{children:'"g3x_backlight_screen_level"'})]}),(0,d.jsx)(n.td,{children:"The topic to resolve."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"entry"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"IndexedSimVarPublisherEntry"}),"<",(0,d.jsx)(n.code,{children:"any"}),">"]}),(0,d.jsx)(n.td,{children:"The entry of the topic to resolve."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"index"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The index with which to resolve the topic. If not defined, the topic will resolve to itself (without a suffix) and will be mapped the index-1 version of its simvar."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-9",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"undefined"})," | ",(0,d.jsx)(n.code,{children:"string"})]}),"\n",(0,d.jsxs)(n.p,{children:["The resolved indexed topic, or ",(0,d.jsx)(n.code,{children:"undefined"})," if the topic could not be resolved with the specified index."]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-16",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.resolveIndexedSimVar"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:254"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"startpublish",children:"startPublish()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"startPublish"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Start publishing."}),"\n",(0,d.jsx)(n.h4,{id:"returns-10",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-17",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.startPublish"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:30"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"stoppublish",children:"stopPublish()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"stopPublish"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Stop publishing."}),"\n",(0,d.jsx)(n.h4,{id:"returns-11",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-18",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.stopPublish"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-19",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:37"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"trymatchindexedsubscribedtopic",children:"tryMatchIndexedSubscribedTopic()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"tryMatchIndexedSubscribedTopic"}),"(",(0,d.jsx)(n.code,{children:"topic"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Checks if a subscribed topic matches one of this publisher's indexed topics, and if so resolves and starts\npublishing the indexed topic."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-8",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"topic"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"string"})}),(0,d.jsx)(n.td,{children:"The subscribed topic to check."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-12",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-19",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"SimVarPublisher.tryMatchIndexedSubscribedTopic"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-20",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/instruments/BasePublishers.ts:212"})]})}function x(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(o,{...e})}):o(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return c},a:function(){return l}});var r=i(667294);let d={},s=r.createContext(d);function l(e){let n=r.useContext(s);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:l(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);