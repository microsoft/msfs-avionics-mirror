"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[32033],{3905:(e,n,t)=>{t.d(n,{Zo:()=>m,kt:()=>f});var o=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,o,i=function(e,n){if(null==e)return{};var t,o,i={},r=Object.keys(e);for(o=0;o<r.length;o++)t=r[o],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(o=0;o<r.length;o++)t=r[o],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var s=o.createContext({}),p=function(e){var n=o.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},m=function(e){var n=p(e.components);return o.createElement(s.Provider,{value:n},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var n=e.children;return o.createElement(o.Fragment,{},n)}},c=o.forwardRef((function(e,n){var t=e.components,i=e.mdxType,r=e.originalType,s=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),u=p(t),c=i,f=u["".concat(s,".").concat(c)]||u[c]||d[c]||r;return t?o.createElement(f,a(a({ref:n},m),{},{components:t})):o.createElement(f,a({ref:n},m))}));function f(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var r=t.length,a=new Array(r);a[0]=c;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l[u]="string"==typeof e?e:i,a[1]=l;for(var p=2;p<r;p++)a[p]=t[p];return o.createElement.apply(null,a)}return o.createElement.apply(null,t)}c.displayName="MDXCreateElement"},7347:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>a,default:()=>d,frontMatter:()=>r,metadata:()=>l,toc:()=>p});var o=t(87462),i=(t(67294),t(3905));const r={id:"LookupTableConfig",title:"Class: LookupTableConfig",sidebar_label:"LookupTableConfig",sidebar_position:0,custom_edit_url:null},a=void 0,l={unversionedId:"g3000common/classes/LookupTableConfig",id:"g3000common/classes/LookupTableConfig",title:"Class: LookupTableConfig",description:"A configuration object which defines a lookup table.",source:"@site/docs/g3000common/classes/LookupTableConfig.md",sourceDirName:"g3000common/classes",slug:"/g3000common/classes/LookupTableConfig",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/LookupTableConfig",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"LookupTableConfig",title:"Class: LookupTableConfig",sidebar_label:"LookupTableConfig",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"LegNameDisplay",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/LegNameDisplay"},next:{title:"MapAliasedUserSettingManager",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/MapAliasedUserSettingManager"}},s={},p=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"breakpoints",id:"breakpoints",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"dimensions",id:"dimensions",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"isResolvableConfig",id:"isresolvableconfig",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"resolve",id:"resolve",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-4",level:4}],m={toc:p},u="wrapper";function d(e){let{components:n,...t}=e;return(0,i.kt)(u,(0,o.Z)({},m,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A configuration object which defines a lookup table."),(0,i.kt)("h2",{id:"implements"},"Implements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/ResolvableConfig"},(0,i.kt)("inlineCode",{parentName:"a"},"ResolvableConfig")),"<",(0,i.kt)("inlineCode",{parentName:"li"},"LerpLookupTable"),">")),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new LookupTableConfig"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"element"),"): ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/LookupTableConfig"},(0,i.kt)("inlineCode",{parentName:"a"},"LookupTableConfig"))),(0,i.kt)("p",null,"Creates a new LookupTableConfig from a configuration document element."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"element")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"Element")),(0,i.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")))),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/LookupTableConfig"},(0,i.kt)("inlineCode",{parentName:"a"},"LookupTableConfig"))),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Config/LookupTableConfig.ts:22"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"breakpoints"},"breakpoints"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"breakpoints"),": readonly readonly ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),"[][]"),(0,i.kt)("p",null,"The breakpoints of this config's lookup table."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Config/LookupTableConfig.ts:16"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"dimensions"},"dimensions"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"dimensions"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The dimension count of this config's lookup table."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Config/LookupTableConfig.ts:13"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isresolvableconfig"},"isResolvableConfig"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"isResolvableConfig"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"true")),(0,i.kt)("p",null,"Flags this object as a ResolvableConfig."),(0,i.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/ResolvableConfig"},"ResolvableConfig"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/ResolvableConfig#isresolvableconfig"},"isResolvableConfig")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Config/LookupTableConfig.ts:10"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"resolve"},"resolve"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"resolve"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"LerpLookupTable")),(0,i.kt)("p",null,"Resolves this config to a value."),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"LerpLookupTable")),(0,i.kt)("p",null,"This config's resolved value."),(0,i.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/ResolvableConfig"},"ResolvableConfig"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/ResolvableConfig#resolve"},"resolve")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Config/LookupTableConfig.ts:64"))}d.isMDXComponent=!0}}]);