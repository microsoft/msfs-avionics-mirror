"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["467521"],{277545:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>s,default:()=>h,assets:()=>l,toc:()=>c,frontMatter:()=>t});var r=JSON.parse('{"id":"api/epic2shared/interfaces/HeadingDataProvider","title":"Interface: HeadingDataProvider","description":"A heading data provider, providing data from the ADAHRS and FMS Pos System selected for an instrument.","source":"@site/docs/api/epic2shared/interfaces/HeadingDataProvider.md","sourceDirName":"api/epic2shared/interfaces","slug":"/api/epic2shared/interfaces/HeadingDataProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/HeadingDataProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"GpwsModule","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/GpwsModule"},"next":{"title":"HoldListData","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/HoldListData"}}'),d=i("785893"),a=i("250065");let t={},s="Interface: HeadingDataProvider",l={},c=[{value:"Properties",id:"properties",level:2},{value:"deltaHeadingRate",id:"deltaheadingrate",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"magneticDataAvailable",id:"magneticdataavailable",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"magneticHeading",id:"magneticheading",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"magneticTrack",id:"magnetictrack",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"trueHeading",id:"trueheading",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"trueTrack",id:"truetrack",level:3},{value:"Defined in",id:"defined-in-5",level:4}];function o(e){let n={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",...(0,a.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"interface-headingdataprovider",children:"Interface: HeadingDataProvider"})}),"\n",(0,d.jsx)(n.p,{children:"A heading data provider, providing data from the ADAHRS and FMS Pos System selected for an instrument."}),"\n",(0,d.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(n.h3,{id:"deltaheadingrate",children:"deltaHeadingRate"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"deltaHeadingRate"}),": ",(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"null"})," | ",(0,d.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The current turn rate in degrees per second, or null when invalid."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/HeadingDataProvider.ts:28"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"magneticdataavailable",children:"magneticDataAvailable"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"magneticDataAvailable"}),": ",(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"null"})," | ",(0,d.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Whether magnetic data is available, or null when invalid."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/HeadingDataProvider.ts:19"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"magneticheading",children:"magneticHeading"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"magneticHeading"}),": ",(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"null"})," | ",(0,d.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The current magnetic heading in degrees, or true heading when magnetic data not available, or null when invalid."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/HeadingDataProvider.ts:16"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"magnetictrack",children:"magneticTrack"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"magneticTrack"}),": ",(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"null"})," | ",(0,d.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The current magnetic track in degrees, or true track when magnetic data not available, or null when invalid."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/HeadingDataProvider.ts:25"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"trueheading",children:"trueHeading"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"trueHeading"}),": ",(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"null"})," | ",(0,d.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The current true heading in degrees, or null when invalid."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/HeadingDataProvider.ts:13"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"truetrack",children:"trueTrack"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"trueTrack"}),": ",(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"null"})," | ",(0,d.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The current true track in degrees, or null when invalid."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/HeadingDataProvider.ts:22"})]})}function h(e={}){let{wrapper:n}={...(0,a.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(o,{...e})}):o(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return s},a:function(){return t}});var r=i(667294);let d={},a=r.createContext(d);function t(e){let n=r.useContext(a);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function s(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:t(e.components),r.createElement(a.Provider,{value:n},e.children)}}}]);