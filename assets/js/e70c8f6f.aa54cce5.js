"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[44005],{3905:(e,r,t)=>{t.d(r,{Zo:()=>c,kt:()=>m});var o=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function a(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?a(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function l(e,r){if(null==e)return{};var t,o,n=function(e,r){if(null==e)return{};var t,o,n={},a=Object.keys(e);for(o=0;o<a.length;o++)t=a[o],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)t=a[o],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var s=o.createContext({}),p=function(e){var r=o.useContext(s),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},c=function(e){var r=p(e.components);return o.createElement(s.Provider,{value:r},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var r=e.children;return o.createElement(o.Fragment,{},r)}},f=o.forwardRef((function(e,r){var t=e.components,n=e.mdxType,a=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),d=p(t),f=n,m=d["".concat(s,".").concat(f)]||d[f]||u[f]||a;return t?o.createElement(m,i(i({ref:r},c),{},{components:t})):o.createElement(m,i({ref:r},c))}));function m(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var a=t.length,i=new Array(a);i[0]=f;var l={};for(var s in r)hasOwnProperty.call(r,s)&&(l[s]=r[s]);l.originalType=e,l[d]="string"==typeof e?e:n,i[1]=l;for(var p=2;p<a;p++)i[p]=t[p];return o.createElement.apply(null,i)}return o.createElement.apply(null,t)}f.displayName="MDXCreateElement"},47990:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>s,contentTitle:()=>i,default:()=>u,frontMatter:()=>a,metadata:()=>l,toc:()=>p});var o=t(87462),n=(t(67294),t(3905));const a={id:"MapRotationControllerModules",title:"Interface: MapRotationControllerModules",sidebar_label:"MapRotationControllerModules",sidebar_position:0,custom_edit_url:null},i=void 0,l={unversionedId:"framework/interfaces/MapRotationControllerModules",id:"framework/interfaces/MapRotationControllerModules",title:"Interface: MapRotationControllerModules",description:"Modules required for MapRotationController.",source:"@site/docs/framework/interfaces/MapRotationControllerModules.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/MapRotationControllerModules",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MapRotationControllerModules",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapRotationControllerModules",title:"Interface: MapRotationControllerModules",sidebar_label:"MapRotationControllerModules",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapRotationControllerContext",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MapRotationControllerContext"},next:{title:"MapSharedCanvasInstance",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MapSharedCanvasInstance"}},s={},p=[{value:"Properties",id:"properties",level:2},{value:"ownAirplaneProps",id:"ownairplaneprops",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"rotation",id:"rotation",level:3},{value:"Defined in",id:"defined-in-1",level:4}],c={toc:p},d="wrapper";function u(e){let{components:r,...t}=e;return(0,n.kt)(d,(0,o.Z)({},c,t,{components:r,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Modules required for MapRotationController."),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"ownairplaneprops"},"ownAirplaneProps"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,n.kt)("strong",{parentName:"p"},"ownAirplaneProps"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapOwnAirplanePropsModule"},(0,n.kt)("inlineCode",{parentName:"a"},"MapOwnAirplanePropsModule"))),(0,n.kt)("p",null,"Own airplane properties module."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/controllers/MapRotationController.ts:19"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"rotation"},"rotation"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"rotation"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapRotationModule"},(0,n.kt)("inlineCode",{parentName:"a"},"MapRotationModule"))),(0,n.kt)("p",null,"Rotation module."),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/controllers/MapRotationController.ts:16"))}u.isMDXComponent=!0}}]);