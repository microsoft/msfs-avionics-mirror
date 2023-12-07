"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[16426],{3905:(e,t,n)=>{n.d(t,{Zo:()=>o,kt:()=>g});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=a.createContext({}),m=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},o=function(e){var t=m(e.components);return a.createElement(p.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},k=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,o=s(e,["components","mdxType","originalType","parentName"]),d=m(n),k=r,g=d["".concat(p,".").concat(k)]||d[k]||u[k]||i;return n?a.createElement(g,l(l({ref:t},o),{},{components:n})):a.createElement(g,l({ref:t},o))}));function g(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=k;var s={};for(var p in t)hasOwnProperty.call(t,p)&&(s[p]=t[p]);s.originalType=e,s[d]="string"==typeof e?e:r,l[1]=s;for(var m=2;m<i;m++)l[m]=n[m];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}k.displayName="MDXCreateElement"},42340:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>s,toc:()=>m});var a=n(87462),r=(n(67294),n(3905));const i={id:"IauUserSettingManager",title:"Class: IauUserSettingManager",sidebar_label:"IauUserSettingManager",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"g3000common/classes/IauUserSettingManager",id:"g3000common/classes/IauUserSettingManager",title:"Class: IauUserSettingManager",description:"A manager for IAU user settings.",source:"@site/docs/g3000common/classes/IauUserSettingManager.md",sourceDirName:"g3000common/classes",slug:"/g3000common/classes/IauUserSettingManager",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/IauUserSettingManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"IauUserSettingManager",title:"Class: IauUserSettingManager",sidebar_label:"IauUserSettingManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"IauDefsConfig",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/IauDefsConfig"},next:{title:"LegNameDisplay",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/LegNameDisplay"}},p={},m=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"iauCount",id:"iaucount",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"getAliasedManager",id:"getaliasedmanager",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"getAllSettings",id:"getallsettings",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"getSetting",id:"getsetting",level:3},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"mapTo",id:"mapto",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"tryGetSetting",id:"trygetsetting",level:3},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"whenSettingChanged",id:"whensettingchanged",level:3},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-7",level:4}],o={toc:m},d="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(d,(0,a.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A manager for IAU user settings."),(0,r.kt)("h2",{id:"implements"},"Implements"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"UserSettingManager"),"<",(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000common/modules#iauallusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"IauAllUserSettingTypes")),">")),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new IauUserSettingManager"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"iauDefsConfig"),")"),(0,r.kt)("p",null,"Constructor."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"iauDefsConfig")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000common/classes/IauDefsConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"IauDefsConfig"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration object which defines IAU options.")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/IauUserSettings.ts:43"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"iaucount"},"iauCount"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"iauCount"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The number of IAUs supported by this manager."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/IauUserSettings.ts:32"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"getaliasedmanager"},"getAliasedManager"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getAliasedManager"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"index"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#iauusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"IauUserSettingTypes")),">"),(0,r.kt)("p",null,"Gets a manager for aliased IAU user settings for an indexed IAU."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"RangeError if ",(0,r.kt)("inlineCode",{parentName:"p"},"index")," is less than 1 or greater than the number of IAUs supported by this manager."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"index")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The index of the IAU for which to get an aliased setting manager.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#iauusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"IauUserSettingTypes")),">"),(0,r.kt)("p",null,"A manager for aliased IAU user settings for the specified IAU."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/IauUserSettings.ts:100"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getallsettings"},"getAllSettings"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getAllSettings"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingValue"),">","[]"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingValue"),">","[]"),(0,r.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,r.kt)("p",null,"UserSettingManager.getAllSettings"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/IauUserSettings.ts:85"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getsetting"},"getSetting"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getSetting"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#iauallusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"IauAllUserSettingTypes")),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"type-parameters"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"Object"))))),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"name")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K"))))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#iauallusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"IauAllUserSettingTypes")),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,r.kt)("p",null,"UserSettingManager.getSetting"),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/IauUserSettings.ts:75"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"mapto"},"mapTo"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"mapTo"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"map"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M")," & ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#iauallusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"IauAllUserSettingTypes")),">"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"M")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"UserSettingRecord"))))),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"map")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"UserSettingMap"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"M"),", ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000common/modules#iauallusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"IauAllUserSettingTypes")),">")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M")," & ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#iauallusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"IauAllUserSettingTypes")),">"),(0,r.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,r.kt)("p",null,"UserSettingManager.mapTo"),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/IauUserSettings.ts:90"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"trygetsetting"},"tryGetSetting"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"tryGetSetting"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"K")," extends ","`","iauAdcIndex","_","${number}","`"," ","|"," ","`","iauAhrsIndex","_","${number}","`"," ? ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#iauallusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"IauAllUserSettingTypes")),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">"," : ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"type-parameters-2"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"string"))))),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"name")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K"))))),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"K")," extends ","`","iauAdcIndex","_","${number}","`"," ","|"," ","`","iauAhrsIndex","_","${number}","`"," ? ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#iauallusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"IauAllUserSettingTypes")),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">"," : ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")),(0,r.kt)("h4",{id:"implementation-of-3"},"Implementation of"),(0,r.kt)("p",null,"UserSettingManager.tryGetSetting"),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/IauUserSettings.ts:70"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"whensettingchanged"},"whenSettingChanged"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"whenSettingChanged"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"Consumer"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#iauallusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"IauAllUserSettingTypes")),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"type-parameters-3"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"Object"))))),(0,r.kt)("h4",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"name")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K"))))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Consumer"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#iauallusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"IauAllUserSettingTypes")),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("h4",{id:"implementation-of-4"},"Implementation of"),(0,r.kt)("p",null,"UserSettingManager.whenSettingChanged"),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/IauUserSettings.ts:80"))}u.isMDXComponent=!0}}]);