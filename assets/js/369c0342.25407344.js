"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[8530],{3905:function(e,n,t){t.d(n,{Zo:function(){return u},kt:function(){return m}});var r=t(7294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var d=r.createContext({}),c=function(e){var n=r.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},u=function(e){var n=c(e.components);return r.createElement(d.Provider,{value:n},e.children)},p={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},s=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,a=e.originalType,d=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),s=c(t),m=i,f=s["".concat(d,".").concat(m)]||s[m]||p[m]||a;return t?r.createElement(f,o(o({ref:n},u),{},{components:t})):r.createElement(f,o({ref:n},u))}));function m(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var a=t.length,o=new Array(a);o[0]=s;var l={};for(var d in n)hasOwnProperty.call(n,d)&&(l[d]=n[d]);l.originalType=e,l.mdxType="string"==typeof e?e:i,o[1]=l;for(var c=2;c<a;c++)o[c]=t[c];return r.createElement.apply(null,o)}return r.createElement.apply(null,t)}s.displayName="MDXCreateElement"},6100:function(e,n,t){t.r(n),t.d(n,{frontMatter:function(){return l},contentTitle:function(){return d},metadata:function(){return c},toc:function(){return u},default:function(){return s}});var r=t(7462),i=t(3366),a=(t(7294),t(3905)),o=["components"],l={id:"VNavApproachGuidanceMode",title:"Enumeration: VNavApproachGuidanceMode",sidebar_label:"VNavApproachGuidanceMode",sidebar_position:0,custom_edit_url:null},d=void 0,c={unversionedId:"framework/enums/VNavApproachGuidanceMode",id:"framework/enums/VNavApproachGuidanceMode",isDocsHomePage:!1,title:"Enumeration: VNavApproachGuidanceMode",description:"The current VNAV approach guidance mode.",source:"@site/docs/framework/enums/VNavApproachGuidanceMode.md",sourceDirName:"framework/enums",slug:"/framework/enums/VNavApproachGuidanceMode",permalink:"/msfs-avionics-mirror/docs/framework/enums/VNavApproachGuidanceMode",editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"VNavApproachGuidanceMode",title:"Enumeration: VNavApproachGuidanceMode",sidebar_label:"VNavApproachGuidanceMode",sidebar_position:0,custom_edit_url:null},sidebar:"docsSidebar",previous:{title:"VNavAltCaptureType",permalink:"/msfs-avionics-mirror/docs/framework/enums/VNavAltCaptureType"},next:{title:"VNavMode",permalink:"/msfs-avionics-mirror/docs/framework/enums/VNavMode"}},u=[{value:"Enumeration members",id:"enumeration-members",children:[{value:"GPActive",id:"gpactive",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"GPArmed",id:"gparmed",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"GSActive",id:"gsactive",children:[{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3},{value:"GSArmed",id:"gsarmed",children:[{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3},{value:"None",id:"none",children:[{value:"Defined in",id:"defined-in-4",children:[],level:4}],level:3}],level:2}],p={toc:u};function s(e){var n=e.components,t=(0,i.Z)(e,o);return(0,a.kt)("wrapper",(0,r.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"The current VNAV approach guidance mode."),(0,a.kt)("h2",{id:"enumeration-members"},"Enumeration members"),(0,a.kt)("h3",{id:"gpactive"},"GPActive"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"GPActive")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"4")),(0,a.kt)("p",null,"VNAV is actively follow RNAV glidepath guidance."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/autopilot/VerticalNavigation.ts:46"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"gparmed"},"GPArmed"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"GPArmed")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"3")),(0,a.kt)("p",null,"VNAV RNAV glidepath guidance is armed for capture."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/autopilot/VerticalNavigation.ts:43"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"gsactive"},"GSActive"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"GSActive")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"2")),(0,a.kt)("p",null,"VNAV is actively following ILS glideslope guidance."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/autopilot/VerticalNavigation.ts:40"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"gsarmed"},"GSArmed"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"GSArmed")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"1")),(0,a.kt)("p",null,"VNAV has armed ILS glideslope guidance for capture."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/autopilot/VerticalNavigation.ts:37"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"none"},"None"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"None")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"0")),(0,a.kt)("p",null,"VNAV is not currently following approach guidance."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/autopilot/VerticalNavigation.ts:34"))}s.isMDXComponent=!0}}]);