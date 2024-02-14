"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[75436],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>h});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var o=a.createContext({}),p=function(e){var t=a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},s=function(e){var t=p(e.components);return a.createElement(o.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},k=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,l=e.originalType,o=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),m=p(n),k=i,h=m["".concat(o,".").concat(k)]||m[k]||c[k]||l;return n?a.createElement(h,r(r({ref:t},s),{},{components:n})):a.createElement(h,r({ref:t},s))}));function h(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var l=n.length,r=new Array(l);r[0]=k;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[m]="string"==typeof e?e:i,r[1]=d;for(var p=2;p<l;p++)r[p]=n[p];return a.createElement.apply(null,r)}return a.createElement.apply(null,n)}k.displayName="MDXCreateElement"},83215:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>r,default:()=>c,frontMatter:()=>l,metadata:()=>d,toc:()=>p});var a=n(87462),i=(n(67294),n(3905));const l={id:"TextInputFieldOptions",title:"Interface: TextInputFieldOptions<T, V>",sidebar_label:"TextInputFieldOptions",sidebar_position:0,custom_edit_url:null},r=void 0,d={unversionedId:"framework/interfaces/TextInputFieldOptions",id:"framework/interfaces/TextInputFieldOptions",title:"Interface: TextInputFieldOptions<T, V>",description:"Input field options",source:"@site/docs/framework/interfaces/TextInputFieldOptions.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/TextInputFieldOptions",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/TextInputFieldOptions",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TextInputFieldOptions",title:"Interface: TextInputFieldOptions<T, V>",sidebar_label:"TextInputFieldOptions",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"TemperatureSource",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/TemperatureSource"},next:{title:"ThrottledTaskQueueHandler",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/ThrottledTaskQueueHandler"}},o={},p=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"clearScratchpadOnSelectedHandled",id:"clearscratchpadonselectedhandled",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"clearScratchpadOnValueAccepted",id:"clearscratchpadonvalueaccepted",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"deleteAllowed",id:"deleteallowed",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"disabled",id:"disabled",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"formatter",id:"formatter",level:3},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"onDelete",id:"ondelete",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Returns",id:"returns",level:5},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"onModified",id:"onmodified",level:3},{value:"Type declaration",id:"type-declaration-1",level:4},{value:"Parameters",id:"parameters",level:5},{value:"Returns",id:"returns-1",level:5},{value:"Defined in",id:"defined-in-6",level:4},{value:"onSelected",id:"onselected",level:3},{value:"Type declaration",id:"type-declaration-2",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"prefix",id:"prefix",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"style",id:"style",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"suffix",id:"suffix",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-10",level:4}],s={toc:p},m="wrapper";function c(e){let{components:t,...n}=e;return(0,i.kt)(m,(0,a.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Input field options"),(0,i.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"T"))),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"V"))))),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions"},(0,i.kt)("inlineCode",{parentName:"a"},"EditableFieldOptions")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"TextInputFieldOptions"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"clearscratchpadonselectedhandled"},"clearScratchpadOnSelectedHandled"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"clearScratchpadOnSelectedHandled"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether to clear the s-pad when ",(0,i.kt)("inlineCode",{parentName:"p"},"onSelected")," returns a string or ",(0,i.kt)("inlineCode",{parentName:"p"},"true"),". Defaults to ",(0,i.kt)("inlineCode",{parentName:"p"},"true"),"."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions"},"EditableFieldOptions"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions#clearscratchpadonselectedhandled"},"clearScratchpadOnSelectedHandled")),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/components/FmcComponent.ts:31"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"clearscratchpadonvalueaccepted"},"clearScratchpadOnValueAccepted"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"clearScratchpadOnValueAccepted"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether the scratchpad is cleared when a new value is accepted. ",(0,i.kt)("inlineCode",{parentName:"p"},"true")," by default."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/components/TextInputField.ts:23"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"deleteallowed"},"deleteAllowed"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"deleteAllowed"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether CLR DEL lsk events push a null value"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/components/TextInputField.ts:18"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"disabled"},"disabled"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"disabled"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")," ","|"," () => ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Disables this component, not handling any lsk events."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions"},"EditableFieldOptions"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions#disabled"},"disabled")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/components/FmcComponent.ts:10"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"formatter"},"formatter"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"formatter"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#fmcformatter"},(0,i.kt)("inlineCode",{parentName:"a"},"FmcFormatter")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"T"),">"," & ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Validator"},(0,i.kt)("inlineCode",{parentName:"a"},"Validator")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"V"),">"),(0,i.kt)("p",null,"Validator object"),(0,i.kt)("h4",{id:"overrides"},"Overrides"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions"},"EditableFieldOptions"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions#formatter"},"formatter")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/components/TextInputField.ts:13"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ondelete"},"onDelete"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"onDelete"),": () => ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Handler for an LSK pressed in DELETE mode"),(0,i.kt)("p",null,"If the return value is:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"true"),"   -> the handler is considered to have handled the call, and no further handlers will be called"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"false"),"  -> the handler is not considered to have handled the call, and the next handlers will be called"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"string")," -> the value is shown in the scratchpad, and the handler is considered to have handled the call")),(0,i.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (): ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Handler for an LSK pressed in DELETE mode"),(0,i.kt)("p",null,"If the return value is:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"true"),"   -> the handler is considered to have handled the call, and no further handlers will be called"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"false"),"  -> the handler is not considered to have handled the call, and the next handlers will be called"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"string")," -> the value is shown in the scratchpad, and the handler is considered to have handled the call")),(0,i.kt)("h5",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions"},"EditableFieldOptions"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions#ondelete"},"onDelete")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/components/FmcComponent.ts:41"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onmodified"},"onModified"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"onModified"),": (",(0,i.kt)("inlineCode",{parentName:"p"},"newValue"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"V"),") => ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Optional callback fired when the value is about to be modified. This is only called when a value is successfully validated."),(0,i.kt)("p",null,"This should be used when there is no appropriate way of using a modifiable data source to accept modifications from this input field."),(0,i.kt)("p",null,"An example of this is a complex process like inserting a flight plan leg, or something calling a distant modification\nprocess with a very indirect relationship to the input data."),(0,i.kt)("p",null,"If the return value is:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"true"),"   -> the handler ",(0,i.kt)("strong",{parentName:"li"},"is")," considered to have handled the call, and any bound data is ",(0,i.kt)("strong",{parentName:"li"},"not")," modified."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"false"),"  -> the handler is ",(0,i.kt)("strong",{parentName:"li"},"not")," considered to have handled the call itself, and any bound data ",(0,i.kt)("strong",{parentName:"li"},"is")," modified."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"string")," -> the value is shown in the scratchpad, and the handler is considered to have handled the call."),(0,i.kt)("li",{parentName:"ul"},"error    -> the error is thrown and handled by ",(0,i.kt)("inlineCode",{parentName:"li"},"FmcScreen::handleLineSelectKey"))),(0,i.kt)("h4",{id:"type-declaration-1"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (",(0,i.kt)("inlineCode",{parentName:"p"},"newValue"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Optional callback fired when the value is about to be modified. This is only called when a value is successfully validated."),(0,i.kt)("p",null,"This should be used when there is no appropriate way of using a modifiable data source to accept modifications from this input field."),(0,i.kt)("p",null,"An example of this is a complex process like inserting a flight plan leg, or something calling a distant modification\nprocess with a very indirect relationship to the input data."),(0,i.kt)("p",null,"If the return value is:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"true"),"   -> the handler ",(0,i.kt)("strong",{parentName:"li"},"is")," considered to have handled the call, and any bound data is ",(0,i.kt)("strong",{parentName:"li"},"not")," modified."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"false"),"  -> the handler is ",(0,i.kt)("strong",{parentName:"li"},"not")," considered to have handled the call itself, and any bound data ",(0,i.kt)("strong",{parentName:"li"},"is")," modified."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"string")," -> the value is shown in the scratchpad, and the handler is considered to have handled the call."),(0,i.kt)("li",{parentName:"ul"},"error    -> the error is thrown and handled by ",(0,i.kt)("inlineCode",{parentName:"li"},"FmcScreen::handleLineSelectKey"))),(0,i.kt)("h5",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"newValue")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"V"))))),(0,i.kt)("h5",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/components/TextInputField.ts:39"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onselected"},"onSelected"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"onSelected"),": (",(0,i.kt)("inlineCode",{parentName:"p"},"scratchpadContents"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string"),") => ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Handler for an LSK pressed where the component is.\nThis is the second priority in terms of handling, after the FmcPage and before the component class onLsk function."),(0,i.kt)("p",null,"This should be used in either of those two cases:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"the component does not take user input but has LSK interactivity"),(0,i.kt)("li",{parentName:"ul"},"the component takes user input, but it is not validated (instead of using an InputField)")),(0,i.kt)("p",null,"If the return value is:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"true"),"   -> the handler is considered to have handled the call, and no further handlers will be called"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"false"),"  -> the handler is not considered to have handled the call, and the next handlers will be called"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"string")," -> the value is shown in the scratchpad, and the handler is considered to have handled the call")),(0,i.kt)("h4",{id:"type-declaration-2"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (",(0,i.kt)("inlineCode",{parentName:"p"},"scratchpadContents"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("p",null,"Handler for an LSK pressed where the component is.\nThis is the second priority in terms of handling, after the FmcPage and before the component class onLsk function."),(0,i.kt)("p",null,"This should be used in either of those two cases:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"the component does not take user input but has LSK interactivity"),(0,i.kt)("li",{parentName:"ul"},"the component takes user input, but it is not validated (instead of using an InputField)")),(0,i.kt)("p",null,"If the return value is:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"true"),"   -> the handler is considered to have handled the call, and no further handlers will be called"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"false"),"  -> the handler is not considered to have handled the call, and the next handlers will be called"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"string")," -> the value is shown in the scratchpad, and the handler is considered to have handled the call")),(0,i.kt)("h5",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"scratchpadContents")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"string"))))),(0,i.kt)("h5",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions"},"EditableFieldOptions"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions#onselected"},"onSelected")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/components/FmcComponent.ts:26"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"prefix"},"prefix"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"prefix"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"Text shown before the value (can be used for start indentation)"),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions"},"EditableFieldOptions"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions#prefix"},"prefix")),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/components/DisplayField.ts:17"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"style"},"style"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"style"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," (",(0,i.kt)("inlineCode",{parentName:"p"},"value"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"T"),") => ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The style to apply to the value. MUST BE WRAPPED IN SQUARE BRACKETS."),(0,i.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions"},"EditableFieldOptions"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions#style"},"style")),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/components/DisplayField.ts:23"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"suffix"},"suffix"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"suffix"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"Text shown after the value (can be used for end indentation)"),(0,i.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions"},"EditableFieldOptions"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/EditableFieldOptions#suffix"},"suffix")),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"src/sdk/fmc/components/DisplayField.ts:20"))}c.isMDXComponent=!0}}]);