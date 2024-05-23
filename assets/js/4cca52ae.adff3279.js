"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[88235],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>m});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=r.createContext({}),s=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},d=function(e){var t=s(e.components);return r.createElement(c.Provider,{value:t},e.children)},u="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,c=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),u=s(n),f=i,m=u["".concat(c,".").concat(f)]||u[f]||p[f]||a;return n?r.createElement(m,l(l({ref:t},d),{},{components:n})):r.createElement(m,l({ref:t},d))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,l=new Array(a);l[0]=f;var o={};for(var c in t)hasOwnProperty.call(t,c)&&(o[c]=t[c]);o.originalType=e,o[u]="string"==typeof e?e:i,l[1]=o;for(var s=2;s<a;s++)l[s]=n[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},25764:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>p,frontMatter:()=>a,metadata:()=>o,toc:()=>s});var r=n(87462),i=(n(67294),n(3905));const a={id:"FieldLengthData",title:"Interface: FieldLengthData",sidebar_label:"FieldLengthData",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"wt21fmc/interfaces/FieldLengthData",id:"wt21fmc/interfaces/FieldLengthData",title:"Interface: FieldLengthData",description:"Interface for field length data display",source:"@site/docs/wt21fmc/interfaces/FieldLengthData.md",sourceDirName:"wt21fmc/interfaces",slug:"/wt21fmc/interfaces/FieldLengthData",permalink:"/msfs-avionics-mirror/docs/wt21fmc/interfaces/FieldLengthData",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FieldLengthData",title:"Interface: FieldLengthData",sidebar_label:"FieldLengthData",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"CoordinatesInput",permalink:"/msfs-avionics-mirror/docs/wt21fmc/interfaces/CoordinatesInput"},next:{title:"FmcBtnEvents",permalink:"/msfs-avionics-mirror/docs/wt21fmc/interfaces/FmcBtnEvents"}},c={},s=[{value:"Properties",id:"properties",level:2},{value:"fieldLength",id:"fieldlength",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"runwayLength",id:"runwaylength",level:3},{value:"Defined in",id:"defined-in-1",level:4}],d={toc:s},u="wrapper";function p(e){let{components:t,...n}=e;return(0,i.kt)(u,(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Interface for field length data display"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"fieldlength"},"fieldLength"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"fieldLength"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"Calculated takeoff length"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Framework/FmcFormats.ts:667"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"runwaylength"},"runwayLength"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"runwayLength"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"Total runway length"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Framework/FmcFormats.ts:672"))}p.isMDXComponent=!0}}]);