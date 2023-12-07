"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[87056],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>u});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var d=n.createContext({}),o=function(e){var t=n.useContext(d),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},p=function(e){var t=o(e.components);return n.createElement(d.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,d=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),m=o(a),k=r,u=m["".concat(d,".").concat(k)]||m[k]||c[k]||i;return a?n.createElement(u,l(l({ref:t},p),{},{components:a})):n.createElement(u,l({ref:t},p))}));function u(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=k;var s={};for(var d in t)hasOwnProperty.call(t,d)&&(s[d]=t[d]);s.originalType=e,s[m]="string"==typeof e?e:r,l[1]=s;for(var o=2;o<i;o++)l[o]=a[o];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}k.displayName="MDXCreateElement"},63623:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>s,toc:()=>o});var n=a(87462),r=(a(67294),a(3905));const i={id:"AdsbSensitivityParameters",title:"Class: AdsbSensitivityParameters",sidebar_label:"AdsbSensitivityParameters",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"garminsdk/classes/AdsbSensitivityParameters",id:"garminsdk/classes/AdsbSensitivityParameters",title:"Class: AdsbSensitivityParameters",description:"ADS-B Conflict Situational Awareness (CSA) sensitivity parameters.",source:"@site/docs/garminsdk/classes/AdsbSensitivityParameters.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/AdsbSensitivityParameters",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/AdsbSensitivityParameters",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AdsbSensitivityParameters",title:"Class: AdsbSensitivityParameters",sidebar_label:"AdsbSensitivityParameters",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AdfRadioNavSource",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/AdfRadioNavSource"},next:{title:"AhrsSystem",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/AhrsSystem"}},d={},o=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Methods",id:"methods",level:2},{value:"getTA",id:"getta",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"selectLevel",id:"selectlevel",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"selectTA",id:"selectta",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:o},m="wrapper";function c(e){let{components:t,...a}=e;return(0,r.kt)(m,(0,n.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"ADS-B Conflict Situational Awareness (CSA) sensitivity parameters."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new AdsbSensitivityParameters"),"()"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"getta"},"getTA"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getTA"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"level"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"TcasTcaParameters")),(0,r.kt)("p",null,"Gets Traffic Advisory sensitivity parameters for a given sensitivity level."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"level")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A sensitivity level.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"TcasTcaParameters")),(0,r.kt)("p",null,"Traffic Advisory sensitivity parameters for the given sensitivity level."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"garminsdk/traffic/AdsbSensitivityParameters.ts:122"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"selectlevel"},"selectLevel"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"selectLevel"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"altitude"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"cdiScalingLabel?"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"radarAltitude?"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Selects a sensitivity level for a specified environment."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"altitude")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"NumberUnitInterface"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"Unit"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The indicated altitude of the own airplane.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"cdiScalingLabel?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/CDIScaleLabel"},(0,r.kt)("inlineCode",{parentName:"a"},"CDIScaleLabel"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The CDI scaling sensitivity of the own airplane.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"radarAltitude?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"NumberUnitInterface"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"Unit"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The radar altitude of the own airplane.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The sensitivity level for the specified environment."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/traffic/AdsbSensitivityParameters.ts:54"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"selectta"},"selectTA"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"selectTA"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"altitude"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"cdiScalingLabel"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"radarAltitude?"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"TcasTcaParameters")),(0,r.kt)("p",null,"Selects Traffic Advisory sensitivity settings for a specified environment."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"altitude")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"NumberUnitInterface"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"Unit"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The indicated altitude of the own airplane.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"cdiScalingLabel")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/CDIScaleLabel"},(0,r.kt)("inlineCode",{parentName:"a"},"CDIScaleLabel"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The CDI scaling sensitivity of the own airplane.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"radarAltitude?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"NumberUnitInterface"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Distance"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"Unit"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Distance"),">",">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The radar altitude of the own airplane.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"TcasTcaParameters")),(0,r.kt)("p",null,"Traffic Advisory sensitivity settings for the specified environment."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/traffic/AdsbSensitivityParameters.ts:109"))}c.isMDXComponent=!0}}]);