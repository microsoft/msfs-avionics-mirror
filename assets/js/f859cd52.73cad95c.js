"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[95312],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>m});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function s(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?s(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):s(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},s=Object.keys(e);for(n=0;n<s.length;n++)r=s[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(n=0;n<s.length;n++)r=s[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var o=n.createContext({}),p=function(e){var t=n.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},c=function(e){var t=p(e.components);return n.createElement(o.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},g=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,s=e.originalType,o=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),d=p(r),g=a,m=d["".concat(o,".").concat(g)]||d[g]||u[g]||s;return r?n.createElement(m,i(i({ref:t},c),{},{components:r})):n.createElement(m,i({ref:t},c))}));function m(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var s=r.length,i=new Array(s);i[0]=g;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l[d]="string"==typeof e?e:a,i[1]=l;for(var p=2;p<s;p++)i[p]=r[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}g.displayName="MDXCreateElement"},87968:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>o,contentTitle:()=>i,default:()=>u,frontMatter:()=>s,metadata:()=>l,toc:()=>p});var n=r(87462),a=(r(67294),r(3905));const s={id:"FgpUserSettings",title:"Class: FgpUserSettings",sidebar_label:"FgpUserSettings",sidebar_position:0,custom_edit_url:null},i=void 0,l={unversionedId:"wt21shared/classes/FgpUserSettings",id:"wt21shared/classes/FgpUserSettings",title:"Class: FgpUserSettings",description:"Utility class for retrieving FGP (Flight Guidance Panel) user setting managers.",source:"@site/docs/wt21shared/classes/FgpUserSettings.md",sourceDirName:"wt21shared/classes",slug:"/wt21shared/classes/FgpUserSettings",permalink:"/msfs-avionics-mirror/docs/wt21shared/classes/FgpUserSettings",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FgpUserSettings",title:"Class: FgpUserSettings",sidebar_label:"FgpUserSettings",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"ElapsedTimeDisplay",permalink:"/msfs-avionics-mirror/docs/wt21shared/classes/ElapsedTimeDisplay"},next:{title:"FixInfoFacilityWaypoint",permalink:"/msfs-avionics-mirror/docs/wt21shared/classes/FixInfoFacilityWaypoint"}},o={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"getManager",id:"getmanager",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4}],c={toc:p},d="wrapper";function u(e){let{components:t,...r}=e;return(0,a.kt)(d,(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Utility class for retrieving FGP (Flight Guidance Panel) user setting managers."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new FgpUserSettings"),"(): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21shared/classes/FgpUserSettings"},(0,a.kt)("inlineCode",{parentName:"a"},"FgpUserSettings"))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21shared/classes/FgpUserSettings"},(0,a.kt)("inlineCode",{parentName:"a"},"FgpUserSettings"))),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"getmanager"},"getManager"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"getManager"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"DefaultUserSettingManager"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21shared/modules#fgpsettings"},(0,a.kt)("inlineCode",{parentName:"a"},"FgpSettings")),">"),(0,a.kt)("p",null,"Retrieves a manager for FGP user settings."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"DefaultUserSettingManager"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21shared/modules#fgpsettings"},(0,a.kt)("inlineCode",{parentName:"a"},"FgpSettings")),">"),(0,a.kt)("p",null,"a manager for FGP user settings."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/shared/Profiles/FgpUserSettings.ts:46"))}u.isMDXComponent=!0}}]);