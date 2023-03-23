"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[90278],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>c});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=a.createContext({}),p=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},d=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,s=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),m=p(n),u=i,c=m["".concat(s,".").concat(u)]||m[u]||k[u]||r;return n?a.createElement(c,l(l({ref:t},d),{},{components:n})):a.createElement(c,l({ref:t},d))}));function c(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,l=new Array(r);l[0]=u;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[m]="string"==typeof e?e:i,l[1]=o;for(var p=2;p<r;p++)l[p]=n[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},88844:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>k,frontMatter:()=>r,metadata:()=>o,toc:()=>p});var a=n(87462),i=(n(67294),n(3905));const r={id:"GtcNearestWaypointList",title:"Class: GtcNearestWaypointList<DataType>",sidebar_label:"GtcNearestWaypointList",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"g3000gtc/classes/GtcNearestWaypointList",id:"g3000gtc/classes/GtcNearestWaypointList",title:"Class: GtcNearestWaypointList<DataType>",description:"A scrollable GTC list of nearest waypoints.",source:"@site/docs/g3000gtc/classes/GtcNearestWaypointList.md",sourceDirName:"g3000gtc/classes",slug:"/g3000gtc/classes/GtcNearestWaypointList",permalink:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcNearestWaypointList",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GtcNearestWaypointList",title:"Class: GtcNearestWaypointList<DataType>",sidebar_label:"GtcNearestWaypointList",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GtcNearestVorPage",permalink:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcNearestVorPage"},next:{title:"GtcNearestWaypointListItem",permalink:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcNearestWaypointListItem"}},s={},p=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"contextType",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"cssClassSub",id:"cssclasssub",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"listRef",id:"listref",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"noResultsCssClass",id:"noresultscssclass",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"noResultsSub",id:"noresultssub",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"RESERVED_CSS_CLASSES",id:"reserved_css_classes",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"getContext",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"onAfterRender",id:"onafterrender",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"onBeforeRender",id:"onbeforerender",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"onGtcInteractionEvent",id:"ongtcinteractionevent",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"render",id:"render",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"scrollToIndex",id:"scrolltoindex",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"scrollToItem",id:"scrolltoitem",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"sortListItems",id:"sortlistitems",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"updateOrder",id:"updateorder",level:3},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-18",level:4}],d={toc:p},m="wrapper";function k(e){let{components:t,...n}=e;return(0,i.kt)(m,(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A scrollable GTC list of nearest waypoints."),(0,i.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"DataType")),(0,i.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,i.kt)("inlineCode",{parentName:"td"},"NearestWaypointEntry"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"FacilityWaypoint"),">"," & ",(0,i.kt)("inlineCode",{parentName:"td"},"DynamicListData")," = ",(0,i.kt)("inlineCode",{parentName:"td"},"NearestWaypointEntry"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"FacilityWaypoint")," & ",(0,i.kt)("inlineCode",{parentName:"td"},"DynamicListData"),">")))),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcNearestWaypointListProps"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcNearestWaypointListProps")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"DataType"),">",">"),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"GtcNearestWaypointList"))))),(0,i.kt)("h2",{id:"implements"},"Implements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcInteractionHandler"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcInteractionHandler")))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new GtcNearestWaypointList"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"DataType"),">","(",(0,i.kt)("inlineCode",{parentName:"p"},"props"),")"),(0,i.kt)("p",null,"Creates an instance of a DisplayComponent."),(0,i.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"DataType")),(0,i.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,i.kt)("inlineCode",{parentName:"td"},"NearestWaypointEntry"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"FacilityWaypoint"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Facility"),">",", ",(0,i.kt)("inlineCode",{parentName:"td"},"DataType"),">"," & ",(0,i.kt)("inlineCode",{parentName:"td"},"DynamicListData")," = ",(0,i.kt)("inlineCode",{parentName:"td"},"NearestWaypointEntry"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"FacilityWaypoint"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Facility"),">"," & ",(0,i.kt)("inlineCode",{parentName:"td"},"DynamicListData"),">")))),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"props")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcNearestWaypointListProps"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcNearestWaypointListProps")),"<",(0,i.kt)("inlineCode",{parentName:"td"},"DataType"),">"),(0,i.kt)("td",{parentName:"tr",align:"left"},"The propertis of the component.")))),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,"DisplayComponent<GtcNearestWaypointListProps<DataType",">",">",".constructor"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:72"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"context"},"context"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"context"),": [] = ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")),(0,i.kt)("p",null,"The context on this component, if any."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,"DisplayComponent.context"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:63"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"contexttype"},"contextType"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"contextType"),": readonly [] = ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")),(0,i.kt)("p",null,"The type of context for this component, if any."),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,"DisplayComponent.contextType"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:66"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"cssclasssub"},"cssClassSub"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"cssClassSub"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/Nearest/GtcNearestWaypointList.tsx:35"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"listref"},"listRef"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"listRef"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcList"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcList")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"DataType"),">",">"),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/Nearest/GtcNearestWaypointList.tsx:31"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"noresultscssclass"},"noResultsCssClass"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"noResultsCssClass"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"SetSubject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/Nearest/GtcNearestWaypointList.tsx:33"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"noresultssub"},"noResultsSub"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"noResultsSub"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscription")),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/Nearest/GtcNearestWaypointList.tsx:36"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"props"},"props"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"props"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcNearestWaypointListProps"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcNearestWaypointListProps")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"DataType"),">"," & ",(0,i.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,i.kt)("p",null,"The properties of the component."),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,"DisplayComponent.props"),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:60"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"reserved_css_classes"},"RESERVED","_","CSS","_","CLASSES"),(0,i.kt)("p",null,"\u25aa ",(0,i.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"RESERVED","_","CSS","_","CLASSES"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string"),"[]"),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/Nearest/GtcNearestWaypointList.tsx:29"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"destroy"},"destroy"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"overrides"},"Overrides"),(0,i.kt)("p",null,"DisplayComponent.destroy"),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/Nearest/GtcNearestWaypointList.tsx:121"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"getcontext"},"getContext"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("strong",{parentName:"p"},"getContext"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"never")),(0,i.kt)("p",null,"Gets a context data subscription from the context collection."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"An error if no data for the specified context type could be found."),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"context")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"never")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The context to get the subscription for.")))),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"never")),(0,i.kt)("p",null,"The requested context."),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,"DisplayComponent.getContext"),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:105"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onafterrender"},"onAfterRender"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onAfterRender"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"overrides-1"},"Overrides"),(0,i.kt)("p",null,"DisplayComponent.onAfterRender"),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/Nearest/GtcNearestWaypointList.tsx:39"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onbeforerender"},"onBeforeRender"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onBeforeRender"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback that is called before the component is rendered."),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,i.kt)("p",null,"DisplayComponent.onBeforeRender"),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:79"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ongtcinteractionevent"},"onGtcInteractionEvent"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onGtcInteractionEvent"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"event"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Handles GtcInteractionEvents."),(0,i.kt)("h4",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"event")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtcinteractionevent-1"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcInteractionEvent"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The event.")))),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Whether the event was handled or not."),(0,i.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcInteractionHandler"},"GtcInteractionHandler"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcInteractionHandler#ongtcinteractionevent"},"onGtcInteractionEvent")),(0,i.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/Nearest/GtcNearestWaypointList.tsx:80"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"render"},"render"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"render"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"VNode")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"returns-5"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"VNode")),(0,i.kt)("h4",{id:"overrides-2"},"Overrides"),(0,i.kt)("p",null,"DisplayComponent.render"),(0,i.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/Nearest/GtcNearestWaypointList.tsx:85"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"scrolltoindex"},"scrollToIndex"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"scrollToIndex"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"index"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"position"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"animate"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Scrolls until the item at a specified index is in view."),(0,i.kt)("h4",{id:"parameters-3"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"index")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The index of the item to which to scroll.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"position")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The position to place the target item at the end of the scroll. Position ",(0,i.kt)("inlineCode",{parentName:"td"},"0")," is the top-most visible slot, position ",(0,i.kt)("inlineCode",{parentName:"td"},"1")," is the next slot, and so on. Values greater than or equal to the number of visible items per page will be clamped. If this value is negative, the target item will be placed at the visible position that results in the shortest scroll distance. Ignored if this list does not support snapping to list items.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"animate")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether to animate the scroll.")))),(0,i.kt)("h4",{id:"returns-6"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/Nearest/GtcNearestWaypointList.tsx:54"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"scrolltoitem"},"scrollToItem"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"scrollToItem"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"item"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"position"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"animate"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"ignoreIfItemInView?"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Scrolls until the specified item is in view. If this is a static list, this method does nothing."),(0,i.kt)("h4",{id:"parameters-4"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"item")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"DataType")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The item to which to scroll.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"position")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The position to place the target item at the end of the scroll. Position ",(0,i.kt)("inlineCode",{parentName:"td"},"0")," is the top-most visible slot, position ",(0,i.kt)("inlineCode",{parentName:"td"},"1")," is the next slot, and so on. Values greater than or equal to the number of visible items per page will be clamped. If this value is negative, the target item will be placed at the visible position that results in the shortest scroll distance. Ignored if this list does not support snapping to list items.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"animate")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether to animate the scroll.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"ignoreIfItemInView")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"false")),(0,i.kt)("td",{parentName:"tr",align:"left"},"When true, if item is already in view, it will not scroll to it. Defaults to false.")))),(0,i.kt)("h4",{id:"returns-7"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/Nearest/GtcNearestWaypointList.tsx:68"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"sortlistitems"},"sortListItems"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("strong",{parentName:"p"},"sortListItems"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"a"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"b"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"Sorts this list's nearest waypoint entries in order of increasing distance from the airplane's current position."),(0,i.kt)("h4",{id:"parameters-5"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"a")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"DataType")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The first entry.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"b")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"DataType")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The second entry.")))),(0,i.kt)("h4",{id:"returns-8"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A negative number if the first entry's waypoint is closer to the airplane than the second's waypoint,\na positive number if the opposite is true, or zero if both are equidistant to the airplane or one or both\ndistances are unknown."),(0,i.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/Nearest/GtcNearestWaypointList.tsx:138"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"updateorder"},"updateOrder"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"updateOrder"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Updates the order of rendered items in this list."),(0,i.kt)("h4",{id:"returns-9"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/Nearest/GtcNearestWaypointList.tsx:75"))}k.isMDXComponent=!0}}]);