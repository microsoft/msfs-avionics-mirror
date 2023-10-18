"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[6444],{3905:(e,t,a)=>{a.d(t,{Zo:()=>s,kt:()=>c});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function d(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var m=n.createContext({}),p=function(e){var t=n.useContext(m),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},s=function(e){var t=p(e.components);return n.createElement(m.Provider,{value:t},e.children)},o="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},N=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,m=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),o=p(a),N=r,c=o["".concat(m,".").concat(N)]||o[N]||k[N]||i;return a?n.createElement(c,l(l({ref:t},s),{},{components:a})):n.createElement(c,l({ref:t},s))}));function c(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=N;var d={};for(var m in t)hasOwnProperty.call(t,m)&&(d[m]=t[m]);d.originalType=e,d[o]="string"==typeof e?e:r,l[1]=d;for(var p=2;p<i;p++)l[p]=a[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}N.displayName="MDXCreateElement"},81946:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>m,contentTitle:()=>l,default:()=>k,frontMatter:()=>i,metadata:()=>d,toc:()=>p});var n=a(87462),r=(a(67294),a(3905));const i={id:"NextGenDateTimeNavDataFieldTypeRenderer",title:"Class: NextGenDateTimeNavDataFieldTypeRenderer<T>",sidebar_label:"NextGenDateTimeNavDataFieldTypeRenderer",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/classes/NextGenDateTimeNavDataFieldTypeRenderer",id:"garminsdk/classes/NextGenDateTimeNavDataFieldTypeRenderer",title:"Class: NextGenDateTimeNavDataFieldTypeRenderer<T>",description:"An abstract next-generation (NXi, G3000, etc) implementation of NavDataFieldTypeRenderer which supports",source:"@site/docs/garminsdk/classes/NextGenDateTimeNavDataFieldTypeRenderer.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/NextGenDateTimeNavDataFieldTypeRenderer",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/NextGenDateTimeNavDataFieldTypeRenderer",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NextGenDateTimeNavDataFieldTypeRenderer",title:"Class: NextGenDateTimeNavDataFieldTypeRenderer<T>",sidebar_label:"NextGenDateTimeNavDataFieldTypeRenderer",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"NextGenConnextMapBuilder",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/NextGenConnextMapBuilder"},next:{title:"NextGenDisplayUnitNavDataFieldTypeRenderer",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/NextGenDisplayUnitNavDataFieldTypeRenderer"}},m={},p=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"dateTimeSettingManager",id:"datetimesettingmanager",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"localOffset",id:"localoffset",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"timeFormat",id:"timeformat",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"FORMAT_SETTING_MAP",id:"format_setting_map",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"Methods",id:"methods",level:2},{value:"render",id:"render",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-5",level:4}],s={toc:p},o="wrapper";function k(e){let{components:t,...a}=e;return(0,r.kt)(o,(0,n.Z)({},s,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"An abstract next-generation (NXi, G3000, etc) implementation of ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldTypeRenderer"},"NavDataFieldTypeRenderer")," which supports\ndate/time settings."),(0,r.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/NavDataFieldType"},(0,r.kt)("inlineCode",{parentName:"a"},"NavDataFieldType")))))),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"NextGenDateTimeNavDataFieldTypeRenderer"))),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/NextGenNavDataFieldEtaRenderer"},(0,r.kt)("inlineCode",{parentName:"a"},"NextGenNavDataFieldEtaRenderer"))),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/NavDataFieldLdgRenderer"},(0,r.kt)("inlineCode",{parentName:"a"},"NavDataFieldLdgRenderer"))))),(0,r.kt)("h2",{id:"implements"},"Implements"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldTypeRenderer"},(0,r.kt)("inlineCode",{parentName:"a"},"NavDataFieldTypeRenderer")),"<",(0,r.kt)("inlineCode",{parentName:"li"},"T"),">")),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new NextGenDateTimeNavDataFieldTypeRenderer"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"dateTimeSettingManager"),")"),(0,r.kt)("p",null,"Constructor."),(0,r.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/NavDataFieldType"},(0,r.kt)("inlineCode",{parentName:"a"},"NavDataFieldType")))))),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"dateTimeSettingManager")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"UserSettingManager"),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/modules#datetimeusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"DateTimeUserSettingTypes")),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"A date/time user setting manager.")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/navdatafield/NextGenNavDataFieldRenderers.tsx:62"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"datetimesettingmanager"},"dateTimeSettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"dateTimeSettingManager"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSettingManager"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#datetimeusersettingtypes"},(0,r.kt)("inlineCode",{parentName:"a"},"DateTimeUserSettingTypes")),">"),(0,r.kt)("p",null,"A date/time user setting manager."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/navdatafield/NextGenNavDataFieldRenderers.tsx:62"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"localoffset"},"localOffset"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"localOffset"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"ConsumerSubject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/navdatafield/NextGenNavDataFieldRenderers.tsx:56"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"timeformat"},"timeFormat"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"timeFormat"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"ConsumerSubject"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/DateTimeFormatSettingMode"},(0,r.kt)("inlineCode",{parentName:"a"},"DateTimeFormatSettingMode")),">"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/navdatafield/NextGenNavDataFieldRenderers.tsx:55"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"format_setting_map"},"FORMAT","_","SETTING","_","MAP"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"FORMAT","_","SETTING","_","MAP"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Object")),(0,r.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Local12")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/TimeDisplayFormat"},(0,r.kt)("inlineCode",{parentName:"a"},"TimeDisplayFormat")))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Local24")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/TimeDisplayFormat"},(0,r.kt)("inlineCode",{parentName:"a"},"TimeDisplayFormat")))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"UTC")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/TimeDisplayFormat"},(0,r.kt)("inlineCode",{parentName:"a"},"TimeDisplayFormat")))))),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/navdatafield/NextGenNavDataFieldRenderers.tsx:49"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"render"},"render"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Abstract")," ",(0,r.kt)("strong",{parentName:"p"},"render"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"model"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"VNode")),(0,r.kt)("p",null,"Renders a navigation data field of this renderer's data field type."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"model")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/modules#navdatafieldtypemodelmap"},(0,r.kt)("inlineCode",{parentName:"a"},"NavDataFieldTypeModelMap")),"[",(0,r.kt)("inlineCode",{parentName:"td"},"T"),"]"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The data model to use for the data field.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"VNode")),(0,r.kt)("p",null,"A navigation data field of this renderer's data field type, as a VNode."),(0,r.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldTypeRenderer"},"NavDataFieldTypeRenderer"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldTypeRenderer#render"},"render")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/navdatafield/NextGenNavDataFieldRenderers.tsx:66"))}k.isMDXComponent=!0}}]);