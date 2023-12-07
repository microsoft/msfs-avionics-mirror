"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[19352],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>d});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=i.createContext({}),m=function(e){var t=i.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=m(e.components);return i.createElement(s.Provider,{value:t},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},f=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),p=m(n),f=r,d=p["".concat(s,".").concat(f)]||p[f]||u[f]||a;return n?i.createElement(d,o(o({ref:t},c),{},{components:n})):i.createElement(d,o({ref:t},c))}));function d(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,o=new Array(a);o[0]=f;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[p]="string"==typeof e?e:r,o[1]=l;for(var m=2;m<a;m++)o[m]=n[m];return i.createElement.apply(null,o)}return i.createElement.apply(null,n)}f.displayName="MDXCreateElement"},38485:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>u,frontMatter:()=>a,metadata:()=>l,toc:()=>m});var i=n(87462),r=(n(67294),n(3905));const a={id:"NumericMaxConfig",title:"Class: NumericMaxConfig",sidebar_label:"NumericMaxConfig",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"g1000common/classes/NumericMaxConfig",id:"g1000common/classes/NumericMaxConfig",title:"Class: NumericMaxConfig",description:"A configuration object which defines a factory for a numeric value which is the maximum of one or more inputs.",source:"@site/docs/g1000common/classes/NumericMaxConfig.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/NumericMaxConfig",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/NumericMaxConfig",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NumericMaxConfig",title:"Class: NumericMaxConfig",sidebar_label:"NumericMaxConfig",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"NumericConstantConfig",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/NumericConstantConfig"},next:{title:"NumericMinConfig",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/NumericMinConfig"}},s={},m=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"inputs",id:"inputs",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"isNumericConfig",id:"isnumericconfig",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"isResolvableConfig",id:"isresolvableconfig",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"resolve",id:"resolve",level:3},{value:"Returns",id:"returns",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-1",level:5},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-4",level:4}],c={toc:m},p="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(p,(0,i.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A configuration object which defines a factory for a numeric value which is the maximum of one or more inputs."),(0,r.kt)("h2",{id:"implements"},"Implements"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/NumericConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"NumericConfig")))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new NumericMaxConfig"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"factory"),")"),(0,r.kt)("p",null,"Creates a new NumericMaxConfig from a configuration document element."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"factory")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/ConfigFactory"},(0,r.kt)("inlineCode",{parentName:"a"},"ConfigFactory"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration object factory to use to create child configuration objects.")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Config/NumericConfig.ts:132"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"inputs"},"inputs"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"inputs"),": readonly ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/NumericConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"NumericConfig")),"[]"),(0,r.kt)("p",null,"The inputs of this config."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Config/NumericConfig.ts:125"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isnumericconfig"},"isNumericConfig"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"isNumericConfig"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("p",null,"Flags this object as a NumericConfig."),(0,r.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/NumericConfig"},"NumericConfig"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/NumericConfig#isnumericconfig"},"isNumericConfig")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Config/NumericConfig.ts:122"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isresolvableconfig"},"isResolvableConfig"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"isResolvableConfig"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("p",null,"Flags this object as a ResolvableConfig."),(0,r.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/NumericConfig"},"NumericConfig"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/NumericConfig#isresolvableconfig"},"isResolvableConfig")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Config/NumericConfig.ts:121"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"resolve"},"resolve"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"resolve"),"(): (",(0,r.kt)("inlineCode",{parentName:"p"},"context?"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"any"),") => ",(0,r.kt)("inlineCode",{parentName:"p"},"number")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"MappedSubscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"Resolves this config to a value."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fn")),(0,r.kt)("p",null,"This config's resolved value."),(0,r.kt)("p",null,"\u25b8 (",(0,r.kt)("inlineCode",{parentName:"p"},"context?"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"number")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"MappedSubscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h5",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"context?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"any"))))),(0,r.kt)("h5",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"number")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"MappedSubscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/NumericConfig"},"NumericConfig"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/NumericConfig#resolve"},"resolve")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Config/NumericConfig.ts:154"))}u.isMDXComponent=!0}}]);