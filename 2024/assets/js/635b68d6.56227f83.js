"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["570859"],{282505:function(e,n,r){r.r(n),r.d(n,{metadata:()=>i,contentTitle:()=>a,default:()=>o,assets:()=>c,toc:()=>l,frontMatter:()=>t});var i=JSON.parse('{"id":"api/g3xtouchcommon/classes/MfdMainPageRegistrar","title":"Class: MfdMainPageRegistrar","description":"A record of registered MFD main pages.","source":"@site/docs/api/g3xtouchcommon/classes/MfdMainPageRegistrar.md","sourceDirName":"api/g3xtouchcommon/classes","slug":"/api/g3xtouchcommon/classes/MfdMainPageRegistrar","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/MfdMainPageRegistrar","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"MfdInfoPage","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/MfdInfoPage"},"next":{"title":"MfdMainView","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/MfdMainView"}}'),s=r("785893"),d=r("250065");let t={},a="Class: MfdMainPageRegistrar",c={},l=[{value:"Constructors",id:"constructors",level:2},{value:"new MfdMainPageRegistrar()",id:"new-mfdmainpageregistrar",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"getRegisteredPagesArray()",id:"getregisteredpagesarray",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"isPageRegistered()",id:"ispageregistered",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"registerPage()",id:"registerpage",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"unregisterPage()",id:"unregisterpage",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-3",level:4}];function h(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"class-mfdmainpageregistrar",children:"Class: MfdMainPageRegistrar"})}),"\n",(0,s.jsx)(n.p,{children:"A record of registered MFD main pages."}),"\n",(0,s.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,s.jsx)(n.h3,{id:"new-mfdmainpageregistrar",children:"new MfdMainPageRegistrar()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"new MfdMainPageRegistrar"}),"(): ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/MfdMainPageRegistrar",children:(0,s.jsx)(n.code,{children:"MfdMainPageRegistrar"})})]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/MfdMainPageRegistrar",children:(0,s.jsx)(n.code,{children:"MfdMainPageRegistrar"})})}),"\n",(0,s.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(n.h3,{id:"getregisteredpagesarray",children:"getRegisteredPagesArray()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"getRegisteredPagesArray"}),"(): ",(0,s.jsx)(n.code,{children:"Readonly"}),"<",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/type-aliases/MfdPageDefinition",children:(0,s.jsx)(n.code,{children:"MfdPageDefinition"})}),">[]"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["Gets an array of page definitions registered with this registrar, in ascending order according to the values of\ntheir ",(0,s.jsx)(n.code,{children:"order"})," properties."]}),"\n",(0,s.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"Readonly"}),"<",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/type-aliases/MfdPageDefinition",children:(0,s.jsx)(n.code,{children:"MfdPageDefinition"})}),">[]"]}),"\n",(0,s.jsxs)(n.p,{children:["An array of page definitions registered with this registrar, in ascending order according to the values\nof their ",(0,s.jsx)(n.code,{children:"order"})," properties."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/MFD/MainView/MfdMainPageRegistrar.ts:46"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"ispageregistered",children:"isPageRegistered()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"isPageRegistered"}),"(",(0,s.jsx)(n.code,{children:"key"}),"): ",(0,s.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Checks if a page is registered with a given key."}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"key"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"string"})}),(0,s.jsx)(n.td,{children:"The key to check."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"boolean"})}),"\n",(0,s.jsx)(n.p,{children:"Whether a page is registered with the specified key."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/MFD/MainView/MfdMainPageRegistrar.ts:18"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"registerpage",children:"registerPage()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"registerPage"}),"(",(0,s.jsx)(n.code,{children:"pageDef"}),"): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Registers an MFD main page. Registering a page with an existing key will replace the old page registered under\nthat key."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"pageDef"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"Readonly"}),"<",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/type-aliases/MfdPageDefinition",children:(0,s.jsx)(n.code,{children:"MfdPageDefinition"})}),">"]}),(0,s.jsx)(n.td,{children:"The definition of the page to register."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/MFD/MainView/MfdMainPageRegistrar.ts:27"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"unregisterpage",children:"unregisterPage()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"unregisterPage"}),"(",(0,s.jsx)(n.code,{children:"key"}),"): ",(0,s.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Unregisters an MFD main page."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"key"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"string"})}),(0,s.jsx)(n.td,{children:"The key of the page to unregister."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"boolean"})}),"\n",(0,s.jsx)(n.p,{children:"Whether the page with the specified key was successfully unregistered."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/MFD/MainView/MfdMainPageRegistrar.ts:36"})]})}function o(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return a},a:function(){return t}});var i=r(667294);let s={},d=i.createContext(s);function t(e){let n=i.useContext(d);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:t(e.components),i.createElement(d.Provider,{value:n},e.children)}}}]);