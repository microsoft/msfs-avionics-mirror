"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[36996],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>f});var n=r(67294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function a(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var s=n.createContext({}),p=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},c=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,i=e.originalType,s=e.parentName,c=a(e,["components","mdxType","originalType","parentName"]),d=p(r),m=o,f=d["".concat(s,".").concat(m)]||d[m]||u[m]||i;return r?n.createElement(f,l(l({ref:t},c),{},{components:r})):n.createElement(f,l({ref:t},c))}));function f(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=r.length,l=new Array(i);l[0]=m;var a={};for(var s in t)hasOwnProperty.call(t,s)&&(a[s]=t[s]);a.originalType=e,a[d]="string"==typeof e?e:o,l[1]=a;for(var p=2;p<i;p++)l[p]=r[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},47605:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>a,toc:()=>p});var n=r(87462),o=(r(67294),r(3905));const i={id:"MapFlightPlanFocusRTRControllerContext",title:"Interface: MapFlightPlanFocusRTRControllerContext",sidebar_label:"MapFlightPlanFocusRTRControllerContext",sidebar_position:0,custom_edit_url:null},l=void 0,a={unversionedId:"garminsdk/interfaces/MapFlightPlanFocusRTRControllerContext",id:"garminsdk/interfaces/MapFlightPlanFocusRTRControllerContext",title:"Interface: MapFlightPlanFocusRTRControllerContext",description:"Required context properties for MapFlightPlanFocusRTRController.",source:"@site/docs/garminsdk/interfaces/MapFlightPlanFocusRTRControllerContext.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/MapFlightPlanFocusRTRControllerContext",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanFocusRTRControllerContext",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapFlightPlanFocusRTRControllerContext",title:"Interface: MapFlightPlanFocusRTRControllerContext",sidebar_label:"MapFlightPlanFocusRTRControllerContext",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapFlightPlanDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},next:{title:"MapFlightPlanFocusRTRControllerControllers",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanFocusRTRControllerControllers"}},s={},p=[{value:"Properties",id:"properties",level:2},{value:"desiredOrientationControl",id:"desiredorientationcontrol",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"targetControlModerator",id:"targetcontrolmoderator",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"useRangeSettingModerator",id:"userangesettingmoderator",level:3},{value:"Defined in",id:"defined-in-2",level:4}],c={toc:p},d="wrapper";function u(e){let{components:t,...r}=e;return(0,o.kt)(d,(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Required context properties for MapFlightPlanFocusRTRController."),(0,o.kt)("h2",{id:"properties"},"Properties"),(0,o.kt)("h3",{id:"desiredorientationcontrol"},"desiredOrientationControl"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,o.kt)("strong",{parentName:"p"},"desiredOrientationControl"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"ResourceModerator"),"<",(0,o.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,o.kt)("p",null,"Resource moderator for control of the map's desired orientation mode."),(0,o.kt)("h4",{id:"defined-in"},"Defined in"),(0,o.kt)("p",null,"garminsdk/components/map/controllers/MapFlightPlanFocusRTRController.ts:48"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"targetcontrolmoderator"},"targetControlModerator"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,o.kt)("strong",{parentName:"p"},"targetControlModerator"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"ResourceModerator"),"<",(0,o.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,o.kt)("p",null,"Resource moderator for control of the map's projection target."),(0,o.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,o.kt)("p",null,"garminsdk/components/map/controllers/MapFlightPlanFocusRTRController.ts:45"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"userangesettingmoderator"},"useRangeSettingModerator"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,o.kt)("strong",{parentName:"p"},"useRangeSettingModerator"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"ResourceModerator"),"<",(0,o.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,o.kt)("inlineCode",{parentName:"p"},"boolean"),">",">"),(0,o.kt)("p",null,"Resource moderator for the use range setting subject."),(0,o.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,o.kt)("p",null,"garminsdk/components/map/controllers/MapFlightPlanFocusRTRController.ts:51"))}u.isMDXComponent=!0}}]);