"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["609784"],{936559:function(e,n,s){s.r(n),s.d(n,{metadata:()=>r,contentTitle:()=>c,default:()=>a,assets:()=>l,toc:()=>o,frontMatter:()=>i});var r=JSON.parse('{"id":"api/epic2shared/classes/InputHEventHandler","title":"Class: InputHEventHandler","description":"Handles HEvents from the TSC keyboard.","source":"@site/docs/api/epic2shared/classes/InputHEventHandler.md","sourceDirName":"api/epic2shared/classes","slug":"/api/epic2shared/classes/InputHEventHandler","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/InputHEventHandler","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"InputFocusManager","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/InputFocusManager"},"next":{"title":"KeyboardInputButton","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/KeyboardInputButton"}}'),d=s("785893"),t=s("250065");let i={},c="Class: InputHEventHandler",l={},o=[{value:"Constructors",id:"constructors",level:2},{value:"new InputHEventHandler()",id:"new-inputheventhandler",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"TSC_KEYBOARD_H_EVENT_REGEX",id:"tsc_keyboard_h_event_regex",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"sendToTscKeyboard()",id:"sendtotsckeyboard",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-3",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,t.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"class-inputheventhandler",children:"Class: InputHEventHandler"})}),"\n",(0,d.jsx)(n.p,{children:"Handles HEvents from the TSC keyboard."}),"\n",(0,d.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(n.h3,{id:"new-inputheventhandler",children:"new InputHEventHandler()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"new InputHEventHandler"}),"(",(0,d.jsx)(n.code,{children:"bus"}),", ",(0,d.jsx)(n.code,{children:"isActive"}),", ",(0,d.jsx)(n.code,{children:"inputRef"}),"): ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/InputHEventHandler",children:(0,d.jsx)(n.code,{children:"InputHEventHandler"})})]}),"\n"]}),"\n",(0,d.jsxs)(n.p,{children:["The constructor of ",(0,d.jsx)(n.code,{children:"InputHEventHandler"}),"."]}),"\n",(0,d.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"bus"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"EventBus"})}),(0,d.jsx)(n.td,{children:"An instance of the EventBus."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"isActive"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"boolean"}),">"]}),(0,d.jsxs)(n.td,{children:["Whether the ",(0,d.jsx)(n.code,{children:"InputBox"})," owning this ",(0,d.jsx)(n.code,{children:"InputHEventHandler"})," is being active."]})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"inputRef"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"NodeReference"}),"<",(0,d.jsx)(n.code,{children:"HTMLInputElement"}),">"]}),(0,d.jsxs)(n.td,{children:["The ",(0,d.jsx)(n.code,{children:"ref"})," to the input element."]})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/InputHEventHandler",children:(0,d.jsx)(n.code,{children:"InputHEventHandler"})})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/Inputs/InputHEventHandler.ts:21"}),"\n",(0,d.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(n.h3,{id:"tsc_keyboard_h_event_regex",children:"TSC_KEYBOARD_H_EVENT_REGEX"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"readonly"})," ",(0,d.jsx)(n.code,{children:"static"})," ",(0,d.jsx)(n.strong,{children:"TSC_KEYBOARD_H_EVENT_REGEX"}),": ",(0,d.jsx)(n.code,{children:"RegExp"})]}),"\n"]}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/Inputs/InputHEventHandler.ts:7"}),"\n",(0,d.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"destroy"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsxs)(n.p,{children:["Destroys this ",(0,d.jsx)(n.code,{children:"InputHEventHandler"})," and its subscriptions."]}),"\n",(0,d.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/Inputs/InputHEventHandler.ts:160"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"sendtotsckeyboard",children:"sendToTscKeyboard()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"sendToTscKeyboard"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Sends the current input value and current cursor position to the TSC keyboard."}),"\n",(0,d.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/Inputs/InputHEventHandler.ts:154"})]})}function a(e={}){let{wrapper:n}={...(0,t.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(h,{...e})}):h(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return c},a:function(){return i}});var r=s(667294);let d={},t=r.createContext(d);function i(e){let n=r.useContext(t);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:i(e.components),r.createElement(t.Provider,{value:n},e.children)}}}]);