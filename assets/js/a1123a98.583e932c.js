"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[59135],{3905:(e,n,i)=>{i.d(n,{Zo:()=>d,kt:()=>f});var t=i(67294);function r(e,n,i){return n in e?Object.defineProperty(e,n,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[n]=i,e}function a(e,n){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),i.push.apply(i,t)}return i}function l(e){for(var n=1;n<arguments.length;n++){var i=null!=arguments[n]?arguments[n]:{};n%2?a(Object(i),!0).forEach((function(n){r(e,n,i[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):a(Object(i)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(i,n))}))}return e}function s(e,n){if(null==e)return{};var i,t,r=function(e,n){if(null==e)return{};var i,t,r={},a=Object.keys(e);for(t=0;t<a.length;t++)i=a[t],n.indexOf(i)>=0||(r[i]=e[i]);return r}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)i=a[t],n.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(r[i]=e[i])}return r}var o=t.createContext({}),p=function(e){var n=t.useContext(o),i=n;return e&&(i="function"==typeof e?e(n):l(l({},n),e)),i},d=function(e){var n=p(e.components);return t.createElement(o.Provider,{value:n},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},c=t.forwardRef((function(e,n){var i=e.components,r=e.mdxType,a=e.originalType,o=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),m=p(i),c=r,f=m["".concat(o,".").concat(c)]||m[c]||u[c]||a;return i?t.createElement(f,l(l({ref:n},d),{},{components:i})):t.createElement(f,l({ref:n},d))}));function f(e,n){var i=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var a=i.length,l=new Array(a);l[0]=c;var s={};for(var o in n)hasOwnProperty.call(n,o)&&(s[o]=n[o]);s.originalType=e,s[m]="string"==typeof e?e:r,l[1]=s;for(var p=2;p<a;p++)l[p]=i[p];return t.createElement.apply(null,l)}return t.createElement.apply(null,i)}c.displayName="MDXCreateElement"},92059:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>o,contentTitle:()=>l,default:()=>u,frontMatter:()=>a,metadata:()=>s,toc:()=>p});var t=i(87462),r=(i(67294),i(3905));const a={id:"MinimumsDisplayProps",title:"Interface: MinimumsDisplayProps",sidebar_label:"MinimumsDisplayProps",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"garminsdk/interfaces/MinimumsDisplayProps",id:"garminsdk/interfaces/MinimumsDisplayProps",title:"Interface: MinimumsDisplayProps",description:"Component props for MinimumsDisplay.",source:"@site/docs/garminsdk/interfaces/MinimumsDisplayProps.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/MinimumsDisplayProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MinimumsDisplayProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MinimumsDisplayProps",title:"Interface: MinimumsDisplayProps",sidebar_label:"MinimumsDisplayProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MinimumsDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MinimumsDataProvider"},next:{title:"NavDataBarFieldModel",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataBarFieldModel"}},o={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"dataProvider",id:"dataprovider",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"declutter",id:"declutter",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"minimumsAlertState",id:"minimumsalertstate",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"unitsSettingManager",id:"unitssettingmanager",level:3},{value:"Defined in",id:"defined-in-6",level:4}],d={toc:p},m="wrapper";function u(e){let{components:n,...i}=e;return(0,r.kt)(m,(0,t.Z)({},d,i,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Component props for MinimumsDisplay."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"MinimumsDisplayProps"))))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"bus"},"bus"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"bus"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,r.kt)("p",null,"An instance of the event bus."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/minimums/MinimumsDisplay.tsx:15"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"children"},"children"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"children"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,r.kt)("p",null,"The children of the display component."),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,"ComponentProps.children"),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:122"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"dataprovider"},"dataProvider"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"dataProvider"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MinimumsDataProvider"},(0,r.kt)("inlineCode",{parentName:"a"},"MinimumsDataProvider"))),(0,r.kt)("p",null,"A data provider for the display."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/minimums/MinimumsDisplay.tsx:18"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"declutter"},"declutter"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"declutter"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether the indicator should be decluttered."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/minimums/MinimumsDisplay.tsx:27"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"minimumsalertstate"},"minimumsAlertState"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"minimumsAlertState"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MinimumsAlertState"},(0,r.kt)("inlineCode",{parentName:"a"},"MinimumsAlertState")),">"),(0,r.kt)("p",null,"The current minimums alert state."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/minimums/MinimumsDisplay.tsx:21"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ref"},"ref"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"ref"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,r.kt)("p",null,"A reference to the display component."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,"ComponentProps.ref"),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:125"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"unitssettingmanager"},"unitsSettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"unitsSettingManager"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/UnitsUserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"UnitsUserSettingManager"))),(0,r.kt)("p",null,"A manager for display units user settings."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/nextgenpfd/minimums/MinimumsDisplay.tsx:24"))}u.isMDXComponent=!0}}]);