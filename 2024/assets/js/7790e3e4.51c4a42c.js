"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["138618"],{466001:function(e,n,r){r.r(n),r.d(n,{metadata:()=>d,contentTitle:()=>t,default:()=>a,assets:()=>o,toc:()=>c,frontMatter:()=>l});var d=JSON.parse('{"id":"api/epic2shared/classes/MapFormatController","title":"Class: abstract MapFormatController\\\\<L\\\\>","description":"A map system controller that controls the display settings of the various format","source":"@site/docs/api/epic2shared/classes/MapFormatController.md","sourceDirName":"api/epic2shared/classes","slug":"/api/epic2shared/classes/MapFormatController","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/MapFormatController","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"MapFacilitySelectModule","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/MapFacilitySelectModule"},"next":{"title":"MapRangeController","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/MapRangeController"}}'),i=r("785893"),s=r("250065");let l={},t="Class: abstract MapFormatController<L>",o={},c=[{value:"Extends",id:"extends",level:2},{value:"Extended by",id:"extended-by",level:2},{value:"Type Parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new MapFormatController()",id:"new-mapformatcontroller",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"bingLayer?",id:"binglayer",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"currentMapFormatConfig",id:"currentmapformatconfig",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"isOnGround",id:"isonground",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"sub",id:"sub",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"terrainWeatherStateModule",id:"terrainweatherstatemodule",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"terrWxState",id:"terrwxstate",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"tfcEnabled",id:"tfcenabled",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"weatherModule",id:"weathermodule",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"WX_NEXRAD_COLORS",id:"wx_nexrad_colors",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"WX_RADAR_COLORS",id:"wx_radar_colors",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"Accessors",id:"accessors",level:2},{value:"isAlive",id:"isalive",level:3},{value:"Get Signature",id:"get-signature",level:4},{value:"Returns",id:"returns-1",level:5},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"getOffset()",id:"getoffset",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"getRangeEndpoints()",id:"getrangeendpoints",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"onAfterMapRender()",id:"onaftermaprender",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Inherit Doc",id:"inherit-doc",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"onAfterUpdated()",id:"onafterupdated",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"onBeforeUpdated()",id:"onbeforeupdated",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"onDeadZoneChanged()",id:"ondeadzonechanged",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"onMapDestroyed()",id:"onmapdestroyed",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"onMapProjectionChanged()",id:"onmapprojectionchanged",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-10",level:4},{value:"Inherit Doc",id:"inherit-doc-1",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"onSleep()",id:"onsleep",level:3},{value:"Returns",id:"returns-11",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"onWake()",id:"onwake",level:3},{value:"Returns",id:"returns-12",level:4},{value:"Inherit Doc",id:"inherit-doc-2",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-23",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsxs)(n.h1,{id:"class-abstract-mapformatcontrollerl",children:["Class: ",(0,i.jsx)(n.code,{children:"abstract"})," MapFormatController<L>"]})}),"\n",(0,i.jsx)(n.p,{children:"A map system controller that controls the display settings of the various format\nand terrain/wxr combinations."}),"\n",(0,i.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"MapSystemController"}),"<",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/MapFormatControllerModules",children:(0,i.jsx)(n.code,{children:"MapFormatControllerModules"})}),", ",(0,i.jsx)(n.code,{children:"L"}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"extended-by",children:"Extended by"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/HsiFormatController",children:(0,i.jsx)(n.code,{children:"HsiFormatController"})})}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Type Parameter"}),(0,i.jsx)(n.th,{children:"Default type"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"L"})," ",(0,i.jsx)(n.em,{children:"extends"})," ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/MapFormatControllerLayers",children:(0,i.jsx)(n.code,{children:"MapFormatControllerLayers"})})]}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/MapFormatControllerLayers",children:(0,i.jsx)(n.code,{children:"MapFormatControllerLayers"})})})]})})]}),"\n",(0,i.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(n.h3,{id:"new-mapformatcontroller",children:"new MapFormatController()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"new MapFormatController"}),"<",(0,i.jsx)(n.code,{children:"L"}),">(",(0,i.jsx)(n.code,{children:"context"}),", ",(0,i.jsx)(n.code,{children:"currentMapFormatConfig"}),", ",(0,i.jsx)(n.code,{children:"terrWxState"}),", ",(0,i.jsx)(n.code,{children:"tfcEnabled"}),"): ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/MapFormatController",children:(0,i.jsx)(n.code,{children:"MapFormatController"})}),"<",(0,i.jsx)(n.code,{children:"L"}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Creates an instance of the MapFormatController."}),"\n",(0,i.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"context"})}),(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"MapSystemContext"}),"<",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/MapFormatControllerModules",children:(0,i.jsx)(n.code,{children:"MapFormatControllerModules"})}),">"]}),(0,i.jsx)(n.td,{children:"The map system context to use with this controller."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"currentMapFormatConfig"})}),(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"Subscribable"}),"<",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/MapFormatConfig",children:(0,i.jsx)(n.code,{children:"MapFormatConfig"})}),">"]}),(0,i.jsx)(n.td,{children:"A subscribable for the current map format config."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"terrWxState"})}),(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"Subscribable"}),"<",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/type-aliases/TerrWxState",children:(0,i.jsx)(n.code,{children:"TerrWxState"})}),">"]}),(0,i.jsx)(n.td,{children:"A subscribable for the current terr wx state."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"tfcEnabled"})}),(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"Subscribable"}),"<",(0,i.jsx)(n.code,{children:"boolean"}),">"]}),(0,i.jsx)(n.td,{children:"A subscribable for whether tfc is enabled."})]})]})]}),"\n",(0,i.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/MapFormatController",children:(0,i.jsx)(n.code,{children:"MapFormatController"})}),"<",(0,i.jsx)(n.code,{children:"L"}),">"]}),"\n",(0,i.jsx)(n.h4,{id:"overrides",children:"Overrides"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"MapSystemController<MapFormatControllerModules, L>.constructor"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:117"}),"\n",(0,i.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,i.jsx)(n.h3,{id:"binglayer",children:"bingLayer?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"bingLayer"}),": ",(0,i.jsx)(n.code,{children:"L"}),"[",(0,i.jsx)(n.code,{children:'"bing"'}),"]"]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:77"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"context",children:"context"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.strong,{children:"context"}),": ",(0,i.jsx)(n.code,{children:"MapSystemContext"}),"<",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/MapFormatControllerModules",children:(0,i.jsx)(n.code,{children:"MapFormatControllerModules"})}),", ",(0,i.jsx)(n.code,{children:"L"}),", ",(0,i.jsx)(n.code,{children:"any"}),", ",(0,i.jsx)(n.code,{children:"any"}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"MapSystemController.context"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"sdk/components/mapsystem/MapSystemController.ts:24"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"currentmapformatconfig",children:"currentMapFormatConfig"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.strong,{children:"currentMapFormatConfig"}),": ",(0,i.jsx)(n.code,{children:"Subscribable"}),"<",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/MapFormatConfig",children:(0,i.jsx)(n.code,{children:"MapFormatConfig"})}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"A subscribable for the current map format config."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:119"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"isonground",children:"isOnGround"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.strong,{children:"isOnGround"}),": ",(0,i.jsx)(n.code,{children:"ConsumerSubject"}),"<",(0,i.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:86"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"sub",children:"sub"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.strong,{children:"sub"}),": ",(0,i.jsx)(n.code,{children:"EventSubscriber"}),"<",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/AirGroundDataProviderEvents",children:(0,i.jsx)(n.code,{children:"AirGroundDataProviderEvents"})}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:85"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"terrainweatherstatemodule",children:"terrainWeatherStateModule"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.strong,{children:"terrainWeatherStateModule"}),": ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/MapTerrainWeatherStateModule",children:(0,i.jsx)(n.code,{children:"MapTerrainWeatherStateModule"})})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:68"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"terrwxstate",children:"terrWxState"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.strong,{children:"terrWxState"}),": ",(0,i.jsx)(n.code,{children:"Subscribable"}),"<",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/type-aliases/TerrWxState",children:(0,i.jsx)(n.code,{children:"TerrWxState"})}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"A subscribable for the current terr wx state."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:120"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"tfcenabled",children:"tfcEnabled"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.strong,{children:"tfcEnabled"}),": ",(0,i.jsx)(n.code,{children:"Subscribable"}),"<",(0,i.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"A subscribable for whether tfc is enabled."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:121"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"weathermodule",children:"weatherModule"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.strong,{children:"weatherModule"}),": ",(0,i.jsx)(n.code,{children:"MapWxrModule"})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:69"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"wx_nexrad_colors",children:"WX_NEXRAD_COLORS"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"WX_NEXRAD_COLORS"}),": readonly readonly [",(0,i.jsx)(n.code,{children:"number"}),", ",(0,i.jsx)(n.code,{children:"number"}),"][]"]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:99"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"wx_radar_colors",children:"WX_RADAR_COLORS"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"readonly"})," ",(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"WX_RADAR_COLORS"}),": readonly readonly [",(0,i.jsx)(n.code,{children:"number"}),", ",(0,i.jsx)(n.code,{children:"number"}),"][]"]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:91"}),"\n",(0,i.jsx)(n.h2,{id:"accessors",children:"Accessors"}),"\n",(0,i.jsx)(n.h3,{id:"isalive",children:"isAlive"}),"\n",(0,i.jsx)(n.h4,{id:"get-signature",children:"Get Signature"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"get"})," ",(0,i.jsx)(n.strong,{children:"isAlive"}),"(): ",(0,i.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Whether this controller is alive."}),"\n",(0,i.jsx)(n.h5,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"boolean"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"MapSystemController.isAlive"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-12",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"sdk/components/mapsystem/MapSystemController.ts:20"}),"\n",(0,i.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"destroy"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Destroys this controller."}),"\n",(0,i.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"MapSystemController.destroy"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-13",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"sdk/components/mapsystem/MapSystemController.ts:106"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"getoffset",children:"getOffset()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.strong,{children:"getOffset"}),"(",(0,i.jsx)(n.code,{children:"formatConfig"}),"): ",(0,i.jsx)(n.code,{children:"Float64Array"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Sets the map target offset for the specified format."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"formatConfig"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/MapFormatConfig",children:(0,i.jsx)(n.code,{children:"MapFormatConfig"})})}),(0,i.jsx)(n.td,{children:"The format config to use."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"Float64Array"})}),"\n",(0,i.jsx)(n.p,{children:"The target projected offset."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-14",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:274"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"getrangeendpoints",children:"getRangeEndpoints()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"protected"})," ",(0,i.jsx)(n.strong,{children:"getRangeEndpoints"}),"(",(0,i.jsx)(n.code,{children:"formatConfig"}),"): ",(0,i.jsx)(n.code,{children:"Float64Array"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Calculates the range endpoints for a given format config."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"formatConfig"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/MapFormatConfig",children:(0,i.jsx)(n.code,{children:"MapFormatConfig"})})}),(0,i.jsx)(n.td,{children:"The format config to use."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"Float64Array"})}),"\n",(0,i.jsx)(n.p,{children:"The calculated range endpoints."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-15",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:283"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onaftermaprender",children:"onAfterMapRender()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onAfterMapRender"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherit-doc",children:"Inherit Doc"}),"\n",(0,i.jsx)(n.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"MapSystemController.onAfterMapRender"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-16",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:144"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onafterupdated",children:"onAfterUpdated()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onAfterUpdated"}),"(",(0,i.jsx)(n.code,{children:"time"}),", ",(0,i.jsx)(n.code,{children:"elapsed"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"This method is called immediately after this controller's map updates its layers."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"time"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"number"})}),(0,i.jsx)(n.td,{children:"The current time, as a Javascript timestamp."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"elapsed"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"number"})}),(0,i.jsx)(n.td,{children:"The elapsed time, in milliseconds, since the last update."})]})]})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"MapSystemController.onAfterUpdated"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-17",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"sdk/components/mapsystem/MapSystemController.ts:78"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onbeforeupdated",children:"onBeforeUpdated()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onBeforeUpdated"}),"(",(0,i.jsx)(n.code,{children:"time"}),", ",(0,i.jsx)(n.code,{children:"elapsed"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"This method is called immediately before this controller's map updates its layers."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"time"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"number"})}),(0,i.jsx)(n.td,{children:"The current time, as a Javascript timestamp."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"elapsed"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"number"})}),(0,i.jsx)(n.td,{children:"The elapsed time, in milliseconds, since the last update."})]})]})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"MapSystemController.onBeforeUpdated"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-18",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"sdk/components/mapsystem/MapSystemController.ts:68"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"ondeadzonechanged",children:"onDeadZoneChanged()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onDeadZoneChanged"}),"(",(0,i.jsx)(n.code,{children:"deadZone"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"This method is called when the dead zone of this controller's map changes."}),"\n",(0,i.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"deadZone"})}),(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"Readonly"}),"<",(0,i.jsx)(n.code,{children:"Omit"}),"<",(0,i.jsx)(n.code,{children:"Float64Array"}),", ",(0,i.jsx)(n.code,{children:'"set"'})," | ",(0,i.jsx)(n.code,{children:'"sort"'})," | ",(0,i.jsx)(n.code,{children:'"copyWithin"'}),">>"]}),(0,i.jsx)(n.td,{children:"The map's new dead zone."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"MapSystemController.onDeadZoneChanged"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-19",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"sdk/components/mapsystem/MapSystemController.ts:48"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onmapdestroyed",children:"onMapDestroyed()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onMapDestroyed"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"This method is called when this controller's map is destroyed."}),"\n",(0,i.jsx)(n.h4,{id:"returns-9",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-6",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"MapSystemController.onMapDestroyed"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-20",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"sdk/components/mapsystem/MapSystemController.ts:99"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onmapprojectionchanged",children:"onMapProjectionChanged()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onMapProjectionChanged"}),"(",(0,i.jsx)(n.code,{children:"_mapProjection"}),", ",(0,i.jsx)(n.code,{children:"changeFlags"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"parameters-6",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"_mapProjection"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"MapProjection"})})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"changeFlags"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"number"})})]})]})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-10",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherit-doc-1",children:"Inherit Doc"}),"\n",(0,i.jsx)(n.h4,{id:"overrides-2",children:"Overrides"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"MapSystemController.onMapProjectionChanged"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-21",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:136"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onsleep",children:"onSleep()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onSleep"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"This method is called when this controller's map is put to sleep."}),"\n",(0,i.jsx)(n.h4,{id:"returns-11",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-7",children:"Inherited from"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"MapSystemController.onSleep"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-22",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"sdk/components/mapsystem/MapSystemController.ts:92"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"onwake",children:"onWake()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"onWake"}),"(): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"returns-12",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"inherit-doc-2",children:"Inherit Doc"}),"\n",(0,i.jsx)(n.h4,{id:"overrides-3",children:"Overrides"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"MapSystemController.onWake"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-23",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Map/Controllers/MapFormatController.ts:130"})]})}function a(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return t},a:function(){return l}});var d=r(667294);let i={},s=d.createContext(i);function l(e){let n=d.useContext(s);return d.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:l(e.components),d.createElement(s.Provider,{value:n},e.children)}}}]);