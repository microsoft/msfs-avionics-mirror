"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["115329"],{837080:function(e,n,i){i.r(n),i.d(n,{metadata:()=>s,contentTitle:()=>c,default:()=>h,assets:()=>a,toc:()=>l,frontMatter:()=>t});var s=JSON.parse('{"id":"api/wt21shared/classes/NavIndicators","title":"Class: NavIndicators\\\\<T, U\\\\>","description":"Holds the nav indicators.","source":"@site/docs/api/wt21shared/classes/NavIndicators.md","sourceDirName":"api/wt21shared/classes","slug":"/api/wt21shared/classes/NavIndicators","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/NavIndicators","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"NavIndicatorAnimator","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/NavIndicatorAnimator"},"next":{"title":"NavRadioNavSource","permalink":"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/NavRadioNavSource"}}'),r=i("785893"),d=i("250065");let t={},c="Class: NavIndicators<T, U>",a={},l=[{value:"Type Parameters",id:"type-parameters",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new NavIndicators()",id:"new-navindicators",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"get()",id:"get",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"init()",id:"init",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Inherit Doc",id:"inherit-doc",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"onUpdate()",id:"onupdate",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherit Doc",id:"inherit-doc-1",level:4},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-3",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"class-navindicatorst-u",children:"Class: NavIndicators<T, U>"})}),"\n",(0,r.jsx)(n.p,{children:"Holds the nav indicators."}),"\n",(0,r.jsx)(n.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsx)(n.tr,{children:(0,r.jsx)(n.th,{children:"Type Parameter"})})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsx)(n.tr,{children:(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"T"})," ",(0,r.jsx)(n.em,{children:"extends"})," readonly ",(0,r.jsx)(n.code,{children:"string"}),"[]"]})}),(0,r.jsx)(n.tr,{children:(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"U"})," ",(0,r.jsx)(n.em,{children:"extends"})," readonly ",(0,r.jsx)(n.code,{children:"string"}),"[]"]})})]})]}),"\n",(0,r.jsx)(n.h2,{id:"implements",children:"Implements"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:"Instrument"})}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(n.h3,{id:"new-navindicators",children:"new NavIndicators()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"new NavIndicators"}),"<",(0,r.jsx)(n.code,{children:"T"}),", ",(0,r.jsx)(n.code,{children:"U"}),">(",(0,r.jsx)(n.code,{children:"indicators"}),"): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/NavIndicators",children:(0,r.jsx)(n.code,{children:"NavIndicators"})}),"<",(0,r.jsx)(n.code,{children:"T"}),", ",(0,r.jsx)(n.code,{children:"U"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"NavIndicators constructor."}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"indicators"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"Map"}),"<",(0,r.jsx)(n.code,{children:"U"}),"[",(0,r.jsx)(n.code,{children:"number"}),"], ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/NavIndicator",children:(0,r.jsx)(n.code,{children:"NavIndicator"})}),"<",(0,r.jsx)(n.code,{children:"T"}),">>"]}),(0,r.jsx)(n.td,{children:"The nav indicators to hold."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/NavIndicators",children:(0,r.jsx)(n.code,{children:"NavIndicators"})}),"<",(0,r.jsx)(n.code,{children:"T"}),", ",(0,r.jsx)(n.code,{children:"U"}),">"]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Navigation/NavIndicators/NavIndicators.ts:86"}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"get",children:"get()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"get"}),"(",(0,r.jsx)(n.code,{children:"key"}),"): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/NavIndicator",children:(0,r.jsx)(n.code,{children:"NavIndicator"})}),"<",(0,r.jsx)(n.code,{children:"T"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Gets a nav indicator."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"key"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"U"}),"[",(0,r.jsx)(n.code,{children:"number"}),"]"]}),(0,r.jsx)(n.td,{children:"The name of the indicator to get."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/wt21shared/classes/NavIndicator",children:(0,r.jsx)(n.code,{children:"NavIndicator"})}),"<",(0,r.jsx)(n.code,{children:"T"}),">"]}),"\n",(0,r.jsx)(n.p,{children:"The indicator."}),"\n",(0,r.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,r.jsx)(n.p,{children:"Error if indicator not found."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Navigation/NavIndicators/NavIndicators.ts:105"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"init",children:"init()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"init"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"inherit-doc",children:"Inherit Doc"}),"\n",(0,r.jsx)(n.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Instrument.init"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Navigation/NavIndicators/NavIndicators.ts:91"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"onupdate",children:"onUpdate()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"onUpdate"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"inherit-doc-1",children:"Inherit Doc"}),"\n",(0,r.jsx)(n.h4,{id:"implementation-of-1",children:"Implementation of"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Instrument.onUpdate"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"workingtitle-instruments-wt21/shared/Navigation/NavIndicators/NavIndicators.ts:96"})]})}function h(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(o,{...e})}):o(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return c},a:function(){return t}});var s=i(667294);let r={},d=s.createContext(r);function t(e){let n=s.useContext(d);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:t(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);