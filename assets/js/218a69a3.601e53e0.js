"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[81124],{3905:(e,t,a)=>{a.d(t,{Zo:()=>o,kt:()=>f});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var p=n.createContext({}),m=function(e){var t=n.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},o=function(e){var t=m(e.components);return n.createElement(p.Provider,{value:t},e.children)},d="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},g=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,o=s(e,["components","mdxType","originalType","parentName"]),d=m(a),g=r,f=d["".concat(p,".").concat(g)]||d[g]||k[g]||i;return a?n.createElement(f,l(l({ref:t},o),{},{components:a})):n.createElement(f,l({ref:t},o))}));function f(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=g;var s={};for(var p in t)hasOwnProperty.call(t,p)&&(s[p]=t[p]);s.originalType=e,s[d]="string"==typeof e?e:r,l[1]=s;for(var m=2;m<i;m++)l[m]=a[m];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}g.displayName="MDXCreateElement"},32988:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>k,frontMatter:()=>i,metadata:()=>s,toc:()=>m});var n=a(87462),r=(a(67294),a(3905));const i={id:"UserSettingManager",title:"Interface: UserSettingManager<T>",sidebar_label:"UserSettingManager",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"framework/interfaces/UserSettingManager",id:"framework/interfaces/UserSettingManager",title:"Interface: UserSettingManager<T>",description:"A manager for user settings. Provides settings using their names as keys, publishes value change events on the",source:"@site/docs/framework/interfaces/UserSettingManager.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/UserSettingManager",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"UserSettingManager",title:"Interface: UserSettingManager<T>",sidebar_label:"UserSettingManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"UserSettingDefinition",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingDefinition"},next:{title:"UserSettingManagerSyncEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManagerSyncEvents"}},p={},m=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Implemented by",id:"implemented-by",level:2},{value:"Methods",id:"methods",level:2},{value:"getAllSettings",id:"getallsettings",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"getSetting",id:"getsetting",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"mapTo",id:"mapto",level:3},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"tryGetSetting",id:"trygetsetting",level:3},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"whenSettingChanged",id:"whensettingchanged",level:3},{value:"Type parameters",id:"type-parameters-4",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-4",level:4}],o={toc:m},d="wrapper";function k(e){let{components:t,...a}=e;return(0,r.kt)(d,(0,n.Z)({},o,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A manager for user settings. Provides settings using their names as keys, publishes value change events on the\nevent bus, and keeps setting values up to date when receiving change events across the bus."),(0,r.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#usersettingrecord"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingRecord")))))),(0,r.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/classes/AliasedUserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"AliasedUserSettingManager"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/classes/DefaultUserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"DefaultUserSettingManager"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/classes/MappedUserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"MappedUserSettingManager")))),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"getallsettings"},"getAllSettings"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getAllSettings"),"(): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSetting"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSetting")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#usersettingvalue"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingValue")),">","[]"),(0,r.kt)("p",null,"Gets an array of all settings of this manager."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSetting"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSetting")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#usersettingvalue"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingValue")),">","[]"),(0,r.kt)("p",null,"an array of all settings of this manager."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/settings/UserSetting.ts:96"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getsetting"},"getSetting"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getSetting"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSetting"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSetting")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,"Gets a setting from this manager."),(0,r.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"string"))))),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"name")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The name of the setting to get.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSetting"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSetting")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,"The requested setting."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if no setting with the specified name exists."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/settings/UserSetting.ts:82"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"mapto"},"mapTo"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"mapTo"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"map"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingManager")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M")," & ",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,r.kt)("p",null,"Maps a subset of this manager's settings to ones with aliased names, and creates a new setting manager which\nsupports accessing the settings using their aliases."),(0,r.kt)("h4",{id:"type-parameters-2"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"M")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#usersettingrecord"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingRecord")))))),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"map")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#usersettingmap"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingMap")),"<",(0,r.kt)("inlineCode",{parentName:"td"},"M"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"A map defining the aliases of a subset of this manager's settings, with aliased setting names as keys and original setting names as values.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSettingManager")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M")," & ",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,r.kt)("p",null,"A new setting manager which supports accessing a subset of this manager's settings using aliased names."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/settings/UserSetting.ts:105"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"trygetsetting"},"tryGetSetting"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"tryGetSetting"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSetting"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSetting")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,"Attempts to get a setting from this manager."),(0,r.kt)("h4",{id:"type-parameters-3"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"string"))))),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"name")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The name of the setting to get.")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/UserSetting"},(0,r.kt)("inlineCode",{parentName:"a"},"UserSetting")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,"The requested setting, or ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," if no such setting exists."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/settings/UserSetting.ts:74"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"whensettingchanged"},"whenSettingChanged"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"whenSettingChanged"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Consumer"},(0,r.kt)("inlineCode",{parentName:"a"},"Consumer")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,"Gets a consumer which notifies handlers when the value of a setting changes."),(0,r.kt)("h4",{id:"type-parameters-4"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"string"))))),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"name")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"K")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The name of a setting.")))),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Consumer"},(0,r.kt)("inlineCode",{parentName:"a"},"Consumer")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,r.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,r.kt)("p",null,"a consumer which notifies handlers when the value of the setting changes."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if no setting with the specified name exists."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/settings/UserSetting.ts:90"))}k.isMDXComponent=!0}}]);