"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[90825],{3905:(e,t,a)=>{a.d(t,{Zo:()=>o,kt:()=>u});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=n.createContext({}),d=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},o=function(e){var t=d(e.components);return n.createElement(s.Provider,{value:t},e.children)},m="mdxType",b={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,o=p(e,["components","mdxType","originalType","parentName"]),m=d(a),k=r,u=m["".concat(s,".").concat(k)]||m[k]||b[k]||i;return a?n.createElement(u,l(l({ref:t},o),{},{components:a})):n.createElement(u,l({ref:t},o))}));function u(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=k;var p={};for(var s in t)hasOwnProperty.call(t,s)&&(p[s]=t[s]);p.originalType=e,p[m]="string"==typeof e?e:r,l[1]=p;for(var d=2;d<i;d++)l[d]=a[d];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}k.displayName="MDXCreateElement"},77961:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>b,frontMatter:()=>i,metadata:()=>p,toc:()=>d});var n=a(87462),r=(a(67294),a(3905));const i={id:"Subscribable",title:"Interface: Subscribable<T>",sidebar_label:"Subscribable",sidebar_position:0,custom_edit_url:null},l=void 0,p={unversionedId:"framework/interfaces/Subscribable",id:"framework/interfaces/Subscribable",title:"Interface: Subscribable<T>",description:"An item which allows others to subscribe to be notified of changes in its state.",source:"@site/docs/framework/interfaces/Subscribable.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/Subscribable",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/Subscribable",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"Subscribable",title:"Interface: Subscribable<T>",sidebar_label:"Subscribable",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"SubEventInterface",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/SubEventInterface"},next:{title:"SubscribableArray",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableArray"}},s={},d=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"isSubscribable",id:"issubscribable",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"get",id:"get",level:3},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"map",id:"map",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"pipe",id:"pipe",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"sub",id:"sub",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"unsub",id:"unsub",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-7",level:4}],o={toc:d},m="wrapper";function b(e){let{components:t,...a}=e;return(0,r.kt)(m,(0,n.Z)({},o,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"An item which allows others to subscribe to be notified of changes in its state."),(0,r.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T"))))),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Accessible"},(0,r.kt)("inlineCode",{parentName:"a"},"Accessible")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Subscribable"))),(0,r.kt)("p",{parentName:"li"},"\u21b3\u21b3 ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MappedSubscribable"},(0,r.kt)("inlineCode",{parentName:"a"},"MappedSubscribable"))),(0,r.kt)("p",{parentName:"li"},"\u21b3\u21b3 ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribable"},(0,r.kt)("inlineCode",{parentName:"a"},"MutableSubscribable"))))),(0,r.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractSubscribable"},(0,r.kt)("inlineCode",{parentName:"a"},"AbstractSubscribable"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractSubscribableMap"},(0,r.kt)("inlineCode",{parentName:"a"},"AbstractSubscribableMap"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractSubscribableSet"},(0,r.kt)("inlineCode",{parentName:"a"},"AbstractSubscribableSet")))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"issubscribable"},"isSubscribable"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"isSubscribable"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("p",null,"Flags this object as a Subscribable."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/sub/Subscribable.ts:9"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"get"},"get"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"get"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"T")),(0,r.kt)("p",null,"Gets this item's state."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"T")),(0,r.kt)("p",null,"This item's state."),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Accessible"},"Accessible"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Accessible#get"},"get")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/sub/Accessible.ts:9"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"map"},"map"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"map"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"fn"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"equalityFunc?"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MappedSubscribable"},(0,r.kt)("inlineCode",{parentName:"a"},"MappedSubscribable")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M"),">"),(0,r.kt)("p",null,"Maps this subscribable to a new subscribable."),(0,r.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"M"))))),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"fn")),(0,r.kt)("td",{parentName:"tr",align:"left"},"(",(0,r.kt)("inlineCode",{parentName:"td"},"input"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"previousVal?"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"M"),") => ",(0,r.kt)("inlineCode",{parentName:"td"},"M")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The function to use to map to the new subscribable.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"equalityFunc?")),(0,r.kt)("td",{parentName:"tr",align:"left"},"(",(0,r.kt)("inlineCode",{parentName:"td"},"a"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"M"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"b"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"M"),") => ",(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The function to use to check for equality between mapped values. Defaults to the strict equality comparison (",(0,r.kt)("inlineCode",{parentName:"td"},"==="),").")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MappedSubscribable"},(0,r.kt)("inlineCode",{parentName:"a"},"MappedSubscribable")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M"),">"),(0,r.kt)("p",null,"The mapped subscribable."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/sub/Subscribable.ts:36"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"map"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"fn"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"equalityFunc"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"mutateFunc"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"initialVal"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MappedSubscribable"},(0,r.kt)("inlineCode",{parentName:"a"},"MappedSubscribable")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M"),">"),(0,r.kt)("p",null,"Maps this subscribable to a new subscribable with a persistent, cached value which is mutated when it changes."),(0,r.kt)("h4",{id:"type-parameters-2"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"M"))))),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"fn")),(0,r.kt)("td",{parentName:"tr",align:"left"},"(",(0,r.kt)("inlineCode",{parentName:"td"},"input"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"previousVal?"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"M"),") => ",(0,r.kt)("inlineCode",{parentName:"td"},"M")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The function to use to map to the new subscribable.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"equalityFunc")),(0,r.kt)("td",{parentName:"tr",align:"left"},"(",(0,r.kt)("inlineCode",{parentName:"td"},"a"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"M"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"b"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"M"),") => ",(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The function to use to check for equality between mapped values.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"mutateFunc")),(0,r.kt)("td",{parentName:"tr",align:"left"},"(",(0,r.kt)("inlineCode",{parentName:"td"},"oldVal"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"M"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"newVal"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"M"),") => ",(0,r.kt)("inlineCode",{parentName:"td"},"void")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The function to use to change the value of the mapped subscribable.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"initialVal")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"M")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The initial value of the mapped subscribable.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MappedSubscribable"},(0,r.kt)("inlineCode",{parentName:"a"},"MappedSubscribable")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M"),">"),(0,r.kt)("p",null,"The mapped subscribable."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/sub/Subscribable.ts:45"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"pipe"},"pipe"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"pipe"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"to"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,r.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,r.kt)("p",null,"Subscribes to and pipes this subscribable's state to a mutable subscribable. Whenever an update of this\nsubscribable's state is received through the subscription, it will be used as an input to change the other\nsubscribable's state."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"to")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribable"},(0,r.kt)("inlineCode",{parentName:"a"},"MutableSubscribable")),"<",(0,r.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The mutable subscribable to which to pipe this subscribable's state.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"paused?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether the new subscription should be initialized as paused. Defaults to ",(0,r.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,r.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,r.kt)("p",null,"The new subscription."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/sub/Subscribable.ts:60"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"pipe"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"M"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"to"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"map"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,r.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,r.kt)("p",null,"Subscribes to this subscribable's state and pipes a mapped version to a mutable subscribable. Whenever an update\nof this subscribable's state is received through the subscription, it will be transformed by the specified mapping\nfunction, and the transformed state will be used as an input to change the other subscribable's state."),(0,r.kt)("h4",{id:"type-parameters-3"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"M"))))),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"to")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribable"},(0,r.kt)("inlineCode",{parentName:"a"},"MutableSubscribable")),"<",(0,r.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"M"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The mutable subscribable to which to pipe this subscribable's mapped state.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"map")),(0,r.kt)("td",{parentName:"tr",align:"left"},"(",(0,r.kt)("inlineCode",{parentName:"td"},"fromVal"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"toVal"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"M"),") => ",(0,r.kt)("inlineCode",{parentName:"td"},"M")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The function to use to transform inputs.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"paused?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether the new subscription should be initialized as paused. Defaults to ",(0,r.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,r.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,r.kt)("p",null,"The new subscription."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/sub/Subscribable.ts:70"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"sub"},"sub"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"sub"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"handler"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"initialNotify?"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,r.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,r.kt)("p",null,"Subscribes to changes in this subscribable's state."),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"handler")),(0,r.kt)("td",{parentName:"tr",align:"left"},"(",(0,r.kt)("inlineCode",{parentName:"td"},"value"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),") => ",(0,r.kt)("inlineCode",{parentName:"td"},"void")),(0,r.kt)("td",{parentName:"tr",align:"left"},"A function which is called when this subscribable's state changes.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"initialNotify?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether to immediately invoke the callback function with this subscribable's current state. Defaults to ",(0,r.kt)("inlineCode",{parentName:"td"},"false"),". This argument is ignored if the subscription is initialized as paused.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"paused?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether the new subscription should be initialized as paused. Defaults to ",(0,r.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,r.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,r.kt)("p",null,"The new subscription."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/sdk/sub/Subscribable.ts:19"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"unsub"},"unsub"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"unsub"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"handler"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Unsubscribes a callback function from this subscribable."),(0,r.kt)("h4",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"handler")),(0,r.kt)("td",{parentName:"tr",align:"left"},"(",(0,r.kt)("inlineCode",{parentName:"td"},"value"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),") => ",(0,r.kt)("inlineCode",{parentName:"td"},"void")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The function to unsubscribe.")))),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Deprecated"))),(0,r.kt)("p",null,"This method has been deprecated in favor of using the ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},"Subscription")," object returned by ",(0,r.kt)("inlineCode",{parentName:"p"},".sub()"),"\nto manage subscriptions."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/sdk/sub/Subscribable.ts:27"))}b.isMDXComponent=!0}}]);