"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[9882],{3905:(e,t,a)=>{a.d(t,{Zo:()=>o,kt:()=>f});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function s(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var m=n.createContext({}),p=function(e){var t=n.useContext(m),a=t;return e&&(a="function"==typeof e?e(t):s(s({},t),e)),a},o=function(e){var t=p(e.components);return n.createElement(m.Provider,{value:t},e.children)},d="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},g=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,m=e.parentName,o=l(e,["components","mdxType","originalType","parentName"]),d=p(a),g=r,f=d["".concat(m,".").concat(g)]||d[g]||k[g]||i;return a?n.createElement(f,s(s({ref:t},o),{},{components:a})):n.createElement(f,s({ref:t},o))}));function f(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,s=new Array(i);s[0]=g;var l={};for(var m in t)hasOwnProperty.call(t,m)&&(l[m]=t[m]);l.originalType=e,l[d]="string"==typeof e?e:r,s[1]=l;for(var p=2;p<i;p++)s[p]=a[p];return n.createElement.apply(null,s)}return n.createElement.apply(null,a)}g.displayName="MDXCreateElement"},99385:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>m,contentTitle:()=>s,default:()=>k,frontMatter:()=>i,metadata:()=>l,toc:()=>p});var n=a(87462),r=(a(67294),a(3905));const i={id:"AliasedUserSettingManager",title:"Class: AliasedUserSettingManager<T>",sidebar_label:"AliasedUserSettingManager",sidebar_position:0,custom_edit_url:null},s=void 0,l={unversionedId:"framework/classes/AliasedUserSettingManager",id:"framework/classes/AliasedUserSettingManager",title:"Class: AliasedUserSettingManager<T>",description:"An aliased user setting manager which can dynamically (re)define the settings from which its aliased settings are",source:"@site/docs/framework/classes/AliasedUserSettingManager.md",sourceDirName:"framework/classes",slug:"/framework/classes/AliasedUserSettingManager",permalink:"/msfs-avionics-mirror/docs/framework/classes/AliasedUserSettingManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AliasedUserSettingManager",title:"Class: AliasedUserSettingManager<T>",sidebar_label:"AliasedUserSettingManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AirwayObject",permalink:"/msfs-avionics-mirror/docs/framework/classes/AirwayObject"},next:{title:"AltitudeSelectManager",permalink:"/msfs-avionics-mirror/docs/framework/classes/AltitudeSelectManager"}},m={},p=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"getAllSettings",id:"getallsettings",level:3},{value:"Returns",id:"returns",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"getSetting",id:"getsetting",level:3},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"mapTo",id:"mapto",level:3},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"tryGetSetting",id:"trygetsetting",level:3},{value:"Type parameters",id:"type-parameters-4",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"useAliases",id:"usealiases",level:3},{value:"Type parameters",id:"type-parameters-5",level:4},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"whenSettingChanged",id:"whensettingchanged",level:3},{value:"Type parameters",id:"type-parameters-6",level:4},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-6",level:4}],o={toc:p},d="wrapper";function k(e){let{components:t,...a}=e;return(0,r.kt)(d,(0,n.Z)({},o,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"An aliased user setting manager which can dynamically (re)define the settings from which its aliased settings are\nsourced."),(0,r.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#usersettingrecord"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingRecord")))))),(0,r.kt)("h2",{id:"implements"},"Implements"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingManager")),"<",(0,r.kt)("inlineCode",{parentName:"li"},"T"),">")),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new AliasedUserSettingManager"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"settingDefs"),")"),(0,r.kt)("p",null,"Constructor."),(0,r.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#usersettingrecord"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingRecord")))))),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/EventBus"},(0,r.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The bus used by this manager to publish setting change events.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"settingDefs")),(0,r.kt)("td",{parentName:"tr",align:"left"},"readonly ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingDefinition"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingDefinition")),"<",(0,r.kt)("inlineCode",{parentName:"td"},"T"),"[keyof ",(0,r.kt)("inlineCode",{parentName:"td"},"T")," & ",(0,r.kt)("inlineCode",{parentName:"td"},"string"),"]",">","[]"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The setting definitions used to initialize this manager's settings. The definitions should define the settings' aliased names.")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/settings/AliasedUserSettingManager.ts:23"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"getallsettings"},"getAllSettings"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getAllSettings"),"(): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSetting"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSetting")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#usersettingvalue"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingValue")),">","[]"),(0,r.kt)("p",null,"Gets an array of all settings of this manager."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSetting"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSetting")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#usersettingvalue"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingValue")),">","[]"),(0,r.kt)("p",null,"an array of all settings of this manager."),(0,r.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager"},"UserSettingManager"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager#getallsettings"},"getAllSettings")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/settings/AliasedUserSettingManager.ts:76"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getsetting"},"getSetting"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getSetting"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSetting"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSetting")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,"Gets a setting from this manager."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if no setting with the specified name exists."),(0,r.kt)("h4",{id:"type-parameters-2"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"string"))))),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"name")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The name of the setting to get.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSetting"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSetting")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,"The requested setting."),(0,r.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager"},"UserSettingManager"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager#getsetting"},"getSetting")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/settings/AliasedUserSettingManager.ts:54"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"mapto"},"mapTo"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"mapTo"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"map"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingManager")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M")," & ",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,r.kt)("p",null,"Maps a subset of this manager's settings to ones with aliased names, and creates a new setting manager which\nsupports accessing the settings using their aliases."),(0,r.kt)("h4",{id:"type-parameters-3"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"M")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"Record"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#usersettingvalue"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingValue")),">")))),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"map")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#usersettingmap"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingMap")),"<",(0,r.kt)("inlineCode",{parentName:"td"},"M"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"A map defining the aliases of a subset of this manager's settings, with aliased setting names as keys and original setting names as values.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingManager")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M")," & ",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,r.kt)("p",null,"A new setting manager which supports accessing a subset of this manager's settings using aliased names."),(0,r.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager"},"UserSettingManager"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager#mapto"},"mapTo")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/settings/AliasedUserSettingManager.ts:81"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"trygetsetting"},"tryGetSetting"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"tryGetSetting"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSetting"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSetting")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,"Attempts to get a setting from this manager."),(0,r.kt)("h4",{id:"type-parameters-4"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"string"))))),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"name")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The name of the setting to get.")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSetting"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSetting")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,"The requested setting, or ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," if no such setting exists."),(0,r.kt)("h4",{id:"implementation-of-3"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager"},"UserSettingManager"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager#trygetsetting"},"tryGetSetting")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/settings/AliasedUserSettingManager.ts:49"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"usealiases"},"useAliases"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"useAliases"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"O"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"masterManager"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"map"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Defines the mappings from this manager's aliased settings to their source settings. Once the mappings are defined,\neach aliased setting will take the value of its source setting, and setting the value of the aliased setting will\nalso set the value of the source setting. If a source setting cannot be defined for an aliased setting, the\naliased setting's value will be fixed to its default value and cannot be changed."),(0,r.kt)("h4",{id:"type-parameters-5"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"O")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#usersettingrecord"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingRecord")))))),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"masterManager")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingManager")),"<",(0,r.kt)("inlineCode",{parentName:"td"},"O"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The manager hosting the settings from which this manager's aliased settings will be sourced.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"map")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#usersettingmap"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingMap")),"<",(0,r.kt)("inlineCode",{parentName:"td"},"T"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"O"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The mappings for this manager's aliased settings, as a set of key-value pairs where the keys are the aliased setting names and the values are the source setting names. For any aliased setting whose name does not appear as a key in the mapping, its source setting is assumed to have the same name.")))),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/settings/AliasedUserSettingManager.ts:40"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"whensettingchanged"},"whenSettingChanged"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"whenSettingChanged"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Consumer"},(0,r.kt)("inlineCode",{parentName:"a"},"Consumer")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,"Gets a consumer which notifies handlers when the value of a setting changes."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if no setting with the specified name exists."),(0,r.kt)("h4",{id:"type-parameters-6"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"string"))))),(0,r.kt)("h4",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"name")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The name of a setting.")))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Consumer"},(0,r.kt)("inlineCode",{parentName:"a"},"Consumer")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,"a consumer which notifies handlers when the value of the setting changes."),(0,r.kt)("h4",{id:"implementation-of-4"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager"},"UserSettingManager"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager#whensettingchanged"},"whenSettingChanged")),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/sdk/settings/AliasedUserSettingManager.ts:64"))}k.isMDXComponent=!0}}]);