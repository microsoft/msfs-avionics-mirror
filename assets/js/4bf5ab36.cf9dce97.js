"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[25442],{3905:(e,a,t)=>{t.d(a,{Zo:()=>p,kt:()=>u});var r=t(67294);function n(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}function i(e,a){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);a&&(r=r.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),t.push.apply(t,r)}return t}function l(e){for(var a=1;a<arguments.length;a++){var t=null!=arguments[a]?arguments[a]:{};a%2?i(Object(t),!0).forEach((function(a){n(e,a,t[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))}))}return e}function o(e,a){if(null==e)return{};var t,r,n=function(e,a){if(null==e)return{};var t,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],a.indexOf(t)>=0||(n[t]=e[t]);return n}(e,a);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],a.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var s=r.createContext({}),d=function(e){var a=r.useContext(s),t=a;return e&&(t="function"==typeof e?e(a):l(l({},a),e)),t},p=function(e){var a=d(e.components);return r.createElement(s.Provider,{value:a},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var a=e.children;return r.createElement(r.Fragment,{},a)}},v=r.forwardRef((function(e,a){var t=e.components,n=e.mdxType,i=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),c=d(t),v=n,u=c["".concat(s,".").concat(v)]||c[v]||m[v]||i;return t?r.createElement(u,l(l({ref:a},p),{},{components:t})):r.createElement(u,l({ref:a},p))}));function u(e,a){var t=arguments,n=a&&a.mdxType;if("string"==typeof e||n){var i=t.length,l=new Array(i);l[0]=v;var o={};for(var s in a)hasOwnProperty.call(a,s)&&(o[s]=a[s]);o.originalType=e,o[c]="string"==typeof e?e:n,l[1]=o;for(var d=2;d<i;d++)l[d]=t[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,t)}v.displayName="MDXCreateElement"},53758:(e,a,t)=>{t.r(a),t.d(a,{assets:()=>s,contentTitle:()=>l,default:()=>m,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var r=t(87462),n=(t(67294),t(3905));const i={id:"NavDataBarFieldEnrModelFactory",title:"Class: NavDataBarFieldEnrModelFactory",sidebar_label:"NavDataBarFieldEnrModelFactory",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/classes/NavDataBarFieldEnrModelFactory",id:"garminsdk/classes/NavDataBarFieldEnrModelFactory",title:"Class: NavDataBarFieldEnrModelFactory",description:"Creates data models for Time To Destination navigation data bar fields.",source:"@site/docs/garminsdk/classes/NavDataBarFieldEnrModelFactory.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/NavDataBarFieldEnrModelFactory",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/NavDataBarFieldEnrModelFactory",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NavDataBarFieldEnrModelFactory",title:"Class: NavDataBarFieldEnrModelFactory",sidebar_label:"NavDataBarFieldEnrModelFactory",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"NavDataBarFieldEndModelFactory",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/NavDataBarFieldEndModelFactory"},next:{title:"NavDataBarFieldEtaModelFactory",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/NavDataBarFieldEtaModelFactory"}},s={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"sub",id:"sub",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"create",id:"create",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:d},c="wrapper";function m(e){let{components:a,...t}=e;return(0,n.kt)(c,(0,r.Z)({},p,t,{components:a,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Creates data models for Time To Destination navigation data bar fields."),(0,n.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory"},(0,n.kt)("inlineCode",{parentName:"a"},"EventBusNavDataBarFieldTypeModelFactory")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/NavDataFieldType#timetodestination"},(0,n.kt)("inlineCode",{parentName:"a"},"TimeToDestination")),", ",(0,n.kt)("inlineCode",{parentName:"p"},"GNSSEvents")," & ",(0,n.kt)("inlineCode",{parentName:"p"},"LNavEvents")," & ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/LNavDataEvents"},(0,n.kt)("inlineCode",{parentName:"a"},"LNavDataEvents")),">"),(0,n.kt)("p",{parentName:"li"},"\u21b3 ",(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"NavDataBarFieldEnrModelFactory"))))),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new NavDataBarFieldEnrModelFactory"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"bus"),")"),(0,n.kt)("p",null,"Constructor."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"bus")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,n.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory"},"EventBusNavDataBarFieldTypeModelFactory"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory#constructor"},"constructor")),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"garminsdk/components/navdatabar/GenericNavDataBarFieldModelFactory.ts:88"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"sub"},"sub"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"sub"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"EventSubscriber"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"GNSSEvents")," & ",(0,n.kt)("inlineCode",{parentName:"p"},"LNavSimVarEvents")," & { ",(0,n.kt)("inlineCode",{parentName:"p"},"lnav_is_awaiting_calc"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"boolean")," ; ",(0,n.kt)("inlineCode",{parentName:"p"},"lnav_tracking_state"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"LNavTrackingState"),"  } & ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/LNavDataEvents"},(0,n.kt)("inlineCode",{parentName:"a"},"LNavDataEvents")),">"),(0,n.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory"},"EventBusNavDataBarFieldTypeModelFactory"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory#sub"},"sub")),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"garminsdk/components/navdatabar/GenericNavDataBarFieldModelFactory.ts:82"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"create"},"create"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"create"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"gpsValidity"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataBarFieldModel"},(0,n.kt)("inlineCode",{parentName:"a"},"NavDataBarFieldModel")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Duration"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Duration"),">",">",">"),(0,n.kt)("p",null,"Creates a navigation data bar field data model for this factory's data field type."),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"gpsValidity")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/NavDataFieldGpsValidity"},(0,n.kt)("inlineCode",{parentName:"a"},"NavDataFieldGpsValidity")),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The subscribable that provides the validity of the GPS data for the models.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataBarFieldModel"},(0,n.kt)("inlineCode",{parentName:"a"},"NavDataBarFieldModel")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"NumberUnitInterface"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Duration"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Duration"),">",">",">"),(0,n.kt)("p",null,"A navigation data bar field data model for this factory's data field type."),(0,n.kt)("h4",{id:"overrides"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory"},"EventBusNavDataBarFieldTypeModelFactory"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory#create"},"create")),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"garminsdk/components/navdatabar/GenericNavDataBarFieldModelFactory.ts:282"))}m.isMDXComponent=!0}}]);