"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[42680],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>m});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=n.createContext({}),s=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},d=function(e){var t=s(e.components);return n.createElement(c.Provider,{value:t},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),p=s(r),f=a,m=p["".concat(c,".").concat(f)]||p[f]||u[f]||i;return r?n.createElement(m,o(o({ref:t},d),{},{components:r})):n.createElement(m,o({ref:t},d))}));function m(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=f;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[p]="string"==typeof e?e:a,o[1]=l;for(var s=2;s<i;s++)o[s]=r[s];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},81243:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>o,default:()=>u,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var n=r(87462),a=(r(67294),r(3905));const i={id:"StyleRecord",title:"Interface: StyleRecord",sidebar_label:"StyleRecord",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"framework/interfaces/StyleRecord",id:"framework/interfaces/StyleRecord",title:"Interface: StyleRecord",description:"A record of styles which can be bound an HTML element's style attribute through JSX. Each of the record's keys",source:"@site/docs/framework/interfaces/StyleRecord.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/StyleRecord",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/StyleRecord",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"StyleRecord",title:"Interface: StyleRecord",sidebar_label:"StyleRecord",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"StallWarningEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/StallWarningEvents"},next:{title:"SubEventInterface",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/SubEventInterface"}},c={},s=[{value:"Indexable",id:"indexable",level:2}],d={toc:s},p="wrapper";function u(e){let{components:t,...r}=e;return(0,a.kt)(p,(0,n.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A record of styles which can be bound an HTML element's ",(0,a.kt)("inlineCode",{parentName:"p"},"style")," attribute through JSX. Each of the record's keys\ndefines a style name, and the key's value is a string or ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," or a similarly valued ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable")," that\ndetermines the value of the style. If a style's value is ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined"),", then that style will not appear in the\nelement's ",(0,a.kt)("inlineCode",{parentName:"p"},"style")," attribute (equivalent to setting the style value to the empty string)."),(0,a.kt)("h2",{id:"indexable"},"Indexable"),(0,a.kt)("p",null,"\u25aa ","[styleName: ",(0,a.kt)("inlineCode",{parentName:"p"},"string"),"]",": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscribable"},(0,a.kt)("inlineCode",{parentName:"a"},"Subscribable")),"<",(0,a.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined"),">"," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")))}u.isMDXComponent=!0}}]);