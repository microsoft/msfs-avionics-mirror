"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[84835],{3905:(e,n,t)=>{t.d(n,{Zo:()=>s,kt:()=>c});var i=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,i,r=function(e,n){if(null==e)return{};var t,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var p=i.createContext({}),d=function(e){var n=i.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},s=function(e){var n=d(e.components);return i.createElement(p.Provider,{value:n},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},k=i.forwardRef((function(e,n){var t=e.components,r=e.mdxType,a=e.originalType,p=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),u=d(t),k=r,c=u["".concat(p,".").concat(k)]||u[k]||m[k]||a;return t?i.createElement(c,l(l({ref:n},s),{},{components:t})):i.createElement(c,l({ref:n},s))}));function c(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var a=t.length,l=new Array(a);l[0]=k;var o={};for(var p in n)hasOwnProperty.call(n,p)&&(o[p]=n[p]);o.originalType=e,o[u]="string"==typeof e?e:r,l[1]=o;for(var d=2;d<a;d++)l[d]=t[d];return i.createElement.apply(null,l)}return i.createElement.apply(null,t)}k.displayName="MDXCreateElement"},46810:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>p,contentTitle:()=>l,default:()=>m,frontMatter:()=>a,metadata:()=>o,toc:()=>d});var i=t(87462),r=(t(67294),t(3905));const a={id:"MapRangeDisplay",title:"Class: MapRangeDisplay",sidebar_label:"MapRangeDisplay",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"g1000common/classes/MapRangeDisplay",id:"g1000common/classes/MapRangeDisplay",title:"Class: MapRangeDisplay",description:"The map layer showing the range display.",source:"@site/docs/g1000common/classes/MapRangeDisplay.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/MapRangeDisplay",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/MapRangeDisplay",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapRangeDisplay",title:"Class: MapRangeDisplay",sidebar_label:"MapRangeDisplay",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapOptMenu",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/MapOptMenu"},next:{title:"MapRangeSettingControl",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/MapRangeSettingControl"}},p={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"autoOverrideSubject",id:"autooverridesubject",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"autoSubject",id:"autosubject",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"contextType",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"displayUnitHandler",id:"displayunithandler",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Returns",id:"returns",level:5},{value:"Defined in",id:"defined-in-5",level:4},{value:"displayUnitSub",id:"displayunitsub",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"getContext",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"onAfterRender",id:"onafterrender",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"onBeforeRender",id:"onbeforerender",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"render",id:"render",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"updateDisplayUnit",id:"updatedisplayunit",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-13",level:4}],s={toc:d},u="wrapper";function m(e){let{components:n,...t}=e;return(0,r.kt)(u,(0,i.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"The map layer showing the range display."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapRangeDisplayProps"},(0,r.kt)("inlineCode",{parentName:"a"},"MapRangeDisplayProps")),">"),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"MapRangeDisplay"))))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new MapRangeDisplay"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"props"),")"),(0,r.kt)("p",null,"Creates an instance of a DisplayComponent."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"props")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapRangeDisplayProps"},(0,r.kt)("inlineCode",{parentName:"a"},"MapRangeDisplayProps"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The propertis of the component.")))),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,"DisplayComponent<MapRangeDisplayProps",">",".constructor"),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:72"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"autooverridesubject"},"autoOverrideSubject"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"autoOverrideSubject"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/MapRangeDisplay.tsx:27"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"autosubject"},"autoSubject"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"autoSubject"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/MapRangeDisplay.tsx:26"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"context"},"context"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"context"),": [] = ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")),(0,r.kt)("p",null,"The context on this component, if any."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,"DisplayComponent.context"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:63"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"contexttype"},"contextType"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"contextType"),": readonly [] = ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")),(0,r.kt)("p",null,"The type of context for this component, if any."),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,"DisplayComponent.contextType"),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:66"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"displayunithandler"},"displayUnitHandler"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"displayUnitHandler"),": () => ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,r.kt)("p",null,"\u25b8 (): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Updates this component's display unit."),(0,r.kt)("h5",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/MapRangeDisplay.tsx:29"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"displayunitsub"},"displayUnitSub"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"displayUnitSub"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Distance"),">",">"),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/MapRangeDisplay.tsx:25"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"props"},"props"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"props"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/MapRangeDisplayProps"},(0,r.kt)("inlineCode",{parentName:"a"},"MapRangeDisplayProps"))," & ",(0,r.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,r.kt)("p",null,"The properties of the component."),(0,r.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,r.kt)("p",null,"DisplayComponent.props"),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:60"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"destroy"},"destroy"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Destroys this component."),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,r.kt)("p",null,"DisplayComponent.destroy"),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:97"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getcontext"},"getContext"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"getContext"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"never")),(0,r.kt)("p",null,"Gets a context data subscription from the context collection."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"An error if no data for the specified context type could be found."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"context")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"never")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The context to get the subscription for.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"never")),(0,r.kt)("p",null,"The requested context."),(0,r.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,r.kt)("p",null,"DisplayComponent.getContext"),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:105"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onafterrender"},"onAfterRender"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onAfterRender"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"overrides"},"Overrides"),(0,r.kt)("p",null,"DisplayComponent.onAfterRender"),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/MapRangeDisplay.tsx:32"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onbeforerender"},"onBeforeRender"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onBeforeRender"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"A callback that is called before the component is rendered."),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,r.kt)("p",null,"DisplayComponent.onBeforeRender"),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:79"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"render"},"render"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"render"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"VNode")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"VNode")),(0,r.kt)("h4",{id:"overrides-1"},"Overrides"),(0,r.kt)("p",null,"DisplayComponent.render"),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/MapRangeDisplay.tsx:65"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"updatedisplayunit"},"updateDisplayUnit"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"updateDisplayUnit"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Updates this component's display unit."),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/map/MapRangeDisplay.tsx:40"))}m.isMDXComponent=!0}}]);