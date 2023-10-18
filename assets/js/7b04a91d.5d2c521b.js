"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[21069],{3905:(e,t,n)=>{n.d(t,{Zo:()=>o,kt:()=>N});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function p(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=a.createContext({}),m=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):p(p({},t),e)),n},o=function(e){var t=m(e.components);return a.createElement(d.Provider,{value:t},e.children)},s="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},g=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,d=e.parentName,o=l(e,["components","mdxType","originalType","parentName"]),s=m(n),g=i,N=s["".concat(d,".").concat(g)]||s[g]||k[g]||r;return n?a.createElement(N,p(p({ref:t},o),{},{components:n})):a.createElement(N,p({ref:t},o))}));function N(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,p=new Array(r);p[0]=g;var l={};for(var d in t)hasOwnProperty.call(t,d)&&(l[d]=t[d]);l.originalType=e,l[s]="string"==typeof e?e:i,p[1]=l;for(var m=2;m<r;m++)p[m]=n[m];return a.createElement.apply(null,p)}return a.createElement.apply(null,n)}g.displayName="MDXCreateElement"},41342:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>p,default:()=>k,frontMatter:()=>r,metadata:()=>l,toc:()=>m});var a=n(87462),i=(n(67294),n(3905));const r={id:"MapAliasedUserSettingManager",title:"Class: MapAliasedUserSettingManager",sidebar_label:"MapAliasedUserSettingManager",sidebar_position:0,custom_edit_url:null},p=void 0,l={unversionedId:"g3000common/classes/MapAliasedUserSettingManager",id:"g3000common/classes/MapAliasedUserSettingManager",title:"Class: MapAliasedUserSettingManager",description:"An aliased map user setting manager which can switch the true settings from which its aliased settings are sourced.",source:"@site/docs/g3000common/classes/MapAliasedUserSettingManager.md",sourceDirName:"g3000common/classes",slug:"/g3000common/classes/MapAliasedUserSettingManager",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/MapAliasedUserSettingManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapAliasedUserSettingManager",title:"Class: MapAliasedUserSettingManager",sidebar_label:"MapAliasedUserSettingManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"LookupTableConfig",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/LookupTableConfig"},next:{title:"MapBuilder",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/MapBuilder"}},d={},m=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"aliasedManager",id:"aliasedmanager",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"displayPaneManagers",id:"displaypanemanagers",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"pfdManagers",id:"pfdmanagers",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"EMPTY_MAP",id:"empty_map",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"Methods",id:"methods",level:2},{value:"getAllSettings",id:"getallsettings",level:3},{value:"Returns",id:"returns",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"getSetting",id:"getsetting",level:3},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"mapTo",id:"mapto",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"tryGetSetting",id:"trygetsetting",level:3},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"useDisplayPaneSettings",id:"usedisplaypanesettings",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"usePfdSettings",id:"usepfdsettings",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"whenSettingChanged",id:"whensettingchanged",level:3},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-11",level:4}],o={toc:m},s="wrapper";function k(e){let{components:t,...n}=e;return(0,i.kt)(s,(0,a.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"An aliased map user setting manager which can switch the true settings from which its aliased settings are sourced.\nThe supported sources are:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Each set of display pane map settings."),(0,i.kt)("li",{parentName:"ul"},"Each set of PFD map settings.")),(0,i.kt)("h2",{id:"implements"},"Implements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"UserSettingManager"),"<",(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000mapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000MapUserSettingTypes")),">")),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new MapAliasedUserSettingManager"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"bus"),")"),(0,i.kt)("p",null,"Constructor."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"bus")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/MapAliasedUserSettingManager.ts:25"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"aliasedmanager"},"aliasedManager"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"aliasedManager"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"AliasedUserSettingManager"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000mapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000MapUserSettingTypes")),">"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/MapAliasedUserSettingManager.ts:19"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"displaypanemanagers"},"displayPaneManagers"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"displayPaneManagers"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Record"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#controllabledisplaypaneindex"},(0,i.kt)("inlineCode",{parentName:"a"},"ControllableDisplayPaneIndex")),", ",(0,i.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000mapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000MapUserSettingTypes")),">",">"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/MapAliasedUserSettingManager.ts:16"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"pfdmanagers"},"pfdManagers"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"pfdManagers"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Record"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#pfdindex"},(0,i.kt)("inlineCode",{parentName:"a"},"PfdIndex")),", ",(0,i.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000mapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000MapUserSettingTypes")),">",">"),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/MapAliasedUserSettingManager.ts:17"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"empty_map"},"EMPTY","_","MAP"),(0,i.kt)("p",null,"\u25aa ",(0,i.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"EMPTY","_","MAP"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Object")," = ",(0,i.kt)("inlineCode",{parentName:"p"},"{}")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/MapAliasedUserSettingManager.ts:14"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"getallsettings"},"getAllSettings"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"getAllSettings"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"UserSettingValue"),">","[]"),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"UserSettingValue"),">","[]"),(0,i.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,i.kt)("p",null,"UserSettingManager.getAllSettings"),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/MapAliasedUserSettingManager.ts:73"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"getsetting"},"getSetting"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"getSetting"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,i.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000mapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000MapUserSettingTypes")),"[",(0,i.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"type-parameters"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"K")),(0,i.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapOrientation"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAutoNorthUpActive"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAutoNorthUpRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapDeclutter"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTerrainMode"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTerrainRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTerrainScaleShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirportLargeRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirportMediumRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirportSmallRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapVorShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapVorRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapNdbShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapNdbRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapIntersectionShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapIntersectionRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapUserWaypointShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapUserWaypointRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceClassBRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceClassCRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceClassDRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceRestrictedRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceMoaRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceOtherRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrafficShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrafficRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrafficLabelShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrafficLabelRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrafficAlertLevelMode"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapNexradShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapNexradRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrackVectorShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrackVectorLookahead"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAltitudeArcShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapWindVectorShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapInsetMode"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirportShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapInsetTextCumulative"'))))),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"name")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"K"))))),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000mapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000MapUserSettingTypes")),"[",(0,i.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,i.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,i.kt)("p",null,"UserSettingManager.getSetting"),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/MapAliasedUserSettingManager.ts:63"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"mapto"},"mapTo"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"mapTo"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"M"),">","(",(0,i.kt)("inlineCode",{parentName:"p"},"map"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"M")," & ",(0,i.kt)("inlineCode",{parentName:"p"},"Omit"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"MapUserSettingTypes"),", ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000mapdelegatedusersettingnames"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000MapDelegatedUserSettingNames")),">"," & ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000specificmapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000SpecificMapUserSettingTypes")),">"),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"M")),(0,i.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,i.kt)("inlineCode",{parentName:"td"},"UserSettingRecord"))))),(0,i.kt)("h4",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"map")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"UserSettingMap"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"M"),", ",(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000mapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000MapUserSettingTypes")),">")))),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"M")," & ",(0,i.kt)("inlineCode",{parentName:"p"},"Omit"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"MapUserSettingTypes"),", ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000mapdelegatedusersettingnames"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000MapDelegatedUserSettingNames")),">"," & ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000specificmapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000SpecificMapUserSettingTypes")),">"),(0,i.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,i.kt)("p",null,"UserSettingManager.mapTo"),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/MapAliasedUserSettingManager.ts:78"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"trygetsetting"},"tryGetSetting"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"tryGetSetting"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,i.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"K")," extends ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapOrientation"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAutoNorthUpActive"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAutoNorthUpRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapDeclutter"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTerrainMode"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTerrainRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTerrainScaleShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirportLargeRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirportMediumRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirportSmallRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapVorShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapVorRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapNdbShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapNdbRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapIntersectionShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapIntersectionRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapUserWaypointShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapUserWaypointRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirspaceClassBRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirspaceClassCRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirspaceClassDRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirspaceRestrictedRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirspaceMoaRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirspaceOtherRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrafficShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrafficRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrafficLabelShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrafficLabelRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrafficAlertLevelMode"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapNexradShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapNexradRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrackVectorShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrackVectorLookahead"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAltitudeArcShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapWindVectorShow"')," ","|"," keyof ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000specificmapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000SpecificMapUserSettingTypes"))," ? ",(0,i.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000mapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000MapUserSettingTypes")),"[",(0,i.kt)("inlineCode",{parentName:"p"},"K"),"]",">"," : ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"type-parameters-2"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"K")),(0,i.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,i.kt)("inlineCode",{parentName:"td"},"string"))))),(0,i.kt)("h4",{id:"parameters-3"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"name")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"K"))))),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"K")," extends ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapOrientation"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAutoNorthUpActive"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAutoNorthUpRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapDeclutter"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTerrainMode"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTerrainRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTerrainScaleShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirportLargeRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirportMediumRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirportSmallRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapVorShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapVorRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapNdbShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapNdbRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapIntersectionShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapIntersectionRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapUserWaypointShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapUserWaypointRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirspaceClassBRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirspaceClassCRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirspaceClassDRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirspaceRestrictedRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirspaceMoaRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAirspaceOtherRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrafficShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrafficRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrafficLabelShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrafficLabelRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrafficAlertLevelMode"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapNexradShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapNexradRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrackVectorShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapTrackVectorLookahead"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapAltitudeArcShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},'"mapWindVectorShow"')," ","|"," keyof ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000specificmapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000SpecificMapUserSettingTypes"))," ? ",(0,i.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000mapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000MapUserSettingTypes")),"[",(0,i.kt)("inlineCode",{parentName:"p"},"K"),"]",">"," : ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")),(0,i.kt)("h4",{id:"implementation-of-3"},"Implementation of"),(0,i.kt)("p",null,"UserSettingManager.tryGetSetting"),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/MapAliasedUserSettingManager.ts:58"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"usedisplaypanesettings"},"useDisplayPaneSettings"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"useDisplayPaneSettings"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"index"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Switches the source of this manager's settings to a set of display pane map settings."),(0,i.kt)("h4",{id:"parameters-4"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"index")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000common/modules#controllabledisplaypaneindex"},(0,i.kt)("inlineCode",{parentName:"a"},"ControllableDisplayPaneIndex"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The index of the display pane.")))),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/MapAliasedUserSettingManager.ts:45"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"usepfdsettings"},"usePfdSettings"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"usePfdSettings"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"index"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Switches the source of this manager's settings to a set of PFD map settings."),(0,i.kt)("h4",{id:"parameters-5"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"index")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000common/modules#pfdindex"},(0,i.kt)("inlineCode",{parentName:"a"},"PfdIndex"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The index of the PFD.")))),(0,i.kt)("h4",{id:"returns-5"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/MapAliasedUserSettingManager.ts:53"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"whensettingchanged"},"whenSettingChanged"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"whenSettingChanged"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,i.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"Consumer"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000mapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000MapUserSettingTypes")),"[",(0,i.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"type-parameters-3"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"K")),(0,i.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapOrientation"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAutoNorthUpActive"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAutoNorthUpRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapDeclutter"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTerrainMode"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTerrainRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTerrainScaleShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirportLargeRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirportMediumRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirportSmallRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapVorShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapVorRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapNdbShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapNdbRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapIntersectionShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapIntersectionRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapUserWaypointShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapUserWaypointRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceClassBRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceClassCRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceClassDRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceRestrictedRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceMoaRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceOtherRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrafficShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrafficRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrafficLabelShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrafficLabelRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrafficAlertLevelMode"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapNexradShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapNexradRangeIndex"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrackVectorShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapTrackVectorLookahead"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAltitudeArcShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapWindVectorShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapInsetMode"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirspaceShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapAirportShow"')," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},'"mapInsetTextCumulative"'))))),(0,i.kt)("h4",{id:"parameters-6"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"name")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"K"))))),(0,i.kt)("h4",{id:"returns-6"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Consumer"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000mapusersettingtypes"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000MapUserSettingTypes")),"[",(0,i.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,i.kt)("h4",{id:"implementation-of-4"},"Implementation of"),(0,i.kt)("p",null,"UserSettingManager.whenSettingChanged"),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Settings/MapAliasedUserSettingManager.ts:68"))}k.isMDXComponent=!0}}]);