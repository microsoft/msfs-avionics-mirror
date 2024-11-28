"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["857885"],{424745:function(e,n,r){r.r(n),r.d(n,{metadata:()=>s,contentTitle:()=>t,default:()=>h,assets:()=>l,toc:()=>c,frontMatter:()=>a});var s=JSON.parse('{"id":"api/g3xtouchcommon/classes/G3XNavMapBuilder","title":"Class: G3XNavMapBuilder","description":"Builds G3X Touch navigation maps.","source":"@site/docs/api/g3xtouchcommon/classes/G3XNavMapBuilder.md","sourceDirName":"api/g3xtouchcommon/classes","slug":"/api/g3xtouchcommon/classes/G3XNavMapBuilder","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XNavMapBuilder","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"G3XNavDataFieldXtkRenderer","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XNavDataFieldXtkRenderer"},"next":{"title":"G3XNavSimVarPublisher","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XNavSimVarPublisher"}}'),i=r("785893"),d=r("250065");let a={},t="Class: G3XNavMapBuilder",l={},c=[{value:"Constructors",id:"constructors",level:2},{value:"new G3XNavMapBuilder()",id:"new-g3xnavmapbuilder",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"build()",id:"build",level:3},{value:"Type Parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"class-g3xnavmapbuilder",children:"Class: G3XNavMapBuilder"})}),"\n",(0,i.jsx)(n.p,{children:"Builds G3X Touch navigation maps."}),"\n",(0,i.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(n.h3,{id:"new-g3xnavmapbuilder",children:"new G3XNavMapBuilder()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"new G3XNavMapBuilder"}),"(): ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XNavMapBuilder",children:(0,i.jsx)(n.code,{children:"G3XNavMapBuilder"})})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/G3XNavMapBuilder",children:(0,i.jsx)(n.code,{children:"G3XNavMapBuilder"})})}),"\n",(0,i.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(n.h3,{id:"build",children:"build()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"build"}),"<",(0,i.jsx)(n.code,{children:"MapBuilder"}),">(",(0,i.jsx)(n.code,{children:"mapBuilder"}),", ",(0,i.jsx)(n.code,{children:"options"}),"): ",(0,i.jsx)(n.code,{children:"MapBuilder"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Configures a map builder to generate a G3X Touch navigation map."}),"\n",(0,i.jsxs)(n.p,{children:["The controller ",(0,i.jsx)(n.code,{children:"[GarminMapKeys.Range]: MapRangeController"})," is added to the map context and can be used to control\nthe range of the map."]}),"\n",(0,i.jsxs)(n.p,{children:["If flight plan focus is supported, the module ",(0,i.jsx)(n.code,{children:"[GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule"})," is added\nto the map model and can be used to control the focus."]}),"\n",(0,i.jsxs)(n.p,{children:["If drag-to-pan is supported, then the controller ",(0,i.jsx)(n.code,{children:"[G3XMapKeys.DragPan]: MapDragPanController"})," is added to the\nmap context and can be used to control drag-to-pan functionality."]}),"\n",(0,i.jsxs)(n.p,{children:["The map builder will ",(0,i.jsx)(n.strong,{children:"not"})," be configured to apply a custom projected size, dead zone, or to automatically update\nthe map."]}),"\n",(0,i.jsx)(n.h4,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsx)(n.tr,{children:(0,i.jsx)(n.th,{children:"Type Parameter"})})}),(0,i.jsx)(n.tbody,{children:(0,i.jsx)(n.tr,{children:(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"MapBuilder"})," ",(0,i.jsx)(n.em,{children:"extends"})," ",(0,i.jsx)(n.code,{children:"MapSystemBuilder"}),"<",(0,i.jsx)(n.code,{children:"any"}),", ",(0,i.jsx)(n.code,{children:"any"}),", ",(0,i.jsx)(n.code,{children:"any"}),", ",(0,i.jsx)(n.code,{children:"any"}),">"]})})})]}),"\n",(0,i.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"mapBuilder"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"MapBuilder"})}),(0,i.jsx)(n.td,{children:"The map builder to configure."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"options"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/type-aliases/G3XNavMapOptions",children:(0,i.jsx)(n.code,{children:"G3XNavMapOptions"})})}),(0,i.jsx)(n.td,{children:"Options for configuring the map."})]})]})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"MapBuilder"})}),"\n",(0,i.jsx)(n.p,{children:"The builder, after it has been configured."}),"\n",(0,i.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/Map/Assembled/G3XNavMapBuilder.tsx:297"})]})}function h(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(o,{...e})}):o(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return t},a:function(){return a}});var s=r(667294);let i={},d=s.createContext(i);function a(e){let n=s.useContext(d);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:a(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);