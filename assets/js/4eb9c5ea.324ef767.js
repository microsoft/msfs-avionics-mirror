"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[81226],{3905:(e,t,a)=>{a.d(t,{Zo:()=>o,kt:()=>f});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function d(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var p=n.createContext({}),m=function(e){var t=n.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},o=function(e){var t=m(e.components);return n.createElement(p.Provider,{value:t},e.children)},s="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,o=d(e,["components","mdxType","originalType","parentName"]),s=m(a),c=r,f=s["".concat(p,".").concat(c)]||s[c]||k[c]||i;return a?n.createElement(f,l(l({ref:t},o),{},{components:a})):n.createElement(f,l({ref:t},o))}));function f(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=c;var d={};for(var p in t)hasOwnProperty.call(t,p)&&(d[p]=t[p]);d.originalType=e,d[s]="string"==typeof e?e:r,l[1]=d;for(var m=2;m<i;m++)l[m]=a[m];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}c.displayName="MDXCreateElement"},14487:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>k,frontMatter:()=>i,metadata:()=>d,toc:()=>m});var n=a(87462),r=(a(67294),a(3905));const i={id:"FmcListUtility",title:"Class: FmcListUtility<T>",sidebar_label:"FmcListUtility",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"framework/classes/FmcListUtility",id:"framework/classes/FmcListUtility",title:"Class: FmcListUtility<T>",description:"Utility class to drive list",source:"@site/docs/framework/classes/FmcListUtility.md",sourceDirName:"framework/classes",slug:"/framework/classes/FmcListUtility",permalink:"/msfs-avionics-mirror/docs/framework/classes/FmcListUtility",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FmcListUtility",title:"Class: FmcListUtility<T>",sidebar_label:"FmcListUtility",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FmcComponent",permalink:"/msfs-avionics-mirror/docs/framework/classes/FmcComponent"},next:{title:"FmcPageFactory",permalink:"/msfs-avionics-mirror/docs/framework/classes/FmcPageFactory"}},p={},m=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"data",id:"data",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"firstPageSize",id:"firstpagesize",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"page",id:"page",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"renderRow",id:"renderrow",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns",level:5},{value:"Defined in",id:"defined-in-4",level:4},{value:"size",id:"size",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"Methods",id:"methods",level:2},{value:"handleSelectKey",id:"handleselectkey",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"renderList",id:"renderlist",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-7",level:4}],o={toc:m},s="wrapper";function k(e){let{components:t,...a}=e;return(0,r.kt)(s,(0,n.Z)({},o,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Utility class to drive list"),(0,r.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T"))))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new FmcListUtility"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"page"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"data"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"renderRow"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"size?"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"firstPageSize?"),")"),(0,r.kt)("p",null,"FMC List Utility Class"),(0,r.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T"))))),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"page")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFmcPage"},(0,r.kt)("inlineCode",{parentName:"a"},"AbstractFmcPage"))),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The Fmc Page")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"data")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableArray"},(0,r.kt)("inlineCode",{parentName:"a"},"SubscribableArray")),"<",(0,r.kt)("inlineCode",{parentName:"td"},"T"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The row input data")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"renderRow")),(0,r.kt)("td",{parentName:"tr",align:"left"},"(",(0,r.kt)("inlineCode",{parentName:"td"},"page"),": ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFmcPage"},(0,r.kt)("inlineCode",{parentName:"a"},"AbstractFmcPage")),", ",(0,r.kt)("inlineCode",{parentName:"td"},"indexInDisplay"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"number"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"prevData?"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"data?"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"nextData?"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),") => ",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#fmcrendertemplaterow"},(0,r.kt)("inlineCode",{parentName:"a"},"FmcRenderTemplateRow")),"[]"),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Function to call when the list needs to be re-rendered with new data")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"size")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"5")),(0,r.kt)("td",{parentName:"tr",align:"left"},"row count of the list per page")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"firstPageSize")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")),(0,r.kt)("td",{parentName:"tr",align:"left"},"row count of the first page of the list")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/fmc/FmcListUtility.ts:19"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"data"},"data"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"data"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableArray"},(0,r.kt)("inlineCode",{parentName:"a"},"SubscribableArray")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,r.kt)("p",null,"The row input data"),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/fmc/FmcListUtility.ts:21"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"firstpagesize"},"firstPageSize"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"firstPageSize"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")),(0,r.kt)("p",null,"row count of the first page of the list"),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/fmc/FmcListUtility.ts:24"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"page"},"page"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"page"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFmcPage"},(0,r.kt)("inlineCode",{parentName:"a"},"AbstractFmcPage"))),(0,r.kt)("p",null,"The Fmc Page"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/fmc/FmcListUtility.ts:20"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"renderrow"},"renderRow"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"renderRow"),": (",(0,r.kt)("inlineCode",{parentName:"p"},"page"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFmcPage"},(0,r.kt)("inlineCode",{parentName:"a"},"AbstractFmcPage")),", ",(0,r.kt)("inlineCode",{parentName:"p"},"indexInDisplay"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"prevData?"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"T"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"data?"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"T"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"nextData?"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"T"),") => ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#fmcrendertemplaterow"},(0,r.kt)("inlineCode",{parentName:"a"},"FmcRenderTemplateRow")),"[]"),(0,r.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,r.kt)("p",null,"\u25b8 (",(0,r.kt)("inlineCode",{parentName:"p"},"page"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"indexInDisplay"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"prevData?"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"data?"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"nextData?"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#fmcrendertemplaterow"},(0,r.kt)("inlineCode",{parentName:"a"},"FmcRenderTemplateRow")),"[]"),(0,r.kt)("p",null,"Function to call when the list needs to be re-rendered with new data"),(0,r.kt)("h5",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"page")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractFmcPage"},(0,r.kt)("inlineCode",{parentName:"a"},"AbstractFmcPage")))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"indexInDisplay")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"prevData?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"data?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"nextData?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T"))))),(0,r.kt)("h5",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#fmcrendertemplaterow"},(0,r.kt)("inlineCode",{parentName:"a"},"FmcRenderTemplateRow")),"[]"),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/fmc/FmcListUtility.ts:22"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"size"},"size"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"size"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"5")),(0,r.kt)("p",null,"row count of the list per page"),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/fmc/FmcListUtility.ts:23"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"handleselectkey"},"handleSelectKey"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"handleSelectKey"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"event"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Handles when the Select Key is pressed."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"event")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LineSelectKeyEvent"},(0,r.kt)("inlineCode",{parentName:"a"},"LineSelectKeyEvent"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The Select Key Event.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether the event was handled by this component."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/sdk/fmc/FmcListUtility.ts:59"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"renderlist"},"renderList"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"renderList"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"page"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#fmcrendertemplaterow"},(0,r.kt)("inlineCode",{parentName:"a"},"FmcRenderTemplateRow")),"[]"),(0,r.kt)("p",null,"Returns a rendered list page for a specified page"),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"page")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The page number to render")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#fmcrendertemplaterow"},(0,r.kt)("inlineCode",{parentName:"a"},"FmcRenderTemplateRow")),"[]"),(0,r.kt)("p",null,"The FmcRenderTemplate"),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/sdk/fmc/FmcListUtility.ts:33"))}k.isMDXComponent=!0}}]);