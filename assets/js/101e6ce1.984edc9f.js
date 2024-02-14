"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[45108],{3905:(e,n,r)=>{r.d(n,{Zo:()=>s,kt:()=>f});var t=r(67294);function i(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function a(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function l(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?a(Object(r),!0).forEach((function(n){i(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function p(e,n){if(null==e)return{};var r,t,i=function(e,n){if(null==e)return{};var r,t,i={},a=Object.keys(e);for(t=0;t<a.length;t++)r=a[t],n.indexOf(r)>=0||(i[r]=e[r]);return i}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)r=a[t],n.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var o=t.createContext({}),d=function(e){var n=t.useContext(o),r=n;return e&&(r="function"==typeof e?e(n):l(l({},n),e)),r},s=function(e){var n=d(e.components);return t.createElement(o.Provider,{value:n},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},c=t.forwardRef((function(e,n){var r=e.components,i=e.mdxType,a=e.originalType,o=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),u=d(r),c=i,f=u["".concat(o,".").concat(c)]||u[c]||m[c]||a;return r?t.createElement(f,l(l({ref:n},s),{},{components:r})):t.createElement(f,l({ref:n},s))}));function f(e,n){var r=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var a=r.length,l=new Array(a);l[0]=c;var p={};for(var o in n)hasOwnProperty.call(n,o)&&(p[o]=n[o]);p.originalType=e,p[u]="string"==typeof e?e:i,l[1]=p;for(var d=2;d<a;d++)l[d]=r[d];return t.createElement.apply(null,l)}return t.createElement.apply(null,r)}c.displayName="MDXCreateElement"},97880:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>o,contentTitle:()=>l,default:()=>m,frontMatter:()=>a,metadata:()=>p,toc:()=>d});var t=r(87462),i=(r(67294),r(3905));const a={id:"MapFlightPlanLayerProps",title:"Interface: MapFlightPlanLayerProps",sidebar_label:"MapFlightPlanLayerProps",sidebar_position:0,custom_edit_url:null},l=void 0,p={unversionedId:"garminsdk/interfaces/MapFlightPlanLayerProps",id:"garminsdk/interfaces/MapFlightPlanLayerProps",title:"Interface: MapFlightPlanLayerProps",description:"Properties on the MapFlightPlanLayer component.",source:"@site/docs/garminsdk/interfaces/MapFlightPlanLayerProps.md",sourceDirName:"garminsdk/interfaces",slug:"/garminsdk/interfaces/MapFlightPlanLayerProps",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanLayerProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapFlightPlanLayerProps",title:"Interface: MapFlightPlanLayerProps",sidebar_label:"MapFlightPlanLayerProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapFlightPlanFocusRTRControllerModules",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanFocusRTRControllerModules"},next:{title:"MapGarminAutopilotPropsControllerModules",permalink:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapGarminAutopilotPropsControllerModules"}},o={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"class",id:"class",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"dataProvider",id:"dataprovider",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"drawEntirePlan",id:"drawentireplan",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"mapProjection",id:"mapprojection",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"model",id:"model",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"pathRenderer",id:"pathrenderer",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"updateFreq",id:"updatefreq",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"waypointRenderer",id:"waypointrenderer",level:3},{value:"Defined in",id:"defined-in-10",level:4}],s={toc:d},u="wrapper";function m(e){let{components:n,...r}=e;return(0,i.kt)(u,(0,t.Z)({},s,r,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Properties on the MapFlightPlanLayer component."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"p"},"MapLayerProps"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"MapFlightPlanLayerProps"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"bus"},"bus"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"bus"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,i.kt)("p",null,"The event bus."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/components/map/layers/MapFlightPlanLayer.tsx:19"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"children"},"children"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"children"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,i.kt)("p",null,"The children of the display component."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,"MapLayerProps.children"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/FSComponent.ts:122"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"class"},"class"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"class"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"SubscribableSet"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("p",null,"The CSS class(es) to apply to the root of this layer."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,"MapLayerProps.class"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/map/MapLayer.ts:25"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"dataprovider"},"dataProvider"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"dataProvider"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPlanDataProvider"},(0,i.kt)("inlineCode",{parentName:"a"},"MapFlightPlanDataProvider"))),(0,i.kt)("p",null,"A flight plan data provider."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/components/map/layers/MapFlightPlanLayer.tsx:22"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"drawentireplan"},"drawEntirePlan"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"drawEntirePlan"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"A subscribable which provides whether the layer should draw the entire plan instead of only from the active\nlateral leg."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/components/map/layers/MapFlightPlanLayer.tsx:28"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"mapprojection"},"mapProjection"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"mapProjection"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"MapProjection")),(0,i.kt)("p",null,"A map projection model."),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,"MapLayerProps.mapProjection"),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/map/MapLayer.ts:15"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"model"},"model"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"model"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"MapModel"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,i.kt)("p",null,"A map model."),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,"MapLayerProps.model"),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/map/MapLayer.ts:12"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"pathrenderer"},"pathRenderer"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"pathRenderer"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapFlightPathPlanRenderer"},(0,i.kt)("inlineCode",{parentName:"a"},"MapFlightPathPlanRenderer"))),(0,i.kt)("p",null,"The flight path renderer to use."),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/components/map/layers/MapFlightPlanLayer.tsx:34"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ref"},"ref"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"ref"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,i.kt)("p",null,"A reference to the display component."),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,"MapLayerProps.ref"),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/FSComponent.ts:125"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"updatefreq"},"updateFreq"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"updateFreq"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("p",null,"A subscribable which provides the maximum update frequency of the layer, in hertz. Note that the actual update\nfrequency will not exceed the update frequency of the layer's parent map. If not defined, the frequency will\ndefault to that of the layer's parent map."),(0,i.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,i.kt)("p",null,"MapLayerProps.updateFreq"),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/map/MapLayer.ts:22"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"waypointrenderer"},"waypointRenderer"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"waypointRenderer"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapWaypointRenderer"},(0,i.kt)("inlineCode",{parentName:"a"},"MapWaypointRenderer"))),(0,i.kt)("p",null,"The waypoint renderer to use."),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/components/map/layers/MapFlightPlanLayer.tsx:31"))}m.isMDXComponent=!0}}]);