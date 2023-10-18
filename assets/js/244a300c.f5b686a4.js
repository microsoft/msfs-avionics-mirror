"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[97223],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>v});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=i.createContext({}),o=function(e){var t=i.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=o(e.components);return i.createElement(p.Provider,{value:t},e.children)},k="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,p=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),k=o(n),u=a,v=k["".concat(p,".").concat(u)]||k[u]||m[u]||r;return n?i.createElement(v,l(l({ref:t},s),{},{components:n})):i.createElement(v,l({ref:t},s))}));function v(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,l=new Array(r);l[0]=u;var d={};for(var p in t)hasOwnProperty.call(t,p)&&(d[p]=t[p]);d.originalType=e,d[k]="string"==typeof e?e:a,l[1]=d;for(var o=2;o<r;o++)l[o]=n[o];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}u.displayName="MDXCreateElement"},39055:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>m,frontMatter:()=>r,metadata:()=>d,toc:()=>o});var i=n(87462),a=(n(67294),n(3905));const r={id:"MapWindVectorLayer",title:"Class: MapWindVectorLayer",sidebar_label:"MapWindVectorLayer",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/classes/MapWindVectorLayer",id:"garminsdk/classes/MapWindVectorLayer",title:"Class: MapWindVectorLayer",description:"A map layer which displays a readout of wind speed and an arrow depicting wind direction.",source:"@site/docs/garminsdk/classes/MapWindVectorLayer.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/MapWindVectorLayer",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapWindVectorLayer",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapWindVectorLayer",title:"Class: MapWindVectorLayer",sidebar_label:"MapWindVectorLayer",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapWindVectorController",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapWindVectorController"},next:{title:"MapWindVectorModule",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapWindVectorModule"}},p={},o=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"arrowDisplay",id:"arrowdisplay",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"arrowTransform",id:"arrowtransform",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"contextType",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"cssClassSub",id:"cssclasssub",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"isAttached",id:"isattached",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"isAwake",id:"isawake",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"isPaused",id:"ispaused",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"needUpdateArrow",id:"needupdatearrow",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"pauseableSubs",id:"pauseablesubs",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"rootDisplay",id:"rootdisplay",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"show",id:"show",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"speedValue",id:"speedvalue",level:3},{value:"Defined in",id:"defined-in-14",level:4},{value:"windVectorModule",id:"windvectormodule",level:3},{value:"Defined in",id:"defined-in-15",level:4},{value:"FORMATTER",id:"formatter",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns",level:5},{value:"Defined in",id:"defined-in-16",level:4},{value:"SHOW_ARROW_WIND_SPEED_HYSTERESIS",id:"show_arrow_wind_speed_hysteresis",level:3},{value:"Defined in",id:"defined-in-17",level:4},{value:"SHOW_ARROW_WIND_SPEED_THRESHOLD",id:"show_arrow_wind_speed_threshold",level:3},{value:"Defined in",id:"defined-in-18",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"getContext",id:"getcontext",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"isVisible",id:"isvisible",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"onAfterRender",id:"onafterrender",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"onAttached",id:"onattached",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"onBeforeRender",id:"onbeforerender",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-24",level:4},{value:"onDetached",id:"ondetached",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-25",level:4},{value:"onMapProjectionChanged",id:"onmapprojectionchanged",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-26",level:4},{value:"onSleep",id:"onsleep",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-27",level:4},{value:"onUpdated",id:"onupdated",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"Defined in",id:"defined-in-28",level:4},{value:"onVisibilityChanged",id:"onvisibilitychanged",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Overrides",id:"overrides-5",level:4},{value:"Defined in",id:"defined-in-29",level:4},{value:"onWake",id:"onwake",level:3},{value:"Returns",id:"returns-12",level:4},{value:"Overrides",id:"overrides-6",level:4},{value:"Defined in",id:"defined-in-30",level:4},{value:"render",id:"render",level:3},{value:"Returns",id:"returns-13",level:4},{value:"Overrides",id:"overrides-7",level:4},{value:"Defined in",id:"defined-in-31",level:4},{value:"setVisible",id:"setvisible",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-14",level:4},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-32",level:4},{value:"updateArrow",id:"updatearrow",level:3},{value:"Returns",id:"returns-15",level:4},{value:"Defined in",id:"defined-in-33",level:4},{value:"updateIsPaused",id:"updateispaused",level:3},{value:"Returns",id:"returns-16",level:4},{value:"Defined in",id:"defined-in-34",level:4}],s={toc:o},k="wrapper";function m(e){let{components:t,...n}=e;return(0,a.kt)(k,(0,i.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A map layer which displays a readout of wind speed and an arrow depicting wind direction."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"p"},"MapLayer"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#mapwindvectorlayerprops"},(0,a.kt)("inlineCode",{parentName:"a"},"MapWindVectorLayerProps")),">"),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"MapWindVectorLayer"))))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new MapWindVectorLayer"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"props"),")"),(0,a.kt)("p",null,"Creates an instance of a DisplayComponent."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"props")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/modules#mapwindvectorlayerprops"},(0,a.kt)("inlineCode",{parentName:"a"},"MapWindVectorLayerProps"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The propertis of the component.")))),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,"MapLayer<MapWindVectorLayerProps",">",".constructor"),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:73"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"arrowdisplay"},"arrowDisplay"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"arrowDisplay"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:36"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"arrowtransform"},"arrowTransform"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"arrowTransform"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"CssTransformSubject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"CssRotate3dTransform"),">"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:37"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"context"},"context"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"context"),": [] = ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")),(0,a.kt)("p",null,"The context on this component, if any."),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,"MapLayer.context"),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:64"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"contexttype"},"contextType"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"contextType"),": readonly [] = ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")),(0,a.kt)("p",null,"The type of context for this component, if any."),(0,a.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,a.kt)("p",null,"MapLayer.contextType"),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:67"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"cssclasssub"},"cssClassSub"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"cssClassSub"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:55"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isattached"},"isAttached"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"isAttached"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"false")),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:47"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isawake"},"isAwake"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"isAwake"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"true")),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:48"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ispaused"},"isPaused"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"isPaused"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"true")),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:49"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"needupdatearrow"},"needUpdateArrow"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"needUpdateArrow"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,a.kt)("inlineCode",{parentName:"p"},"false")),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:51"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"pauseablesubs"},"pauseableSubs"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"pauseableSubs"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscription"),"[] = ",(0,a.kt)("inlineCode",{parentName:"p"},"[]")),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:53"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"props"},"props"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"props"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#mapwindvectorlayerprops"},(0,a.kt)("inlineCode",{parentName:"a"},"MapWindVectorLayerProps"))," & ",(0,a.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,a.kt)("p",null,"The properties of the component."),(0,a.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,a.kt)("p",null,"MapLayer.props"),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:61"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"rootdisplay"},"rootDisplay"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"rootDisplay"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:34"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"show"},"show"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"show"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"MappedSubject"),"<","[",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),"]",", ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,a.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:41"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"speedvalue"},"speedValue"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"speedValue"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"NumberUnitSubject"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Speed"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"CompoundUnit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Speed"),">",">"),(0,a.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:39"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"windvectormodule"},"windVectorModule"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"windVectorModule"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapWindVectorModule"},(0,a.kt)("inlineCode",{parentName:"a"},"MapWindVectorModule"))),(0,a.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:32"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"formatter"},"FORMATTER"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"FORMATTER"),": (",(0,a.kt)("inlineCode",{parentName:"p"},"number"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),") => ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,a.kt)("p",null,"\u25b8 (",(0,a.kt)("inlineCode",{parentName:"p"},"number"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Creates a function which formats numeric values to strings. The formatting behavior of the function can be\ncustomized using a number of options. Please refer to the NumberFormatterOptions type documentation for\nmore information on each individual option."),(0,a.kt)("h5",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number"))))),(0,a.kt)("h5",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"A function which formats numeric values to strings."),(0,a.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:30"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"show_arrow_wind_speed_hysteresis"},"SHOW","_","ARROW","_","WIND","_","SPEED","_","HYSTERESIS"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"SHOW","_","ARROW","_","WIND","_","SPEED","_","HYSTERESIS"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"0.5")),(0,a.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:28"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"show_arrow_wind_speed_threshold"},"SHOW","_","ARROW","_","WIND","_","SPEED","_","THRESHOLD"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"SHOW","_","ARROW","_","WIND","_","SPEED","_","THRESHOLD"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"1")),(0,a.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:27"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"destroy"},"destroy"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides"},"Overrides"),(0,a.kt)("p",null,"MapLayer.destroy"),(0,a.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:178"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"getcontext"},"getContext"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("strong",{parentName:"p"},"getContext"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"never")),(0,a.kt)("p",null,"Gets a context data subscription from the context collection."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,a.kt)("p",null,"An error if no data for the specified context type could be found."),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"context")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"never")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The context to get the subscription for.")))),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"never")),(0,a.kt)("p",null,"The requested context."),(0,a.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,a.kt)("p",null,"MapLayer.getContext"),(0,a.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:106"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isvisible"},"isVisible"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"isVisible"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Checks whether this layer is visible."),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"whether this layer is visible."),(0,a.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,a.kt)("p",null,"MapLayer.isVisible"),(0,a.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,a.kt)("p",null,"sdk/components/map/MapLayer.ts:38"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onafterrender"},"onAfterRender"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onAfterRender"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"node"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"A callback that is called after the component is rendered."),(0,a.kt)("h4",{id:"parameters-3"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"node")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"VNode")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The component's VNode.")))),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,a.kt)("p",null,"MapLayer.onAfterRender"),(0,a.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:87"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onattached"},"onAttached"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onAttached"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"returns-5"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-1"},"Overrides"),(0,a.kt)("p",null,"MapLayer.onAttached"),(0,a.kt)("h4",{id:"defined-in-23"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:64"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onbeforerender"},"onBeforeRender"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onBeforeRender"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"A callback that is called before the component is rendered."),(0,a.kt)("h4",{id:"returns-6"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,a.kt)("p",null,"MapLayer.onBeforeRender"),(0,a.kt)("h4",{id:"defined-in-24"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:80"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ondetached"},"onDetached"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onDetached"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"This method is called when this layer is detached from its parent map component."),(0,a.kt)("h4",{id:"returns-7"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,a.kt)("p",null,"MapLayer.onDetached"),(0,a.kt)("h4",{id:"defined-in-25"},"Defined in"),(0,a.kt)("p",null,"sdk/components/map/MapLayer.ts:108"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onmapprojectionchanged"},"onMapProjectionChanged"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onMapProjectionChanged"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"mapProjection"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"changeFlags"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"parameters-4"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"mapProjection")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"MapProjection"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"changeFlags")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number"))))),(0,a.kt)("h4",{id:"returns-8"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-2"},"Overrides"),(0,a.kt)("p",null,"MapLayer.onMapProjectionChanged"),(0,a.kt)("h4",{id:"defined-in-26"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:88"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onsleep"},"onSleep"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onSleep"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"returns-9"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-3"},"Overrides"),(0,a.kt)("p",null,"MapLayer.onSleep"),(0,a.kt)("h4",{id:"defined-in-27"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:100"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onupdated"},"onUpdated"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onUpdated"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"returns-10"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-4"},"Overrides"),(0,a.kt)("p",null,"MapLayer.onUpdated"),(0,a.kt)("h4",{id:"defined-in-28"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:127"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onvisibilitychanged"},"onVisibilityChanged"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onVisibilityChanged"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"isVisible"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"parameters-5"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"isVisible")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean"))))),(0,a.kt)("h4",{id:"returns-11"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-5"},"Overrides"),(0,a.kt)("p",null,"MapLayer.onVisibilityChanged"),(0,a.kt)("h4",{id:"defined-in-29"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:58"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onwake"},"onWake"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onWake"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"returns-12"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-6"},"Overrides"),(0,a.kt)("p",null,"MapLayer.onWake"),(0,a.kt)("h4",{id:"defined-in-30"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:93"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"render"},"render"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"render"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"VNode")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"returns-13"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"VNode")),(0,a.kt)("h4",{id:"overrides-7"},"Overrides"),(0,a.kt)("p",null,"MapLayer.render"),(0,a.kt)("h4",{id:"defined-in-31"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:147"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"setvisible"},"setVisible"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"setVisible"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"val"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Sets this layer's visibility."),(0,a.kt)("h4",{id:"parameters-6"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"val")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether this layer should be visible.")))),(0,a.kt)("h4",{id:"returns-14"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,a.kt)("p",null,"MapLayer.setVisible"),(0,a.kt)("h4",{id:"defined-in-32"},"Defined in"),(0,a.kt)("p",null,"sdk/components/map/MapLayer.ts:46"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"updatearrow"},"updateArrow"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"updateArrow"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Updates the rotation of this layer's arrow."),(0,a.kt)("h4",{id:"returns-15"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-33"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:140"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"updateispaused"},"updateIsPaused"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("strong",{parentName:"p"},"updateIsPaused"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Updates whether this layer is paused."),(0,a.kt)("h4",{id:"returns-16"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-34"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/layers/MapWindVectorLayer.tsx:109"))}m.isMDXComponent=!0}}]);