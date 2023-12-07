"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[49288],{3905:(e,n,t)=>{t.d(n,{Zo:()=>s,kt:()=>k});var i=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,i,r=function(e,n){if(null==e)return{};var t,i,r={},o=Object.keys(e);for(i=0;i<o.length;i++)t=o[i],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)t=o[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var d=i.createContext({}),p=function(e){var n=i.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},s=function(e){var n=p(e.components);return i.createElement(d.Provider,{value:n},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},m=i.forwardRef((function(e,n){var t=e.components,r=e.mdxType,o=e.originalType,d=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),u=p(t),m=r,k=u["".concat(d,".").concat(m)]||u[m]||c[m]||o;return t?i.createElement(k,a(a({ref:n},s),{},{components:t})):i.createElement(k,a({ref:n},s))}));function k(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var o=t.length,a=new Array(o);a[0]=m;var l={};for(var d in n)hasOwnProperty.call(n,d)&&(l[d]=n[d]);l.originalType=e,l[u]="string"==typeof e?e:r,a[1]=l;for(var p=2;p<o;p++)a[p]=t[p];return i.createElement.apply(null,a)}return i.createElement.apply(null,t)}m.displayName="MDXCreateElement"},17259:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>a,default:()=>c,frontMatter:()=>o,metadata:()=>l,toc:()=>p});var i=t(87462),r=(t(67294),t(3905));const o={id:"MapOrientationModule",title:"Class: MapOrientationModule",sidebar_label:"MapOrientationModule",sidebar_position:0,custom_edit_url:null},a=void 0,l={unversionedId:"garminsdk/classes/MapOrientationModule",id:"garminsdk/classes/MapOrientationModule",title:"Class: MapOrientationModule",description:"A module describing the map orientation.",source:"@site/docs/garminsdk/classes/MapOrientationModule.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/MapOrientationModule",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapOrientationModule",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapOrientationModule",title:"Class: MapOrientationModule",sidebar_label:"MapOrientationModule",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapOrientationModeController",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapOrientationModeController"},next:{title:"MapOrientationRTRController",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapOrientationRTRController"}},d={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Properties",id:"properties",level:2},{value:"commandedOrientation",id:"commandedorientation",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"desiredOrientation",id:"desiredorientation",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"northUpAboveActive",id:"northupaboveactive",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"northUpAboveRangeIndex",id:"northupaboverangeindex",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"northUpOnGroundActive",id:"northupongroundactive",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"orientation",id:"orientation",level:3},{value:"Defined in",id:"defined-in-5",level:4}],s={toc:p},u="wrapper";function c(e){let{components:n,...t}=e;return(0,r.kt)(u,(0,i.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A module describing the map orientation."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new MapOrientationModule"),"()"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"commandedorientation"},"commandedOrientation"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"commandedOrientation"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapOrientation"},(0,r.kt)("inlineCode",{parentName:"a"},"MapOrientation")),">"),(0,r.kt)("p",null,"The map orientation commanded by the user."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/modules/MapOrientationModule.ts:24"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"desiredorientation"},"desiredOrientation"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"desiredOrientation"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapOrientation"},(0,r.kt)("inlineCode",{parentName:"a"},"MapOrientation")),">"),(0,r.kt)("p",null,"The desired orientation of the map."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/modules/MapOrientationModule.ts:21"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"northupaboveactive"},"northUpAboveActive"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"northUpAboveActive"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether north up-above is active."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/modules/MapOrientationModule.ts:27"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"northupaboverangeindex"},"northUpAboveRangeIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"northUpAboveRangeIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The range index above which north up-above applies."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/modules/MapOrientationModule.ts:30"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"northupongroundactive"},"northUpOnGroundActive"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"northUpOnGroundActive"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,r.kt)("p",null,"Whether north up on ground is active."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/modules/MapOrientationModule.ts:33"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"orientation"},"orientation"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"orientation"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapOrientation"},(0,r.kt)("inlineCode",{parentName:"a"},"MapOrientation")),">"),(0,r.kt)("p",null,"The actual orientation of the map."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/modules/MapOrientationModule.ts:18"))}c.isMDXComponent=!0}}]);