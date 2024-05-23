"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[90329],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>c});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var d=i.createContext({}),p=function(e){var t=i.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return i.createElement(d.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},k=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=p(n),k=a,c=m["".concat(d,".").concat(k)]||m[k]||u[k]||r;return n?i.createElement(c,l(l({ref:t},s),{},{components:n})):i.createElement(c,l({ref:t},s))}));function c(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,l=new Array(r);l[0]=k;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:a,l[1]=o;for(var p=2;p<r;p++)l[p]=n[p];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}k.displayName="MDXCreateElement"},60506:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>u,frontMatter:()=>r,metadata:()=>o,toc:()=>p});var i=n(87462),a=(n(67294),n(3905));const r={id:"WT21MfdAvionicsPlugin",title:"Class: WT21MfdAvionicsPlugin",sidebar_label:"WT21MfdAvionicsPlugin",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"wt21mfd/classes/WT21MfdAvionicsPlugin",id:"wt21mfd/classes/WT21MfdAvionicsPlugin",title:"Class: WT21MfdAvionicsPlugin",description:"A WT21 MFD plugin",source:"@site/docs/wt21mfd/classes/WT21MfdAvionicsPlugin.md",sourceDirName:"wt21mfd/classes",slug:"/wt21mfd/classes/WT21MfdAvionicsPlugin",permalink:"/msfs-avionics-mirror/docs/wt21mfd/classes/WT21MfdAvionicsPlugin",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"WT21MfdAvionicsPlugin",title:"Class: WT21MfdAvionicsPlugin",sidebar_label:"WT21MfdAvionicsPlugin",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"VORDMEStatusPage",permalink:"/msfs-avionics-mirror/docs/wt21mfd/classes/VORDMEStatusPage"},next:{title:"WT21_MFD_Instrument",permalink:"/msfs-avionics-mirror/docs/wt21mfd/classes/WT21_MFD_Instrument"}},d={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"binder",id:"binder",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"onComponentCreated",id:"oncomponentcreated",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-1",level:5},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"onComponentCreating",id:"oncomponentcreating",level:3},{value:"Type declaration",id:"type-declaration-1",level:4},{value:"Parameters",id:"parameters-2",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"onComponentRendered",id:"oncomponentrendered",level:3},{value:"Type declaration",id:"type-declaration-2",level:4},{value:"Parameters",id:"parameters-3",level:5},{value:"Returns",id:"returns-3",level:5},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"Methods",id:"methods",level:2},{value:"loadCss",id:"loadcss",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"onInstalled",id:"oninstalled",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"registerExtraMfdTextPages",id:"registerextramfdtextpages",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"renderEis",id:"rendereis",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"renderSystemPages",id:"rendersystempages",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-9",level:4}],s={toc:p},m="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(m,(0,i.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A WT21 MFD plugin"),(0,a.kt)("p",null,"TODO separate out into interface and abstract class"),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"p"},"WT21AvionicsPlugin"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21mfd/interfaces/WT21MfdPluginBinder"},(0,a.kt)("inlineCode",{parentName:"a"},"WT21MfdPluginBinder")),">"),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"WT21MfdAvionicsPlugin"))))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new WT21MfdAvionicsPlugin"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"binder"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21mfd/classes/WT21MfdAvionicsPlugin"},(0,a.kt)("inlineCode",{parentName:"a"},"WT21MfdAvionicsPlugin"))),(0,a.kt)("p",null,"Creates an instance of a Plugin."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"binder")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/wt21mfd/interfaces/WT21MfdPluginBinder"},(0,a.kt)("inlineCode",{parentName:"a"},"WT21MfdPluginBinder"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The avionics specific plugin binder to accept from the system.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21mfd/classes/WT21MfdAvionicsPlugin"},(0,a.kt)("inlineCode",{parentName:"a"},"WT21MfdAvionicsPlugin"))),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,"WT21AvionicsPlugin<WT21MfdPluginBinder",">",".constructor"),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:1424"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"binder"},"binder"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"binder"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21mfd/interfaces/WT21MfdPluginBinder"},(0,a.kt)("inlineCode",{parentName:"a"},"WT21MfdPluginBinder"))),(0,a.kt)("p",null,"The avionics specific plugin binder to accept from the system."),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,"WT21AvionicsPlugin.binder"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:1424"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"oncomponentcreated"},"onComponentCreated"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"onComponentCreated"),": (",(0,a.kt)("inlineCode",{parentName:"p"},"component"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", []",">",") => ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"An optional hook called when a component is created. If this hook is present,\nit will be called for EVERY component instantiation, so be sure to ensure\nthat this code is well optimized."),(0,a.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,a.kt)("p",null,"\u25b8 (",(0,a.kt)("inlineCode",{parentName:"p"},"component"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"An optional hook called when a component is created. If this hook is present,\nit will be called for EVERY component instantiation, so be sure to ensure\nthat this code is well optimized."),(0,a.kt)("h5",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"component")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"DisplayComponent"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"any"),", []",">")))),(0,a.kt)("h5",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,a.kt)("p",null,"WT21AvionicsPlugin.onComponentCreated"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:1444"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"oncomponentcreating"},"onComponentCreating"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"onComponentCreating"),": (",(0,a.kt)("inlineCode",{parentName:"p"},"constructor"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"DisplayComponentFactory"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", []",">",", ",(0,a.kt)("inlineCode",{parentName:"p"},"props"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"any"),") => ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", []",">"),(0,a.kt)("p",null,"An optional hook called when a component is about to be created. Returning a component causes\nthat component to be used instead of the one that was to be created, and returning undefined\nwill cause the original component to be created. If this hook is present, it will be called\nfor EVERY component instantiation, so be sure to ensure that this code is well optimized."),(0,a.kt)("h4",{id:"type-declaration-1"},"Type declaration"),(0,a.kt)("p",null,"\u25b8 (",(0,a.kt)("inlineCode",{parentName:"p"},"constructor"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"props"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", []",">"),(0,a.kt)("p",null,"An optional hook called when a component is about to be created. Returning a component causes\nthat component to be used instead of the one that was to be created, and returning undefined\nwill cause the original component to be created. If this hook is present, it will be called\nfor EVERY component instantiation, so be sure to ensure that this code is well optimized."),(0,a.kt)("h5",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"constructor")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"DisplayComponentFactory"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"any"),", []",">")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"props")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"any"))))),(0,a.kt)("h5",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"any"),", []",">"),(0,a.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,a.kt)("p",null,"WT21AvionicsPlugin.onComponentCreating"),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:1437"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"oncomponentrendered"},"onComponentRendered"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"onComponentRendered"),": (",(0,a.kt)("inlineCode",{parentName:"p"},"node"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"VNode"),") => ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"An optional hook called when a component has completed rendering. If this hook\nis present, it will be called for EVERY component render completion, so be sure\nto ensure that this code is well optimized."),(0,a.kt)("h4",{id:"type-declaration-2"},"Type declaration"),(0,a.kt)("p",null,"\u25b8 (",(0,a.kt)("inlineCode",{parentName:"p"},"node"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"An optional hook called when a component has completed rendering. If this hook\nis present, it will be called for EVERY component render completion, so be sure\nto ensure that this code is well optimized."),(0,a.kt)("h5",{id:"parameters-3"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"node")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"VNode"))))),(0,a.kt)("h5",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,a.kt)("p",null,"WT21AvionicsPlugin.onComponentRendered"),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:1451"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"loadcss"},"loadCss"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"loadCss"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"uri"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,a.kt)("p",null,"Loads a CSS file into the instrument."),(0,a.kt)("h4",{id:"parameters-4"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"uri")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The URI to the CSS file.")))),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,a.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,a.kt)("p",null,"WT21AvionicsPlugin.loadCss"),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:1457"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"oninstalled"},"onInstalled"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onInstalled"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"A callback run when the plugin has been installed."),(0,a.kt)("h4",{id:"returns-5"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,a.kt)("p",null,"WT21AvionicsPlugin.onInstalled"),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:1429"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"registerextramfdtextpages"},"registerExtraMfdTextPages"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"registerExtraMfdTextPages"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Method that is called with a ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21mfd/interfaces/MfdTextPagesContext"},"MfdTextPagesContext"),", letting the plugin register MFD text pages"),(0,a.kt)("h4",{id:"parameters-5"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"context")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/wt21mfd/interfaces/MfdTextPagesContext"},(0,a.kt)("inlineCode",{parentName:"a"},"MfdTextPagesContext"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"the MFD text page context")))),(0,a.kt)("h4",{id:"returns-6"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/MFD/WT21MfdAvionicsPlugin.ts:52"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"rendereis"},"renderEis"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"renderEis"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"VNode")),(0,a.kt)("p",null,"Method called to render the Engine Indication System (EIS) on the MFD"),(0,a.kt)("h4",{id:"returns-7"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"VNode")),(0,a.kt)("p",null,"a VNode representing the EIS"),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/MFD/WT21MfdAvionicsPlugin.ts:35"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"rendersystempages"},"renderSystemPages"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"renderSystemPages"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"onRefCreated?"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21mfd/interfaces/WT21MfdPluginSystemsPageDefinition"},(0,a.kt)("inlineCode",{parentName:"a"},"WT21MfdPluginSystemsPageDefinition")),"[]"),(0,a.kt)("p",null,"Method called to render system pages on the MFD"),(0,a.kt)("h4",{id:"parameters-6"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"onRefCreated?")),(0,a.kt)("td",{parentName:"tr",align:"left"},"(",(0,a.kt)("inlineCode",{parentName:"td"},"pageIndex"),": ",(0,a.kt)("inlineCode",{parentName:"td"},"number"),", ",(0,a.kt)("inlineCode",{parentName:"td"},"ref"),": ",(0,a.kt)("inlineCode",{parentName:"td"},"NodeReference"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"DisplayComponent"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"any"),", []",">"," & ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/wt21mfd/interfaces/SystemsPageComponent"},(0,a.kt)("inlineCode",{parentName:"a"},"SystemsPageComponent")),">",") => ",(0,a.kt)("inlineCode",{parentName:"td"},"void")),(0,a.kt)("td",{parentName:"tr",align:"left"},"a callback fired whenever a systems page is instantiated, with its index and a ref to it passed as the first argument")))),(0,a.kt)("h4",{id:"returns-8"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21mfd/interfaces/WT21MfdPluginSystemsPageDefinition"},(0,a.kt)("inlineCode",{parentName:"a"},"WT21MfdPluginSystemsPageDefinition")),"[]"),(0,a.kt)("p",null,"an array of VNodes representing systems pages"),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/MFD/WT21MfdAvionicsPlugin.ts:45"))}u.isMDXComponent=!0}}]);