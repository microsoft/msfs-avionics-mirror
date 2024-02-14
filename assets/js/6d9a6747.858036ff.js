"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[86585],{3905:(e,r,t)=>{t.d(r,{Zo:()=>d,kt:()=>k});var a=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,a)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function s(e,r){if(null==e)return{};var t,a,n=function(e,r){if(null==e)return{};var t,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var l=a.createContext({}),p=function(e){var r=a.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},d=function(e){var r=p(e.components);return a.createElement(l.Provider,{value:r},e.children)},f="mdxType",m={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},c=a.forwardRef((function(e,r){var t=e.components,n=e.mdxType,i=e.originalType,l=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),f=p(t),c=n,k=f["".concat(l,".").concat(c)]||f[c]||m[c]||i;return t?a.createElement(k,o(o({ref:r},d),{},{components:t})):a.createElement(k,o({ref:r},d))}));function k(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var i=t.length,o=new Array(i);o[0]=c;var s={};for(var l in r)hasOwnProperty.call(r,l)&&(s[l]=r[l]);s.originalType=e,s[f]="string"==typeof e?e:n,o[1]=s;for(var p=2;p<i;p++)o[p]=t[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,t)}c.displayName="MDXCreateElement"},8927:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>l,contentTitle:()=>o,default:()=>m,frontMatter:()=>i,metadata:()=>s,toc:()=>p});var a=t(87462),n=(t(67294),t(3905));const i={id:"MapSystemTrafficLayerProps",title:"Interface: MapSystemTrafficLayerProps",sidebar_label:"MapSystemTrafficLayerProps",sidebar_position:0,custom_edit_url:null},o=void 0,s={unversionedId:"framework/interfaces/MapSystemTrafficLayerProps",id:"framework/interfaces/MapSystemTrafficLayerProps",title:"Interface: MapSystemTrafficLayerProps",description:"Component props for MapSystemTrafficLayer.",source:"@site/docs/framework/interfaces/MapSystemTrafficLayerProps.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/MapSystemTrafficLayerProps",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MapSystemTrafficLayerProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapSystemTrafficLayerProps",title:"Interface: MapSystemTrafficLayerProps",sidebar_label:"MapSystemTrafficLayerProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapSystemTrafficLayerModules",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MapSystemTrafficLayerModules"},next:{title:"MapSystemWaypointsLayerModules",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MapSystemWaypointsLayerModules"}},l={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"class",id:"class",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"context",id:"context",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"iconFactory",id:"iconfactory",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"initCanvasStyles",id:"initcanvasstyles",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Parameters",id:"parameters",level:5},{value:"Returns",id:"returns",level:5},{value:"Defined in",id:"defined-in-4",level:4},{value:"mapProjection",id:"mapprojection",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"model",id:"model",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"offScaleIntruders",id:"offscaleintruders",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"oobIntruders",id:"oobintruders",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"oobOffset",id:"ooboffset",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"updateFreq",id:"updatefreq",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-11",level:4}],d={toc:p},f="wrapper";function m(e){let{components:r,...t}=e;return(0,n.kt)(f,(0,a.Z)({},d,t,{components:r,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Component props for MapSystemTrafficLayer."),(0,n.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps"},(0,n.kt)("inlineCode",{parentName:"a"},"MapLayerProps")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapSystemTrafficLayerModules"},(0,n.kt)("inlineCode",{parentName:"a"},"MapSystemTrafficLayerModules")),">"),(0,n.kt)("p",{parentName:"li"},"\u21b3 ",(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"MapSystemTrafficLayerProps"))))),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"children"},"children"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,n.kt)("strong",{parentName:"p"},"children"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,n.kt)("p",null,"The children of the display component."),(0,n.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps"},"MapLayerProps"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps#children"},"children")),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/FSComponent.ts:122"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"class"},"class"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,n.kt)("strong",{parentName:"p"},"class"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/SubscribableSet"},(0,n.kt)("inlineCode",{parentName:"a"},"SubscribableSet")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,n.kt)("p",null,"The CSS class(es) to apply to the root of this layer."),(0,n.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps"},"MapLayerProps"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps#class"},"class")),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/MapLayer.ts:25"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"context"},"context"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"context"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#mapsystemcontext"},(0,n.kt)("inlineCode",{parentName:"a"},"MapSystemContext")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,n.kt)("p",null,"The context of the layer's parent map."),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/layers/MapSystemTrafficLayer.tsx:63"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"iconfactory"},"iconFactory"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"iconFactory"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#maptrafficintrudericonfactory"},(0,n.kt)("inlineCode",{parentName:"a"},"MapTrafficIntruderIconFactory")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"any"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,n.kt)("p",null,"A function which creates icons for intruders."),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/layers/MapSystemTrafficLayer.tsx:66"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"initcanvasstyles"},"initCanvasStyles"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,n.kt)("strong",{parentName:"p"},"initCanvasStyles"),": (",(0,n.kt)("inlineCode",{parentName:"p"},"context"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"CanvasRenderingContext2D"),") => ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"A function which initializes global canvas styles for the layer."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"Param"))),(0,n.kt)("p",null,"The canvas rendering context for which to initialize styles."),(0,n.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,n.kt)("p",null,"\u25b8 (",(0,n.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"A function which initializes global canvas styles for the layer."),(0,n.kt)("h5",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"context")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"CanvasRenderingContext2D")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The canvas rendering context for which to initialize styles.")))),(0,n.kt)("h5",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/layers/MapSystemTrafficLayer.tsx:72"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"mapprojection"},"mapProjection"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"mapProjection"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapProjection"},(0,n.kt)("inlineCode",{parentName:"a"},"MapProjection"))),(0,n.kt)("p",null,"A map projection model."),(0,n.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps"},"MapLayerProps"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps#mapprojection"},"mapProjection")),(0,n.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/MapLayer.ts:15"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"model"},"model"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"model"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapModel"},(0,n.kt)("inlineCode",{parentName:"a"},"MapModel")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapSystemTrafficLayerModules"},(0,n.kt)("inlineCode",{parentName:"a"},"MapSystemTrafficLayerModules")),">"),(0,n.kt)("p",null,"A map model."),(0,n.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps"},"MapLayerProps"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps#model"},"model")),(0,n.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/MapLayer.ts:12"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"offscaleintruders"},"offScaleIntruders"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,n.kt)("strong",{parentName:"p"},"offScaleIntruders"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribableSet"},(0,n.kt)("inlineCode",{parentName:"a"},"MutableSubscribableSet")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/TcasIntruder"},(0,n.kt)("inlineCode",{parentName:"a"},"TcasIntruder")),">"),(0,n.kt)("p",null,"A subscribable set to update with off-scale intruders."),(0,n.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/layers/MapSystemTrafficLayer.tsx:75"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"oobintruders"},"oobIntruders"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,n.kt)("strong",{parentName:"p"},"oobIntruders"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MutableSubscribableSet"},(0,n.kt)("inlineCode",{parentName:"a"},"MutableSubscribableSet")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/TcasIntruder"},(0,n.kt)("inlineCode",{parentName:"a"},"TcasIntruder")),">"),(0,n.kt)("p",null,"A subscribable set to update with intruders that are not off-scale but whose projected positions are considered\nout-of-bounds."),(0,n.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/layers/MapSystemTrafficLayer.tsx:81"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"ooboffset"},"oobOffset"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,n.kt)("strong",{parentName:"p"},"oobOffset"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscribable"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscribable")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Omit"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Float64Array"),", ",(0,n.kt)("inlineCode",{parentName:"p"},'"set"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"p"},'"sort"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"p"},'"copyWithin"'),">",">",">"),(0,n.kt)("p",null,"A subscribable which provides the offset of the intruder out-of-bounds boundaries relative to the boundaries of\nthe map's projected window, as ",(0,n.kt)("inlineCode",{parentName:"p"},"[left, top, right, bottom]")," in pixels. Positive offsets are directed toward the\ncenter of the map. Defaults to ",(0,n.kt)("inlineCode",{parentName:"p"},"[0, 0, 0, 0]"),"."),(0,n.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/layers/MapSystemTrafficLayer.tsx:88"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"ref"},"ref"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,n.kt)("strong",{parentName:"p"},"ref"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/NodeReference"},(0,n.kt)("inlineCode",{parentName:"a"},"NodeReference")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,n.kt)("p",null,"A reference to the display component."),(0,n.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps"},"MapLayerProps"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps#ref"},"ref")),(0,n.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/FSComponent.ts:125"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"updatefreq"},"updateFreq"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,n.kt)("strong",{parentName:"p"},"updateFreq"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscribable"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscribable")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,n.kt)("p",null,"A subscribable which provides the maximum update frequency of the layer, in hertz. Note that the actual update\nfrequency will not exceed the update frequency of the layer's parent map. If not defined, the frequency will\ndefault to that of the layer's parent map."),(0,n.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps"},"MapLayerProps"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps#updatefreq"},"updateFreq")),(0,n.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/map/MapLayer.ts:22"))}m.isMDXComponent=!0}}]);