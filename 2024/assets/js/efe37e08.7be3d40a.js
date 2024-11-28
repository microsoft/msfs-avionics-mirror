"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["627516"],{268074:function(e,n,a){a.r(n),a.d(n,{metadata:()=>t,contentTitle:()=>l,default:()=>c,assets:()=>d,toc:()=>h,frontMatter:()=>r});var t=JSON.parse('{"id":"g3000/features/weight-fuel","title":"G3000 Weight and Fuel","description":"Introduction","source":"@site/docs/g3000/features/weight-fuel.md","sourceDirName":"g3000/features","slug":"/g3000/features/weight-fuel","permalink":"/msfs-avionics-mirror/2024/docs/g3000/features/weight-fuel","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":6,"frontMatter":{"sidebar_label":"Weight and Fuel","sidebar_position":6},"sidebar":"sidebar","previous":{"title":"Initialization","permalink":"/msfs-avionics-mirror/2024/docs/g3000/features/initialization"},"next":{"title":"Weight and Balance","permalink":"/msfs-avionics-mirror/2024/docs/g3000/features/weight-balance"}}'),i=a("785893"),s=a("250065");let r={sidebar_label:"Weight and Fuel",sidebar_position:6},l="G3000 Weight and Fuel",d={},h=[{value:"Introduction",id:"introduction",level:2},{value:"Configuring Weight and Fuel",id:"configuring-weight-and-fuel",level:2},{value:"Example",id:"example",level:2}];function o(e){let n={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",header:"header",img:"img",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,s.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"g3000-weight-and-fuel",children:"G3000 Weight and Fuel"})}),"\n",(0,i.jsx)(n.h2,{id:"introduction",children:"Introduction"}),"\n",(0,i.jsxs)(n.p,{children:["The G3000 offers a ",(0,i.jsx)(n.strong,{children:"weight and fuel"})," feature which supports basic weight and fuel calculations. Using the GTC Weight and Fuel page (see image below), the user can enter aggregated weight and fuel values. These values are then used by the system to calculate figures such as zero-fuel weight, takeoff weight and estimated landing weight. Both the user-defined and calculated values can also be used by other G3000 sub-systems that require weight and/or fuel data."]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.img,{alt:"GTC Weight and Fuel Page",src:a(505787).Z+"",width:"491",height:"387"})}),"\n",(0,i.jsxs)(n.p,{children:["The weight and fuel feature is enabled by default and is a ",(0,i.jsx)(n.em,{children:"required"})," part of the G3000 avionics. Some airplane installations may opt to enable the optional ",(0,i.jsx)(n.strong,{children:"weight and balance"})," feature, which extends the weight and fuel feature with additional capabilities, such as the ability to define and load individual weight stations and carry out center-of-gravity (CG) calculations. To learn more about the weight and balance feature, please refer to ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/g3000/features/weight-balance",children:"this page"}),". The next section describes how to configure the base weight and fuel feature."]}),"\n",(0,i.jsx)(n.h2,{id:"configuring-weight-and-fuel",children:"Configuring Weight and Fuel"}),"\n",(0,i.jsxs)(n.p,{children:["Weight and fuel configuration is done through ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/g3000/panel-xml-basics",children:(0,i.jsx)(n.code,{children:"panel.xml"})}),". Configuration uses the ",(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/g3000/panel-xml-tag-documentation#weights",children:(0,i.jsx)(n.code,{children:"<Weights>"})})," tag."]}),"\n",(0,i.jsxs)(n.p,{children:["There are six values that all must be defined using child tags under ",(0,i.jsx)(n.code,{children:"<Weights>"}),":"]}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Tag"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/g3000/panel-xml-tag-documentation#basicempty",children:(0,i.jsx)(n.code,{children:"<BasicEmpty>"})})}),(0,i.jsx)(n.td,{children:"The airplane's basic empty weight. This is the airplane's weight with no crew, no passengers, no cargo, and zero usable fuel."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/g3000/panel-xml-tag-documentation#maxzerofuel",children:(0,i.jsx)(n.code,{children:"<MaxZeroFuel>"})})}),(0,i.jsx)(n.td,{children:"The airplane's maximum allowed zero-fuel weight. The airplane's zero-fuel weight is the airplane's total (gross) weight minus usable fuel."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/g3000/panel-xml-tag-documentation#maxramp",children:(0,i.jsx)(n.code,{children:"<MaxRamp>"})})}),(0,i.jsx)(n.td,{children:"The airplane's maximum allowed ramp weight. The airplane's ramp weight is the airplane's total (gross) weight \"at the ramp\" - when it is loaded with crew, passengers, cargo, and initial fuel and before it has burned any fuel."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/g3000/panel-xml-tag-documentation#maxtakeoff",children:(0,i.jsx)(n.code,{children:"<MaxTakeoff>"})})}),(0,i.jsx)(n.td,{children:"The airplane's maximum allowed takeoff weight. The airplane's takeoff weight is the airplane's total (gross) weight at takeoff."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/g3000/panel-xml-tag-documentation#maxlanding",children:(0,i.jsx)(n.code,{children:"<MaxLanding>"})})}),(0,i.jsx)(n.td,{children:"The airplane's maximum allowed landing weight. The airplane's landing weight is the airplane's total (gross) weight at landing."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/g3000/panel-xml-tag-documentation#maxpax",children:(0,i.jsx)(n.code,{children:"<MaxPax>"})})}),(0,i.jsx)(n.td,{children:"The maximum number of passengers allowed in the airplane. Crew (including pilots and flight attendants) are not counted as passengers."})]})]})]}),"\n",(0,i.jsxs)(n.p,{children:['The basic empty weight value is used to initialize the "Basic Empty Weight" field in the GTC Weight and Fuel page when the airplane is first loaded. After this, the user is free to edit the field to any value they wish. If persistent user settings are enabled for the airplane, then any changes made to the field by the user are carried over to future flight sessions. If persistent user settings are disabled, then the field is reset to the value defined in ',(0,i.jsx)(n.code,{children:"panel.xml"})," at the start of each flight session."]}),"\n",(0,i.jsx)(n.p,{children:"The four maximum weight values (zero-fuel, ramp, takeoff, and landing) are used by the system to trigger alert states when the associated calculated weight value exceeds the maximum. The image below shows an example of the alerts that are triggered when the maximum zero-fuel and takeoff weights are exceeded."}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.img,{alt:"GTC Weight and Fuel Page Alert",src:a(986696).Z+"",width:"491",height:"387"})}),"\n",(0,i.jsx)(n.p,{children:'The maximum passenger count value is used to constrain the range of values the user is allowed to enter for the GTC Weight and Fuel page\'s "Passengers" field.'}),"\n",(0,i.jsx)(n.h2,{id:"example",children:"Example"}),"\n",(0,i.jsxs)(n.p,{children:["The following example shows how to configure weight and fuel in ",(0,i.jsx)(n.code,{children:"panel.xml"}),":"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-xml",children:"<Performance>\r\n  <Weights>\r\n    <BasicEmpty unit='pounds'>3000</BasicEmpty>\r\n    <MaxRamp unit='pounds'>5300</MaxRamp>\r\n    <MaxTakeoff unit='pounds'>5200</MaxTakeoff>\r\n    <MaxLanding unit='pounds'>4750</MaxLanding>\r\n    <MaxZeroFuel unit='pounds'>4200</MaxZeroFuel>\r\n    <MaxPax>4</MaxPax>\r\n  </Weights>\r\n</Performance>\n"})})]})}function c(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(o,{...e})}):o(e)}},986696:function(e,n,a){a.d(n,{Z:function(){return t}});let t=a.p+"assets/images/gtc-weight-fuel-page-alert-b5d5d741f47397af0e233e24522da61c.jpg"},505787:function(e,n,a){a.d(n,{Z:function(){return t}});let t=a.p+"assets/images/gtc-weight-fuel-page-3eefe9018875460cfaabca64b073ee2c.jpg"},250065:function(e,n,a){a.d(n,{Z:function(){return l},a:function(){return r}});var t=a(667294);let i={},s=t.createContext(i);function r(e){let n=t.useContext(s);return t.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),t.createElement(s.Provider,{value:n},e.children)}}}]);