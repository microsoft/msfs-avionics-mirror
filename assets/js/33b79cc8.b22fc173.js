"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[57881],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=r.createContext({}),c=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},p=function(e){var t=c(e.components);return r.createElement(s.Provider,{value:t},e.children)},f="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),f=c(n),u=i,m=f["".concat(s,".").concat(u)]||f[u]||d[u]||o;return n?r.createElement(m,a(a({ref:t},p),{},{components:n})):r.createElement(m,a({ref:t},p))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=u;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[f]="string"==typeof e?e:i,a[1]=l;for(var c=2;c<o;c++)a[c]=n[c];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},85301:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>a,default:()=>d,frontMatter:()=>o,metadata:()=>l,toc:()=>c});var r=n(87462),i=(n(67294),n(3905));const o={id:"AoAFlapsDefinition",title:"Interface: AoAFlapsDefinition",sidebar_label:"AoAFlapsDefinition",sidebar_position:0,custom_edit_url:null},a=void 0,l={unversionedId:"wt21shared/interfaces/AoAFlapsDefinition",id:"wt21shared/interfaces/AoAFlapsDefinition",title:"Interface: AoAFlapsDefinition",description:"A definition of AOA limits for a given flap configuration.",source:"@site/docs/wt21shared/interfaces/AoAFlapsDefinition.md",sourceDirName:"wt21shared/interfaces",slug:"/wt21shared/interfaces/AoAFlapsDefinition",permalink:"/msfs-avionics-mirror/docs/wt21shared/interfaces/AoAFlapsDefinition",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AoAFlapsDefinition",title:"Interface: AoAFlapsDefinition",sidebar_label:"AoAFlapsDefinition",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AOASystemEvents",permalink:"/msfs-avionics-mirror/docs/wt21shared/interfaces/AOASystemEvents"},next:{title:"ApproachPerformanceResults",permalink:"/msfs-avionics-mirror/docs/wt21shared/interfaces/ApproachPerformanceResults"}},s={},c=[{value:"Properties",id:"properties",level:2},{value:"correctionFactor",id:"correctionfactor",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"stall",id:"stall",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"zeroLift",id:"zerolift",level:3},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:c},f="wrapper";function d(e){let{components:t,...n}=e;return(0,i.kt)(f,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A definition of AOA limits for a given flap configuration."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"correctionfactor"},"correctionFactor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"correctionFactor"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The correction factor to adjust against any non-linearity in the AOA."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-wt21/shared/Systems/AOASystem.ts:14"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"stall"},"stall"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"stall"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The stall angle of attack, in degrees."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-wt21/shared/Systems/AOASystem.ts:11"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"zerolift"},"zeroLift"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"zeroLift"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"The zero-lift angle of attack, in degrees."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-wt21/shared/Systems/AOASystem.ts:8"))}d.isMDXComponent=!0}}]);