"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[56811],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>f});var o=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,o,n=function(e,t){if(null==e)return{};var r,o,n={},a=Object.keys(e);for(o=0;o<a.length;o++)r=a[o],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)r=a[o],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var l=o.createContext({}),p=function(e){var t=o.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},c=function(e){var t=p(e.components);return o.createElement(l.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},m=o.forwardRef((function(e,t){var r=e.components,n=e.mdxType,a=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),d=p(r),m=n,f=d["".concat(l,".").concat(m)]||d[m]||u[m]||a;return r?o.createElement(f,i(i({ref:t},c),{},{components:r})):o.createElement(f,i({ref:t},c))}));function f(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var a=r.length,i=new Array(a);i[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[d]="string"==typeof e?e:n,i[1]=s;for(var p=2;p<a;p++)i[p]=r[p];return o.createElement.apply(null,i)}return o.createElement.apply(null,r)}m.displayName="MDXCreateElement"},39112:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>u,frontMatter:()=>a,metadata:()=>s,toc:()=>p});var o=r(87462),n=(r(67294),r(3905));const a={id:"MapRotationModule",title:"Class: MapRotationModule",sidebar_label:"MapRotationModule",sidebar_position:0,custom_edit_url:null},i=void 0,s={unversionedId:"framework/classes/MapRotationModule",id:"framework/classes/MapRotationModule",title:"Class: MapRotationModule",description:"A module describing the rotation behavior of the map.",source:"@site/docs/framework/classes/MapRotationModule.md",sourceDirName:"framework/classes",slug:"/framework/classes/MapRotationModule",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapRotationModule",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapRotationModule",title:"Class: MapRotationModule",sidebar_label:"MapRotationModule",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapRotationController",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapRotationController"},next:{title:"MapSharedCanvasLayer",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapSharedCanvasLayer"}},l={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Properties",id:"properties",level:2},{value:"dtk",id:"dtk",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"rotationType",id:"rotationtype",level:3},{value:"Defined in",id:"defined-in-1",level:4}],c={toc:p},d="wrapper";function u(e){let{components:t,...r}=e;return(0,n.kt)(d,(0,o.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A module describing the rotation behavior of the map."),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new MapRotationModule"),"()"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"dtk"},"dtk"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"dtk"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/Subject"},(0,n.kt)("inlineCode",{parentName:"a"},"Subject")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,n.kt)("p",null,"The desired track, in degrees true."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/modules/MapRotationModule.ts:31"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"rotationtype"},"rotationType"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"rotationType"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/Subject"},(0,n.kt)("inlineCode",{parentName:"a"},"Subject")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/MapRotation"},(0,n.kt)("inlineCode",{parentName:"a"},"MapRotation")),">"),(0,n.kt)("p",null,"The type of map rotation to use."),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/modules/MapRotationModule.ts:28"))}u.isMDXComponent=!0}}]);