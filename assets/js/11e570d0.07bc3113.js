"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[72664],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>v});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var s=n.createContext({}),c=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):a(a({},t),e)),r},u=function(e){var t=c(e.components);return n.createElement(s.Provider,{value:t},e.children)},d="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,o=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),d=c(r),f=i,v=d["".concat(s,".").concat(f)]||d[f]||p[f]||o;return r?n.createElement(v,a(a({ref:t},u),{},{components:r})):n.createElement(v,a({ref:t},u))}));function v(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=r.length,a=new Array(o);a[0]=f;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[d]="string"==typeof e?e:i,a[1]=l;for(var c=2;c<o;c++)a[c]=r[c];return n.createElement.apply(null,a)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},32513:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>a,default:()=>p,frontMatter:()=>o,metadata:()=>l,toc:()=>c});var n=r(87462),i=(r(67294),r(3905));const o={id:"AiPilotEvents",title:"Interface: AiPilotEvents",sidebar_label:"AiPilotEvents",sidebar_position:0,custom_edit_url:null},a=void 0,l={unversionedId:"framework/interfaces/AiPilotEvents",id:"framework/interfaces/AiPilotEvents",title:"Interface: AiPilotEvents",description:"Events related to the sim's AI piloting feature.",source:"@site/docs/framework/interfaces/AiPilotEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/AiPilotEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AiPilotEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AiPilotEvents",title:"Interface: AiPilotEvents",sidebar_label:"AiPilotEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AhrsEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AhrsEvents"},next:{title:"AiracCycle",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/AiracCycle"}},s={},c=[{value:"Properties",id:"properties",level:2},{value:"ai_auto_rudder_active",id:"ai_auto_rudder_active",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"ai_delegate_controls_active",id:"ai_delegate_controls_active",level:3},{value:"Defined in",id:"defined-in-1",level:4}],u={toc:c},d="wrapper";function p(e){let{components:t,...r}=e;return(0,i.kt)(d,(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Events related to the sim's AI piloting feature."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"ai_auto_rudder_active"},"ai","_","auto","_","rudder","_","active"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"ai","_","auto","_","rudder","_","active"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether or not the user has enabled auto-rudder in the flight assistance panel."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/AiPilotPublisher.ts:19"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ai_delegate_controls_active"},"ai","_","delegate","_","controls","_","active"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"ai","_","delegate","_","controls","_","active"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether the sim's AI pilot control system is active. AI pilot control is active when the AI PILOTING setting\nis enabled on the FLIGHT ASSISTANCE panel and during the pre-flight cutscene when spawning on a runway before\nthe user selects 'READY TO FLY'."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/AiPilotPublisher.ts:14"))}p.isMDXComponent=!0}}]);