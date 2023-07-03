"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[50832],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>k});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=a.createContext({}),o=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},d=function(e){var t=o(e.components);return a.createElement(p.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},g=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),m=o(n),g=r,k=m["".concat(p,".").concat(g)]||m[g]||u[g]||i;return n?a.createElement(k,s(s({ref:t},d),{},{components:n})):a.createElement(k,s({ref:t},d))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,s=new Array(i);s[0]=g;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[m]="string"==typeof e?e:r,s[1]=l;for(var o=2;o<i;o++)s[o]=n[o];return a.createElement.apply(null,s)}return a.createElement.apply(null,n)}g.displayName="MDXCreateElement"},22773:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>s,default:()=>u,frontMatter:()=>i,metadata:()=>l,toc:()=>o});var a=n(87462),r=(n(67294),n(3905));const i={id:"MapUserSettings",title:"Class: MapUserSettings",sidebar_label:"MapUserSettings",sidebar_position:0,custom_edit_url:null},s=void 0,l={unversionedId:"g1000common/classes/MapUserSettings",id:"g1000common/classes/MapUserSettings",title:"Class: MapUserSettings",description:"Utility class for retrieving map user setting managers.",source:"@site/docs/g1000common/classes/MapUserSettings.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/MapUserSettings",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/MapUserSettings",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapUserSettings",title:"Class: MapUserSettings",sidebar_label:"MapUserSettings",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapToggleSettingControl",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/MapToggleSettingControl"},next:{title:"MapWaypointIconImageCache",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/MapWaypointIconImageCache"}},p={},o=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Properties",id:"properties",level:2},{value:"INSTANCE",id:"instance",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"MFD_INSTANCE",id:"mfd_instance",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"PFD_INSTANCE",id:"pfd_instance",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"getManager",id:"getmanager",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"getMfdManager",id:"getmfdmanager",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"getPfdManager",id:"getpfdmanager",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-5",level:4}],d={toc:o},m="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(m,(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Utility class for retrieving map user setting managers."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new MapUserSettings"),"()"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"instance"},"INSTANCE"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"INSTANCE"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"DefaultUserSettingManager"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/modules#allmapusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"AllMapUserSettingTypes")),">"),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Map/MapUserSettings.ts:64"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"mfd_instance"},"MFD","_","INSTANCE"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"MFD","_","INSTANCE"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"MapUserSettingTypes"),">"),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Map/MapUserSettings.ts:66"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"pfd_instance"},"PFD","_","INSTANCE"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"PFD","_","INSTANCE"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"MapUserSettingTypes"),">"),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Map/MapUserSettings.ts:65"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"getmanager"},"getManager"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("strong",{parentName:"p"},"getManager"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"DefaultUserSettingManager"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/modules#allmapusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"AllMapUserSettingTypes")),">"),(0,r.kt)("p",null,"Retrieves a manager for map user settings."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"DefaultUserSettingManager"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/modules#allmapusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"AllMapUserSettingTypes")),">"),(0,r.kt)("p",null,"a manager for map user settings."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Map/MapUserSettings.ts:73"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getmfdmanager"},"getMfdManager"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("strong",{parentName:"p"},"getMfdManager"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"MapUserSettingTypes"),">"),(0,r.kt)("p",null,"Retrieves a manager for MFD map user settings."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"MapUserSettingTypes"),">"),(0,r.kt)("p",null,"a manager for PFD map user settings."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Map/MapUserSettings.ts:294"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getpfdmanager"},"getPfdManager"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("strong",{parentName:"p"},"getPfdManager"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"MapUserSettingTypes"),">"),(0,r.kt)("p",null,"Retrieves a manager for PFD map user settings."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"MapUserSettingTypes"),">"),(0,r.kt)("p",null,"a manager for PFD map user settings."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Map/MapUserSettings.ts:279"))}u.isMDXComponent=!0}}]);