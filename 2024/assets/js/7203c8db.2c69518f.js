"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["171550"],{492624:function(e,n,r){r.r(n),r.d(n,{metadata:()=>i,contentTitle:()=>t,default:()=>a,assets:()=>o,toc:()=>c,frontMatter:()=>l});var i=JSON.parse('{"id":"api/garminsdk/classes/MapDataIntegrityRTRController","title":"Class: MapDataIntegrityRTRController","description":"Controls the map\'s projected target, orientation mode, and player airplane icon based on heading and GPS signal validity.","source":"@site/docs/api/garminsdk/classes/MapDataIntegrityRTRController.md","sourceDirName":"api/garminsdk/classes","slug":"/api/garminsdk/classes/MapDataIntegrityRTRController","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/MapDataIntegrityRTRController","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"MapCrosshairModule","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/MapCrosshairModule"},"next":{"title":"MapDeadReckoningLayer","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/MapDeadReckoningLayer"}}'),d=r("785893"),s=r("250065");let l={},t="Class: MapDataIntegrityRTRController",o={},c=[{value:"Extends",id:"extends",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new MapDataIntegrityRTRController()",id:"new-mapdataintegrityrtrcontroller",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"Accessors",id:"accessors",level:2},{value:"isAlive",id:"isalive",level:3},{value:"Get Signature",id:"get-signature",level:4},{value:"Returns",id:"returns-1",level:5},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Inherit Doc",id:"inherit-doc",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"onAfterMapRender()",id:"onaftermaprender",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherit Doc",id:"inherit-doc-1",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"onAfterUpdated()",id:"onafterupdated",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"onBeforeUpdated()",id:"onbeforeupdated",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"onDeadZoneChanged()",id:"ondeadzonechanged",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"onMapDestroyed()",id:"onmapdestroyed",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Inherit Doc",id:"inherit-doc-2",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"onMapProjectionChanged()",id:"onmapprojectionchanged",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"onSleep()",id:"onsleep",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"onWake()",id:"onwake",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-11",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"class-mapdataintegrityrtrcontroller",children:"Class: MapDataIntegrityRTRController"})}),"\n",(0,d.jsx)(n.p,{children:"Controls the map's projected target, orientation mode, and player airplane icon based on heading and GPS signal validity."}),"\n",(0,d.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"MapSystemController"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/MapDataIntegrityRTRControllerModules",children:(0,d.jsx)(n.code,{children:"MapDataIntegrityRTRControllerModules"})}),", ",(0,d.jsx)(n.code,{children:"any"}),", ",(0,d.jsx)(n.code,{children:"any"}),", ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/MapDataIntegrityRTRControllerContext",children:(0,d.jsx)(n.code,{children:"MapDataIntegrityRTRControllerContext"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(n.h3,{id:"new-mapdataintegrityrtrcontroller",children:"new MapDataIntegrityRTRController()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"new MapDataIntegrityRTRController"}),"(",(0,d.jsx)(n.code,{children:"context"}),", ",(0,d.jsx)(n.code,{children:"airplaneIconSrc"}),"?, ",(0,d.jsx)(n.code,{children:"airplaneIconAnchor"}),"?, ",(0,d.jsx)(n.code,{children:"normalIconSrc"}),"?, ",(0,d.jsx)(n.code,{children:"normalIconAnchor"}),"?, ",(0,d.jsx)(n.code,{children:"noHeadingIconSrc"}),"?, ",(0,d.jsx)(n.code,{children:"noHeadingIconAnchor"}),"?): ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/MapDataIntegrityRTRController",children:(0,d.jsx)(n.code,{children:"MapDataIntegrityRTRController"})})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Constructor."}),"\n",(0,d.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"context"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"MapSystemContext"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/MapDataIntegrityRTRControllerModules",children:(0,d.jsx)(n.code,{children:"MapDataIntegrityRTRControllerModules"})}),", ",(0,d.jsx)(n.code,{children:"any"}),", ",(0,d.jsx)(n.code,{children:"any"}),", ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/MapDataIntegrityRTRControllerContext",children:(0,d.jsx)(n.code,{children:"MapDataIntegrityRTRControllerContext"})}),">"]}),(0,d.jsx)(n.td,{children:"This controller's map context."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"airplaneIconSrc"}),"?"]}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"MutableSubscribable"}),"<",(0,d.jsx)(n.code,{children:"string"}),", ",(0,d.jsx)(n.code,{children:"string"}),">"]}),(0,d.jsx)(n.td,{children:"A mutable subscribable which controls the player airplane icon's image source URI. Required for this controller to change the player airplane icon."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"airplaneIconAnchor"}),"?"]}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"MutableSubscribable"}),"<",(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.code,{children:"Omit"}),"<",(0,d.jsx)(n.code,{children:"Float64Array"}),", ",(0,d.jsx)(n.code,{children:'"set"'})," | ",(0,d.jsx)(n.code,{children:'"sort"'})," | ",(0,d.jsx)(n.code,{children:'"copyWithin"'}),">>, ",(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.code,{children:"Omit"}),"<",(0,d.jsx)(n.code,{children:"Float64Array"}),", ",(0,d.jsx)(n.code,{children:'"set"'})," | ",(0,d.jsx)(n.code,{children:'"sort"'})," | ",(0,d.jsx)(n.code,{children:'"copyWithin"'}),">>>"]}),(0,d.jsx)(n.td,{children:"A mutable subscribable which controls the anchor point of the player airplane icon. Required for this controller to change the player airplane icon."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"normalIconSrc"}),"?"]}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"string"}),">"]}),(0,d.jsx)(n.td,{children:"A subscribable which provides the URI of the normal player airplane icon's image source. Required for this controller to change the player airplane icon."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"normalIconAnchor"}),"?"]}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.code,{children:"Omit"}),"<",(0,d.jsx)(n.code,{children:"Float64Array"}),", ",(0,d.jsx)(n.code,{children:'"set"'})," | ",(0,d.jsx)(n.code,{children:'"sort"'})," | ",(0,d.jsx)(n.code,{children:'"copyWithin"'}),">>>"]}),(0,d.jsxs)(n.td,{children:["A subscribable which provides the anchor point of the normal player airplane icon, as ",(0,d.jsx)(n.code,{children:"[x, y]"}),", where each component is relative to the width or height of the icon. Required for this controller to change the player airplane icon."]})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"noHeadingIconSrc"}),"?"]}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"string"}),">"]}),(0,d.jsx)(n.td,{children:"A subscribable which provides the URI of the no-heading player airplane icon's image source. Required for this controller to change the player airplane icon."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"noHeadingIconAnchor"}),"?"]}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.code,{children:"Omit"}),"<",(0,d.jsx)(n.code,{children:"Float64Array"}),", ",(0,d.jsx)(n.code,{children:'"set"'})," | ",(0,d.jsx)(n.code,{children:'"sort"'})," | ",(0,d.jsx)(n.code,{children:'"copyWithin"'}),">>>"]}),(0,d.jsxs)(n.td,{children:["A subscribable which provides the anchor point of the no-heading player airplane icon, as ",(0,d.jsx)(n.code,{children:"[x, y]"}),", where each component is relative to the width or height of the icon. Required for this controller to change the player airplane icon."]})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/MapDataIntegrityRTRController",children:(0,d.jsx)(n.code,{children:"MapDataIntegrityRTRController"})})}),"\n",(0,d.jsx)(n.h4,{id:"overrides",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"MapSystemController<MapDataIntegrityRTRControllerModules, any, any, MapDataIntegrityRTRControllerContext>.constructor"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/components/map/controllers/MapDataIntegrityRTRController.ts:106"}),"\n",(0,d.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(n.h3,{id:"context",children:"context"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"protected"})," ",(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.strong,{children:"context"}),": ",(0,d.jsx)(n.code,{children:"MapSystemContext"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/MapDataIntegrityRTRControllerModules",children:(0,d.jsx)(n.code,{children:"MapDataIntegrityRTRControllerModules"})}),", ",(0,d.jsx)(n.code,{children:"any"}),", ",(0,d.jsx)(n.code,{children:"any"}),", ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/MapDataIntegrityRTRControllerContext",children:(0,d.jsx)(n.code,{children:"MapDataIntegrityRTRControllerContext"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"MapSystemController.context"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:24"}),"\n",(0,d.jsx)(n.h2,{id:"accessors",children:"Accessors"}),"\n",(0,d.jsx)(n.h3,{id:"isalive",children:"isAlive"}),"\n",(0,d.jsx)(n.h4,{id:"get-signature",children:"Get Signature"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"get"})," ",(0,d.jsx)(n.strong,{children:"isAlive"}),"(): ",(0,d.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Whether this controller is alive."}),"\n",(0,d.jsx)(n.h5,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"boolean"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"MapSystemController.isAlive"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:20"}),"\n",(0,d.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"destroy"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"MapSystemController.destroy"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/components/map/controllers/MapDataIntegrityRTRController.ts:223"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onaftermaprender",children:"onAfterMapRender()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onAfterMapRender"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-1",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-2",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"MapSystemController.onAfterMapRender"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/components/map/controllers/MapDataIntegrityRTRController.ts:119"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onafterupdated",children:"onAfterUpdated()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onAfterUpdated"}),"(",(0,d.jsx)(n.code,{children:"time"}),", ",(0,d.jsx)(n.code,{children:"elapsed"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called immediately after this controller's map updates its layers."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"time"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The current time, as a Javascript timestamp."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"elapsed"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The elapsed time, in milliseconds, since the last update."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"MapSystemController.onAfterUpdated"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:78"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onbeforeupdated",children:"onBeforeUpdated()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onBeforeUpdated"}),"(",(0,d.jsx)(n.code,{children:"time"}),", ",(0,d.jsx)(n.code,{children:"elapsed"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called immediately before this controller's map updates its layers."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"time"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The current time, as a Javascript timestamp."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"elapsed"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The elapsed time, in milliseconds, since the last update."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"MapSystemController.onBeforeUpdated"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:68"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"ondeadzonechanged",children:"onDeadZoneChanged()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onDeadZoneChanged"}),"(",(0,d.jsx)(n.code,{children:"deadZone"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when the dead zone of this controller's map changes."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"deadZone"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.code,{children:"Omit"}),"<",(0,d.jsx)(n.code,{children:"Float64Array"}),", ",(0,d.jsx)(n.code,{children:'"set"'})," | ",(0,d.jsx)(n.code,{children:'"sort"'})," | ",(0,d.jsx)(n.code,{children:'"copyWithin"'}),">>"]}),(0,d.jsx)(n.td,{children:"The map's new dead zone."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"MapSystemController.onDeadZoneChanged"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:48"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onmapdestroyed",children:"onMapDestroyed()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onMapDestroyed"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherit-doc-2",children:"Inherit Doc"}),"\n",(0,d.jsx)(n.h4,{id:"overrides-3",children:"Overrides"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"MapSystemController.onMapDestroyed"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/garminsdk/components/map/controllers/MapDataIntegrityRTRController.ts:218"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onmapprojectionchanged",children:"onMapProjectionChanged()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onMapProjectionChanged"}),"(",(0,d.jsx)(n.code,{children:"mapProjection"}),", ",(0,d.jsx)(n.code,{children:"changeFlags"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when the projection of this controller's map changes."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"mapProjection"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"MapProjection"})}),(0,d.jsx)(n.td,{children:"The map projection."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"changeFlags"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"Bit flags describing the type of change."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"MapSystemController.onMapProjectionChanged"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:58"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onsleep",children:"onSleep()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onSleep"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when this controller's map is put to sleep."}),"\n",(0,d.jsx)(n.h4,{id:"returns-9",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-6",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"MapSystemController.onSleep"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:92"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onwake",children:"onWake()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onWake"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"This method is called when this controller's map is awakened."}),"\n",(0,d.jsx)(n.h4,{id:"returns-10",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-7",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"MapSystemController.onWake"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/mapsystem/MapSystemController.ts:85"})]})}function a(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(h,{...e})}):h(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return t},a:function(){return l}});var i=r(667294);let d={},s=i.createContext(d);function l(e){let n=i.useContext(s);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:l(e.components),i.createElement(s.Provider,{value:n},e.children)}}}]);