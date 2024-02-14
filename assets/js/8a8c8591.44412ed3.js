"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[42739],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>d});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},o=Object.keys(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=i.createContext({}),m=function(e){var t=i.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},c=function(e){var t=m(e.components);return i.createElement(s.Provider,{value:t},e.children)},u="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},f=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=m(n),f=r,d=u["".concat(s,".").concat(f)]||u[f]||p[f]||o;return n?i.createElement(d,a(a({ref:t},c),{},{components:n})):i.createElement(d,a({ref:t},c))}));function d(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,a=new Array(o);a[0]=f;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[u]="string"==typeof e?e:r,a[1]=l;for(var m=2;m<o;m++)a[m]=n[m];return i.createElement.apply(null,a)}return i.createElement.apply(null,n)}f.displayName="MDXCreateElement"},47490:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>a,default:()=>p,frontMatter:()=>o,metadata:()=>l,toc:()=>m});var i=n(87462),r=(n(67294),n(3905));const o={id:"NumericMaxConfig",title:"Class: NumericMaxConfig",sidebar_label:"NumericMaxConfig",sidebar_position:0,custom_edit_url:null},a=void 0,l={unversionedId:"g3xtouchcommon/classes/NumericMaxConfig",id:"g3xtouchcommon/classes/NumericMaxConfig",title:"Class: NumericMaxConfig",description:"A configuration object which defines a factory for a numeric value which is the maximum of one or more inputs.",source:"@site/docs/g3xtouchcommon/classes/NumericMaxConfig.md",sourceDirName:"g3xtouchcommon/classes",slug:"/g3xtouchcommon/classes/NumericMaxConfig",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NumericMaxConfig",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NumericMaxConfig",title:"Class: NumericMaxConfig",sidebar_label:"NumericMaxConfig",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"NumericConstantConfig",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NumericConstantConfig"},next:{title:"NumericMinConfig",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NumericMinConfig"}},s={},m=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"inputs",id:"inputs",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"isNumericConfig",id:"isnumericconfig",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"isResolvableConfig",id:"isresolvableconfig",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"resolve",id:"resolve",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-4",level:4}],c={toc:m},u="wrapper";function p(e){let{components:t,...n}=e;return(0,r.kt)(u,(0,i.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A configuration object which defines a factory for a numeric value which is the maximum of one or more inputs."),(0,r.kt)("h2",{id:"implements"},"Implements"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/NumericConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"NumericConfig")))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new NumericMaxConfig"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"factory"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NumericMaxConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"NumericMaxConfig"))),(0,r.kt)("p",null,"Creates a new NumericMaxConfig from a configuration document element."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"factory")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/ConfigFactory"},(0,r.kt)("inlineCode",{parentName:"a"},"ConfigFactory"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration object factory to use to create child configuration objects.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/NumericMaxConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"NumericMaxConfig"))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Config/NumericConfig.ts:132"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"inputs"},"inputs"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"inputs"),": readonly ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/NumericConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"NumericConfig")),"[]"),(0,r.kt)("p",null,"The inputs of this config."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Config/NumericConfig.ts:125"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isnumericconfig"},"isNumericConfig"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"isNumericConfig"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("p",null,"Flags this object as a NumericConfig."),(0,r.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/NumericConfig"},"NumericConfig"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/NumericConfig#isnumericconfig"},"isNumericConfig")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Config/NumericConfig.ts:122"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isresolvableconfig"},"isResolvableConfig"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"isResolvableConfig"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("p",null,"Flags this object as a ResolvableConfig."),(0,r.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/NumericConfig"},"NumericConfig"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/NumericConfig#isresolvableconfig"},"isResolvableConfig")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Config/NumericConfig.ts:121"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"resolve"},"resolve"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"resolve"),"(): (",(0,r.kt)("inlineCode",{parentName:"p"},"context?"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"any"),") => ",(0,r.kt)("inlineCode",{parentName:"p"},"number")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"MappedSubscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"Resolves this config to a value."),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fn")),(0,r.kt)("p",null,"This config's resolved value."),(0,r.kt)("p",null,"\u25b8 (",(0,r.kt)("inlineCode",{parentName:"p"},"context?"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"number")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"MappedSubscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("h5",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"context?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"any"))))),(0,r.kt)("h5",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"number")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"MappedSubscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/NumericConfig"},"NumericConfig"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/NumericConfig#resolve"},"resolve")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Config/NumericConfig.ts:154"))}p.isMDXComponent=!0}}]);