"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["391237"],{47317:function(e,n,t){t.r(n),t.d(n,{metadata:()=>r,contentTitle:()=>a,default:()=>h,assets:()=>d,toc:()=>c,frontMatter:()=>o});var r=JSON.parse('{"id":"g3000/instrument-setup","title":"G3000 Instrument Setup","description":"Choosing Screens","source":"@site/docs/g3000/instrument-setup.md","sourceDirName":"g3000","slug":"/g3000/instrument-setup","permalink":"/msfs-avionics-mirror/2024/docs/g3000/instrument-setup","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"sidebar_label":"Instrument Setup","sidebar_position":2},"sidebar":"sidebar","previous":{"title":"Overview","permalink":"/msfs-avionics-mirror/2024/docs/g3000/overview"},"next":{"title":"panel.xml Basics","permalink":"/msfs-avionics-mirror/2024/docs/g3000/panel-xml-basics"}}'),s=t("785893"),i=t("250065");let o={sidebar_label:"Instrument Setup",sidebar_position:2},a="G3000 Instrument Setup",d={},c=[{value:"Choosing Screens",id:"choosing-screens",level:2},{value:"<code>panel.cfg</code>",id:"panelcfg",level:2}];function l(e){let n={admonition:"admonition",code:"code",em:"em",h1:"h1",h2:"h2",header:"header",li:"li",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,i.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"g3000-instrument-setup",children:"G3000 Instrument Setup"})}),"\n",(0,s.jsx)(n.h2,{id:"choosing-screens",children:"Choosing Screens"}),"\n",(0,s.jsx)(n.p,{children:"The G3000 has three types of display screens: PFD, MFD, and GTC. Each screen is implemented as a separate JS/HTML instrument. For the system to function properly, at least one PFD and exactly one MFD must be included in an airplane. GTCs are not strictly required, but without them users will have no way of interacting with many of the features of the G3000."}),"\n",(0,s.jsx)(n.p,{children:"Up to two PFDs, one MFD, and an arbitrary number of GTCs are supported."}),"\n",(0,s.jsx)(n.admonition,{type:"note",children:(0,s.jsx)(n.p,{children:"Each additional instrument above the minimum complement carries extra performance and memory requirements. Keep this in mind when choosing which display screens to implement in your airplane."})}),"\n",(0,s.jsx)(n.h2,{id:"panelcfg",children:(0,s.jsx)(n.code,{children:"panel.cfg"})}),"\n",(0,s.jsxs)(n.p,{children:["To set up your aircraft's ",(0,s.jsx)(n.code,{children:"panel.cfg"})," for the G3000, add one VCockpit entry for each GDU (PFD or MFD) and GTC. Load the following HTML files for each type of instrument:"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["PFD: ",(0,s.jsx)(n.code,{children:"NavSystems/WTG3000v2/PFD/WTG3000_PFD.html"})]}),"\n",(0,s.jsxs)(n.li,{children:["MFD: ",(0,s.jsx)(n.code,{children:"NavSystems/WTG3000v2/MFD/WTG3000_MFD.html"})]}),"\n",(0,s.jsxs)(n.li,{children:["GTC: ",(0,s.jsx)(n.code,{children:"NavSystems/WTG3000v2/GTC/WTG3000_GTC.html"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["Each PFD and GTC instrument ",(0,s.jsx)(n.em,{children:"must"})," be indexed (even if there is only one such instrument in your aircraft). PFD instruments can have an index of 1 or 2. GTC instruments can have indexes 1, 2, 3, ... etc. The MFD instrument should not be indexed."]}),"\n",(0,s.jsx)(n.p,{children:"Each instrument should also be defined with a specific window size:"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Instrument"}),(0,s.jsx)(n.th,{children:"Width (px)"}),(0,s.jsx)(n.th,{children:"Height (px)"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"PFD"}),(0,s.jsx)(n.td,{children:"1280"}),(0,s.jsx)(n.td,{children:"800"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"MFD"}),(0,s.jsx)(n.td,{children:"1280"}),(0,s.jsx)(n.td,{children:"800"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"GTC (horizontal)"}),(0,s.jsx)(n.td,{children:"1280"}),(0,s.jsx)(n.td,{children:"768"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"GTC (vertical)"}),(0,s.jsx)(n.td,{children:"480"}),(0,s.jsx)(n.td,{children:"640"})]})]})]}),"\n",(0,s.jsx)(n.p,{children:"Here is an example of a full set of G3000 VCockpit entries, with two PFDs, one MFD, and two horizontal GTCs (note that the texture names are arbitrary; you are free to use names that are different from the ones in this example):"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"[VCockpit01]\r\nsize_mm=1280,800\r\npixel_size=1280,800\r\ntexture=PFD_L\r\nbackground_color=42,42,40\r\nhtmlgauge00=NavSystems/WTG3000v2/PFD/WTG3000_PFD.html?Index=1, 0,0,1280,800\r\n\r\n[VCockpit02]\r\nsize_mm=1280,800\r\npixel_size=1280,800\r\ntexture=PFD_R\r\nbackground_color=42,42,40\r\nhtmlgauge00=NavSystems/WTG3000v2/PFD/WTG3000_PFD.html?Index=2, 0,0,1280,800\r\n\r\n[VCockpit03]\r\nsize_mm=1280,800\r\npixel_size=1280,800\r\ntexture=MFD\r\nbackground_color=42,42,40\r\nhtmlgauge00=NavSystems/WTG3000v2/MFD/WTG3000_MFD.html, 0,0,1280,800\r\n\r\n[VCockpit04]\r\nsize_mm=1280,768\r\npixel_size=1280,768\r\ntexture=GTC_L\r\nbackground_color=42,42,40\r\nhtmlgauge00=NavSystems/WTG3000v2/GTC/WTG3000_GTC.html?Index=1, 0,0,1280,768\r\n\r\n[VCockpit05]\r\nsize_mm=1280,768\r\npixel_size=1280,768\r\ntexture=GTC_R\r\nbackground_color=42,42,40\r\nhtmlgauge00=NavSystems/WTG3000v2/GTC/WTG3000_GTC.html?Index=2, 0,0,1280,768\n"})})]})}function h(e={}){let{wrapper:n}={...(0,i.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},250065:function(e,n,t){t.d(n,{Z:function(){return a},a:function(){return o}});var r=t(667294);let s={},i=r.createContext(s);function o(e){let n=r.useContext(i);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),r.createElement(i.Provider,{value:n},e.children)}}}]);