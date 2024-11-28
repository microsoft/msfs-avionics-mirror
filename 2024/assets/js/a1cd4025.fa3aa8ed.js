"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["312640"],{334125:function(e,n,s){s.r(n),s.d(n,{metadata:()=>r,contentTitle:()=>c,default:()=>h,assets:()=>l,toc:()=>a,frontMatter:()=>t});var r=JSON.parse('{"id":"api/framework/classes/CssTransformChain","title":"Class: CssTransformChain\\\\<T\\\\>","description":"A concatenated chain of CSS transforms.","source":"@site/docs/api/framework/classes/CssTransformChain.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/CssTransformChain","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/CssTransformChain","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"CssTransformBuilder","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/CssTransformBuilder"},"next":{"title":"CssTransformSubject","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/CssTransformSubject"}}'),i=s("785893"),d=s("250065");let t={},c="Class: CssTransformChain<T>",l={},a=[{value:"Type Parameters",id:"type-parameters",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new CssTransformChain()",id:"new-csstransformchain",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"getChild()",id:"getchild",level:3},{value:"Type Parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"resolve()",id:"resolve",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-2",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"class-csstransformchaint",children:"Class: CssTransformChain<T>"})}),"\n",(0,i.jsx)(n.p,{children:"A concatenated chain of CSS transforms."}),"\n",(0,i.jsx)(n.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsx)(n.tr,{children:(0,i.jsx)(n.th,{children:"Type Parameter"})})}),(0,i.jsx)(n.tbody,{children:(0,i.jsx)(n.tr,{children:(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"T"})," ",(0,i.jsx)(n.em,{children:"extends"})," ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/CssTransform",children:(0,i.jsx)(n.code,{children:"CssTransform"})}),"[]"]})})})]}),"\n",(0,i.jsx)(n.h2,{id:"implements",children:"Implements"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/CssTransform",children:(0,i.jsx)(n.code,{children:"CssTransform"})})}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(n.h3,{id:"new-csstransformchain",children:"new CssTransformChain()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"new CssTransformChain"}),"<",(0,i.jsx)(n.code,{children:"T"}),">(...",(0,i.jsx)(n.code,{children:"transforms"}),"): ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/CssTransformChain",children:(0,i.jsx)(n.code,{children:"CssTransformChain"})}),"<",(0,i.jsx)(n.code,{children:"T"}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Creates a new chain of CSS transforms."}),"\n",(0,i.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsxs)(n.td,{children:["...",(0,i.jsx)(n.code,{children:"transforms"})]}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"T"})}),(0,i.jsxs)(n.td,{children:["The individual child transforms that will constitute the new transform chain. The order of the children passed to the constructor determines the order of concatenation. Concatenation follows the standard CSS transform convention: for a concatenation of transforms ",(0,i.jsx)(n.code,{children:"[A, B, C]"}),", the resulting transformation is equivalent to the one produced by multiplying the transformation matrices in the order ",(0,i.jsx)(n.code,{children:"(A * B) * C"}),"."]})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/CssTransformChain",children:(0,i.jsx)(n.code,{children:"CssTransformChain"})}),"<",(0,i.jsx)(n.code,{children:"T"}),">"]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/graphics/css/CssTransform.ts:510"}),"\n",(0,i.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(n.h3,{id:"getchild",children:"getChild()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"getChild"}),"<",(0,i.jsx)(n.code,{children:"Index"}),">(",(0,i.jsx)(n.code,{children:"index"}),"): ",(0,i.jsx)(n.code,{children:"Omit"}),"<",(0,i.jsx)(n.code,{children:"NonNullable"}),"<",(0,i.jsx)(n.code,{children:"T"}),"[",(0,i.jsx)(n.code,{children:"Index"}),"]>, ",(0,i.jsx)(n.code,{children:'"resolve"'}),">"]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Gets one of this chain's child transforms."}),"\n",(0,i.jsx)(n.h4,{id:"type-parameters-1",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsx)(n.tr,{children:(0,i.jsx)(n.th,{children:"Type Parameter"})})}),(0,i.jsx)(n.tbody,{children:(0,i.jsx)(n.tr,{children:(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"Index"})," ",(0,i.jsx)(n.em,{children:"extends"})," ",(0,i.jsx)(n.code,{children:"number"})]})})})]}),"\n",(0,i.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"index"})}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"Index"})}),(0,i.jsx)(n.td,{children:"The index of the child to get."})]})})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"Omit"}),"<",(0,i.jsx)(n.code,{children:"NonNullable"}),"<",(0,i.jsx)(n.code,{children:"T"}),"[",(0,i.jsx)(n.code,{children:"Index"}),"]>, ",(0,i.jsx)(n.code,{children:'"resolve"'}),">"]}),"\n",(0,i.jsx)(n.p,{children:"The child transform at the specified index in this chain."}),"\n",(0,i.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,i.jsxs)(n.p,{children:["RangeError if ",(0,i.jsx)(n.code,{children:"index"})," is out of bounds."]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/graphics/css/CssTransform.ts:520"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"resolve",children:"resolve()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"resolve"}),"(): ",(0,i.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Resolves this transform to a CSS transform string."}),"\n",(0,i.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"string"})}),"\n",(0,i.jsx)(n.p,{children:"A CSS transform string representative of this transform."}),"\n",(0,i.jsx)(n.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/CssTransform",children:(0,i.jsx)(n.code,{children:"CssTransform"})}),".",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/CssTransform#resolve",children:(0,i.jsx)(n.code,{children:"resolve"})})]}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/sdk/graphics/css/CssTransform.ts:529"})]})}function h(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(o,{...e})}):o(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return c},a:function(){return t}});var r=s(667294);let i={},d=r.createContext(i);function t(e){let n=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:t(e.components),r.createElement(d.Provider,{value:n},e.children)}}}]);