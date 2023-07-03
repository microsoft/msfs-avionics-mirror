"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[67482],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>d});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=r.createContext({}),c=function(e){var t=r.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},p=function(e){var t=c(e.components);return r.createElement(o.Provider,{value:t},e.children)},g="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,o=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),g=c(n),u=a,d=g["".concat(o,".").concat(u)]||g[u]||m[u]||i;return n?r.createElement(d,s(s({ref:t},p),{},{components:n})):r.createElement(d,s({ref:t},p))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,s=new Array(i);s[0]=u;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l[g]="string"==typeof e?e:a,s[1]=l;for(var c=2;c<i;c++)s[c]=n[c];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},11985:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>s,default:()=>m,frontMatter:()=>i,metadata:()=>l,toc:()=>c});var r=n(87462),a=(n(67294),n(3905));const i={id:"BacklightUserSettings",title:"Class: BacklightUserSettings",sidebar_label:"BacklightUserSettings",sidebar_position:0,custom_edit_url:null},s=void 0,l={unversionedId:"g1000common/classes/BacklightUserSettings",id:"g1000common/classes/BacklightUserSettings",title:"Class: BacklightUserSettings",description:"Utility class for retrieving backlight user setting managers.",source:"@site/docs/g1000common/classes/BacklightUserSettings.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/BacklightUserSettings",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/BacklightUserSettings",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"BacklightUserSettings",title:"Class: BacklightUserSettings",sidebar_label:"BacklightUserSettings",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"BacklightManager",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/BacklightManager"},next:{title:"BaseGauge",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge"}},o={},c=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Properties",id:"properties",level:2},{value:"INSTANCE",id:"instance",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"getManager",id:"getmanager",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-1",level:4}],p={toc:c},g="wrapper";function m(e){let{components:t,...n}=e;return(0,a.kt)(g,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Utility class for retrieving backlight user setting managers."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new BacklightUserSettings"),"()"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"instance"},"INSTANCE"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"INSTANCE"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"DefaultUserSettingManager"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/BacklightUserSettingTypes"},(0,a.kt)("inlineCode",{parentName:"a"},"BacklightUserSettingTypes")),">"),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Backlight/BacklightUserSettings.ts:54"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"getmanager"},"getManager"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("strong",{parentName:"p"},"getManager"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"DefaultUserSettingManager"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/BacklightUserSettingTypes"},(0,a.kt)("inlineCode",{parentName:"a"},"BacklightUserSettingTypes")),">"),(0,a.kt)("p",null,"Retrieves a manager for backlight user settings."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"DefaultUserSettingManager"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/BacklightUserSettingTypes"},(0,a.kt)("inlineCode",{parentName:"a"},"BacklightUserSettingTypes")),">"),(0,a.kt)("p",null,"a manager for backlight user settings."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Backlight/BacklightUserSettings.ts:61"))}m.isMDXComponent=!0}}]);