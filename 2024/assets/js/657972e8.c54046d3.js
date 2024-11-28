"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["958573"],{685444:function(e,n,i){i.r(n),i.d(n,{metadata:()=>d,contentTitle:()=>c,default:()=>t,assets:()=>o,toc:()=>h,frontMatter:()=>l});var d=JSON.parse('{"id":"api/epic2shared/classes/Epic2CourseNeedleNavIndicator","title":"Class: Epic2CourseNeedleNavIndicator","description":"Inherit Doc","source":"@site/docs/api/epic2shared/classes/Epic2CourseNeedleNavIndicator.md","sourceDirName":"api/epic2shared/classes","slug":"/api/epic2shared/classes/Epic2CourseNeedleNavIndicator","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/Epic2CourseNeedleNavIndicator","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"Epic2CoordinatesUtils","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/Epic2CoordinatesUtils"},"next":{"title":"Epic2DuController","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/Epic2DuController"}}'),r=i("785893"),s=i("250065");let l={},c="Class: Epic2CourseNeedleNavIndicator",o={},h=[{value:"Inherit Doc",id:"inherit-doc",level:2},{value:"Extends",id:"extends",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new Epic2CourseNeedleNavIndicator()",id:"new-epic2courseneedlenavindicator",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"activeFrequency",id:"activefrequency",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"bearing",id:"bearing",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"course",id:"course",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"distance",id:"distance",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"hasDme",id:"hasdme",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"hasGlideSlope",id:"hasglideslope",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"hasLocalizer",id:"haslocalizer",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"hasNav",id:"hasnav",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"ident",id:"ident",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"isDmeHoldActive",id:"isdmeholdactive",level:3},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"isLocalizer",id:"islocalizer",level:3},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"lateralDeviation",id:"lateraldeviation",level:3},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"lateralDeviationScaling",id:"lateraldeviationscaling",level:3},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"lateralDeviationScalingLabel",id:"lateraldeviationscalinglabel",level:3},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"localizerCourse",id:"localizercourse",level:3},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"navSources",id:"navsources",level:3},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"setters",id:"setters",level:3},{value:"Inherited from",id:"inherited-from-16",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"signalStrength",id:"signalstrength",level:3},{value:"Inherited from",id:"inherited-from-17",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"source",id:"source",level:3},{value:"Inherited from",id:"inherited-from-18",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"sourceLabel",id:"sourcelabel",level:3},{value:"Inherited from",id:"inherited-from-19",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"timeToGo",id:"timetogo",level:3},{value:"Inherited from",id:"inherited-from-20",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"toFrom",id:"tofrom",level:3},{value:"Inherited from",id:"inherited-from-21",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"verticalDeviation",id:"verticaldeviation",level:3},{value:"Inherited from",id:"inherited-from-22",level:4},{value:"Defined in",id:"defined-in-24",level:4},{value:"Methods",id:"methods",level:2},{value:"setSource()",id:"setsource",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-23",level:4},{value:"Defined in",id:"defined-in-25",level:4}];function a(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"class-epic2courseneedlenavindicator",children:"Class: Epic2CourseNeedleNavIndicator"})}),"\n",(0,r.jsx)(n.h2,{id:"inherit-doc",children:"Inherit Doc"}),"\n",(0,r.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/type-aliases/Epic2NavSourceNames",children:(0,r.jsx)(n.code,{children:"Epic2NavSourceNames"})}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(n.h3,{id:"new-epic2courseneedlenavindicator",children:"new Epic2CourseNeedleNavIndicator()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"new Epic2CourseNeedleNavIndicator"}),"(",(0,r.jsx)(n.code,{children:"navSources"}),", ",(0,r.jsx)(n.code,{children:"displayUnitIndex"}),", ",(0,r.jsx)(n.code,{children:"bus"}),", ",(0,r.jsx)(n.code,{children:"availableSourceNames"}),"): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/Epic2CourseNeedleNavIndicator",children:(0,r.jsx)(n.code,{children:"Epic2CourseNeedleNavIndicator"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"NavIndicator constructor."}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"navSources"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/type-aliases/Epic2NavSources",children:(0,r.jsx)(n.code,{children:"Epic2NavSources"})})}),(0,r.jsx)(n.td,{children:"The possible nav sources that could be pointed to."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"displayUnitIndex"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/enumerations/DisplayUnitIndices",children:(0,r.jsx)(n.code,{children:"DisplayUnitIndices"})})}),(0,r.jsx)(n.td,{children:"The DU index we're running on."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"bus"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"EventBus"})}),(0,r.jsx)(n.td,{children:"The bus."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"availableSourceNames"})}),(0,r.jsxs)(n.td,{children:["(",(0,r.jsx)(n.code,{children:'"NAV1"'})," | ",(0,r.jsx)(n.code,{children:'"NAV2"'})," | ",(0,r.jsx)(n.code,{children:'"FMS"'}),")[]"]}),(0,r.jsx)(n.td,{children:"The available source names in the order they are cycled through."})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/Epic2CourseNeedleNavIndicator",children:(0,r.jsx)(n.code,{children:"Epic2CourseNeedleNavIndicator"})})}),"\n",(0,r.jsx)(n.h4,{id:"overrides",children:"Overrides"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase<Epic2NavSourceNames>.constructor"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/Epic2NavIndicators.ts:154"}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"activefrequency",children:"activeFrequency"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"activeFrequency"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The active frequency that the nav source is tuned to.\nOnly for NAV and ADF source types.\nNAV ACTIVE FREQUENCY, ADF ACTIVE FREQUENCY."}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.activeFrequency"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:69"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"bearing",children:"bearing"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"bearing"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Always points to the curently tuned station or next waypoint/fix.\nNAV RADIAL, ADF RADIAL"}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.bearing"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:18"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"bus",children:"bus"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"bus"}),": ",(0,r.jsx)(n.code,{children:"EventBus"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The bus."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/Epic2NavIndicators.ts:157"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"course",children:"course"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"course"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Either points towards the next waypoint (GPS/FMS),\ndisplays the course selected by the course knob (VOR),\nor displays the fixed course of a localizer (ILS).\nNAV OBS, L:WTAP_LNav_DTK_Mag"}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.course"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:24"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"distance",children:"distance"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"distance"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["DME, distance to the station or next waypoint.\nIs null when source is NAV and ",(0,r.jsx)(n.code,{children:"hasDme"})," is false.\nNAV DME, ADF DISTANCE, L:WTAP_LNav_DIS"]}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.distance"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:47"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"hasdme",children:"hasDme"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"hasDme"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Whether the source is receiving a valid DME signal.\nOnly for NAV source types.\nNAV HAS DME"}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.hasDme"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:52"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"hasglideslope",children:"hasGlideSlope"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"hasGlideSlope"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Whether the source is receiving glideslope information.\nOnly for NAV source types.\nNAV HAS GLIDE SLOPE."}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.hasGlideSlope"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:82"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"haslocalizer",children:"hasLocalizer"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"hasLocalizer"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Whether the nav source is receiving a valid localizer signal.\nOnly for NAV source types.\nNAV HAS LOCALIZER"}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-6",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.hasLocalizer"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:42"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"hasnav",children:"hasNav"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"hasNav"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Whether the source is receiving a nav signal.\nOnly for NAV source types.\nNAV HAS NAV."}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-7",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.hasNav"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:64"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"ident",children:"ident"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"ident"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The ICAO ident of the station or waypoint.\nNAV IDENT, or flight plan"}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-8",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.ident"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:59"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"isdmeholdactive",children:"isDmeHoldActive"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"isDmeHoldActive"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Whether DME hold is active for this nav source."}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-9",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.isDmeHoldActive"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:55"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"islocalizer",children:"isLocalizer"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"isLocalizer"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Whether the tuned station is a localizer or not.\nThis can be true even if ",(0,r.jsx)(n.code,{children:"hasLocalizer"})," is false,\nbecause this can be based on the frequency alone.\nOnly for NAV source types.\nNAV LOCALIZER."]}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-10",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.isLocalizer"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:37"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"lateraldeviation",children:"lateralDeviation"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"lateralDeviation"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Normalized and scaled lateral deviation (-1, 1).\nNAV CDI, L:WTAP_LNav_XTK"}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-11",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.lateralDeviation"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:73"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"lateraldeviationscaling",children:"lateralDeviationScaling"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"lateralDeviationScaling"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The current CDI scale, in nautical miles.\nOnly for GPS source types.\nL:WTAP_LNav_CDI_Scale"}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-12",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.lateralDeviationScaling"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:95"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"lateraldeviationscalinglabel",children:"lateralDeviationScalingLabel"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"lateralDeviationScalingLabel"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"A readable string/enum that shows the name of current scaling being applied to lateral deviation.\nOnly for GPS source types.\nL:WTAP_LNav_CDI_Scale_Label"}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-13",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.lateralDeviationScalingLabel"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:100"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"localizercourse",children:"localizerCourse"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"localizerCourse"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The fixed course of a localizer when available (ILS).\nIs null when ",(0,r.jsx)(n.code,{children:"hasLocalizer"})," is false.\nOnly for NAV source types.\nNAV LOCALIZER"]}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-14",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.localizerCourse"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:30"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"navsources",children:"navSources"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"protected"})," ",(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"navSources"}),": ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSources",children:(0,r.jsx)(n.code,{children:"NavSources"})}),"<readonly [",(0,r.jsx)(n.code,{children:'"NAV1"'}),", ",(0,r.jsx)(n.code,{children:'"NAV2"'}),", ",(0,r.jsx)(n.code,{children:'"ADF"'}),", ",(0,r.jsx)(n.code,{children:'"FMS"'}),"]>"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The possible nav sources that could be pointed to."}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-15",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.navSources"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavIndicators/NavIndicators.ts:44"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"setters",children:"setters"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"protected"})," ",(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"setters"}),": ",(0,r.jsx)(n.code,{children:"Map"}),"<keyof ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavBaseFields",children:(0,r.jsx)(n.code,{children:"NavBaseFields"})}),", ",(0,r.jsx)(n.code,{children:"object"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"An automatically generated map of setters to make it easy to set, sub, and unsub,\ngetting around having to call .bind()."}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-16",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.setters"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:117"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"signalstrength",children:"signalStrength"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"signalStrength"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Signal strength received from the reference. A value of zero indicates no signal."}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-17",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.signalStrength"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-19",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:14"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"source",children:"source"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"source"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/NavSourceBase",children:(0,r.jsx)(n.code,{children:"NavSourceBase"})}),"<readonly [",(0,r.jsx)(n.code,{children:'"NAV1"'}),", ",(0,r.jsx)(n.code,{children:'"NAV2"'}),", ",(0,r.jsx)(n.code,{children:'"ADF"'}),", ",(0,r.jsx)(n.code,{children:'"FMS"'}),"]>>"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The nav source that is feeding data into the indicator fields.\nCan only be changed with the ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/Epic2CourseNeedleNavIndicator#setsource",children:"setSource"})," function."]}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-18",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.source"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-20",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavIndicators/NavIndicators.ts:38"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"sourcelabel",children:"sourceLabel"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"sourceLabel"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-19",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.sourceLabel"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-21",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/Epic2NavIndicators.ts:93"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"timetogo",children:"timeToGo"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"timeToGo"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"TTG, estimated time remaining until aircraft reaches next fix. // TODO Implement this"}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-20",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.timeToGo"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-22",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:85"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"tofrom",children:"toFrom"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"toFrom"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"VorToFrom"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Whether course is pointing TO or FROM the station (VOR),\nor if the aircraft heading is within 90 degress of the desired track (GPS).\nNAV TOFROM, // TODO FMS VAR?"}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-21",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.toFrom"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-23",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:90"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"verticaldeviation",children:"verticalDeviation"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"verticalDeviation"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Normalized and scaled vertical deviation (-1, 1).\nNAV GLIDE SLOPE ERROR, L:WTAP_VNav_Vertical_Deviation, L:WTAP_LPV_Vertical_Deviation"}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-22",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.verticalDeviation"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-24",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavBase.ts:77"}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"setsource",children:"setSource()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"setSource"}),"(",(0,r.jsx)(n.code,{children:"newSourceName"}),"): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Changes the source of this indicator.\nAll subjects will be republished with the current info from the new source."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"newSourceName"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:'"ADF"'})," | ",(0,r.jsx)(n.code,{children:'"NAV1"'})," | ",(0,r.jsx)(n.code,{children:'"NAV2"'})," | ",(0,r.jsx)(n.code,{children:'"FMS"'})]}),(0,r.jsx)(n.td,{children:"Name of new source, if any."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-23",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Epic2NavIndicatorBase.setSource"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-25",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Navigation/NavIndicators/NavIndicators.ts:53"})]})}function t(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(a,{...e})}):a(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return c},a:function(){return l}});var d=i(667294);let r={},s=d.createContext(r);function l(e){let n=d.useContext(s);return d.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),d.createElement(s.Provider,{value:n},e.children)}}}]);