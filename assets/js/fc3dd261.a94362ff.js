"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[65841],{3905:(e,n,r)=>{r.d(n,{Zo:()=>c,kt:()=>u});var t=r(67294);function o(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function i(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function l(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?i(Object(r),!0).forEach((function(n){o(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function a(e,n){if(null==e)return{};var r,t,o=function(e,n){if(null==e)return{};var r,t,o={},i=Object.keys(e);for(t=0;t<i.length;t++)r=i[t],n.indexOf(r)>=0||(o[r]=e[r]);return o}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(t=0;t<i.length;t++)r=i[t],n.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var p=t.createContext({}),s=function(e){var n=t.useContext(p),r=n;return e&&(r="function"==typeof e?e(n):l(l({},n),e)),r},c=function(e){var n=s(e.components);return t.createElement(p.Provider,{value:n},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},f=t.forwardRef((function(e,n){var r=e.components,o=e.mdxType,i=e.originalType,p=e.parentName,c=a(e,["components","mdxType","originalType","parentName"]),m=s(r),f=o,u=m["".concat(p,".").concat(f)]||m[f]||d[f]||i;return r?t.createElement(u,l(l({ref:n},c),{},{components:r})):t.createElement(u,l({ref:n},c))}));function u(e,n){var r=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var i=r.length,l=new Array(i);l[0]=f;var a={};for(var p in n)hasOwnProperty.call(n,p)&&(a[p]=n[p]);a.originalType=e,a[m]="string"==typeof e?e:o,l[1]=a;for(var s=2;s<i;s++)l[s]=r[s];return t.createElement.apply(null,l)}return t.createElement.apply(null,r)}f.displayName="MDXCreateElement"},48094:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>p,contentTitle:()=>l,default:()=>d,frontMatter:()=>i,metadata:()=>a,toc:()=>s});var t=r(87462),o=(r(67294),r(3905));const i={id:"CollectionComponentProps",title:"Interface: CollectionComponentProps",sidebar_label:"CollectionComponentProps",sidebar_position:0,custom_edit_url:null},l=void 0,a={unversionedId:"framework/interfaces/CollectionComponentProps",id:"framework/interfaces/CollectionComponentProps",title:"Interface: CollectionComponentProps",description:"The props for a CollectionComponent.",source:"@site/docs/framework/interfaces/CollectionComponentProps.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/CollectionComponentProps",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/CollectionComponentProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"CollectionComponentProps",title:"Interface: CollectionComponentProps",sidebar_label:"CollectionComponentProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"ClockEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/ClockEvents"},next:{title:"ComRadioTuneEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/ComRadioTuneEvents"}},p={},s=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"id",id:"id",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4}],c={toc:s},m="wrapper";function d(e){let{components:n,...r}=e;return(0,o.kt)(m,(0,t.Z)({},c,r,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"The props for a CollectionComponent."),(0,o.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/ComponentProps"},(0,o.kt)("inlineCode",{parentName:"a"},"ComponentProps"))),(0,o.kt)("p",{parentName:"li"},"\u21b3 ",(0,o.kt)("strong",{parentName:"p"},(0,o.kt)("inlineCode",{parentName:"strong"},"CollectionComponentProps"))))),(0,o.kt)("h2",{id:"properties"},"Properties"),(0,o.kt)("h3",{id:"children"},"children"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,o.kt)("strong",{parentName:"p"},"children"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,o.kt)("p",null,"The children of the display component."),(0,o.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/ComponentProps"},"ComponentProps"),".",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/ComponentProps#children"},"children")),(0,o.kt)("h4",{id:"defined-in"},"Defined in"),(0,o.kt)("p",null,"src/sdk/components/FSComponent.ts:122"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"id"},"id"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"id"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"string")),(0,o.kt)("p",null,"The element ID to use."),(0,o.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,o.kt)("p",null,"src/sdk/components/CollectionComponent.tsx:14"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"ref"},"ref"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,o.kt)("strong",{parentName:"p"},"ref"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/NodeReference"},(0,o.kt)("inlineCode",{parentName:"a"},"NodeReference")),"<",(0,o.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,o.kt)("p",null,"A reference to the display component."),(0,o.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/ComponentProps"},"ComponentProps"),".",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/ComponentProps#ref"},"ref")),(0,o.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,o.kt)("p",null,"src/sdk/components/FSComponent.ts:125"))}d.isMDXComponent=!0}}]);