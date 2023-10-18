"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[30635],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>c});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=i.createContext({}),d=function(e){var t=i.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=d(e.components);return i.createElement(s.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},k=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=d(n),k=r,c=m["".concat(s,".").concat(k)]||m[k]||u[k]||a;return n?i.createElement(c,l(l({ref:t},p),{},{components:n})):i.createElement(c,l({ref:t},p))}));function c(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,l=new Array(a);l[0]=k;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[m]="string"==typeof e?e:r,l[1]=o;for(var d=2;d<a;d++)l[d]=n[d];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}k.displayName="MDXCreateElement"},13149:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>u,frontMatter:()=>a,metadata:()=>o,toc:()=>d});var i=n(87462),r=(n(67294),n(3905));const a={id:"XMLVerticalGauge",title:"Class: XMLVerticalGauge",sidebar_label:"XMLVerticalGauge",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"g1000common/classes/XMLVerticalGauge",id:"g1000common/classes/XMLVerticalGauge",title:"Class: XMLVerticalGauge",description:"A single vertical bar gauge.",source:"@site/docs/g1000common/classes/XMLVerticalGauge.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/XMLVerticalGauge",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/XMLVerticalGauge",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"XMLVerticalGauge",title:"Class: XMLVerticalGauge",sidebar_label:"XMLVerticalGauge",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"XMLTextGauge",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/XMLTextGauge"},next:{title:"XPDRCodeMenu",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/XPDRCodeMenu"}},s={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"baseY",id:"basey",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"columnX",id:"columnx",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"contextType",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"geometry",id:"geometry",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"height",id:"height",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"labelRef",id:"labelref",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"lineGroupRef",id:"linegroupref",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"maxValue",id:"maxvalue",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"minValue",id:"minvalue",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"svgRef",id:"svgref",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"titleRef",id:"titleref",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"unitRef",id:"unitref",level:3},{value:"Defined in",id:"defined-in-14",level:4},{value:"valueRef",id:"valueref",level:3},{value:"Defined in",id:"defined-in-15",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"getContext",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"initGauge",id:"initgauge",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"onAfterRender",id:"onafterrender",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"onBeforeRender",id:"onbeforerender",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"render",id:"render",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"renderGauge",id:"rendergauge",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-22",level:4}],p={toc:d},m="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(m,(0,i.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A single vertical bar gauge."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge"},(0,r.kt)("inlineCode",{parentName:"a"},"BaseGauge")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Partial"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"XMLVerticalGaugeProps"),">"," & ",(0,r.kt)("inlineCode",{parentName:"p"},"XMLHostedLogicGauge"),">"),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"XMLVerticalGauge"))))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new XMLVerticalGauge"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"props"),")"),(0,r.kt)("p",null,"Create a vertical gauge."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"props")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Partial"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"XMLDoubleVerticalGaugeProps"),">"," & ",(0,r.kt)("inlineCode",{parentName:"td"},"XMLHostedLogicGauge")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The properties for the gauge.")))),(0,r.kt)("h4",{id:"overrides"},"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge"},"BaseGauge"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge#constructor"},"constructor")),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:688"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"basey"},"baseY"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"baseY"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"5")),(0,r.kt)("p",null,"The Y location of the base of the columns."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:680"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"columnx"},"columnX"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"columnX"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"39")),(0,r.kt)("p",null,"The X location of the left column."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:678"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"context"},"context"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"context"),": [] = ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")),(0,r.kt)("p",null,"The context on this component, if any."),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge"},"BaseGauge"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge#context"},"context")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:64"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"contexttype"},"contextType"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"contextType"),": readonly [] = ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")),(0,r.kt)("p",null,"The type of context for this component, if any."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge"},"BaseGauge"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge#contexttype"},"contextType")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:67"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"geometry"},"geometry"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"geometry"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"BarGeometry")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:675"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"height"},"height"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"height"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"80")),(0,r.kt)("p",null,"The height of the columns, in pixels."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:682"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"labelref"},"labelRef"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"labelRef"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"SVGGElement"),">"),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:670"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"linegroupref"},"lineGroupRef"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"lineGroupRef"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"SVGGElement"),">"),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:671"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"maxvalue"},"maxValue"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"maxValue"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:673"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"minvalue"},"minValue"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"minValue"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:674"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"props"},"props"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"props"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Partial"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"XMLVerticalGaugeProps"),">"," & ",(0,r.kt)("inlineCode",{parentName:"p"},"XMLHostedLogicGauge")," & ",(0,r.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,r.kt)("p",null,"The properties of the component."),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge"},"BaseGauge"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge#props"},"props")),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:61"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"svgref"},"svgRef"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"svgRef"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"SVGElement"),">"),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:665"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"titleref"},"titleRef"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"titleRef"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"HTMLDivElement"),">"),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:666"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"unitref"},"unitRef"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"unitRef"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"HTMLDivElement"),">"),(0,r.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:667"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"valueref"},"valueRef"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"valueRef"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"HTMLSpanElement"),">"),(0,r.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:669"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"destroy"},"destroy"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Destroys this component."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge"},"BaseGauge"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge#destroy"},"destroy")),(0,r.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:98"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getcontext"},"getContext"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"getContext"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"never")),(0,r.kt)("p",null,"Gets a context data subscription from the context collection."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"An error if no data for the specified context type could be found."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"context")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"never")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The context to get the subscription for.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"never")),(0,r.kt)("p",null,"The requested context."),(0,r.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge"},"BaseGauge"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge#getcontext"},"getContext")),(0,r.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:106"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"initgauge"},"initGauge"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"initGauge"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Initialize the rendered gauge"),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"overrides-1"},"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge"},"BaseGauge"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge#initgauge"},"initGauge")),(0,r.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:700"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onafterrender"},"onAfterRender"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onAfterRender"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Perform scaling and margin adjustment then render and initialize the gauge."),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge"},"BaseGauge"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge#onafterrender"},"onAfterRender")),(0,r.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/BaseGauge.tsx:20"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onbeforerender"},"onBeforeRender"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onBeforeRender"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"A callback that is called before the component is rendered."),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge"},"BaseGauge"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge#onbeforerender"},"onBeforeRender")),(0,r.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,r.kt)("p",null,"sdk/components/FSComponent.ts:80"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"render"},"render"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"render"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"VNode")),(0,r.kt)("p",null,"Render the gauge."),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"VNode")),(0,r.kt)("p",null,"A VNode"),(0,r.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge"},"BaseGauge"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge#render"},"render")),(0,r.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/BaseGauge.tsx:59"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"rendergauge"},"renderGauge"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,r.kt)("strong",{parentName:"p"},"renderGauge"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"VNode")),(0,r.kt)("p",null,"Render a single vertical gauge."),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"VNode")),(0,r.kt)("p",null,"a VNode"),(0,r.kt)("h4",{id:"overrides-2"},"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge"},"BaseGauge"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/BaseGauge#rendergauge"},"renderGauge")),(0,r.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/Components/EngineInstruments/VerticalBarGauge.tsx:730"))}u.isMDXComponent=!0}}]);