"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[66026],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>u});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=r.createContext({}),d=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=d(e.components);return r.createElement(s.Provider,{value:t},e.children)},f="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),f=d(n),m=o,u=f["".concat(s,".").concat(m)]||f[m]||c[m]||a;return n?r.createElement(u,l(l({ref:t},p),{},{components:n})):r.createElement(u,l({ref:t},p))}));function u(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,l=new Array(a);l[0]=m;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i[f]="string"==typeof e?e:o,l[1]=i;for(var d=2;d<a;d++)l[d]=n[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},49107:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>c,frontMatter:()=>a,metadata:()=>i,toc:()=>d});var r=n(87462),o=(n(67294),n(3905));const a={id:"SoftKeyBooleanController",title:"Class: SoftKeyBooleanController",sidebar_label:"SoftKeyBooleanController",sidebar_position:0,custom_edit_url:null},l=void 0,i={unversionedId:"garminsdk/classes/SoftKeyBooleanController",id:"garminsdk/classes/SoftKeyBooleanController",title:"Class: SoftKeyBooleanController",description:"A controller which binds a softkey to a boolean state. Once bound, the softkey will display the bound state and",source:"@site/docs/garminsdk/classes/SoftKeyBooleanController.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/SoftKeyBooleanController",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyBooleanController",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"SoftKeyBooleanController",title:"Class: SoftKeyBooleanController",sidebar_label:"SoftKeyBooleanController",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"SoftKeyBar",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyBar"},next:{title:"SoftKeyEnumController",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyEnumController"}},s={},d=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"init",id:"init",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:d},f="wrapper";function c(e){let{components:t,...n}=e;return(0,o.kt)(f,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"A controller which binds a softkey to a boolean state. Once bound, the softkey will display the bound state and\neach press of the softkey will toggle the value of the state."),(0,o.kt)("h2",{id:"constructors"},"Constructors"),(0,o.kt)("h3",{id:"constructor"},"constructor"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"new SoftKeyBooleanController"),"(",(0,o.kt)("inlineCode",{parentName:"p"},"softkeyMenu"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"softkeyIndex"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"softkeyLabel"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"state"),")"),(0,o.kt)("p",null,"Constructor."),(0,o.kt)("h4",{id:"parameters"},"Parameters"),(0,o.kt)("table",null,(0,o.kt)("thead",{parentName:"table"},(0,o.kt)("tr",{parentName:"thead"},(0,o.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,o.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,o.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,o.kt)("tbody",{parentName:"table"},(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"softkeyMenu")),(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyMenu"},(0,o.kt)("inlineCode",{parentName:"a"},"SoftKeyMenu"))),(0,o.kt)("td",{parentName:"tr",align:"left"},"The softkey menu to which this controller's softkey belongs.")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"softkeyIndex")),(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"number")),(0,o.kt)("td",{parentName:"tr",align:"left"},"The index in the softkey menu at which this controller's softkey is located.")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"softkeyLabel")),(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"string")),(0,o.kt)("td",{parentName:"tr",align:"left"},"The text label of this controller's softkey.")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"state")),(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"MutableSubscribable"),"<",(0,o.kt)("inlineCode",{parentName:"td"},"boolean"),", ",(0,o.kt)("inlineCode",{parentName:"td"},"boolean"),">"),(0,o.kt)("td",{parentName:"tr",align:"left"},"The state bound to this controller's softkey.")))),(0,o.kt)("h4",{id:"defined-in"},"Defined in"),(0,o.kt)("p",null,"garminsdk/softkey/SoftKeyControllers.ts:24"),(0,o.kt)("h2",{id:"methods"},"Methods"),(0,o.kt)("h3",{id:"destroy"},"destroy"),(0,o.kt)("p",null,"\u25b8 ",(0,o.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,o.kt)("inlineCode",{parentName:"p"},"void")),(0,o.kt)("p",null,"Destroys this controller. This will remove the softkey menu item bound to this controller's state."),(0,o.kt)("h4",{id:"returns"},"Returns"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"void")),(0,o.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,o.kt)("p",null,"garminsdk/softkey/SoftKeyControllers.ts:58"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"init"},"init"),(0,o.kt)("p",null,"\u25b8 ",(0,o.kt)("strong",{parentName:"p"},"init"),"(): ",(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/SoftKeyMenuItem"},(0,o.kt)("inlineCode",{parentName:"a"},"SoftKeyMenuItem"))),(0,o.kt)("p",null,"Initializes this controller. This will create a softkey menu item and bind it to this controller's state."),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},(0,o.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,o.kt)("p",null,"Error if this controller has been destroyed."),(0,o.kt)("h4",{id:"returns-1"},"Returns"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/SoftKeyMenuItem"},(0,o.kt)("inlineCode",{parentName:"a"},"SoftKeyMenuItem"))),(0,o.kt)("p",null,"The softkey menu item bound to this controller's state."),(0,o.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,o.kt)("p",null,"garminsdk/softkey/SoftKeyControllers.ts:37"))}c.isMDXComponent=!0}}]);