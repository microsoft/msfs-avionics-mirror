"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[52117],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),d=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=d(e.components);return r.createElement(s.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),m=d(n),c=a,f=m["".concat(s,".").concat(c)]||m[c]||u[c]||o;return n?r.createElement(f,l(l({ref:t},p),{},{components:n})):r.createElement(f,l({ref:t},p))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,l=new Array(o);l[0]=c;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i[m]="string"==typeof e?e:a,l[1]=i;for(var d=2;d<o;d++)l[d]=n[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},19112:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>u,frontMatter:()=>o,metadata:()=>i,toc:()=>d});var r=n(87462),a=(n(67294),n(3905));const o={id:"MultipleSoftKeyEnumController",title:"Class: MultipleSoftKeyEnumController<T>",sidebar_label:"MultipleSoftKeyEnumController",sidebar_position:0,custom_edit_url:null},l=void 0,i={unversionedId:"garminsdk/classes/MultipleSoftKeyEnumController",id:"garminsdk/classes/MultipleSoftKeyEnumController",title:"Class: MultipleSoftKeyEnumController<T>",description:"A controller which binds one or more softkeys to a state which can take one or more enumerated values. Each",source:"@site/docs/garminsdk/classes/MultipleSoftKeyEnumController.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/MultipleSoftKeyEnumController",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MultipleSoftKeyEnumController",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MultipleSoftKeyEnumController",title:"Class: MultipleSoftKeyEnumController<T>",sidebar_label:"MultipleSoftKeyEnumController",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MinimumsUnitsManager",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MinimumsUnitsManager"},next:{title:"NavDataBar",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/NavDataBar"}},s={},d=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"init",id:"init",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:d},m="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(m,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A controller which binds one or more softkeys to a state which can take one or more enumerated values. Each\nsoftkey is bound to a specific value. Once bound, each softkey will display whether the state is equal to its bound\nvalue, and each press of the softkey will set the state to its bound value."),(0,a.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"T"))))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new MultipleSoftKeyEnumController"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"T"),">","(",(0,a.kt)("inlineCode",{parentName:"p"},"softkeyMenu"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"state"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"softkeyDefs"),")"),(0,a.kt)("p",null,"Constructor."),(0,a.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"T"))))),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"softkeyMenu")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyMenu"},(0,a.kt)("inlineCode",{parentName:"a"},"SoftKeyMenu"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The softkey menu to which this controller's bound softkeys belong.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"state")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"MutableSubscribable"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"T"),", ",(0,a.kt)("inlineCode",{parentName:"td"},"T"),">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The state bound to this controller's softkeys.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"softkeyDefs")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/modules#multiplesoftkeyenumdef"},(0,a.kt)("inlineCode",{parentName:"a"},"MultipleSoftkeyEnumDef")),"<",(0,a.kt)("inlineCode",{parentName:"td"},"T"),">","[]"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The definitions for the softkeys bound to this controller's setting.")))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"garminsdk/softkey/SoftKeyControllers.ts:181"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"destroy"},"destroy"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Destroys this controller. This will remove the softkey menu items bound to this controller's state."),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"garminsdk/softkey/SoftKeyControllers.ts:218"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"init"},"init"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"init"),"(): readonly ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/SoftKeyMenuItem"},(0,a.kt)("inlineCode",{parentName:"a"},"SoftKeyMenuItem")),"[]"),(0,a.kt)("p",null,"Initializes this controller. This will create softkey menu items and bind them to this controller's state."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,a.kt)("p",null,"Error if this controller has been destroyed."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,"readonly ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/SoftKeyMenuItem"},(0,a.kt)("inlineCode",{parentName:"a"},"SoftKeyMenuItem")),"[]"),(0,a.kt)("p",null,"The softkey menu items bound to this controller's state. The order of the items is the same as the order\nof the softkey definitions passed to this controller's constructor."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"garminsdk/softkey/SoftKeyControllers.ts:194"))}u.isMDXComponent=!0}}]);