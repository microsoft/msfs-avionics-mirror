"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["346152"],{888014:function(e,n,s){s.r(n),s.d(n,{metadata:()=>a,contentTitle:()=>r,default:()=>h,assets:()=>d,toc:()=>l,frontMatter:()=>t});var a=JSON.parse('{"id":"api/garminsdk/type-aliases/EspAoaModuleOptions","title":"Type Alias: EspAoaModuleOptions","description":"EspAoaModuleOptions: object","source":"@site/docs/api/garminsdk/type-aliases/EspAoaModuleOptions.md","sourceDirName":"api/garminsdk/type-aliases","slug":"/api/garminsdk/type-aliases/EspAoaModuleOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/EspAoaModuleOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"EspAoaModuleEngageData","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/EspAoaModuleEngageData"},"next":{"title":"EspControlInputManagerAxisIncrOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/EspControlInputManagerAxisIncrOptions"}}'),i=s("785893"),o=s("250065");let t={},r="Type Alias: EspAoaModuleOptions",d={},l=[{value:"Type declaration",id:"type-declaration",level:2},{value:"canEngageWhenAglInvalid?",id:"canengagewhenaglinvalid",level:3},{value:"disengageAoa",id:"disengageaoa",level:3},{value:"engageAoa",id:"engageaoa",level:3},{value:"getForceToApply()",id:"getforcetoapply",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:2}];function c(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,o.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"type-alias-espaoamoduleoptions",children:"Type Alias: EspAoaModuleOptions"})}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"EspAoaModuleOptions"}),": ",(0,i.jsx)(n.code,{children:"object"})]}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["Configuration options for ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/EspAoaModule",children:"EspAoaModule"}),"."]}),"\n",(0,i.jsx)(n.h2,{id:"type-declaration",children:"Type declaration"}),"\n",(0,i.jsx)(n.h3,{id:"canengagewhenaglinvalid",children:"canEngageWhenAglInvalid?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"canEngageWhenAglInvalid"}),": ",(0,i.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["Whether the module can engage when AGL data is invalid. Defaults to ",(0,i.jsx)(n.code,{children:"false"}),"."]}),"\n",(0,i.jsx)(n.h3,{id:"disengageaoa",children:"disengageAoa"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"disengageAoa"}),": ",(0,i.jsx)(n.code,{children:"number"})," | ",(0,i.jsx)(n.code,{children:"Accessible"}),"<",(0,i.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["The angle of attack, in degrees, below which the module disengages. The value will be clamped such that it is not\ngreater than ",(0,i.jsx)(n.code,{children:"engageAoa"}),". A value equal to ",(0,i.jsx)(n.code,{children:"NaN"})," will inhibit the module from engaging."]}),"\n",(0,i.jsx)(n.h3,{id:"engageaoa",children:"engageAoa"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"engageAoa"}),": ",(0,i.jsx)(n.code,{children:"number"})," | ",(0,i.jsx)(n.code,{children:"Accessible"}),"<",(0,i.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["The angle of attack, in degrees, at or above which the module engages. A value equal to ",(0,i.jsx)(n.code,{children:"NaN"})," will inhibit the\nmodule from engaging."]}),"\n",(0,i.jsx)(n.h3,{id:"getforcetoapply",children:"getForceToApply()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"getForceToApply"}),": (",(0,i.jsx)(n.code,{children:"data"}),", ",(0,i.jsx)(n.code,{children:"engageData"}),") => ",(0,i.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Gets the force to apply to the pitch control axis when the module is engaged, scaled such that a force of\nmagnitude one is the amount of force required to deflect the control axis from the neutral position to maximum\ndeflection (on either side). Positive force deflects the control axis to command an increase in pitch angle (i.e.\nincrease downward pitch)."}),"\n",(0,i.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"data"})}),(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"Readonly"}),"<",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/EspData",children:(0,i.jsx)(n.code,{children:"EspData"})}),">"]}),(0,i.jsx)(n.td,{children:"The current ESP data."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"engageData"})}),(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"Readonly"}),"<",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/EspAoaModuleEngageData",children:(0,i.jsx)(n.code,{children:"EspAoaModuleEngageData"})}),">"]}),(0,i.jsx)(n.td,{children:"Data describing the engagement state of the module."})]})]})]}),"\n",(0,i.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"number"})}),"\n",(0,i.jsx)(n.p,{children:"The force to apply to the pitch control axis when the module is engaged, scaled such that a force of\nmagnitude one is the amount of force required to deflect the control axis from the neutral position to maximum\ndeflection (on either side)."}),"\n",(0,i.jsx)(n.h2,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"src/garminsdk/esp/modules/EspAoaModule.ts:23"})]})}function h(e={}){let{wrapper:n}={...(0,o.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(c,{...e})}):c(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return r},a:function(){return t}});var a=s(667294);let i={},o=a.createContext(i);function t(e){let n=a.useContext(o);return a.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:t(e.components),a.createElement(o.Provider,{value:n},e.children)}}}]);