"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["119796"],{113533:function(e,n,r){r.r(n),r.d(n,{metadata:()=>i,contentTitle:()=>c,default:()=>h,assets:()=>t,toc:()=>l,frontMatter:()=>a});var i=JSON.parse('{"id":"api/g3xtouchcommon/classes/G3XTrafficMapBuilder","title":"Class: G3XTrafficMapBuilder","description":"Builds G3X Touch traffic maps.","source":"@site/docs/api/g3xtouchcommon/classes/G3XTrafficMapBuilder.md","sourceDirName":"api/g3xtouchcommon/classes","slug":"/api/g3xtouchcommon/classes/G3XTrafficMapBuilder","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XTrafficMapBuilder","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"G3XTouchVersion","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XTouchVersion"},"next":{"title":"G3XTrafficMapOperatingModeIndicator","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XTrafficMapOperatingModeIndicator"}}'),s=r("785893"),d=r("250065");let a={},c="Class: G3XTrafficMapBuilder",t={},l=[{value:"Constructors",id:"constructors",level:2},{value:"new G3XTrafficMapBuilder()",id:"new-g3xtrafficmapbuilder",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"build()",id:"build",level:3},{value:"Type Parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"buildInset()",id:"buildinset",level:3},{value:"Type Parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-1",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"class-g3xtrafficmapbuilder",children:"Class: G3XTrafficMapBuilder"})}),"\n",(0,s.jsx)(n.p,{children:"Builds G3X Touch traffic maps."}),"\n",(0,s.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,s.jsx)(n.h3,{id:"new-g3xtrafficmapbuilder",children:"new G3XTrafficMapBuilder()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"new G3XTrafficMapBuilder"}),"(): ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XTrafficMapBuilder",children:(0,s.jsx)(n.code,{children:"G3XTrafficMapBuilder"})})]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XTrafficMapBuilder",children:(0,s.jsx)(n.code,{children:"G3XTrafficMapBuilder"})})}),"\n",(0,s.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(n.h3,{id:"build",children:"build()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"static"})," ",(0,s.jsx)(n.strong,{children:"build"}),"<",(0,s.jsx)(n.code,{children:"MapBuilder"}),">(",(0,s.jsx)(n.code,{children:"mapBuilder"}),", ",(0,s.jsx)(n.code,{children:"options"}),"): ",(0,s.jsx)(n.code,{children:"MapBuilder"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Configures a map builder to generate a G3X Touch traffic map. The map consists of an optional active flight\nplan layer, an optional traffic range ring layer, a traffic intruder layer, and an airplane icon layer. The map is\ncentered on the player airplane and is locked in Heading Up orientation."}),"\n",(0,s.jsxs)(n.p,{children:["The controller ",(0,s.jsx)(n.code,{children:"[GarminMapKeys.TrafficRange]: TrafficMapRangeController"})," is added to the map context and can be\nused to control the range of the traffic map."]}),"\n",(0,s.jsxs)(n.p,{children:["The map builder will ",(0,s.jsx)(n.strong,{children:"not"})," be configured to apply a custom projected size, dead zone, or to automatically update\nthe map."]}),"\n",(0,s.jsx)(n.h4,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsx)(n.tr,{children:(0,s.jsx)(n.th,{children:"Type Parameter"})})}),(0,s.jsx)(n.tbody,{children:(0,s.jsx)(n.tr,{children:(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"MapBuilder"})," ",(0,s.jsx)(n.em,{children:"extends"})," ",(0,s.jsx)(n.code,{children:"MapSystemBuilder"}),"<",(0,s.jsx)(n.code,{children:"any"}),", ",(0,s.jsx)(n.code,{children:"any"}),", ",(0,s.jsx)(n.code,{children:"any"}),", ",(0,s.jsx)(n.code,{children:"any"}),">"]})})})]}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"mapBuilder"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"MapBuilder"})}),(0,s.jsx)(n.td,{children:"The map builder to configure."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"options"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"G3XTrafficMapBaseOptions"})}),(0,s.jsx)(n.td,{children:"Options for configuring the map."})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"MapBuilder"})}),"\n",(0,s.jsx)(n.p,{children:"The builder, after it has been configured."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/Map/Assembled/G3XTrafficMapBuilder.tsx:226"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"buildinset",children:"buildInset()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"static"})," ",(0,s.jsx)(n.strong,{children:"buildInset"}),"<",(0,s.jsx)(n.code,{children:"MapBuilder"}),">(",(0,s.jsx)(n.code,{children:"mapBuilder"}),", ",(0,s.jsx)(n.code,{children:"options"}),"): ",(0,s.jsx)(n.code,{children:"MapBuilder"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Configures a map builder to generate a G3X Touch traffic inset map. The map consists of an optional active flight\nplan layer, an optional traffic range ring layer, a traffic intruder layer, and an airplane icon layer. The map is\ncentered on the player airplane and is locked in Heading Up orientation."}),"\n",(0,s.jsxs)(n.p,{children:["The controller ",(0,s.jsx)(n.code,{children:"[GarminMapKeys.TrafficRange]: TrafficMapRangeController"})," is added to the map context and can be\nused to control the range of the traffic map."]}),"\n",(0,s.jsxs)(n.p,{children:["The map builder will ",(0,s.jsx)(n.strong,{children:"not"})," be configured to apply a custom projected size, dead zone, or to automatically update\nthe map."]}),"\n",(0,s.jsx)(n.h4,{id:"type-parameters-1",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsx)(n.tr,{children:(0,s.jsx)(n.th,{children:"Type Parameter"})})}),(0,s.jsx)(n.tbody,{children:(0,s.jsx)(n.tr,{children:(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"MapBuilder"})," ",(0,s.jsx)(n.em,{children:"extends"})," ",(0,s.jsx)(n.code,{children:"MapSystemBuilder"}),"<",(0,s.jsx)(n.code,{children:"any"}),", ",(0,s.jsx)(n.code,{children:"any"}),", ",(0,s.jsx)(n.code,{children:"any"}),", ",(0,s.jsx)(n.code,{children:"any"}),">"]})})})]}),"\n",(0,s.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"mapBuilder"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"MapBuilder"})}),(0,s.jsx)(n.td,{children:"The map builder to configure."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"options"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/type-aliases/G3XTrafficInsetMapOptions",children:(0,s.jsx)(n.code,{children:"G3XTrafficInsetMapOptions"})})}),(0,s.jsx)(n.td,{children:"Options for configuring the map."})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"MapBuilder"})}),"\n",(0,s.jsx)(n.p,{children:"The builder, after it has been configured."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/Map/Assembled/G3XTrafficMapBuilder.tsx:357"})]})}function h(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(o,{...e})}):o(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return c},a:function(){return a}});var i=r(667294);let s={},d=i.createContext(s);function a(e){let n=i.useContext(d);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),i.createElement(d.Provider,{value:n},e.children)}}}]);