"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[75406],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>c});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=i.createContext({}),d=function(e){var t=i.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=d(e.components);return i.createElement(s.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},f=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),m=d(n),f=r,c=m["".concat(s,".").concat(f)]||m[f]||u[f]||a;return n?i.createElement(c,o(o({ref:t},p),{},{components:n})):i.createElement(c,o({ref:t},p))}));function c(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,o=new Array(a);o[0]=f;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[m]="string"==typeof e?e:r,o[1]=l;for(var d=2;d<a;d++)o[d]=n[d];return i.createElement.apply(null,o)}return i.createElement.apply(null,n)}f.displayName="MDXCreateElement"},38339:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>u,frontMatter:()=>a,metadata:()=>l,toc:()=>d});var i=n(87462),r=(n(67294),n(3905));const a={id:"IauConfig",title:"Class: IauConfig",sidebar_label:"IauConfig",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"g3000common/classes/IauConfig",id:"g3000common/classes/IauConfig",title:"Class: IauConfig",description:"A configuration object which defines options related to an IAU.",source:"@site/docs/g3000common/classes/IauConfig.md",sourceDirName:"g3000common/classes",slug:"/g3000common/classes/IauConfig",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/IauConfig",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"IauConfig",title:"Class: IauConfig",sidebar_label:"IauConfig",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"HorizonConfig",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/HorizonConfig"},next:{title:"IauDefsConfig",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/IauDefsConfig"}},s={},d=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"altimeterIndex",id:"altimeterindex",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"defaultAdcIndex",id:"defaultadcindex",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"defaultAhrsIndex",id:"defaultahrsindex",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"fmsPosDefinition",id:"fmsposdefinition",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"gpsDefinition",id:"gpsdefinition",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"index",id:"index",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"supportBaroPreselect",id:"supportbaropreselect",level:3},{value:"Defined in",id:"defined-in-7",level:4}],p={toc:d},m="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(m,(0,i.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A configuration object which defines options related to an IAU."),(0,r.kt)("h2",{id:"implements"},"Implements"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/Config"},(0,r.kt)("inlineCode",{parentName:"a"},"Config")))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new IauConfig"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"baseInstrument"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"element"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"defaultIndex?"),")"),(0,r.kt)("p",null,"Creates a new IauConfig from a configuration document element."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"baseInstrument")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"BaseInstrument")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The ",(0,r.kt)("inlineCode",{parentName:"td"},"BaseInstrument")," element associated with the configuration.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A configuration document element.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"defaultIndex")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"1")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The IAU index to assign to the config if one cannot be parsed from the configuration document element. Defaults to ",(0,r.kt)("inlineCode",{parentName:"td"},"1"),".")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsConfig/IauDefsConfig.ts:124"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"altimeterindex"},"altimeterIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"altimeterIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the sim altimeter used by the IAU."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsConfig/IauDefsConfig.ts:102"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"defaultadcindex"},"defaultAdcIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"defaultAdcIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the default ADC used by the IAU."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsConfig/IauDefsConfig.ts:96"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"defaultahrsindex"},"defaultAhrsIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"defaultAhrsIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the default AHRS used by the IAU."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsConfig/IauDefsConfig.ts:99"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fmsposdefinition"},"fmsPosDefinition"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"fmsPosDefinition"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#fmspositiondefinition"},(0,r.kt)("inlineCode",{parentName:"a"},"FmsPositionDefinition")),">"),(0,r.kt)("p",null,"A definition describing the IAU's FMS geo-positioning system."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsConfig/IauDefsConfig.ts:115"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"gpsdefinition"},"gpsDefinition"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"gpsDefinition"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#gpsreceiverdefinition"},(0,r.kt)("inlineCode",{parentName:"a"},"GpsReceiverDefinition")),">"),(0,r.kt)("p",null,"A definition describing the IAU's GPS receiver."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsConfig/IauDefsConfig.ts:110"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"index"},"index"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"index"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the IAU."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsConfig/IauDefsConfig.ts:93"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"supportbaropreselect"},"supportBaroPreselect"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"supportBaroPreselect"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether the IAU supports altimeter baro preselect."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsConfig/IauDefsConfig.ts:105"))}u.isMDXComponent=!0}}]);