"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[37682],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>f});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},m=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},d="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),d=p(n),u=i,f=d["".concat(s,".").concat(u)]||d[u]||c[u]||a;return n?r.createElement(f,o(o({ref:t},m),{},{components:n})):r.createElement(f,o({ref:t},m))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=u;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[d]="string"==typeof e?e:i,o[1]=l;for(var p=2;p<a;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},25722:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>c,frontMatter:()=>a,metadata:()=>l,toc:()=>p});var r=n(87462),i=(n(67294),n(3905));const a={id:"MapEnumSettingControlProps",title:"Interface: MapEnumSettingControlProps<K>",sidebar_label:"MapEnumSettingControlProps",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"g1000common/interfaces/MapEnumSettingControlProps",id:"g1000common/interfaces/MapEnumSettingControlProps",title:"Interface: MapEnumSettingControlProps<K>",description:"Component props for MapEnumSettingControl.",source:"@site/docs/g1000common/interfaces/MapEnumSettingControlProps.md",sourceDirName:"g1000common/interfaces",slug:"/g1000common/interfaces/MapEnumSettingControlProps",permalink:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapEnumSettingControlProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapEnumSettingControlProps",title:"Interface: MapEnumSettingControlProps<K>",sidebar_label:"MapEnumSettingControlProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapDataIntegrityControllerModules",permalink:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapDataIntegrityControllerModules"},next:{title:"MapRangeDisplayProps",permalink:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapRangeDisplayProps"}},s={},p=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"class",id:"class",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"outerContainer",id:"outercontainer",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"registerFunc",id:"registerfunc",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Parameters",id:"parameters",level:5},{value:"Returns",id:"returns",level:5},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"settingManager",id:"settingmanager",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"settingName",id:"settingname",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"valueText",id:"valuetext",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"values",id:"values",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"viewService",id:"viewservice",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-9",level:4}],m={toc:p},d="wrapper";function c(e){let{components:t,...n}=e;return(0,i.kt)(d,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Component props for MapEnumSettingControl."),(0,i.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"K")),(0,i.kt)("td",{parentName:"tr",align:"left"},"extends keyof ",(0,i.kt)("inlineCode",{parentName:"td"},"MapUserSettingTypes"))))),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps"},(0,i.kt)("inlineCode",{parentName:"a"},"MapSettingControlProps")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"K"),">"),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"MapEnumSettingControlProps"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"children"},"children"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"children"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,i.kt)("p",null,"The children of the display component."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps"},"MapSettingControlProps"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps#children"},"children")),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:122"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"class"},"class"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"class"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"CSS class(es) to add to the root of the control component."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps"},"MapSettingControlProps"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps#class"},"class")),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/MapSettings/MapSettingControls.tsx:32"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"outercontainer"},"outerContainer"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"outerContainer"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"HTMLElement"),">"),(0,i.kt)("p",null,"The HTML container in which the control resides."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/MapSettings/MapSettingControls.tsx:72"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ref"},"ref"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"ref"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,i.kt)("p",null,"A reference to the display component."),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps"},"MapSettingControlProps"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps#ref"},"ref")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:125"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"registerfunc"},"registerFunc"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"registerFunc"),": (",(0,i.kt)("inlineCode",{parentName:"p"},"control"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/modules#scrollablecontrol"},(0,i.kt)("inlineCode",{parentName:"a"},"ScrollableControl")),") => ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"The function to use to register the setting control."),(0,i.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (",(0,i.kt)("inlineCode",{parentName:"p"},"control"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"The function to use to register the setting control."),(0,i.kt)("h5",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"control")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/modules#scrollablecontrol"},(0,i.kt)("inlineCode",{parentName:"a"},"ScrollableControl")))))),(0,i.kt)("h5",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps"},"MapSettingControlProps"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps#registerfunc"},"registerFunc")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/MapSettings/MapSettingControls.tsx:23"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"settingmanager"},"settingManager"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"settingManager"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"MapUserSettingTypes"),">"),(0,i.kt)("p",null,"A map settings manager."),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps"},"MapSettingControlProps"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps#settingmanager"},"settingManager")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/MapSettings/MapSettingControls.tsx:26"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"settingname"},"settingName"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"settingName"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"K")),(0,i.kt)("p",null,"The name of the setting to control."),(0,i.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps"},"MapSettingControlProps"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps#settingname"},"settingName")),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/MapSettings/MapSettingControls.tsx:29"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"valuetext"},"valueText"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"valueText"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"SubscribableArray"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("p",null,"An array of text representations of setting values."),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/MapSettings/MapSettingControls.tsx:69"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"values"},"values"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"values"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"SubscribableArray"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"MapUserSettingTypes"),"[",(0,i.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,i.kt)("p",null,"An array of values assignable to the setting."),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/MapSettings/MapSettingControls.tsx:66"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"viewservice"},"viewService"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"viewService"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},(0,i.kt)("inlineCode",{parentName:"a"},"ViewService"))),(0,i.kt)("p",null,"The View Service."),(0,i.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps"},"MapSettingControlProps"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapSettingControlProps#viewservice"},"viewService")),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/MapSettings/MapSettingControls.tsx:20"))}c.isMDXComponent=!0}}]);