"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[70525],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>c});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=r.createContext({}),p=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return r.createElement(d.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),u=p(n),k=i,c=u["".concat(d,".").concat(k)]||u[k]||m[k]||a;return n?r.createElement(c,l(l({ref:t},s),{},{components:n})):r.createElement(c,l({ref:t},s))}));function c(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,l=new Array(a);l[0]=k;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[u]="string"==typeof e?e:i,l[1]=o;for(var p=2;p<a;p++)l[p]=n[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}k.displayName="MDXCreateElement"},99403:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>m,frontMatter:()=>a,metadata:()=>o,toc:()=>p});var r=n(87462),i=(n(67294),n(3905));const a={id:"MapRelativeTerrainStatusIndicator",title:"Class: MapRelativeTerrainStatusIndicator",sidebar_label:"MapRelativeTerrainStatusIndicator",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/classes/MapRelativeTerrainStatusIndicator",id:"garminsdk/classes/MapRelativeTerrainStatusIndicator",title:"Class: MapRelativeTerrainStatusIndicator",description:"Displays a relative terrain mode status indication.",source:"@site/docs/garminsdk/classes/MapRelativeTerrainStatusIndicator.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/MapRelativeTerrainStatusIndicator",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapRelativeTerrainStatusIndicator",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapRelativeTerrainStatusIndicator",title:"Class: MapRelativeTerrainStatusIndicator",sidebar_label:"MapRelativeTerrainStatusIndicator",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapRangeValueDisplay",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapRangeValueDisplay"},next:{title:"MapResourcePriority",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapResourcePriority"}},d={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"contextType",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"failedStyle",id:"failedstyle",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"isFailedSub",id:"isfailedsub",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"rootStyle",id:"rootstyle",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"showSub",id:"showsub",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"getContext",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"onAfterRender",id:"onafterrender",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"onBeforeRender",id:"onbeforerender",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"render",id:"render",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-12",level:4}],s={toc:p},u="wrapper";function m(e){let{components:t,...n}=e;return(0,i.kt)(u,(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Displays a relative terrain mode status indication."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapRelativeTerrainStatusIndicatorProps"},(0,i.kt)("inlineCode",{parentName:"a"},"MapRelativeTerrainStatusIndicatorProps")),">"),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"MapRelativeTerrainStatusIndicator"))))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new MapRelativeTerrainStatusIndicator"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"props"),")"),(0,i.kt)("p",null,"Creates an instance of a DisplayComponent."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"props")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapRelativeTerrainStatusIndicatorProps"},(0,i.kt)("inlineCode",{parentName:"a"},"MapRelativeTerrainStatusIndicatorProps"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The propertis of the component.")))),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,"DisplayComponent<MapRelativeTerrainStatusIndicatorProps",">",".constructor"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:72"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"context"},"context"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"context"),": [] = ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")),(0,i.kt)("p",null,"The context on this component, if any."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,"DisplayComponent.context"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:63"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"contexttype"},"contextType"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"contextType"),": readonly [] = ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")),(0,i.kt)("p",null,"The type of context for this component, if any."),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,"DisplayComponent.contextType"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:66"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"failedstyle"},"failedStyle"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"failedStyle"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"ObjectSubject"),"<{ ",(0,i.kt)("inlineCode",{parentName:"p"},"display"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = '' }",">"),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/indicators/MapRelativeTerrainStatusIndicator.tsx:22"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isfailedsub"},"isFailedSub"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"isFailedSub"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/indicators/MapRelativeTerrainStatusIndicator.tsx:25"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"props"},"props"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"props"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapRelativeTerrainStatusIndicatorProps"},(0,i.kt)("inlineCode",{parentName:"a"},"MapRelativeTerrainStatusIndicatorProps"))," & ",(0,i.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,i.kt)("p",null,"The properties of the component."),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,"DisplayComponent.props"),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:60"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"rootstyle"},"rootStyle"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"rootStyle"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"ObjectSubject"),"<{ ",(0,i.kt)("inlineCode",{parentName:"p"},"display"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = '' }",">"),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/indicators/MapRelativeTerrainStatusIndicator.tsx:21"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"showsub"},"showSub"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"showSub"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/indicators/MapRelativeTerrainStatusIndicator.tsx:24"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"destroy"},"destroy"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"overrides"},"Overrides"),(0,i.kt)("p",null,"DisplayComponent.destroy"),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/indicators/MapRelativeTerrainStatusIndicator.tsx:54"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"getcontext"},"getContext"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("strong",{parentName:"p"},"getContext"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"never")),(0,i.kt)("p",null,"Gets a context data subscription from the context collection."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"An error if no data for the specified context type could be found."),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"context")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"never")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The context to get the subscription for.")))),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"never")),(0,i.kt)("p",null,"The requested context."),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,"DisplayComponent.getContext"),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:105"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onafterrender"},"onAfterRender"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onAfterRender"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"overrides-1"},"Overrides"),(0,i.kt)("p",null,"DisplayComponent.onAfterRender"),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/indicators/MapRelativeTerrainStatusIndicator.tsx:28"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onbeforerender"},"onBeforeRender"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onBeforeRender"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback that is called before the component is rendered."),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,i.kt)("p",null,"DisplayComponent.onBeforeRender"),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:79"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"render"},"render"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"render"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"VNode")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"VNode")),(0,i.kt)("h4",{id:"overrides-2"},"Overrides"),(0,i.kt)("p",null,"DisplayComponent.render"),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/map/indicators/MapRelativeTerrainStatusIndicator.tsx:39"))}m.isMDXComponent=!0}}]);