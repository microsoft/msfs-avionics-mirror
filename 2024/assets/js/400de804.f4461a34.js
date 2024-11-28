"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["874521"],{506001:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>o,default:()=>h,assets:()=>t,toc:()=>a,frontMatter:()=>d});var r=JSON.parse('{"id":"api/framework/classes/AbstractMapWaypointIcon","title":"Class: abstract AbstractMapWaypointIcon\\\\<T\\\\>","description":"An abstract implementation of MapWaypointIcon which supports an arbitrary anchor point and offset.","source":"@site/docs/api/framework/classes/AbstractMapWaypointIcon.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/AbstractMapWaypointIcon","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractMapWaypointIcon","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"AbstractMapTrafficIntruderIcon","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractMapTrafficIntruderIcon"},"next":{"title":"AbstractNearestSubscription","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractNearestSubscription"}}'),s=i("785893"),c=i("250065");let d={},o="Class: abstract AbstractMapWaypointIcon<T>",t={},a=[{value:"Extended by",id:"extended-by",level:2},{value:"Type Parameters",id:"type-parameters",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new AbstractMapWaypointIcon()",id:"new-abstractmapwaypointicon",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"anchor",id:"anchor",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"offset",id:"offset",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"priority",id:"priority",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"size",id:"size",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"waypoint",id:"waypoint",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"tempVec2",id:"tempvec2",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"Methods",id:"methods",level:2},{value:"draw()",id:"draw",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"drawIconAt()",id:"drawiconat",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-8",level:4}];function l(e){let n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,c.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsxs)(n.h1,{id:"class-abstract-abstractmapwaypointicont",children:["Class: ",(0,s.jsx)(n.code,{children:"abstract"})," AbstractMapWaypointIcon<T>"]})}),"\n",(0,s.jsx)(n.p,{children:"An abstract implementation of MapWaypointIcon which supports an arbitrary anchor point and offset."}),"\n",(0,s.jsx)(n.h2,{id:"extended-by",children:"Extended by"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapWaypointImageIcon",children:(0,s.jsx)(n.code,{children:"MapWaypointImageIcon"})})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapWaypointSpriteIcon",children:(0,s.jsx)(n.code,{children:"MapWaypointSpriteIcon"})})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsx)(n.tr,{children:(0,s.jsx)(n.th,{children:"Type Parameter"})})}),(0,s.jsx)(n.tbody,{children:(0,s.jsx)(n.tr,{children:(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"T"})," ",(0,s.jsx)(n.em,{children:"extends"})," ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapWaypoint",children:(0,s.jsx)(n.code,{children:"MapWaypoint"})})]})})})]}),"\n",(0,s.jsx)(n.h2,{id:"implements",children:"Implements"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapWaypointIcon",children:(0,s.jsx)(n.code,{children:"MapWaypointIcon"})}),"<",(0,s.jsx)(n.code,{children:"T"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,s.jsx)(n.h3,{id:"new-abstractmapwaypointicon",children:"new AbstractMapWaypointIcon()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"new AbstractMapWaypointIcon"}),"<",(0,s.jsx)(n.code,{children:"T"}),">(",(0,s.jsx)(n.code,{children:"waypoint"}),", ",(0,s.jsx)(n.code,{children:"priority"}),", ",(0,s.jsx)(n.code,{children:"size"}),", ",(0,s.jsx)(n.code,{children:"options"}),"?): ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractMapWaypointIcon",children:(0,s.jsx)(n.code,{children:"AbstractMapWaypointIcon"})}),"<",(0,s.jsx)(n.code,{children:"T"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Constructor."}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"waypoint"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"T"})}),(0,s.jsx)(n.td,{children:"The waypoint associated with this icon."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"priority"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"number"})," | ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscribable",children:(0,s.jsx)(n.code,{children:"Subscribable"})}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),(0,s.jsx)(n.td,{children:"The render priority of this icon, or a subscribable which provides it. Icons with higher priorities should be rendered above those with lower priorities."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"size"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"Readonly"}),"<",(0,s.jsx)(n.code,{children:"Omit"}),"<",(0,s.jsx)(n.code,{children:"Float64Array"}),", ",(0,s.jsx)(n.code,{children:'"set"'})," | ",(0,s.jsx)(n.code,{children:'"sort"'})," | ",(0,s.jsx)(n.code,{children:'"copyWithin"'}),">> | ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscribable",children:(0,s.jsx)(n.code,{children:"Subscribable"})}),"<",(0,s.jsx)(n.code,{children:"Readonly"}),"<",(0,s.jsx)(n.code,{children:"Omit"}),"<",(0,s.jsx)(n.code,{children:"Float64Array"}),", ",(0,s.jsx)(n.code,{children:'"set"'})," | ",(0,s.jsx)(n.code,{children:'"sort"'})," | ",(0,s.jsx)(n.code,{children:'"copyWithin"'}),">>>"]}),(0,s.jsxs)(n.td,{children:["The size of this icon, as ",(0,s.jsx)(n.code,{children:"[width, height]"})," in pixels, or a subscribable which provides it."]})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"options"}),"?"]}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/AbstractMapWaypointIconOptions",children:(0,s.jsx)(n.code,{children:"AbstractMapWaypointIconOptions"})})}),(0,s.jsx)(n.td,{children:"Options with which to initialize this icon."})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/AbstractMapWaypointIcon",children:(0,s.jsx)(n.code,{children:"AbstractMapWaypointIcon"})}),"<",(0,s.jsx)(n.code,{children:"T"}),">"]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/map/MapWaypointIcon.ts:99"}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"anchor",children:"anchor"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"anchor"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscribable",children:(0,s.jsx)(n.code,{children:"Subscribable"})}),"<",(0,s.jsx)(n.code,{children:"Readonly"}),"<",(0,s.jsx)(n.code,{children:"Omit"}),"<",(0,s.jsx)(n.code,{children:"Float64Array"}),", ",(0,s.jsx)(n.code,{children:'"set"'})," | ",(0,s.jsx)(n.code,{children:'"sort"'})," | ",(0,s.jsx)(n.code,{children:'"copyWithin"'}),">>>"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The anchor point of this icon, expressed relative to its width and height. [0, 0] is the top-left corner, and\n[1, 1] is the bottom-right corner."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/map/MapWaypointIcon.ts:86"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"offset",children:"offset"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"offset"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscribable",children:(0,s.jsx)(n.code,{children:"Subscribable"})}),"<",(0,s.jsx)(n.code,{children:"Readonly"}),"<",(0,s.jsx)(n.code,{children:"Omit"}),"<",(0,s.jsx)(n.code,{children:"Float64Array"}),", ",(0,s.jsx)(n.code,{children:'"set"'})," | ",(0,s.jsx)(n.code,{children:'"sort"'})," | ",(0,s.jsx)(n.code,{children:'"copyWithin"'}),">>>"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The offset of this icon from the projected position of its associated waypoint, as ",(0,s.jsx)(n.code,{children:"[x, y]"})," in pixels."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/map/MapWaypointIcon.ts:89"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"priority",children:"priority"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"priority"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscribable",children:(0,s.jsx)(n.code,{children:"Subscribable"})}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The render priority of this icon. Icons with higher priorities will be rendered on top of icons with lower\npriorities."}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapWaypointIcon",children:(0,s.jsx)(n.code,{children:"MapWaypointIcon"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapWaypointIcon#priority",children:(0,s.jsx)(n.code,{children:"priority"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/map/MapWaypointIcon.ts:77"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"size",children:"size"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"size"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscribable",children:(0,s.jsx)(n.code,{children:"Subscribable"})}),"<",(0,s.jsx)(n.code,{children:"Readonly"}),"<",(0,s.jsx)(n.code,{children:"Omit"}),"<",(0,s.jsx)(n.code,{children:"Float64Array"}),", ",(0,s.jsx)(n.code,{children:'"set"'})," | ",(0,s.jsx)(n.code,{children:'"sort"'})," | ",(0,s.jsx)(n.code,{children:'"copyWithin"'}),">>>"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The size of this icon, as ",(0,s.jsx)(n.code,{children:"[width, height]"})," in pixels."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/map/MapWaypointIcon.ts:80"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"waypoint",children:"waypoint"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"waypoint"}),": ",(0,s.jsx)(n.code,{children:"T"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The waypoint associated with this icon."}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-1",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapWaypointIcon",children:(0,s.jsx)(n.code,{children:"MapWaypointIcon"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapWaypointIcon#waypoint",children:(0,s.jsx)(n.code,{children:"waypoint"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/map/MapWaypointIcon.ts:100"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"tempvec2",children:"tempVec2"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"protected"})," ",(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.code,{children:"static"})," ",(0,s.jsx)(n.strong,{children:"tempVec2"}),": ",(0,s.jsx)(n.code,{children:"Float64Array"})]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/map/MapWaypointIcon.ts:74"}),"\n",(0,s.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(n.h3,{id:"draw",children:"draw()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"draw"}),"(",(0,s.jsx)(n.code,{children:"context"}),", ",(0,s.jsx)(n.code,{children:"mapProjection"}),"): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Renders this icon to a canvas."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"context"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"CanvasRenderingContext2D"})}),(0,s.jsx)(n.td,{children:"The canvas 2D rendering context to which to render."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"mapProjection"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapProjection",children:(0,s.jsx)(n.code,{children:"MapProjection"})})}),(0,s.jsx)(n.td,{children:"The projection to use for rendering."})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"implementation-of-2",children:"Implementation of"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapWaypointIcon",children:(0,s.jsx)(n.code,{children:"MapWaypointIcon"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/MapWaypointIcon#draw",children:(0,s.jsx)(n.code,{children:"draw"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/map/MapWaypointIcon.ts:113"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"drawiconat",children:"drawIconAt()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"abstract"})," ",(0,s.jsx)(n.code,{children:"protected"})," ",(0,s.jsx)(n.strong,{children:"drawIconAt"}),"(",(0,s.jsx)(n.code,{children:"context"}),", ",(0,s.jsx)(n.code,{children:"mapProjection"}),", ",(0,s.jsx)(n.code,{children:"left"}),", ",(0,s.jsx)(n.code,{children:"top"}),"): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Draws the icon at the specified position."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"context"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"CanvasRenderingContext2D"})}),(0,s.jsx)(n.td,{children:"The canvas rendering context to use."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"mapProjection"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/MapProjection",children:(0,s.jsx)(n.code,{children:"MapProjection"})})}),(0,s.jsx)(n.td,{children:"The map projection to use."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"left"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:"The x-coordinate of the left edge of the icon."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"top"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:"The y-coordinate of the top edge of the icon."})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/map/MapWaypointIcon.ts:131"})]})}function h(e={}){let{wrapper:n}={...(0,c.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return o},a:function(){return d}});var r=i(667294);let s={},c=r.createContext(s);function d(e){let n=r.useContext(c);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:d(e.components),r.createElement(c.Provider,{value:n},e.children)}}}]);