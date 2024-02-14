"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[82672],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>u});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),s=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},c=function(e){var t=s(e.components);return r.createElement(p.Provider,{value:t},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),d=s(n),f=a,u=d["".concat(p,".").concat(f)]||d[f]||m[f]||i;return n?r.createElement(u,l(l({ref:t},c),{},{components:n})):r.createElement(u,l({ref:t},c))}));function u(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=f;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[d]="string"==typeof e?e:a,l[1]=o;for(var s=2;s<i;s++)l[s]=n[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},90097:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>m,frontMatter:()=>i,metadata:()=>o,toc:()=>s});var r=n(87462),a=(n(67294),n(3905));const i={id:"FmcPagingEvents",title:"Interface: FmcPagingEvents<E>",sidebar_label:"FmcPagingEvents",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/interfaces/FmcPagingEvents",id:"framework/interfaces/FmcPagingEvents",title:"Interface: FmcPagingEvents<E>",description:"Paging events for an FMC screen",source:"@site/docs/framework/interfaces/FmcPagingEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/FmcPagingEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FmcPagingEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FmcPagingEvents",title:"Interface: FmcPagingEvents<E>",sidebar_label:"FmcPagingEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FmcPageExtension",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FmcPageExtension"},next:{title:"FmcRenderer",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FmcRenderer"}},p={},s=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"pageDown",id:"pagedown",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"pageLeft",id:"pageleft",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"pageRight",id:"pageright",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"pageUp",id:"pageup",level:3},{value:"Defined in",id:"defined-in-3",level:4}],c={toc:s},d="wrapper";function m(e){let{components:t,...n}=e;return(0,a.kt)(d,(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Paging events for an FMC screen"),(0,a.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"E"))))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"pagedown"},"pageDown"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"pageDown"),": keyof ",(0,a.kt)("inlineCode",{parentName:"p"},"E")," & ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Page down / slew down"),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/fmc/FmcInteractionEvents.ts:32"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"pageleft"},"pageLeft"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"pageLeft"),": keyof ",(0,a.kt)("inlineCode",{parentName:"p"},"E")," & ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Page left / previous page"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/fmc/FmcInteractionEvents.ts:23"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"pageright"},"pageRight"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"pageRight"),": keyof ",(0,a.kt)("inlineCode",{parentName:"p"},"E")," & ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Page right / next page"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/fmc/FmcInteractionEvents.ts:26"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"pageup"},"pageUp"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"pageUp"),": keyof ",(0,a.kt)("inlineCode",{parentName:"p"},"E")," & ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Page up / slew up"),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/fmc/FmcInteractionEvents.ts:29"))}m.isMDXComponent=!0}}]);