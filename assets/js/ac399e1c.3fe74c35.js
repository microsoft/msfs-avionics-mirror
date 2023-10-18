"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[47985],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>N});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function d(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var s=r.createContext({}),o=function(e){var t=r.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},p=function(e){var t=o(e.components);return r.createElement(s.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,s=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),m=o(a),k=n,N=m["".concat(s,".").concat(k)]||m[k]||c[k]||i;return a?r.createElement(N,l(l({ref:t},p),{},{components:a})):r.createElement(N,l({ref:t},p))}));function N(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,l=new Array(i);l[0]=k;var d={};for(var s in t)hasOwnProperty.call(t,s)&&(d[s]=t[s]);d.originalType=e,d[m]="string"==typeof e?e:n,l[1]=d;for(var o=2;o<i;o++)l[o]=a[o];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}k.displayName="MDXCreateElement"},30199:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>d,toc:()=>o});var r=a(87462),n=(a(67294),a(3905));const i={id:"NextGenNavDataBarFieldRenderer",title:"Class: NextGenNavDataBarFieldRenderer",sidebar_label:"NextGenNavDataBarFieldRenderer",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/classes/NextGenNavDataBarFieldRenderer",id:"garminsdk/classes/NextGenNavDataBarFieldRenderer",title:"Class: NextGenNavDataBarFieldRenderer",description:"A next-generation (NXi, G3000, etc) implementation of NavDataFieldRenderer which supports all navigation",source:"@site/docs/garminsdk/classes/NextGenNavDataBarFieldRenderer.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/NextGenNavDataBarFieldRenderer",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/NextGenNavDataBarFieldRenderer",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NextGenNavDataBarFieldRenderer",title:"Class: NextGenNavDataBarFieldRenderer",sidebar_label:"NextGenNavDataBarFieldRenderer",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"NextGenMapWaypointStyles",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/NextGenMapWaypointStyles"},next:{title:"NextGenNavDataFieldBrgRenderer",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/NextGenNavDataFieldBrgRenderer"}},s={},o=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"renderer",id:"renderer",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"render",id:"render",level:3},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:o},m="wrapper";function c(e){let{components:t,...a}=e;return(0,n.kt)(m,(0,r.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A next-generation (NXi, G3000, etc) implementation of ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldRenderer"},"NavDataFieldRenderer")," which supports all navigation\ndata bar field types."),(0,n.kt)("h2",{id:"implements"},"Implements"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldRenderer"},(0,n.kt)("inlineCode",{parentName:"a"},"NavDataFieldRenderer")))),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new NextGenNavDataBarFieldRenderer"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"unitsSettingManager"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"dateTimeSettingManager"),")"),(0,n.kt)("p",null,"Constructor."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"unitsSettingManager")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/classes/UnitsUserSettingManager"},(0,n.kt)("inlineCode",{parentName:"a"},"UnitsUserSettingManager"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"A display units user setting manager.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"dateTimeSettingManager")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"UserSettingManager"),"<",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/modules#datetimeusersettingtypes"},(0,n.kt)("inlineCode",{parentName:"a"},"DateTimeUserSettingTypes")),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A date/time user setting manager.")))),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"garminsdk/components/navdatabar/NextGenNavDataBarFieldRenderer.ts:27"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"renderer"},"renderer"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"renderer"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/GenericNavDataFieldRenderer"},(0,n.kt)("inlineCode",{parentName:"a"},"GenericNavDataFieldRenderer"))),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"garminsdk/components/navdatabar/NextGenNavDataBarFieldRenderer.ts:20"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"render"},"render"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"render"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"T"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"type"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"model"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"VNode")),(0,n.kt)("p",null,"Renders a navigation data field of a given type."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,n.kt)("p",null,"Error if an unsupported field type is specified."),(0,n.kt)("h4",{id:"type-parameters"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/NavDataFieldType"},(0,n.kt)("inlineCode",{parentName:"a"},"NavDataFieldType")))))),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"type")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"A navigation data field type.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"model")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/modules#navdatafieldtypemodelmap"},(0,n.kt)("inlineCode",{parentName:"a"},"NavDataFieldTypeModelMap")),"[",(0,n.kt)("inlineCode",{parentName:"td"},"T"),"]"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The data model for the field.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"VNode")),(0,n.kt)("p",null,"A navigation data field of the given type, as a VNode."),(0,n.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldRenderer"},"NavDataFieldRenderer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldRenderer#render"},"render")),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"garminsdk/components/navdatabar/NextGenNavDataBarFieldRenderer.ts:55"))}c.isMDXComponent=!0}}]);