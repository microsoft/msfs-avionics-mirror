"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[8719],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>k});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),d=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=d(e.components);return r.createElement(p.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=d(n),c=a,k=m["".concat(p,".").concat(c)]||m[c]||u[c]||i;return n?r.createElement(k,l(l({ref:t},s),{},{components:n})):r.createElement(k,l({ref:t},s))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=c;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[m]="string"==typeof e?e:a,l[1]=o;for(var d=2;d<i;d++)l[d]=n[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},80870:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var r=n(87462),a=(n(67294),n(3905));const i={id:"NextGenConnextMapBuilder",title:"Class: NextGenConnextMapBuilder",sidebar_label:"NextGenConnextMapBuilder",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/classes/NextGenConnextMapBuilder",id:"garminsdk/classes/NextGenConnextMapBuilder",title:"Class: NextGenConnextMapBuilder",description:"Builds next-generation (NXi, G3000, etc) Garmin Connext weather maps.",source:"@site/docs/garminsdk/classes/NextGenConnextMapBuilder.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/NextGenConnextMapBuilder",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/NextGenConnextMapBuilder",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NextGenConnextMapBuilder",title:"Class: NextGenConnextMapBuilder",sidebar_label:"NextGenConnextMapBuilder",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"NeedleAnimator",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/NeedleAnimator"},next:{title:"NextGenDateTimeNavDataFieldTypeRenderer",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/NextGenDateTimeNavDataFieldTypeRenderer"}},p={},d=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Methods",id:"methods",level:2},{value:"build",id:"build",level:3},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4}],s={toc:d},m="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(m,(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Builds next-generation (NXi, G3000, etc) Garmin Connext weather maps."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new NextGenConnextMapBuilder"),"()"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"build"},"build"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("strong",{parentName:"p"},"build"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"MapBuilder"),">","(",(0,a.kt)("inlineCode",{parentName:"p"},"mapBuilder"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"options"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"MapBuilder")),(0,a.kt)("p",null,"Configures a map builder to generate a next-generation (NXi, G3000, etc) Garmin Connext weather map."),(0,a.kt)("p",null,"The controller ",(0,a.kt)("inlineCode",{parentName:"p"},"[GarminMapKeys.Range]: MapRangeController")," is added to the map context and can be used to control\nthe range of the map."),(0,a.kt)("p",null,"If the map pointer is supported, the controller ",(0,a.kt)("inlineCode",{parentName:"p"},"[GarminMapKeys.Pointer]: MapPointerController")," is added to the\nmap context and can be used to control the pointer."),(0,a.kt)("p",null,"The map builder will ",(0,a.kt)("strong",{parentName:"p"},"not")," be configured to apply a custom projected size, dead zone, or to automatically update\nthe map."),(0,a.kt)("h4",{id:"type-parameters"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"MapBuilder")),(0,a.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,a.kt)("inlineCode",{parentName:"td"},"MapSystemBuilder"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,a.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,a.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,a.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,a.kt)("inlineCode",{parentName:"td"},"MapBuilder"),">")))),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"mapBuilder")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"MapBuilder")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The map builder to configure.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"options")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/modules#nextgenconnextmapoptions"},(0,a.kt)("inlineCode",{parentName:"a"},"NextGenConnextMapOptions"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"Options for configuring the map.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"MapBuilder")),(0,a.kt)("p",null,"The builder, after it has been configured."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/assembled/NextGenConnextMapBuilder.tsx:248"))}u.isMDXComponent=!0}}]);