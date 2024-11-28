"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["385558"],{382980:function(e,n,i){i.r(n),i.d(n,{metadata:()=>s,contentTitle:()=>d,default:()=>a,assets:()=>c,toc:()=>l,frontMatter:()=>t});var s=JSON.parse('{"id":"api/framework/type-aliases/NumberFormatterOptions","title":"Type Alias: NumberFormatterOptions","description":"NumberFormatterOptions: object","source":"@site/docs/api/framework/type-aliases/NumberFormatterOptions.md","sourceDirName":"api/framework/type-aliases","slug":"/api/framework/type-aliases/NumberFormatterOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/NumberFormatterOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"NodeInstance","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/NodeInstance"},"next":{"title":"NumberToRangeUnion","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/NumberToRangeUnion"}}'),r=i("785893"),o=i("250065");let t={},d="Type Alias: NumberFormatterOptions",c={},l=[{value:"Type declaration",id:"type-declaration",level:2},{value:"cache?",id:"cache",level:3},{value:"forceDecimalZeroes?",id:"forcedecimalzeroes",level:3},{value:"forceSign?",id:"forcesign",level:3},{value:"hideSign?",id:"hidesign",level:3},{value:"hysteresis?",id:"hysteresis",level:3},{value:"maxDigits?",id:"maxdigits",level:3},{value:"nanString?",id:"nanstring",level:3},{value:"negInfinityString?",id:"neginfinitystring",level:3},{value:"pad?",id:"pad",level:3},{value:"posInfinityString?",id:"posinfinitystring",level:3},{value:"precision?",id:"precision",level:3},{value:"round?",id:"round",level:3},{value:"showCommas?",id:"showcommas",level:3},{value:"useMinusSign?",id:"useminussign",level:3},{value:"Defined in",id:"defined-in",level:2}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",strong:"strong",...(0,o.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"type-alias-numberformatteroptions",children:"Type Alias: NumberFormatterOptions"})}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"NumberFormatterOptions"}),": ",(0,r.jsx)(n.code,{children:"object"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Options for creating a number formatter."}),"\n",(0,r.jsx)(n.h2,{id:"type-declaration",children:"Type declaration"}),"\n",(0,r.jsx)(n.h3,{id:"cache",children:"cache?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"cache"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Whether to cache and reuse the previously generated string when possible. If a non-zero hysteresis value is\nspecified, then this option is ignored because hysteresis always requires cached values to be used. Defaults to\n",(0,r.jsx)(n.code,{children:"false"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"forcedecimalzeroes",children:"forceDecimalZeroes?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"forceDecimalZeroes"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Whether to force trailing zeroes to the right of the decimal point. The number of trailing zeroes is determined\nby the ",(0,r.jsx)(n.code,{children:"precision"})," option. Specifically, trailing zeroes are added to the least significant decimal place required\nto represent the value of ",(0,r.jsx)(n.code,{children:"precision"})," (and therefore, any possible output rounded to ",(0,r.jsx)(n.code,{children:"precision"}),") with no\nrounding. Defaults to ",(0,r.jsx)(n.code,{children:"true"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"forcesign",children:"forceSign?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"forceSign"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Whether to force the display of a positive sign. Ignored if ",(0,r.jsx)(n.code,{children:"hideSign"})," is ",(0,r.jsx)(n.code,{children:"true"}),". Defaults to ",(0,r.jsx)(n.code,{children:"false"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"hidesign",children:"hideSign?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"hideSign"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Whether to hide the display of the positive/negative sign. Overrides ",(0,r.jsx)(n.code,{children:"forceSign"}),". Defaults to ",(0,r.jsx)(n.code,{children:"false"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"hysteresis",children:"hysteresis?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"hysteresis"}),": ",(0,r.jsx)(n.code,{children:"number"})," | readonly [",(0,r.jsx)(n.code,{children:"number"}),", ",(0,r.jsx)(n.code,{children:"number"}),"]"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The hysteresis to apply to the formatter. If defined as a ",(0,r.jsx)(n.code,{children:"[number, number]"})," tuple, then the first number in the\ntuple is taken as the lower hysteresis and second number as the upper hysteresis. If defined as a single number,\nthen that is taken as both the lower and upper hysteresis. Negative values are clamped to zero."]}),"\n",(0,r.jsxs)(n.p,{children:["When a previously formatted string exists, any new input number (",(0,r.jsx)(n.code,{children:"x"}),") is compared to the precision-rounded value\nof the previously formatted string (",(0,r.jsx)(n.code,{children:"x0"}),"). Define ",(0,r.jsx)(n.code,{children:"x1"})," as the least number that can be rounded to ",(0,r.jsx)(n.code,{children:"x0"})," and ",(0,r.jsx)(n.code,{children:"x2"})," as\nthe greatest number that can be rounded to ",(0,r.jsx)(n.code,{children:"x0"}),". Then the formatter returns a newly formatted string for ",(0,r.jsx)(n.code,{children:"x"})," if\nand only if ",(0,r.jsx)(n.code,{children:"x < x1 - h1"})," or ",(0,r.jsx)(n.code,{children:"x > x2 + h2"}),", where ",(0,r.jsx)(n.code,{children:"h1"})," and ",(0,r.jsx)(n.code,{children:"h2"})," are the lower and upper hysteresis values,\nrespectively. Otherwise, the formatter returns the previously formatted string."]}),"\n",(0,r.jsx)(n.h3,{id:"maxdigits",children:"maxDigits?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"maxDigits"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The maximum number of digits to enforce. Digits to the ",(0,r.jsx)(n.em,{children:"right"})," of the decimal point will be omitted (with proper\nrounding behavior) as necessary until the total number of digits in the output is less than or equal to the value\nof this option or until there are no more digits to omit. Digits to the ",(0,r.jsx)(n.em,{children:"left"})," of the decimal point are always\npreserved, even if it means the number of digits in the output will exceed the value of this option. Defaults to\n",(0,r.jsx)(n.code,{children:"Infinity"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"nanstring",children:"nanString?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"nanString"}),": ",(0,r.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The string to output for an input of ",(0,r.jsx)(n.code,{children:"NaN"}),". Defaults to ",(0,r.jsx)(n.code,{children:"'NaN'"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"neginfinitystring",children:"negInfinityString?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"negInfinityString"}),": ",(0,r.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The string to output for an input of ",(0,r.jsx)(n.code,{children:"-Infinity"}),". Defaults to ",(0,r.jsx)(n.code,{children:"'-Infinity'"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"pad",children:"pad?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"pad"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The number of digits to which to pad with zeroes to the left of the decimal point. Defaults to ",(0,r.jsx)(n.code,{children:"1"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"posinfinitystring",children:"posInfinityString?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"posInfinityString"}),": ",(0,r.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The string to output for an input of ",(0,r.jsx)(n.code,{children:"Infinity"}),". Defaults to ",(0,r.jsx)(n.code,{children:"'Infinity'"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"precision",children:"precision?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"precision"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The precision to which to round the number. A value of 0 denotes no rounding. Defaults to ",(0,r.jsx)(n.code,{children:"0"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"round",children:"round?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"round"}),": ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/Rounding",children:(0,r.jsx)(n.code,{children:"Rounding"})})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Rounding behavior. Defaults to ",(0,r.jsx)(n.code,{children:"Rounding.Nearest"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"showcommas",children:"showCommas?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"showCommas"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Whether to show commas. Defaults to ",(0,r.jsx)(n.code,{children:"false"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"useminussign",children:"useMinusSign?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"useMinusSign"}),": ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Whether to use a minus sign (",(0,r.jsx)(n.code,{children:"\u2212"}),") in place of a dash (",(0,r.jsx)(n.code,{children:"-"}),") in front of negative numbers. Defaults to ",(0,r.jsx)(n.code,{children:"false"}),"."]}),"\n",(0,r.jsx)(n.h2,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/graphics/text/NumberFormatter.ts:6"})]})}function a(e={}){let{wrapper:n}={...(0,o.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return d},a:function(){return t}});var s=i(667294);let r={},o=s.createContext(r);function t(e){let n=s.useContext(o);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:t(e.components),s.createElement(o.Provider,{value:n},e.children)}}}]);