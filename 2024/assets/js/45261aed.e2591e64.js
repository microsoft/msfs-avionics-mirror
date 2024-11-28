"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["82937"],{697352:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>c,default:()=>a,assets:()=>d,toc:()=>o,frontMatter:()=>t});var r=JSON.parse('{"id":"api/framework/interfaces/FmcScreenOptions","title":"Interface: FmcScreenOptions","description":"Options for an FMC screen","source":"@site/docs/api/framework/interfaces/FmcScreenOptions.md","sourceDirName":"api/framework/interfaces","slug":"/api/framework/interfaces/FmcScreenOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FmcScreenOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"FmcScratchpadOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FmcScratchpadOptions"},"next":{"title":"FmcScreenPluginContext","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/FmcScreenPluginContext"}}'),l=i("785893"),s=i("250065");let t={},c="Interface: FmcScreenOptions",d={},o=[{value:"Properties",id:"properties",level:2},{value:"enableScratchpad?",id:"enablescratchpad",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"eventPrefix?",id:"eventprefix",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"lskNotHandledThrowValue?",id:"lsknothandledthrowvalue",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"screenDimensions",id:"screendimensions",level:3},{value:"cellHeight",id:"cellheight",level:4},{value:"cellWidth",id:"cellwidth",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"textInputFieldDisallowedDeleteThrowValue?",id:"textinputfielddisalloweddeletethrowvalue",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"textInputFieldParseFailThrowValue?",id:"textinputfieldparsefailthrowvalue",level:3},{value:"Defined in",id:"defined-in-5",level:4}];function h(e){let n={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",...(0,s.a)(),...e.components};return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(n.header,{children:(0,l.jsx)(n.h1,{id:"interface-fmcscreenoptions",children:"Interface: FmcScreenOptions"})}),"\n",(0,l.jsx)(n.p,{children:"Options for an FMC screen"}),"\n",(0,l.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,l.jsx)(n.h3,{id:"enablescratchpad",children:"enableScratchpad?"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.code,{children:"optional"})," ",(0,l.jsx)(n.strong,{children:"enableScratchpad"}),": ",(0,l.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,l.jsxs)(n.p,{children:["Whether to enable the scratchpad. Defaults to ",(0,l.jsx)(n.code,{children:"true"}),"."]}),"\n",(0,l.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/fmc/FmcScreen.ts:48"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"eventprefix",children:"eventPrefix?"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.code,{children:"optional"})," ",(0,l.jsx)(n.strong,{children:"eventPrefix"}),": ",(0,l.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"A prefix for fmc events.\nCurrently used for multiple FMCs on one instrument scenarios."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/fmc/FmcScreen.ts:54"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"lsknothandledthrowvalue",children:"lskNotHandledThrowValue?"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.code,{children:"optional"})," ",(0,l.jsx)(n.strong,{children:"lskNotHandledThrowValue"}),": ",(0,l.jsx)(n.code,{children:"any"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The value that is thrown when an LSK event is not handled by anything."}),"\n",(0,l.jsx)(n.p,{children:"Default: the string 'KEY NOT ACTIVE'."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/fmc/FmcScreen.ts:29"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"screendimensions",children:"screenDimensions"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"screenDimensions"}),": ",(0,l.jsx)(n.code,{children:"object"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"Screen dimensions"}),"\n",(0,l.jsx)(n.h4,{id:"cellheight",children:"cellHeight"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"cellHeight"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"Screen character row height"}),"\n",(0,l.jsx)(n.h4,{id:"cellwidth",children:"cellWidth"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"cellWidth"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"Screen character cell width"}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/fmc/FmcScreen.ts:16"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"textinputfielddisalloweddeletethrowvalue",children:"textInputFieldDisallowedDeleteThrowValue?"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.code,{children:"optional"})," ",(0,l.jsx)(n.strong,{children:"textInputFieldDisallowedDeleteThrowValue"}),": ",(0,l.jsx)(n.code,{children:"any"})]}),"\n"]}),"\n",(0,l.jsxs)(n.p,{children:["The value that is thrown when a text input fields receives a DELETE when ",(0,l.jsx)(n.code,{children:"deleteAllowed"})," is false."]}),"\n",(0,l.jsx)(n.p,{children:"Default: the string 'INVALID DELETE'."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/fmc/FmcScreen.ts:36"}),"\n",(0,l.jsx)(n.hr,{}),"\n",(0,l.jsx)(n.h3,{id:"textinputfieldparsefailthrowvalue",children:"textInputFieldParseFailThrowValue?"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.code,{children:"optional"})," ",(0,l.jsx)(n.strong,{children:"textInputFieldParseFailThrowValue"}),": ",(0,l.jsx)(n.code,{children:"any"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The value that is thrown when a text input fields fails to parse a scratchpad entry."}),"\n",(0,l.jsx)(n.p,{children:"Default: the string 'INVALID ENTRY'."}),"\n",(0,l.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/sdk/fmc/FmcScreen.ts:43"})]})}function a(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,l.jsx)(n,{...e,children:(0,l.jsx)(h,{...e})}):h(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return c},a:function(){return t}});var r=i(667294);let l={},s=r.createContext(l);function t(e){let n=r.useContext(s);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(l):e.components||l:t(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);