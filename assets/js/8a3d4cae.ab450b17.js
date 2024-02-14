"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[53958],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>u});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=a.createContext({}),p=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return a.createElement(d.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=p(n),c=i,u=m["".concat(d,".").concat(c)]||m[c]||k[c]||r;return n?a.createElement(u,l(l({ref:t},s),{},{components:n})):a.createElement(u,l({ref:t},s))}));function u(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,l=new Array(r);l[0]=c;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:i,l[1]=o;for(var p=2;p<r;p++)l[p]=n[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},14468:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>k,frontMatter:()=>r,metadata:()=>o,toc:()=>p});var a=n(87462),i=(n(67294),n(3905));const r={id:"G3000GtcPlugin",title:"Interface: G3000GtcPlugin",sidebar_label:"G3000GtcPlugin",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"g3000gtc/interfaces/G3000GtcPlugin",id:"g3000gtc/interfaces/G3000GtcPlugin",title:"Interface: G3000GtcPlugin",description:"A G3000 GTC plugin.",source:"@site/docs/g3000gtc/interfaces/G3000GtcPlugin.md",sourceDirName:"g3000gtc/interfaces",slug:"/g3000gtc/interfaces/G3000GtcPlugin",permalink:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/G3000GtcPlugin",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"G3000GtcPlugin",title:"Interface: G3000GtcPlugin",sidebar_label:"G3000GtcPlugin",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FrequencyInputProps",permalink:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/FrequencyInputProps"},next:{title:"G3000GtcPluginBinder",permalink:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/G3000GtcPluginBinder"}},d={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"binder",id:"binder",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"onComponentCreated",id:"oncomponentcreated",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Parameters",id:"parameters",level:5},{value:"Returns",id:"returns",level:5},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"onComponentCreating",id:"oncomponentcreating",level:3},{value:"Type declaration",id:"type-declaration-1",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-1",level:5},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"onComponentRendered",id:"oncomponentrendered",level:3},{value:"Type declaration",id:"type-declaration-2",level:4},{value:"Parameters",id:"parameters-2",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"getKnobStateOverrides",id:"getknobstateoverrides",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"getLabelBarHandlers",id:"getlabelbarhandlers",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"loadCss",id:"loadcss",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"onGtcInteractionEvent",id:"ongtcinteractionevent",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"onInit",id:"oninit",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"onInstalled",id:"oninstalled",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"registerGtcViews",id:"registergtcviews",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-10",level:4}],s={toc:p},m="wrapper";function k(e){let{components:t,...n}=e;return(0,i.kt)(m,(0,a.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A G3000 GTC plugin."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"p"},"G3000Plugin"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/G3000GtcPluginBinder"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000GtcPluginBinder")),">")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcInteractionHandler"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcInteractionHandler"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"G3000GtcPlugin"))))),(0,i.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000gtc/classes/AbstractG3000GtcPlugin"},(0,i.kt)("inlineCode",{parentName:"a"},"AbstractG3000GtcPlugin")))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"binder"},"binder"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"binder"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/G3000GtcPluginBinder"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000GtcPluginBinder"))),(0,i.kt)("p",null,"The avionics specific plugin binder to accept from the system."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,"G3000Plugin.binder"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:1424"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"oncomponentcreated"},"onComponentCreated"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"onComponentCreated"),": (",(0,i.kt)("inlineCode",{parentName:"p"},"component"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),", []",">",") => ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"An optional hook called when a component is created. If this hook is present,\nit will be called for EVERY component instantiation, so be sure to ensure\nthat this code is well optimized."),(0,i.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (",(0,i.kt)("inlineCode",{parentName:"p"},"component"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"An optional hook called when a component is created. If this hook is present,\nit will be called for EVERY component instantiation, so be sure to ensure\nthat this code is well optimized."),(0,i.kt)("h5",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"component")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"DisplayComponent"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"any"),", []",">")))),(0,i.kt)("h5",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,"G3000Plugin.onComponentCreated"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:1444"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"oncomponentcreating"},"onComponentCreating"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"onComponentCreating"),": (",(0,i.kt)("inlineCode",{parentName:"p"},"constructor"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"DisplayComponentFactory"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),", []",">",", ",(0,i.kt)("inlineCode",{parentName:"p"},"props"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"any"),") => ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),", []",">"),(0,i.kt)("p",null,"An optional hook called when a component is about to be created. Returning a component causes\nthat component to be used instead of the one that was to be created, and returning undefined\nwill cause the original component to be created. If this hook is present, it will be called\nfor EVERY component instantiation, so be sure to ensure that this code is well optimized."),(0,i.kt)("h4",{id:"type-declaration-1"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (",(0,i.kt)("inlineCode",{parentName:"p"},"constructor"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"props"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),", []",">"),(0,i.kt)("p",null,"An optional hook called when a component is about to be created. Returning a component causes\nthat component to be used instead of the one that was to be created, and returning undefined\nwill cause the original component to be created. If this hook is present, it will be called\nfor EVERY component instantiation, so be sure to ensure that this code is well optimized."),(0,i.kt)("h5",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"constructor")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"DisplayComponentFactory"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"any"),", []",">")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"props")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"any"))))),(0,i.kt)("h5",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),", []",">"),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,"G3000Plugin.onComponentCreating"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:1437"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"oncomponentrendered"},"onComponentRendered"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"onComponentRendered"),": (",(0,i.kt)("inlineCode",{parentName:"p"},"node"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"VNode"),") => ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"An optional hook called when a component has completed rendering. If this hook\nis present, it will be called for EVERY component render completion, so be sure\nto ensure that this code is well optimized."),(0,i.kt)("h4",{id:"type-declaration-2"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (",(0,i.kt)("inlineCode",{parentName:"p"},"node"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"An optional hook called when a component has completed rendering. If this hook\nis present, it will be called for EVERY component render completion, so be sure\nto ensure that this code is well optimized."),(0,i.kt)("h5",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"node")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"VNode"))))),(0,i.kt)("h5",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,"G3000Plugin.onComponentRendered"),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:1451"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"getknobstateoverrides"},"getKnobStateOverrides"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"getKnobStateOverrides"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"gtcService"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtcknobstatepluginoverrides"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcKnobStatePluginOverrides")),">"),(0,i.kt)("p",null,"Gets a set of GTC knob control state overrides. The knob control state overrides (if they are not ",(0,i.kt)("inlineCode",{parentName:"p"},"null"),") will be\napplied in place of the states defined by the base G3000 system ",(0,i.kt)("em",{parentName:"p"},"and")," any plugins that were loaded before this\none."),(0,i.kt)("h4",{id:"parameters-3"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"gtcService")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcService"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcService"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The GTC service.")))),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtcknobstatepluginoverrides"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcKnobStatePluginOverrides")),">"),(0,i.kt)("p",null,"A set of GTC knob state overrides, or ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," if this plugin does not define any overrides."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/G3000GTCPlugin.ts:51"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"getlabelbarhandlers"},"getLabelBarHandlers"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"getLabelBarHandlers"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#labelbarpluginhandlers"},(0,i.kt)("inlineCode",{parentName:"a"},"LabelBarPluginHandlers")),">"),(0,i.kt)("p",null,"Gets a set of GTC label bar handlers. The labels returned by the handlers (if they are not ",(0,i.kt)("inlineCode",{parentName:"p"},"null"),") will be applied\nin place of the labels defined by the base G3000 system ",(0,i.kt)("em",{parentName:"p"},"and")," any plugins that were loaded before this one."),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#labelbarpluginhandlers"},(0,i.kt)("inlineCode",{parentName:"a"},"LabelBarPluginHandlers")),">"),(0,i.kt)("p",null,"A set of GTC label bar handlers, or ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," if this plugin does not define any handlers."),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/G3000GTCPlugin.ts:58"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"loadcss"},"loadCss"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"loadCss"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"uri"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,i.kt)("p",null,"Loads a CSS file into the instrument."),(0,i.kt)("h4",{id:"parameters-4"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"uri")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"string")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The URI to the CSS file.")))),(0,i.kt)("h4",{id:"returns-5"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,"G3000Plugin.loadCss"),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:1457"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ongtcinteractionevent"},"onGtcInteractionEvent"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onGtcInteractionEvent"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"event"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Handles a ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtcinteractionevent-1"},"GtcInteractionEvent"),"."),(0,i.kt)("h4",{id:"parameters-5"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"event")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtcinteractionevent"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcInteractionEvent"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The event to handle.")))),(0,i.kt)("h4",{id:"returns-6"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether the event was handled."),(0,i.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcInteractionHandler"},"GtcInteractionHandler"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcInteractionHandler#ongtcinteractionevent"},"onGtcInteractionEvent")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcInteractionEvent.ts:51"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"oninit"},"onInit"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onInit"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Lifecycle method called during instrument initialization."),(0,i.kt)("h4",{id:"returns-7"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,i.kt)("p",null,"G3000Plugin.onInit"),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/G3000Plugin.ts:50"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"oninstalled"},"onInstalled"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onInstalled"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback run when the plugin has been installed."),(0,i.kt)("h4",{id:"returns-8"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,i.kt)("p",null,"G3000Plugin.onInstalled"),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:1429"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"registergtcviews"},"registerGtcViews"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"registerGtcViews"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"gtcService"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Registers GTC views."),(0,i.kt)("h4",{id:"parameters-6"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"gtcService")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcService"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcService"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The GTC service with which to register views.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"context")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#g3000gtcviewcontext"},(0,i.kt)("inlineCode",{parentName:"a"},"G3000GtcViewContext")),">"),(0,i.kt)("td",{parentName:"tr",align:"left"},"A context containing references to items used to create the base G3000's GTC views.")))),(0,i.kt)("h4",{id:"returns-9"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/G3000GTCPlugin.ts:42"))}k.isMDXComponent=!0}}]);