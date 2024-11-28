"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["862127"],{567399:function(e,n,r){r.r(n),r.d(n,{metadata:()=>i,contentTitle:()=>o,default:()=>h,assets:()=>l,toc:()=>t,frontMatter:()=>c});var i=JSON.parse('{"id":"api/framework/type-aliases/APBackCourseDirectorNavData","title":"Type Alias: APBackCourseDirectorNavData","description":"APBackCourseDirectorNavData: object","source":"@site/docs/api/framework/type-aliases/APBackCourseDirectorNavData.md","sourceDirName":"api/framework/type-aliases","slug":"/api/framework/type-aliases/APBackCourseDirectorNavData","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/APBackCourseDirectorNavData","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"APBackCourseDirectorInterceptFunc","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/APBackCourseDirectorInterceptFunc"},"next":{"title":"APBackCourseDirectorOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/APBackCourseDirectorOptions"}}'),s=r("785893"),a=r("250065");let c={},o="Type Alias: APBackCourseDirectorNavData",l={},t=[{value:"Type declaration",id:"type-declaration",level:2},{value:"deviation",id:"deviation",level:3},{value:"frequency",id:"frequency",level:3},{value:"hasLoc",id:"hasloc",level:3},{value:"hasNav",id:"hasnav",level:3},{value:"locCourse",id:"loccourse",level:3},{value:"navSource",id:"navsource",level:3},{value:"signal",id:"signal",level:3},{value:"Defined in",id:"defined-in",level:2}];function d(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",strong:"strong",...(0,a.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"type-alias-apbackcoursedirectornavdata",children:"Type Alias: APBackCourseDirectorNavData"})}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"APBackCourseDirectorNavData"}),": ",(0,s.jsx)(n.code,{children:"object"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["Radio navigation data received by a ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/APBackCourseDirector",children:"APBackCourseDirector"}),"."]}),"\n",(0,s.jsx)(n.h2,{id:"type-declaration",children:"Type declaration"}),"\n",(0,s.jsx)(n.h3,{id:"deviation",children:"deviation"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"deviation"}),": ",(0,s.jsx)(n.code,{children:"number"})," | ",(0,s.jsx)(n.code,{children:"null"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The lateral deviation, in the range ",(0,s.jsx)(n.code,{children:"[-1, 1]"}),". Positive values indicate deviation of the airplane to the left of\ncourse. If a lateral deviation signal is not being received, then this value is ",(0,s.jsx)(n.code,{children:"null"}),"."]}),"\n",(0,s.jsx)(n.h3,{id:"frequency",children:"frequency"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"frequency"}),": ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The frequency on which the data was received, in megahertz, or ",(0,s.jsx)(n.code,{children:"0"})," if no data is received."]}),"\n",(0,s.jsx)(n.h3,{id:"hasloc",children:"hasLoc"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"hasLoc"}),": ",(0,s.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Whether a localizer signal is being received."}),"\n",(0,s.jsx)(n.h3,{id:"hasnav",children:"hasNav"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"hasNav"}),": ",(0,s.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Whether a lateral deviation signal is being received."}),"\n",(0,s.jsx)(n.h3,{id:"loccourse",children:"locCourse"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"locCourse"}),": ",(0,s.jsx)(n.code,{children:"number"})," | ",(0,s.jsx)(n.code,{children:"null"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The magnetic course of the received localizer signal, in degrees. If a localizer signal is not being received,\nthen this value is ",(0,s.jsx)(n.code,{children:"null"}),"."]}),"\n",(0,s.jsx)(n.h3,{id:"navsource",children:"navSource"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"navSource"}),": ",(0,s.jsx)(n.code,{children:"Readonly"}),"<",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/NavSourceId",children:(0,s.jsx)(n.code,{children:"NavSourceId"})}),">"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The CDI source of the data. An index of ",(0,s.jsx)(n.code,{children:"0"})," indicates no data is received."]}),"\n",(0,s.jsx)(n.h3,{id:"signal",children:"signal"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"signal"}),": ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The signal strength."}),"\n",(0,s.jsx)(n.h2,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"src/sdk/autopilot/directors/APBackCourseDirector.ts:19"})]})}function h(e={}){let{wrapper:n}={...(0,a.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return o},a:function(){return c}});var i=r(667294);let s={},a=i.createContext(s);function c(e){let n=i.useContext(a);return i.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:c(e.components),i.createElement(a.Provider,{value:n},e.children)}}}]);