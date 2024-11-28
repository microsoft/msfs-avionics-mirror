"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["252228"],{858885:function(e,i,n){n.r(i),n.d(i,{metadata:()=>r,contentTitle:()=>l,default:()=>h,assets:()=>c,toc:()=>o,frontMatter:()=>t});var r=JSON.parse('{"id":"api/garminsdk/classes/AirportWaypoint","title":"Class: AirportWaypoint","description":"A waypoint associated with an airport.","source":"@site/docs/api/garminsdk/classes/AirportWaypoint.md","sourceDirName":"api/garminsdk/classes","slug":"/api/garminsdk/classes/AirportWaypoint","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/AirportWaypoint","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"AhrsSystemSelector","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/AhrsSystemSelector"},"next":{"title":"AirspeedIndicator","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/AirspeedIndicator"}}'),s=n("785893"),d=n("250065");let t={},l="Class: AirportWaypoint",c={},o=[{value:"Extends",id:"extends",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new AirportWaypoint()",id:"new-airportwaypoint",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"isFacilityWaypoint",id:"isfacilitywaypoint",level:3},{value:"Inherit Doc",id:"inherit-doc",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"longestRunway",id:"longestrunway",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"size",id:"size",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"Accessors",id:"accessors",level:2},{value:"facility",id:"facility",level:3},{value:"Get Signature",id:"get-signature",level:4},{value:"Returns",id:"returns-1",level:5},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"location",id:"location",level:3},{value:"Get Signature",id:"get-signature-1",level:4},{value:"Inherit Doc",id:"inherit-doc-1",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"type",id:"type",level:3},{value:"Get Signature",id:"get-signature-2",level:4},{value:"Inherit Doc",id:"inherit-doc-2",level:5},{value:"Returns",id:"returns-3",level:5},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"uid",id:"uid",level:3},{value:"Get Signature",id:"get-signature-3",level:4},{value:"Inherit Doc",id:"inherit-doc-3",level:5},{value:"Returns",id:"returns-4",level:5},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"Methods",id:"methods",level:2},{value:"equals()",id:"equals",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-8",level:4}];function a(e){let i={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(i.header,{children:(0,s.jsx)(i.h1,{id:"class-airportwaypoint",children:"Class: AirportWaypoint"})}),"\n",(0,s.jsx)(i.p,{children:"A waypoint associated with an airport."}),"\n",(0,s.jsx)(i.h2,{id:"extends",children:"Extends"}),"\n",(0,s.jsxs)(i.ul,{children:["\n",(0,s.jsxs)(i.li,{children:[(0,s.jsx)(i.code,{children:"BasicFacilityWaypoint"}),"<",(0,s.jsx)(i.code,{children:"AirportFacility"}),">"]}),"\n"]}),"\n",(0,s.jsx)(i.h2,{id:"constructors",children:"Constructors"}),"\n",(0,s.jsx)(i.h3,{id:"new-airportwaypoint",children:"new AirportWaypoint()"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"new AirportWaypoint"}),"(",(0,s.jsx)(i.code,{children:"airport"}),", ",(0,s.jsx)(i.code,{children:"bus"}),"): ",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/AirportWaypoint",children:(0,s.jsx)(i.code,{children:"AirportWaypoint"})})]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"Creates a new instance of AirportWaypoint."}),"\n",(0,s.jsx)(i.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(i.table,{children:[(0,s.jsx)(i.thead,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.th,{children:"Parameter"}),(0,s.jsx)(i.th,{children:"Type"}),(0,s.jsx)(i.th,{children:"Description"})]})}),(0,s.jsxs)(i.tbody,{children:[(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"airport"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"AirportFacility"})}),(0,s.jsx)(i.td,{children:"The airport associated with this waypoint."})]}),(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"bus"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"EventBus"})}),(0,s.jsx)(i.td,{children:"The event bus."})]})]})]}),"\n",(0,s.jsx)(i.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/AirportWaypoint",children:(0,s.jsx)(i.code,{children:"AirportWaypoint"})})}),"\n",(0,s.jsx)(i.h4,{id:"overrides",children:"Overrides"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"BasicFacilityWaypoint<AirportFacility>.constructor"})}),"\n",(0,s.jsx)(i.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/garminsdk/navigation/AirportWaypoint.ts:27"}),"\n",(0,s.jsx)(i.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(i.h3,{id:"isfacilitywaypoint",children:"isFacilityWaypoint"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.code,{children:"readonly"})," ",(0,s.jsx)(i.strong,{children:"isFacilityWaypoint"}),": ",(0,s.jsx)(i.code,{children:"true"})," = ",(0,s.jsx)(i.code,{children:"true"})]}),"\n"]}),"\n",(0,s.jsx)(i.h4,{id:"inherit-doc",children:"Inherit Doc"}),"\n",(0,s.jsx)(i.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"BasicFacilityWaypoint.isFacilityWaypoint"})}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/Waypoint.ts:135"}),"\n",(0,s.jsx)(i.hr,{}),"\n",(0,s.jsx)(i.h3,{id:"longestrunway",children:"longestRunway"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.code,{children:"readonly"})," ",(0,s.jsx)(i.strong,{children:"longestRunway"}),": ",(0,s.jsx)(i.code,{children:"null"})," | ",(0,s.jsx)(i.code,{children:"AirportRunway"})]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"The longest runway at the airport associated with this waypoint, or null if the airport has no runways."}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/garminsdk/navigation/AirportWaypoint.ts:17"}),"\n",(0,s.jsx)(i.hr,{}),"\n",(0,s.jsx)(i.h3,{id:"size",children:"size"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.code,{children:"readonly"})," ",(0,s.jsx)(i.strong,{children:"size"}),": ",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/enumerations/AirportSize",children:(0,s.jsx)(i.code,{children:"AirportSize"})})]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"The size of the airport associated with this waypoint."}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/garminsdk/navigation/AirportWaypoint.ts:20"}),"\n",(0,s.jsx)(i.h2,{id:"accessors",children:"Accessors"}),"\n",(0,s.jsx)(i.h3,{id:"facility",children:"facility"}),"\n",(0,s.jsx)(i.h4,{id:"get-signature",children:"Get Signature"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"get"})," ",(0,s.jsx)(i.strong,{children:"facility"}),"(): ",(0,s.jsx)(i.code,{children:"Subscribable"}),"<",(0,s.jsx)(i.code,{children:"T"}),">"]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"The facility associated with this waypoint."}),"\n",(0,s.jsx)(i.h5,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.code,{children:"Subscribable"}),"<",(0,s.jsx)(i.code,{children:"T"}),">"]}),"\n",(0,s.jsx)(i.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"BasicFacilityWaypoint.facility"})}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/Waypoint.ts:189"}),"\n",(0,s.jsx)(i.hr,{}),"\n",(0,s.jsx)(i.h3,{id:"location",children:"location"}),"\n",(0,s.jsx)(i.h4,{id:"get-signature-1",children:"Get Signature"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"get"})," ",(0,s.jsx)(i.strong,{children:"location"}),"(): ",(0,s.jsx)(i.code,{children:"Subscribable"}),"<",(0,s.jsx)(i.code,{children:"GeoPointInterface"}),">"]}),"\n"]}),"\n",(0,s.jsx)(i.h5,{id:"inherit-doc-1",children:"Inherit Doc"}),"\n",(0,s.jsx)(i.h5,{id:"returns-2",children:"Returns"}),"\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.code,{children:"Subscribable"}),"<",(0,s.jsx)(i.code,{children:"GeoPointInterface"}),">"]}),"\n",(0,s.jsx)(i.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"BasicFacilityWaypoint.location"})}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/Waypoint.ts:171"}),"\n",(0,s.jsx)(i.hr,{}),"\n",(0,s.jsx)(i.h3,{id:"type",children:"type"}),"\n",(0,s.jsx)(i.h4,{id:"get-signature-2",children:"Get Signature"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"get"})," ",(0,s.jsx)(i.strong,{children:"type"}),"(): ",(0,s.jsx)(i.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsx)(i.h5,{id:"inherit-doc-2",children:"Inherit Doc"}),"\n",(0,s.jsx)(i.h5,{id:"returns-3",children:"Returns"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"string"})}),"\n",(0,s.jsx)(i.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"BasicFacilityWaypoint.type"})}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/Waypoint.ts:181"}),"\n",(0,s.jsx)(i.hr,{}),"\n",(0,s.jsx)(i.h3,{id:"uid",children:"uid"}),"\n",(0,s.jsx)(i.h4,{id:"get-signature-3",children:"Get Signature"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"get"})," ",(0,s.jsx)(i.strong,{children:"uid"}),"(): ",(0,s.jsx)(i.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsx)(i.h5,{id:"inherit-doc-3",children:"Inherit Doc"}),"\n",(0,s.jsx)(i.h5,{id:"returns-4",children:"Returns"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"string"})}),"\n",(0,s.jsx)(i.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"BasicFacilityWaypoint.uid"})}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/Waypoint.ts:176"}),"\n",(0,s.jsx)(i.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(i.h3,{id:"equals",children:"equals()"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"equals"}),"(",(0,s.jsx)(i.code,{children:"other"}),"): ",(0,s.jsx)(i.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"Checks whether this waypoint and another are equal."}),"\n",(0,s.jsx)(i.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(i.table,{children:[(0,s.jsx)(i.thead,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.th,{children:"Parameter"}),(0,s.jsx)(i.th,{children:"Type"}),(0,s.jsx)(i.th,{children:"Description"})]})}),(0,s.jsx)(i.tbody,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"other"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"Waypoint"})}),(0,s.jsx)(i.td,{children:"The other waypoint."})]})})]}),"\n",(0,s.jsx)(i.h4,{id:"returns-5",children:"Returns"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"boolean"})}),"\n",(0,s.jsx)(i.p,{children:"whether this waypoint and the other are equal."}),"\n",(0,s.jsx)(i.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"BasicFacilityWaypoint.equals"})}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/Waypoint.ts:59"})]})}function h(e={}){let{wrapper:i}={...(0,d.a)(),...e.components};return i?(0,s.jsx)(i,{...e,children:(0,s.jsx)(a,{...e})}):a(e)}},250065:function(e,i,n){n.d(i,{Z:function(){return l},a:function(){return t}});var r=n(667294);let s={},d=r.createContext(s);function t(e){let i=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(i):{...i,...e}},[i,e])}function l(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:t(e.components),r.createElement(d.Provider,{value:i},e.children)}}}]);