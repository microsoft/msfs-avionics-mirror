"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[45925],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>g});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),d=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},m=function(e){var t=d(e.components);return r.createElement(s.Provider,{value:t},e.children)},p="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),p=d(n),k=a,g=p["".concat(s,".").concat(k)]||p[k]||c[k]||i;return n?r.createElement(g,l(l({ref:t},m),{},{components:n})):r.createElement(g,l({ref:t},m))}));function g(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=k;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[p]="string"==typeof e?e:a,l[1]=o;for(var d=2;d<i;d++)l[d]=n[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}k.displayName="MDXCreateElement"},37847:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var r=n(87462),a=(n(67294),n(3905));const i={id:"UserSettingSelectController",title:"Class: UserSettingSelectController<T, K>",sidebar_label:"UserSettingSelectController",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"g1000common/classes/UserSettingSelectController",id:"g1000common/classes/UserSettingSelectController",title:"Class: UserSettingSelectController<T, K>",description:"A controller which binds a user setting that can take one of several enumerated values to a SelectControl",source:"@site/docs/g1000common/classes/UserSettingSelectController.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/UserSettingSelectController",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingSelectController",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"UserSettingSelectController",title:"Class: UserSettingSelectController<T, K>",sidebar_label:"UserSettingSelectController",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"UserSettingSelectControl",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingSelectControl"},next:{title:"UserSettingToggleControl",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingToggleControl"}},s={},d=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"itemSelectedHandler",id:"itemselectedhandler",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-1",level:5},{value:"Defined in",id:"defined-in-1",level:4},{value:"setting",id:"setting",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"settingManager",id:"settingmanager",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"settingName",id:"settingname",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"values",id:"values",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"Methods",id:"methods",level:2},{value:"init",id:"init",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"onSettingChanged",id:"onsettingchanged",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-7",level:4}],m={toc:d},p="wrapper";function c(e){let{components:t,...n}=e;return(0,a.kt)(p,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A controller which binds a user setting that can take one of several enumerated values to a SelectControl\ncomponent."),(0,a.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"T")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"UserSettingRecord"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"K")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends keyof ",(0,a.kt)("inlineCode",{parentName:"td"},"T")," & ",(0,a.kt)("inlineCode",{parentName:"td"},"string"))))),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingController"},(0,a.kt)("inlineCode",{parentName:"a"},"UserSettingController")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"K"),">"),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"UserSettingSelectController"))))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new UserSettingSelectController"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,a.kt)("inlineCode",{parentName:"p"},"settingManager"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"settingName"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"values"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"selectControlRef"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingSelectController"},(0,a.kt)("inlineCode",{parentName:"a"},"UserSettingSelectController")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"K"),">"),(0,a.kt)("p",null,"Constructor."),(0,a.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"T")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"UserSettingRecord"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"K")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"string"))))),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"settingManager")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"UserSettingManager"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"T"),">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"This controller's settings manager.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"settingName")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"K")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The name of the setting associated with this controller.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"values")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"SubscribableArray"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"NonNullable"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"T"),"[",(0,a.kt)("inlineCode",{parentName:"td"},"K"),"]",">",">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"A subscribable array which provides the values this controller can assign to its setting.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"selectControlRef")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"NodeReference"),"<",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/classes/SelectControl"},(0,a.kt)("inlineCode",{parentName:"a"},"SelectControl")),"<",(0,a.kt)("inlineCode",{parentName:"td"},"NonNullable"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"T"),"[",(0,a.kt)("inlineCode",{parentName:"td"},"K"),"]",">",">",">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"A node reference to the SelectControl which this controller controls.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingSelectController"},(0,a.kt)("inlineCode",{parentName:"a"},"UserSettingSelectController")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"K"),">"),(0,a.kt)("h4",{id:"overrides"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingController"},"UserSettingController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingController#constructor"},"constructor")),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/UserSettings/UserSettingSelectController.ts:24"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"itemselectedhandler"},"itemSelectedHandler"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"itemSelectedHandler"),": (",(0,a.kt)("inlineCode",{parentName:"p"},"index"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"item"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,a.kt)("inlineCode",{parentName:"p"},"K"),"]",">",", ",(0,a.kt)("inlineCode",{parentName:"p"},"isRefresh"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),") => ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"A function which handles item selected events from the SelectControl component which this controller controls.\nThis handler should be passed to the SelectControl component via its ",(0,a.kt)("inlineCode",{parentName:"p"},"onItemSelected")," prop."),(0,a.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,a.kt)("p",null,"\u25b8 (",(0,a.kt)("inlineCode",{parentName:"p"},"index"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"item"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"isRefresh"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"A function which handles item selected events from the SelectControl component which this controller controls.\nThis handler should be passed to the SelectControl component via its ",(0,a.kt)("inlineCode",{parentName:"p"},"onItemSelected")," prop."),(0,a.kt)("h5",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"item")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},"NonNullable"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"T"),"[",(0,a.kt)("inlineCode",{parentName:"td"},"K"),"]",">")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"isRefresh")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean"))))),(0,a.kt)("h5",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/UserSettings/UserSettingSelectController.ts:15"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"setting"},"setting"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"setting"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,a.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,a.kt)("p",null,"The setting associated with this controller."),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingController"},"UserSettingController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingController#setting"},"setting")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/UserSettings/UserSettingController.ts:8"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"settingmanager"},"settingManager"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"settingManager"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,a.kt)("p",null,"This controller's settings manager."),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingController"},"UserSettingController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingController#settingmanager"},"settingManager")),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/UserSettings/UserSettingSelectController.ts:25"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"settingname"},"settingName"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"settingName"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"K")),(0,a.kt)("p",null,"The name of the setting associated with this controller."),(0,a.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingController"},"UserSettingController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingController#settingname"},"settingName")),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/UserSettings/UserSettingSelectController.ts:26"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"values"},"values"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"values"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"SubscribableArray"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"NonNullable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),"[",(0,a.kt)("inlineCode",{parentName:"p"},"K"),"]",">",">"),(0,a.kt)("p",null,"A subscribable array which provides the values this controller can assign to its setting."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/UserSettings/UserSettingSelectController.ts:27"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"init"},"init"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"init"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Initializes this controller. This will immediately change the state of this controller's control component to\nreflect the current value of this controller's setting. Furthermore, any future changes to the setting's value\nwill be synced to the control component."),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-1"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingController"},"UserSettingController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingController#init"},"init")),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/UserSettings/UserSettingSelectController.ts:34"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onsettingchanged"},"onSettingChanged"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onSettingChanged"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"value"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"A callback which is called when value of this control's setting is changed."),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"value")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"NonNullable"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"T"),"[",(0,a.kt)("inlineCode",{parentName:"td"},"K"),"]",">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The new value of the setting.")))),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-2"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingController"},"UserSettingController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UserSettingController#onsettingchanged"},"onSettingChanged")),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/UserSettings/UserSettingSelectController.ts:39"))}c.isMDXComponent=!0}}]);