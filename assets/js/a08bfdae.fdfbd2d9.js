"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[89590],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>c});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),s=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},d=function(e){var t=s(e.components);return n.createElement(p.Provider,{value:t},e.children)},u="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),u=s(r),m=a,c=u["".concat(p,".").concat(m)]||u[m]||f[m]||i;return r?n.createElement(c,o(o({ref:t},d),{},{components:r})):n.createElement(c,o({ref:t},d))}));function c(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=m;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[u]="string"==typeof e?e:a,o[1]=l;for(var s=2;s<i;s++)o[s]=r[s];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},71068:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>f,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var n=r(87462),a=(r(67294),r(3905));const i={id:"TemperatureInfoDataProvider",title:"Interface: TemperatureInfoDataProvider",sidebar_label:"TemperatureInfoDataProvider",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"g3000pfd/interfaces/TemperatureInfoDataProvider",id:"g3000pfd/interfaces/TemperatureInfoDataProvider",title:"Interface: TemperatureInfoDataProvider",description:"A data provider for a temperature information display.",source:"@site/docs/g3000pfd/interfaces/TemperatureInfoDataProvider.md",sourceDirName:"g3000pfd/interfaces",slug:"/g3000pfd/interfaces/TemperatureInfoDataProvider",permalink:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/TemperatureInfoDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TemperatureInfoDataProvider",title:"Interface: TemperatureInfoDataProvider",sidebar_label:"TemperatureInfoDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"SpeedInfoProps",permalink:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/SpeedInfoProps"},next:{title:"TemperatureInfoProps",permalink:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/TemperatureInfoProps"}},p={},s=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"deltaIsa",id:"deltaisa",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"isDataFailed",id:"isdatafailed",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"oat",id:"oat",level:3},{value:"Defined in",id:"defined-in-2",level:4}],d={toc:s},u="wrapper";function f(e){let{components:t,...r}=e;return(0,a.kt)(u,(0,n.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A data provider for a temperature information display."),(0,a.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000pfd/classes/DefaultTemperatureInfoDataProvider"},(0,a.kt)("inlineCode",{parentName:"a"},"DefaultTemperatureInfoDataProvider")))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"deltaisa"},"deltaIsa"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"deltaIsa"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The current deviation of outside air temperature from ISA, in degrees Celsius."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/BottomInfoPanel/TemperatureInfo/TemperatureInfoDataProvider.ts:15"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isdatafailed"},"isDataFailed"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"isDataFailed"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether this provider's data is in a failed state."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/BottomInfoPanel/TemperatureInfo/TemperatureInfoDataProvider.ts:18"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"oat"},"oat"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"oat"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The current outside (static) air temperature, in degrees Celsius."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/BottomInfoPanel/TemperatureInfo/TemperatureInfoDataProvider.ts:12"))}f.isMDXComponent=!0}}]);