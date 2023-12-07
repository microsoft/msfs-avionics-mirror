"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[66617],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>g});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function s(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?s(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):s(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},s=Object.keys(e);for(r=0;r<s.length;r++)a=s[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)a=s[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var l=r.createContext({}),c=function(e){var t=r.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},p=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,s=e.originalType,l=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),u=c(a),d=n,g=u["".concat(l,".").concat(d)]||u[d]||m[d]||s;return a?r.createElement(g,i(i({ref:t},p),{},{components:a})):r.createElement(g,i({ref:t},p))}));function g(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var s=a.length,i=new Array(s);i[0]=d;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[u]="string"==typeof e?e:n,i[1]=o;for(var c=2;c<s;c++)i[c]=a[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,a)}d.displayName="MDXCreateElement"},9350:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>m,frontMatter:()=>s,metadata:()=>o,toc:()=>c});var r=a(87462),n=(a(67294),a(3905));const s={id:"MFDNavDataBarUserSettings",title:"Class: MFDNavDataBarUserSettings",sidebar_label:"MFDNavDataBarUserSettings",sidebar_position:0,custom_edit_url:null},i=void 0,o={unversionedId:"g1000common/classes/MFDNavDataBarUserSettings",id:"g1000common/classes/MFDNavDataBarUserSettings",title:"Class: MFDNavDataBarUserSettings",description:"Utility class for retrieving MFD navigation data bar user setting managers.",source:"@site/docs/g1000common/classes/MFDNavDataBarUserSettings.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/MFDNavDataBarUserSettings",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/MFDNavDataBarUserSettings",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MFDNavDataBarUserSettings",title:"Class: MFDNavDataBarUserSettings",sidebar_label:"MFDNavDataBarUserSettings",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MFDNavDataBar",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/MFDNavDataBar"},next:{title:"MFDNavMapPage",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/MFDNavMapPage"}},l={},c=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Methods",id:"methods",level:2},{value:"getManager",id:"getmanager",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4}],p={toc:c},u="wrapper";function m(e){let{components:t,...a}=e;return(0,n.kt)(u,(0,r.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Utility class for retrieving MFD navigation data bar user setting managers."),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new MFDNavDataBarUserSettings"),"()"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"getmanager"},"getManager"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,n.kt)("strong",{parentName:"p"},"getManager"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"bus"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"DefaultUserSettingManager"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"NavDataBarSettingTypes"),">"),(0,n.kt)("p",null,"Retrieves a manager for MFD navigation data bar user settings."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"bus")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"DefaultUserSettingManager"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"NavDataBarSettingTypes"),">"),(0,n.kt)("p",null,"a manager for MFD navigation data bar user settings."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/UI/NavDataBar/MFDNavDataBarUserSettings.ts:16"))}m.isMDXComponent=!0}}]);