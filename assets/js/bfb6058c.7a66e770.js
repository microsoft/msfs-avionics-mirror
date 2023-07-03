"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[25285],{3905:(e,n,r)=>{r.d(n,{Zo:()=>d,kt:()=>f});var t=r(67294);function i(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function o(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function l(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?o(Object(r),!0).forEach((function(n){i(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function a(e,n){if(null==e)return{};var r,t,i=function(e,n){if(null==e)return{};var r,t,i={},o=Object.keys(e);for(t=0;t<o.length;t++)r=o[t],n.indexOf(r)>=0||(i[r]=e[r]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(t=0;t<o.length;t++)r=o[t],n.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var p=t.createContext({}),s=function(e){var n=t.useContext(p),r=n;return e&&(r="function"==typeof e?e(n):l(l({},n),e)),r},d=function(e){var n=s(e.components);return t.createElement(p.Provider,{value:n},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},m=t.forwardRef((function(e,n){var r=e.components,i=e.mdxType,o=e.originalType,p=e.parentName,d=a(e,["components","mdxType","originalType","parentName"]),c=s(r),m=i,f=c["".concat(p,".").concat(m)]||c[m]||u[m]||o;return r?t.createElement(f,l(l({ref:n},d),{},{components:r})):t.createElement(f,l({ref:n},d))}));function f(e,n){var r=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=r.length,l=new Array(o);l[0]=m;var a={};for(var p in n)hasOwnProperty.call(n,p)&&(a[p]=n[p]);a.originalType=e,a[c]="string"==typeof e?e:i,l[1]=a;for(var s=2;s<o;s++)l[s]=r[s];return t.createElement.apply(null,l)}return t.createElement.apply(null,r)}m.displayName="MDXCreateElement"},84385:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>p,contentTitle:()=>l,default:()=>u,frontMatter:()=>o,metadata:()=>a,toc:()=>s});var t=r(87462),i=(r(67294),r(3905));const o={id:"FailureBoxProps",title:"Interface: FailureBoxProps",sidebar_label:"FailureBoxProps",sidebar_position:0,custom_edit_url:null},l=void 0,a={unversionedId:"garminsdk/interfaces/FailureBoxProps",id:"garminsdk/interfaces/FailureBoxProps",title:"Interface: FailureBoxProps",description:"Component props for FailureBox.",source:"@site/docs/garminsdk/interfaces/FailureBoxProps.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/FailureBoxProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/FailureBoxProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FailureBoxProps",title:"Interface: FailureBoxProps",sidebar_label:"FailureBoxProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"CasEvents",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/CasEvents"},next:{title:"FlightDirectorDualCueProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/FlightDirectorDualCueProps"}},p={},s=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"class",id:"class",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"show",id:"show",level:3},{value:"Defined in",id:"defined-in-3",level:4}],d={toc:s},c="wrapper";function u(e){let{components:n,...r}=e;return(0,i.kt)(c,(0,t.Z)({},d,r,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Component props for FailureBox."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"FailureBoxProps"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"children"},"children"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"children"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,i.kt)("p",null,"The children of the display component."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,"ComponentProps.children"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:121"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"class"},"class"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"class"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"SubscribableSet"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"ToggleableClassNameRecord")),(0,i.kt)("p",null,"CSS class(es) to apply to the box's root element."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/common/FailureBox.tsx:11"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ref"},"ref"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"ref"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,i.kt)("p",null,"A reference to the display component."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,"ComponentProps.ref"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:124"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"show"},"show"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"show"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Whether to show the box."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/common/FailureBox.tsx:8"))}u.isMDXComponent=!0}}]);