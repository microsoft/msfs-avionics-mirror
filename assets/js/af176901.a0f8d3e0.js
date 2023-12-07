"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[27062],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>f});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=r.createContext({}),s=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},d=function(e){var t=s(e.components);return r.createElement(l.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,l=e.parentName,d=p(e,["components","mdxType","originalType","parentName"]),u=s(n),c=i,f=u["".concat(l,".").concat(c)]||u[c]||m[c]||o;return n?r.createElement(f,a(a({ref:t},d),{},{components:n})):r.createElement(f,a({ref:t},d))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=c;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[u]="string"==typeof e?e:i,a[1]=p;for(var s=2;s<o;s++)a[s]=n[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},54160:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>a,default:()=>m,frontMatter:()=>o,metadata:()=>p,toc:()=>s});var r=n(87462),i=(n(67294),n(3905));const o={id:"MapRotation",title:"Enumeration: MapRotation",sidebar_label:"MapRotation",sidebar_position:0,custom_edit_url:null},a=void 0,p={unversionedId:"framework/enums/MapRotation",id:"framework/enums/MapRotation",title:"Enumeration: MapRotation",description:"An enumeration of possible map rotation types.",source:"@site/docs/framework/enums/MapRotation.md",sourceDirName:"framework/enums",slug:"/framework/enums/MapRotation",permalink:"/msfs-avionics-mirror/docs/framework/enums/MapRotation",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapRotation",title:"Enumeration: MapRotation",sidebar_label:"MapRotation",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapProjectionChangeType",permalink:"/msfs-avionics-mirror/docs/framework/enums/MapProjectionChangeType"},next:{title:"MapSystemWaypointRoles",permalink:"/msfs-avionics-mirror/docs/framework/enums/MapSystemWaypointRoles"}},l={},s=[{value:"Enumeration Members",id:"enumeration-members",level:2},{value:"DtkUp",id:"dtkup",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"HeadingUp",id:"headingup",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"NorthUp",id:"northup",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"TrackUp",id:"trackup",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"Undefined",id:"undefined",level:3},{value:"Defined in",id:"defined-in-4",level:4}],d={toc:s},u="wrapper";function m(e){let{components:t,...n}=e;return(0,i.kt)(u,(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"An enumeration of possible map rotation types."),(0,i.kt)("h2",{id:"enumeration-members"},"Enumeration Members"),(0,i.kt)("h3",{id:"dtkup"},"DtkUp"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"DtkUp")," = ",(0,i.kt)("inlineCode",{parentName:"p"},'"DtkUp"')),(0,i.kt)("p",null,"Map up position points towards the current desired track."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/mapsystem/modules/MapRotationModule.ts:20"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"headingup"},"HeadingUp"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"HeadingUp")," = ",(0,i.kt)("inlineCode",{parentName:"p"},'"HeadingUp"')),(0,i.kt)("p",null,"Map up position points towards the current airplane heading."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/mapsystem/modules/MapRotationModule.ts:17"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"northup"},"NorthUp"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"NorthUp")," = ",(0,i.kt)("inlineCode",{parentName:"p"},'"NorthUp"')),(0,i.kt)("p",null,"Map up position points towards true north."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/mapsystem/modules/MapRotationModule.ts:11"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"trackup"},"TrackUp"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"TrackUp")," = ",(0,i.kt)("inlineCode",{parentName:"p"},'"TrackUp"')),(0,i.kt)("p",null,"Map up position points towards the current airplane track."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/mapsystem/modules/MapRotationModule.ts:14"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"undefined"},"Undefined"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"Undefined")," = ",(0,i.kt)("inlineCode",{parentName:"p"},'"Undefined"')),(0,i.kt)("p",null,"Map up position does not follow a defined pattern."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/mapsystem/modules/MapRotationModule.ts:8"))}m.isMDXComponent=!0}}]);