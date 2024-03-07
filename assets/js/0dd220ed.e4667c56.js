"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[64407],{3905:(e,t,r)=>{r.d(t,{Zo:()=>l,kt:()=>f});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var d=n.createContext({}),c=function(e){var t=n.useContext(d),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},l=function(e){var t=c(e.components);return n.createElement(d.Provider,{value:t},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,a=e.originalType,d=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),p=c(r),m=i,f=p["".concat(d,".").concat(m)]||p[m]||u[m]||a;return r?n.createElement(f,o(o({ref:t},l),{},{components:r})):n.createElement(f,o({ref:t},l))}));function f(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=r.length,o=new Array(a);o[0]=m;var s={};for(var d in t)hasOwnProperty.call(t,d)&&(s[d]=t[d]);s.originalType=e,s[p]="string"==typeof e?e:i,o[1]=s;for(var c=2;c<a;c++)o[c]=r[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},94863:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>d,contentTitle:()=>o,default:()=>u,frontMatter:()=>a,metadata:()=>s,toc:()=>c});var n=r(87462),i=(r(67294),r(3905));const a={id:"AirspeedIndicatorGsDataProvider",title:"Interface: AirspeedIndicatorGsDataProvider",sidebar_label:"AirspeedIndicatorGsDataProvider",sidebar_position:0,custom_edit_url:null},o=void 0,s={unversionedId:"g3xtouchcommon/interfaces/AirspeedIndicatorGsDataProvider",id:"g3xtouchcommon/interfaces/AirspeedIndicatorGsDataProvider",title:"Interface: AirspeedIndicatorGsDataProvider",description:"A ground speed data provider for an airspeed indicator.",source:"@site/docs/g3xtouchcommon/interfaces/AirspeedIndicatorGsDataProvider.md",sourceDirName:"g3xtouchcommon/interfaces",slug:"/g3xtouchcommon/interfaces/AirspeedIndicatorGsDataProvider",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/AirspeedIndicatorGsDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AirspeedIndicatorGsDataProvider",title:"Interface: AirspeedIndicatorGsDataProvider",sidebar_label:"AirspeedIndicatorGsDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AirportWeatherTabProps",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/AirportWeatherTabProps"},next:{title:"ApproachDialogProps",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/ApproachDialogProps"}},d={},c=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"gsKnots",id:"gsknots",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"isDataFailed",id:"isdatafailed",level:3},{value:"Defined in",id:"defined-in-1",level:4}],l={toc:c},p="wrapper";function u(e){let{components:t,...r}=e;return(0,i.kt)(p,(0,n.Z)({},l,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A ground speed data provider for an airspeed indicator."),(0,i.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/DefaultAirspeedIndicatorGsDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"DefaultAirspeedIndicatorGsDataProvider")))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"gsknots"},"gsKnots"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"gsKnots"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The current ground speed, in knots."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/PFD/Components/AirspeedIndicator/AirspeedIndicatorGsDataProvider.ts:10"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isdatafailed"},"isDataFailed"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"isDataFailed"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether ground speed data is in a failure state."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/PFD/Components/AirspeedIndicator/AirspeedIndicatorGsDataProvider.ts:13"))}u.isMDXComponent=!0}}]);