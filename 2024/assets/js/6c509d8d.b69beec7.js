"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["924172"],{239605:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>d,default:()=>h,assets:()=>c,toc:()=>l,frontMatter:()=>o});var r=JSON.parse('{"id":"api/g3000gtc/interfaces/GtcWaypointInfoPageInfoProps","title":"Interface: GtcWaypointInfoPageInfoProps","description":"Component props for GtcWaypointInfoPageInfo.","source":"@site/docs/api/g3000gtc/interfaces/GtcWaypointInfoPageInfoProps.md","sourceDirName":"api/g3000gtc/interfaces","slug":"/api/g3000gtc/interfaces/GtcWaypointInfoPageInfoProps","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000gtc/interfaces/GtcWaypointInfoPageInfoProps","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"GtcWaypointInfoOptionsPopupProps","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000gtc/interfaces/GtcWaypointInfoOptionsPopupProps"},"next":{"title":"GtcWaypointInfoPageNoWaypointMessageProps","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000gtc/interfaces/GtcWaypointInfoPageNoWaypointMessageProps"}}'),t=i("785893"),s=i("250065");let o={},d="Interface: GtcWaypointInfoPageInfoProps",c={},l=[{value:"Extends",id:"extends",level:2},{value:"Properties",id:"properties",level:2},{value:"bearing",id:"bearing",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"children?",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"city?",id:"city",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"distance",id:"distance",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"location",id:"location",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"ref?",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"region",id:"region",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"relativeBearing",id:"relativebearing",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"unitsSettingManager",id:"unitssettingmanager",level:3},{value:"Defined in",id:"defined-in-8",level:4}];function a(e){let n={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...(0,s.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"interface-gtcwaypointinfopageinfoprops",children:"Interface: GtcWaypointInfoPageInfoProps"})}),"\n",(0,t.jsx)(n.p,{children:"Component props for GtcWaypointInfoPageInfo."}),"\n",(0,t.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:(0,t.jsx)(n.code,{children:"ComponentProps"})}),"\n"]}),"\n",(0,t.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,t.jsx)(n.h3,{id:"bearing",children:"bearing"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"bearing"}),": ",(0,t.jsx)(n.code,{children:"Subscribable"}),"<",(0,t.jsx)(n.code,{children:"NumberUnitInterface"}),"<",(0,t.jsx)(n.code,{children:'"navangle"'}),", ",(0,t.jsx)(n.code,{children:"NavAngleUnit"}),">>"]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["The true bearing from the airplane's current position to the waypoint, or ",(0,t.jsx)(n.code,{children:"NaN"})," if the bearing cannot be determined."]}),"\n",(0,t.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Pages/WaypointInfoPages/GtcWaypointInfoPageInfo.tsx:27"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"children",children:"children?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"children"}),": ",(0,t.jsx)(n.code,{children:"DisplayChildren"}),"[]"]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The children of the display component."}),"\n",(0,t.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.code,{children:"ComponentProps.children"})}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"sdk/components/FSComponent.ts:122"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"city",children:"city?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"city"}),": ",(0,t.jsx)(n.code,{children:"Subscribable"}),"<",(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The city associated with the waypoint. If not defined, the city field will not be displayed."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Pages/WaypointInfoPages/GtcWaypointInfoPageInfo.tsx:18"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"distance",children:"distance"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"distance"}),": ",(0,t.jsx)(n.code,{children:"Subscribable"}),"<",(0,t.jsx)(n.code,{children:"NumberUnitInterface"}),"<",(0,t.jsx)(n.code,{children:"Distance"}),", ",(0,t.jsx)(n.code,{children:"Unit"}),"<",(0,t.jsx)(n.code,{children:"Distance"}),">>>"]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["The distance from the airplane's current position to the waypoint, or ",(0,t.jsx)(n.code,{children:"NaN"})," if the distance cannot be determined."]}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Pages/WaypointInfoPages/GtcWaypointInfoPageInfo.tsx:36"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"location",children:"location"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"location"}),": ",(0,t.jsx)(n.code,{children:"Subscribable"}),"<",(0,t.jsx)(n.code,{children:"LatLonInterface"}),">"]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The location of the waypoint."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Pages/WaypointInfoPages/GtcWaypointInfoPageInfo.tsx:24"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"ref",children:"ref?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"ref"}),": ",(0,t.jsx)(n.code,{children:"NodeReference"}),"<",(0,t.jsx)(n.code,{children:"any"}),">"]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"A reference to the display component."}),"\n",(0,t.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.code,{children:"ComponentProps.ref"})}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"sdk/components/FSComponent.ts:125"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"region",children:"region"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"region"}),": ",(0,t.jsx)(n.code,{children:"Subscribable"}),"<",(0,t.jsx)(n.code,{children:"undefined"})," | ",(0,t.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The region in which the waypoint is located."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Pages/WaypointInfoPages/GtcWaypointInfoPageInfo.tsx:21"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"relativebearing",children:"relativeBearing"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"relativeBearing"}),": ",(0,t.jsx)(n.code,{children:"Subscribable"}),"<",(0,t.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["The bearing from the airplane's current position to the waypoint, relative to the airplane's current heading, in\ndegrees, or ",(0,t.jsx)(n.code,{children:"NaN"})," if the bearing cannot be determined."]}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Pages/WaypointInfoPages/GtcWaypointInfoPageInfo.tsx:33"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"unitssettingmanager",children:"unitsSettingManager"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"unitsSettingManager"}),": ",(0,t.jsx)(n.code,{children:"UnitsUserSettingManager"}),"<",(0,t.jsx)(n.code,{children:"UnitsUserSettingTypes"}),">"]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"A manager for display units user settings."}),"\n",(0,t.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Pages/WaypointInfoPages/GtcWaypointInfoPageInfo.tsx:39"})]})}function h(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(a,{...e})}):a(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return d},a:function(){return o}});var r=i(667294);let t={},s=r.createContext(t);function o(e){let n=r.useContext(s);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:o(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);