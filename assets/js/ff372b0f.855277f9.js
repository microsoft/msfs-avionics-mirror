"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[60117],{3905:(e,n,t)=>{t.d(n,{Zo:()=>s,kt:()=>m});var r=t(67294);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var d=r.createContext({}),p=function(e){var n=r.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},s=function(e){var n=p(e.components);return r.createElement(d.Provider,{value:n},e.children)},c="mdxType",f={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},u=r.forwardRef((function(e,n){var t=e.components,o=e.mdxType,i=e.originalType,d=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),c=p(t),u=o,m=c["".concat(d,".").concat(u)]||c[u]||f[u]||i;return t?r.createElement(m,a(a({ref:n},s),{},{components:t})):r.createElement(m,a({ref:n},s))}));function m(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var i=t.length,a=new Array(i);a[0]=u;var l={};for(var d in n)hasOwnProperty.call(n,d)&&(l[d]=n[d]);l.originalType=e,l[c]="string"==typeof e?e:o,a[1]=l;for(var p=2;p<i;p++)a[p]=t[p];return r.createElement.apply(null,a)}return r.createElement.apply(null,t)}u.displayName="MDXCreateElement"},95205:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>a,default:()=>f,frontMatter:()=>i,metadata:()=>l,toc:()=>p});var r=t(87462),o=(t(67294),t(3905));const i={id:"index.VNode",title:"Interface: VNode",sidebar_label:"VNode",custom_edit_url:null},a=void 0,l={unversionedId:"framework/interfaces/index.VNode",id:"framework/interfaces/index.VNode",title:"Interface: VNode",description:"index.VNode",source:"@site/docs/framework/interfaces/index.VNode.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.VNode",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.VNode",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.VNode",title:"Interface: VNode",sidebar_label:"VNode",custom_edit_url:null},sidebar:"sidebar",previous:{title:"VNavPlanSegment",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.VNavPlanSegment"},next:{title:"Validator",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.Validator"}},d={},p=[{value:"Properties",id:"properties",level:2},{value:"children",id:"children",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"instance",id:"instance",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"props",id:"props",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"root",id:"root",level:3},{value:"Defined in",id:"defined-in-3",level:4}],s={toc:p},c="wrapper";function f(e){let{components:n,...t}=e;return(0,o.kt)(c,(0,r.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".VNode"),(0,o.kt)("p",null,"An interface that describes a virtual DOM node."),(0,o.kt)("h2",{id:"properties"},"Properties"),(0,o.kt)("h3",{id:"children"},"children"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"children"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.VNode"},(0,o.kt)("inlineCode",{parentName:"a"},"VNode")),"[]"),(0,o.kt)("p",null,"The children of this node."),(0,o.kt)("h4",{id:"defined-in"},"Defined in"),(0,o.kt)("p",null,"src/sdk/components/FSComponent.ts:27"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"instance"},"instance"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"instance"),": ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/#nodeinstance"},(0,o.kt)("inlineCode",{parentName:"a"},"NodeInstance"))),(0,o.kt)("p",null,"The created instance of the node."),(0,o.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,o.kt)("p",null,"src/sdk/components/FSComponent.ts:14"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"props"},"props"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"props"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"any")),(0,o.kt)("p",null,"Any properties to apply to the node."),(0,o.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,o.kt)("p",null,"src/sdk/components/FSComponent.ts:24"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"root"},"root"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,o.kt)("strong",{parentName:"p"},"root"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Node")),(0,o.kt)("p",null,"The root DOM node of this VNode"),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},(0,o.kt)("inlineCode",{parentName:"strong"},"Memberof"))),(0,o.kt)("p",null,"VNode"),(0,o.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,o.kt)("p",null,"src/sdk/components/FSComponent.ts:21"))}f.isMDXComponent=!0}}]);