"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[50886],{3905:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>d});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var m=r.createContext({}),c=function(e){var t=r.useContext(m),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},l=function(e){var t=c(e.components);return r.createElement(m.Provider,{value:t},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,m=e.parentName,l=i(e,["components","mdxType","originalType","parentName"]),p=c(n),f=o,d=p["".concat(m,".").concat(f)]||p[f]||u[f]||a;return n?r.createElement(d,s(s({ref:t},l),{},{components:n})):r.createElement(d,s({ref:t},l))}));function d(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,s=new Array(a);s[0]=f;var i={};for(var m in t)hasOwnProperty.call(t,m)&&(i[m]=t[m]);i.originalType=e,i[p]="string"==typeof e?e:o,s[1]=i;for(var c=2;c<a;c++)s[c]=n[c];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},32197:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>m,contentTitle:()=>s,default:()=>u,frontMatter:()=>a,metadata:()=>i,toc:()=>c});var r=n(87462),o=(n(67294),n(3905));const a={id:"MagnetometerSystemEvents",title:"Interface: MagnetometerSystemEvents",sidebar_label:"MagnetometerSystemEvents",sidebar_position:0,custom_edit_url:null},s=void 0,i={unversionedId:"g1000common/interfaces/MagnetometerSystemEvents",id:"g1000common/interfaces/MagnetometerSystemEvents",title:"Interface: MagnetometerSystemEvents",description:"Events fired by the magnetometer system.",source:"@site/docs/g1000common/interfaces/MagnetometerSystemEvents.md",sourceDirName:"g1000common/interfaces",slug:"/g1000common/interfaces/MagnetometerSystemEvents",permalink:"/msfs-avionics-mirror/docs/g1000common/interfaces/MagnetometerSystemEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MagnetometerSystemEvents",title:"Interface: MagnetometerSystemEvents",sidebar_label:"MagnetometerSystemEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MFDWptDupDialogProps",permalink:"/msfs-avionics-mirror/docs/g1000common/interfaces/MFDWptDupDialogProps"},next:{title:"MapDataIntegrityControllerModules",permalink:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapDataIntegrityControllerModules"}},m={},c=[{value:"Properties",id:"properties",level:2},{value:"magnetometer_state",id:"magnetometer_state",level:3},{value:"Defined in",id:"defined-in",level:4}],l={toc:c},p="wrapper";function u(e){let{components:t,...n}=e;return(0,o.kt)(p,(0,r.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Events fired by the magnetometer system."),(0,o.kt)("h2",{id:"properties"},"Properties"),(0,o.kt)("h3",{id:"magnetometer_state"},"magnetometer","_","state"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"magnetometer","_","state"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/AvionicsSystemStateEvent"},(0,o.kt)("inlineCode",{parentName:"a"},"AvionicsSystemStateEvent"))),(0,o.kt)("p",null,"An event fired when the AHRS system state changes."),(0,o.kt)("h4",{id:"defined-in"},"Defined in"),(0,o.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/Systems/MagnetometerSystem.ts:28"))}u.isMDXComponent=!0}}]);