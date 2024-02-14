"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[20895],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>c});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var d=r.createContext({}),p=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},s=function(e){var t=p(e.components);return r.createElement(d.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,d=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),m=p(n),u=a,c=m["".concat(d,".").concat(u)]||m[u]||k[u]||i;return n?r.createElement(c,o(o({ref:t},s),{},{components:n})):r.createElement(c,o({ref:t},s))}));function c(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=u;var l={};for(var d in t)hasOwnProperty.call(t,d)&&(l[d]=t[d]);l.originalType=e,l[m]="string"==typeof e?e:a,o[1]=l;for(var p=2;p<i;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},13769:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>o,default:()=>k,frontMatter:()=>i,metadata:()=>l,toc:()=>p});var r=n(87462),a=(n(67294),n(3905));const i={id:"MapOrientationRTRController",title:"Class: MapOrientationRTRController",sidebar_label:"MapOrientationRTRController",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"garminsdk/classes/MapOrientationRTRController",id:"garminsdk/classes/MapOrientationRTRController",title:"Class: MapOrientationRTRController",description:"Controls the rotation, range, and projected target offset of a map based on the orientation module's orientation",source:"@site/docs/garminsdk/classes/MapOrientationRTRController.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/MapOrientationRTRController",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapOrientationRTRController",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapOrientationRTRController",title:"Class: MapOrientationRTRController",sidebar_label:"MapOrientationRTRController",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapOrientationModule",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapOrientationModule"},next:{title:"MapOrientationSettingsController",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapOrientationSettingsController"}},d={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"Accessors",id:"accessors",level:2},{value:"isAlive",id:"isalive",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"onAfterMapRender",id:"onaftermaprender",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"onAfterUpdated",id:"onafterupdated",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"onBeforeUpdated",id:"onbeforeupdated",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"onDeadZoneChanged",id:"ondeadzonechanged",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"onMapDestroyed",id:"onmapdestroyed",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Overrides",id:"overrides-5",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"onMapProjectionChanged",id:"onmapprojectionchanged",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Overrides",id:"overrides-6",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"onSleep",id:"onsleep",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"onWake",id:"onwake",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-11",level:4}],s={toc:p},m="wrapper";function k(e){let{components:t,...n}=e;return(0,a.kt)(m,(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Controls the rotation, range, and projected target offset of a map based on the orientation module's orientation\nvalue."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"p"},"MapSystemController"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapOrientationRTRControllerModules"},(0,a.kt)("inlineCode",{parentName:"a"},"MapOrientationRTRControllerModules")),", ",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapOrientationRTRControllerContext"},(0,a.kt)("inlineCode",{parentName:"a"},"MapOrientationRTRControllerContext")),">"),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"MapOrientationRTRController"))))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new MapOrientationRTRController"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"context"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"nominalTargetOffsets?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"nominalRangeEndpoints?"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapOrientationRTRController"},(0,a.kt)("inlineCode",{parentName:"a"},"MapOrientationRTRController"))),(0,a.kt)("p",null,"Constructor."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"context")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"MapSystemContext"),"<",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapOrientationRTRControllerModules"},(0,a.kt)("inlineCode",{parentName:"a"},"MapOrientationRTRControllerModules")),", ",(0,a.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,a.kt)("inlineCode",{parentName:"td"},"any"),", ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapOrientationRTRControllerContext"},(0,a.kt)("inlineCode",{parentName:"a"},"MapOrientationRTRControllerContext")),">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"This controller's map context.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"nominalTargetOffsets?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Partial"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Record"),"<",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapOrientation"},(0,a.kt)("inlineCode",{parentName:"a"},"MapOrientation")),", ",(0,a.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,a.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"sort"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"copyWithin"'),">",">"," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,a.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"sort"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"copyWithin"'),">",">",">",">",">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The nominal projected target offsets this controller applies for each orientation, as ",(0,a.kt)("inlineCode",{parentName:"td"},"[x, y]")," relative to the width and height of the map's projected window excluding the dead zone. If an orientation does not have a defined offset, it will default to ",(0,a.kt)("inlineCode",{parentName:"td"},"[0, 0]"),".")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"nominalRangeEndpoints?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Partial"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Record"),"<",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/MapOrientation"},(0,a.kt)("inlineCode",{parentName:"a"},"MapOrientation")),", ",(0,a.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,a.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"sort"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"copyWithin"'),">",">"," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,a.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"sort"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"copyWithin"'),">",">",">",">",">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The nominal range endpoints this controller applies for each orientation, as ",(0,a.kt)("inlineCode",{parentName:"td"},"[x1, y1, x2, y2]")," relative to the width and height of the map's projected window excluding the dead zone. If an orientation does not have defined range endpoints, it will default to ",(0,a.kt)("inlineCode",{parentName:"td"},"[0.5, 0.5, 0.5, 0]"),".")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapOrientationRTRController"},(0,a.kt)("inlineCode",{parentName:"a"},"MapOrientationRTRController"))),(0,a.kt)("h4",{id:"overrides"},"Overrides"),(0,a.kt)("p",null,"MapSystemController\\","<","MapOrientationRTRControllerModules, any, any, MapOrientationRTRControllerContext\\",">",".constructor"),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/controllers/MapOrientationRTRController.ts:85"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"context"},"context"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"context"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"MapSystemContext"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapOrientationRTRControllerModules"},(0,a.kt)("inlineCode",{parentName:"a"},"MapOrientationRTRControllerModules")),", ",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapOrientationRTRControllerContext"},(0,a.kt)("inlineCode",{parentName:"a"},"MapOrientationRTRControllerContext")),">"),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,"MapSystemController.context"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/MapSystemController.ts:24"),(0,a.kt)("h2",{id:"accessors"},"Accessors"),(0,a.kt)("h3",{id:"isalive"},"isAlive"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"get")," ",(0,a.kt)("strong",{parentName:"p"},"isAlive"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Whether this controller is alive."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,"MapSystemController.isAlive"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/MapSystemController.ts:20"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"destroy"},"destroy"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"overrides-1"},"Overrides"),(0,a.kt)("p",null,"MapSystemController.destroy"),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/controllers/MapOrientationRTRController.ts:220"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onaftermaprender"},"onAfterMapRender"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onAfterMapRender"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"overrides-2"},"Overrides"),(0,a.kt)("p",null,"MapSystemController.onAfterMapRender"),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/controllers/MapOrientationRTRController.ts:94"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onafterupdated"},"onAfterUpdated"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onAfterUpdated"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"time"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"elapsed"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"This method is called immediately after this controller's map updates its layers."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"time")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The current time, as a Javascript timestamp.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"elapsed")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The elapsed time, in milliseconds, since the last update.")))),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,a.kt)("p",null,"MapSystemController.onAfterUpdated"),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/MapSystemController.ts:78"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onbeforeupdated"},"onBeforeUpdated"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onBeforeUpdated"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"returns-5"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"overrides-3"},"Overrides"),(0,a.kt)("p",null,"MapSystemController.onBeforeUpdated"),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/controllers/MapOrientationRTRController.ts:142"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ondeadzonechanged"},"onDeadZoneChanged"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onDeadZoneChanged"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"returns-6"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"overrides-4"},"Overrides"),(0,a.kt)("p",null,"MapSystemController.onDeadZoneChanged"),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/controllers/MapOrientationRTRController.ts:129"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onmapdestroyed"},"onMapDestroyed"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onMapDestroyed"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"returns-7"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"overrides-5"},"Overrides"),(0,a.kt)("p",null,"MapSystemController.onMapDestroyed"),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/controllers/MapOrientationRTRController.ts:215"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onmapprojectionchanged"},"onMapProjectionChanged"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onMapProjectionChanged"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"mapProjection"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"changeFlags"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"mapProjection")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"MapProjection"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"changeFlags")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number"))))),(0,a.kt)("h4",{id:"returns-8"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"overrides-6"},"Overrides"),(0,a.kt)("p",null,"MapSystemController.onMapProjectionChanged"),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/controllers/MapOrientationRTRController.ts:135"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onsleep"},"onSleep"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onSleep"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"This method is called when this controller's map is put to sleep."),(0,a.kt)("h4",{id:"returns-9"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,a.kt)("p",null,"MapSystemController.onSleep"),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/MapSystemController.ts:92"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onwake"},"onWake"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onWake"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"This method is called when this controller's map is awakened."),(0,a.kt)("h4",{id:"returns-10"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,a.kt)("p",null,"MapSystemController.onWake"),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"src/sdk/components/mapsystem/MapSystemController.ts:85"))}k.isMDXComponent=!0}}]);