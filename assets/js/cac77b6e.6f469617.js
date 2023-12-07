"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[56751],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>h});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=r.createContext({}),p=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return r.createElement(d.Provider,{value:t},e.children)},k="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),k=p(n),m=i,h=k["".concat(d,".").concat(m)]||k[m]||u[m]||a;return n?r.createElement(h,l(l({ref:t},s),{},{components:n})):r.createElement(h,l({ref:t},s))}));function h(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,l=new Array(a);l[0]=m;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[k]="string"==typeof e?e:i,l[1]=o;for(var p=2;p<a;p++)l[p]=n[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},16114:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>u,frontMatter:()=>a,metadata:()=>o,toc:()=>p});var r=n(87462),i=(n(67294),n(3905));const a={id:"ArtificialHorizon",title:"Class: ArtificialHorizon",sidebar_label:"ArtificialHorizon",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/classes/ArtificialHorizon",id:"garminsdk/classes/ArtificialHorizon",title:"Class: ArtificialHorizon",description:"A PFD artificial horizon. Renders sky and ground boxes.",source:"@site/docs/garminsdk/classes/ArtificialHorizon.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/ArtificialHorizon",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/ArtificialHorizon",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"ArtificialHorizon",title:"Class: ArtificialHorizon",sidebar_label:"ArtificialHorizon",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"ApproachNameDisplay",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/ApproachNameDisplay"},next:{title:"AttitudeAircraftSymbol",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/AttitudeAircraftSymbol"}},d={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"contextType",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"Accessors",id:"accessors",level:2},{value:"display",id:"display",level:3},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"projection",id:"projection",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"Methods",id:"methods",level:2},{value:"attach",id:"attach",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"getContext",id:"getcontext",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"isAttached",id:"isattached",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"isVisible",id:"isvisible",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"onAfterRender",id:"onafterrender",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"onAttached",id:"onattached",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"onBeforeRender",id:"onbeforerender",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"onProjectionChanged",id:"onprojectionchanged",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-10",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"onSleep",id:"onsleep",level:3},{value:"Returns",id:"returns-11",level:4},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"onUpdated",id:"onupdated",level:3},{value:"Returns",id:"returns-12",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"onVisibilityChanged",id:"onvisibilitychanged",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-13",level:4},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"onWake",id:"onwake",level:3},{value:"Returns",id:"returns-14",level:4},{value:"Inherited from",id:"inherited-from-14",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"render",id:"render",level:3},{value:"Returns",id:"returns-15",level:4},{value:"Inherited from",id:"inherited-from-15",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"setVisible",id:"setvisible",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-16",level:4},{value:"Inherited from",id:"inherited-from-16",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"shouldInvalidate",id:"shouldinvalidate",level:3},{value:"Returns",id:"returns-17",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"Defined in",id:"defined-in-21",level:4}],s={toc:p},k="wrapper";function u(e){let{components:t,...n}=e;return(0,i.kt)(k,(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A PFD artificial horizon. Renders sky and ground boxes."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"p"},"HorizonSharedCanvasSubLayer"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/ArtificalHorizonProps"},(0,i.kt)("inlineCode",{parentName:"a"},"ArtificalHorizonProps")),">"),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"ArtificialHorizon"))))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new ArtificialHorizon"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"props"),")"),(0,i.kt)("p",null,"Creates an instance of a DisplayComponent."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"props")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/ArtificalHorizonProps"},(0,i.kt)("inlineCode",{parentName:"a"},"ArtificalHorizonProps"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The propertis of the component.")))),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer<ArtificalHorizonProps",">",".constructor"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:73"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"context"},"context"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"context"),": [] = ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")),(0,i.kt)("p",null,"The context on this component, if any."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.context"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:64"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"contexttype"},"contextType"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"contextType"),": readonly [] = ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")),(0,i.kt)("p",null,"The type of context for this component, if any."),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.contextType"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:67"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"props"},"props"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"props"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/ArtificalHorizonProps"},(0,i.kt)("inlineCode",{parentName:"a"},"ArtificalHorizonProps"))," & ",(0,i.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,i.kt)("p",null,"The properties of the component."),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.props"),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:61"),(0,i.kt)("h2",{id:"accessors"},"Accessors"),(0,i.kt)("h3",{id:"display"},"display"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("inlineCode",{parentName:"p"},"get")," ",(0,i.kt)("strong",{parentName:"p"},"display"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"HorizonSharedCanvasInstance")),(0,i.kt)("p",null,"This sublayer's shared canvas instance."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"Error if this sublayer is not attached."),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"HorizonSharedCanvasInstance")),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.display"),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"sdk/components/horizon/layers/HorizonSharedCanvasLayer.tsx:174"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"projection"},"projection"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("inlineCode",{parentName:"p"},"get")," ",(0,i.kt)("strong",{parentName:"p"},"projection"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"HorizonProjection")),(0,i.kt)("p",null,"This sublayer's horizon projection."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"Error if this sublayer is not attached."),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"HorizonProjection")),(0,i.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.projection"),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"sdk/components/horizon/layers/HorizonSharedCanvasLayer.tsx:161"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"attach"},"attach"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"attach"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"projection"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"display"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Attaches this sublayer to a parent layer."),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"projection")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"HorizonProjection")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The horizon projection used by this sublayer.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"display")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"HorizonSharedCanvasInstance")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The canvas instance shared by this sublayer.")))),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.attach"),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"sdk/components/horizon/layers/HorizonSharedCanvasLayer.tsx:203"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"destroy"},"destroy"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"overrides"},"Overrides"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.destroy"),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/ArtificialHorizon.tsx:267"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"getcontext"},"getContext"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("strong",{parentName:"p"},"getContext"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"never")),(0,i.kt)("p",null,"Gets a context data subscription from the context collection."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"An error if no data for the specified context type could be found."),(0,i.kt)("h4",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"context")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"never")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The context to get the subscription for.")))),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"never")),(0,i.kt)("p",null,"The requested context."),(0,i.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.getContext"),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:106"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isattached"},"isAttached"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("strong",{parentName:"p"},"isAttached"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Checks whether this sublayer is attached to a parent layer."),(0,i.kt)("h4",{id:"returns-5"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether this sublayer is attached to a parent layer."),(0,i.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.isAttached"),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"sdk/components/horizon/layers/HorizonSharedCanvasLayer.tsx:186"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"isvisible"},"isVisible"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("strong",{parentName:"p"},"isVisible"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Checks whether this sublayer is visible."),(0,i.kt)("h4",{id:"returns-6"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether this sublayer is visible."),(0,i.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.isVisible"),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"sdk/components/horizon/layers/HorizonSharedCanvasLayer.tsx:194"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onafterrender"},"onAfterRender"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onAfterRender"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"node"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback that is called after the component is rendered."),(0,i.kt)("h4",{id:"parameters-3"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"node")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"VNode")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The component's VNode.")))),(0,i.kt)("h4",{id:"returns-7"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.onAfterRender"),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:87"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onattached"},"onAttached"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onAttached"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns-8"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"overrides-1"},"Overrides"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.onAttached"),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/ArtificialHorizon.tsx:94"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onbeforerender"},"onBeforeRender"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onBeforeRender"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback that is called before the component is rendered."),(0,i.kt)("h4",{id:"returns-9"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.onBeforeRender"),(0,i.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:80"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onprojectionchanged"},"onProjectionChanged"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onProjectionChanged"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"projection"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"changeFlags"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"parameters-4"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"projection")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"HorizonProjection"))),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"changeFlags")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number"))))),(0,i.kt)("h4",{id:"returns-10"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"overrides-2"},"Overrides"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.onProjectionChanged"),(0,i.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/ArtificialHorizon.tsx:103"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onsleep"},"onSleep"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onSleep"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"This method is called when this sublayer's parent layer is put to sleep."),(0,i.kt)("h4",{id:"returns-11"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-12"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.onSleep"),(0,i.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,i.kt)("p",null,"sdk/components/horizon/layers/HorizonSharedCanvasLayer.tsx:255"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onupdated"},"onUpdated"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onUpdated"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns-12"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"overrides-3"},"Overrides"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.onUpdated"),(0,i.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/ArtificialHorizon.tsx:115"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onvisibilitychanged"},"onVisibilityChanged"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("strong",{parentName:"p"},"onVisibilityChanged"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"isVisible"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"This method is called when this layer's visibility changes."),(0,i.kt)("h4",{id:"parameters-5"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"isVisible")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether the layer is now visible.")))),(0,i.kt)("h4",{id:"returns-13"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-13"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.onVisibilityChanged"),(0,i.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,i.kt)("p",null,"sdk/components/horizon/layers/HorizonSharedCanvasLayer.tsx:234"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onwake"},"onWake"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onWake"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"This method is called when this sublayer's parent layer is awakened."),(0,i.kt)("h4",{id:"returns-14"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-14"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.onWake"),(0,i.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,i.kt)("p",null,"sdk/components/horizon/layers/HorizonSharedCanvasLayer.tsx:248"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"render"},"render"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"render"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"VNode")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns-15"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"VNode")),(0,i.kt)("h4",{id:"inherited-from-15"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.render"),(0,i.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,i.kt)("p",null,"sdk/components/horizon/layers/HorizonSharedCanvasLayer.tsx:293"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"setvisible"},"setVisible"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"setVisible"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"val"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Sets this sublayer's visibility."),(0,i.kt)("h4",{id:"parameters-6"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"val")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether this sublayer should be visible.")))),(0,i.kt)("h4",{id:"returns-16"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-16"},"Inherited from"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.setVisible"),(0,i.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,i.kt)("p",null,"sdk/components/horizon/layers/HorizonSharedCanvasLayer.tsx:218"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"shouldinvalidate"},"shouldInvalidate"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"shouldInvalidate"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns-17"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("h4",{id:"overrides-4"},"Overrides"),(0,i.kt)("p",null,"HorizonSharedCanvasSubLayer.shouldInvalidate"),(0,i.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,i.kt)("p",null,"garminsdk/components/nextgenpfd/horizon/ArtificialHorizon.tsx:110"))}u.isMDXComponent=!0}}]);