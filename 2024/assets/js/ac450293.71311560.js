"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["861140"],{556118:function(e,n,i){i.r(n),i.d(n,{metadata:()=>s,contentTitle:()=>c,default:()=>h,assets:()=>o,toc:()=>l,frontMatter:()=>t});var s=JSON.parse('{"id":"api/garminsdk/classes/WaypointInfoStore","title":"Class: WaypointInfoStore","description":"A store for commonly used waypoint info.","source":"@site/docs/api/garminsdk/classes/WaypointInfoStore.md","sourceDirName":"api/garminsdk/classes","slug":"/api/garminsdk/classes/WaypointInfoStore","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/WaypointInfoStore","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"WaypointIcon","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/WaypointIcon"},"next":{"title":"WaypointMapHighlightController","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/WaypointMapHighlightController"}}'),r=i("785893"),d=i("250065");let t={},c="Class: WaypointInfoStore",o={},l=[{value:"Constructors",id:"constructors",level:2},{value:"new WaypointInfoStore()",id:"new-waypointinfostore",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"city",id:"city",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"facility",id:"facility",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"name",id:"name",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"region",id:"region",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"waypoint",id:"waypoint",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"Accessors",id:"accessors",level:2},{value:"bearing",id:"bearing",level:3},{value:"Get Signature",id:"get-signature",level:4},{value:"Returns",id:"returns-1",level:5},{value:"Defined in",id:"defined-in-6",level:4},{value:"distance",id:"distance",level:3},{value:"Get Signature",id:"get-signature-1",level:4},{value:"Returns",id:"returns-2",level:5},{value:"Defined in",id:"defined-in-7",level:4},{value:"location",id:"location",level:3},{value:"Get Signature",id:"get-signature-2",level:4},{value:"Returns",id:"returns-3",level:5},{value:"Defined in",id:"defined-in-8",level:4},{value:"radial",id:"radial",level:3},{value:"Get Signature",id:"get-signature-3",level:4},{value:"Returns",id:"returns-4",level:5},{value:"Defined in",id:"defined-in-9",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-10",level:4}];function a(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"class-waypointinfostore",children:"Class: WaypointInfoStore"})}),"\n",(0,r.jsx)(n.p,{children:"A store for commonly used waypoint info."}),"\n",(0,r.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(n.h3,{id:"new-waypointinfostore",children:"new WaypointInfoStore()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"new WaypointInfoStore"}),"(",(0,r.jsx)(n.code,{children:"waypoint"}),"?, ",(0,r.jsx)(n.code,{children:"planePos"}),"?, ",(0,r.jsx)(n.code,{children:"options"}),"?): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/WaypointInfoStore",children:(0,r.jsx)(n.code,{children:"WaypointInfoStore"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Constructor."}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"waypoint"}),"?"]}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"Waypoint"})," | ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"Waypoint"}),">"]}),(0,r.jsxs)(n.td,{children:["A subscribable which provides this store's waypoint, or an initial value to set this store's waypoint. If not defined, this store's waypoint can still be set via its ",(0,r.jsx)(n.code,{children:".waypoint"})," property."]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"planePos"}),"?"]}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"GeoPointInterface"}),">"]}),(0,r.jsx)(n.td,{children:"A subscribable which provides the current airplane position for this store. If not defined, then this store will not provide distance- or bearing-to-waypoint information."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"options"}),"?"]}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/WaypointInfoStoreOptions",children:(0,r.jsx)(n.code,{children:"WaypointInfoStoreOptions"})}),">"]}),(0,r.jsx)(n.td,{children:"Options with which to configure the store."})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/WaypointInfoStore",children:(0,r.jsx)(n.code,{children:"WaypointInfoStore"})})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/navigation/WaypointInfoStore.ts:96"}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"city",children:"city"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"city"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"undefined"})," | ",(0,r.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The city associated with this store's current waypoint, or ",(0,r.jsx)(n.code,{children:"undefined"})," if there is no such value."]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/navigation/WaypointInfoStore.ts:53"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"facility",children:"facility"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"facility"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"Facility"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The facility associated with this store's current waypoint."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/navigation/WaypointInfoStore.ts:31"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"name",children:"name"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"name"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"undefined"})," | ",(0,r.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The name of this store's current waypoint, or ",(0,r.jsx)(n.code,{children:"undefined"})," if there is no such value."]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/navigation/WaypointInfoStore.ts:41"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"region",children:"region"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"region"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"undefined"})," | ",(0,r.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The region of this store's current waypoint, or ",(0,r.jsx)(n.code,{children:"undefined"})," if there is no such value."]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/navigation/WaypointInfoStore.ts:50"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"waypoint",children:"waypoint"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"waypoint"}),": ",(0,r.jsx)(n.code,{children:"Subject"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"Waypoint"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"This store's current waypoint."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/navigation/WaypointInfoStore.ts:27"}),"\n",(0,r.jsx)(n.h2,{id:"accessors",children:"Accessors"}),"\n",(0,r.jsx)(n.h3,{id:"bearing",children:"bearing"}),"\n",(0,r.jsx)(n.h4,{id:"get-signature",children:"Get Signature"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"get"})," ",(0,r.jsx)(n.strong,{children:"bearing"}),"(): ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"NumberUnitInterface"}),"<",(0,r.jsx)(n.code,{children:'"navangle"'}),", ",(0,r.jsx)(n.code,{children:"NavAngleUnit"}),">>"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The true bearing, in degrees, from the airplane to this store's current waypoint."}),"\n",(0,r.jsx)(n.h5,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"NumberUnitInterface"}),"<",(0,r.jsx)(n.code,{children:'"navangle"'}),", ",(0,r.jsx)(n.code,{children:"NavAngleUnit"}),">>"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/navigation/WaypointInfoStore.ts:71"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"distance",children:"distance"}),"\n",(0,r.jsx)(n.h4,{id:"get-signature-1",children:"Get Signature"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"get"})," ",(0,r.jsx)(n.strong,{children:"distance"}),"(): ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"NumberUnitInterface"}),"<",(0,r.jsx)(n.code,{children:"Distance"}),", ",(0,r.jsx)(n.code,{children:"Unit"}),"<",(0,r.jsx)(n.code,{children:"Distance"}),">>>"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The distance from the airplane to this store's current waypoint."}),"\n",(0,r.jsx)(n.h5,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"NumberUnitInterface"}),"<",(0,r.jsx)(n.code,{children:"Distance"}),", ",(0,r.jsx)(n.code,{children:"Unit"}),"<",(0,r.jsx)(n.code,{children:"Distance"}),">>>"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/navigation/WaypointInfoStore.ts:64"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"location",children:"location"}),"\n",(0,r.jsx)(n.h4,{id:"get-signature-2",children:"Get Signature"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"get"})," ",(0,r.jsx)(n.strong,{children:"location"}),"(): ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"GeoPointInterface"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The location of this store's current waypoint."}),"\n",(0,r.jsx)(n.h5,{id:"returns-3",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"GeoPointInterface"}),">"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/navigation/WaypointInfoStore.ts:36"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"radial",children:"radial"}),"\n",(0,r.jsx)(n.h4,{id:"get-signature-3",children:"Get Signature"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"get"})," ",(0,r.jsx)(n.strong,{children:"radial"}),"(): ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"NumberUnitInterface"}),"<",(0,r.jsx)(n.code,{children:'"navangle"'}),", ",(0,r.jsx)(n.code,{children:"NavAngleUnit"}),">>"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The radial relative to true north, in degrees, from this store's current waypoint along which the airplane lies."}),"\n",(0,r.jsx)(n.h5,{id:"returns-4",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"NumberUnitInterface"}),"<",(0,r.jsx)(n.code,{children:'"navangle"'}),", ",(0,r.jsx)(n.code,{children:"NavAngleUnit"}),">>"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/navigation/WaypointInfoStore.ts:78"}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"destroy"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Destroys this store."}),"\n",(0,r.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/garminsdk/navigation/WaypointInfoStore.ts:230"})]})}function h(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(a,{...e})}):a(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return c},a:function(){return t}});var s=i(667294);let r={},d=s.createContext(r);function t(e){let n=s.useContext(d);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:t(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);