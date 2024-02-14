"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[43653],{3905:(e,n,a)=>{a.d(n,{Zo:()=>d,kt:()=>m});var r=a(67294);function t(e,n,a){return n in e?Object.defineProperty(e,n,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[n]=a,e}function i(e,n){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var n=1;n<arguments.length;n++){var a=null!=arguments[n]?arguments[n]:{};n%2?i(Object(a),!0).forEach((function(n){t(e,n,a[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(a,n))}))}return e}function o(e,n){if(null==e)return{};var a,r,t=function(e,n){if(null==e)return{};var a,r,t={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],n.indexOf(a)>=0||(t[a]=e[a]);return t}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],n.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(t[a]=e[a])}return t}var s=r.createContext({}),p=function(e){var n=r.useContext(s),a=n;return e&&(a="function"==typeof e?e(n):l(l({},n),e)),a},d=function(e){var n=p(e.components);return r.createElement(s.Provider,{value:n},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},v=r.forwardRef((function(e,n){var a=e.components,t=e.mdxType,i=e.originalType,s=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),u=p(a),v=t,m=u["".concat(s,".").concat(v)]||u[v]||c[v]||i;return a?r.createElement(m,l(l({ref:n},d),{},{components:a})):r.createElement(m,l({ref:n},d))}));function m(e,n){var a=arguments,t=n&&n.mdxType;if("string"==typeof e||t){var i=a.length,l=new Array(i);l[0]=v;var o={};for(var s in n)hasOwnProperty.call(n,s)&&(o[s]=n[s]);o.originalType=e,o[u]="string"==typeof e?e:t,l[1]=o;for(var p=2;p<i;p++)l[p]=a[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}v.displayName="MDXCreateElement"},39868:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>s,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>o,toc:()=>p});var r=a(87462),t=(a(67294),a(3905));const i={id:"GarminVNavManager2InternalComputerOptions",title:"Interface: GarminVNavManager2InternalComputerOptions",sidebar_label:"GarminVNavManager2InternalComputerOptions",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/interfaces/GarminVNavManager2InternalComputerOptions",id:"garminsdk/interfaces/GarminVNavManager2InternalComputerOptions",title:"Interface: GarminVNavManager2InternalComputerOptions",description:"Options for GarminVNavManager2.",source:"@site/docs/garminsdk/interfaces/GarminVNavManager2InternalComputerOptions.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/GarminVNavManager2InternalComputerOptions",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/GarminVNavManager2InternalComputerOptions",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GarminVNavManager2InternalComputerOptions",title:"Interface: GarminVNavManager2InternalComputerOptions",sidebar_label:"GarminVNavManager2InternalComputerOptions",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GarminVNavEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/GarminVNavEvents"},next:{title:"GarminVNavManagerEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/GarminVNavManagerEvents"}},s={},p=[{value:"Properties",id:"properties",level:2},{value:"allowApproachBaroVNav",id:"allowapproachbarovnav",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"allowPlusVWithoutSbas",id:"allowplusvwithoutsbas",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"allowRnpAr",id:"allowrnpar",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"enableAdvancedVNav",id:"enableadvancedvnav",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"gpsSystemState",id:"gpssystemstate",level:3},{value:"Defined in",id:"defined-in-4",level:4}],d={toc:p},u="wrapper";function c(e){let{components:n,...a}=e;return(0,t.kt)(u,(0,r.Z)({},d,a,{components:n,mdxType:"MDXLayout"}),(0,t.kt)("p",null,"Options for ",(0,t.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminVNavManager2"},"GarminVNavManager2"),"."),(0,t.kt)("h2",{id:"properties"},"Properties"),(0,t.kt)("h3",{id:"allowapproachbarovnav"},"allowApproachBaroVNav"),(0,t.kt)("p",null,"\u2022 ",(0,t.kt)("strong",{parentName:"p"},"allowApproachBaroVNav"),": ",(0,t.kt)("inlineCode",{parentName:"p"},"boolean")),(0,t.kt)("p",null,"Whether to allow approach service levels requiring baro VNAV."),(0,t.kt)("h4",{id:"defined-in"},"Defined in"),(0,t.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavManager2.ts:22"),(0,t.kt)("hr",null),(0,t.kt)("h3",{id:"allowplusvwithoutsbas"},"allowPlusVWithoutSbas"),(0,t.kt)("p",null,"\u2022 ",(0,t.kt)("strong",{parentName:"p"},"allowPlusVWithoutSbas"),": ",(0,t.kt)("inlineCode",{parentName:"p"},"boolean")),(0,t.kt)("p",null,"Whether to allow +V approach service levels when no SBAS is present."),(0,t.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,t.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavManager2.ts:19"),(0,t.kt)("hr",null),(0,t.kt)("h3",{id:"allowrnpar"},"allowRnpAr"),(0,t.kt)("p",null,"\u2022 ",(0,t.kt)("strong",{parentName:"p"},"allowRnpAr"),": ",(0,t.kt)("inlineCode",{parentName:"p"},"boolean")),(0,t.kt)("p",null,"Whether to allow RNP (AR) approach service levels."),(0,t.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,t.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavManager2.ts:25"),(0,t.kt)("hr",null),(0,t.kt)("h3",{id:"enableadvancedvnav"},"enableAdvancedVNav"),(0,t.kt)("p",null,"\u2022 ",(0,t.kt)("strong",{parentName:"p"},"enableAdvancedVNav"),": ",(0,t.kt)("inlineCode",{parentName:"p"},"boolean")),(0,t.kt)("p",null,"Whether to enable Garmin advanced VNAV."),(0,t.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,t.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavManager2.ts:16"),(0,t.kt)("hr",null),(0,t.kt)("h3",{id:"gpssystemstate"},"gpsSystemState"),(0,t.kt)("p",null,"\u2022 ",(0,t.kt)("strong",{parentName:"p"},"gpsSystemState"),": ",(0,t.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,t.kt)("inlineCode",{parentName:"p"},"GPSSystemState"),">"),(0,t.kt)("p",null,"The current GPS system state."),(0,t.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,t.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavManager2.ts:28"))}c.isMDXComponent=!0}}]);