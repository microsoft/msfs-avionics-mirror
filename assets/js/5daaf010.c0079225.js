"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[90981],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>h});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var d=r.createContext({}),p=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return r.createElement(d.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=p(n),u=a,h=m["".concat(d,".").concat(u)]||m[u]||k[u]||i;return n?r.createElement(h,l(l({ref:t},s),{},{components:n})):r.createElement(h,l({ref:t},s))}));function h(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=u;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:a,l[1]=o;for(var p=2;p<i;p++)l[p]=n[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},59048:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>k,frontMatter:()=>i,metadata:()=>o,toc:()=>p});var r=n(87462),a=(n(67294),n(3905));const i={id:"FlightPathMarker",title:"Class: FlightPathMarker",sidebar_label:"FlightPathMarker",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"g1000common/classes/FlightPathMarker",id:"g1000common/classes/FlightPathMarker",title:"Class: FlightPathMarker",description:"The FlightPathMarker component.",source:"@site/docs/g1000common/classes/FlightPathMarker.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/FlightPathMarker",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/FlightPathMarker",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPathMarker",title:"Class: FlightPathMarker",sidebar_label:"FlightPathMarker",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightDirector",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/FlightDirector"},next:{title:"FlightPlanAsoboSync",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/FlightPlanAsoboSync"}},d={},p=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"contextType",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"getContext",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"onAfterRender",id:"onafterrender",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"onBeforeRender",id:"onbeforerender",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"render",id:"render",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"update",id:"update",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-9",level:4}],s={toc:p},m="wrapper";function k(e){let{components:t,...n}=e;return(0,a.kt)(m,(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"The FlightPathMarker component."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/FlightPathMarkerProps"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPathMarkerProps")),">"),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"FlightPathMarker"))))),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new FlightPathMarker"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"props"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/FlightPathMarker"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPathMarker"))),(0,a.kt)("p",null,"Creates an instance of a DisplayComponent."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"props")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/FlightPathMarkerProps"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPathMarkerProps"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The propertis of the component.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/FlightPathMarker"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPathMarker"))),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent<FlightPathMarkerProps",">",".constructor"),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:73"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"context"},"context"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"context"),": [] = ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")),(0,a.kt)("p",null,"The context on this component, if any."),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent.context"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:64"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"contexttype"},"contextType"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"contextType"),": readonly [] = ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")),(0,a.kt)("p",null,"The type of context for this component, if any."),(0,a.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent.contextType"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:67"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"props"},"props"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"props"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/FlightPathMarkerProps"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPathMarkerProps"))," & ",(0,a.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,a.kt)("p",null,"The properties of the component."),(0,a.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent.props"),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:61"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"destroy"},"destroy"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Destroys this component."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent.destroy"),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:98"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"getcontext"},"getContext"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"getContext"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"never")),(0,a.kt)("p",null,"Gets a context data subscription from the context collection."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"context")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"never")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The context to get the subscription for.")))),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"never")),(0,a.kt)("p",null,"The requested context."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,a.kt)("p",null,"An error if no data for the specified context type could be found."),(0,a.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent.getContext"),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:106"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onafterrender"},"onAfterRender"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onAfterRender"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"node"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"A callback that is called after the component is rendered."),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"node")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"VNode")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The component's VNode.")))),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent.onAfterRender"),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:87"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"onbeforerender"},"onBeforeRender"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onBeforeRender"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"A callback that is called before the component is rendered."),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,a.kt)("p",null,"DisplayComponent.onBeforeRender"),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"sdk/components/FSComponent.ts:80"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"render"},"render"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"render"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"VNode")),(0,a.kt)("p",null,"Renders the component."),(0,a.kt)("h4",{id:"returns-5"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"VNode")),(0,a.kt)("p",null,"The component VNode."),(0,a.kt)("h4",{id:"overrides"},"Overrides"),(0,a.kt)("p",null,"DisplayComponent.render"),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/FlightInstruments/FlightPathMarker.tsx:102"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"update"},"update"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"update"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"dt"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"planeState"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("p",null,"Updates flight path marker"),(0,a.kt)("h4",{id:"parameters-3"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"dt")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The elapsed time, in milliseconds, since the previous update.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"planeState")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g1000common/interfaces/PlaneStateInfo"},(0,a.kt)("inlineCode",{parentName:"a"},"PlaneStateInfo"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The state of own airplane.")))),(0,a.kt)("h4",{id:"returns-6"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/FlightInstruments/FlightPathMarker.tsx:35"))}k.isMDXComponent=!0}}]);