"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[37038],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>f});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},m=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},p="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,m=s(e,["components","mdxType","originalType","parentName"]),p=c(n),u=a,f=p["".concat(l,".").concat(u)]||p[u]||d[u]||o;return n?r.createElement(f,i(i({ref:t},m),{},{components:n})):r.createElement(f,i({ref:t},m))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=u;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[p]="string"==typeof e?e:a,i[1]=s;for(var c=2;c<o;c++)i[c]=n[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},34531:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>d,frontMatter:()=>o,metadata:()=>s,toc:()=>c});var r=n(87462),a=(n(67294),n(3905));const o={id:"TawsConfig",title:"Class: TawsConfig",sidebar_label:"TawsConfig",sidebar_position:0,custom_edit_url:null},i=void 0,s={unversionedId:"g3000common/classes/TawsConfig",id:"g3000common/classes/TawsConfig",title:"Class: TawsConfig",description:"A configuration object which defines options related to TAWS.",source:"@site/docs/g3000common/classes/TawsConfig.md",sourceDirName:"g3000common/classes",slug:"/g3000common/classes/TawsConfig",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/TawsConfig",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TawsConfig",title:"Class: TawsConfig",sidebar_label:"TawsConfig",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"SpeedConstraintDisplay",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/SpeedConstraintDisplay"},next:{title:"TerrainSystemAnnunciation",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/TerrainSystemAnnunciation"}},l={},c=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"touchdownCallouts",id:"touchdowncallouts",level:3},{value:"Defined in",id:"defined-in-1",level:4}],m={toc:c},p="wrapper";function d(e){let{components:t,...n}=e;return(0,a.kt)(p,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A configuration object which defines options related to TAWS."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Deprecated"))),(0,a.kt)("p",null,"This class has been superceded by ",(0,a.kt)("inlineCode",{parentName:"p"},"TerrainSystemConfig"),"."),(0,a.kt)("h2",{id:"implements"},"Implements"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/Config"},(0,a.kt)("inlineCode",{parentName:"a"},"Config")))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new TawsConfig"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"baseInstrument"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"element"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/TawsConfig"},(0,a.kt)("inlineCode",{parentName:"a"},"TawsConfig"))),(0,a.kt)("p",null,"Creates a new TawsConfig from a configuration document element."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"baseInstrument")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"BaseInstrument")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The ",(0,a.kt)("inlineCode",{parentName:"td"},"BaseInstrument")," element associated with the configuration.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"element")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},"Element")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/TawsConfig"},(0,a.kt)("inlineCode",{parentName:"a"},"TawsConfig"))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsConfig/TawsConfig.ts:19"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"touchdowncallouts"},"touchdownCallouts"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"touchdownCallouts"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/TouchdownCalloutsConfig"},(0,a.kt)("inlineCode",{parentName:"a"},"TouchdownCalloutsConfig"))),(0,a.kt)("p",null,"Options for touchdown callouts."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsConfig/TawsConfig.ts:12"))}d.isMDXComponent=!0}}]);