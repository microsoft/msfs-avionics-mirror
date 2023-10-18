"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[89425],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>k});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},o=Object.keys(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var d=i.createContext({}),p=function(e){var t=i.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return i.createElement(d.Provider,{value:t},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},m=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,d=e.parentName,s=a(e,["components","mdxType","originalType","parentName"]),u=p(n),m=r,k=u["".concat(d,".").concat(m)]||u[m]||c[m]||o;return n?i.createElement(k,l(l({ref:t},s),{},{components:n})):i.createElement(k,l({ref:t},s))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,l=new Array(o);l[0]=m;var a={};for(var d in t)hasOwnProperty.call(t,d)&&(a[d]=t[d]);a.originalType=e,a[u]="string"==typeof e?e:r,l[1]=a;for(var p=2;p<o;p++)l[p]=n[p];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}m.displayName="MDXCreateElement"},86971:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>c,frontMatter:()=>o,metadata:()=>a,toc:()=>p});var i=n(87462),r=(n(67294),n(3905));const o={id:"MapGarminAutopilotPropsModule",title:"Class: MapGarminAutopilotPropsModule",sidebar_label:"MapGarminAutopilotPropsModule",sidebar_position:0,custom_edit_url:null},l=void 0,a={unversionedId:"garminsdk/classes/MapGarminAutopilotPropsModule",id:"garminsdk/classes/MapGarminAutopilotPropsModule",title:"Class: MapGarminAutopilotPropsModule",description:"A module describing the state of a Garmin autopilot.",source:"@site/docs/garminsdk/classes/MapGarminAutopilotPropsModule.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/MapGarminAutopilotPropsModule",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapGarminAutopilotPropsModule",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapGarminAutopilotPropsModule",title:"Class: MapGarminAutopilotPropsModule",sidebar_label:"MapGarminAutopilotPropsModule",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapGarminAutopilotPropsController",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapGarminAutopilotPropsController"},next:{title:"MapGarminDataIntegrityModule",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapGarminDataIntegrityModule"}},d={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Properties",id:"properties",level:2},{value:"isHdgSyncModeActive",id:"ishdgsyncmodeactive",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"isTurnHdgAdjustActive",id:"isturnhdgadjustactive",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"manualHeadingSelect",id:"manualheadingselect",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"selectedAltitude",id:"selectedaltitude",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"selectedHeading",id:"selectedheading",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-4",level:4}],s={toc:p},u="wrapper";function c(e){let{components:t,...n}=e;return(0,r.kt)(u,(0,i.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A module describing the state of a Garmin autopilot."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"MapAutopilotPropsModule")),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"MapGarminAutopilotPropsModule"))))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new MapGarminAutopilotPropsModule"),"()"),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,"MapAutopilotPropsModule.constructor"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"ishdgsyncmodeactive"},"isHdgSyncModeActive"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"isHdgSyncModeActive"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether HDG sync mode is active."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/modules/MapGarminAutopilotPropsModule.ts:11"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isturnhdgadjustactive"},"isTurnHdgAdjustActive"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"isTurnHdgAdjustActive"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether automatic adjustment of selected heading during a turn is active."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/modules/MapGarminAutopilotPropsModule.ts:8"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"manualheadingselect"},"manualHeadingSelect"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"manualHeadingSelect"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"SubEvent"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"void"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,r.kt)("p",null,"An event that is triggered when the selected heading is changed manually."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/modules/MapGarminAutopilotPropsModule.ts:14"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"selectedaltitude"},"selectedAltitude"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"selectedAltitude"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NumberUnitSubject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"SimpleUnit"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Distance"),">",">"),(0,r.kt)("p",null,"The altitude preselector setting."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,"MapAutopilotPropsModule.selectedAltitude"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"sdk/components/map/modules/MapAutopilotPropsModule.ts:10"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"selectedheading"},"selectedHeading"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"selectedHeading"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The selected heading setting, in degrees."),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,"MapAutopilotPropsModule.selectedHeading"),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"sdk/components/map/modules/MapAutopilotPropsModule.ts:13"))}c.isMDXComponent=!0}}]);