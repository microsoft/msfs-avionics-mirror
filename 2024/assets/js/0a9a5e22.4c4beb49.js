"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["534961"],{120377:function(e,i,n){n.r(i),n.d(i,{metadata:()=>s,contentTitle:()=>l,default:()=>p,assets:()=>c,toc:()=>d,frontMatter:()=>t});var s=JSON.parse('{"id":"epic2/plugins/lower-mfd-plugins","title":"Epic2 Lower MFD Plugins","description":"Introduction","source":"@site/docs/epic2/plugins/lower-mfd-plugins.md","sourceDirName":"epic2/plugins","slug":"/epic2/plugins/lower-mfd-plugins","permalink":"/msfs-avionics-mirror/2024/docs/epic2/plugins/lower-mfd-plugins","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":4,"frontMatter":{"sidebar_label":"Lower MFD Plugins","sidebar_position":4},"sidebar":"sidebar","previous":{"title":"Upper MFD Plugins","permalink":"/msfs-avionics-mirror/2024/docs/epic2/plugins/upper-mfd-plugins"},"next":{"title":"@microsoft/msfs-epic2-shared v2.0.7","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/globals"}}'),r=n("785893"),o=n("250065");let t={sidebar_label:"Lower MFD Plugins",sidebar_position:4},l="Epic2 Lower MFD Plugins",c={},d=[{value:"Introduction",id:"introduction",level:2},{value:"Importing Libraries",id:"importing-libraries",level:2},{value:"Binder",id:"binder",level:2},{value:"Systems Summary Synoptics Display",id:"systems-summary-synoptics-display",level:2}];function a(e){let i={a:"a",code:"code",h1:"h1",h2:"h2",header:"header",li:"li",p:"p",ul:"ul",...(0,o.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(i.header,{children:(0,r.jsx)(i.h1,{id:"epic2-lower-mfd-plugins",children:"Epic2 Lower MFD Plugins"})}),"\n",(0,r.jsx)(i.h2,{id:"introduction",children:"Introduction"}),"\n",(0,r.jsxs)(i.p,{children:["Epic2 Lower MFD plugins allow you to render the systems summary synoptics to the lower MFD, and to render other arbitrary components. These plugins must implement the ",(0,r.jsx)(i.code,{children:"Epic2LowerMfdAvionicsPlugin"})," interface."]}),"\n",(0,r.jsx)(i.h2,{id:"importing-libraries",children:"Importing Libraries"}),"\n",(0,r.jsx)(i.p,{children:"PFD plugins can import and use code from the following framework libraries:"}),"\n",(0,r.jsxs)(i.ul,{children:["\n",(0,r.jsx)(i.li,{children:(0,r.jsx)(i.code,{children:"@microsoft/msfs-sdk"})}),"\n",(0,r.jsx)(i.li,{children:(0,r.jsx)(i.code,{children:"@microsoft/msfs-epic2-lower-mfd"})}),"\n",(0,r.jsx)(i.li,{children:(0,r.jsx)(i.code,{children:"@microsoft/msfs-epic2-shared"})}),"\n"]}),"\n",(0,r.jsx)(i.p,{children:"When building your plugin, you should configure your build tools to consume the above libraries as global externals."}),"\n",(0,r.jsx)(i.h2,{id:"binder",children:"Binder"}),"\n",(0,r.jsxs)(i.p,{children:["Lower MFD plugins are only passed the ",(0,r.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/epic2/plugins/plugin-basics#plugin-interface",children:"references"})," passed to all Epic2 plugins"]}),"\n",(0,r.jsx)(i.h2,{id:"systems-summary-synoptics-display",children:"Systems Summary Synoptics Display"}),"\n",(0,r.jsx)(i.p,{children:"By default, the Epic2 does not include any systems synoptics, and so these must be rendered to the lower MFD. If these are not being rendered, the right side of the lower MFD display will be blank."}),"\n",(0,r.jsxs)(i.p,{children:["You can render components to the synoptics display pane using the plugin's ",(0,r.jsx)(i.code,{children:"renderSection()"})," method. There are no limits to the number or types of components that can be rendered. These will be rendered to the ",(0,r.jsx)(i.code,{children:"TwoThirdSection"})," div of the PFD, after the Epic2 has initialised."]})]})}function p(e={}){let{wrapper:i}={...(0,o.a)(),...e.components};return i?(0,r.jsx)(i,{...e,children:(0,r.jsx)(a,{...e})}):a(e)}},250065:function(e,i,n){n.d(i,{Z:function(){return l},a:function(){return t}});var s=n(667294);let r={},o=s.createContext(r);function t(e){let i=s.useContext(o);return s.useMemo(function(){return"function"==typeof e?e(i):{...i,...e}},[i,e])}function l(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:t(e.components),s.createElement(o.Provider,{value:i},e.children)}}}]);