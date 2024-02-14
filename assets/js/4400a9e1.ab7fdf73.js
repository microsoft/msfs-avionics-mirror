"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[72485],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>k});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},s=Object.keys(e);for(i=0;i<s.length;i++)n=s[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(i=0;i<s.length;i++)n=s[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=i.createContext({}),d=function(e){var t=i.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},m=function(e){var t=d(e.components);return i.createElement(l.Provider,{value:t},e.children)},p="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,s=e.originalType,l=e.parentName,m=a(e,["components","mdxType","originalType","parentName"]),p=d(n),u=r,k=p["".concat(l,".").concat(u)]||p[u]||c[u]||s;return n?i.createElement(k,o(o({ref:t},m),{},{components:n})):i.createElement(k,o({ref:t},m))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var s=n.length,o=new Array(s);o[0]=u;var a={};for(var l in t)hasOwnProperty.call(t,l)&&(a[l]=t[l]);a.originalType=e,a[p]="string"==typeof e?e:r,o[1]=a;for(var d=2;d<s;d++)o[d]=n[d];return i.createElement.apply(null,o)}return i.createElement.apply(null,n)}u.displayName="MDXCreateElement"},3215:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>c,frontMatter:()=>s,metadata:()=>a,toc:()=>d});var i=n(87462),r=(n(67294),n(3905));const s={id:"FmsPositionSystemSelector",title:"Class: FmsPositionSystemSelector",sidebar_label:"FmsPositionSystemSelector",sidebar_position:0,custom_edit_url:null},o=void 0,a={unversionedId:"garminsdk/classes/FmsPositionSystemSelector",id:"garminsdk/classes/FmsPositionSystemSelector",title:"Class: FmsPositionSystemSelector",description:"Automatically selects the best FMS geo-positioning system from a set of candidates based on the accuracy of their",source:"@site/docs/garminsdk/classes/FmsPositionSystemSelector.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/FmsPositionSystemSelector",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/FmsPositionSystemSelector",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FmsPositionSystemSelector",title:"Class: FmsPositionSystemSelector",sidebar_label:"FmsPositionSystemSelector",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FmsPositionSystem",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/FmsPositionSystem"},next:{title:"FmsUtils",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/FmsUtils"}},l={},d=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"selectedFmsPosMode",id:"selectedfmsposmode",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"selectedIndex",id:"selectedindex",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"init",id:"init",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-4",level:4}],m={toc:d},p="wrapper";function c(e){let{components:t,...n}=e;return(0,r.kt)(p,(0,i.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Automatically selects the best FMS geo-positioning system from a set of candidates based on the accuracy of their\nprovided positioning data."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new FmsPositionSystemSelector"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"enabledSystemIndexes"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"preferredSystemIndex?"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/FmsPositionSystemSelector"},(0,r.kt)("inlineCode",{parentName:"a"},"FmsPositionSystemSelector"))),(0,r.kt)("p",null,"Constructor."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"enabledSystemIndexes")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Iterable"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"number"),">"," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"SubscribableSet"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"number"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The indexes of the FMS geo-positioning systems from which to select.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"preferredSystemIndex?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"number"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The index of this selector's preferred system, or ",(0,r.kt)("inlineCode",{parentName:"td"},"-1")," if there is no such system This selector is guaranteed to select the preferred system if its state is at least as desirable as the state of all other systems from which to select.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/FmsPositionSystemSelector"},(0,r.kt)("inlineCode",{parentName:"a"},"FmsPositionSystemSelector"))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/navigation/FmsPositionSystemSelector.ts:47"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"selectedfmsposmode"},"selectedFmsPosMode"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"selectedFmsPosMode"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/enums/FmsPositionMode"},(0,r.kt)("inlineCode",{parentName:"a"},"FmsPositionMode")),">"),(0,r.kt)("p",null,"The positioning mode of the selected FMS geo-positioning system."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/navigation/FmsPositionSystemSelector.ts:28"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"selectedindex"},"selectedIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"selectedIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("p",null,"The index of the selected FMS geo-positioning system, or ",(0,r.kt)("inlineCode",{parentName:"p"},"-1")," if no system could be selected."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/navigation/FmsPositionSystemSelector.ts:24"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"destroy"},"destroy"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Destroys this manager."),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/navigation/FmsPositionSystemSelector.ts:144"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"init"},"init"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"init"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Initializes this selector. Once initialized, this selector will automatically select the FMS geo-positioning system\nthat currently provides the most accurate position data."),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if this selector has been destroyed."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/navigation/FmsPositionSystemSelector.ts:71"))}c.isMDXComponent=!0}}]);