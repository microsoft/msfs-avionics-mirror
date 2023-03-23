"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[92511],{3905:(e,r,n)=>{n.d(r,{Zo:()=>s,kt:()=>m});var t=n(67294);function a(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function i(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function o(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?i(Object(n),!0).forEach((function(r){a(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function l(e,r){if(null==e)return{};var n,t,a=function(e,r){if(null==e)return{};var n,t,a={},i=Object.keys(e);for(t=0;t<i.length;t++)n=i[t],r.indexOf(n)>=0||(a[n]=e[n]);return a}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(t=0;t<i.length;t++)n=i[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=t.createContext({}),d=function(e){var r=t.useContext(p),n=r;return e&&(n="function"==typeof e?e(r):o(o({},r),e)),n},s=function(e){var r=d(e.components);return t.createElement(p.Provider,{value:r},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},f=t.forwardRef((function(e,r){var n=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),c=d(n),f=a,m=c["".concat(p,".").concat(f)]||c[f]||u[f]||i;return n?t.createElement(m,o(o({ref:r},s),{},{components:n})):t.createElement(m,o({ref:r},s))}));function m(e,r){var n=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=f;var l={};for(var p in r)hasOwnProperty.call(r,p)&&(l[p]=r[p]);l.originalType=e,l[c]="string"==typeof e?e:a,o[1]=l;for(var d=2;d<i;d++)o[d]=n[d];return t.createElement.apply(null,o)}return t.createElement.apply(null,n)}f.displayName="MDXCreateElement"},36553:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>p,contentTitle:()=>o,default:()=>u,frontMatter:()=>i,metadata:()=>l,toc:()=>d});var t=n(87462),a=(n(67294),n(3905));const i={id:"MarkerBeaconDisplayProps",title:"Interface: MarkerBeaconDisplayProps",sidebar_label:"MarkerBeaconDisplayProps",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"garminsdk/interfaces/MarkerBeaconDisplayProps",id:"garminsdk/interfaces/MarkerBeaconDisplayProps",title:"Interface: MarkerBeaconDisplayProps",description:"Component props for MarkerBeaconDisplay.",source:"@site/docs/garminsdk/interfaces/MarkerBeaconDisplayProps.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/MarkerBeaconDisplayProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MarkerBeaconDisplayProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MarkerBeaconDisplayProps",title:"Interface: MarkerBeaconDisplayProps",sidebar_label:"MarkerBeaconDisplayProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MarkerBeaconDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MarkerBeaconDataProvider"},next:{title:"MarkerBeaconSystemEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MarkerBeaconSystemEvents"}},p={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"dataProvider",id:"dataprovider",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"declutter",id:"declutter",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4}],s={toc:d},c="wrapper";function u(e){let{components:r,...n}=e;return(0,a.kt)(c,(0,t.Z)({},s,n,{components:r,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Component props for MarkerBeaconDisplay."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"MarkerBeaconDisplayProps"))))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"children"},"children"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"children"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,a.kt)("p",null,"The children of the display component."),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,"ComponentProps.children"),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:121"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"dataprovider"},"dataProvider"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"dataProvider"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MarkerBeaconDataProvider"},(0,a.kt)("inlineCode",{parentName:"a"},"MarkerBeaconDataProvider"))),(0,a.kt)("p",null,"A provider of marker beacon data."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/nextgenpfd/marker/MarkerBeaconDisplay.tsx:9"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"declutter"},"declutter"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"declutter"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("p",null,"Whether the display should be decluttered."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/nextgenpfd/marker/MarkerBeaconDisplay.tsx:12"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ref"},"ref"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"ref"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,a.kt)("p",null,"A reference to the display component."),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,"ComponentProps.ref"),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:124"))}u.isMDXComponent=!0}}]);