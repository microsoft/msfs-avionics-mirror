"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["793623"],{223653:function(e,n,i){i.r(n),i.d(n,{metadata:()=>s,contentTitle:()=>l,default:()=>a,assets:()=>t,toc:()=>h,frontMatter:()=>c});var s=JSON.parse('{"id":"api/wt21shared/classes/AhrsSystem","title":"Class: AhrsSystem","description":"The AHRS system.","source":"@site/docs/api/wt21shared/classes/AhrsSystem.md","sourceDirName":"api/wt21shared/classes","slug":"/api/wt21shared/classes/AhrsSystem","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/AhrsSystem","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"AdfRadioSource","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/AdfRadioSource"},"next":{"title":"AhrsSystemSelector","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/AhrsSystemSelector"}}'),d=i("785893"),r=i("250065");let c={},l="Class: AhrsSystem",t={},h=[{value:"Extends",id:"extends",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new AhrsSystem()",id:"new-ahrssystem",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"_state",id:"_state",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"bus",id:"bus",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"electricalPowerLogic?",id:"electricalpowerlogic",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"electricalPowerSub?",id:"electricalpowersub",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"index",id:"index",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"initializationTime",id:"initializationtime",level:3},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"initializationTimer",id:"initializationtimer",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"isPowered",id:"ispowered",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"isPowerValid",id:"ispowervalid",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"publisher",id:"publisher",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"stateEvent",id:"stateevent",level:3},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"Accessors",id:"accessors",level:2},{value:"state",id:"state",level:3},{value:"Get Signature",id:"get-signature",level:4},{value:"Inherit Doc",id:"inherit-doc",level:5},{value:"Returns",id:"returns-1",level:5},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"Methods",id:"methods",level:2},{value:"connectToPower()",id:"connecttopower",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"onPowerChanged()",id:"onpowerchanged",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Inherit Doc",id:"inherit-doc-1",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"onPowerValid()",id:"onpowervalid",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"onStateChanged()",id:"onstatechanged",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Inherit Doc",id:"inherit-doc-2",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"onUpdate()",id:"onupdate",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Inherit Doc",id:"inherit-doc-3",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"setState()",id:"setstate",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"updatePowerFromLogic()",id:"updatepowerfromlogic",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-19",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,r.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"class-ahrssystem",children:"Class: AhrsSystem"})}),"\n",(0,d.jsx)(n.p,{children:"The AHRS system."}),"\n",(0,d.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"BasicAvionicsSystem"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/AhrsSystemEvents",children:(0,d.jsx)(n.code,{children:"AhrsSystemEvents"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(n.h3,{id:"new-ahrssystem",children:"new AhrsSystem()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"new AhrsSystem"}),"(",(0,d.jsx)(n.code,{children:"index"}),", ",(0,d.jsx)(n.code,{children:"bus"}),", ",(0,d.jsx)(n.code,{children:"definition"}),"): ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/AhrsSystem",children:(0,d.jsx)(n.code,{children:"AhrsSystem"})})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Creates an instance of an AHRS system."}),"\n",(0,d.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"index"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The index of the AHRS."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"bus"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"EventBus"})}),(0,d.jsx)(n.td,{children:"An instance of the event bus."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"definition"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/type-aliases/AhrsDefinition",children:(0,d.jsx)(n.code,{children:"AhrsDefinition"})})}),(0,d.jsx)(n.td,{children:"An AHRS config definition"})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/AhrsSystem",children:(0,d.jsx)(n.code,{children:"AhrsSystem"})})}),"\n",(0,d.jsx)(n.h4,{id:"overrides",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem<AhrsSystemEvents>.constructor"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Systems/AHRSSystem.ts:74"}),"\n",(0,d.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(n.h3,{id:"_state",children:"_state"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"_state"}),": ",(0,d.jsx)(n.code,{children:"undefined"})," | ",(0,d.jsx)(n.code,{children:"AvionicsSystemState"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem._state"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"sdk/system/BasicAvionicsSystem.ts:32"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"bus",children:"bus"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"bus"}),": ",(0,d.jsx)(n.code,{children:"EventBus"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"An instance of the event bus."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.bus"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Systems/AHRSSystem.ts:74"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"electricalpowerlogic",children:"electricalPowerLogic?"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"optional"})," ",(0,d.jsx)(n.strong,{children:"electricalPowerLogic"}),": ",(0,d.jsx)(n.code,{children:"CompositeLogicXMLElement"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.electricalPowerLogic"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"sdk/system/BasicAvionicsSystem.ts:48"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"electricalpowersub",children:"electricalPowerSub?"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"optional"})," ",(0,d.jsx)(n.strong,{children:"electricalPowerSub"}),": ",(0,d.jsx)(n.code,{children:"Subscription"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.electricalPowerSub"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"sdk/system/BasicAvionicsSystem.ts:47"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"index",children:"index"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"index"}),": ",(0,d.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The index of the AHRS."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.index"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Systems/AHRSSystem.ts:74"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"initializationtime",children:"initializationTime"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"initializationTime"}),": ",(0,d.jsx)(n.code,{children:"number"})," = ",(0,d.jsx)(n.code,{children:"30000"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The time it takes in milliseconds for the system to initialize."}),"\n",(0,d.jsx)(n.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.initializationTime"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Systems/AHRSSystem.ts:38"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"initializationtimer",children:"initializationTimer"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"initializationTimer"}),": ",(0,d.jsx)(n.code,{children:"DebounceTimer"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"A timeout after which initialization will be complete."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.initializationTimer"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"sdk/system/BasicAvionicsSystem.ts:42"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"ispowered",children:"isPowered"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"isPowered"}),": ",(0,d.jsx)(n.code,{children:"undefined"})," | ",(0,d.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Whether or not the system is powered."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-6",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.isPowered"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"sdk/system/BasicAvionicsSystem.ts:45"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"ispowervalid",children:"isPowerValid"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"isPowerValid"}),": ",(0,d.jsx)(n.code,{children:"boolean"})," = ",(0,d.jsx)(n.code,{children:"false"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Whether power data consumed by this system is valid."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-7",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.isPowerValid"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"sdk/system/BasicAvionicsSystem.ts:53"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"publisher",children:"publisher"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"publisher"}),": ",(0,d.jsx)(n.code,{children:"Publisher"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/AhrsSystemEvents",children:(0,d.jsx)(n.code,{children:"AhrsSystemEvents"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-8",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.publisher"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"sdk/system/BasicAvionicsSystem.ts:50"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"stateevent",children:"stateEvent"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"stateEvent"}),": `ahrs_state_${number}`"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The key of the state update event to send on state update."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-9",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.stateEvent"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"sdk/system/BasicAvionicsSystem.ts:64"}),"\n",(0,d.jsx)(n.h2,{id:"accessors",children:"Accessors"}),"\n",(0,d.jsx)(n.h3,{id:"state",children:"state"}),"\n",(0,d.jsx)(n.h4,{id:"get-signature",children:"Get Signature"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"get"})," ",(0,d.jsx)(n.strong,{children:"state"}),"(): ",(0,d.jsx)(n.code,{children:"undefined"})," | ",(0,d.jsx)(n.code,{children:"AvionicsSystemState"})]}),"\n"]}),"\n",(0,d.jsx)(n.h5,{id:"inherit-doc",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h5,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"undefined"})," | ",(0,d.jsx)(n.code,{children:"AvionicsSystemState"})]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-10",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.state"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"sdk/system/BasicAvionicsSystem.ts:34"}),"\n",(0,d.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(n.h3,{id:"connecttopower",children:"connectToPower()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"connectToPower"}),"(",(0,d.jsx)(n.code,{children:"source"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Connects this system's power state to an ElectricalEvents topic, electricity logic element, or\nSubscribable."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"source"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"CompositeLogicXMLElement"})," | ",(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"boolean"}),"> | ",(0,d.jsx)(n.code,{children:'"elec_master_battery"'})," | ",(0,d.jsx)(n.code,{children:'"elec_bat_v"'})," | ",(0,d.jsx)(n.code,{children:'"elec_bat_load"'})," | ",(0,d.jsx)(n.code,{children:'"elec_bat_soc"'})," | ",(0,d.jsx)(n.code,{children:'"elec_ext_power_available"'})," | ",(0,d.jsx)(n.code,{children:'"elec_ext_power_on"'})," | ",(0,d.jsx)(n.code,{children:'"elec_ext_power_v"'})," | ",(0,d.jsx)(n.code,{children:'"elec_ext_power_a"'})," | ",(0,d.jsx)(n.code,{children:'"elec_apu_gen_active"'})," | ",(0,d.jsx)(n.code,{children:'"elec_apu_gen_switch"'})," | ",(0,d.jsx)(n.code,{children:'"elec_eng_gen_switch"'})," | ",(0,d.jsx)(n.code,{children:'"elec_bus_avionics_v"'})," | ",(0,d.jsx)(n.code,{children:'"elec_bus_avionics_a"'})," | ",(0,d.jsx)(n.code,{children:'"elec_circuit_navcom1_on"'})," | ",(0,d.jsx)(n.code,{children:'"elec_circuit_navcom2_on"'})," | ",(0,d.jsx)(n.code,{children:'"elec_circuit_navcom3_on"'})," | ",(0,d.jsx)(n.code,{children:'"elec_av1_bus"'})," | ",(0,d.jsx)(n.code,{children:'"elec_av2_bus"'})," | `elec_bus_v_${number}` | `elec_bus_a_${number}` | `elec_bus_main_v_${number}` | `elec_bus_main_a_${number}` | `elec_bus_genalt_v_${number}` | `elec_bus_genalt_a_${number}` | `elec_circuit_on_${number}` | `elec_circuit_switch_on_${number}` | `elec_circuit_v_${number}` | `elec_circuit_a_${number}` | `elec_circuit_avionics_on_${number}` | `elec_circuit_com_on_${number}` | `elec_circuit_nav_on_${number}` | `elec_line_connection_on_${number}` | `elec_line_breaker_pulled_${number}` | `elec_gen_switch_on_${number}` | `elec_gen_active_${number}` | `elec_gen_v_${number}` | `elec_gen_a_${number}` | `elec_master_battery_${number}` | `elec_bat_v_${number}` | `elec_bat_load_${number}` | `elec_bat_soc_${number}` | `elec_ext_power_available_${number}` | `elec_ext_power_on_${number}` | `elec_ext_power_v_${number}` | `elec_ext_power_a_${number}` | `elec_apu_gen_active_${number}` | `elec_apu_gen_switch_${number}` | `elec_eng_gen_switch_${number}`"]}),(0,d.jsx)(n.td,{children:"The source to which to connect this system's power state."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-11",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.connectToPower"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"sdk/system/BasicAvionicsSystem.ts:95"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onpowerchanged",children:"onPowerChanged()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"onPowerChanged"}),"(",(0,d.jsx)(n.code,{children:"isPowered"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"isPowered"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"boolean"})})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-1",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-2",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.onPowerChanged"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Systems/AHRSSystem.ts:88"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onpowervalid",children:"onPowerValid()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"onPowerValid"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Responds to when power data becomes valid."}),"\n",(0,d.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-12",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.onPowerValid"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"sdk/system/BasicAvionicsSystem.ts:86"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onstatechanged",children:"onStateChanged()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"onStateChanged"}),"(",(0,d.jsx)(n.code,{children:"previousState"}),", ",(0,d.jsx)(n.code,{children:"currentState"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"previousState"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"undefined"})," | ",(0,d.jsx)(n.code,{children:"AvionicsSystemState"})]})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"currentState"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"AvionicsSystemState"})})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-2",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-3",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.onStateChanged"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Systems/AHRSSystem.ts:189"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onupdate",children:"onUpdate()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onUpdate"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-3",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-4",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.onUpdate"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Systems/AHRSSystem.ts:123"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"setstate",children:"setState()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"setState"}),"(",(0,d.jsx)(n.code,{children:"state"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Sets the state of the avionics system and publishes the change."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"state"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"AvionicsSystemState"})}),(0,d.jsx)(n.td,{children:"The new state to change to."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-13",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.setState"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"sdk/system/BasicAvionicsSystem.ts:117"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"updatepowerfromlogic",children:"updatePowerFromLogic()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.strong,{children:"updatePowerFromLogic"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Updates this system's power state from an electricity logic element."}),"\n",(0,d.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-14",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"BasicAvionicsSystem.updatePowerFromLogic"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-19",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"sdk/system/BasicAvionicsSystem.ts:171"})]})}function a(e={}){let{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(o,{...e})}):o(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return l},a:function(){return c}});var s=i(667294);let d={},r=s.createContext(d);function c(e){let n=s.useContext(r);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:c(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);