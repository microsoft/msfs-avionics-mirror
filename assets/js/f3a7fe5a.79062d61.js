"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[23420],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=r.createContext({}),u=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=u(e.components);return r.createElement(s.Provider,{value:t},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),m=u(n),c=i,f=m["".concat(s,".").concat(c)]||m[c]||d[c]||a;return n?r.createElement(f,o(o({ref:t},p),{},{components:n})):r.createElement(f,o({ref:t},p))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=c;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[m]="string"==typeof e?e:i,o[1]=l;for(var u=2;u<a;u++)o[u]=n[u];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},5983:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>d,frontMatter:()=>a,metadata:()=>l,toc:()=>u});var r=n(87462),i=(n(67294),n(3905));const a={id:"NumberAndUnitFormatOptions",title:"Interface: NumberAndUnitFormatOptions",sidebar_label:"NumberAndUnitFormatOptions",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"wt21fmc/interfaces/NumberAndUnitFormatOptions",id:"wt21fmc/interfaces/NumberAndUnitFormatOptions",title:"Interface: NumberAndUnitFormatOptions",description:"The options for number and unit inputs.",source:"@site/docs/wt21fmc/interfaces/NumberAndUnitFormatOptions.md",sourceDirName:"wt21fmc/interfaces",slug:"/wt21fmc/interfaces/NumberAndUnitFormatOptions",permalink:"/msfs-avionics-mirror/docs/wt21fmc/interfaces/NumberAndUnitFormatOptions",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NumberAndUnitFormatOptions",title:"Interface: NumberAndUnitFormatOptions",sidebar_label:"NumberAndUnitFormatOptions",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"LatLongTextFormatOptions",permalink:"/msfs-avionics-mirror/docs/wt21fmc/interfaces/LatLongTextFormatOptions"},next:{title:"PlaceBearingDistanceInput",permalink:"/msfs-avionics-mirror/docs/wt21fmc/interfaces/PlaceBearingDistanceInput"}},s={},u=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"maxValue",id:"maxvalue",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"minValue",id:"minvalue",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"padStart",id:"padstart",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"precision",id:"precision",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"spaceBetween",id:"spacebetween",level:3},{value:"Defined in",id:"defined-in-4",level:4}],p={toc:u},m="wrapper";function d(e){let{components:t,...n}=e;return(0,i.kt)(m,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"The options for number and unit inputs."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"NumberAndUnitFormatOptions"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21fmc/interfaces/ConvertableNumberAndUnitFormatOptions"},(0,i.kt)("inlineCode",{parentName:"a"},"ConvertableNumberAndUnitFormatOptions"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"maxvalue"},"maxValue"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"maxValue"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"Maximum value (default: max int)"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Framework/FmcFormats.ts:277"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"minvalue"},"minValue"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"minValue"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"Minimum value (default: 0)"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Framework/FmcFormats.ts:279"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"padstart"},"padStart"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"padStart"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"Padding of the output string (default: 0)"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Framework/FmcFormats.ts:275"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"precision"},"precision"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"precision"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"Number precision (default: 0)"),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Framework/FmcFormats.ts:273"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"spacebetween"},"spaceBetween"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"spaceBetween"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Indicating if there should be a space between number and unit"),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Framework/FmcFormats.ts:281"))}d.isMDXComponent=!0}}]);