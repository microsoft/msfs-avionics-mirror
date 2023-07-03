"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[48558],{3905:(e,n,t)=>{t.d(n,{Zo:()=>m,kt:()=>u});var i=t(67294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,i,a=function(e,n){if(null==e)return{};var t,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var s=i.createContext({}),d=function(e){var n=i.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},m=function(e){var n=d(e.components);return i.createElement(s.Provider,{value:n},e.children)},c="mdxType",p={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},v=i.forwardRef((function(e,n){var t=e.components,a=e.mdxType,r=e.originalType,s=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),c=d(t),v=a,u=c["".concat(s,".").concat(v)]||c[v]||p[v]||r;return t?i.createElement(u,l(l({ref:n},m),{},{components:t})):i.createElement(u,l({ref:n},m))}));function u(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var r=t.length,l=new Array(r);l[0]=v;var o={};for(var s in n)hasOwnProperty.call(n,s)&&(o[s]=n[s]);o.originalType=e,o[c]="string"==typeof e?e:a,l[1]=o;for(var d=2;d<r;d++)l[d]=t[d];return i.createElement.apply(null,l)}return i.createElement.apply(null,t)}v.displayName="MDXCreateElement"},68800:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>l,default:()=>p,frontMatter:()=>r,metadata:()=>o,toc:()=>d});var i=t(87462),a=(t(67294),t(3905));const r={id:"NavIndicator",title:"Interface: NavIndicator<SourceName>",sidebar_label:"NavIndicator",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"g3000common/interfaces/NavIndicator",id:"g3000common/interfaces/NavIndicator",title:"Interface: NavIndicator<SourceName>",description:"A nav indicator which presents data derived from a nav source. An indicator may only have up to one source at a",source:"@site/docs/g3000common/interfaces/NavIndicator.md",sourceDirName:"g3000common/interfaces",slug:"/g3000common/interfaces/NavIndicator",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavIndicator",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NavIndicator",title:"Interface: NavIndicator<SourceName>",sidebar_label:"NavIndicator",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"NavBase",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},next:{title:"NavIndicatorControlFields",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavIndicatorControlFields"}},s={},d=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"activeFrequency",id:"activefrequency",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"bearing",id:"bearing",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"course",id:"course",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"distance",id:"distance",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"hasDme",id:"hasdme",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"hasGlideSlope",id:"hasglideslope",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"hasLocalizer",id:"haslocalizer",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"hasNav",id:"hasnav",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"ident",id:"ident",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"isLocalizer",id:"islocalizer",level:3},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"lateralDeviation",id:"lateraldeviation",level:3},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"lateralDeviationScale",id:"lateraldeviationscale",level:3},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"lateralDeviationScalingMode",id:"lateraldeviationscalingmode",level:3},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"localizerCourse",id:"localizercourse",level:3},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"location",id:"location",level:3},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"signalStrength",id:"signalstrength",level:3},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"source",id:"source",level:3},{value:"Defined in",id:"defined-in-16",level:4},{value:"toFrom",id:"tofrom",level:3},{value:"Inherited from",id:"inherited-from-16",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"verticalDeviation",id:"verticaldeviation",level:3},{value:"Inherited from",id:"inherited-from-17",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"verticalDeviationScale",id:"verticaldeviationscale",level:3},{value:"Inherited from",id:"inherited-from-18",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"Methods",id:"methods",level:2},{value:"setSource",id:"setsource",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-20",level:4}],m={toc:d},c="wrapper";function p(e){let{components:n,...t}=e;return(0,a.kt)(c,(0,i.Z)({},m,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A nav indicator which presents data derived from a nav source. An indicator may only have up to one source at a\ntime, but its source can be changed."),(0,a.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"SourceName")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"string"))))),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},(0,a.kt)("inlineCode",{parentName:"a"},"NavBase"))),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"NavIndicator"))))),(0,a.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000common/classes/BasicNavIndicator"},(0,a.kt)("inlineCode",{parentName:"a"},"BasicNavIndicator")))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"activefrequency"},"activeFrequency"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"activeFrequency"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The radio frequency of the reference. Only available if the reference is a navaid."),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#activefrequency"},"activeFrequency")),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:46"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"bearing"},"bearing"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"bearing"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The magnetic bearing, in degrees, from the airplane to the reference position."),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#bearing"},"bearing")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:16"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"course"},"course"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"course"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The magnetic bearing, in degrees, of the reference course at the reference position."),(0,a.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#course"},"course")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:22"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"distance"},"distance"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"distance"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The distance, in nautical miles, from the airplane to the reference position."),(0,a.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#distance"},"distance")),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:19"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"hasdme"},"hasDme"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"hasDme"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether the reference has a DME component."),(0,a.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#hasdme"},"hasDme")),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:37"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"hasglideslope"},"hasGlideSlope"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"hasGlideSlope"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether the reference has a glideslope component."),(0,a.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#hasglideslope"},"hasGlideSlope")),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:43"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"haslocalizer"},"hasLocalizer"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"hasLocalizer"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether the reference has a localizer component."),(0,a.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#haslocalizer"},"hasLocalizer")),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:40"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"hasnav"},"hasNav"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"hasNav"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether the reference has a VOR component."),(0,a.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#hasnav"},"hasNav")),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:34"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ident"},"ident"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"ident"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,a.kt)("p",null,"The ident of the reference."),(0,a.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#ident"},"ident")),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:10"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"islocalizer"},"isLocalizer"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"isLocalizer"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether the reference is a localizer."),(0,a.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#islocalizer"},"isLocalizer")),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:31"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"lateraldeviation"},"lateralDeviation"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"lateralDeviation"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"Lateral deviation from the reference course scaled such that a value of +/-1 is equal to full-scale CDI deflection\n(i.e. the ",(0,a.kt)("inlineCode",{parentName:"p"},"lateralDeviationScaling")," value). Positive values indicate deflection of the CDI to the right (i.e. the\nairplane is situated to the left of the reference)."),(0,a.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#lateraldeviation"},"lateralDeviation")),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:56"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"lateraldeviationscale"},"lateralDeviationScale"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"lateralDeviationScale"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The magnitude of full-scale CDI deflection, in nautical miles."),(0,a.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#lateraldeviationscale"},"lateralDeviationScale")),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:59"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"lateraldeviationscalingmode"},"lateralDeviationScalingMode"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"lateralDeviationScalingMode"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The lateral deviation scaling mode."),(0,a.kt)("h4",{id:"inherited-from-12"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#lateraldeviationscalingmode"},"lateralDeviationScalingMode")),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:62"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"localizercourse"},"localizerCourse"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"localizerCourse"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The fixed magnetic course, in degrees, of the reference localizer. Only available if the reference is a localizer."),(0,a.kt)("h4",{id:"inherited-from-13"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#localizercourse"},"localizerCourse")),(0,a.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:25"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"location"},"location"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"location"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"GeoPointInterface"),">"),(0,a.kt)("p",null,"The location of the reference position."),(0,a.kt)("h4",{id:"inherited-from-14"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#location"},"location")),(0,a.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:28"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"signalstrength"},"signalStrength"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"signalStrength"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"Signal strength received from the reference. A value of zero indicates no signal."),(0,a.kt)("h4",{id:"inherited-from-15"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#signalstrength"},"signalStrength")),(0,a.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:13"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"source"},"source"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"source"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavSource"},(0,a.kt)("inlineCode",{parentName:"a"},"NavSource")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"SourceName"),">",">"),(0,a.kt)("p",null,"This indicator's source."),(0,a.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavIndicators/NavIndicators.ts:19"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"tofrom"},"toFrom"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"toFrom"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"VorToFrom"),">"),(0,a.kt)("p",null,"Whether the airplane is heading TO or FROM the reference position as judged from the reference course."),(0,a.kt)("h4",{id:"inherited-from-16"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#tofrom"},"toFrom")),(0,a.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:49"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"verticaldeviation"},"verticalDeviation"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"verticalDeviation"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"Vertical deviation from the reference vertical path profile scaled such that a value of +/-1 is equal to full-\nscale VDI deflection (i.e. the ",(0,a.kt)("inlineCode",{parentName:"p"},"verticalDeviationScaling")," value). Positive values indicate upward deflection of\nthe VDI (i.e. the airplane is situated below the reference)."),(0,a.kt)("h4",{id:"inherited-from-17"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#verticaldeviation"},"verticalDeviation")),(0,a.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:69"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"verticaldeviationscale"},"verticalDeviationScale"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"verticalDeviationScale"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,a.kt)("p",null,"The magnitude of full-scale VDI deflection, in feet."),(0,a.kt)("h4",{id:"inherited-from-18"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#verticaldeviationscale"},"verticalDeviationScale")),(0,a.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavBase.ts:72"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"setsource"},"setSource"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"setSource"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"sourceName"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Sets this indicator's source. Once the source is set, this indicator's data will be derived from the new source.\nIf the new source is ",(0,a.kt)("inlineCode",{parentName:"p"},"null"),", all of this indicator's data will be set to ",(0,a.kt)("inlineCode",{parentName:"p"},"null"),"."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"sourceName")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},"SourceName")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The name of a nav source.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Navigation/NavIndicators/NavIndicators.ts:26"))}p.isMDXComponent=!0}}]);