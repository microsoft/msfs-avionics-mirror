"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["585683"],{583499:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>o,default:()=>a,assets:()=>l,toc:()=>c,frontMatter:()=>t});var r=JSON.parse('{"id":"api/garminsdk/interfaces/SoftKeyProps","title":"Interface: SoftKeyProps","description":"Component props for SoftKey.","source":"@site/docs/api/garminsdk/interfaces/SoftKeyProps.md","sourceDirName":"api/garminsdk/interfaces","slug":"/api/garminsdk/interfaces/SoftKeyProps","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/SoftKeyProps","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"SoftKeyMenuItem","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/SoftKeyMenuItem"},"next":{"title":"SyntheticVisionProps","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/SyntheticVisionProps"}}'),s=i("785893"),d=i("250065");let t={},o="Interface: SoftKeyProps",l={},c=[{value:"Extends",id:"extends",level:2},{value:"Properties",id:"properties",level:2},{value:"children?",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"class?",id:"class",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"menuItem",id:"menuitem",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"pressedDuration?",id:"pressedduration",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"ref?",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-4",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...(0,d.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"interface-softkeyprops",children:"Interface: SoftKeyProps"})}),"\n",(0,s.jsx)(n.p,{children:"Component props for SoftKey."}),"\n",(0,s.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"ComponentProps"})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"children",children:"children?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"children"}),": ",(0,s.jsx)(n.code,{children:"DisplayChildren"}),"[]"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The children of the display component."}),"\n",(0,s.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"ComponentProps.children"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:122"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"class",children:"class?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"class"}),": ",(0,s.jsx)(n.code,{children:"string"})," | ",(0,s.jsx)(n.code,{children:"SubscribableSet"}),"<",(0,s.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"CSS class(es) to apply to the softkey's root element."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/softkey/SoftKey.tsx:20"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"menuitem",children:"menuItem"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"menuItem"}),": ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"null"})," | ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/SoftKeyMenuItem",children:(0,s.jsx)(n.code,{children:"SoftKeyMenuItem"})}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The menu item to bind to the softkey."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/softkey/SoftKey.tsx:11"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"pressedduration",children:"pressedDuration?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"pressedDuration"}),": ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The amount of time, in milliseconds, to display the softkey pressed animation after the softkey has been pressed.\nDefaults to SoftKey.DEFAULT_PRESSED_DURATION."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/garminsdk/softkey/SoftKey.tsx:17"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"ref",children:"ref?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"ref"}),": ",(0,s.jsx)(n.code,{children:"NodeReference"}),"<",(0,s.jsx)(n.code,{children:"any"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"A reference to the display component."}),"\n",(0,s.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"ComponentProps.ref"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:125"})]})}function a(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return o},a:function(){return t}});var r=i(667294);let s={},d=r.createContext(s);function t(e){let n=r.useContext(d);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:t(e.components),r.createElement(d.Provider,{value:n},e.children)}}}]);