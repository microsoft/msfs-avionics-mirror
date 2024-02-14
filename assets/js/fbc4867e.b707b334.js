"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[30227],{3905:(e,t,r)=>{r.d(t,{Zo:()=>m,kt:()=>u});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var s=n.createContext({}),p=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},m=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},d="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),d=p(r),c=i,u=d["".concat(s,".").concat(c)]||d[c]||f[c]||a;return r?n.createElement(u,o(o({ref:t},m),{},{components:r})):n.createElement(u,o({ref:t},m))}));function u(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=r.length,o=new Array(a);o[0]=c;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[d]="string"==typeof e?e:i,o[1]=l;for(var p=2;p<a;p++)o[p]=r[p];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},37306:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>f,frontMatter:()=>a,metadata:()=>l,toc:()=>p});var n=r(87462),i=(r(67294),r(3905));const a={id:"TimeInfoDataProvider",title:"Interface: TimeInfoDataProvider",sidebar_label:"TimeInfoDataProvider",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"g3000pfd/interfaces/TimeInfoDataProvider",id:"g3000pfd/interfaces/TimeInfoDataProvider",title:"Interface: TimeInfoDataProvider",description:"A data provider for a time information display.",source:"@site/docs/g3000pfd/interfaces/TimeInfoDataProvider.md",sourceDirName:"g3000pfd/interfaces",slug:"/g3000pfd/interfaces/TimeInfoDataProvider",permalink:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/TimeInfoDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TimeInfoDataProvider",title:"Interface: TimeInfoDataProvider",sidebar_label:"TimeInfoDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"TemperatureInfoProps",permalink:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/TemperatureInfoProps"},next:{title:"TimeInfoProps",permalink:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/TimeInfoProps"}},s={},p=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"time",id:"time",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"timerValue",id:"timervalue",level:3},{value:"Defined in",id:"defined-in-1",level:4}],m={toc:p},d="wrapper";function f(e){let{components:t,...r}=e;return(0,i.kt)(d,(0,n.Z)({},m,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A data provider for a time information display."),(0,i.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000pfd/classes/DefaultTimeInfoDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"DefaultTimeInfoDataProvider")))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"time"},"time"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"time"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current sim time, as a UNIX timestamp in milliseconds."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/BottomInfoPanel/TimeInfo/TimeInfoDataProvider.ts:9"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"timervalue"},"timerValue"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"timerValue"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current timer value, in milliseconds."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/BottomInfoPanel/TimeInfo/TimeInfoDataProvider.ts:12"))}f.isMDXComponent=!0}}]);