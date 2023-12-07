"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[9076],{3905:(e,r,t)=>{t.d(r,{Zo:()=>p,kt:()=>f});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function s(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=n.createContext({}),d=function(e){var r=n.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},p=function(e){var r=d(e.components);return n.createElement(l.Provider,{value:r},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},u=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),c=d(t),u=a,f=c["".concat(l,".").concat(u)]||c[u]||m[u]||i;return t?n.createElement(f,o(o({ref:r},p),{},{components:t})):n.createElement(f,o({ref:r},p))}));function f(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=u;var s={};for(var l in r)hasOwnProperty.call(r,l)&&(s[l]=r[l]);s.originalType=e,s[c]="string"==typeof e?e:a,o[1]=s;for(var d=2;d<i;d++)o[d]=t[d];return n.createElement.apply(null,o)}return n.createElement.apply(null,t)}u.displayName="MDXCreateElement"},83373:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>l,contentTitle:()=>o,default:()=>m,frontMatter:()=>i,metadata:()=>s,toc:()=>d});var n=t(87462),a=(t(67294),t(3905));const i={id:"MapWxrModule",title:"Class: MapWxrModule",sidebar_label:"MapWxrModule",sidebar_position:0,custom_edit_url:null},o=void 0,s={unversionedId:"framework/classes/MapWxrModule",id:"framework/classes/MapWxrModule",title:"Class: MapWxrModule",description:"A module that describes the display of weather on a Bing Map instance.",source:"@site/docs/framework/classes/MapWxrModule.md",sourceDirName:"framework/classes",slug:"/framework/classes/MapWxrModule",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapWxrModule",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapWxrModule",title:"Class: MapWxrModule",sidebar_label:"MapWxrModule",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapWaypointSpriteIcon",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapWaypointSpriteIcon"},next:{title:"MappedSubject",permalink:"/msfs-avionics-mirror/docs/framework/classes/MappedSubject"}},l={},d=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Properties",id:"properties",level:2},{value:"isEnabled",id:"isenabled",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"weatherRadarArc",id:"weatherradararc",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"weatherRadarColors",id:"weatherradarcolors",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"weatherRadarMode",id:"weatherradarmode",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"Accessors",id:"accessors",level:2},{value:"wxrMode",id:"wxrmode",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-4",level:4}],p={toc:d},c="wrapper";function m(e){let{components:r,...t}=e;return(0,a.kt)(c,(0,n.Z)({},p,t,{components:r,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A module that describes the display of weather on a Bing Map instance."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new MapWxrModule"),"()"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"isenabled"},"isEnabled"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"isEnabled"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/Subject"},(0,a.kt)("inlineCode",{parentName:"a"},"Subject")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether the weather radar is enabled."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/modules/MapWxrModule.ts:14"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"weatherradararc"},"weatherRadarArc"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"weatherRadarArc"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/NumberUnitSubject"},(0,a.kt)("inlineCode",{parentName:"a"},"NumberUnitSubject")),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/UnitFamily#angle"},(0,a.kt)("inlineCode",{parentName:"a"},"Angle")),", ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/SimpleUnit"},(0,a.kt)("inlineCode",{parentName:"a"},"SimpleUnit")),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/UnitFamily#angle"},(0,a.kt)("inlineCode",{parentName:"a"},"Angle")),">",">"),(0,a.kt)("p",null,"The current map weather radar arc sweep angle in degrees."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/modules/MapWxrModule.ts:17"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"weatherradarcolors"},"weatherRadarColors"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"weatherRadarColors"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/ArraySubject"},(0,a.kt)("inlineCode",{parentName:"a"},"ArraySubject")),"<readonly ","[",(0,a.kt)("inlineCode",{parentName:"p"},"number"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),"]",">"),(0,a.kt)("p",null,"The current weather radar colors. Each entry ",(0,a.kt)("inlineCode",{parentName:"p"},"E_i")," of the array is a tuple ",(0,a.kt)("inlineCode",{parentName:"p"},"[color, rate]")," that defines a color\nstop, where ",(0,a.kt)("inlineCode",{parentName:"p"},"color")," is an RGBA color expressed as ",(0,a.kt)("inlineCode",{parentName:"p"},"R + G * 256 + B * 256^2 + A * 256^3")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"rate")," is a\nprecipitation rate in millimeters per hour."),(0,a.kt)("p",null,"In general, the color defined by ",(0,a.kt)("inlineCode",{parentName:"p"},"E_i")," is applied to precipitation rates ranging from the rate defined by ",(0,a.kt)("inlineCode",{parentName:"p"},"E_i-1"),"\nto the rate defined by ",(0,a.kt)("inlineCode",{parentName:"p"},"E_i"),". There are two special cases. The color defined by ",(0,a.kt)("inlineCode",{parentName:"p"},"E_0")," is applied to the\nprecipitation rates from zero to the rate defined by ",(0,a.kt)("inlineCode",{parentName:"p"},"E_0"),". The color defined by ",(0,a.kt)("inlineCode",{parentName:"p"},"E_n-1"),", where ",(0,a.kt)("inlineCode",{parentName:"p"},"n")," is the length\nof the array, is applied to the precipitation rates from the rate defined by ",(0,a.kt)("inlineCode",{parentName:"p"},"E_n-2")," to positive infinity."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/modules/MapWxrModule.ts:32"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"weatherradarmode"},"weatherRadarMode"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"weatherRadarMode"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/Subject"},(0,a.kt)("inlineCode",{parentName:"a"},"Subject")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"TOPVIEW")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"HORIZONTAL")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"VERTICAL"),">"),(0,a.kt)("p",null,"The current weather radar mode."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/modules/MapWxrModule.ts:20"),(0,a.kt)("h2",{id:"accessors"},"Accessors"),(0,a.kt)("h3",{id:"wxrmode"},"wxrMode"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"get")," ",(0,a.kt)("strong",{parentName:"p"},"wxrMode"),"(): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscribable"},(0,a.kt)("inlineCode",{parentName:"a"},"Subscribable")),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/WxrMode"},(0,a.kt)("inlineCode",{parentName:"a"},"WxrMode")),">"),(0,a.kt)("p",null,"A subscribable containing the combined WxrMode from the mode and arc subjects,\nsuitable for consumption in a MapBingLayer."),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscribable"},(0,a.kt)("inlineCode",{parentName:"a"},"Subscribable")),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/WxrMode"},(0,a.kt)("inlineCode",{parentName:"a"},"WxrMode")),">"),(0,a.kt)("p",null,"The WxrMode subscribable."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/modules/MapWxrModule.ts:51"))}m.isMDXComponent=!0}}]);