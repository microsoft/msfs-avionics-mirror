"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[50879],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},o=Object.keys(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var c=i.createContext({}),l=function(e){var t=i.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},p=function(e){var t=l(e.components);return i.createElement(c.Provider,{value:t},e.children)},u="mdxType",v={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},d=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,c=e.parentName,p=a(e,["components","mdxType","originalType","parentName"]),u=l(n),d=r,m=u["".concat(c,".").concat(d)]||u[d]||v[d]||o;return n?i.createElement(m,s(s({ref:t},p),{},{components:n})):i.createElement(m,s({ref:t},p))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,s=new Array(o);s[0]=d;var a={};for(var c in t)hasOwnProperty.call(t,c)&&(a[c]=t[c]);a.originalType=e,a[u]="string"==typeof e?e:r,s[1]=a;for(var l=2;l<o;l++)s[l]=n[l];return i.createElement.apply(null,s)}return i.createElement.apply(null,n)}d.displayName="MDXCreateElement"},26532:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>s,default:()=>v,frontMatter:()=>o,metadata:()=>a,toc:()=>l});var i=n(87462),r=(n(67294),n(3905));const o={id:"AvionicsStatusEvents",title:"Interface: AvionicsStatusEvents",sidebar_label:"AvionicsStatusEvents",sidebar_position:0,custom_edit_url:null},s=void 0,a={unversionedId:"g3000common/interfaces/AvionicsStatusEvents",id:"g3000common/interfaces/AvionicsStatusEvents",title:"Interface: AvionicsStatusEvents",description:"Events related to the status of G3000 avionics units (GDUs or GTCs).",source:"@site/docs/g3000common/interfaces/AvionicsStatusEvents.md",sourceDirName:"g3000common/interfaces",slug:"/g3000common/interfaces/AvionicsStatusEvents",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/AvionicsStatusEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AvionicsStatusEvents",title:"Interface: AvionicsStatusEvents",sidebar_label:"AvionicsStatusEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AltitudeConstraintDisplayProps",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/AltitudeConstraintDisplayProps"},next:{title:"CASControlEvents",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/CASControlEvents"}},c={},l=[{value:"Indexable",id:"indexable",level:2},{value:"Properties",id:"properties",level:2},{value:"avionics_global_power",id:"avionics_global_power",level:3},{value:"Defined in",id:"defined-in",level:4}],p={toc:l},u="wrapper";function v(e){let{components:t,...n}=e;return(0,r.kt)(u,(0,i.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Events related to the status of G3000 avionics units (GDUs or GTCs)."),(0,r.kt)("h2",{id:"indexable"},"Indexable"),(0,r.kt)("p",null,"\u25aa ","[avionics_status: ","`","avionics","_","status","_","$","{","string}","`]",": ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#avionicsstatuschangeevent"},(0,r.kt)("inlineCode",{parentName:"a"},"AvionicsStatusChangeEvent")),">"),(0,r.kt)("p",null,"The status of an avionics unit has changed. The suffix of the topic is the UID of the avionics unit, in the form\n",(0,r.kt)("inlineCode",{parentName:"p"},"'[type]_[index]'"),", where ",(0,r.kt)("inlineCode",{parentName:"p"},"type")," is the type of the unit (PFD, MFD, or GTC), and ",(0,r.kt)("inlineCode",{parentName:"p"},"index")," is the index of the unit\namong all units of its type."),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"avionics_global_power"},"avionics","_","global","_","power"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"avionics","_","global","_","power"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#avionicsstatusglobalpowerevent"},(0,r.kt)("inlineCode",{parentName:"a"},"AvionicsStatusGlobalPowerEvent")),">"),(0,r.kt)("p",null,"The avionics global power state has changed."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsStatus/AvionicsStatusEvents.ts:37"))}v.isMDXComponent=!0}}]);