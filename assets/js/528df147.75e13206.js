"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[12702],{3905:(e,t,i)=>{i.d(t,{Zo:()=>p,kt:()=>f});var n=i(67294);function a(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function r(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,n)}return i}function l(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?r(Object(i),!0).forEach((function(t){a(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):r(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function d(e,t){if(null==e)return{};var i,n,a=function(e,t){if(null==e)return{};var i,n,a={},r=Object.keys(e);for(n=0;n<r.length;n++)i=r[n],t.indexOf(i)>=0||(a[i]=e[i]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)i=r[n],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(a[i]=e[i])}return a}var o=n.createContext({}),s=function(e){var t=n.useContext(o),i=t;return e&&(i="function"==typeof e?e(t):l(l({},t),e)),i},p=function(e){var t=s(e.components);return n.createElement(o.Provider,{value:t},e.children)},m="mdxType",v={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var i=e.components,a=e.mdxType,r=e.originalType,o=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),m=s(i),u=a,f=m["".concat(o,".").concat(u)]||m[u]||v[u]||r;return i?n.createElement(f,l(l({ref:t},p),{},{components:i})):n.createElement(f,l({ref:t},p))}));function f(e,t){var i=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=i.length,l=new Array(r);l[0]=u;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[m]="string"==typeof e?e:a,l[1]=d;for(var s=2;s<r;s++)l[s]=i[s];return n.createElement.apply(null,l)}return n.createElement.apply(null,i)}u.displayName="MDXCreateElement"},45425:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>v,frontMatter:()=>r,metadata:()=>d,toc:()=>s});var n=i(87462),a=(i(67294),i(3905));const r={id:"DefaultVdiDataProvider",title:"Class: DefaultVdiDataProvider",sidebar_label:"DefaultVdiDataProvider",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"g3000pfd/classes/DefaultVdiDataProvider",id:"g3000pfd/classes/DefaultVdiDataProvider",title:"Class: DefaultVdiDataProvider",description:"A default implementation of VdiDataProvider.",source:"@site/docs/g3000pfd/classes/DefaultVdiDataProvider.md",sourceDirName:"g3000pfd/classes",slug:"/g3000pfd/classes/DefaultVdiDataProvider",permalink:"/msfs-avionics-mirror/docs/g3000pfd/classes/DefaultVdiDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"DefaultVdiDataProvider",title:"Class: DefaultVdiDataProvider",sidebar_label:"DefaultVdiDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"DefaultTimeInfoDataProvider",permalink:"/msfs-avionics-mirror/docs/g3000pfd/classes/DefaultTimeInfoDataProvider"},next:{title:"Fma",permalink:"/msfs-avionics-mirror/docs/g3000pfd/classes/Fma"}},o={},s=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"gpDeviation",id:"gpdeviation",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"gpDeviationIsPreview",id:"gpdeviationispreview",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"gpDeviationScale",id:"gpdeviationscale",level:3},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"gpServiceLevel",id:"gpservicelevel",level:3},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"gsDeviation",id:"gsdeviation",level:3},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"gsDeviationIsPreview",id:"gsdeviationispreview",level:3},{value:"Implementation of",id:"implementation-of-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"hasGp",id:"hasgp",level:3},{value:"Implementation of",id:"implementation-of-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"hasGs",id:"hasgs",level:3},{value:"Implementation of",id:"implementation-of-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"hasVNav",id:"hasvnav",level:3},{value:"Implementation of",id:"implementation-of-8",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"isPastFaf",id:"ispastfaf",level:3},{value:"Implementation of",id:"implementation-of-9",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"vnavDeviation",id:"vnavdeviation",level:3},{value:"Implementation of",id:"implementation-of-10",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"init",id:"init",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"pause",id:"pause",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"resume",id:"resume",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-15",level:4}],p={toc:s},m="wrapper";function v(e){let{components:t,...i}=e;return(0,a.kt)(m,(0,n.Z)({},p,i,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A default implementation of ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider"},"VdiDataProvider"),"."),(0,a.kt)("h2",{id:"implements"},"Implements"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider"},(0,a.kt)("inlineCode",{parentName:"a"},"VdiDataProvider")))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new DefaultVdiDataProvider"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"ahrsIndex"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"vnavDataProvider"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"activeNavIndicator"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"gsPreviewNavIndicator"),")"),(0,a.kt)("p",null,"Constructor."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"ahrsIndex")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"number"),">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index of the AHRS that is the source of this provider's heading data.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"vnavDataProvider")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"VNavDataProvider")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A provider of VNAV data.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"activeNavIndicator")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"G3000NavIndicator")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The nav indicator for the active nav source.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"gsPreviewNavIndicator")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"G3000NavIndicator")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The nav indicator for the glideslope preview.")))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:202"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"gpdeviation"},"gpDeviation"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"gpDeviation"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The current glidepath deviation."),(0,a.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider"},"VdiDataProvider"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider#gpdeviation"},"gpDeviation")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:74"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"gpdeviationispreview"},"gpDeviationIsPreview"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"gpDeviationIsPreview"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether the current glidepath deviation is a preview."),(0,a.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider"},"VdiDataProvider"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider#gpdeviationispreview"},"gpDeviationIsPreview")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:78"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"gpdeviationscale"},"gpDeviationScale"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"gpDeviationScale"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The current glidepath deviation scale, in feet."),(0,a.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider"},"VdiDataProvider"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider#gpdeviationscale"},"gpDeviationScale")),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:82"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"gpservicelevel"},"gpServiceLevel"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"gpServiceLevel"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"GlidepathServiceLevel"),">"),(0,a.kt)("p",null,"The current glidepath service level."),(0,a.kt)("h4",{id:"implementation-of-3"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider"},"VdiDataProvider"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider#gpservicelevel"},"gpServiceLevel")),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:70"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"gsdeviation"},"gsDeviation"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"gsDeviation"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The current glideslope deviation."),(0,a.kt)("h4",{id:"implementation-of-4"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider"},"VdiDataProvider"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider#gsdeviation"},"gsDeviation")),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:58"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"gsdeviationispreview"},"gsDeviationIsPreview"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"gsDeviationIsPreview"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether the current glideslope deviation is a preview."),(0,a.kt)("h4",{id:"implementation-of-5"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider"},"VdiDataProvider"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider#gsdeviationispreview"},"gsDeviationIsPreview")),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:62"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"hasgp"},"hasGp"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"hasGp"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether a glidepath is available."),(0,a.kt)("h4",{id:"implementation-of-6"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider"},"VdiDataProvider"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider#hasgp"},"hasGp")),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:66"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"hasgs"},"hasGs"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"hasGs"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether a glideslope is available."),(0,a.kt)("h4",{id:"implementation-of-7"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider"},"VdiDataProvider"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider#hasgs"},"hasGs")),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:54"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"hasvnav"},"hasVNav"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"hasVNav"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether a VNAV path is available."),(0,a.kt)("h4",{id:"implementation-of-8"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider"},"VdiDataProvider"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider#hasvnav"},"hasVNav")),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:86"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ispastfaf"},"isPastFaf"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"isPastFaf"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether the active leg is past the final approach fix."),(0,a.kt)("h4",{id:"implementation-of-9"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider"},"VdiDataProvider"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider#ispastfaf"},"isPastFaf")),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:103"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"vnavdeviation"},"vnavDeviation"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"vnavDeviation"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The current VNAV vertical deviation."),(0,a.kt)("h4",{id:"implementation-of-10"},"Implementation of"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider"},"VdiDataProvider"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000pfd/interfaces/VdiDataProvider#vnavdeviation"},"vnavDeviation")),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:90"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"destroy"},"destroy"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can\nno longer be paused or resumed."),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:451"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"init"},"init"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"init"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Initializes this data provider. Once initialized, this data provider will continuously update its data until\npaused or destroyed."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,a.kt)("p",null,"Error if this data provider is dead."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"paused")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"false")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether to initialize this data provider as paused. If ",(0,a.kt)("inlineCode",{parentName:"td"},"true"),", this data provider will provide an initial set of data but will not update the provided data until it is resumed. Defaults to ",(0,a.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:219"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"pause"},"pause"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"pause"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Pauses this data provider. Once paused, this data provider will not update its data until it is resumed."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,a.kt)("p",null,"Error if this data provider is dead."),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:409"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"resume"},"resume"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"resume"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or\ndestroyed."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,a.kt)("p",null,"Error if this data provider is dead."),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/Components/VDI/VdiDataProvider.ts:379"))}v.isMDXComponent=!0}}]);