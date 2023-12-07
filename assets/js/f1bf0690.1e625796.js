"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[69465],{3905:(e,n,t)=>{t.d(n,{Zo:()=>s,kt:()=>m});var i=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,i,r=function(e,n){if(null==e)return{};var t,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var d=i.createContext({}),p=function(e){var n=i.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},s=function(e){var n=p(e.components);return i.createElement(d.Provider,{value:n},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},f=i.forwardRef((function(e,n){var t=e.components,r=e.mdxType,a=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),c=p(t),f=r,m=c["".concat(d,".").concat(f)]||c[f]||u[f]||a;return t?i.createElement(m,l(l({ref:n},s),{},{components:t})):i.createElement(m,l({ref:n},s))}));function m(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var a=t.length,l=new Array(a);l[0]=f;var o={};for(var d in n)hasOwnProperty.call(n,d)&&(o[d]=n[d]);o.originalType=e,o[c]="string"==typeof e?e:r,l[1]=o;for(var p=2;p<a;p++)l[p]=t[p];return i.createElement.apply(null,l)}return i.createElement.apply(null,t)}f.displayName="MDXCreateElement"},63913:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>l,default:()=>u,frontMatter:()=>a,metadata:()=>o,toc:()=>p});var i=t(87462),r=(t(67294),t(3905));const a={id:"WindDisplayProps",title:"Interface: WindDisplayProps",sidebar_label:"WindDisplayProps",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/interfaces/WindDisplayProps",id:"garminsdk/interfaces/WindDisplayProps",title:"Interface: WindDisplayProps",description:"Component props for WindDisplay.",source:"@site/docs/garminsdk/interfaces/WindDisplayProps.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/WindDisplayProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WindDisplayProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"WindDisplayProps",title:"Interface: WindDisplayProps",sidebar_label:"WindDisplayProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"WindDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WindDataProvider"},next:{title:"Overview",permalink:"/msfs-avionics-mirror/docs/plugins/overview"}},d={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"dataProvider",id:"dataprovider",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"declutter",id:"declutter",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"option",id:"option",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"unitsSettingManager",id:"unitssettingmanager",level:3},{value:"Defined in",id:"defined-in-5",level:4}],s={toc:p},c="wrapper";function u(e){let{components:n,...t}=e;return(0,r.kt)(c,(0,i.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Component props for WindDisplay."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"WindDisplayProps"))))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"children"},"children"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"children"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,r.kt)("p",null,"The children of the display component."),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,"ComponentProps.children"),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:122"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"dataprovider"},"dataProvider"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"dataProvider"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/WindDataProvider"},(0,r.kt)("inlineCode",{parentName:"a"},"WindDataProvider"))),(0,r.kt)("p",null,"A provider of wind data."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/wind/WindDisplay.tsx:25"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"declutter"},"declutter"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"declutter"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether the display should be decluttered."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/wind/WindDisplay.tsx:34"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"option"},"option"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"option"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/WindDisplayOption"},(0,r.kt)("inlineCode",{parentName:"a"},"WindDisplayOption")),">"),(0,r.kt)("p",null,"The wind option to display."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/wind/WindDisplay.tsx:28"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ref"},"ref"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"ref"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,r.kt)("p",null,"A reference to the display component."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,"ComponentProps.ref"),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:125"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"unitssettingmanager"},"unitsSettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"unitsSettingManager"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/UnitsUserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"UnitsUserSettingManager"))),(0,r.kt)("p",null,"A manager for display units user settings."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/wind/WindDisplay.tsx:31"))}u.isMDXComponent=!0}}]);