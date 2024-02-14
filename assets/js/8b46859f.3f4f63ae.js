"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[22908],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>f});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},u=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},p="mdxType",h={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,l=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),p=c(n),d=o,f=p["".concat(l,".").concat(d)]||p[d]||h[d]||i;return n?r.createElement(f,a(a({ref:t},u),{},{components:n})):r.createElement(f,a({ref:t},u))}));function f(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,a=new Array(i);a[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[p]="string"==typeof e?e:o,a[1]=s;for(var c=2;c<i;c++)a[c]=n[c];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},28387:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>a,default:()=>h,frontMatter:()=>i,metadata:()=>s,toc:()=>c});var r=n(87462),o=(n(67294),n(3905));const i={sidebar_label:"GNS Interactions With G3X",sidebar_position:8},a="GNS Interactions With G3X",s={unversionedId:"gns/g3x-interactions",id:"gns/g3x-interactions",title:"GNS Interactions With G3X",description:"The GNS 430/530 supports dual configuration with the G3X. To support this configuration, the GNS must have it's autopilot disabled while acting as an external navigation source for the G3X. The GNS will provide lateral steering guidance to the G3X, which the G3X will then use to provide autopilot behaviour.",source:"@site/docs/gns/g3x-interactions.md",sourceDirName:"gns",slug:"/gns/g3x-interactions",permalink:"/msfs-avionics-mirror/docs/gns/g3x-interactions",draft:!1,tags:[],version:"current",sidebarPosition:8,frontMatter:{sidebar_label:"GNS Interactions With G3X",sidebar_position:8},sidebar:"sidebar",previous:{title:"Other Options",permalink:"/msfs-avionics-mirror/docs/gns/other-behaviour"},next:{title:"Readme",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/"}},l={},c=[],u={toc:c},p="wrapper";function h(e){let{components:t,...n}=e;return(0,o.kt)(p,(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"gns-interactions-with-g3x"},"GNS Interactions With G3X"),(0,o.kt)("p",null,"The GNS 430/530 supports dual configuration with the G3X. To support this configuration, the GNS must have it's autopilot disabled while acting as an external navigation source for the G3X. The GNS will provide lateral steering guidance to the G3X, which the G3X will then use to provide autopilot behaviour."),(0,o.kt)("p",null,"To properly configure the GNS for this configuration, the following options must be set:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"The GNS autopilot must be disabled using the ",(0,o.kt)("inlineCode",{parentName:"li"},"<DisableAutopilot>")," tag"),(0,o.kt)("li",{parentName:"ul"},"The external source index must be set to 1 or 2 using the ",(0,o.kt)("inlineCode",{parentName:"li"},"<G3XExternalSourceIndex>")," tag")),(0,o.kt)("p",null,"The following is a sample instrument config block that allows this configuration:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-xml"},"<Instrument>\n  <Name>AS530</Name>\n  <DisableAutopilot>True</DisableAutopilot>\n  <G3XExternalSourceIndex>2</ExternalSourceIndex>\n</Instrument>\n")))}h.isMDXComponent=!0}}]);