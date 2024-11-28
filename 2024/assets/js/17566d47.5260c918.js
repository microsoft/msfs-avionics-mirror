"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["161424"],{486712:function(e,i,n){n.r(i),n.d(i,{metadata:()=>s,contentTitle:()=>l,default:()=>t,assets:()=>a,toc:()=>o,frontMatter:()=>c});var s=JSON.parse('{"id":"api/epic2shared/classes/NavRadioNavSource","title":"Class: NavRadioNavSource\\\\<T\\\\>","description":"Represents a NAV radio, subscribes to the NAV SimVars.","source":"@site/docs/api/epic2shared/classes/NavRadioNavSource.md","sourceDirName":"api/epic2shared/classes","slug":"/api/epic2shared/classes/NavRadioNavSource","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavRadioNavSource","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"NavIndicators","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavIndicators"},"next":{"title":"NavSourceBase","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase"}}'),r=n("785893"),d=n("250065");let c={},l="Class: NavRadioNavSource<T>",a={},o=[{value:"Extends",id:"extends",level:2},{value:"Type Parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new NavRadioNavSource()",id:"new-navradionavsource",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherit Doc",id:"inherit-doc",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"activeFrequency",id:"activefrequency",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"bearing",id:"bearing",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"bus",id:"bus",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"course",id:"course",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"distance",id:"distance",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"hasDme",id:"hasdme",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"hasGlideSlope",id:"hasglideslope",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"hasLocalizer",id:"haslocalizer",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"hasNav",id:"hasnav",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"ident",id:"ident",level:3},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"index",id:"index",level:3},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"isDmeHoldActive",id:"isdmeholdactive",level:3},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"isLocalizer",id:"islocalizer",level:3},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"lateralDeviation",id:"lateraldeviation",level:3},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"lateralDeviationScaling",id:"lateraldeviationscaling",level:3},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"lateralDeviationScalingLabel",id:"lateraldeviationscalinglabel",level:3},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"localizerCourse",id:"localizercourse",level:3},{value:"Inherited from",id:"inherited-from-16",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"name",id:"name",level:3},{value:"Inherited from",id:"inherited-from-17",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"setters",id:"setters",level:3},{value:"Inherited from",id:"inherited-from-18",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"signalStrength",id:"signalstrength",level:3},{value:"Inherited from",id:"inherited-from-19",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"timeToGo",id:"timetogo",level:3},{value:"Inherited from",id:"inherited-from-20",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"toFrom",id:"tofrom",level:3},{value:"Inherited from",id:"inherited-from-21",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"verticalDeviation",id:"verticaldeviation",level:3},{value:"Inherited from",id:"inherited-from-22",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"Methods",id:"methods",level:2},{value:"getType()",id:"gettype",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherit Doc",id:"inherit-doc-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-24",level:4}];function h(e){let i={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(i.header,{children:(0,r.jsx)(i.h1,{id:"class-navradionavsourcet",children:"Class: NavRadioNavSource<T>"})}),"\n",(0,r.jsx)(i.p,{children:"Represents a NAV radio, subscribes to the NAV SimVars."}),"\n",(0,r.jsx)(i.h2,{id:"extends",children:"Extends"}),"\n",(0,r.jsxs)(i.ul,{children:["\n",(0,r.jsxs)(i.li,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),"<",(0,r.jsx)(i.code,{children:"T"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(i.table,{children:[(0,r.jsx)(i.thead,{children:(0,r.jsx)(i.tr,{children:(0,r.jsx)(i.th,{children:"Type Parameter"})})}),(0,r.jsx)(i.tbody,{children:(0,r.jsx)(i.tr,{children:(0,r.jsxs)(i.td,{children:[(0,r.jsx)(i.code,{children:"T"})," ",(0,r.jsx)(i.em,{children:"extends"})," readonly ",(0,r.jsx)(i.code,{children:"string"}),"[]"]})})})]}),"\n",(0,r.jsx)(i.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(i.h3,{id:"new-navradionavsource",children:"new NavRadioNavSource()"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.strong,{children:"new NavRadioNavSource"}),"<",(0,r.jsx)(i.code,{children:"T"}),">(",(0,r.jsx)(i.code,{children:"bus"}),", ",(0,r.jsx)(i.code,{children:"name"}),", ",(0,r.jsx)(i.code,{children:"index"}),"): ",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavRadioNavSource",children:(0,r.jsx)(i.code,{children:"NavRadioNavSource"})}),"<",(0,r.jsx)(i.code,{children:"T"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(i.table,{children:[(0,r.jsx)(i.thead,{children:(0,r.jsxs)(i.tr,{children:[(0,r.jsx)(i.th,{children:"Parameter"}),(0,r.jsx)(i.th,{children:"Type"})]})}),(0,r.jsxs)(i.tbody,{children:[(0,r.jsxs)(i.tr,{children:[(0,r.jsx)(i.td,{children:(0,r.jsx)(i.code,{children:"bus"})}),(0,r.jsx)(i.td,{children:(0,r.jsx)(i.code,{children:"EventBus"})})]}),(0,r.jsxs)(i.tr,{children:[(0,r.jsx)(i.td,{children:(0,r.jsx)(i.code,{children:"name"})}),(0,r.jsxs)(i.td,{children:[(0,r.jsx)(i.code,{children:"T"}),"[",(0,r.jsx)(i.code,{children:"number"}),"]"]})]}),(0,r.jsxs)(i.tr,{children:[(0,r.jsx)(i.td,{children:(0,r.jsx)(i.code,{children:"index"})}),(0,r.jsx)(i.td,{children:(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/type-aliases/Epic2NavRadioIndex",children:(0,r.jsx)(i.code,{children:"Epic2NavRadioIndex"})})})]})]})]}),"\n",(0,r.jsx)(i.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavRadioNavSource",children:(0,r.jsx)(i.code,{children:"NavRadioNavSource"})}),"<",(0,r.jsx)(i.code,{children:"T"}),">"]}),"\n",(0,r.jsx)(i.h4,{id:"inherit-doc",children:"Inherit Doc"}),"\n",(0,r.jsx)(i.h4,{id:"overrides",children:"Overrides"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#constructors",children:(0,r.jsx)(i.code,{children:"constructor"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavSources/NavRadioNavSource.ts:28"}),"\n",(0,r.jsx)(i.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(i.h3,{id:"activefrequency",children:"activeFrequency"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"activeFrequency"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"The active frequency that the nav source is tuned to.\nOnly for NAV and ADF source types.\nNAV ACTIVE FREQUENCY, ADF ACTIVE FREQUENCY."}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#activefrequency",children:(0,r.jsx)(i.code,{children:"activeFrequency"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:69"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"bearing",children:"bearing"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"bearing"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"Always points to the curently tuned station or next waypoint/fix.\nNAV RADIAL, ADF RADIAL"}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#bearing",children:(0,r.jsx)(i.code,{children:"bearing"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:18"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"bus",children:"bus"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"protected"})," ",(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"bus"}),": ",(0,r.jsx)(i.code,{children:"EventBus"})]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"The event bus.\nNavSources need to tell the publisher what to subscribe to."}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#bus",children:(0,r.jsx)(i.code,{children:"bus"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavSources/NavSourceBase.ts:18"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"course",children:"course"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"course"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"Either points towards the next waypoint (GPS/FMS),\ndisplays the course selected by the course knob (VOR),\nor displays the fixed course of a localizer (ILS).\nNAV OBS, L:WTAP_LNav_DTK_Mag"}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#course",children:(0,r.jsx)(i.code,{children:"course"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:24"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"distance",children:"distance"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"distance"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(i.p,{children:["DME, distance to the station or next waypoint.\nIs null when source is NAV and ",(0,r.jsx)(i.code,{children:"hasDme"})," is false.\nNAV DME, ADF DISTANCE, L:WTAP_LNav_DIS"]}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#distance",children:(0,r.jsx)(i.code,{children:"distance"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:47"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"hasdme",children:"hasDme"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"hasDme"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"Whether the source is receiving a valid DME signal.\nOnly for NAV source types.\nNAV HAS DME"}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#hasdme",children:(0,r.jsx)(i.code,{children:"hasDme"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:52"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"hasglideslope",children:"hasGlideSlope"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"hasGlideSlope"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"Whether the source is receiving glideslope information.\nOnly for NAV source types.\nNAV HAS GLIDE SLOPE."}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-6",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#hasglideslope",children:(0,r.jsx)(i.code,{children:"hasGlideSlope"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:82"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"haslocalizer",children:"hasLocalizer"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"hasLocalizer"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"Whether the nav source is receiving a valid localizer signal.\nOnly for NAV source types.\nNAV HAS LOCALIZER"}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-7",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#haslocalizer",children:(0,r.jsx)(i.code,{children:"hasLocalizer"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:42"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"hasnav",children:"hasNav"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"hasNav"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"Whether the source is receiving a nav signal.\nOnly for NAV source types.\nNAV HAS NAV."}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-8",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#hasnav",children:(0,r.jsx)(i.code,{children:"hasNav"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:64"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"ident",children:"ident"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"ident"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"The ICAO ident of the station or waypoint.\nNAV IDENT, or flight plan"}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-9",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#ident",children:(0,r.jsx)(i.code,{children:"ident"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:59"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"index",children:"index"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"index"}),": ",(0,r.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"The index of the nav source. Ex: 1 for NAV1, or 1 for ADF."}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-10",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#index",children:(0,r.jsx)(i.code,{children:"index"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavSources/NavSourceBase.ts:20"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"isdmeholdactive",children:"isDmeHoldActive"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"isDmeHoldActive"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"Whether DME hold is active for this nav source."}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-11",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#isdmeholdactive",children:(0,r.jsx)(i.code,{children:"isDmeHoldActive"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:55"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"islocalizer",children:"isLocalizer"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"isLocalizer"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(i.p,{children:["Whether the tuned station is a localizer or not.\nThis can be true even if ",(0,r.jsx)(i.code,{children:"hasLocalizer"})," is false,\nbecause this can be based on the frequency alone.\nOnly for NAV source types.\nNAV LOCALIZER."]}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-12",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#islocalizer",children:(0,r.jsx)(i.code,{children:"isLocalizer"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:37"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"lateraldeviation",children:"lateralDeviation"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"lateralDeviation"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"Normalized and scaled lateral deviation (-1, 1).\nNAV CDI, L:WTAP_LNav_XTK"}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-13",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#lateraldeviation",children:(0,r.jsx)(i.code,{children:"lateralDeviation"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:73"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"lateraldeviationscaling",children:"lateralDeviationScaling"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"lateralDeviationScaling"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"The current CDI scale, in nautical miles.\nOnly for GPS source types.\nL:WTAP_LNav_CDI_Scale"}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-14",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#lateraldeviationscaling",children:(0,r.jsx)(i.code,{children:"lateralDeviationScaling"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:95"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"lateraldeviationscalinglabel",children:"lateralDeviationScalingLabel"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"lateralDeviationScalingLabel"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"A readable string/enum that shows the name of current scaling being applied to lateral deviation.\nOnly for GPS source types.\nL:WTAP_LNav_CDI_Scale_Label"}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-15",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#lateraldeviationscalinglabel",children:(0,r.jsx)(i.code,{children:"lateralDeviationScalingLabel"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:100"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"localizercourse",children:"localizerCourse"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"localizerCourse"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(i.p,{children:["The fixed course of a localizer when available (ILS).\nIs null when ",(0,r.jsx)(i.code,{children:"hasLocalizer"})," is false.\nOnly for NAV source types.\nNAV LOCALIZER"]}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-16",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#localizercourse",children:(0,r.jsx)(i.code,{children:"localizerCourse"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:30"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"name",children:"name"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"name"}),": ",(0,r.jsx)(i.code,{children:"T"}),"[",(0,r.jsx)(i.code,{children:"number"}),"]"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"The name of the nav source. Ex: NAV1, ADF, FMS."}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-17",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#name",children:(0,r.jsx)(i.code,{children:"name"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavSources/NavSourceBase.ts:19"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"setters",children:"setters"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"protected"})," ",(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"setters"}),": ",(0,r.jsx)(i.code,{children:"Map"}),"<keyof ",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavBaseFields",children:(0,r.jsx)(i.code,{children:"NavBaseFields"})}),", ",(0,r.jsx)(i.code,{children:"object"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"An automatically generated map of setters to make it easy to set, sub, and unsub,\ngetting around having to call .bind()."}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-18",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#setters",children:(0,r.jsx)(i.code,{children:"setters"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-19",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:117"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"signalstrength",children:"signalStrength"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"signalStrength"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"Signal strength received from the reference. A value of zero indicates no signal."}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-19",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#signalstrength",children:(0,r.jsx)(i.code,{children:"signalStrength"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-20",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:14"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"timetogo",children:"timeToGo"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"timeToGo"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"TTG, estimated time remaining until aircraft reaches next fix. // TODO Implement this"}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-20",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#timetogo",children:(0,r.jsx)(i.code,{children:"timeToGo"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-21",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:85"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"tofrom",children:"toFrom"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"toFrom"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"VorToFrom"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"Whether course is pointing TO or FROM the station (VOR),\nor if the aircraft heading is within 90 degress of the desired track (GPS).\nNAV TOFROM, // TODO FMS VAR?"}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-21",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#tofrom",children:(0,r.jsx)(i.code,{children:"toFrom"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-22",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:90"}),"\n",(0,r.jsx)(i.hr,{}),"\n",(0,r.jsx)(i.h3,{id:"verticaldeviation",children:"verticalDeviation"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.code,{children:"readonly"})," ",(0,r.jsx)(i.strong,{children:"verticalDeviation"}),": ",(0,r.jsx)(i.code,{children:"Subject"}),"<",(0,r.jsx)(i.code,{children:"null"})," | ",(0,r.jsx)(i.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"Normalized and scaled vertical deviation (-1, 1).\nNAV GLIDE SLOPE ERROR, L:WTAP_VNav_Vertical_Deviation, L:WTAP_LPV_Vertical_Deviation"}),"\n",(0,r.jsx)(i.h4,{id:"inherited-from-22",children:"Inherited from"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#verticaldeviation",children:(0,r.jsx)(i.code,{children:"verticalDeviation"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-23",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:77"}),"\n",(0,r.jsx)(i.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(i.h3,{id:"gettype",children:"getType()"}),"\n",(0,r.jsxs)(i.blockquote,{children:["\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.strong,{children:"getType"}),"(): ",(0,r.jsx)(i.code,{children:"NavSourceType"})]}),"\n"]}),"\n",(0,r.jsx)(i.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsx)(i.p,{children:(0,r.jsx)(i.code,{children:"NavSourceType"})}),"\n",(0,r.jsx)(i.h4,{id:"inherit-doc-1",children:"Inherit Doc"}),"\n",(0,r.jsx)(i.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,r.jsxs)(i.p,{children:[(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(i.code,{children:"NavSourceBase"})}),".",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase#gettype",children:(0,r.jsx)(i.code,{children:"getType"})})]}),"\n",(0,r.jsx)(i.h4,{id:"defined-in-24",children:"Defined in"}),"\n",(0,r.jsx)(i.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavSources/NavRadioNavSource.ts:93"})]})}function t(e={}){let{wrapper:i}={...(0,d.a)(),...e.components};return i?(0,r.jsx)(i,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},250065:function(e,i,n){n.d(i,{Z:function(){return l},a:function(){return c}});var s=n(667294);let r={},d=s.createContext(r);function c(e){let i=s.useContext(d);return s.useMemo(function(){return"function"==typeof e?e(i):{...i,...e}},[i,e])}function l(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:c(e.components),s.createElement(d.Provider,{value:i},e.children)}}}]);