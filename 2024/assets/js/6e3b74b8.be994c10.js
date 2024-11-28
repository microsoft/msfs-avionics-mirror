"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["319714"],{539897:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>l,default:()=>a,assets:()=>c,toc:()=>o,frontMatter:()=>t});var r=JSON.parse('{"id":"api/g3000gtc/interfaces/NumberInputProps","title":"Interface: NumberInputProps","description":"Component props for NumberInput.","source":"@site/docs/api/g3000gtc/interfaces/NumberInputProps.md","sourceDirName":"api/g3000gtc/interfaces","slug":"/api/g3000gtc/interfaces/NumberInputProps","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000gtc/interfaces/NumberInputProps","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"LabelBarProps","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000gtc/interfaces/LabelBarProps"},"next":{"title":"NumberPadProps","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000gtc/interfaces/NumberPadProps"}}'),s=i("785893"),d=i("250065");let t={},l="Interface: NumberInputProps",c={},o=[{value:"Extends",id:"extends",level:2},{value:"Properties",id:"properties",level:2},{value:"allowBackFill",id:"allowbackfill",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"canShiftForBackfill()?",id:"canshiftforbackfill",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"children?",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"class?",id:"class",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"digitizeValue()",id:"digitizevalue",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"initialEditIndex?",id:"initialeditindex",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"ref?",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"renderInactiveValue?",id:"renderinactivevalue",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"value",id:"value",level:3},{value:"Defined in",id:"defined-in-8",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"interface-numberinputprops",children:"Interface: NumberInputProps"})}),"\n",(0,s.jsx)(n.p,{children:"Component props for NumberInput."}),"\n",(0,s.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"ComponentProps"})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"allowbackfill",children:"allowBackFill"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"allowBackFill"}),": ",(0,s.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["Whether to allow backfill of character positions. If ",(0,s.jsx)(n.code,{children:"true"}),", when directly inserting values into the last\ncharacter position, any existing values will be shifted to the left as long as there are empty positions to\naccommodate them."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Components/NumberInput/NumberInput.tsx:46"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"canshiftforbackfill",children:"canShiftForBackfill()?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"canShiftForBackfill"}),": (",(0,s.jsx)(n.code,{children:"char"}),", ",(0,s.jsx)(n.code,{children:"slot"}),") => ",(0,s.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["Checks whether the designated character slot into which characters will shift during a backfill operation can\naccept shifted characters. Ignored if ",(0,s.jsx)(n.code,{children:"allowBackFill"})," is ",(0,s.jsx)(n.code,{children:"false"}),". If not defined, the designated character slot\nwill accept shifted characters if and only if its current character value is ",(0,s.jsx)(n.code,{children:"null"})," or ",(0,s.jsx)(n.code,{children:"'0'"}),"."]}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"char"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"null"})," | ",(0,s.jsx)(n.code,{children:"string"})]}),(0,s.jsx)(n.td,{children:"The current character in the designated character slot."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"slot"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000gtc/interfaces/CursorInputSlot",children:(0,s.jsx)(n.code,{children:"CursorInputSlot"})}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),(0,s.jsx)(n.td,{children:"The designated character slot's parent input slot."})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"boolean"})}),"\n",(0,s.jsx)(n.p,{children:"Whether the designated character slot into which characters will shift during a backfill operation can\naccept shifted characters."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Components/NumberInput/NumberInput.tsx:57"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"children",children:"children?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"children"}),": ",(0,s.jsx)(n.code,{children:"DisplayChildren"}),"[]"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The children of the display component."}),"\n",(0,s.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"ComponentProps.children"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"sdk/components/FSComponent.ts:122"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"class",children:"class?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"class"}),": ",(0,s.jsx)(n.code,{children:"string"})," | ",(0,s.jsx)(n.code,{children:"ToggleableClassNameRecord"})," | ",(0,s.jsx)(n.code,{children:"SubscribableSet"}),"<",(0,s.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"CSS class(es) to apply to the root of the component."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Components/NumberInput/NumberInput.tsx:73"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"digitizevalue",children:"digitizeValue()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"digitizeValue"}),": (",(0,s.jsx)(n.code,{children:"value"}),", ",(0,s.jsx)(n.code,{children:"setSignValues"}),", ",(0,s.jsx)(n.code,{children:"setDigitValues"}),", ",(0,s.jsx)(n.code,{children:"signValues"}),", ",(0,s.jsx)(n.code,{children:"digitValues"}),") => ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A function which assigns values to individual sign and digit slots based on a composite value."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"value"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:"A composite value."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"setSignValues"})}),(0,s.jsxs)(n.td,{children:["readonly (",(0,s.jsx)(n.code,{children:"value"}),") => ",(0,s.jsx)(n.code,{children:"void"}),"[]"]}),(0,s.jsx)(n.td,{children:"An array of functions which set the values of the input's individual sign slots. The order of the functions is the same as order of their associated sign slots in the input (from left to right)."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"setDigitValues"})}),(0,s.jsxs)(n.td,{children:["readonly (",(0,s.jsx)(n.code,{children:"value"}),", ",(0,s.jsx)(n.code,{children:"unscaled"}),"?) => ",(0,s.jsx)(n.code,{children:"void"}),"[]"]}),(0,s.jsx)(n.td,{children:"An array of functions which set the values of the input's individual digit slots. The order of the functions is the same as order of their associated digit slots in the input (from left to right)."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"signValues"})}),(0,s.jsxs)(n.td,{children:["readonly (",(0,s.jsx)(n.code,{children:"-1"})," | ",(0,s.jsx)(n.code,{children:"1"}),")[]"]}),(0,s.jsx)(n.td,{children:"An array containing the current values of the input's individual sign slots. The order of the values is the same as the order of the sign slots in the input (from left to right)."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"digitValues"})}),(0,s.jsxs)(n.td,{children:["readonly ",(0,s.jsx)(n.code,{children:"number"}),"[]"]}),(0,s.jsx)(n.td,{children:"An array containing the current values of the input's individual digit slots. The order of the values is the same as the order of the digit slots in the input (from left to right)."})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Components/NumberInput/NumberInput.tsx:33"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"initialeditindex",children:"initialEditIndex?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"initialEditIndex"}),": ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The character index to initially select with the cursor when editing is activated. If not defined, the initial\nindex will default to the last index if backfill is allowed and cursor selection is in per-character mode, or\nthe first index (",(0,s.jsx)(n.code,{children:"0"}),") otherwise."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Components/NumberInput/NumberInput.tsx:64"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"ref",children:"ref?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"ref"}),": ",(0,s.jsx)(n.code,{children:"NodeReference"}),"<",(0,s.jsx)(n.code,{children:"any"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A reference to the display component."}),"\n",(0,s.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"ComponentProps.ref"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"sdk/components/FSComponent.ts:125"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"renderinactivevalue",children:"renderInactiveValue?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"renderInactiveValue"}),": ",(0,s.jsx)(n.code,{children:"VNode"})," | (",(0,s.jsx)(n.code,{children:"value"}),") => ",(0,s.jsx)(n.code,{children:"string"})," | ",(0,s.jsx)(n.code,{children:"VNode"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A function or VNode which renders the input's value when editing is not active. If defined, the rendered\ninactive value replaces all rendered child components when editing is not active."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Components/NumberInput/NumberInput.tsx:70"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"value",children:"value"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"value"}),": ",(0,s.jsx)(n.code,{children:"MutableSubscribable"}),"<",(0,s.jsx)(n.code,{children:"number"}),", ",(0,s.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A mutable subscribable to bind to the input's composite value. The binding is one-way: changes in the input value\nwill be piped to the subscribable, but changes in the subscribable's value will not trigger any changes to the\ninput."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-g3000/html_ui/GTC/Components/NumberInput/NumberInput.tsx:19"})]})}function a(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return l},a:function(){return t}});var r=i(667294);let s={},d=r.createContext(s);function t(e){let n=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:t(e.components),r.createElement(d.Provider,{value:n},e.children)}}}]);