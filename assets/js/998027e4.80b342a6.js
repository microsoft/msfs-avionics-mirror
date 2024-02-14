"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[84036],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>k});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function d(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var o=r.createContext({}),s=function(e){var t=r.useContext(o),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},p=function(e){var t=s(e.components);return r.createElement(o.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,o=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),m=s(a),f=n,k=m["".concat(o,".").concat(f)]||m[f]||c[f]||i;return a?r.createElement(k,l(l({ref:t},p),{},{components:a})):r.createElement(k,l({ref:t},p))}));function k(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,l=new Array(i);l[0]=f;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[m]="string"==typeof e?e:n,l[1]=d;for(var s=2;s<i;s++)l[s]=a[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}f.displayName="MDXCreateElement"},24956:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>d,toc:()=>s});var r=a(87462),n=(a(67294),a(3905));const i={id:"DefaultNavDataBarFieldModelFactory",title:"Class: DefaultNavDataBarFieldModelFactory",sidebar_label:"DefaultNavDataBarFieldModelFactory",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/classes/DefaultNavDataBarFieldModelFactory",id:"garminsdk/classes/DefaultNavDataBarFieldModelFactory",title:"Class: DefaultNavDataBarFieldModelFactory",description:"A default implementation of NavDataBarFieldModelFactory.",source:"@site/docs/garminsdk/classes/DefaultNavDataBarFieldModelFactory.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/DefaultNavDataBarFieldModelFactory",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultNavDataBarFieldModelFactory",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"DefaultNavDataBarFieldModelFactory",title:"Class: DefaultNavDataBarFieldModelFactory",sidebar_label:"DefaultNavDataBarFieldModelFactory",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"DefaultMinimumsDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultMinimumsDataProvider"},next:{title:"DefaultNavStatusBoxDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultNavStatusBoxDataProvider"}},o={},s=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"Properties",id:"properties",level:2},{value:"factory",id:"factory",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"create",id:"create",level:3},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-3",level:4}],p={toc:s},m="wrapper";function c(e){let{components:t,...a}=e;return(0,n.kt)(m,(0,r.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A default implementation of NavDataBarFieldModelFactory."),(0,n.kt)("h2",{id:"implements"},"Implements"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataBarFieldModelFactory"},(0,n.kt)("inlineCode",{parentName:"a"},"NavDataBarFieldModelFactory")))),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new DefaultNavDataBarFieldModelFactory"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"gpsValidity"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"options?"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultNavDataBarFieldModelFactory"},(0,n.kt)("inlineCode",{parentName:"a"},"DefaultNavDataBarFieldModelFactory"))),(0,n.kt)("p",null,"Creates a new instance of DefaultNavDataBarFieldModelFactory."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"bus")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"gpsValidity")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/NavDataFieldGpsValidity"},(0,n.kt)("inlineCode",{parentName:"a"},"NavDataFieldGpsValidity")),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The subscribable that provides the validity of the GPS data for the models.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"options?")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/modules#defaultnavdatabarfieldmodelfactoryoptions"},(0,n.kt)("inlineCode",{parentName:"a"},"DefaultNavDataBarFieldModelFactoryOptions")),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"Options with which to configure the factory.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultNavDataBarFieldModelFactory"},(0,n.kt)("inlineCode",{parentName:"a"},"DefaultNavDataBarFieldModelFactory"))),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/components/navdatabar/DefaultNavDataBarFieldModelFactory.ts:39"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new DefaultNavDataBarFieldModelFactory"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"fms"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"gpsValidity"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"options?"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultNavDataBarFieldModelFactory"},(0,n.kt)("inlineCode",{parentName:"a"},"DefaultNavDataBarFieldModelFactory"))),(0,n.kt)("p",null,"Creates a new instance of DefaultNavDataBarFieldModelFactory."),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"bus")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"fms")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/classes/Fms"},(0,n.kt)("inlineCode",{parentName:"a"},"Fms")),"<",(0,n.kt)("inlineCode",{parentName:"td"},"any"),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The flight management system.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"gpsValidity")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/NavDataFieldGpsValidity"},(0,n.kt)("inlineCode",{parentName:"a"},"NavDataFieldGpsValidity")),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The subscribable that provides the validity of the GPS data for the models.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"options?")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/modules#defaultnavdatabarfieldmodelfactoryoptions"},(0,n.kt)("inlineCode",{parentName:"a"},"DefaultNavDataBarFieldModelFactoryOptions")),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"Options with which to configure the factory.")))),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultNavDataBarFieldModelFactory"},(0,n.kt)("inlineCode",{parentName:"a"},"DefaultNavDataBarFieldModelFactory"))),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"Deprecated"))),(0,n.kt)("p",null,"Please use the constructor overload without the ",(0,n.kt)("inlineCode",{parentName:"p"},"fms")," parameter, since that parameter is no longer\nused."),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/components/navdatabar/DefaultNavDataBarFieldModelFactory.ts:53"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"factory"},"factory"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"factory"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/GenericNavDataBarFieldModelFactory"},(0,n.kt)("inlineCode",{parentName:"a"},"GenericNavDataBarFieldModelFactory"))),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/components/navdatabar/DefaultNavDataBarFieldModelFactory.ts:31"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"create"},"create"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"create"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"T"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"type"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#navdatabarfieldtypemodelmap"},(0,n.kt)("inlineCode",{parentName:"a"},"NavDataBarFieldTypeModelMap")),"[",(0,n.kt)("inlineCode",{parentName:"p"},"T"),"]"),(0,n.kt)("p",null,"Creates a navigation data bar field data model for a given type of field."),(0,n.kt)("h4",{id:"type-parameters"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/NavDataFieldType"},(0,n.kt)("inlineCode",{parentName:"a"},"NavDataFieldType")))))),(0,n.kt)("h4",{id:"parameters-2"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"type")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"A data bar field type.")))),(0,n.kt)("h4",{id:"returns-2"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#navdatabarfieldtypemodelmap"},(0,n.kt)("inlineCode",{parentName:"a"},"NavDataBarFieldTypeModelMap")),"[",(0,n.kt)("inlineCode",{parentName:"p"},"T"),"]"),(0,n.kt)("p",null,"A navigation data bar field data model for the given field type."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,n.kt)("p",null,"Error if an unsupported field type is specified."),(0,n.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataBarFieldModelFactory"},"NavDataBarFieldModelFactory"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataBarFieldModelFactory#create"},"create")),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/components/navdatabar/DefaultNavDataBarFieldModelFactory.ts:110"))}c.isMDXComponent=!0}}]);