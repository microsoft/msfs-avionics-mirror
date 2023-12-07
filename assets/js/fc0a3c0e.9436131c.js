"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[138],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>k});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var p=r.createContext({}),d=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=d(e.components);return r.createElement(p.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,p=e.parentName,s=a(e,["components","mdxType","originalType","parentName"]),u=d(n),c=o,k=u["".concat(p,".").concat(c)]||u[c]||m[c]||i;return n?r.createElement(k,l(l({ref:t},s),{},{components:n})):r.createElement(k,l({ref:t},s))}));function k(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,l=new Array(i);l[0]=c;var a={};for(var p in t)hasOwnProperty.call(t,p)&&(a[p]=t[p]);a.originalType=e,a[u]="string"==typeof e?e:o,l[1]=a;for(var d=2;d<i;d++)l[d]=n[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},29331:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>m,frontMatter:()=>i,metadata:()=>a,toc:()=>d});var r=n(87462),o=(n(67294),n(3905));const i={id:"XMLColumnGroup",title:"Class: XMLColumnGroup",sidebar_label:"XMLColumnGroup",sidebar_position:0,custom_edit_url:null},l=void 0,a={unversionedId:"g1000common/classes/XMLColumnGroup",id:"g1000common/classes/XMLColumnGroup",title:"Class: XMLColumnGroup",description:"The XMLColumnGroup is the fundamental container for an EIS.  It will always be present to at least",source:"@site/docs/g1000common/classes/XMLColumnGroup.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/XMLColumnGroup",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/XMLColumnGroup",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"XMLColumnGroup",title:"Class: XMLColumnGroup",sidebar_label:"XMLColumnGroup",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"XMLCircleGauge",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/XMLCircleGauge"},next:{title:"XMLDoubleHorizontalGauge",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/XMLDoubleHorizontalGauge"}},p={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"contextType",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"getContext",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"onAfterRender",id:"onafterrender",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"onBeforeRender",id:"onbeforerender",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"render",id:"render",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-8",level:4}],s={toc:d},u="wrapper";function m(e){let{components:t,...n}=e;return(0,o.kt)(u,(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"The XMLColumnGroup is the fundamental container for an EIS.  It will always be present to at least\ncontain all the gauges defined in panel.xml.  There may be additional groups present if there were\nmore column groups explicitly defined in the XML configuration."),(0,o.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,o.kt)("inlineCode",{parentName:"p"},"GaugeColumnGroupProps")," & ",(0,o.kt)("inlineCode",{parentName:"p"},"XMLHostedLogicGauge"),">"),(0,o.kt)("p",{parentName:"li"},"\u21b3 ",(0,o.kt)("strong",{parentName:"p"},(0,o.kt)("inlineCode",{parentName:"strong"},"XMLColumnGroup"))))),(0,o.kt)("h2",{id:"constructors"},"Constructors"),(0,o.kt)("h3",{id:"constructor"},"constructor"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"new XMLColumnGroup"),"(",(0,o.kt)("inlineCode",{parentName:"p"},"props"),")"),(0,o.kt)("p",null,"Creates an instance of a DisplayComponent."),(0,o.kt)("h4",{id:"parameters"},"Parameters"),(0,o.kt)("table",null,(0,o.kt)("thead",{parentName:"table"},(0,o.kt)("tr",{parentName:"thead"},(0,o.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,o.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,o.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,o.kt)("tbody",{parentName:"table"},(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"props")),(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"GaugeColumnGroupProps")," & ",(0,o.kt)("inlineCode",{parentName:"td"},"XMLHostedLogicGauge")),(0,o.kt)("td",{parentName:"tr",align:"left"},"The propertis of the component.")))),(0,o.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,o.kt)("p",null,"DisplayComponent<GaugeColumnGroupProps & XMLHostedLogicGauge",">",".constructor"),(0,o.kt)("h4",{id:"defined-in"},"Defined in"),(0,o.kt)("p",null,"sdk/components/FSComponent.ts:73"),(0,o.kt)("h2",{id:"properties"},"Properties"),(0,o.kt)("h3",{id:"context"},"context"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,o.kt)("strong",{parentName:"p"},"context"),": [] = ",(0,o.kt)("inlineCode",{parentName:"p"},"undefined")),(0,o.kt)("p",null,"The context on this component, if any."),(0,o.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,o.kt)("p",null,"DisplayComponent.context"),(0,o.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,o.kt)("p",null,"sdk/components/FSComponent.ts:64"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"contexttype"},"contextType"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,o.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,o.kt)("strong",{parentName:"p"},"contextType"),": readonly [] = ",(0,o.kt)("inlineCode",{parentName:"p"},"undefined")),(0,o.kt)("p",null,"The type of context for this component, if any."),(0,o.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,o.kt)("p",null,"DisplayComponent.contextType"),(0,o.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,o.kt)("p",null,"sdk/components/FSComponent.ts:67"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"props"},"props"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"props"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"GaugeColumnGroupProps")," & ",(0,o.kt)("inlineCode",{parentName:"p"},"XMLHostedLogicGauge")," & ",(0,o.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,o.kt)("p",null,"The properties of the component."),(0,o.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,o.kt)("p",null,"DisplayComponent.props"),(0,o.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,o.kt)("p",null,"sdk/components/FSComponent.ts:61"),(0,o.kt)("h2",{id:"methods"},"Methods"),(0,o.kt)("h3",{id:"destroy"},"destroy"),(0,o.kt)("p",null,"\u25b8 ",(0,o.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,o.kt)("inlineCode",{parentName:"p"},"void")),(0,o.kt)("p",null,"Destroys this component."),(0,o.kt)("h4",{id:"returns"},"Returns"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"void")),(0,o.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,o.kt)("p",null,"DisplayComponent.destroy"),(0,o.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,o.kt)("p",null,"sdk/components/FSComponent.ts:98"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"getcontext"},"getContext"),(0,o.kt)("p",null,"\u25b8 ",(0,o.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,o.kt)("strong",{parentName:"p"},"getContext"),"(",(0,o.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,o.kt)("inlineCode",{parentName:"p"},"never")),(0,o.kt)("p",null,"Gets a context data subscription from the context collection."),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},(0,o.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,o.kt)("p",null,"An error if no data for the specified context type could be found."),(0,o.kt)("h4",{id:"parameters-1"},"Parameters"),(0,o.kt)("table",null,(0,o.kt)("thead",{parentName:"table"},(0,o.kt)("tr",{parentName:"thead"},(0,o.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,o.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,o.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,o.kt)("tbody",{parentName:"table"},(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"context")),(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"never")),(0,o.kt)("td",{parentName:"tr",align:"left"},"The context to get the subscription for.")))),(0,o.kt)("h4",{id:"returns-1"},"Returns"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"never")),(0,o.kt)("p",null,"The requested context."),(0,o.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,o.kt)("p",null,"DisplayComponent.getContext"),(0,o.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,o.kt)("p",null,"sdk/components/FSComponent.ts:106"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"onafterrender"},"onAfterRender"),(0,o.kt)("p",null,"\u25b8 ",(0,o.kt)("strong",{parentName:"p"},"onAfterRender"),"(): ",(0,o.kt)("inlineCode",{parentName:"p"},"void")),(0,o.kt)("p",null,"Do things after rendering."),(0,o.kt)("h4",{id:"returns-2"},"Returns"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"void")),(0,o.kt)("h4",{id:"overrides"},"Overrides"),(0,o.kt)("p",null,"DisplayComponent.onAfterRender"),(0,o.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,o.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/Columns.tsx:22"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"onbeforerender"},"onBeforeRender"),(0,o.kt)("p",null,"\u25b8 ",(0,o.kt)("strong",{parentName:"p"},"onBeforeRender"),"(): ",(0,o.kt)("inlineCode",{parentName:"p"},"void")),(0,o.kt)("p",null,"A callback that is called before the component is rendered."),(0,o.kt)("h4",{id:"returns-3"},"Returns"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"void")),(0,o.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,o.kt)("p",null,"DisplayComponent.onBeforeRender"),(0,o.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,o.kt)("p",null,"sdk/components/FSComponent.ts:80"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"render"},"render"),(0,o.kt)("p",null,"\u25b8 ",(0,o.kt)("strong",{parentName:"p"},"render"),"(): ",(0,o.kt)("inlineCode",{parentName:"p"},"VNode")),(0,o.kt)("p",null,"Render a column group."),(0,o.kt)("h4",{id:"returns-4"},"Returns"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"VNode")),(0,o.kt)("p",null,"A VNode of the group."),(0,o.kt)("h4",{id:"overrides-1"},"Overrides"),(0,o.kt)("p",null,"DisplayComponent.render"),(0,o.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,o.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/Columns.tsx:61"))}m.isMDXComponent=!0}}]);