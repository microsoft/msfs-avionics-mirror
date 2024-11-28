"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["914361"],{464622:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>t,default:()=>h,assets:()=>c,toc:()=>d,frontMatter:()=>o});var r=JSON.parse('{"id":"api/garminsdk/type-aliases/RollIndicatorOptions","title":"Type Alias: RollIndicatorOptions","description":"RollIndicatorOptions: object","source":"@site/docs/api/garminsdk/type-aliases/RollIndicatorOptions.md","sourceDirName":"api/garminsdk/type-aliases","slug":"/api/garminsdk/type-aliases/RollIndicatorOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/RollIndicatorOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"RangeRingOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/RangeRingOptions"},"next":{"title":"RollIndicatorScaleComponentFactory","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/RollIndicatorScaleComponentFactory"}}'),l=i("785893"),s=i("250065");let o={},t="Type Alias: RollIndicatorOptions",c={},d=[{value:"Type declaration",id:"type-declaration",level:2},{value:"lowBankAngle?",id:"lowbankangle",level:3},{value:"majorTickLength",id:"majorticklength",level:3},{value:"minorTickLength",id:"minorticklength",level:3},{value:"pointerStyle",id:"pointerstyle",level:3},{value:"radius",id:"radius",level:3},{value:"referencePointerOffset",id:"referencepointeroffset",level:3},{value:"referencePointerSize",id:"referencepointersize",level:3},{value:"rollPointerOffset",id:"rollpointeroffset",level:3},{value:"rollPointerSize",id:"rollpointersize",level:3},{value:"showArc",id:"showarc",level:3},{value:"slipSkidIndicatorHeight",id:"slipskidindicatorheight",level:3},{value:"slipSkidIndicatorOffset",id:"slipskidindicatoroffset",level:3},{value:"slipSkidIndicatorTranslateScale",id:"slipskidindicatortranslatescale",level:3},{value:"Defined in",id:"defined-in",level:2}];function a(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",strong:"strong",...(0,s.a)(),...e.components};return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(n.header,{children:(0,l.jsx)(n.h1,{id:"type-alias-rollindicatoroptions",children:"Type Alias: RollIndicatorOptions"})}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"RollIndicatorOptions"}),": ",(0,l.jsx)(n.code,{children:"object"})]}),"\n"]}),"\n",(0,l.jsxs)(n.p,{children:["Options for ",(0,l.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/RollIndicator",children:"RollIndicator"}),"."]}),"\n",(0,l.jsx)(n.h2,{id:"type-declaration",children:"Type declaration"}),"\n",(0,l.jsx)(n.h3,{id:"lowbankangle",children:"lowBankAngle?"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.code,{children:"optional"})," ",(0,l.jsx)(n.strong,{children:"lowBankAngle"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The bank angle limit, in degrees, in Low Bank Mode. If not defined, the low-bank arc will not be displayed."}),"\n",(0,l.jsx)(n.h3,{id:"majorticklength",children:"majorTickLength"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"majorTickLength"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The length of the major roll scale ticks, in pixels."}),"\n",(0,l.jsx)(n.h3,{id:"minorticklength",children:"minorTickLength"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"minorTickLength"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The length of the minor roll scale ticks, in pixels."}),"\n",(0,l.jsx)(n.h3,{id:"pointerstyle",children:"pointerStyle"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"pointerStyle"}),": ",(0,l.jsx)(n.code,{children:'"ground"'})," | ",(0,l.jsx)(n.code,{children:'"sky"'})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"Whether to render the indicator with a ground pointer or a sky pointer. With a ground pointer, the roll scale\nrotates as the airplane banks to keep the zero-roll reference pointer pointed toward the ground while the roll\npointer remains fixed. With a sky pointer, the roll pointer rotates as the airplane banks to keep itself pointed\ntoward the sky while the roll scale remains fixed."}),"\n",(0,l.jsx)(n.h3,{id:"radius",children:"radius"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"radius"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The radius of the roll scale, in pixels."}),"\n",(0,l.jsx)(n.h3,{id:"referencepointeroffset",children:"referencePointerOffset"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"referencePointerOffset"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The offset of the tip of the zero-roll reference pointer from the roll scale, in pixels. Positive values displace\nthe pointer away from the center of the circle circumscribed by the roll scale."}),"\n",(0,l.jsx)(n.h3,{id:"referencepointersize",children:"referencePointerSize"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"referencePointerSize"}),": ",(0,l.jsx)(n.code,{children:"ReadonlyFloat64Array"})]}),"\n"]}),"\n",(0,l.jsxs)(n.p,{children:["The size of the zero-roll reference pointer, as ",(0,l.jsx)(n.code,{children:"[width, height]"})," in pixels."]}),"\n",(0,l.jsx)(n.h3,{id:"rollpointeroffset",children:"rollPointerOffset"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"rollPointerOffset"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The offset of the tip of the roll pointer from the roll scale, in pixels. Positive values displace the pointer\ntoward the center of the circle circumscribed by the roll scale."}),"\n",(0,l.jsx)(n.h3,{id:"rollpointersize",children:"rollPointerSize"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"rollPointerSize"}),": ",(0,l.jsx)(n.code,{children:"ReadonlyFloat64Array"})]}),"\n"]}),"\n",(0,l.jsxs)(n.p,{children:["The size of the roll pointer, as ",(0,l.jsx)(n.code,{children:"[width, height]"})," in pixels."]}),"\n",(0,l.jsx)(n.h3,{id:"showarc",children:"showArc"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"showArc"}),": ",(0,l.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"Whether to render the roll arc."}),"\n",(0,l.jsx)(n.h3,{id:"slipskidindicatorheight",children:"slipSkidIndicatorHeight"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"slipSkidIndicatorHeight"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The height of the slip/skid indicator, in pixels."}),"\n",(0,l.jsx)(n.h3,{id:"slipskidindicatoroffset",children:"slipSkidIndicatorOffset"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"slipSkidIndicatorOffset"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The offset of the slip/skid indicator from the roll pointer, in pixels. Values less than 0 will be clamped to 0."}),"\n",(0,l.jsx)(n.h3,{id:"slipskidindicatortranslatescale",children:"slipSkidIndicatorTranslateScale"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"slipSkidIndicatorTranslateScale"}),": ",(0,l.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"The amount to translate the slip/skid indicator, in pixels, at full deflection."}),"\n",(0,l.jsx)(n.h2,{id:"defined-in",children:"Defined in"}),"\n",(0,l.jsx)(n.p,{children:"src/garminsdk/components/nextgenpfd/horizon/RollIndicator.tsx:12"})]})}function h(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,l.jsx)(n,{...e,children:(0,l.jsx)(a,{...e})}):a(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return t},a:function(){return o}});var r=i(667294);let l={},s=r.createContext(l);function o(e){let n=r.useContext(s);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(l):e.components||l:o(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);