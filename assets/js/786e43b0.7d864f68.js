"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[32629],{3905:(e,r,n)=>{n.d(r,{Zo:()=>u,kt:()=>f});var t=n(67294);function i(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function s(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function o(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?s(Object(n),!0).forEach((function(r){i(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function a(e,r){if(null==e)return{};var n,t,i=function(e,r){if(null==e)return{};var n,t,i={},s=Object.keys(e);for(t=0;t<s.length;t++)n=s[t],r.indexOf(n)>=0||(i[n]=e[n]);return i}(e,r);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(t=0;t<s.length;t++)n=s[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=t.createContext({}),l=function(e){var r=t.useContext(d),n=r;return e&&(n="function"==typeof e?e(r):o(o({},r),e)),n},u=function(e){var r=l(e.components);return t.createElement(d.Provider,{value:r},e.children)},p="mdxType",c={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},v=t.forwardRef((function(e,r){var n=e.components,i=e.mdxType,s=e.originalType,d=e.parentName,u=a(e,["components","mdxType","originalType","parentName"]),p=l(n),v=i,f=p["".concat(d,".").concat(v)]||p[v]||c[v]||s;return n?t.createElement(f,o(o({ref:r},u),{},{components:n})):t.createElement(f,o({ref:r},u))}));function f(e,r){var n=arguments,i=r&&r.mdxType;if("string"==typeof e||i){var s=n.length,o=new Array(s);o[0]=v;var a={};for(var d in r)hasOwnProperty.call(r,d)&&(a[d]=r[d]);a.originalType=e,a[p]="string"==typeof e?e:i,o[1]=a;for(var l=2;l<s;l++)o[l]=n[l];return t.createElement.apply(null,o)}return t.createElement.apply(null,n)}v.displayName="MDXCreateElement"},12798:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>d,contentTitle:()=>o,default:()=>c,frontMatter:()=>s,metadata:()=>a,toc:()=>l});var t=n(87462),i=(n(67294),n(3905));const s={id:"SoundServerEvents",title:"Interface: SoundServerEvents",sidebar_label:"SoundServerEvents",sidebar_position:0,custom_edit_url:null},o=void 0,a={unversionedId:"framework/interfaces/SoundServerEvents",id:"framework/interfaces/SoundServerEvents",title:"Interface: SoundServerEvents",description:"Events published by SoundServer.",source:"@site/docs/framework/interfaces/SoundServerEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/SoundServerEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/SoundServerEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"SoundServerEvents",title:"Interface: SoundServerEvents",sidebar_label:"SoundServerEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"SoundServerControlEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/SoundServerControlEvents"},next:{title:"StallWarningEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/StallWarningEvents"}},d={},l=[{value:"Properties",id:"properties",level:2},{value:"sound_server_initialized",id:"sound_server_initialized",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"sound_server_is_awake",id:"sound_server_is_awake",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"sound_server_packet_ended",id:"sound_server_packet_ended",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"sound_server_packet_started",id:"sound_server_packet_started",level:3},{value:"Defined in",id:"defined-in-3",level:4}],u={toc:l},p="wrapper";function c(e){let{components:r,...n}=e;return(0,i.kt)(p,(0,t.Z)({},u,n,{components:r,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Events published by ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/SoundServer"},"SoundServer"),"."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"sound_server_initialized"},"sound","_","server","_","initialized"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"sound","_","server","_","initialized"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether the sound server is initialized. The sound server will only respond to commands when it has been initialized."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:38"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"sound_server_is_awake"},"sound","_","server","_","is","_","awake"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"sound","_","server","_","is","_","awake"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether the sound server is awake."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:47"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"sound_server_packet_ended"},"sound","_","server","_","packet","_","ended"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"sound","_","server","_","packet","_","ended"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"A sound packet has finished playing. The event data is the key of the packet."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:44"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"sound_server_packet_started"},"sound","_","server","_","packet","_","started"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"sound","_","server","_","packet","_","started"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"A sound packet has started playing. The event data is the key of the packet."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:41"))}c.isMDXComponent=!0}}]);