"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[49315],{3905:(e,n,a)=>{a.d(n,{Zo:()=>d,kt:()=>v});var t=a(67294);function i(e,n,a){return n in e?Object.defineProperty(e,n,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[n]=a,e}function l(e,n){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),a.push.apply(a,t)}return a}function r(e){for(var n=1;n<arguments.length;n++){var a=null!=arguments[n]?arguments[n]:{};n%2?l(Object(a),!0).forEach((function(n){i(e,n,a[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(a,n))}))}return e}function o(e,n){if(null==e)return{};var a,t,i=function(e,n){if(null==e)return{};var a,t,i={},l=Object.keys(e);for(t=0;t<l.length;t++)a=l[t],n.indexOf(a)>=0||(i[a]=e[a]);return i}(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(t=0;t<l.length;t++)a=l[t],n.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}var s=t.createContext({}),m=function(e){var n=t.useContext(s),a=n;return e&&(a="function"==typeof e?e(n):r(r({},n),e)),a},d=function(e){var n=m(e.components);return t.createElement(s.Provider,{value:n},e.children)},p="mdxType",c={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},f=t.forwardRef((function(e,n){var a=e.components,i=e.mdxType,l=e.originalType,s=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),p=m(a),f=i,v=p["".concat(s,".").concat(f)]||p[f]||c[f]||l;return a?t.createElement(v,r(r({ref:n},d),{},{components:a})):t.createElement(v,r({ref:n},d))}));function v(e,n){var a=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var l=a.length,r=new Array(l);r[0]=f;var o={};for(var s in n)hasOwnProperty.call(n,s)&&(o[s]=n[s]);o.originalType=e,o[p]="string"==typeof e?e:i,r[1]=o;for(var m=2;m<l;m++)r[m]=a[m];return t.createElement.apply(null,r)}return t.createElement.apply(null,a)}f.displayName="MDXCreateElement"},32764:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>s,contentTitle:()=>r,default:()=>c,frontMatter:()=>l,metadata:()=>o,toc:()=>m});var t=a(87462),i=(a(67294),a(3905));const l={id:"AbstractNavBase",title:"Class: AbstractNavBase",sidebar_label:"AbstractNavBase",sidebar_position:0,custom_edit_url:null},r=void 0,o={unversionedId:"g3000common/classes/AbstractNavBase",id:"g3000common/classes/AbstractNavBase",title:"Class: AbstractNavBase",description:"An abstract implementation of NavReferenceBase.",source:"@site/docs/g3000common/classes/AbstractNavBase.md",sourceDirName:"g3000common/classes",slug:"/g3000common/classes/AbstractNavBase",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/AbstractNavBase",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AbstractNavBase",title:"Class: AbstractNavBase",sidebar_label:"AbstractNavBase",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"WindDisplaySettingMode",permalink:"/msfs-avionics-mirror/docs/g3000common/enums/WindDisplaySettingMode"},next:{title:"AdfRadioSource",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/AdfRadioSource"}},s={},m=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Properties",id:"properties",level:2},{value:"activeFrequency",id:"activefrequency",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"bearing",id:"bearing",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"course",id:"course",level:3},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"distance",id:"distance",level:3},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"fields",id:"fields",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"hasDme",id:"hasdme",level:3},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"hasGlideSlope",id:"hasglideslope",level:3},{value:"Implementation of",id:"implementation-of-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"hasLocalizer",id:"haslocalizer",level:3},{value:"Implementation of",id:"implementation-of-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"hasNav",id:"hasnav",level:3},{value:"Implementation of",id:"implementation-of-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"ident",id:"ident",level:3},{value:"Implementation of",id:"implementation-of-8",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"isLocalizer",id:"islocalizer",level:3},{value:"Implementation of",id:"implementation-of-9",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"lateralDeviation",id:"lateraldeviation",level:3},{value:"Implementation of",id:"implementation-of-10",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"lateralDeviationScale",id:"lateraldeviationscale",level:3},{value:"Implementation of",id:"implementation-of-11",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"lateralDeviationScalingMode",id:"lateraldeviationscalingmode",level:3},{value:"Implementation of",id:"implementation-of-12",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"localizerCourse",id:"localizercourse",level:3},{value:"Implementation of",id:"implementation-of-13",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"location",id:"location",level:3},{value:"Implementation of",id:"implementation-of-14",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"signalStrength",id:"signalstrength",level:3},{value:"Implementation of",id:"implementation-of-15",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"toFrom",id:"tofrom",level:3},{value:"Implementation of",id:"implementation-of-16",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"verticalDeviation",id:"verticaldeviation",level:3},{value:"Implementation of",id:"implementation-of-17",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"verticalDeviationScale",id:"verticaldeviationscale",level:3},{value:"Implementation of",id:"implementation-of-18",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"Methods",id:"methods",level:2},{value:"clearAll",id:"clearall",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-20",level:4}],d={toc:m},p="wrapper";function c(e){let{components:n,...a}=e;return(0,i.kt)(p,(0,t.Z)({},d,a,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"An abstract implementation of NavReferenceBase."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"AbstractNavBase"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/AdfRadioSource"},(0,i.kt)("inlineCode",{parentName:"a"},"AdfRadioSource"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/GpsSource"},(0,i.kt)("inlineCode",{parentName:"a"},"GpsSource"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/NavRadioNavSource"},(0,i.kt)("inlineCode",{parentName:"a"},"NavRadioNavSource"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/BasicNavIndicator"},(0,i.kt)("inlineCode",{parentName:"a"},"BasicNavIndicator"))))),(0,i.kt)("h2",{id:"implements"},"Implements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},(0,i.kt)("inlineCode",{parentName:"a"},"NavBase")))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new AbstractNavBase"),"()"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"activefrequency"},"activeFrequency"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"activeFrequency"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The radio frequency of the reference. Only available if the reference is a navaid."),(0,i.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#activefrequency"},"activeFrequency")),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:138"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"bearing"},"bearing"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"bearing"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The magnetic bearing, in degrees, from the airplane to the reference position."),(0,i.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#bearing"},"bearing")),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:86"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"course"},"course"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"course"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The magnetic bearing, in degrees, of the reference course at the reference position."),(0,i.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#course"},"course")),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:92"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"distance"},"distance"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"distance"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The distance, in nautical miles, from the airplane to the reference position."),(0,i.kt)("h4",{id:"implementation-of-3"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#distance"},"distance")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:89"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"fields"},"fields"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"fields"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Map"),"<keyof ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},(0,i.kt)("inlineCode",{parentName:"a"},"NavBase")),", ",(0,i.kt)("inlineCode",{parentName:"p"},"MutableSubscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"any"),">",">"),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:158"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"hasdme"},"hasDme"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"hasDme"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether the reference has a DME component."),(0,i.kt)("h4",{id:"implementation-of-4"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#hasdme"},"hasDme")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:129"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"hasglideslope"},"hasGlideSlope"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"hasGlideSlope"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether the reference has a glideslope component."),(0,i.kt)("h4",{id:"implementation-of-5"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#hasglideslope"},"hasGlideSlope")),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:135"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"haslocalizer"},"hasLocalizer"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"hasLocalizer"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether the reference has a localizer component."),(0,i.kt)("h4",{id:"implementation-of-6"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#haslocalizer"},"hasLocalizer")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:132"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"hasnav"},"hasNav"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"hasNav"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether the reference has a VOR component."),(0,i.kt)("h4",{id:"implementation-of-7"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#hasnav"},"hasNav")),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:126"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ident"},"ident"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"ident"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("p",null,"The ident of the reference."),(0,i.kt)("h4",{id:"implementation-of-8"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#ident"},"ident")),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:80"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"islocalizer"},"isLocalizer"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"isLocalizer"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether the reference is a localizer."),(0,i.kt)("h4",{id:"implementation-of-9"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#islocalizer"},"isLocalizer")),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:123"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lateraldeviation"},"lateralDeviation"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"lateralDeviation"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"Lateral deviation from the reference course scaled such that a value of +/-1 is equal to full-scale CDI deflection\n(i.e. the ",(0,i.kt)("inlineCode",{parentName:"p"},"lateralDeviationScaling")," value). Positive values indicate deflection of the CDI to the right (i.e. the\nairplane is situated to the left of the reference)."),(0,i.kt)("h4",{id:"implementation-of-10"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#lateraldeviation"},"lateralDeviation")),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:144"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lateraldeviationscale"},"lateralDeviationScale"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"lateralDeviationScale"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The magnitude of full-scale CDI deflection, in nautical miles."),(0,i.kt)("h4",{id:"implementation-of-11"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#lateraldeviationscale"},"lateralDeviationScale")),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:147"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lateraldeviationscalingmode"},"lateralDeviationScalingMode"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"lateralDeviationScalingMode"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The lateral deviation scaling mode."),(0,i.kt)("h4",{id:"implementation-of-12"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#lateraldeviationscalingmode"},"lateralDeviationScalingMode")),(0,i.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:150"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"localizercourse"},"localizerCourse"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"localizerCourse"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The fixed magnetic course, in degrees, of the reference localizer. Only available if the reference is a localizer."),(0,i.kt)("h4",{id:"implementation-of-13"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#localizercourse"},"localizerCourse")),(0,i.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:95"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"location"},"location"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"location"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"ComputedSubject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"GeoPointInterface"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"GeoPointInterface"),">"),(0,i.kt)("p",null,"The location of the reference position."),(0,i.kt)("h4",{id:"implementation-of-14"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#location"},"location")),(0,i.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:106"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"signalstrength"},"signalStrength"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"signalStrength"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"Signal strength received from the reference. A value of zero indicates no signal."),(0,i.kt)("h4",{id:"implementation-of-15"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#signalstrength"},"signalStrength")),(0,i.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:83"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"tofrom"},"toFrom"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"toFrom"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"VorToFrom"),">"),(0,i.kt)("p",null,"Whether the airplane is heading TO or FROM the reference position as judged from the reference course."),(0,i.kt)("h4",{id:"implementation-of-16"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#tofrom"},"toFrom")),(0,i.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:141"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"verticaldeviation"},"verticalDeviation"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"verticalDeviation"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"Vertical deviation from the reference vertical path profile scaled such that a value of +/-1 is equal to full-\nscale VDI deflection (i.e. the ",(0,i.kt)("inlineCode",{parentName:"p"},"verticalDeviationScaling")," value). Positive values indicate upward deflection of\nthe VDI (i.e. the airplane is situated below the reference)."),(0,i.kt)("h4",{id:"implementation-of-17"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#verticaldeviation"},"verticalDeviation")),(0,i.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:153"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"verticaldeviationscale"},"verticalDeviationScale"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"verticalDeviationScale"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"The magnitude of full-scale VDI deflection, in feet."),(0,i.kt)("h4",{id:"implementation-of-18"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase"},"NavBase"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavBase#verticaldeviationscale"},"verticalDeviationScale")),(0,i.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:156"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"clearall"},"clearAll"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("strong",{parentName:"p"},"clearAll"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Sets all fields to ",(0,i.kt)("inlineCode",{parentName:"p"},"null"),"."),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/navreference/NavReferenceBase.ts:183"))}c.isMDXComponent=!0}}]);