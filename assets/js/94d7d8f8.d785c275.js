"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[27957],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>u});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},o=Object.keys(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var s=r.createContext({}),d=function(e){var t=r.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},m=function(e){var t=d(e.components);return r.createElement(s.Provider,{value:t},e.children)},c="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,o=e.originalType,s=e.parentName,m=i(e,["components","mdxType","originalType","parentName"]),c=d(a),f=n,u=c["".concat(s,".").concat(f)]||c[f]||p[f]||o;return a?r.createElement(u,l(l({ref:t},m),{},{components:a})):r.createElement(u,l({ref:t},m))}));function u(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=a.length,l=new Array(o);l[0]=f;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i[c]="string"==typeof e?e:n,l[1]=i;for(var d=2;d<o;d++)l[d]=a[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}f.displayName="MDXCreateElement"},769:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>p,frontMatter:()=>o,metadata:()=>i,toc:()=>d});var r=a(87462),n=(a(67294),a(3905));const o={id:"ToldDatabase",title:"Interface: ToldDatabase",sidebar_label:"ToldDatabase",sidebar_position:0,custom_edit_url:null},l=void 0,i={unversionedId:"g3000common/interfaces/ToldDatabase",id:"g3000common/interfaces/ToldDatabase",title:"Interface: ToldDatabase",description:"A TOLD (takeoff/landing) performance database.",source:"@site/docs/g3000common/interfaces/ToldDatabase.md",sourceDirName:"g3000common/interfaces",slug:"/g3000common/interfaces/ToldDatabase",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/ToldDatabase",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"ToldDatabase",title:"Interface: ToldDatabase",sidebar_label:"ToldDatabase",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"ToldControlEvents",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/ToldControlEvents"},next:{title:"ToldLandingParameters",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/ToldLandingParameters"}},s={},d=[{value:"Methods",id:"methods",level:2},{value:"calculateLandingPerformance",id:"calculatelandingperformance",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"calculateTakeoffPerformance",id:"calculatetakeoffperformance",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"getVersionString",id:"getversionstring",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4}],m={toc:d},c="wrapper";function p(e){let{components:t,...a}=e;return(0,n.kt)(c,(0,r.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A TOLD (takeoff/landing) performance database."),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"calculatelandingperformance"},"calculateLandingPerformance"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"calculateLandingPerformance"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"params"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"out"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldlandingperformanceresult"},(0,n.kt)("inlineCode",{parentName:"a"},"ToldLandingPerformanceResult"))),(0,n.kt)("p",null,"Calculates landing performance values."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"params")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/ToldLandingParameters"},(0,n.kt)("inlineCode",{parentName:"a"},"ToldLandingParameters")),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The landing parameters to use for the calculation.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"out")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldlandingperformanceresult"},(0,n.kt)("inlineCode",{parentName:"a"},"ToldLandingPerformanceResult"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The object to which to write the results.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldlandingperformanceresult"},(0,n.kt)("inlineCode",{parentName:"a"},"ToldLandingPerformanceResult"))),(0,n.kt)("p",null,"The calculated landing performance values for the specified parameters."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldDatabase.ts:27"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"calculatetakeoffperformance"},"calculateTakeoffPerformance"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"calculateTakeoffPerformance"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"params"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"out"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldtakeoffperformanceresult"},(0,n.kt)("inlineCode",{parentName:"a"},"ToldTakeoffPerformanceResult"))),(0,n.kt)("p",null,"Calculates takeoff performance values."),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"params")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/ToldTakeoffParameters"},(0,n.kt)("inlineCode",{parentName:"a"},"ToldTakeoffParameters")),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The takeoff parameters to use for the calculation.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"out")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldtakeoffperformanceresult"},(0,n.kt)("inlineCode",{parentName:"a"},"ToldTakeoffPerformanceResult"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The object to which to write the results.")))),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#toldtakeoffperformanceresult"},(0,n.kt)("inlineCode",{parentName:"a"},"ToldTakeoffPerformanceResult"))),(0,n.kt)("p",null,"The calculated takeoff performance values for the specified parameters."),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldDatabase.ts:19"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"getversionstring"},"getVersionString"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"getVersionString"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("p",null,"Gets a string describing this database's version."),(0,n.kt)("h4",{id:"returns-2"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"string")),(0,n.kt)("p",null,"A string describing this database's version."),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Performance/TOLD/ToldDatabase.ts:11"))}p.isMDXComponent=!0}}]);