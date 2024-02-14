"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[19233],{3905:(e,r,n)=>{n.d(r,{Zo:()=>p,kt:()=>f});var t=n(67294);function a(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function o(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function i(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?o(Object(n),!0).forEach((function(r){a(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function s(e,r){if(null==e)return{};var n,t,a=function(e,r){if(null==e)return{};var n,t,a={},o=Object.keys(e);for(t=0;t<o.length;t++)n=o[t],r.indexOf(n)>=0||(a[n]=e[n]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(t=0;t<o.length;t++)n=o[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=t.createContext({}),c=function(e){var r=t.useContext(l),n=r;return e&&(n="function"==typeof e?e(r):i(i({},r),e)),n},p=function(e){var r=c(e.components);return t.createElement(l.Provider,{value:r},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},d=t.forwardRef((function(e,r){var n=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=c(n),d=a,f=u["".concat(l,".").concat(d)]||u[d]||m[d]||o;return n?t.createElement(f,i(i({ref:r},p),{},{components:n})):t.createElement(f,i({ref:r},p))}));function f(e,r){var n=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=d;var s={};for(var l in r)hasOwnProperty.call(r,l)&&(s[l]=r[l]);s.originalType=e,s[u]="string"==typeof e?e:a,i[1]=s;for(var c=2;c<o;c++)i[c]=n[c];return t.createElement.apply(null,i)}return t.createElement.apply(null,n)}d.displayName="MDXCreateElement"},54029:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>l,contentTitle:()=>i,default:()=>m,frontMatter:()=>o,metadata:()=>s,toc:()=>c});var t=n(87462),a=(n(67294),n(3905));const o={id:"MapRangeModule",title:"Class: MapRangeModule",sidebar_label:"MapRangeModule",sidebar_position:0,custom_edit_url:null},i=void 0,s={unversionedId:"framework/classes/MapRangeModule",id:"framework/classes/MapRangeModule",title:"Class: MapRangeModule",description:"A module describing the nominal range of a map.",source:"@site/docs/framework/classes/MapRangeModule.md",sourceDirName:"framework/classes",slug:"/framework/classes/MapRangeModule",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapRangeModule",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapRangeModule",title:"Class: MapRangeModule",sidebar_label:"MapRangeModule",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapProjection",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapProjection"},next:{title:"MapRotationController",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapRotationController"}},l={},c=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Properties",id:"properties",level:2},{value:"nominalRange",id:"nominalrange",level:3},{value:"Defined in",id:"defined-in",level:4}],p={toc:c},u="wrapper";function m(e){let{components:r,...n}=e;return(0,a.kt)(u,(0,t.Z)({},p,n,{components:r,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A module describing the nominal range of a map."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new MapRangeModule"),"(): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapRangeModule"},(0,a.kt)("inlineCode",{parentName:"a"},"MapRangeModule"))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapRangeModule"},(0,a.kt)("inlineCode",{parentName:"a"},"MapRangeModule"))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"nominalrange"},"nominalRange"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"nominalRange"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/NumberUnitSubject"},(0,a.kt)("inlineCode",{parentName:"a"},"NumberUnitSubject")),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/UnitFamily#distance"},(0,a.kt)("inlineCode",{parentName:"a"},"Distance")),", ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/SimpleUnit"},(0,a.kt)("inlineCode",{parentName:"a"},"SimpleUnit")),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/UnitFamily#distance"},(0,a.kt)("inlineCode",{parentName:"a"},"Distance")),">",">"),(0,a.kt)("p",null,"The range of the map as a number unit."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/map/modules/MapRangeModule.ts:10"))}m.isMDXComponent=!0}}]);