"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[68094],{3905:(e,r,n)=>{n.d(r,{Zo:()=>m,kt:()=>d});var t=n(67294);function a(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function i(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function o(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?i(Object(n),!0).forEach((function(r){a(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function s(e,r){if(null==e)return{};var n,t,a=function(e,r){if(null==e)return{};var n,t,a={},i=Object.keys(e);for(t=0;t<i.length;t++)n=i[t],r.indexOf(n)>=0||(a[n]=e[n]);return a}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(t=0;t<i.length;t++)n=i[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=t.createContext({}),l=function(e){var r=t.useContext(c),n=r;return e&&(n="function"==typeof e?e(r):o(o({},r),e)),n},m=function(e){var r=l(e.components);return t.createElement(c.Provider,{value:r},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},k=t.forwardRef((function(e,r){var n=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,m=s(e,["components","mdxType","originalType","parentName"]),p=l(n),k=a,d=p["".concat(c,".").concat(k)]||p[k]||u[k]||i;return n?t.createElement(d,o(o({ref:r},m),{},{components:n})):t.createElement(d,o({ref:r},m))}));function d(e,r){var n=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=k;var s={};for(var c in r)hasOwnProperty.call(r,c)&&(s[c]=r[c]);s.originalType=e,s[p]="string"==typeof e?e:a,o[1]=s;for(var l=2;l<i;l++)o[l]=n[l];return t.createElement.apply(null,o)}return t.createElement.apply(null,n)}k.displayName="MDXCreateElement"},63467:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>c,contentTitle:()=>o,default:()=>u,frontMatter:()=>i,metadata:()=>s,toc:()=>l});var t=n(87462),a=(n(67294),n(3905));const i={id:"MarkerBeaconTuneEvents",title:"Interface: MarkerBeaconTuneEvents",sidebar_label:"MarkerBeaconTuneEvents",sidebar_position:0,custom_edit_url:null},o=void 0,s={unversionedId:"framework/interfaces/MarkerBeaconTuneEvents",id:"framework/interfaces/MarkerBeaconTuneEvents",title:"Interface: MarkerBeaconTuneEvents",description:"Events related to marker beacons.",source:"@site/docs/framework/interfaces/MarkerBeaconTuneEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/MarkerBeaconTuneEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MarkerBeaconTuneEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MarkerBeaconTuneEvents",title:"Interface: MarkerBeaconTuneEvents",sidebar_label:"MarkerBeaconTuneEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MappedSubscribable",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MappedSubscribable"},next:{title:"Metar",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/Metar"}},c={},l=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"marker_beacon_hisense_on",id:"marker_beacon_hisense_on",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"marker_beacon_sound",id:"marker_beacon_sound",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"marker_beacon_state",id:"marker_beacon_state",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"mkr_bcn_state_simvar",id:"mkr_bcn_state_simvar",level:3},{value:"Defined in",id:"defined-in-3",level:4}],m={toc:l},p="wrapper";function u(e){let{components:r,...n}=e;return(0,a.kt)(p,(0,t.Z)({},m,n,{components:r,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Events related to marker beacons."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"MarkerBeaconTuneEvents"))),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/NavComEvents"},(0,a.kt)("inlineCode",{parentName:"a"},"NavComEvents"))))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"marker_beacon_hisense_on"},"marker","_","beacon","_","hisense","_","on"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"marker","_","beacon","_","hisense","_","on"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Whether the marker beacon receiver is in high sensitivity mode."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/NavCom.ts:234"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"marker_beacon_sound"},"marker","_","beacon","_","sound"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"marker","_","beacon","_","sound"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Whether marker beacon audio monitoring is enabled."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/NavCom.ts:237"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"marker_beacon_state"},"marker","_","beacon","_","state"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"marker","_","beacon","_","state"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/MarkerBeaconState"},(0,a.kt)("inlineCode",{parentName:"a"},"MarkerBeaconState"))),(0,a.kt)("p",null,"The current marker beacon received signal state."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/NavCom.ts:240"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"mkr_bcn_state_simvar"},"mkr","_","bcn","_","state","_","simvar"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"mkr","_","bcn","_","state","_","simvar"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/MarkerBeaconState"},(0,a.kt)("inlineCode",{parentName:"a"},"MarkerBeaconState"))),(0,a.kt)("p",null,"The current marker beacon received signal state."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Deprecated"))),(0,a.kt)("p",null,"Please use ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MarkerBeaconTuneEvents#marker_beacon_state"},"marker_beacon_state")," instead."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/NavCom.ts:247"))}u.isMDXComponent=!0}}]);