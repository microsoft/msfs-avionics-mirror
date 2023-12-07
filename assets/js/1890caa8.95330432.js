"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[13373],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>k});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var d=n.createContext({}),s=function(e){var t=n.useContext(d),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},p=function(e){var t=s(e.components);return n.createElement(d.Provider,{value:t},e.children)},m="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,d=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=s(a),c=r,k=m["".concat(d,".").concat(c)]||m[c]||f[c]||i;return a?n.createElement(k,l(l({ref:t},p),{},{components:a})):n.createElement(k,l({ref:t},p))}));function k(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=c;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:r,l[1]=o;for(var s=2;s<i;s++)l[s]=a[s];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}c.displayName="MDXCreateElement"},82207:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>f,frontMatter:()=>i,metadata:()=>o,toc:()=>s});var n=a(87462),r=(a(67294),a(3905));const i={id:"NavDataDurationFieldProps",title:"Interface: NavDataDurationFieldProps<T>",sidebar_label:"NavDataDurationFieldProps",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/interfaces/NavDataDurationFieldProps",id:"garminsdk/interfaces/NavDataDurationFieldProps",title:"Interface: NavDataDurationFieldProps<T>",description:"Component props for NavDataDurationField.",source:"@site/docs/garminsdk/interfaces/NavDataDurationFieldProps.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/NavDataDurationFieldProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataDurationFieldProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NavDataDurationFieldProps",title:"Interface: NavDataDurationFieldProps<T>",sidebar_label:"NavDataDurationFieldProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"NavDataBearingFieldProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataBearingFieldProps"},next:{title:"NavDataFieldModel",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldModel"}},d={},s=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"class",id:"class",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"model",id:"model",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"options",id:"options",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"title",id:"title",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4}],p={toc:s},m="wrapper";function f(e){let{components:t,...a}=e;return(0,r.kt)(m,(0,n.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Component props for NavDataDurationField."),(0,r.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"NumberUnitInterface"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"UnitFamily.Duration"),">")))),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldProps"},(0,r.kt)("inlineCode",{parentName:"a"},"NavDataFieldProps")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"NavDataDurationFieldProps"))))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"children"},"children"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"children"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,r.kt)("p",null,"The children of the display component."),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldProps"},"NavDataFieldProps"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldProps#children"},"children")),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:122"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"class"},"class"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"class"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("p",null,"CSS class(es) to apply to the root of the component."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldProps"},"NavDataFieldProps"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldProps#class"},"class")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/navdatafield/NavDataField.tsx:22"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"model"},"model"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"model"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldModel"},(0,r.kt)("inlineCode",{parentName:"a"},"NavDataFieldModel")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,r.kt)("p",null,"The model data field's data model."),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldProps"},"NavDataFieldProps"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldProps#model"},"model")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/navdatafield/NavDataField.tsx:19"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"options"},"options"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"options"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Partial"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"DurationDisplayOptions"),">"),(0,r.kt)("p",null,"Formatting options."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/navdatafield/NavDataField.tsx:150"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ref"},"ref"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"ref"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,r.kt)("p",null,"A reference to the display component."),(0,r.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldProps"},"NavDataFieldProps"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldProps#ref"},"ref")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:125"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"title"},"title"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"title"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("p",null,"The title of the data field."),(0,r.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldProps"},"NavDataFieldProps"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/NavDataFieldProps#title"},"title")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/navdatafield/NavDataField.tsx:16"))}f.isMDXComponent=!0}}]);