"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[2372],{3905:function(e,t,a){a.d(t,{Zo:function(){return o},kt:function(){return u}});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=n.createContext({}),d=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},o=function(e){var t=d(e.components);return n.createElement(s.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},b=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,o=p(e,["components","mdxType","originalType","parentName"]),b=d(a),u=r,k=b["".concat(s,".").concat(u)]||b[u]||m[u]||i;return a?n.createElement(k,l(l({ref:t},o),{},{components:a})):n.createElement(k,l({ref:t},o))}));function u(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=b;var p={};for(var s in t)hasOwnProperty.call(t,s)&&(p[s]=t[s]);p.originalType=e,p.mdxType="string"==typeof e?e:r,l[1]=p;for(var d=2;d<i;d++)l[d]=a[d];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}b.displayName="MDXCreateElement"},4154:function(e,t,a){a.r(t),a.d(t,{assets:function(){return o},contentTitle:function(){return s},default:function(){return u},frontMatter:function(){return p},metadata:function(){return d},toc:function(){return m}});var n=a(7462),r=a(3366),i=(a(7294),a(3905)),l=["components"],p={id:"Subscribable",title:"Interface: Subscribable<T>",sidebar_label:"Subscribable",sidebar_position:0,custom_edit_url:null},s=void 0,d={unversionedId:"framework/interfaces/Subscribable",id:"version-0.2.0/framework/interfaces/Subscribable",title:"Interface: Subscribable<T>",description:"An item which allows others to subscribe to be notified of changes in its state.",source:"@site/versioned_docs/version-0.2.0/framework/interfaces/Subscribable.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/Subscribable",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/Subscribable",draft:!1,editUrl:null,tags:[],version:"0.2.0",sidebarPosition:0,frontMatter:{id:"Subscribable",title:"Interface: Subscribable<T>",sidebar_label:"Subscribable",sidebar_position:0,custom_edit_url:null},sidebar:"docsSidebar",previous:{title:"NumberUnitInterface",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/NumberUnitInterface"},next:{title:"SubscribableArray",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableArray"}},o={},m=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"isSubscribable",id:"issubscribable",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"get",id:"get",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"map",id:"map",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"pipe",id:"pipe",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"sub",id:"sub",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"unsub",id:"unsub",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-7",level:4}],b={toc:m};function u(e){var t=e.components,a=(0,r.Z)(e,l);return(0,i.kt)("wrapper",(0,n.Z)({},b,a,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"An item which allows others to subscribe to be notified of changes in its state."),(0,i.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"T"))))),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Subscribable"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MappedSubscribable"},(0,i.kt)("inlineCode",{parentName:"a"},"MappedSubscribable"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribable"},(0,i.kt)("inlineCode",{parentName:"a"},"MutableSubscribable"))))),(0,i.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractSubscribable"},(0,i.kt)("inlineCode",{parentName:"a"},"AbstractSubscribable"))),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/classes/AbstractSubscribableSet"},(0,i.kt)("inlineCode",{parentName:"a"},"AbstractSubscribableSet")))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"issubscribable"},"isSubscribable"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"isSubscribable"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"true")),(0,i.kt)("p",null,"Flags this object as a Subscribable."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/sub/Subscribable.ts:8"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"get"},"get"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"get"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"T")),(0,i.kt)("p",null,"Gets the state of this subscribable."),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"T")),(0,i.kt)("p",null,"the state of this subscribable."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/sub/Subscribable.ts:14"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"map"},"map"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"map"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"M"),">","(",(0,i.kt)("inlineCode",{parentName:"p"},"fn"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"equalityFunc?"),"): ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MappedSubscribable"},(0,i.kt)("inlineCode",{parentName:"a"},"MappedSubscribable")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"M"),">"),(0,i.kt)("p",null,"Maps this subscribable to a new subscribable."),(0,i.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"M"))))),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"fn")),(0,i.kt)("td",{parentName:"tr",align:"left"},"(",(0,i.kt)("inlineCode",{parentName:"td"},"input"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"T"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"previousVal?"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"M"),") => ",(0,i.kt)("inlineCode",{parentName:"td"},"M")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The function to use to map to the new subscribable.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"equalityFunc?")),(0,i.kt)("td",{parentName:"tr",align:"left"},"(",(0,i.kt)("inlineCode",{parentName:"td"},"a"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"M"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"b"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"M"),") => ",(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The function to use to check for equality between mapped values. Defaults to the strict equality comparison (",(0,i.kt)("inlineCode",{parentName:"td"},"==="),").")))),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MappedSubscribable"},(0,i.kt)("inlineCode",{parentName:"a"},"MappedSubscribable")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"M"),">"),(0,i.kt)("p",null,"The mapped subscribable."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/sub/Subscribable.ts:41"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"map"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"M"),">","(",(0,i.kt)("inlineCode",{parentName:"p"},"fn"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"equalityFunc"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"mutateFunc"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"initialVal"),"): ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MappedSubscribable"},(0,i.kt)("inlineCode",{parentName:"a"},"MappedSubscribable")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"M"),">"),(0,i.kt)("p",null,"Maps this subscribable to a new subscribable with a persistent, cached value which is mutated when it changes."),(0,i.kt)("h4",{id:"type-parameters-2"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"M"))))),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"fn")),(0,i.kt)("td",{parentName:"tr",align:"left"},"(",(0,i.kt)("inlineCode",{parentName:"td"},"input"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"T"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"previousVal?"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"M"),") => ",(0,i.kt)("inlineCode",{parentName:"td"},"M")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The function to use to map to the new subscribable.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"equalityFunc")),(0,i.kt)("td",{parentName:"tr",align:"left"},"(",(0,i.kt)("inlineCode",{parentName:"td"},"a"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"M"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"b"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"M"),") => ",(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The function to use to check for equality between mapped values.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"mutateFunc")),(0,i.kt)("td",{parentName:"tr",align:"left"},"(",(0,i.kt)("inlineCode",{parentName:"td"},"oldVal"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"M"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"newVal"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"M"),") => ",(0,i.kt)("inlineCode",{parentName:"td"},"void")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The function to use to change the value of the mapped subscribable.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"initialVal")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"M")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The initial value of the mapped subscribable.")))),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MappedSubscribable"},(0,i.kt)("inlineCode",{parentName:"a"},"MappedSubscribable")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"M"),">"),(0,i.kt)("p",null,"The mapped subscribable."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/sub/Subscribable.ts:50"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"pipe"},"pipe"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"pipe"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"to"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,i.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,i.kt)("p",null,"Subscribes to and pipes this subscribable's state to a mutable subscribable. Whenever an update of this\nsubscribable's state is received through the subscription, it will be used as an input to change the other\nsubscribable's state."),(0,i.kt)("h4",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"to")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribable"},(0,i.kt)("inlineCode",{parentName:"a"},"MutableSubscribable")),"<",(0,i.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"T"),">"),(0,i.kt)("td",{parentName:"tr",align:"left"},"The mutable subscribable to which to pipe this subscribable's state.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"paused?")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether the new subscription should be initialized as paused. Defaults to ",(0,i.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,i.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,i.kt)("p",null,"The new subscription."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/sdk/sub/Subscribable.ts:65"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"pipe"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"M"),">","(",(0,i.kt)("inlineCode",{parentName:"p"},"to"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"map"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,i.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,i.kt)("p",null,"Subscribes to this subscribable's state and pipes a mapped version to a mutable subscribable. Whenever an update\nof this subscribable's state is received through the subscription, it will be transformed by the specified mapping\nfunction, and the transformed state will be used as an input to change the other subscribable's state."),(0,i.kt)("h4",{id:"type-parameters-3"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"M"))))),(0,i.kt)("h4",{id:"parameters-3"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"to")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribable"},(0,i.kt)("inlineCode",{parentName:"a"},"MutableSubscribable")),"<",(0,i.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"M"),">"),(0,i.kt)("td",{parentName:"tr",align:"left"},"The mutable subscribable to which to pipe this subscribable's mapped state.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"map")),(0,i.kt)("td",{parentName:"tr",align:"left"},"(",(0,i.kt)("inlineCode",{parentName:"td"},"input"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"T"),") => ",(0,i.kt)("inlineCode",{parentName:"td"},"M")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The function to use to transform inputs.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"paused?")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether the new subscription should be initialized as paused. Defaults to ",(0,i.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,i.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,i.kt)("p",null,"The new subscription."),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/sdk/sub/Subscribable.ts:75"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"sub"},"sub"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"sub"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"handler"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"initialNotify?"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,i.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,i.kt)("p",null,"Subscribes to changes in this subscribable's state."),(0,i.kt)("h4",{id:"parameters-4"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"handler")),(0,i.kt)("td",{parentName:"tr",align:"left"},"(",(0,i.kt)("inlineCode",{parentName:"td"},"value"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"T"),") => ",(0,i.kt)("inlineCode",{parentName:"td"},"void")),(0,i.kt)("td",{parentName:"tr",align:"left"},"A function which is called when this subscribable's state changes.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"initialNotify?")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether to immediately invoke the callback function with this subscribable's current state. Defaults to ",(0,i.kt)("inlineCode",{parentName:"td"},"false"),". This argument is ignored if the subscription is initialized as paused.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"paused?")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether the new subscription should be initialized as paused. Defaults to ",(0,i.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,i.kt)("h4",{id:"returns-5"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,i.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,i.kt)("p",null,"The new subscription."),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/sdk/sub/Subscribable.ts:24"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"unsub"},"unsub"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"unsub"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"handler"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Unsubscribes a callback function from this subscribable."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"deprecated"))," This method has been deprecated in favor of using the ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},"Subscription")," object returned by ",(0,i.kt)("inlineCode",{parentName:"p"},".sub()"),"\nto manage subscriptions."),(0,i.kt)("h4",{id:"parameters-5"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"handler")),(0,i.kt)("td",{parentName:"tr",align:"left"},"(",(0,i.kt)("inlineCode",{parentName:"td"},"value"),": ",(0,i.kt)("inlineCode",{parentName:"td"},"T"),") => ",(0,i.kt)("inlineCode",{parentName:"td"},"void")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The function to unsubscribe.")))),(0,i.kt)("h4",{id:"returns-6"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/sdk/sub/Subscribable.ts:32"))}u.isMDXComponent=!0}}]);