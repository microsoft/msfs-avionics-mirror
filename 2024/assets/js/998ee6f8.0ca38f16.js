"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["408060"],{535112:function(e,n,s){s.r(n),s.d(n,{metadata:()=>i,contentTitle:()=>d,default:()=>o,assets:()=>c,toc:()=>h,frontMatter:()=>l});var i=JSON.parse('{"id":"api/framework/classes/BacklightLevelController","title":"Class: BacklightLevelController","description":"A controller for automated backlighting levels based upon the angle of the sun in the sky.","source":"@site/docs/api/framework/classes/BacklightLevelController.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/BacklightLevelController","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/BacklightLevelController","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"AvionicsPlugin","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/AvionicsPlugin"},"next":{"title":"BaseInstrumentPublisher","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/BaseInstrumentPublisher"}}'),r=s("785893"),t=s("250065");let l={},d="Class: BacklightLevelController",c={},h=[{value:"Constructors",id:"constructors",level:2},{value:"new BacklightLevelController()",id:"new-backlightlevelcontroller",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"intensity",id:"intensity",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Accessors",id:"accessors",level:2},{value:"autoMaxIntensity",id:"automaxintensity",level:3},{value:"Get Signature",id:"get-signature",level:4},{value:"Returns",id:"returns-1",level:5},{value:"Set Signature",id:"set-signature",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Defined in",id:"defined-in-2",level:4},{value:"autoMinIntensity",id:"autominintensity",level:3},{value:"Get Signature",id:"get-signature-1",level:4},{value:"Returns",id:"returns-3",level:5},{value:"Set Signature",id:"set-signature-1",level:4},{value:"Parameters",id:"parameters-2",level:5},{value:"Returns",id:"returns-4",level:5},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"setPaused()",id:"setpaused",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-4",level:4}];function a(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,t.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"class-backlightlevelcontroller",children:"Class: BacklightLevelController"})}),"\n",(0,r.jsx)(n.p,{children:"A controller for automated backlighting levels based upon the angle of the sun in the sky."}),"\n",(0,r.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(n.h3,{id:"new-backlightlevelcontroller",children:"new BacklightLevelController()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"new BacklightLevelController"}),"(",(0,r.jsx)(n.code,{children:"bus"}),", ",(0,r.jsx)(n.code,{children:"paused"}),", ",(0,r.jsx)(n.code,{children:"minIntensity"}),", ",(0,r.jsx)(n.code,{children:"maxIntensity"}),"): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BacklightLevelController",children:(0,r.jsx)(n.code,{children:"BacklightLevelController"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Creates an automatic backlight controller."}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Default value"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"bus"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/EventBus",children:(0,r.jsx)(n.code,{children:"EventBus"})})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"undefined"})}),(0,r.jsx)(n.td,{children:"The event bus."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"paused"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"boolean"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"false"})}),(0,r.jsxs)(n.td,{children:["Whether the controller should be initially paused. Defaults to ",(0,r.jsx)(n.code,{children:"false"}),"."]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"minIntensity"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"BacklightLevelController.DEFAULT_MIN_INTENSITY"})}),(0,r.jsx)(n.td,{children:"The maximum intensity commanded by the controller. Defaults to 0."})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"maxIntensity"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"BacklightLevelController.DEFAULT_MAX_INTENSITY"})}),(0,r.jsx)(n.td,{children:"The minimum intensity commanded by the controller. Defaults to 1."})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/BacklightLevelController",children:(0,r.jsx)(n.code,{children:"BacklightLevelController"})})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/controllers/Backlight.ts:60"}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"intensity",children:"intensity"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"intensity"}),": ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Subscribable",children:(0,r.jsx)(n.code,{children:"Subscribable"})}),"<",(0,r.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The automatic backlight intensity computed by this controller."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/controllers/Backlight.ts:51"}),"\n",(0,r.jsx)(n.h2,{id:"accessors",children:"Accessors"}),"\n",(0,r.jsx)(n.h3,{id:"automaxintensity",children:"autoMaxIntensity"}),"\n",(0,r.jsx)(n.h4,{id:"get-signature",children:"Get Signature"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"get"})," ",(0,r.jsx)(n.strong,{children:"autoMaxIntensity"}),"(): ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Get the max auto intensity value"}),"\n",(0,r.jsx)(n.h5,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"number"})}),"\n",(0,r.jsx)(n.p,{children:"The maximum intensity applied by the auto backlight."}),"\n",(0,r.jsx)(n.h4,{id:"set-signature",children:"Set Signature"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"set"})," ",(0,r.jsx)(n.strong,{children:"autoMaxIntensity"}),"(",(0,r.jsx)(n.code,{children:"max_intensity"}),"): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Set the max auto intensity value."}),"\n",(0,r.jsx)(n.h5,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"max_intensity"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})}),(0,r.jsx)(n.td,{children:"The maximum intensity applied by auto backlight."})]})})]}),"\n",(0,r.jsx)(n.h5,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/controllers/Backlight.ts:82"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"autominintensity",children:"autoMinIntensity"}),"\n",(0,r.jsx)(n.h4,{id:"get-signature-1",children:"Get Signature"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"get"})," ",(0,r.jsx)(n.strong,{children:"autoMinIntensity"}),"(): ",(0,r.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Get the min auto intensity value"}),"\n",(0,r.jsx)(n.h5,{id:"returns-3",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"number"})}),"\n",(0,r.jsx)(n.p,{children:"THe minimum intensity applied by the auto backlight."}),"\n",(0,r.jsx)(n.h4,{id:"set-signature-1",children:"Set Signature"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"set"})," ",(0,r.jsx)(n.strong,{children:"autoMinIntensity"}),"(",(0,r.jsx)(n.code,{children:"min_intensity"}),"): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Set the min auto intensity value."}),"\n",(0,r.jsx)(n.h5,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"min_intensity"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"number"})}),(0,r.jsx)(n.td,{children:"The minimum intensity applied by the auto backlight."})]})})]}),"\n",(0,r.jsx)(n.h5,{id:"returns-4",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/controllers/Backlight.ts:99"}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"setpaused",children:"setPaused()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"setPaused"}),"(",(0,r.jsx)(n.code,{children:"paused"}),"): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Pause or unpause real-time processing."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"paused"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"boolean"})}),(0,r.jsx)(n.td,{children:"Whether to pause or not."})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/sdk/utils/controllers/Backlight.ts:116"})]})}function o(e={}){let{wrapper:n}={...(0,t.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(a,{...e})}):a(e)}},250065:function(e,n,s){s.d(n,{Z:function(){return d},a:function(){return l}});var i=s(667294);let r={},t=i.createContext(r);function l(e){let n=i.useContext(t);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),i.createElement(t.Provider,{value:n},e.children)}}}]);