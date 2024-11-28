"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["613717"],{678330:function(n,e,i){i.r(e),i.d(e,{metadata:()=>s,contentTitle:()=>c,default:()=>u,assets:()=>a,toc:()=>d,frontMatter:()=>l});var s=JSON.parse('{"id":"wt21/plugin-basics","title":"WT21 Plugin Basics","description":"Introduction","source":"@site/docs/wt21/plugin-basics.md","sourceDirName":"wt21","slug":"/wt21/plugin-basics","permalink":"/msfs-avionics-mirror/2024/docs/wt21/plugin-basics","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":4,"frontMatter":{"sidebar_label":"Plugin Basics","sidebar_position":4},"sidebar":"sidebar","previous":{"title":"panel.xml Tag Documentation","permalink":"/msfs-avionics-mirror/2024/docs/wt21/panel-xml-tag-documentation"},"next":{"title":"PFD Plugins","permalink":"/msfs-avionics-mirror/2024/docs/wt21/pfd-plugins"}}'),r=i("785893"),t=i("250065");let l={sidebar_label:"Plugin Basics",sidebar_position:4},c="WT21 Plugin Basics",a={},d=[{value:"Introduction",id:"introduction",level:2},{value:"Loading Plugin Scripts",id:"loading-plugin-scripts",level:2},{value:"Plugin Interface",id:"plugin-interface",level:2}];function o(n){let e={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",header:"header",li:"li",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,t.a)(),...n.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(e.header,{children:(0,r.jsx)(e.h1,{id:"wt21-plugin-basics",children:"WT21 Plugin Basics"})}),"\n",(0,r.jsx)(e.h2,{id:"introduction",children:"Introduction"}),"\n",(0,r.jsxs)(e.p,{children:["The WT21 package uses the ",(0,r.jsx)(e.a,{href:"/msfs-avionics-mirror/2024/docs/plugins/overview",children:"Plugin API"})," to allow developers to inject their own custom Typescript code into the avionics system in order to implement aircraft-specific features."]}),"\n",(0,r.jsx)(e.h2,{id:"loading-plugin-scripts",children:"Loading Plugin Scripts"}),"\n",(0,r.jsxs)(e.p,{children:["Global plugin scripts are loaded via XML files in the ",(0,r.jsx)(e.code,{children:"html_ui/Plugins"})," directory. The declared target of the plugin determines which instrument type the global plugin applies to:"]}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(e.table,{children:[(0,r.jsx)(e.thead,{children:(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.th,{children:"Instrument Type"}),(0,r.jsx)(e.th,{children:"Plugin Target"})]})}),(0,r.jsxs)(e.tbody,{children:[(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:"PFD"}),(0,r.jsx)(e.td,{children:(0,r.jsx)(e.code,{children:"WT21_PFD"})})]}),(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:"MFD"}),(0,r.jsx)(e.td,{children:(0,r.jsx)(e.code,{children:"WT21_MFD"})})]}),(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:"FMC"}),(0,r.jsx)(e.td,{children:(0,r.jsx)(e.code,{children:"WT21_FMC"})})]})]})]}),"\n",(0,r.jsxs)(e.p,{children:["Airplane plugin scripts are loaded on a per-instrument basis via ",(0,r.jsx)(e.code,{children:"panel.xml"}),":"]}),"\n",(0,r.jsx)(e.pre,{children:(0,r.jsx)(e.code,{className:"language-xml",children:"<PlaneHTMLConfig>\r\n\r\n  <Instrument>\r\n    <Name>WT21_PFD_1</Name>\r\n\r\n    <Plugin>coui://SimObjects/Airplanes/MyAirplane/panel/Instruments/WT21/Plugins/PfdPlugin.js</Plugin>\r\n  </Instrument>\r\n\r\n  <Instrument>\r\n    <Name>WT21_PFD_2</Name>\r\n\r\n    <Plugin>coui://SimObjects/Airplanes/MyAirplane/panel/Instruments/WT21/Plugins/PfdPlugin.js</Plugin>\r\n  </Instrument>\r\n\r\n  <Instrument>\r\n    <Name>WT21_MFD</Name>\r\n\r\n    <Plugin>coui://SimObjects/Airplanes/MyAirplane/panel/Instruments/WT21/Plugins/MfdPlugin.js</Plugin>\r\n  </Instrument>\r\n\r\n</PlaneHTMLConfig>\n"})}),"\n",(0,r.jsx)(e.admonition,{type:"tip",children:(0,r.jsxs)(e.p,{children:["It is best practice to store aircraft-specific WT21 plugin script files (",(0,r.jsx)(e.code,{children:".js"}),") in the aircraft's ",(0,r.jsx)(e.code,{children:"panel/Instruments/WT21/Plugins/"})," subdirectory. This greatly reduces the risk of file conflicts within the sim's virtual file system, because the plugin files are contained in an aircraft-specific subdirectory."]})}),"\n",(0,r.jsxs)(e.p,{children:["For more detailed information on how plugins are defined and loaded, please refer to the ",(0,r.jsx)(e.a,{href:"/msfs-avionics-mirror/2024/docs/plugins/overview",children:"Plugin API documentation"}),"."]}),"\n",(0,r.jsx)(e.h2,{id:"plugin-interface",children:"Plugin Interface"}),"\n",(0,r.jsx)(e.p,{children:"WT21 plugins conform to the standard SDK plugin interface."}),"\n",(0,r.jsxs)(e.p,{children:["All WT21 plugins are passed the following references via ",(0,r.jsx)(e.code,{children:"binder"}),":"]}),"\n",(0,r.jsxs)(e.ul,{children:["\n",(0,r.jsx)(e.li,{children:"The local event bus."}),"\n",(0,r.jsx)(e.li,{children:"The instrument backplane."}),"\n",(0,r.jsx)(e.li,{children:"The flight plan lateral path calculator."}),"\n",(0,r.jsx)(e.li,{children:"If the instrument is the primary instrument."}),"\n"]})]})}function u(n={}){let{wrapper:e}={...(0,t.a)(),...n.components};return e?(0,r.jsx)(e,{...n,children:(0,r.jsx)(o,{...n})}):o(n)}},250065:function(n,e,i){i.d(e,{Z:function(){return c},a:function(){return l}});var s=i(667294);let r={},t=s.createContext(r);function l(n){let e=s.useContext(t);return s.useMemo(function(){return"function"==typeof n?n(e):{...e,...n}},[e,n])}function c(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(r):n.components||r:l(n.components),s.createElement(t.Provider,{value:e},n.children)}}}]);