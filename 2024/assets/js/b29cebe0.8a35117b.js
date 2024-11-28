"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["560711"],{495615:function(e,n,i){i.r(n),i.d(n,{metadata:()=>l,contentTitle:()=>t,default:()=>a,assets:()=>c,toc:()=>o,frontMatter:()=>r});var l=JSON.parse('{"id":"api/g3xtouchcommon/interfaces/UiFlightPlanLegDisplayProps","title":"Interface: UiFlightPlanLegDisplayProps","description":"Component props for UiFlightPlanLegDisplay.","source":"@site/docs/api/g3xtouchcommon/interfaces/UiFlightPlanLegDisplayProps.md","sourceDirName":"api/g3xtouchcommon/interfaces","slug":"/api/g3xtouchcommon/interfaces/UiFlightPlanLegDisplayProps","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/UiFlightPlanLegDisplayProps","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"UiDialogView","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/UiDialogView"},"next":{"title":"UiFlightPlanListProps","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/UiFlightPlanListProps"}}'),s=i("785893"),d=i("250065");let r={},t="Interface: UiFlightPlanLegDisplayProps",c={},o=[{value:"Extends",id:"extends",level:2},{value:"Properties",id:"properties",level:2},{value:"approachData?",id:"approachdata",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"centerIconVertically?",id:"centericonvertically",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"children?",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"class?",id:"class",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"facLoader",id:"facloader",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"facWaypointCache",id:"facwaypointcache",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"fixIcao",id:"fixicao",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"leg",id:"leg",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"nullIdent?",id:"nullident",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"ref?",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"useShortSpecialLegIdent?",id:"useshortspeciallegident",level:3},{value:"Defined in",id:"defined-in-10",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...(0,d.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"interface-uiflightplanlegdisplayprops",children:"Interface: UiFlightPlanLegDisplayProps"})}),"\n",(0,s.jsxs)(n.p,{children:["Component props for ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/UiFlightPlanLegDisplay",children:"UiFlightPlanLegDisplay"}),"."]}),"\n",(0,s.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"ComponentProps"})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"approachdata",children:"approachData?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"approachData"}),": ",(0,s.jsx)(n.code,{children:"Readonly"}),"<",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/type-aliases/G3XFmsFplLoadedApproachData",children:(0,s.jsx)(n.code,{children:"G3XFmsFplLoadedApproachData"})}),">"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["Data describing the approach procedure associated with the displayed flight plan leg, or ",(0,s.jsx)(n.code,{children:"undefined"})," if the leg\nis not associated with an approach."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/FlightPlan/UiFlightPlanLegDisplay.tsx:32"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"centericonvertically",children:"centerIconVertically?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"centerIconVertically"}),": ",(0,s.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["Whether to center the waypoint icon vertically within the display instead of aligning it with the top row text.\nDefaults to ",(0,s.jsx)(n.code,{children:"false"}),"."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/FlightPlan/UiFlightPlanLegDisplay.tsx:44"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"children",children:"children?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"children"}),": ",(0,s.jsx)(n.code,{children:"DisplayChildren"}),"[]"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The children of the display component."}),"\n",(0,s.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"ComponentProps.children"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:122"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"class",children:"class?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"class"}),": ",(0,s.jsx)(n.code,{children:"string"})," | ",(0,s.jsx)(n.code,{children:"ToggleableClassNameRecord"})," | ",(0,s.jsx)(n.code,{children:"SubscribableSet"}),"<",(0,s.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The CSS class(es) to apply to the component's root element."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/FlightPlan/UiFlightPlanLegDisplay.tsx:53"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"facloader",children:"facLoader"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"facLoader"}),": ",(0,s.jsx)(n.code,{children:"FacilityLoader"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The facility loader."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/FlightPlan/UiFlightPlanLegDisplay.tsx:35"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"facwaypointcache",children:"facWaypointCache"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"facWaypointCache"}),": ",(0,s.jsx)(n.code,{children:"GarminFacilityWaypointCache"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A cache used to retrieve waypoints."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/FlightPlan/UiFlightPlanLegDisplay.tsx:38"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"fixicao",children:"fixIcao"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"fixIcao"}),": ",(0,s.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The ICAO of the waypoint fix associated with the displayed flight plan leg, or the empty string if no such\nwaypoint fix exists."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/FlightPlan/UiFlightPlanLegDisplay.tsx:26"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"leg",children:"leg"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"leg"}),": ",(0,s.jsx)(n.code,{children:"FlightPlanLeg"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The flight plan leg to display."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/FlightPlan/UiFlightPlanLegDisplay.tsx:20"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"nullident",children:"nullIdent?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"nullIdent"}),": ",(0,s.jsx)(n.code,{children:"string"})," | ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The string to display in place of the ident when the displayed waypoint is ",(0,s.jsx)(n.code,{children:"null"}),". Defaults to the empty string."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/FlightPlan/UiFlightPlanLegDisplay.tsx:47"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"ref",children:"ref?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"ref"}),": ",(0,s.jsx)(n.code,{children:"NodeReference"}),"<",(0,s.jsx)(n.code,{children:"any"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A reference to the display component."}),"\n",(0,s.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"ComponentProps.ref"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:125"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"useshortspeciallegident",children:"useShortSpecialLegIdent?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"useShortSpecialLegIdent"}),": ",(0,s.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["Whether to display shortened versions of special leg identifiers. Defaults to ",(0,s.jsx)(n.code,{children:"false"}),"."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/FlightPlan/UiFlightPlanLegDisplay.tsx:50"})]})}function a(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return t},a:function(){return r}});var l=i(667294);let s={},d=l.createContext(s);function r(e){let n=l.useContext(d);return l.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:r(e.components),l.createElement(d.Provider,{value:n},e.children)}}}]);