"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[33264],{3905:(e,r,a)=>{a.d(r,{Zo:()=>s,kt:()=>f});var t=a(67294);function n(e,r,a){return r in e?Object.defineProperty(e,r,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[r]=a,e}function i(e,r){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),a.push.apply(a,t)}return a}function o(e){for(var r=1;r<arguments.length;r++){var a=null!=arguments[r]?arguments[r]:{};r%2?i(Object(a),!0).forEach((function(r){n(e,r,a[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(a,r))}))}return e}function l(e,r){if(null==e)return{};var a,t,n=function(e,r){if(null==e)return{};var a,t,n={},i=Object.keys(e);for(t=0;t<i.length;t++)a=i[t],r.indexOf(a)>=0||(n[a]=e[a]);return n}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(t=0;t<i.length;t++)a=i[t],r.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var c=t.createContext({}),d=function(e){var r=t.useContext(c),a=r;return e&&(a="function"==typeof e?e(r):o(o({},r),e)),a},s=function(e){var r=d(e.components);return t.createElement(c.Provider,{value:r},e.children)},p="mdxType",m={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},u=t.forwardRef((function(e,r){var a=e.components,n=e.mdxType,i=e.originalType,c=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),p=d(a),u=n,f=p["".concat(c,".").concat(u)]||p[u]||m[u]||i;return a?t.createElement(f,o(o({ref:r},s),{},{components:a})):t.createElement(f,o({ref:r},s))}));function f(e,r){var a=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var i=a.length,o=new Array(i);o[0]=u;var l={};for(var c in r)hasOwnProperty.call(r,c)&&(l[c]=r[c]);l.originalType=e,l[p]="string"==typeof e?e:n,o[1]=l;for(var d=2;d<i;d++)o[d]=a[d];return t.createElement.apply(null,o)}return t.createElement.apply(null,a)}u.displayName="MDXCreateElement"},84850:(e,r,a)=>{a.r(r),a.d(r,{assets:()=>c,contentTitle:()=>o,default:()=>m,frontMatter:()=>i,metadata:()=>l,toc:()=>d});var t=a(87462),n=(a(67294),a(3905));const i={id:"MarkerBeaconDataProvider",title:"Interface: MarkerBeaconDataProvider",sidebar_label:"MarkerBeaconDataProvider",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"garminsdk/interfaces/MarkerBeaconDataProvider",id:"garminsdk/interfaces/MarkerBeaconDataProvider",title:"Interface: MarkerBeaconDataProvider",description:"A provider of marker beacon data.",source:"@site/docs/garminsdk/interfaces/MarkerBeaconDataProvider.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/MarkerBeaconDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MarkerBeaconDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MarkerBeaconDataProvider",title:"Interface: MarkerBeaconDataProvider",sidebar_label:"MarkerBeaconDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapWxrControllerModules",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapWxrControllerModules"},next:{title:"MarkerBeaconDisplayProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MarkerBeaconDisplayProps"}},c={},d=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"isDataFailed",id:"isdatafailed",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"markerBeaconState",id:"markerbeaconstate",level:3},{value:"Defined in",id:"defined-in-1",level:4}],s={toc:d},p="wrapper";function m(e){let{components:r,...a}=e;return(0,n.kt)(p,(0,t.Z)({},s,a,{components:r,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A provider of marker beacon data."),(0,n.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultMarkerBeaconDataProvider"},(0,n.kt)("inlineCode",{parentName:"a"},"DefaultMarkerBeaconDataProvider")))),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"isdatafailed"},"isDataFailed"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"isDataFailed"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,n.kt)("p",null,"Whether marker beacon data is in a failed state."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"garminsdk/components/nextgenpfd/marker/MarkerBeaconDataProvider.ts:15"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"markerbeaconstate"},"markerBeaconState"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"markerBeaconState"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"MarkerBeaconState"),">"),(0,n.kt)("p",null,"The current marker beacon receiving state."),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"garminsdk/components/nextgenpfd/marker/MarkerBeaconDataProvider.ts:12"))}m.isMDXComponent=!0}}]);