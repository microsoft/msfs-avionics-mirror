"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[66334],{3905:(e,r,n)=>{n.d(r,{Zo:()=>p,kt:()=>m});var t=n(67294);function i(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function a(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function o(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?a(Object(n),!0).forEach((function(r){i(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function d(e,r){if(null==e)return{};var n,t,i=function(e,r){if(null==e)return{};var n,t,i={},a=Object.keys(e);for(t=0;t<a.length;t++)n=a[t],r.indexOf(n)>=0||(i[n]=e[n]);return i}(e,r);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)n=a[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=t.createContext({}),l=function(e){var r=t.useContext(s),n=r;return e&&(n="function"==typeof e?e(r):o(o({},r),e)),n},p=function(e){var r=l(e.components);return t.createElement(s.Provider,{value:r},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},f=t.forwardRef((function(e,r){var n=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),u=l(n),f=i,m=u["".concat(s,".").concat(f)]||u[f]||c[f]||a;return n?t.createElement(m,o(o({ref:r},p),{},{components:n})):t.createElement(m,o({ref:r},p))}));function m(e,r){var n=arguments,i=r&&r.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=f;var d={};for(var s in r)hasOwnProperty.call(r,s)&&(d[s]=r[s]);d.originalType=e,d[u]="string"==typeof e?e:i,o[1]=d;for(var l=2;l<a;l++)o[l]=n[l];return t.createElement.apply(null,o)}return t.createElement.apply(null,n)}f.displayName="MDXCreateElement"},9162:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>s,contentTitle:()=>o,default:()=>c,frontMatter:()=>a,metadata:()=>d,toc:()=>l});var t=n(87462),i=(n(67294),n(3905));const a={id:"AdsbOperatingMode",title:"Enumeration: AdsbOperatingMode",sidebar_label:"AdsbOperatingMode",sidebar_position:0,custom_edit_url:null},o=void 0,d={unversionedId:"framework/enums/AdsbOperatingMode",id:"framework/enums/AdsbOperatingMode",title:"Enumeration: AdsbOperatingMode",description:"ADS-B operating modes.",source:"@site/docs/framework/enums/AdsbOperatingMode.md",sourceDirName:"framework/enums",slug:"/framework/enums/AdsbOperatingMode",permalink:"/msfs-avionics-mirror/docs/framework/enums/AdsbOperatingMode",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AdsbOperatingMode",title:"Enumeration: AdsbOperatingMode",sidebar_label:"AdsbOperatingMode",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AdditionalApproachType",permalink:"/msfs-avionics-mirror/docs/framework/enums/AdditionalApproachType"},next:{title:"AirportClass",permalink:"/msfs-avionics-mirror/docs/framework/enums/AirportClass"}},s={},l=[{value:"Enumeration Members",id:"enumeration-members",level:2},{value:"Airborne",id:"airborne",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Standby",id:"standby",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Surface",id:"surface",level:3},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:l},u="wrapper";function c(e){let{components:r,...n}=e;return(0,i.kt)(u,(0,t.Z)({},p,n,{components:r,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"ADS-B operating modes."),(0,i.kt)("h2",{id:"enumeration-members"},"Enumeration Members"),(0,i.kt)("h3",{id:"airborne"},"Airborne"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"Airborne")," = ",(0,i.kt)("inlineCode",{parentName:"p"},'"Airborne"')),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/traffic/Adsb.ts:11"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"standby"},"Standby"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"Standby")," = ",(0,i.kt)("inlineCode",{parentName:"p"},'"Standby"')),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/traffic/Adsb.ts:9"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"surface"},"Surface"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"Surface")," = ",(0,i.kt)("inlineCode",{parentName:"p"},'"Surface"')),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/traffic/Adsb.ts:10"))}c.isMDXComponent=!0}}]);