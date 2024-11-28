"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["872179"],{873213:function(e,n,i){i.r(n),i.d(n,{metadata:()=>l,contentTitle:()=>d,default:()=>o,assets:()=>t,toc:()=>c,frontMatter:()=>a});var l=JSON.parse('{"id":"api/epic2shared/interfaces/FlapWarningDataProvider","title":"Interface: FlapWarningDataProvider","description":"A stall warning system data provider, providing data from the stall warning system selected for an instrument.","source":"@site/docs/api/epic2shared/interfaces/FlapWarningDataProvider.md","sourceDirName":"api/epic2shared/interfaces","slug":"/api/epic2shared/interfaces/FlapWarningDataProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/FlapWarningDataProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"Epic2VSpeedEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/Epic2VSpeedEvents"},"next":{"title":"FlapWarningSystemEvents","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/FlapWarningSystemEvents"}}'),r=i("785893"),s=i("250065");let a={},d="Interface: FlapWarningDataProvider",t={},c=[{value:"Properties",id:"properties",level:2},{value:"handleAngle",id:"handleangle",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"highestFlapAngle",id:"highestflapangle",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"isAtHandleAngle",id:"isathandleangle",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"isFlapAsymmetry",id:"isflapasymmetry",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"isFlapDataValid",id:"isflapdatavalid",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"isTakeoffPosition",id:"istakeoffposition",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"leftFlapAngle",id:"leftflapangle",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"rightFlapAngle",id:"rightflapangle",level:3},{value:"Defined in",id:"defined-in-7",level:4}];function h(e){let n={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",...(0,s.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"interface-flapwarningdataprovider",children:"Interface: FlapWarningDataProvider"})}),"\n",(0,r.jsx)(n.p,{children:"A stall warning system data provider, providing data from the stall warning system selected for an instrument."}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"handleangle",children:"handleAngle"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"handleAngle"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The angle commanded by the current flap handle position in degrees, or null if invalid."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/FlapWarningDataProvider.ts:19"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"highestflapangle",children:"highestFlapAngle"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"highestFlapAngle"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The flap angle of the most extended flap in degrees, or null if invalid."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/FlapWarningDataProvider.ts:16"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"isathandleangle",children:"isAtHandleAngle"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"isAtHandleAngle"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Whether the flaps are at the desired handle angle. Defaults to false when data invalid."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/FlapWarningDataProvider.ts:22"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"isflapasymmetry",children:"isFlapAsymmetry"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"isFlapAsymmetry"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Whether a flap assymetry condition is detected. Defaults to false when data invalid."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/FlapWarningDataProvider.ts:25"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"isflapdatavalid",children:"isFlapDataValid"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"isFlapDataValid"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Whether the flap data is valid."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/FlapWarningDataProvider.ts:31"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"istakeoffposition",children:"isTakeoffPosition"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"isTakeoffPosition"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"boolean"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Whether the flaps are in a valid takeoff position. Defaults to false when data invalid."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/FlapWarningDataProvider.ts:28"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"leftflapangle",children:"leftFlapAngle"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"leftFlapAngle"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The left flap angle in degrees, or null if invalid."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/FlapWarningDataProvider.ts:10"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"rightflapangle",children:"rightFlapAngle"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"rightFlapAngle"}),": ",(0,r.jsx)(n.code,{children:"Subscribable"}),"<",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The right flap angle in degrees, or null if invalid."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Instruments/FlapWarningDataProvider.ts:13"})]})}function o(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return d},a:function(){return a}});var l=i(667294);let r={},s=l.createContext(r);function a(e){let n=l.useContext(s);return l.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:a(e.components),l.createElement(s.Provider,{value:n},e.children)}}}]);