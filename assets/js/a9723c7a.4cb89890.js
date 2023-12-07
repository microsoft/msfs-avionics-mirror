"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[86531],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>c});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},l=Object.keys(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var p=r.createContext({}),d=function(e){var t=r.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},m=function(e){var t=d(e.components);return r.createElement(p.Provider,{value:t},e.children)},s="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},N=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,l=e.originalType,p=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),s=d(a),N=n,c=s["".concat(p,".").concat(N)]||s[N]||k[N]||l;return a?r.createElement(c,i(i({ref:t},m),{},{components:a})):r.createElement(c,i({ref:t},m))}));function c(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var l=a.length,i=new Array(l);i[0]=N;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[s]="string"==typeof e?e:n,i[1]=o;for(var d=2;d<l;d++)i[d]=a[d];return r.createElement.apply(null,i)}return r.createElement.apply(null,a)}N.displayName="MDXCreateElement"},55719:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>k,frontMatter:()=>l,metadata:()=>o,toc:()=>d});var r=a(87462),n=(a(67294),a(3905));const l={id:"DefaultMapSystemContext",title:"Class: DefaultMapSystemContext<Modules, Layers, Controllers>",sidebar_label:"DefaultMapSystemContext",sidebar_position:0,custom_edit_url:null},i=void 0,o={unversionedId:"framework/classes/DefaultMapSystemContext",id:"framework/classes/DefaultMapSystemContext",title:"Class: DefaultMapSystemContext<Modules, Layers, Controllers>",description:"An implementation of the base properties in MapSystemContext.",source:"@site/docs/framework/classes/DefaultMapSystemContext.md",sourceDirName:"framework/classes",slug:"/framework/classes/DefaultMapSystemContext",permalink:"/msfs-avionics-mirror/docs/framework/classes/DefaultMapSystemContext",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"DefaultMapSystemContext",title:"Class: DefaultMapSystemContext<Modules, Layers, Controllers>",sidebar_label:"DefaultMapSystemContext",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"DefaultMapLabeledRingLabel",permalink:"/msfs-avionics-mirror/docs/framework/classes/DefaultMapLabeledRingLabel"},next:{title:"DefaultTcasAdvisoryDataProvider",permalink:"/msfs-avionics-mirror/docs/framework/classes/DefaultTcasAdvisoryDataProvider"}},p={},d=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"deadZone",id:"deadzone",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"model",id:"model",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"projectedSize",id:"projectedsize",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"projection",id:"projection",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"Methods",id:"methods",level:2},{value:"getController",id:"getcontroller",level:3},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"getLayer",id:"getlayer",level:3},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"setController",id:"setcontroller",level:3},{value:"Type parameters",id:"type-parameters-4",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"setLayer",id:"setlayer",level:3},{value:"Type parameters",id:"type-parameters-5",level:4},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-9",level:4}],m={toc:d},s="wrapper";function k(e){let{components:t,...a}=e;return(0,n.kt)(s,(0,r.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"An implementation of the base properties in ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#mapsystemcontext"},"MapSystemContext"),"."),(0,n.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Modules")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#modulerecord"},(0,n.kt)("inlineCode",{parentName:"a"},"ModuleRecord"))," = ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#emptyrecord"},(0,n.kt)("inlineCode",{parentName:"a"},"EmptyRecord")))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Layers")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#layerrecord"},(0,n.kt)("inlineCode",{parentName:"a"},"LayerRecord"))," = ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#emptyrecord"},(0,n.kt)("inlineCode",{parentName:"a"},"EmptyRecord")))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Controllers")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#controllerrecord"},(0,n.kt)("inlineCode",{parentName:"a"},"ControllerRecord"))," = ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#emptyrecord"},(0,n.kt)("inlineCode",{parentName:"a"},"EmptyRecord")))))),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new DefaultMapSystemContext"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Modules"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"Layers"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"Controllers"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"projection"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"projectedSize"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"deadZone"),")"),(0,n.kt)("p",null,"Creates an instance of a MapSystemContext."),(0,n.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Modules")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#modulerecord"},(0,n.kt)("inlineCode",{parentName:"a"},"ModuleRecord"))," = ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#emptyrecord"},(0,n.kt)("inlineCode",{parentName:"a"},"EmptyRecord")))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Layers")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#layerrecord"},(0,n.kt)("inlineCode",{parentName:"a"},"LayerRecord"))," = ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#emptyrecord"},(0,n.kt)("inlineCode",{parentName:"a"},"EmptyRecord")))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Controllers")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#controllerrecord"},(0,n.kt)("inlineCode",{parentName:"a"},"ControllerRecord"))," = ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#emptyrecord"},(0,n.kt)("inlineCode",{parentName:"a"},"EmptyRecord")))))),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"bus")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/EventBus"},(0,n.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"This context's event bus.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"projection")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/MapProjection"},(0,n.kt)("inlineCode",{parentName:"a"},"MapProjection"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"This context's map projection.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"projectedSize")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscribable"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscribable")),"<",(0,n.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,n.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,n.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,n.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},'"copyWithin"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},'"sort"'),">",">",">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A subscribable which provides the projected size of this context's map.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"deadZone")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscribable"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscribable")),"<",(0,n.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,n.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,n.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,n.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},'"copyWithin"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},'"sort"'),">",">",">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A subscribable which provides the dead zone of this context's map.")))),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/MapSystemContext.ts:91"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"bus"},"bus"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"bus"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/EventBus"},(0,n.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,n.kt)("p",null,"This context's event bus."),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/MapSystemContext.ts:92"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"deadzone"},"deadZone"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"deadZone"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscribable"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscribable")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Omit"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Float64Array"),", ",(0,n.kt)("inlineCode",{parentName:"p"},'"set"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"p"},'"copyWithin"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"p"},'"sort"'),">",">",">"),(0,n.kt)("p",null,"A subscribable which provides the dead zone of this context's map."),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/MapSystemContext.ts:95"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"model"},"model"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"model"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapModel"},(0,n.kt)("inlineCode",{parentName:"a"},"MapModel")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Modules"),">"),(0,n.kt)("p",null,"This context's map model."),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/MapSystemContext.ts:79"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"projectedsize"},"projectedSize"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"projectedSize"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Subscribable"},(0,n.kt)("inlineCode",{parentName:"a"},"Subscribable")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Omit"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"Float64Array"),", ",(0,n.kt)("inlineCode",{parentName:"p"},'"set"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"p"},'"copyWithin"')," ","|"," ",(0,n.kt)("inlineCode",{parentName:"p"},'"sort"'),">",">",">"),(0,n.kt)("p",null,"A subscribable which provides the projected size of this context's map."),(0,n.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/MapSystemContext.ts:94"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"projection"},"projection"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"projection"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapProjection"},(0,n.kt)("inlineCode",{parentName:"a"},"MapProjection"))),(0,n.kt)("p",null,"This context's map projection."),(0,n.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/MapSystemContext.ts:93"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"getcontroller"},"getController"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"getController"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"key"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"Controllers"),"[",(0,n.kt)("inlineCode",{parentName:"p"},"K"),"]"),(0,n.kt)("p",null,"Retrieves a controller from this context."),(0,n.kt)("h4",{id:"type-parameters-2"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"K")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("inlineCode",{parentName:"td"},"string"))))),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"key")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"K")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The key fo the controller to retrieve.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"Controllers"),"[",(0,n.kt)("inlineCode",{parentName:"p"},"K"),"]"),(0,n.kt)("p",null,"The controller in this context with the specified key."),(0,n.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/MapSystemContext.ts:113"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"getlayer"},"getLayer"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"getLayer"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"key"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"Layers"),"[",(0,n.kt)("inlineCode",{parentName:"p"},"K"),"]"," & ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},(0,n.kt)("inlineCode",{parentName:"a"},"MapLayer")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps"},(0,n.kt)("inlineCode",{parentName:"a"},"MapLayerProps")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"any"),">",">"),(0,n.kt)("p",null,"Retrieves a layer from this context."),(0,n.kt)("h4",{id:"type-parameters-3"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"K")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("inlineCode",{parentName:"td"},"string"))))),(0,n.kt)("h4",{id:"parameters-2"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"key")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"K")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The key of the layer to retrieve.")))),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"Layers"),"[",(0,n.kt)("inlineCode",{parentName:"p"},"K"),"]"," & ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapLayer"},(0,n.kt)("inlineCode",{parentName:"a"},"MapLayer")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapLayerProps"},(0,n.kt)("inlineCode",{parentName:"a"},"MapLayerProps")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"any"),">",">"),(0,n.kt)("p",null,"The layer in this context with the specified key."),(0,n.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/MapSystemContext.ts:104"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"setcontroller"},"setController"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"setController"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"key"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"controller"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Adds a controller to this context."),(0,n.kt)("h4",{id:"type-parameters-4"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"K")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("inlineCode",{parentName:"td"},"string"))))),(0,n.kt)("h4",{id:"parameters-3"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"key")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"K")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The key of the controller to add.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"controller")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Controllers"),"[",(0,n.kt)("inlineCode",{parentName:"td"},"K"),"]"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The controller to add.")))),(0,n.kt)("h4",{id:"returns-2"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/MapSystemContext.ts:131"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"setlayer"},"setLayer"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"setLayer"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"K"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"key"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"layer"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Adds a layer to this context."),(0,n.kt)("h4",{id:"type-parameters-5"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"K")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("inlineCode",{parentName:"td"},"string"))))),(0,n.kt)("h4",{id:"parameters-4"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"key")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"K")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The key of the layer to add.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"layer")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Layers"),"[",(0,n.kt)("inlineCode",{parentName:"td"},"K"),"]"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The layer to add.")))),(0,n.kt)("h4",{id:"returns-3"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,n.kt)("p",null,"src/sdk/components/mapsystem/MapSystemContext.ts:122"))}k.isMDXComponent=!0}}]);