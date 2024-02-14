"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[21331],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),m=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=m(e.components);return r.createElement(s.Provider,{value:t},e.children)},d="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),d=m(n),u=a,f=d["".concat(s,".").concat(u)]||d[u]||c[u]||i;return n?r.createElement(f,o(o({ref:t},p),{},{components:n})):r.createElement(f,o({ref:t},p))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=u;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[d]="string"==typeof e?e:a,o[1]=l;for(var m=2;m<i;m++)o[m]=n[m];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},66744:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>c,frontMatter:()=>i,metadata:()=>l,toc:()=>m});var r=n(87462),a=(n(67294),n(3905));const i={id:"PrematureDescentConfig",title:"Class: PrematureDescentConfig",sidebar_label:"PrematureDescentConfig",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"g3000common/classes/PrematureDescentConfig",id:"g3000common/classes/PrematureDescentConfig",title:"Class: PrematureDescentConfig",description:"A configuration object which defines options related to premature descent (PDA) alerts.",source:"@site/docs/g3000common/classes/PrematureDescentConfig.md",sourceDirName:"g3000common/classes",slug:"/g3000common/classes/PrematureDescentConfig",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/PrematureDescentConfig",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"PrematureDescentConfig",title:"Class: PrematureDescentConfig",sidebar_label:"PrematureDescentConfig",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"PfdUserSettings",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/PfdUserSettings"},next:{title:"ProcedurePreviewPaneView",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/ProcedurePreviewPaneView"}},s={},m=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"isResolvableConfig",id:"isresolvableconfig",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"resolve",id:"resolve",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:m},d="wrapper";function c(e){let{components:t,...n}=e;return(0,a.kt)(d,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A configuration object which defines options related to premature descent (PDA) alerts."),(0,a.kt)("h2",{id:"implements"},"Implements"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000common/modules#terrainsystemmoduleconfig"},(0,a.kt)("inlineCode",{parentName:"a"},"TerrainSystemModuleConfig")))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new PrematureDescentConfig"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"type"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"element?"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/PrematureDescentConfig"},(0,a.kt)("inlineCode",{parentName:"a"},"PrematureDescentConfig"))),(0,a.kt)("p",null,"Creates a new PrematureDescentConfig."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"type")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000common/modules#g3000terrainsystemtype"},(0,a.kt)("inlineCode",{parentName:"a"},"G3000TerrainSystemType"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The terrain system type for which to create the configuration object.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"element?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Element")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A configuration document element from which to parse options. If not defined, then default options based on the terrain system type will be used.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/PrematureDescentConfig"},(0,a.kt)("inlineCode",{parentName:"a"},"PrematureDescentConfig"))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Terrain/PrematureDescentConfig.ts:22"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"isresolvableconfig"},"isResolvableConfig"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"isResolvableConfig"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"true")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,a.kt)("p",null,"TerrainSystemModuleConfig.isResolvableConfig"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Terrain/PrematureDescentConfig.ts:14"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"resolve"},"resolve"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"resolve"),"(): (",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"EventBus"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"fms"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Fms"),"<",(0,a.kt)("inlineCode",{parentName:"p"},'""'),">",") => ",(0,a.kt)("inlineCode",{parentName:"p"},"TerrainSystemModule")),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"fn")),(0,a.kt)("p",null,"\u25b8 (",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"fms"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"TerrainSystemModule")),(0,a.kt)("h5",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"EventBus"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"fms")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Fms"),"<",(0,a.kt)("inlineCode",{parentName:"td"},'""'),">")))),(0,a.kt)("h5",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"TerrainSystemModule")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,a.kt)("p",null,"TerrainSystemModuleConfig.resolve"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Terrain/PrematureDescentConfig.ts:31"))}c.isMDXComponent=!0}}]);