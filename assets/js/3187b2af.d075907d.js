"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[9055],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>f});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var s=n.createContext({}),d=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=d(e.components);return n.createElement(s.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),m=d(r),c=a,f=m["".concat(s,".").concat(c)]||m[c]||k[c]||o;return r?n.createElement(f,l(l({ref:t},p),{},{components:r})):n.createElement(f,l({ref:t},p))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,l=new Array(o);l[0]=c;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i[m]="string"==typeof e?e:a,l[1]=i;for(var d=2;d<o;d++)l[d]=r[d];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},60377:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>k,frontMatter:()=>o,metadata:()=>i,toc:()=>d});var n=r(87462),a=(r(67294),r(3905));const o={id:"MapRotationController",title:"Class: MapRotationController",sidebar_label:"MapRotationController",sidebar_position:0,custom_edit_url:null},l=void 0,i={unversionedId:"framework/classes/MapRotationController",id:"framework/classes/MapRotationController",title:"Class: MapRotationController",description:"Controls the rotation of a map based on the behavior defined in MapRotationModule.",source:"@site/docs/framework/classes/MapRotationController.md",sourceDirName:"framework/classes",slug:"/framework/classes/MapRotationController",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapRotationController",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapRotationController",title:"Class: MapRotationController",sidebar_label:"MapRotationController",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapRangeModule",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapRangeModule"},next:{title:"MapRotationModule",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapRotationModule"}},s={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"Accessors",id:"accessors",level:2},{value:"isAlive",id:"isalive",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"onAfterMapRender",id:"onaftermaprender",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"onAfterUpdated",id:"onafterupdated",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"onBeforeUpdated",id:"onbeforeupdated",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"onDeadZoneChanged",id:"ondeadzonechanged",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"onMapDestroyed",id:"onmapdestroyed",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"onMapProjectionChanged",id:"onmapprojectionchanged",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"onSleep",id:"onsleep",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"onWake",id:"onwake",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-11",level:4}],p={toc:d},m="wrapper";function k(e){let{components:t,...r}=e;return(0,a.kt)(m,(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Controls the rotation of a map based on the behavior defined in ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapRotationModule"},"MapRotationModule"),"."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController"},(0,a.kt)("inlineCode",{parentName:"a"},"MapSystemController")),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapRotationControllerModules"},(0,a.kt)("inlineCode",{parentName:"a"},"MapRotationControllerModules")),", ",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapRotationControllerContext"},(0,a.kt)("inlineCode",{parentName:"a"},"MapRotationControllerContext")),">"),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"MapRotationController"))))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new MapRotationController"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapRotationController"},(0,a.kt)("inlineCode",{parentName:"a"},"MapRotationController"))),(0,a.kt)("p",null,"Constructor."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"context")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#mapsystemcontext"},(0,a.kt)("inlineCode",{parentName:"a"},"MapSystemContext")),"<",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapRotationControllerModules"},(0,a.kt)("inlineCode",{parentName:"a"},"MapRotationControllerModules")),", ",(0,a.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,a.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapRotationControllerContext"},(0,a.kt)("inlineCode",{parentName:"a"},"MapRotationControllerContext")),">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"This controller's map context.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapRotationController"},(0,a.kt)("inlineCode",{parentName:"a"},"MapRotationController"))),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController"},"MapSystemController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController#constructor"},"constructor")),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/MapSystemController.ts:30"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"context"},"context"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"context"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#mapsystemcontext"},(0,a.kt)("inlineCode",{parentName:"a"},"MapSystemContext")),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapRotationControllerModules"},(0,a.kt)("inlineCode",{parentName:"a"},"MapRotationControllerModules")),", ",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapRotationControllerContext"},(0,a.kt)("inlineCode",{parentName:"a"},"MapRotationControllerContext")),">"),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController"},"MapSystemController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController#context"},"context")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/MapSystemController.ts:24"),(0,a.kt)("h2",{id:"accessors"},"Accessors"),(0,a.kt)("h3",{id:"isalive"},"isAlive"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"get")," ",(0,a.kt)("strong",{parentName:"p"},"isAlive"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Whether this controller is alive."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,a.kt)("p",null,"MapSystemController.isAlive"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/MapSystemController.ts:20"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"destroy"},"destroy"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Destroys this controller."),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController"},"MapSystemController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController#destroy"},"destroy")),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/controllers/MapRotationController.ts:107"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onaftermaprender"},"onAfterMapRender"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onAfterMapRender"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"This method is called after this controller' map is rendered."),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-1"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController"},"MapSystemController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController#onaftermaprender"},"onAfterMapRender")),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/controllers/MapRotationController.ts:82"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onafterupdated"},"onAfterUpdated"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onAfterUpdated"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"time"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"elapsed"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"This method is called immediately after this controller's map updates its layers."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"time")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The current time, as a Javascript timestamp.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"elapsed")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The elapsed time, in milliseconds, since the last update.")))),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController"},"MapSystemController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController#onafterupdated"},"onAfterUpdated")),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/MapSystemController.ts:78"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onbeforeupdated"},"onBeforeUpdated"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onBeforeUpdated"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"This method is called immediately before this controller's map updates its layers."),(0,a.kt)("h4",{id:"returns-5"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-2"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController"},"MapSystemController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController#onbeforeupdated"},"onBeforeUpdated")),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/controllers/MapRotationController.ts:91"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ondeadzonechanged"},"onDeadZoneChanged"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onDeadZoneChanged"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"deadZone"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"This method is called when the dead zone of this controller's map changes."),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"deadZone")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,a.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"sort"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"copyWithin"'),">",">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The map's new dead zone.")))),(0,a.kt)("h4",{id:"returns-6"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController"},"MapSystemController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController#ondeadzonechanged"},"onDeadZoneChanged")),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/MapSystemController.ts:48"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onmapdestroyed"},"onMapDestroyed"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onMapDestroyed"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"This method is called when this controller's map is destroyed."),(0,a.kt)("h4",{id:"returns-7"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-3"},"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController"},"MapSystemController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController#onmapdestroyed"},"onMapDestroyed")),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/controllers/MapRotationController.ts:100"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onmapprojectionchanged"},"onMapProjectionChanged"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onMapProjectionChanged"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"mapProjection"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"changeFlags"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"This method is called when the projection of this controller's map changes."),(0,a.kt)("h4",{id:"parameters-3"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"mapProjection")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/MapProjection"},(0,a.kt)("inlineCode",{parentName:"a"},"MapProjection"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The map projection.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"changeFlags")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Bit flags describing the type of change.")))),(0,a.kt)("h4",{id:"returns-8"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController"},"MapSystemController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController#onmapprojectionchanged"},"onMapProjectionChanged")),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/MapSystemController.ts:58"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onsleep"},"onSleep"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onSleep"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"This method is called when this controller's map is put to sleep."),(0,a.kt)("h4",{id:"returns-9"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController"},"MapSystemController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController#onsleep"},"onSleep")),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/MapSystemController.ts:92"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onwake"},"onWake"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onWake"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"This method is called when this controller's map is awakened."),(0,a.kt)("h4",{id:"returns-10"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController"},"MapSystemController"),".",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapSystemController#onwake"},"onWake")),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/MapSystemController.ts:85"))}k.isMDXComponent=!0}}]);