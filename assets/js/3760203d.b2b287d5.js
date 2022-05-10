"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[432],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return f}});var i=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},s=Object.keys(e);for(i=0;i<s.length;i++)n=s[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(i=0;i<s.length;i++)n=s[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=i.createContext({}),u=function(e){var t=i.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=u(e.components);return i.createElement(l.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},c=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,s=e.originalType,l=e.parentName,p=a(e,["components","mdxType","originalType","parentName"]),c=u(n),f=r,m=c["".concat(l,".").concat(f)]||c[f]||d[f]||s;return n?i.createElement(m,o(o({ref:t},p),{},{components:n})):i.createElement(m,o({ref:t},p))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var s=n.length,o=new Array(s);o[0]=c;var a={};for(var l in t)hasOwnProperty.call(t,l)&&(a[l]=t[l]);a.originalType=e,a.mdxType="string"==typeof e?e:r,o[1]=a;for(var u=2;u<s;u++)o[u]=n[u];return i.createElement.apply(null,o)}return i.createElement.apply(null,n)}c.displayName="MDXCreateElement"},2947:function(e,t,n){n.r(t),n.d(t,{assets:function(){return p},contentTitle:function(){return l},default:function(){return f},frontMatter:function(){return a},metadata:function(){return u},toc:function(){return d}});var i=n(7462),r=n(3366),s=(n(7294),n(3905)),o=["components"],a={id:"Subscription",title:"Interface: Subscription",sidebar_label:"Subscription",sidebar_position:0,custom_edit_url:null},l=void 0,u={unversionedId:"framework/interfaces/Subscription",id:"version-0.2.0/framework/interfaces/Subscription",title:"Interface: Subscription",description:"A subscription to a source of notifications.",source:"@site/versioned_docs/version-0.2.0/framework/interfaces/Subscription.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/Subscription",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/Subscription",draft:!1,editUrl:null,tags:[],version:"0.2.0",sidebarPosition:0,frontMatter:{id:"Subscription",title:"Interface: Subscription",sidebar_label:"Subscription",sidebar_position:0,custom_edit_url:null},sidebar:"docsSidebar",previous:{title:"SubscribableSet",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet"},next:{title:"Unit",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/Unit"}},p={},d=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"canInitialNotify",id:"caninitialnotify",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"isAlive",id:"isalive",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"isPaused",id:"ispaused",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"pause",id:"pause",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"resume",id:"resume",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-5",level:4}],c={toc:d};function f(e){var t=e.components,n=(0,r.Z)(e,o);return(0,s.kt)("wrapper",(0,i.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("p",null,"A subscription to a source of notifications."),(0,s.kt)("p",null,"Subscriptions can be freely paused and resumed. Paused subscriptions do not receive notifications from its source."),(0,s.kt)("p",null,"Subscriptions that have reached the end of their useful life can be destroyed, after which they will no longer\nreceive notifications and cannot be paused or resumed."),(0,s.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/classes/HandlerSubscription"},(0,s.kt)("inlineCode",{parentName:"a"},"HandlerSubscription")))),(0,s.kt)("h2",{id:"properties"},"Properties"),(0,s.kt)("h3",{id:"caninitialnotify"},"canInitialNotify"),(0,s.kt)("p",null,"\u2022 ",(0,s.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,s.kt)("strong",{parentName:"p"},"canInitialNotify"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"boolean")),(0,s.kt)("p",null,"Whether this subscription supports initial notifications on resume."),(0,s.kt)("h4",{id:"defined-in"},"Defined in"),(0,s.kt)("p",null,"src/sdk/sub/Subscription.ts:25"),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"isalive"},"isAlive"),(0,s.kt)("p",null,"\u2022 ",(0,s.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,s.kt)("strong",{parentName:"p"},"isAlive"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"boolean")),(0,s.kt)("p",null,"Whether this subscription is alive. Live subscriptions can be freely paused and resumed. Dead subscriptions no\nlonger receive notifications from their sources and will throw an error when attempting to pause or resume them."),(0,s.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,s.kt)("p",null,"src/sdk/sub/Subscription.ts:14"),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"ispaused"},"isPaused"),(0,s.kt)("p",null,"\u2022 ",(0,s.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,s.kt)("strong",{parentName:"p"},"isPaused"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"boolean")),(0,s.kt)("p",null,"Whether this subscription is paused. Paused subscriptions do not receive notifications from their sources until\nthey are resumed."),(0,s.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,s.kt)("p",null,"src/sdk/sub/Subscription.ts:20"),(0,s.kt)("h2",{id:"methods"},"Methods"),(0,s.kt)("h3",{id:"destroy"},"destroy"),(0,s.kt)("p",null,"\u25b8 ",(0,s.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,s.kt)("inlineCode",{parentName:"p"},"void")),(0,s.kt)("p",null,"Destroys this subscription. Once destroyed, this subscription will no longer receive notifications from its\nsource and will throw an error when attempting to pause or resume it."),(0,s.kt)("h4",{id:"returns"},"Returns"),(0,s.kt)("p",null,(0,s.kt)("inlineCode",{parentName:"p"},"void")),(0,s.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,s.kt)("p",null,"src/sdk/sub/Subscription.ts:46"),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"pause"},"pause"),(0,s.kt)("p",null,"\u25b8 ",(0,s.kt)("strong",{parentName:"p"},"pause"),"(): ",(0,s.kt)("inlineCode",{parentName:"p"},"void")),(0,s.kt)("p",null,"Pauses this subscription. Once paused, this subscription will not receive notifications from its source until it\nis resumed."),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},(0,s.kt)("inlineCode",{parentName:"strong"},"throws"))," Error if this subscription is not alive."),(0,s.kt)("h4",{id:"returns-1"},"Returns"),(0,s.kt)("p",null,(0,s.kt)("inlineCode",{parentName:"p"},"void")),(0,s.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,s.kt)("p",null,"src/sdk/sub/Subscription.ts:32"),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"resume"},"resume"),(0,s.kt)("p",null,"\u25b8 ",(0,s.kt)("strong",{parentName:"p"},"resume"),"(",(0,s.kt)("inlineCode",{parentName:"p"},"initialNotify?"),"): ",(0,s.kt)("inlineCode",{parentName:"p"},"void")),(0,s.kt)("p",null,"Resumes this subscription. Once resumed, this subscription will receive notifications from its source."),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},(0,s.kt)("inlineCode",{parentName:"strong"},"throws"))," Error if this subscription is not alive."),(0,s.kt)("h4",{id:"parameters"},"Parameters"),(0,s.kt)("table",null,(0,s.kt)("thead",{parentName:"table"},(0,s.kt)("tr",{parentName:"thead"},(0,s.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,s.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,s.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,s.kt)("tbody",{parentName:"table"},(0,s.kt)("tr",{parentName:"tbody"},(0,s.kt)("td",{parentName:"tr",align:"left"},(0,s.kt)("inlineCode",{parentName:"td"},"initialNotify?")),(0,s.kt)("td",{parentName:"tr",align:"left"},(0,s.kt)("inlineCode",{parentName:"td"},"boolean")),(0,s.kt)("td",{parentName:"tr",align:"left"},"Whether to immediately send a notification to this subscription's handler when it is resumed if this subscription supports initial notifications. Defaults to ",(0,s.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,s.kt)("h4",{id:"returns-2"},"Returns"),(0,s.kt)("p",null,(0,s.kt)("inlineCode",{parentName:"p"},"void")),(0,s.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,s.kt)("p",null,"src/sdk/sub/Subscription.ts:40"))}f.isMDXComponent=!0}}]);