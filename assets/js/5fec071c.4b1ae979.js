"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[44958],{3905:(e,t,a)=>{a.d(t,{Zo:()=>o,kt:()=>u});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var d=r.createContext({}),p=function(e){var t=r.useContext(d),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},o=function(e){var t=p(e.components);return r.createElement(d.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},b=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,d=e.parentName,o=s(e,["components","mdxType","originalType","parentName"]),m=p(a),b=n,u=m["".concat(d,".").concat(b)]||m[b]||k[b]||i;return a?r.createElement(u,l(l({ref:t},o),{},{components:a})):r.createElement(u,l({ref:t},o))}));function u(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,l=new Array(i);l[0]=b;var s={};for(var d in t)hasOwnProperty.call(t,d)&&(s[d]=t[d]);s.originalType=e,s[m]="string"==typeof e?e:n,l[1]=s;for(var p=2;p<i;p++)l[p]=a[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}b.displayName="MDXCreateElement"},71745:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>k,frontMatter:()=>i,metadata:()=>s,toc:()=>p});var r=a(87462),n=(a(67294),a(3905));const i={id:"MutableSubscribableSet",title:"Interface: MutableSubscribableSet<T>",sidebar_label:"MutableSubscribableSet",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"framework/interfaces/MutableSubscribableSet",id:"framework/interfaces/MutableSubscribableSet",title:"Interface: MutableSubscribableSet<T>",description:"A subscribable set which can accept inputs to add or remove keys.",source:"@site/docs/framework/interfaces/MutableSubscribableSet.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/MutableSubscribableSet",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribableSet",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MutableSubscribableSet",title:"Interface: MutableSubscribableSet<T>",sidebar_label:"MutableSubscribableSet",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MutableSubscribableMap",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribableMap"},next:{title:"NavAngleUnit",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/NavAngleUnit"}},d={},p=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"isMutableSubscribableSet",id:"ismutablesubscribableset",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"isSubscribableSet",id:"issubscribableset",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"size",id:"size",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"add",id:"add",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"clear",id:"clear",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"delete",id:"delete",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"get",id:"get",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"has",id:"has",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"pipe",id:"pipe",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"sub",id:"sub",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"toggle",id:"toggle",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"Parameters",id:"parameters-7",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-12",level:4}],o={toc:p},m="wrapper";function k(e){let{components:t,...a}=e;return(0,n.kt)(m,(0,r.Z)({},o,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A subscribable set which can accept inputs to add or remove keys."),(0,n.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T"))))),(0,n.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet"},(0,n.kt)("inlineCode",{parentName:"a"},"SubscribableSet")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,n.kt)("p",{parentName:"li"},"\u21b3 ",(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"MutableSubscribableSet"))))),(0,n.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/classes/SetSubject"},(0,n.kt)("inlineCode",{parentName:"a"},"SetSubject")))),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"ismutablesubscribableset"},"isMutableSubscribableSet"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"isMutableSubscribableSet"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"true")),(0,n.kt)("p",null,"Flags this object as a MutableSubscribableSet."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/sub/SubscribableSet.ts:79"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"issubscribableset"},"isSubscribableSet"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"isSubscribableSet"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"true")),(0,n.kt)("p",null,"Flags this object as a SubscribableSet."),(0,n.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet"},"SubscribableSet"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet#issubscribableset"},"isSubscribableSet")),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/sub/SubscribableSet.ts:24"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"size"},"size"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"size"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"The number of elements contained in this set."),(0,n.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet"},"SubscribableSet"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet#size"},"size")),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/sub/SubscribableSet.ts:27"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"add"},"add"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"add"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"key"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribableSet"},(0,n.kt)("inlineCode",{parentName:"a"},"MutableSubscribableSet")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,n.kt)("p",null,"Adds a key to this set."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"key")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The key to add.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribableSet"},(0,n.kt)("inlineCode",{parentName:"a"},"MutableSubscribableSet")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,n.kt)("p",null,"This set, after the key has been added."),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/sdk/sub/SubscribableSet.ts:86"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"clear"},"clear"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"clear"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Removes all keys from this set."),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,n.kt)("p",null,"src/sdk/sub/SubscribableSet.ts:114"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"delete"},"delete"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"delete"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"key"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Removes a key from this set."),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"key")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The key to remove.")))),(0,n.kt)("h4",{id:"returns-2"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Whether the key was removed."),(0,n.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,n.kt)("p",null,"src/sdk/sub/SubscribableSet.ts:93"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"get"},"get"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"get"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"ReadonlySet"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,n.kt)("p",null,"Gets a read-only version of this set."),(0,n.kt)("h4",{id:"returns-3"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"ReadonlySet"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,n.kt)("p",null,"A read-only version of this set."),(0,n.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet"},"SubscribableSet"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet#get"},"get")),(0,n.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,n.kt)("p",null,"src/sdk/sub/SubscribableSet.ts:33"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"has"},"has"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"has"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"key"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Checks whether this set contains a key."),(0,n.kt)("h4",{id:"parameters-2"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"key")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The key to check.")))),(0,n.kt)("h4",{id:"returns-4"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Whether this set contains the specified key."),(0,n.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet"},"SubscribableSet"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet#has"},"has")),(0,n.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,n.kt)("p",null,"src/sdk/sub/SubscribableSet.ts:40"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"pipe"},"pipe"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"pipe"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"to"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,n.kt)("p",null,"Subscribes to and pipes this set's state to a mutable subscribable set. Whenever a key added or removed event is\nreceived through the subscription, the same key will be added to or removed from the other set."),(0,n.kt)("h4",{id:"parameters-3"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"to")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribableSet"},(0,n.kt)("inlineCode",{parentName:"a"},"MutableSubscribableSet")),"<",(0,n.kt)("inlineCode",{parentName:"td"},"T"),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The mutable subscribable set to which to pipe this set's state.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"paused?")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether the new subscription should be initialized as paused. Defaults to ",(0,n.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,n.kt)("h4",{id:"returns-5"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,n.kt)("p",null,"The new subscription."),(0,n.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet"},"SubscribableSet"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet#pipe"},"pipe")),(0,n.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,n.kt)("p",null,"src/sdk/sub/SubscribableSet.ts:59"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"pipe"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"M"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"to"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"map"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,n.kt)("p",null,"Subscribes to this set's state and pipes a mapped version to a mutable subscribable set. Whenever a key added\nevent is received through the subscription, the key will be transformed by the specified mapping\nfunction, and the transformed key will be added to the other set. Whenever a key removed event is received, the\ntransformed key is removed from the other set if and only if no remaining key in this set maps to the same\ntransformed key."),(0,n.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"M"))))),(0,n.kt)("h4",{id:"parameters-4"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"to")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribableSet"},(0,n.kt)("inlineCode",{parentName:"a"},"MutableSubscribableSet")),"<",(0,n.kt)("inlineCode",{parentName:"td"},"M"),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The mutable subscribable to which to pipe this set's mapped state.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"map")),(0,n.kt)("td",{parentName:"tr",align:"left"},"(",(0,n.kt)("inlineCode",{parentName:"td"},"input"),": ",(0,n.kt)("inlineCode",{parentName:"td"},"T"),") => ",(0,n.kt)("inlineCode",{parentName:"td"},"M")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The function to use to transform keys.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"paused?")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether the new subscription should be initialized as paused. Defaults to ",(0,n.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,n.kt)("h4",{id:"returns-6"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,n.kt)("p",null,"The new subscription."),(0,n.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet"},"SubscribableSet"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet#pipe"},"pipe")),(0,n.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,n.kt)("p",null,"src/sdk/sub/SubscribableSet.ts:71"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"sub"},"sub"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"sub"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"handler"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"initialNotify?"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,n.kt)("p",null,"Subscribes to changes in this set's state."),(0,n.kt)("h4",{id:"parameters-5"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"handler")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#subscribablesethandler"},(0,n.kt)("inlineCode",{parentName:"a"},"SubscribableSetHandler")),"<",(0,n.kt)("inlineCode",{parentName:"td"},"T"),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A function which is called when this set's state changes.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"initialNotify?")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether to immediately invoke the callback function with this set's current state. Defaults to ",(0,n.kt)("inlineCode",{parentName:"td"},"false"),". This argument is ignored if the subscription is initialized as paused.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"paused?")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether the new subscription should be initialized as paused. Defaults to ",(0,n.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,n.kt)("h4",{id:"returns-7"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,n.kt)("p",null,"The new subscription."),(0,n.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet"},"SubscribableSet"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet#sub"},"sub")),(0,n.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,n.kt)("p",null,"src/sdk/sub/SubscribableSet.ts:50"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"toggle"},"toggle"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"toggle"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"key"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Toggles the presence of a key in this set."),(0,n.kt)("h4",{id:"parameters-6"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"key")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The key to toggle.")))),(0,n.kt)("h4",{id:"returns-8"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Whether the key is present in this set after the toggle operation."),(0,n.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,n.kt)("p",null,"src/sdk/sub/SubscribableSet.ts:101"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"toggle"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"key"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"force"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Toggles the presence of a key in this set."),(0,n.kt)("h4",{id:"parameters-7"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"key")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The key to toggle.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"force")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The state of the key to force. If ",(0,n.kt)("inlineCode",{parentName:"td"},"true"),", the key will be added to this set. If ",(0,n.kt)("inlineCode",{parentName:"td"},"false"),", the key will be removed from this set.")))),(0,n.kt)("h4",{id:"returns-9"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Whether the key is present in this set after the toggle operation."),(0,n.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,n.kt)("p",null,"src/sdk/sub/SubscribableSet.ts:109"))}k.isMDXComponent=!0}}]);