"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[61822],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>f});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var s=r.createContext({}),c=function(e){var t=r.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},m=function(e){var t=c(e.components);return r.createElement(s.Provider,{value:t},e.children)},p="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,s=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),p=c(a),k=n,f=p["".concat(s,".").concat(k)]||p[k]||d[k]||i;return a?r.createElement(f,l(l({ref:t},m),{},{components:a})):r.createElement(f,l({ref:t},m))}));function f(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,l=new Array(i);l[0]=k;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[p]="string"==typeof e?e:n,l[1]=o;for(var c=2;c<i;c++)l[c]=a[c];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}k.displayName="MDXCreateElement"},71510:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>d,frontMatter:()=>i,metadata:()=>o,toc:()=>c});var r=a(87462),n=(a(67294),a(3905));const i={id:"index.FmcPageFactory",title:"Class: FmcPageFactory<T>",sidebar_label:"FmcPageFactory",custom_edit_url:null},l=void 0,o={unversionedId:"framework/classes/index.FmcPageFactory",id:"framework/classes/index.FmcPageFactory",title:"Class: FmcPageFactory<T>",description:"index.FmcPageFactory",source:"@site/docs/framework/classes/index.FmcPageFactory.md",sourceDirName:"framework/classes",slug:"/framework/classes/index.FmcPageFactory",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.FmcPageFactory",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.FmcPageFactory",title:"Class: FmcPageFactory<T>",sidebar_label:"FmcPageFactory",custom_edit_url:null},sidebar:"sidebar",previous:{title:"FmcListUtility",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.FmcListUtility"},next:{title:"FmcRouter",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.FmcRouter"}},s={},c=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Methods",id:"methods",level:2},{value:"createPage",id:"createpage",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4}],m={toc:c},p="wrapper";function d(e){let{components:t,...a}=e;return(0,n.kt)(p,(0,r.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".FmcPageFactory"),(0,n.kt)("p",null,"FMC Page factory, used to instantiate pages."),(0,n.kt)("p",null,"FMC Pages should be instantiated with the required data and objects (FMS instances, avionics-specific utilities, event busses)\nin instances of subclasses of this type."),(0,n.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFmcPage"},(0,n.kt)("inlineCode",{parentName:"a"},"AbstractFmcPage")))))),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new FmcPageFactory"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"T"),">","()"),(0,n.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFmcPage"},(0,n.kt)("inlineCode",{parentName:"a"},"AbstractFmcPage")),"<",(0,n.kt)("inlineCode",{parentName:"td"},"T"),">")))),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"createpage"},"createPage"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("inlineCode",{parentName:"p"},"Abstract")," ",(0,n.kt)("strong",{parentName:"p"},"createPage"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"pageCtor"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"screen"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"renderCallback"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"T")),(0,n.kt)("p",null,"Creates a page of the specified subtype of ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.AbstractFmcPage"},"AbstractFmcPage")),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"pageCtor")),(0,n.kt)("td",{parentName:"tr",align:"left"},"(...",(0,n.kt)("inlineCode",{parentName:"td"},"args"),": ",(0,n.kt)("inlineCode",{parentName:"td"},"any"),"[]) => ",(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"the page constructor")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"bus")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.EventBus"},(0,n.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"the event bus")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"screen")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.FmcScreen"},(0,n.kt)("inlineCode",{parentName:"a"},"FmcScreen")),"<",(0,n.kt)("inlineCode",{parentName:"td"},"T"),", ",(0,n.kt)("inlineCode",{parentName:"td"},"any"),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the FMC screen instance")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"renderCallback")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules/#fmcrendercallback"},(0,n.kt)("inlineCode",{parentName:"a"},"FmcRenderCallback"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"the render callback to give to the page")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"T")),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/fmc/FmcPageFactory.ts:23"))}d.isMDXComponent=!0}}]);