"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[68977],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>c});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=i.createContext({}),p=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return i.createElement(o.Provider,{value:t},e.children)},k="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,o=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),k=p(n),u=a,c=k["".concat(o,".").concat(u)]||k[u]||m[u]||r;return n?i.createElement(c,l(l({ref:t},s),{},{components:n})):i.createElement(c,l({ref:t},s))}));function c(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,l=new Array(r);l[0]=u;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[k]="string"==typeof e?e:a,l[1]=d;for(var p=2;p<r;p++)l[p]=n[p];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}u.displayName="MDXCreateElement"},83299:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>m,frontMatter:()=>r,metadata:()=>d,toc:()=>p});var i=n(87462),a=(n(67294),n(3905));const r={id:"MapTrafficStatusIndicator",title:"Class: MapTrafficStatusIndicator",sidebar_label:"MapTrafficStatusIndicator",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"garminsdk/classes/MapTrafficStatusIndicator",id:"garminsdk/classes/MapTrafficStatusIndicator",title:"Class: MapTrafficStatusIndicator",description:"Displays a traffic operating status and optional altitude restriction mode indications.",source:"@site/docs/garminsdk/classes/MapTrafficStatusIndicator.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/MapTrafficStatusIndicator",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapTrafficStatusIndicator",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapTrafficStatusIndicator",title:"Class: MapTrafficStatusIndicator",sidebar_label:"MapTrafficStatusIndicator",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapTrafficOffScaleIndicator",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapTrafficOffScaleIndicator"},next:{title:"MapUnitsModule",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapUnitsModule"}},o={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"altModeStyle",id:"altmodestyle",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"altitudeRestrictionText",id:"altituderestrictiontext",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"contextType",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"disabledStyle",id:"disabledstyle",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"operatingModeSub",id:"operatingmodesub",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"rootStyle",id:"rootstyle",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"showSub",id:"showsub",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"ALT_RESTRICTION_TEXT",id:"alt_restriction_text",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"DISABLED_MODES",id:"disabled_modes",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"getContext",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"onAfterRender",id:"onafterrender",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"onBeforeRender",id:"onbeforerender",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"render",id:"render",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-16",level:4}],s={toc:p},k="wrapper";function m(e){let{components:t,...n}=e;return(0,a.kt)(k,(0,i.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Displays a traffic operating status and optional altitude restriction mode indications."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapTrafficStatusIndicatorProps"},(0,a.kt)("inlineCode",{parentName:"a"},"MapTrafficStatusIndicatorProps")),">"),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"MapTrafficStatusIndicator"))))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new MapTrafficStatusIndicator"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"props"),")"),(0,a.kt)("p",null,"Creates an instance of a DisplayComponent."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"props")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapTrafficStatusIndicatorProps"},(0,a.kt)("inlineCode",{parentName:"a"},"MapTrafficStatusIndicatorProps"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The propertis of the component.")))),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent<MapTrafficStatusIndicatorProps",">",".constructor"),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:73"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"altmodestyle"},"altModeStyle"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"altModeStyle"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"ObjectSubject"),"<{ ",(0,a.kt)("inlineCode",{parentName:"p"},"display"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")," = '' }",">"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/indicators/MapTrafficStatusIndicator.tsx:42"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"altituderestrictiontext"},"altitudeRestrictionText"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"altitudeRestrictionText"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"MappedSubscribable"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/indicators/MapTrafficStatusIndicator.tsx:44"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"context"},"context"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"context"),": [] = ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")),(0,a.kt)("p",null,"The context on this component, if any."),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent.context"),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:64"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"contexttype"},"contextType"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"contextType"),": readonly [] = ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")),(0,a.kt)("p",null,"The type of context for this component, if any."),(0,a.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent.contextType"),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:67"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"disabledstyle"},"disabledStyle"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"disabledStyle"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"ObjectSubject"),"<{ ",(0,a.kt)("inlineCode",{parentName:"p"},"display"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")," = '' }",">"),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/indicators/MapTrafficStatusIndicator.tsx:41"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"operatingmodesub"},"operatingModeSub"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"operatingModeSub"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/indicators/MapTrafficStatusIndicator.tsx:49"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"props"},"props"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"props"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MapTrafficStatusIndicatorProps"},(0,a.kt)("inlineCode",{parentName:"a"},"MapTrafficStatusIndicatorProps"))," & ",(0,a.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,a.kt)("p",null,"The properties of the component."),(0,a.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent.props"),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:61"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"rootstyle"},"rootStyle"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"rootStyle"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"ObjectSubject"),"<{ ",(0,a.kt)("inlineCode",{parentName:"p"},"display"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")," = '' }",">"),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/indicators/MapTrafficStatusIndicator.tsx:40"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"showsub"},"showSub"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"showSub"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/indicators/MapTrafficStatusIndicator.tsx:48"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"alt_restriction_text"},"ALT","_","RESTRICTION","_","TEXT"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"ALT","_","RESTRICTION","_","TEXT"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Object")),(0,a.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"0")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"1")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"2")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"3")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string"))))),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/indicators/MapTrafficStatusIndicator.tsx:33"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"disabled_modes"},"DISABLED","_","MODES"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"DISABLED","_","MODES"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Set"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"TcasOperatingMode"),">"),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/indicators/MapTrafficStatusIndicator.tsx:26"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"destroy"},"destroy"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides"},"Overrides"),(0,a.kt)("p",null,"DisplayComponent.destroy"),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/indicators/MapTrafficStatusIndicator.tsx:86"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"getcontext"},"getContext"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("strong",{parentName:"p"},"getContext"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"never")),(0,a.kt)("p",null,"Gets a context data subscription from the context collection."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,a.kt)("p",null,"An error if no data for the specified context type could be found."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"context")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"never")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The context to get the subscription for.")))),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"never")),(0,a.kt)("p",null,"The requested context."),(0,a.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent.getContext"),(0,a.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:106"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onafterrender"},"onAfterRender"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onAfterRender"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"overrides-1"},"Overrides"),(0,a.kt)("p",null,"DisplayComponent.onAfterRender"),(0,a.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/indicators/MapTrafficStatusIndicator.tsx:52"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onbeforerender"},"onBeforeRender"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onBeforeRender"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"A callback that is called before the component is rendered."),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent.onBeforeRender"),(0,a.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:80"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"render"},"render"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"render"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"VNode")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"VNode")),(0,a.kt)("h4",{id:"overrides-2"},"Overrides"),(0,a.kt)("p",null,"DisplayComponent.render"),(0,a.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,a.kt)("p",null,"garminsdk/components/map/indicators/MapTrafficStatusIndicator.tsx:65"))}m.isMDXComponent=!0}}]);