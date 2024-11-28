"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["547722"],{803651:function(e,n,r){r.r(n),r.d(n,{metadata:()=>i,contentTitle:()=>c,default:()=>a,assets:()=>o,toc:()=>t,frontMatter:()=>l});var i=JSON.parse('{"id":"api/framework/interfaces/DigitScrollerProps","title":"Interface: DigitScrollerProps","description":"Component props for DigitScroller.","source":"@site/docs/api/framework/interfaces/DigitScrollerProps.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/DigitScrollerProps","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/DigitScrollerProps","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"CssTransform","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/CssTransform"},"next":{"title":"DisplayFieldOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/DisplayFieldOptions"}}'),s=r("785893"),d=r("250065");let l={},c="Interface: DigitScrollerProps",o={},t=[{value:"Extends",id:"extends",level:2},{value:"Properties",id:"properties",level:2},{value:"base",id:"base",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"children?",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"class?",id:"class",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"factor",id:"factor",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"nanString?",id:"nanstring",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"ref?",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"renderDigit()?",id:"renderdigit",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"scrollThreshold?",id:"scrollthreshold",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"value",id:"value",level:3},{value:"Defined in",id:"defined-in-8",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"interface-digitscrollerprops",children:"Interface: DigitScrollerProps"})}),"\n",(0,s.jsx)(n.p,{children:"Component props for DigitScroller."}),"\n",(0,s.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/ComponentProps",children:(0,s.jsx)(n.code,{children:"ComponentProps"})})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"base",children:"base"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"base"}),": ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The number base used by the scroller. Must be an integer greater than or equal to ",(0,s.jsx)(n.code,{children:"3"}),"."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/common/DigitScroller.tsx:18"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"children",children:"children?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"children"}),": ",(0,s.jsx)(n.code,{children:"DisplayChildren"}),"[]"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The children of the display component."}),"\n",(0,s.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/ComponentProps",children:(0,s.jsx)(n.code,{children:"ComponentProps"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/ComponentProps#children",children:(0,s.jsx)(n.code,{children:"children"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:122"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"class",children:"class?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"class"}),": ",(0,s.jsx)(n.code,{children:"string"})," | ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/SubscribableSet",children:(0,s.jsx)(n.code,{children:"SubscribableSet"})}),"<",(0,s.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"CSS class(es) to apply to the root of the digit scroller."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/common/DigitScroller.tsx:42"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"factor",children:"factor"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"factor"}),": ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The factor represented by the scroller's digit. The factor relates the digit to its nominal value as\n",(0,s.jsx)(n.code,{children:"value = digit * factor"}),". Cannot be ",(0,s.jsx)(n.code,{children:"0"}),"."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/common/DigitScroller.tsx:24"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"nanstring",children:"nanString?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"nanString"}),": ",(0,s.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The string to render when the scroller's value is ",(0,s.jsx)(n.code,{children:"NaN"}),". Defaults to ",(0,s.jsx)(n.code,{children:"\u2013"}),"."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/common/DigitScroller.tsx:39"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"ref",children:"ref?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"ref"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/NodeReference",children:(0,s.jsx)(n.code,{children:"NodeReference"})}),"<",(0,s.jsx)(n.code,{children:"any"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A reference to the display component."}),"\n",(0,s.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/ComponentProps",children:(0,s.jsx)(n.code,{children:"ComponentProps"})}),".",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/ComponentProps#ref",children:(0,s.jsx)(n.code,{children:"ref"})})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:125"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"renderdigit",children:"renderDigit()?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"renderDigit"}),": (",(0,s.jsx)(n.code,{children:"digit"}),") => ",(0,s.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["A function which renders each digit of the scroller to a text string. If not defined, each digit will be rendered\nusing the ",(0,s.jsx)(n.code,{children:"Number.toString()"})," method."]}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"digit"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"string"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/common/DigitScroller.tsx:36"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"scrollthreshold",children:"scrollThreshold?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"scrollThreshold"}),": ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The amount the scroller's value must deviate from the current displayed digit's nominal value before the digit\nbegins to scroll. Defaults to ",(0,s.jsx)(n.code,{children:"0"}),"."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/common/DigitScroller.tsx:30"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"value",children:"value"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"value"}),": ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscribable",children:(0,s.jsx)(n.code,{children:"Subscribable"})}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The value to which the scroller is bound."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/common/DigitScroller.tsx:15"})]})}function a(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return c},a:function(){return l}});var i=r(667294);let s={},d=i.createContext(s);function l(e){let n=i.useContext(d);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:l(e.components),i.createElement(d.Provider,{value:n},e.children)}}}]);