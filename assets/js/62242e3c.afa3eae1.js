"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[51364],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>g});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=i.createContext({}),d=function(e){var t=i.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},m=function(e){var t=d(e.components);return i.createElement(p.Provider,{value:t},e.children)},o="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,p=e.parentName,m=s(e,["components","mdxType","originalType","parentName"]),o=d(n),u=a,g=o["".concat(p,".").concat(u)]||o[u]||k[u]||r;return n?i.createElement(g,l(l({ref:t},m),{},{components:n})):i.createElement(g,l({ref:t},m))}));function g(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,l=new Array(r);l[0]=u;var s={};for(var p in t)hasOwnProperty.call(t,p)&&(s[p]=t[p]);s.originalType=e,s[o]="string"==typeof e?e:a,l[1]=s;for(var d=2;d<r;d++)l[d]=n[d];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}u.displayName="MDXCreateElement"},89479:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>k,frontMatter:()=>r,metadata:()=>s,toc:()=>d});var i=n(87462),a=(n(67294),n(3905));const r={id:"UnitsUserSettingManager",title:"Interface: UnitsUserSettingManager<T>",sidebar_label:"UnitsUserSettingManager",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"g1000common/interfaces/UnitsUserSettingManager",id:"g1000common/interfaces/UnitsUserSettingManager",title:"Interface: UnitsUserSettingManager<T>",description:"A manager for Garmin display units user settings.",source:"@site/docs/g1000common/interfaces/UnitsUserSettingManager.md",sourceDirName:"g1000common/interfaces",slug:"/g1000common/interfaces/UnitsUserSettingManager",permalink:"/msfs-avionics-mirror/docs/g1000common/interfaces/UnitsUserSettingManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"UnitsUserSettingManager",title:"Interface: UnitsUserSettingManager<T>",sidebar_label:"UnitsUserSettingManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"UiViewProps",permalink:"/msfs-avionics-mirror/docs/g1000common/interfaces/UiViewProps"},next:{title:"UserSettingControlProps",permalink:"/msfs-avionics-mirror/docs/g1000common/interfaces/UserSettingControlProps"}},p={},d=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"altitudeUnits",id:"altitudeunits",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"distanceUnitsLarge",id:"distanceunitslarge",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"distanceUnitsSmall",id:"distanceunitssmall",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"fuelFlowUnits",id:"fuelflowunits",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"fuelUnits",id:"fuelunits",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"navAngleUnits",id:"navangleunits",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"speedUnits",id:"speedunits",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"temperatureDeltaUnits",id:"temperaturedeltaunits",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"temperatureUnits",id:"temperatureunits",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"verticalSpeedUnits",id:"verticalspeedunits",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"weightUnits",id:"weightunits",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"Methods",id:"methods",level:2},{value:"getAllSettings",id:"getallsettings",level:3},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"getSetting",id:"getsetting",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"mapTo",id:"mapto",level:3},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"tryGetSetting",id:"trygetsetting",level:3},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"whenSettingChanged",id:"whensettingchanged",level:3},{value:"Type parameters",id:"type-parameters-4",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-15",level:4}],m={toc:d},o="wrapper";function k(e){let{components:t,...n}=e;return(0,a.kt)(o,(0,i.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A manager for Garmin display units user settings."),(0,a.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"T")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/modules#unitsusersettingtypes"},(0,a.kt)("inlineCode",{parentName:"a"},"UnitsUserSettingTypes"))," & ",(0,a.kt)("inlineCode",{parentName:"td"},"UserSettingRecord")," = ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/modules#unitsusersettingtypes"},(0,a.kt)("inlineCode",{parentName:"a"},"UnitsUserSettingTypes")))))),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"UnitsUserSettingManager"))))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"altitudeunits"},"altitudeUnits"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"altitudeUnits"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Distance"),">",">"),(0,a.kt)("p",null,"The altitude units to use for the current altitude units setting."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"garminsdk/settings/UnitsUserSettings.ts:106"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"distanceunitslarge"},"distanceUnitsLarge"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"distanceUnitsLarge"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Distance"),">",">"),(0,a.kt)("p",null,"The large distance units to use (nautical mile, kilometer, etc.) for the current distance units setting."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"garminsdk/settings/UnitsUserSettings.ts:97"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"distanceunitssmall"},"distanceUnitsSmall"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"distanceUnitsSmall"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Distance"),">",">"),(0,a.kt)("p",null,"The small distance units to use (foot, meter, etc.) for the current distance units setting."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"garminsdk/settings/UnitsUserSettings.ts:100"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"fuelflowunits"},"fuelFlowUnits"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"fuelFlowUnits"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"WeightFlux"),">",">"),(0,a.kt)("p",null,"The fuel flow units to use for the current fuel units setting."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"garminsdk/settings/UnitsUserSettings.ts:124"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"fuelunits"},"fuelUnits"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"fuelUnits"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Weight"),">",">"),(0,a.kt)("p",null,"The fuel units to use for the current fuel units setting."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"garminsdk/settings/UnitsUserSettings.ts:121"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"navangleunits"},"navAngleUnits"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"navAngleUnits"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NavAngleUnit"),">"),(0,a.kt)("p",null,"The nav angle units to use for the current nav angle units setting."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"garminsdk/settings/UnitsUserSettings.ts:94"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"speedunits"},"speedUnits"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"speedUnits"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Speed"),">",">"),(0,a.kt)("p",null,"The speed units to use for the current distance units setting."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"garminsdk/settings/UnitsUserSettings.ts:103"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"temperaturedeltaunits"},"temperatureDeltaUnits"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"temperatureDeltaUnits"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"TemperatureDelta"),">",">"),(0,a.kt)("p",null,"The temperature delta units to use for the current temperature units setting."),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"garminsdk/settings/UnitsUserSettings.ts:115"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"temperatureunits"},"temperatureUnits"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"temperatureUnits"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Temperature"),">",">"),(0,a.kt)("p",null,"The temperature units to use for the current temperature units setting."),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"garminsdk/settings/UnitsUserSettings.ts:112"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"verticalspeedunits"},"verticalSpeedUnits"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"verticalSpeedUnits"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Speed"),">",">"),(0,a.kt)("p",null,"The vertical speed units to use for the current altitude units setting."),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"garminsdk/settings/UnitsUserSettings.ts:109"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"weightunits"},"weightUnits"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"weightUnits"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Weight"),">",">"),(0,a.kt)("p",null,"The weight units to use for the current weight units setting."),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"garminsdk/settings/UnitsUserSettings.ts:118"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"getallsettings"},"getAllSettings"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"getAllSettings"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"UserSettingValue"),">","[]"),(0,a.kt)("p",null,"Gets an array of all settings of this manager."),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"UserSettingValue"),">","[]"),(0,a.kt)("p",null,"an array of all settings of this manager."),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,"UserSettingManager.getAllSettings"),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"sdk/settings/UserSetting.ts:96"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"getsetting"},"getSetting"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"getSetting"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,a.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,a.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,a.kt)("p",null,"Gets a setting from this manager."),(0,a.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"K")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"string"))))),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"name")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"K")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The name of the setting to get.")))),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,a.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,a.kt)("p",null,"The requested setting."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,a.kt)("p",null,"Error if no setting with the specified name exists."),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,"UserSettingManager.getSetting"),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"sdk/settings/UserSetting.ts:82"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"mapto"},"mapTo"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"mapTo"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"M"),">","(",(0,a.kt)("inlineCode",{parentName:"p"},"map"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"M")," & ",(0,a.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,a.kt)("p",null,"Maps a subset of this manager's settings to ones with aliased names, and creates a new setting manager which\nsupports accessing the settings using their aliases."),(0,a.kt)("h4",{id:"type-parameters-2"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"M")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"UserSettingRecord"))))),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"map")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"UserSettingMap"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"M"),", ",(0,a.kt)("inlineCode",{parentName:"td"},"T"),">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"A map defining the aliases of a subset of this manager's settings, with aliased setting names as keys and original setting names as values.")))),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"M")," & ",(0,a.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,a.kt)("p",null,"A new setting manager which supports accessing a subset of this manager's settings using aliased names."),(0,a.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,a.kt)("p",null,"UserSettingManager.mapTo"),(0,a.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,a.kt)("p",null,"sdk/settings/UserSetting.ts:105"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"trygetsetting"},"tryGetSetting"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"tryGetSetting"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,a.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,a.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,a.kt)("p",null,"Attempts to get a setting from this manager."),(0,a.kt)("h4",{id:"type-parameters-3"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"K")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"string"))))),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"name")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"K")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The name of the setting to get.")))),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,a.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,a.kt)("p",null,"The requested setting, or ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," if no such setting exists."),(0,a.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,a.kt)("p",null,"UserSettingManager.tryGetSetting"),(0,a.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,a.kt)("p",null,"sdk/settings/UserSetting.ts:74"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"whensettingchanged"},"whenSettingChanged"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"whenSettingChanged"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,a.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"Consumer"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,a.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,a.kt)("p",null,"Gets a consumer which notifies handlers when the value of a setting changes."),(0,a.kt)("h4",{id:"type-parameters-4"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"K")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"string"))))),(0,a.kt)("h4",{id:"parameters-3"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"name")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"K")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The name of a setting.")))),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Consumer"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,a.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,a.kt)("p",null,"a consumer which notifies handlers when the value of the setting changes."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,a.kt)("p",null,"Error if no setting with the specified name exists."),(0,a.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,a.kt)("p",null,"UserSettingManager.whenSettingChanged"),(0,a.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,a.kt)("p",null,"sdk/settings/UserSetting.ts:90"))}k.isMDXComponent=!0}}]);