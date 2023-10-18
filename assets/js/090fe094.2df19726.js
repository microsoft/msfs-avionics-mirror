"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[66994],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>v});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var o=r.createContext({}),s=function(e){var t=r.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(o.Provider,{value:t},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,o=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),c=s(n),m=i,v=c["".concat(o,".").concat(m)]||c[m]||u[m]||a;return n?r.createElement(v,l(l({ref:t},p),{},{components:n})):r.createElement(v,l({ref:t},p))}));function v(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,l=new Array(a);l[0]=m;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[c]="string"==typeof e?e:i,l[1]=d;for(var s=2;s<a;s++)l[s]=n[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},35410:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>u,frontMatter:()=>a,metadata:()=>d,toc:()=>s});var r=n(87462),i=(n(67294),n(3905));const a={id:"VsiDataProvider",title:"Interface: VsiDataProvider",sidebar_label:"VsiDataProvider",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/interfaces/VsiDataProvider",id:"garminsdk/interfaces/VsiDataProvider",title:"Interface: VsiDataProvider",description:"A data provider for a vertical speed indicator.",source:"@site/docs/garminsdk/interfaces/VsiDataProvider.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/VsiDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/VsiDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"VsiDataProvider",title:"Interface: VsiDataProvider",sidebar_label:"VsiDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"VerticalSpeedIndicatorProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/VerticalSpeedIndicatorProps"},next:{title:"WaypointAlertStateEvent",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WaypointAlertStateEvent"}},o={},s=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"isDataFailed",id:"isdatafailed",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"selectedVs",id:"selectedvs",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"targetRestriction",id:"targetrestriction",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"verticalSpeed",id:"verticalspeed",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"vsRequired",id:"vsrequired",level:3},{value:"Defined in",id:"defined-in-4",level:4}],p={toc:s},c="wrapper";function u(e){let{components:t,...n}=e;return(0,i.kt)(c,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A data provider for a vertical speed indicator."),(0,i.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultVsiDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"DefaultVsiDataProvider")))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"isdatafailed"},"isDataFailed"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"isDataFailed"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether vertical speed data is in a failure state."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/vsi/VsiDataProvider.ts:26"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"selectedvs"},"selectedVs"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"selectedVs"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current selected vertical speed, in feet per minute."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/vsi/VsiDataProvider.ts:17"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"targetrestriction"},"targetRestriction"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"targetRestriction"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#vnavtargetaltituderestriction"},(0,i.kt)("inlineCode",{parentName:"a"},"VNavTargetAltitudeRestriction")),">"),(0,i.kt)("p",null,"The target VNAV altitude restriction."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/vsi/VsiDataProvider.ts:20"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"verticalspeed"},"verticalSpeed"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"verticalSpeed"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current vertical speed, in feet per minute."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/vsi/VsiDataProvider.ts:14"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"vsrequired"},"vsRequired"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"vsRequired"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current vertical speed required to meet the next VNAV altitude restriction, in feet per minute."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/vsi/VsiDataProvider.ts:23"))}u.isMDXComponent=!0}}]);