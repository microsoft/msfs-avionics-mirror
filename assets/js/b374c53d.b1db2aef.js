"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[29868],{3905:(e,n,r)=>{r.d(n,{Zo:()=>u,kt:()=>m});var t=r(67294);function l(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function o(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function i(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?o(Object(r),!0).forEach((function(n){l(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function a(e,n){if(null==e)return{};var r,t,l=function(e,n){if(null==e)return{};var r,t,l={},o=Object.keys(e);for(t=0;t<o.length;t++)r=o[t],n.indexOf(r)>=0||(l[r]=e[r]);return l}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(t=0;t<o.length;t++)r=o[t],n.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(l[r]=e[r])}return l}var s=t.createContext({}),p=function(e){var n=t.useContext(s),r=n;return e&&(r="function"==typeof e?e(n):i(i({},n),e)),r},u=function(e){var n=p(e.components);return t.createElement(s.Provider,{value:n},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},f=t.forwardRef((function(e,n){var r=e.components,l=e.mdxType,o=e.originalType,s=e.parentName,u=a(e,["components","mdxType","originalType","parentName"]),c=p(r),f=l,m=c["".concat(s,".").concat(f)]||c[f]||d[f]||o;return r?t.createElement(m,i(i({ref:n},u),{},{components:r})):t.createElement(m,i({ref:n},u))}));function m(e,n){var r=arguments,l=n&&n.mdxType;if("string"==typeof e||l){var o=r.length,i=new Array(o);i[0]=f;var a={};for(var s in n)hasOwnProperty.call(n,s)&&(a[s]=n[s]);a.originalType=e,a[c]="string"==typeof e?e:l,i[1]=a;for(var p=2;p<o;p++)i[p]=r[p];return t.createElement.apply(null,i)}return t.createElement.apply(null,r)}f.displayName="MDXCreateElement"},32527:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>s,contentTitle:()=>i,default:()=>d,frontMatter:()=>o,metadata:()=>a,toc:()=>p});var t=r(87462),l=(r(67294),r(3905));const o={id:"MapFlightPlanFocusRTRControllerModules",title:"Interface: MapFlightPlanFocusRTRControllerModules",sidebar_label:"MapFlightPlanFocusRTRControllerModules",sidebar_position:0,custom_edit_url:null},i=void 0,a={unversionedId:"garminsdk/interfaces/MapFlightPlanFocusRTRControllerModules",id:"garminsdk/interfaces/MapFlightPlanFocusRTRControllerModules",title:"Interface: MapFlightPlanFocusRTRControllerModules",description:"Modules required for MapFlightPlanFocusRTRController.",source:"@site/docs/garminsdk/interfaces/MapFlightPlanFocusRTRControllerModules.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/MapFlightPlanFocusRTRControllerModules",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanFocusRTRControllerModules",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapFlightPlanFocusRTRControllerModules",title:"Interface: MapFlightPlanFocusRTRControllerModules",sidebar_label:"MapFlightPlanFocusRTRControllerModules",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapFlightPlanFocusRTRControllerControllers",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanFocusRTRControllerControllers"},next:{title:"MapFlightPlanLayerProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanLayerProps"}},s={},p=[{value:"Properties",id:"properties",level:2},{value:"flightPlanFocus",id:"flightplanfocus",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"orientation",id:"orientation",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"ownAirplaneProps",id:"ownairplaneprops",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"range",id:"range",level:3},{value:"Defined in",id:"defined-in-3",level:4}],u={toc:p},c="wrapper";function d(e){let{components:n,...r}=e;return(0,l.kt)(c,(0,t.Z)({},u,r,{components:n,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"Modules required for MapFlightPlanFocusRTRController."),(0,l.kt)("h2",{id:"properties"},"Properties"),(0,l.kt)("h3",{id:"flightplanfocus"},"flightPlanFocus"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"flightPlanFocus"),": ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapFlightPlanFocusModule"},(0,l.kt)("inlineCode",{parentName:"a"},"MapFlightPlanFocusModule"))),(0,l.kt)("p",null,"Flight plan focus module."),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,"src/garminsdk/components/map/controllers/MapFlightPlanFocusRTRController.ts:26"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"orientation"},"orientation"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"orientation"),": ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapOrientationModule"},(0,l.kt)("inlineCode",{parentName:"a"},"MapOrientationModule"))),(0,l.kt)("p",null,"Orientation module."),(0,l.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,l.kt)("p",null,"src/garminsdk/components/map/controllers/MapFlightPlanFocusRTRController.ts:29"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ownairplaneprops"},"ownAirplaneProps"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ownAirplaneProps"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"MapOwnAirplanePropsModule")),(0,l.kt)("p",null,"Own airplane props module."),(0,l.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,l.kt)("p",null,"src/garminsdk/components/map/controllers/MapFlightPlanFocusRTRController.ts:23"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"range"},"range"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"range"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"MapIndexedRangeModule")),(0,l.kt)("p",null,"Range module."),(0,l.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,l.kt)("p",null,"src/garminsdk/components/map/controllers/MapFlightPlanFocusRTRController.ts:20"))}d.isMDXComponent=!0}}]);