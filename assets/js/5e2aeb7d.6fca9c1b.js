"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[15811],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>f});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),p=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},c="mdxType",h={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),c=p(n),d=a,f=c["".concat(l,".").concat(d)]||c[d]||h[d]||i;return n?r.createElement(f,o(o({ref:t},u),{},{components:n})):r.createElement(f,o({ref:t},u))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[c]="string"==typeof e?e:a,o[1]=s;for(var p=2;p<i;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},9217:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>h,frontMatter:()=>i,metadata:()=>s,toc:()=>p});var r=n(87462),a=(n(67294),n(3905));const i={sidebar_label:"Other Options",sidebar_position:7},o="GNS Other Behavior Options",s={unversionedId:"gns/other-behaviour",id:"gns/other-behaviour",title:"GNS Other Behavior Options",description:"The GNS 430/530 package also provides additional behaviour options to be set to customize behavior for differing plane configurations. These can be customized by adding new tags to the ` configuration in your panel.xml` file.",source:"@site/docs/gns/other-behaviour.md",sourceDirName:"gns",slug:"/gns/other-behaviour",permalink:"/msfs-avionics-mirror/docs/gns/other-behaviour",draft:!1,tags:[],version:"current",sidebarPosition:7,frontMatter:{sidebar_label:"Other Options",sidebar_position:7},sidebar:"sidebar",previous:{title:"Hardware Keyboard",permalink:"/msfs-avionics-mirror/docs/gns/keyboard"},next:{title:"GNS Interactions with the G3X Touch",permalink:"/msfs-avionics-mirror/docs/gns/g3x-interactions"}},l={},p=[],u={toc:p},c="wrapper";function h(e){let{components:t,...n}=e;return(0,a.kt)(c,(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"gns-other-behavior-options"},"GNS Other Behavior Options"),(0,a.kt)("p",null,"The GNS 430/530 package also provides additional behaviour options to be set to customize behavior for differing plane configurations. These can be customized by adding new tags to the ",(0,a.kt)("inlineCode",{parentName:"p"},"<Instrument>")," configuration in your ",(0,a.kt)("inlineCode",{parentName:"p"},"panel.xml")," file.\nThese options are primarily used to allow for interactions between the GNS and other instruments"),(0,a.kt)("p",null,"Please note the standard, default behavior of the GNS:"),(0,a.kt)("p",null,(0,a.kt)("em",{parentName:"p"},"By default"),", the instrument will use an empty string ",(0,a.kt)("inlineCode",{parentName:"p"},"''")," for the flight planner ID. To specify which ID to use, use the ",(0,a.kt)("inlineCode",{parentName:"p"},"<FlightPlannerId>")," tag. If two GNS units share the same flight planner ID, then their flight plans will be synced with each other, simulating automatic crossfill between the units."),(0,a.kt)("p",null,(0,a.kt)("em",{parentName:"p"},"By default"),", the instrument will consider its FMS to be primary if it is the primary instrument. To specify whether it is the primary FMS, use the ",(0,a.kt)("inlineCode",{parentName:"p"},"<IsFMSPrimary>")," tag. There must be ",(0,a.kt)("strong",{parentName:"p"},"exactly one")," primary FMS instance per flight planner ID. Therefore, if two GNS units share the same flight planner ID, then one unit should be configured for a primary FMS and the other should be configured for a non-primary FMS. If two GNS units have separate flight planner IDs, then both units should be configured for a primary FMS."),(0,a.kt)("p",null,(0,a.kt)("em",{parentName:"p"},"By default"),", LNAV will use index 0. To specify which LNAV index to use, use the ",(0,a.kt)("inlineCode",{parentName:"p"},"<LNavIndex>")," tag. Two GNS units can have the same LNAV index if and only if they have the same flight planner ID."),(0,a.kt)("p",null,(0,a.kt)("em",{parentName:"p"},"By default"),", VNAV will use index 0. To specify which VNAV index to use, use the ",(0,a.kt)("inlineCode",{parentName:"p"},"<VNavIndex>")," tag. Two GNS units can have the same VNAV index if and only if they have the same flight planner ID."),(0,a.kt)("p",null,"The following is a sample instrument config block that changes all these settings from the default using the tags described above:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-xml"},"<Instrument>\n  <Name>AS530</Name>\n  <FlightPlannerId>GNS</FlightPlannerId>\n  <IsFMSPrimary>True</IsFMSPrimary>\n  <LNavIndex>2</LNavIndex>\n  <VNavIndex>2</VNavIndex>\n</Instrument>\n")),(0,a.kt)("p",null,"Any or all of these can be used as appropriate."))}h.isMDXComponent=!0}}]);