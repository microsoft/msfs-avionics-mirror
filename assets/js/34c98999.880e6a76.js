"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[80542],{3905:(e,r,t)=>{t.d(r,{Zo:()=>s,kt:()=>m});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function l(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var d=n.createContext({}),c=function(e){var r=n.useContext(d),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},s=function(e){var r=c(e.components);return n.createElement(d.Provider,{value:r},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},f=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,i=e.originalType,d=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),p=c(t),f=a,m=p["".concat(d,".").concat(f)]||p[f]||u[f]||i;return t?n.createElement(m,o(o({ref:r},s),{},{components:t})):n.createElement(m,o({ref:r},s))}));function m(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=f;var l={};for(var d in r)hasOwnProperty.call(r,d)&&(l[d]=r[d]);l.originalType=e,l[p]="string"==typeof e?e:a,o[1]=l;for(var c=2;c<i;c++)o[c]=t[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,t)}f.displayName="MDXCreateElement"},72365:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>d,contentTitle:()=>o,default:()=>u,frontMatter:()=>i,metadata:()=>l,toc:()=>c});var n=t(87462),a=(t(67294),t(3905));const i={id:"index.MetarCloudLayer",title:"Interface: MetarCloudLayer",sidebar_label:"MetarCloudLayer",custom_edit_url:null},o=void 0,l={unversionedId:"framework/interfaces/index.MetarCloudLayer",id:"framework/interfaces/index.MetarCloudLayer",title:"Interface: MetarCloudLayer",description:"index.MetarCloudLayer",source:"@site/docs/framework/interfaces/index.MetarCloudLayer.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.MetarCloudLayer",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.MetarCloudLayer",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.MetarCloudLayer",title:"Interface: MetarCloudLayer",sidebar_label:"MetarCloudLayer",custom_edit_url:null},sidebar:"sidebar",previous:{title:"Metar",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.Metar"},next:{title:"MetarPhenomenon",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.MetarPhenomenon"}},d={},c=[{value:"Properties",id:"properties",level:2},{value:"alt",id:"alt",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"cover",id:"cover",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"type",id:"type",level:3},{value:"Defined in",id:"defined-in-2",level:4}],s={toc:c},p="wrapper";function u(e){let{components:r,...t}=e;return(0,a.kt)(p,(0,n.Z)({},s,t,{components:r,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".MetarCloudLayer"),(0,a.kt)("p",null,"A METAR cloud layer description."),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"alt"},"alt"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"alt"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The altitude of this layer, in hundreds of feet."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/navigation/Facilities.ts:1143"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"cover"},"cover"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"cover"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/index.MetarCloudLayerCoverage"},(0,a.kt)("inlineCode",{parentName:"a"},"MetarCloudLayerCoverage"))),(0,a.kt)("p",null,"The coverage of this layer."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/navigation/Facilities.ts:1146"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"type"},"type"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"type"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/index.MetarCloudLayerType"},(0,a.kt)("inlineCode",{parentName:"a"},"MetarCloudLayerType"))),(0,a.kt)("p",null,"The significant cloud type found in this layer."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/navigation/Facilities.ts:1149"))}u.isMDXComponent=!0}}]);