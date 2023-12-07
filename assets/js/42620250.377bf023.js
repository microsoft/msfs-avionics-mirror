"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[7529],{3905:(e,t,i)=>{i.d(t,{Zo:()=>p,kt:()=>v});var n=i(67294);function r(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function a(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,n)}return i}function l(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?a(Object(i),!0).forEach((function(t){r(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):a(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function s(e,t){if(null==e)return{};var i,n,r=function(e,t){if(null==e)return{};var i,n,r={},a=Object.keys(e);for(n=0;n<a.length;n++)i=a[n],t.indexOf(i)>=0||(r[i]=e[i]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)i=a[n],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(r[i]=e[i])}return r}var o=n.createContext({}),m=function(e){var t=n.useContext(o),i=t;return e&&(i="function"==typeof e?e(t):l(l({},t),e)),i},p=function(e){var t=m(e.components);return n.createElement(o.Provider,{value:t},e.children)},d="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var i=e.components,r=e.mdxType,a=e.originalType,o=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),d=m(i),k=r,v=d["".concat(o,".").concat(k)]||d[k]||c[k]||a;return i?n.createElement(v,l(l({ref:t},p),{},{components:i})):n.createElement(v,l({ref:t},p))}));function v(e,t){var i=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=i.length,l=new Array(a);l[0]=k;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s[d]="string"==typeof e?e:r,l[1]=s;for(var m=2;m<a;m++)l[m]=i[m];return n.createElement.apply(null,l)}return n.createElement.apply(null,i)}k.displayName="MDXCreateElement"},6757:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>c,frontMatter:()=>a,metadata:()=>s,toc:()=>m});var n=i(87462),r=(i(67294),i(3905));const a={id:"PFDViewService",title:"Class: PFDViewService",sidebar_label:"PFDViewService",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"g1000common/classes/PFDViewService",id:"g1000common/classes/PFDViewService",title:"Class: PFDViewService",description:"A service to manage views.",source:"@site/docs/g1000common/classes/PFDViewService.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/PFDViewService",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/PFDViewService",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"PFDViewService",title:"Class: PFDViewService",sidebar_label:"PFDViewService",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"PFDUserSettings",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/PFDUserSettings"},next:{title:"PFDWptDupDialog",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/PFDWptDupDialog"}},o={},m=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"activeView",id:"activeview",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"activeViewKey",id:"activeviewkey",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"bus",id:"bus",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"fmsEventMap",id:"fmseventmap",level:3},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"ignorePageHistory",id:"ignorepagehistory",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"openPage",id:"openpage",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"openPageKey",id:"openpagekey",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"pageHistory",id:"pagehistory",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"Methods",id:"methods",level:2},{value:"clearPageHistory",id:"clearpagehistory",level:3},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"clearStack",id:"clearstack",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"closeActiveView",id:"closeactiveview",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"closeAllViews",id:"closeallviews",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"getOpenViews",id:"getopenviews",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"onInteractionEvent",id:"oninteractionevent",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"open",id:"open",level:3},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"openLastPage",id:"openlastpage",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"registerView",id:"registerview",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"routeInteractionEventToViews",id:"routeinteractioneventtoviews",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-18",level:4}],p={toc:m},d="wrapper";function c(e){let{components:t,...i}=e;return(0,r.kt)(d,(0,n.Z)({},p,i,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A service to manage views."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},(0,r.kt)("inlineCode",{parentName:"a"},"ViewService"))),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"PFDViewService"))))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new PFDViewService"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),")"),(0,r.kt)("p",null,"Constructs the view service."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,r.kt)("h4",{id:"overrides"},"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#constructor"},"constructor")),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/UI/PFDViewService.ts:39"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"activeview"},"activeView"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"activeView"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UiView"},(0,r.kt)("inlineCode",{parentName:"a"},"UiView")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/UiViewProps"},(0,r.kt)("inlineCode",{parentName:"a"},"UiViewProps")),", ",(0,r.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"any"),">",">"),(0,r.kt)("p",null,"The currently active view."),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#activeview"},"activeView")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:36"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"activeviewkey"},"activeViewKey"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"activeViewKey"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,r.kt)("p",null,"The key of the currently active view."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#activeviewkey"},"activeViewKey")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:34"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"bus"},"bus"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"bus"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,r.kt)("p",null,"The event bus."),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#bus"},"bus")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/UI/PFDViewService.ts:39"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fmseventmap"},"fmsEventMap"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"fmsEventMap"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Map"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"string"),", ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/enums/FmsHEvent"},(0,r.kt)("inlineCode",{parentName:"a"},"FmsHEvent")),">"),(0,r.kt)("p",null,"override in child class"),(0,r.kt)("h4",{id:"overrides-1"},"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#fmseventmap"},"fmsEventMap")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/UI/PFDViewService.ts:19"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ignorepagehistory"},"ignorePageHistory"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"ignorePageHistory"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"false")),(0,r.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#ignorepagehistory"},"ignorePageHistory")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:39"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"openpage"},"openPage"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"openPage"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UiPage"},(0,r.kt)("inlineCode",{parentName:"a"},"UiPage")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/UiPageProps"},(0,r.kt)("inlineCode",{parentName:"a"},"UiPageProps")),">",">"),(0,r.kt)("p",null,"The currently open page."),(0,r.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#openpage"},"openPage")),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:30"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"openpagekey"},"openPageKey"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"openPageKey"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,r.kt)("p",null,"The key of the currently open page."),(0,r.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#openpagekey"},"openPageKey")),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:28"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"pagehistory"},"pageHistory"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"pageHistory"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"ViewEntry"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UiView"},(0,r.kt)("inlineCode",{parentName:"a"},"UiView")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/UiViewProps"},(0,r.kt)("inlineCode",{parentName:"a"},"UiViewProps")),", ",(0,r.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"any"),">",">","[] = ",(0,r.kt)("inlineCode",{parentName:"p"},"[]")),(0,r.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#pagehistory"},"pageHistory")),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:38"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"clearpagehistory"},"clearPageHistory"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"clearPageHistory"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Clears this view service's page history."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#clearpagehistory"},"clearPageHistory")),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:231"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"clearstack"},"clearStack"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"clearStack"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"closePage"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Closes all open views and clears the stack."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"closePage")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether to close the currently open page, if one exists.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#clearstack"},"clearStack")),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:253"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"closeactiveview"},"closeActiveView"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"closeActiveView"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Closes the currently active view."),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#closeactiveview"},"closeActiveView")),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:238"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"closeallviews"},"closeAllViews"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"closeAllViews"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Closes all open views except for the currently open page, if one exists."),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#closeallviews"},"closeAllViews")),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:245"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getopenviews"},"getOpenViews"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getOpenViews"),"(): readonly ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UiView"},(0,r.kt)("inlineCode",{parentName:"a"},"UiView")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/UiViewProps"},(0,r.kt)("inlineCode",{parentName:"a"},"UiViewProps")),", ",(0,r.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"any"),">","[]"),(0,r.kt)("p",null,"Gets an array of all currently open views."),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,"readonly ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UiView"},(0,r.kt)("inlineCode",{parentName:"a"},"UiView")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/UiViewProps"},(0,r.kt)("inlineCode",{parentName:"a"},"UiViewProps")),", ",(0,r.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"any"),">","[]"),(0,r.kt)("p",null,"an array of all currently open views."),(0,r.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#getopenviews"},"getOpenViews")),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:93"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"oninteractionevent"},"onInteractionEvent"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"onInteractionEvent"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"hEvent"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Routes the HEvents to the views."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"hEvent")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event identifier.")))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"whether the event was handled"),(0,r.kt)("h4",{id:"overrides-2"},"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#oninteractionevent"},"onInteractionEvent")),(0,r.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/UI/PFDViewService.ts:58"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"open"},"open"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"open"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"type"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"isSubView?"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"T")),(0,r.kt)("p",null,"Opens a view. The opened view can be a page, regular view, or subview. Opening a page will close all other views,\nincluding the currently open page. Opening a regular view will close all other views except the currently open\npage. Opening a subview does not close any other views. The opened view will immediately become the active view,\nand the previously active view (if one exists) will be paused."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if the view type is not registered with this service."),(0,r.kt)("h4",{id:"type-parameters"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/classes/UiView"},(0,r.kt)("inlineCode",{parentName:"a"},"UiView")),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/UiViewProps"},(0,r.kt)("inlineCode",{parentName:"a"},"UiViewProps")),", ",(0,r.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),">"," = ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/classes/UiView"},(0,r.kt)("inlineCode",{parentName:"a"},"UiView")),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/UiViewProps"},(0,r.kt)("inlineCode",{parentName:"a"},"UiViewProps")),", ",(0,r.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"any"),">")))),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"type")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The type of the view to open.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"isSubView")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"false")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A boolean indicating if the view to be opened is a subview.")))),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"T")),(0,r.kt)("p",null,"The view that was opened."),(0,r.kt)("h4",{id:"inherited-from-12"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#open"},"open")),(0,r.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:117"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"openlastpage"},"openLastPage"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"openLastPage"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UiPage"},(0,r.kt)("inlineCode",{parentName:"a"},"UiPage")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/UiPageProps"},(0,r.kt)("inlineCode",{parentName:"a"},"UiPageProps")),">"),(0,r.kt)("p",null,"Opens the page that was most recently closed."),(0,r.kt)("h4",{id:"returns-7"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/UiPage"},(0,r.kt)("inlineCode",{parentName:"a"},"UiPage")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/UiPageProps"},(0,r.kt)("inlineCode",{parentName:"a"},"UiPageProps")),">"),(0,r.kt)("p",null,"The page that was opened."),(0,r.kt)("h4",{id:"inherited-from-13"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#openlastpage"},"openLastPage")),(0,r.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:217"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"registerview"},"registerView"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"registerView"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"type?"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"vnodeFn"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Registers a view with the service."),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"type?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The type of the view.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"vnodeFn")),(0,r.kt)("td",{parentName:"tr",align:"left"},"() => ",(0,r.kt)("inlineCode",{parentName:"td"},"VNode")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A function creating the VNode.")))),(0,r.kt)("h4",{id:"returns-8"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-14"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#registerview"},"registerView")),(0,r.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:102"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"routeinteractioneventtoviews"},"routeInteractionEventToViews"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"routeInteractionEventToViews"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"evt"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Routes an interaction to the active view, and if it is not handled, re-routes the interaction to the currently\nopen page if it exists and is not the active view."),(0,r.kt)("h4",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"evt")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/enums/FmsHEvent"},(0,r.kt)("inlineCode",{parentName:"a"},"FmsHEvent"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"An interaction event.")))),(0,r.kt)("h4",{id:"returns-9"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether the event was handled."),(0,r.kt)("h4",{id:"inherited-from-15"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService"},"ViewService"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/ViewService#routeinteractioneventtoviews"},"routeInteractionEventToViews")),(0,r.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/UI/ViewService.ts:81"))}c.isMDXComponent=!0}}]);