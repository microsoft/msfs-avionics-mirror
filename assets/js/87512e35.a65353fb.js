"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[63447],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>c});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var o=a.createContext({}),d=function(e){var t=a.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=d(e.components);return a.createElement(o.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},f=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,o=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),m=d(r),f=n,c=m["".concat(o,".").concat(f)]||m[f]||k[f]||i;return r?a.createElement(c,l(l({ref:t},p),{},{components:r})):a.createElement(c,l({ref:t},p))}));function c(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,l=new Array(i);l[0]=f;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s[m]="string"==typeof e?e:n,l[1]=s;for(var d=2;d<i;d++)l[d]=r[d];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}f.displayName="MDXCreateElement"},98316:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>k,frontMatter:()=>i,metadata:()=>s,toc:()=>d});var a=r(87462),n=(r(67294),r(3905));const i={id:"MapSystemTrafficLayer",title:"Class: MapSystemTrafficLayer",sidebar_label:"MapSystemTrafficLayer",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"framework/classes/MapSystemTrafficLayer",id:"framework/classes/MapSystemTrafficLayer",title:"Class: MapSystemTrafficLayer",description:"A map layer which displays traffic intruders.",source:"@site/docs/framework/classes/MapSystemTrafficLayer.md",sourceDirName:"framework/classes",slug:"/framework/classes/MapSystemTrafficLayer",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapSystemTrafficLayer",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapSystemTrafficLayer",title:"Class: MapSystemTrafficLayer",sidebar_label:"MapSystemTrafficLayer",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapSystemPlanRenderer",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapSystemPlanRenderer"},next:{title:"MapSystemUtils",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapSystemUtils"}},o={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"contextType",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"getContext",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"isVisible",id:"isvisible",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"onAfterRender",id:"onafterrender",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"onAttached",id:"onattached",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"onBeforeRender",id:"onbeforerender",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"onDetached",id:"ondetached",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"onMapProjectionChanged",id:"onmapprojectionchanged",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"onSleep",id:"onsleep",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"onUpdated",id:"onupdated",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"onVisibilityChanged",id:"onvisibilitychanged",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-10",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"onWake",id:"onwake",level:3},{value:"Returns",id:"returns-11",level:4},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"render",id:"render",level:3},{value:"Returns",id:"returns-12",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"setVisible",id:"setvisible",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-13",level:4},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-17",level:4}],p={toc:d},m="wrapper";function k(e){let{components:t,...r}=e;return(0,n.kt)(m,(0,a.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A map layer which displays traffic intruders."),(0,n.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},(0,n.kt)("inlineCode",{parentName:"a"},"MapLayer")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapSystemTrafficLayerProps"},(0,n.kt)("inlineCode",{parentName:"a"},"MapSystemTrafficLayerProps")),">"),(0,n.kt)("p",{parentName:"li"},"\u21b3 ",(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"MapSystemTrafficLayer"))))),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new MapSystemTrafficLayer"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"props"),")"),(0,n.kt)("p",null,"Creates an instance of a DisplayComponent."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"props")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapSystemTrafficLayerProps"},(0,n.kt)("inlineCode",{parentName:"a"},"MapSystemTrafficLayerProps"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The propertis of the component.")))),(0,n.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#constructor"},"constructor")),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/FSComponent.ts:73"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"context"},"context"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,n.kt)("strong",{parentName:"p"},"context"),": [] = ",(0,n.kt)("inlineCode",{parentName:"p"},"undefined")),(0,n.kt)("p",null,"The context on this component, if any."),(0,n.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#context"},"context")),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/FSComponent.ts:64"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"contexttype"},"contextType"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"contextType"),": readonly [] = ",(0,n.kt)("inlineCode",{parentName:"p"},"undefined")),(0,n.kt)("p",null,"The type of context for this component, if any."),(0,n.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#contexttype"},"contextType")),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/FSComponent.ts:67"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"props"},"props"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"props"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapSystemTrafficLayerProps"},(0,n.kt)("inlineCode",{parentName:"a"},"MapSystemTrafficLayerProps"))," & ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/ComponentProps"},(0,n.kt)("inlineCode",{parentName:"a"},"ComponentProps"))),(0,n.kt)("p",null,"The properties of the component."),(0,n.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#props"},"props")),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/FSComponent.ts:61"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"destroy"},"destroy"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Destroys this component."),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#destroy"},"destroy")),(0,n.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/FSComponent.ts:98"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"getcontext"},"getContext"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("strong",{parentName:"p"},"getContext"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"never")),(0,n.kt)("p",null,"Gets a context data subscription from the context collection."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,n.kt)("p",null,"An error if no data for the specified context type could be found."),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"context")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"never")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The context to get the subscription for.")))),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"never")),(0,n.kt)("p",null,"The requested context."),(0,n.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#getcontext"},"getContext")),(0,n.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/FSComponent.ts:106"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"isvisible"},"isVisible"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"isVisible"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"Checks whether this layer is visible."),(0,n.kt)("h4",{id:"returns-2"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"boolean")),(0,n.kt)("p",null,"whether this layer is visible."),(0,n.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#isvisible"},"isVisible")),(0,n.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/MapLayer.ts:38"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"onafterrender"},"onAfterRender"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"onAfterRender"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"node"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"A callback that is called after the component is rendered."),(0,n.kt)("h4",{id:"parameters-2"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"node")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/VNode"},(0,n.kt)("inlineCode",{parentName:"a"},"VNode"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The component's VNode.")))),(0,n.kt)("h4",{id:"returns-3"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#onafterrender"},"onAfterRender")),(0,n.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/FSComponent.ts:87"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"onattached"},"onAttached"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"onAttached"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"This method is called when this layer is attached to its parent map component."),(0,n.kt)("h4",{id:"returns-4"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"overrides"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#onattached"},"onAttached")),(0,n.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/layers/MapSystemTrafficLayer.tsx:134"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"onbeforerender"},"onBeforeRender"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"onBeforeRender"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"A callback that is called before the component is rendered."),(0,n.kt)("h4",{id:"returns-5"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#onbeforerender"},"onBeforeRender")),(0,n.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/FSComponent.ts:80"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"ondetached"},"onDetached"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"onDetached"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"This method is called when this layer is detached from its parent map component."),(0,n.kt)("h4",{id:"returns-6"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#ondetached"},"onDetached")),(0,n.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/MapLayer.ts:108"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"onmapprojectionchanged"},"onMapProjectionChanged"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"onMapProjectionChanged"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"mapProjection"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"changeFlags"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"This method is called when the map projection changes."),(0,n.kt)("h4",{id:"parameters-3"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"mapProjection")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/MapProjection"},(0,n.kt)("inlineCode",{parentName:"a"},"MapProjection"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"this layer's map projection.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"changeFlags")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The types of changes made to the projection.")))),(0,n.kt)("h4",{id:"returns-7"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"overrides-1"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#onmapprojectionchanged"},"onMapProjectionChanged")),(0,n.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/layers/MapSystemTrafficLayer.tsx:178"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"onsleep"},"onSleep"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"onSleep"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"This method is called when this layer's parent map is put to sleep."),(0,n.kt)("h4",{id:"returns-8"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#onsleep"},"onSleep")),(0,n.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/MapLayer.ts:81"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"onupdated"},"onUpdated"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"onUpdated"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"time"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"elapsed"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"This method is called once every map update cycle."),(0,n.kt)("h4",{id:"parameters-4"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"time")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The current time as a UNIX timestamp.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"elapsed")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The elapsed time, in milliseconds, since the last update.")))),(0,n.kt)("h4",{id:"returns-9"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"overrides-2"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#onupdated"},"onUpdated")),(0,n.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/layers/MapSystemTrafficLayer.tsx:204"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"onvisibilitychanged"},"onVisibilityChanged"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"onVisibilityChanged"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"isVisible"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"This method is called when this layer's visibility changes."),(0,n.kt)("h4",{id:"parameters-5"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"isVisible")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether the layer is now visible.")))),(0,n.kt)("h4",{id:"returns-10"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"overrides-3"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#onvisibilitychanged"},"onVisibilityChanged")),(0,n.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/layers/MapSystemTrafficLayer.tsx:121"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"onwake"},"onWake"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"onWake"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"This method is called when this layer's parent map is woken."),(0,n.kt)("h4",{id:"returns-11"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#onwake"},"onWake")),(0,n.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/MapLayer.ts:74"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"render"},"render"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"render"),"(): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/VNode"},(0,n.kt)("inlineCode",{parentName:"a"},"VNode"))),(0,n.kt)("p",null,"Renders the component."),(0,n.kt)("h4",{id:"returns-12"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/VNode"},(0,n.kt)("inlineCode",{parentName:"a"},"VNode"))),(0,n.kt)("p",null,"A JSX element to be rendered."),(0,n.kt)("h4",{id:"overrides-4"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#render"},"render")),(0,n.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/layers/MapSystemTrafficLayer.tsx:304"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"setvisible"},"setVisible"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"setVisible"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"val"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Sets this layer's visibility."),(0,n.kt)("h4",{id:"parameters-6"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"val")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether this layer should be visible.")))),(0,n.kt)("h4",{id:"returns-13"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"inherited-from-12"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},"MapLayer"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer#setvisible"},"setVisible")),(0,n.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/MapLayer.ts:46"))}k.isMDXComponent=!0}}]);