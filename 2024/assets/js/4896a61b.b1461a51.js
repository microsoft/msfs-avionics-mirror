"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["255191"],{42572:function(e,n,t){t.r(n),t.d(n,{metadata:()=>i,contentTitle:()=>p,default:()=>c,assets:()=>l,toc:()=>d,frontMatter:()=>r});var i=JSON.parse('{"id":"api/wt21shared/interfaces/PlanMapEvents","title":"Interface: PlanMapEvents","description":"Events on the bus that control the WT21 plan map display position.","source":"@site/docs/api/wt21shared/interfaces/PlanMapEvents.md","sourceDirName":"api/wt21shared/interfaces","slug":"/api/wt21shared/interfaces/PlanMapEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PlanMapEvents","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"PlanMapCenterRequest","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PlanMapCenterRequest"},"next":{"title":"PopupMenuProps","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PopupMenuProps"}}'),a=t("785893"),s=t("250065");let r={},p="Interface: PlanMapEvents",l={},d=[{value:"Properties",id:"properties",level:2},{value:"plan_map_ctr_wpt",id:"plan_map_ctr_wpt",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"plan_map_next",id:"plan_map_next",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"plan_map_prev",id:"plan_map_prev",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"plan_map_to",id:"plan_map_to",level:3},{value:"Defined in",id:"defined-in-3",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",...(0,s.a)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.header,{children:(0,a.jsx)(n.h1,{id:"interface-planmapevents",children:"Interface: PlanMapEvents"})}),"\n",(0,a.jsx)(n.p,{children:"Events on the bus that control the WT21 plan map display position."}),"\n",(0,a.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,a.jsx)(n.h3,{id:"plan_map_ctr_wpt",children:"plan_map_ctr_wpt"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"plan_map_ctr_wpt"}),": ",(0,a.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/interfaces/PlanMapCenterRequest",children:(0,a.jsx)(n.code,{children:"PlanMapCenterRequest"})})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"The plan map was requested to move to a specific geographic location, with the data\nindicating the FMC unit index, 1 or 2."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Map/MapSystemConfig.ts:49"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"plan_map_next",children:"plan_map_next"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"plan_map_next"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"A request was made to move the plan map to the next waypoint, with the data indicating the display unit index."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Map/MapSystemConfig.ts:37"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"plan_map_prev",children:"plan_map_prev"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"plan_map_prev"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"A request was made to move the plan map to the previous waypoint, with the data indicating the display unit index."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Map/MapSystemConfig.ts:40"}),"\n",(0,a.jsx)(n.hr,{}),"\n",(0,a.jsx)(n.h3,{id:"plan_map_to",children:"plan_map_to"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"plan_map_to"}),": ",(0,a.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"A request was made to move the plan map to active waypoint, with the data indicating the display unit index."}),"\n",(0,a.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,a.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Map/MapSystemConfig.ts:43"})]})}function c(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(o,{...e})}):o(e)}},250065:function(e,n,t){t.d(n,{Z:function(){return p},a:function(){return r}});var i=t(667294);let a={},s=i.createContext(a);function r(e){let n=i.useContext(s);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function p(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:r(e.components),i.createElement(s.Provider,{value:n},e.children)}}}]);