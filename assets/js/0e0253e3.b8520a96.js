"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[39845],{3905:(t,e,n)=>{n.d(e,{Zo:()=>d,kt:()=>g});var r=n(67294);function a(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function o(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?i(Object(n),!0).forEach((function(e){a(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function l(t,e){if(null==t)return{};var n,r,a=function(t,e){if(null==t)return{};var n,r,a={},i=Object.keys(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||(a[n]=t[n]);return a}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(a[n]=t[n])}return a}var s=r.createContext({}),u=function(t){var e=r.useContext(s),n=e;return t&&(n="function"==typeof t?t(e):o(o({},e),t)),n},d=function(t){var e=u(t.components);return r.createElement(s.Provider,{value:e},t.children)},m="mdxType",c={inlineCode:"code",wrapper:function(t){var e=t.children;return r.createElement(r.Fragment,{},e)}},p=r.forwardRef((function(t,e){var n=t.components,a=t.mdxType,i=t.originalType,s=t.parentName,d=l(t,["components","mdxType","originalType","parentName"]),m=u(n),p=a,g=m["".concat(s,".").concat(p)]||m[p]||c[p]||i;return n?r.createElement(g,o(o({ref:e},d),{},{components:n})):r.createElement(g,o({ref:e},d))}));function g(t,e){var n=arguments,a=e&&e.mdxType;if("string"==typeof t||a){var i=n.length,o=new Array(i);o[0]=p;var l={};for(var s in e)hasOwnProperty.call(e,s)&&(l[s]=e[s]);l.originalType=t,l[m]="string"==typeof t?t:a,o[1]=l;for(var u=2;u<i;u++)o[u]=n[u];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}p.displayName="MDXCreateElement"},64987:(t,e,n)=>{n.r(e),n.d(e,{assets:()=>s,contentTitle:()=>o,default:()=>c,frontMatter:()=>i,metadata:()=>l,toc:()=>u});var r=n(87462),a=(n(67294),n(3905));const i={id:"G3000AutothrottleEvents",title:"Interface: G3000AutothrottleEvents",sidebar_label:"G3000AutothrottleEvents",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"g3000common/interfaces/G3000AutothrottleEvents",id:"g3000common/interfaces/G3000AutothrottleEvents",title:"Interface: G3000AutothrottleEvents",description:"Events related to a G3000 autothrottle.",source:"@site/docs/g3000common/interfaces/G3000AutothrottleEvents.md",sourceDirName:"g3000common/interfaces",slug:"/g3000common/interfaces/G3000AutothrottleEvents",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/G3000AutothrottleEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"G3000AutothrottleEvents",title:"Interface: G3000AutothrottleEvents",sidebar_label:"G3000AutothrottleEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FuelTotalizerEvents",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/FuelTotalizerEvents"},next:{title:"G3000BacklightEvents",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/G3000BacklightEvents"}},s={},u=[{value:"Properties",id:"properties",level:2},{value:"g3000_at_fma_data",id:"g3000_at_fma_data",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"g3000_at_mode_active",id:"g3000_at_mode_active",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"g3000_at_mode_armed",id:"g3000_at_mode_armed",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"g3000_at_status",id:"g3000_at_status",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"g3000_at_target_ias",id:"g3000_at_target_ias",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"g3000_at_target_mach",id:"g3000_at_target_mach",level:3},{value:"Defined in",id:"defined-in-5",level:4}],d={toc:u},m="wrapper";function c(t){let{components:e,...n}=t;return(0,a.kt)(m,(0,r.Z)({},d,n,{components:e,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Events related to a G3000 autothrottle."),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"g3000_at_fma_data"},"g3000","_","at","_","fma","_","data"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"g3000","_","at","_","fma","_","data"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000autothrottlefmadata"},(0,a.kt)("inlineCode",{parentName:"a"},"G3000AutothrottleFmaData")),">"),(0,a.kt)("p",null,"Autothrottle data to display on the PFD FMA (ACFS status box)."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Autothrottle/G3000Autothrottle.ts:54"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"g3000_at_mode_active"},"g3000","_","at","_","mode","_","active"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"g3000","_","at","_","mode","_","active"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"The name of the active autothrottle mode."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Autothrottle/G3000Autothrottle.ts:45"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"g3000_at_mode_armed"},"g3000","_","at","_","mode","_","armed"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"g3000","_","at","_","mode","_","armed"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"The name of the armed autothrottle mode."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Autothrottle/G3000Autothrottle.ts:42"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"g3000_at_status"},"g3000","_","at","_","status"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"g3000","_","at","_","status"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/G3000AutothrottleStatus"},(0,a.kt)("inlineCode",{parentName:"a"},"G3000AutothrottleStatus"))),(0,a.kt)("p",null,"The status of the autothrottle."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Autothrottle/G3000Autothrottle.ts:39"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"g3000_at_target_ias"},"g3000","_","at","_","target","_","ias"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"g3000","_","at","_","target","_","ias"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The active target indicated airspeed, in knots. A negative value indicates there is no active target IAS."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Autothrottle/G3000Autothrottle.ts:48"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"g3000_at_target_mach"},"g3000","_","at","_","target","_","mach"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"g3000","_","at","_","target","_","mach"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The active target mach number. A negative value indicates there is no active target mach number."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Autothrottle/G3000Autothrottle.ts:51"))}c.isMDXComponent=!0}}]);