"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[6736],{3905:(e,t,n)=>{n.d(t,{Zo:()=>o,kt:()=>f});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var m=r.createContext({}),d=function(e){var t=r.useContext(m),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},o=function(e){var t=d(e.components);return r.createElement(m.Provider,{value:t},e.children)},u="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,m=e.parentName,o=s(e,["components","mdxType","originalType","parentName"]),u=d(n),k=a,f=u["".concat(m,".").concat(k)]||u[k]||p[k]||i;return n?r.createElement(f,l(l({ref:t},o),{},{components:n})):r.createElement(f,l({ref:t},o))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=k;var s={};for(var m in t)hasOwnProperty.call(t,m)&&(s[m]=t[m]);s.originalType=e,s[u]="string"==typeof e?e:a,l[1]=s;for(var d=2;d<i;d++)l[d]=n[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}k.displayName="MDXCreateElement"},13324:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>m,contentTitle:()=>l,default:()=>p,frontMatter:()=>i,metadata:()=>s,toc:()=>d});var r=n(87462),a=(n(67294),n(3905));const i={id:"SoftKeyMenuSystem",title:"Class: SoftKeyMenuSystem",sidebar_label:"SoftKeyMenuSystem",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"garminsdk/classes/SoftKeyMenuSystem",id:"garminsdk/classes/SoftKeyMenuSystem",title:"Class: SoftKeyMenuSystem",description:"A system that manages Garmin softkey menus.",source:"@site/docs/garminsdk/classes/SoftKeyMenuSystem.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/SoftKeyMenuSystem",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyMenuSystem",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"SoftKeyMenuSystem",title:"Class: SoftKeyMenuSystem",sidebar_label:"SoftKeyMenuSystem",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"SoftKeyMenu",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyMenu"},next:{title:"SyntheticVision",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/SyntheticVision"}},m={},d=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"currentMenu",id:"currentmenu",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"back",id:"back",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"clear",id:"clear",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"getMenu",id:"getmenu",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"pushMenu",id:"pushmenu",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"registerMenu",id:"registermenu",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"replaceMenu",id:"replacemenu",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-8",level:4}],o={toc:d},u="wrapper";function p(e){let{components:t,...n}=e;return(0,a.kt)(u,(0,r.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A system that manages Garmin softkey menus."),(0,a.kt)("p",null,"Individual softkey menus are registered with the menu system under a unique string name. After a menu is registered,\nit can be pushed onto the system's menu stack. The top-most menu in the stack is considered the current menu. Menu\nnavigation is achieved using operations on the stack:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"push: navigates to a new menu while preserving history."),(0,a.kt)("li",{parentName:"ul"},"replace: navigates to a new menu without preserving history."),(0,a.kt)("li",{parentName:"ul"},"pop: return to the previous menu stored in history."),(0,a.kt)("li",{parentName:"ul"},"clear: removes the current menu and clears all history.")),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new SoftKeyMenuSystem"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"hEventMap"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyMenuSystem"},(0,a.kt)("inlineCode",{parentName:"a"},"SoftKeyMenuSystem"))),(0,a.kt)("p",null,"Creates an instance of SoftKeyMenuSystem."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"bus")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event bus to use with this instance.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"hEventMap")),(0,a.kt)("td",{parentName:"tr",align:"left"},"(",(0,a.kt)("inlineCode",{parentName:"td"},"hEvent"),": ",(0,a.kt)("inlineCode",{parentName:"td"},"string"),") => ",(0,a.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"A function which maps H events to softkey indexes. The function should return the index of the pressed softkey for softkey press H events, and ",(0,a.kt)("inlineCode",{parentName:"td"},"undefined")," for all other H events.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyMenuSystem"},(0,a.kt)("inlineCode",{parentName:"a"},"SoftKeyMenuSystem"))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/softkey/SoftKeyMenuSystem.ts:40"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"bus"},"bus"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"bus"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,a.kt)("p",null,"The event bus to use with this instance."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/softkey/SoftKeyMenuSystem.ts:40"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"currentmenu"},"currentMenu"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"currentMenu"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyMenu"},(0,a.kt)("inlineCode",{parentName:"a"},"SoftKeyMenu")),">"),(0,a.kt)("p",null,"The current menu, or ",(0,a.kt)("inlineCode",{parentName:"p"},"null")," if there is no current menu."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/softkey/SoftKeyMenuSystem.ts:32"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"back"},"back"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"back"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Removes this system's current menu from the menu stack and makes the next highest menu on the stack the new\ncurrent menu."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/softkey/SoftKeyMenuSystem.ts:112"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"clear"},"clear"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"clear"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Clears this system's menu stack of all menus."),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/softkey/SoftKeyMenuSystem.ts:120"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"getmenu"},"getMenu"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"getMenu"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"menuName"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyMenu"},(0,a.kt)("inlineCode",{parentName:"a"},"SoftKeyMenu"))),(0,a.kt)("p",null,"Gets the softkey menu registered under a given name."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"menuName")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The name of the menu.")))),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyMenu"},(0,a.kt)("inlineCode",{parentName:"a"},"SoftKeyMenu"))),(0,a.kt)("p",null,"The softkey menu registered under the specified name, or ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," if there is no such menu."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/softkey/SoftKeyMenuSystem.ts:69"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"pushmenu"},"pushMenu"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"pushMenu"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Pushes a menu onto this system's menu stack. The pushed menu will become the new current menu."),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"name")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The name of the menu to push.")))),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,a.kt)("p",null,"Error if this system has no menu registered under the given name."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/softkey/SoftKeyMenuSystem.ts:78"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"registermenu"},"registerMenu"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"registerMenu"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"name"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"factory"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Registers a softkey menu with this menu system under a given name. If an existing menu is registered under the\nsame name, it will be replaced by the new menu."),(0,a.kt)("h4",{id:"parameters-3"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"name")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The name under which to register the menu.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"factory")),(0,a.kt)("td",{parentName:"tr",align:"left"},"(",(0,a.kt)("inlineCode",{parentName:"td"},"menuSystem"),": ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyMenuSystem"},(0,a.kt)("inlineCode",{parentName:"a"},"SoftKeyMenuSystem")),") => ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/classes/SoftKeyMenu"},(0,a.kt)("inlineCode",{parentName:"a"},"SoftKeyMenu"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"A function which creates the menu to register.")))),(0,a.kt)("h4",{id:"returns-5"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/softkey/SoftKeyMenuSystem.ts:55"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"replacemenu"},"replaceMenu"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"replaceMenu"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Replaces the current menu with another menu. The current menu will be removed from the stack and the replacement\nmenu will become the new current menu."),(0,a.kt)("h4",{id:"parameters-4"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"name")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The name of the replacement menu.")))),(0,a.kt)("h4",{id:"returns-6"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,a.kt)("p",null,"Error if this system has no menu registered under the given name."),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/softkey/SoftKeyMenuSystem.ts:95"))}p.isMDXComponent=!0}}]);