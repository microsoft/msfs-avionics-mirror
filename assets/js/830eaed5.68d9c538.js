"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[77837],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>k});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),o=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=o(e.components);return r.createElement(s.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),m=o(n),c=a,k=m["".concat(s,".").concat(c)]||m[c]||u[c]||i;return n?r.createElement(k,l(l({ref:t},p),{},{components:n})):r.createElement(k,l({ref:t},p))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=c;var d={};for(var s in t)hasOwnProperty.call(t,s)&&(d[s]=t[s]);d.originalType=e,d[m]="string"==typeof e?e:a,l[1]=d;for(var o=2;o<i;o++)l[o]=n[o];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},54932:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>d,toc:()=>o});var r=n(87462),a=(n(67294),n(3905));const i={id:"FmsSpeedManager",title:"Class: FmsSpeedManager",sidebar_label:"FmsSpeedManager",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"g3000mfd/classes/FmsSpeedManager",id:"g3000mfd/classes/FmsSpeedManager",title:"Class: FmsSpeedManager",description:"A manager which computes FMS speed targets and syncs those targets with the autopilot when in FMS-managed speed",source:"@site/docs/g3000mfd/classes/FmsSpeedManager.md",sourceDirName:"g3000mfd/classes",slug:"/g3000mfd/classes/FmsSpeedManager",permalink:"/msfs-avionics-mirror/docs/g3000mfd/classes/FmsSpeedManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FmsSpeedManager",title:"Class: FmsSpeedManager",sidebar_label:"FmsSpeedManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"DmeTuneManager",permalink:"/msfs-avionics-mirror/docs/g3000mfd/classes/DmeTuneManager"},next:{title:"FmsVSpeedManager",permalink:"/msfs-avionics-mirror/docs/g3000mfd/classes/FmsVSpeedManager"}},s={},o=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"init",id:"init",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"resetUserOverride",id:"resetuseroverride",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-3",level:4}],p={toc:o},m="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(m,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A manager which computes FMS speed targets and syncs those targets with the autopilot when in FMS-managed speed\nmode."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new FmsSpeedManager"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"facLoader"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"flightPlanner"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"speedConstraintStore"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"config"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"settingManager"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"adcIndex"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"fmsPosIndex"),")"),(0,a.kt)("p",null,"Constructor."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"facLoader")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"FacilityLoader")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A facility loader instance.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"flightPlanner")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"FlightPlanner")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flight planner.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"speedConstraintStore")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"GarminSpeedConstraintStore")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The speed constraint store.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"config")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"FmsSpeedsConfig")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A configuration object defining options related to FMS speeds.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"settingManager")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"FmsSpeedUserSettingManager")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A manager of FMS speed user settings.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"adcIndex")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"number"),">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index of the ADC used by this manager.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"fmsPosIndex")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"number"),">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index of the FMS positioning system used by this manager.")))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/MFD/FmsSpeed/FmsSpeedManager.ts:296"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"destroy"},"destroy"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Destroys this manager."),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/MFD/FmsSpeed/FmsSpeedManager.ts:1515"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"init"},"init"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"init"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,a.kt)("p",null,"Initializes this manager."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,a.kt)("p",null,"A Promise which will be fulfilled when this manager is fully initialized, or rejected if this manager is\ndestroyed before then."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/MFD/FmsSpeed/FmsSpeedManager.ts:340"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"resetuseroverride"},"resetUserOverride"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"resetUserOverride"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Resets the user-defined speed override."),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/MFD/FmsSpeed/FmsSpeedManager.ts:468"))}u.isMDXComponent=!0}}]);