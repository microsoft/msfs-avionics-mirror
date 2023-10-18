"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[45008],{3905:(e,n,t)=>{t.d(n,{Zo:()=>s,kt:()=>m});var i=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,i,r=function(e,n){if(null==e)return{};var t,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var p=i.createContext({}),d=function(e){var n=i.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},s=function(e){var n=d(e.components);return i.createElement(p.Provider,{value:n},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},f=i.forwardRef((function(e,n){var t=e.components,r=e.mdxType,a=e.originalType,p=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),u=d(t),f=r,m=u["".concat(p,".").concat(f)]||u[f]||c[f]||a;return t?i.createElement(m,l(l({ref:n},s),{},{components:t})):i.createElement(m,l({ref:n},s))}));function m(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var a=t.length,l=new Array(a);l[0]=f;var o={};for(var p in n)hasOwnProperty.call(n,p)&&(o[p]=n[p]);o.originalType=e,o[u]="string"==typeof e?e:r,l[1]=o;for(var d=2;d<a;d++)l[d]=t[d];return i.createElement.apply(null,l)}return i.createElement.apply(null,t)}f.displayName="MDXCreateElement"},61581:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>p,contentTitle:()=>l,default:()=>c,frontMatter:()=>a,metadata:()=>o,toc:()=>d});var i=t(87462),r=(t(67294),t(3905));const a={id:"WindDisplayProps",title:"Interface: WindDisplayProps",sidebar_label:"WindDisplayProps",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"g3000pfd/interfaces/WindDisplayProps",id:"g3000pfd/interfaces/WindDisplayProps",title:"Interface: WindDisplayProps",description:"Component props for WindDisplay.",source:"@site/docs/g3000pfd/interfaces/WindDisplayProps.md",sourceDirName:"g3000pfd/interfaces",slug:"/g3000pfd/interfaces/WindDisplayProps",permalink:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/WindDisplayProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"WindDisplayProps",title:"Interface: WindDisplayProps",sidebar_label:"WindDisplayProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"VerticalSpeedIndicatorProps",permalink:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VerticalSpeedIndicatorProps"},next:{title:"Readme",permalink:"/msfs-avionics-mirror/docs/g3000mfd/"}},p={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"dataProvider",id:"dataprovider",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"declutter",id:"declutter",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"unitsSettingManager",id:"unitssettingmanager",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"windDisplaySettingManager",id:"winddisplaysettingmanager",level:3},{value:"Defined in",id:"defined-in-5",level:4}],s={toc:d},u="wrapper";function c(e){let{components:n,...t}=e;return(0,r.kt)(u,(0,i.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Component props for WindDisplay."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"WindDisplayProps"))))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"children"},"children"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"children"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,r.kt)("p",null,"The children of the display component."),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,"ComponentProps.children"),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:122"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"dataprovider"},"dataProvider"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"dataProvider"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"WindDataProvider")),(0,r.kt)("p",null,"A provider of wind data."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/Wind/WindDisplay.tsx:13"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"declutter"},"declutter"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"declutter"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether the display should be decluttered."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/Wind/WindDisplay.tsx:22"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ref"},"ref"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"ref"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,r.kt)("p",null,"A reference to the display component."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,"ComponentProps.ref"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:125"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"unitssettingmanager"},"unitsSettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"unitsSettingManager"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"UnitsUserSettingManager")),(0,r.kt)("p",null,"A manager for display units user settings."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/Wind/WindDisplay.tsx:19"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"winddisplaysettingmanager"},"windDisplaySettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"windDisplaySettingManager"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"WindDisplayUserSettingTypes"),">"),(0,r.kt)("p",null,"A manager for wind display user settings."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/Wind/WindDisplay.tsx:16"))}c.isMDXComponent=!0}}]);