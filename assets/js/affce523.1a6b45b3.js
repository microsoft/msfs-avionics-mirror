"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[67941],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>c});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var d=r.createContext({}),s=function(e){var t=r.useContext(d),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},p=function(e){var t=s(e.components);return r.createElement(d.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,d=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=s(a),k=n,c=m["".concat(d,".").concat(k)]||m[k]||u[k]||i;return a?r.createElement(c,l(l({ref:t},p),{},{components:a})):r.createElement(c,l({ref:t},p))}));function c(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,l=new Array(i);l[0]=k;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:n,l[1]=o;for(var s=2;s<i;s++)l[s]=a[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}k.displayName="MDXCreateElement"},70756:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>o,toc:()=>s});var r=a(87462),n=(a(67294),a(3905));const i={id:"DefaultMarkerBeaconDataProvider",title:"Class: DefaultMarkerBeaconDataProvider",sidebar_label:"DefaultMarkerBeaconDataProvider",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/classes/DefaultMarkerBeaconDataProvider",id:"garminsdk/classes/DefaultMarkerBeaconDataProvider",title:"Class: DefaultMarkerBeaconDataProvider",description:"A default implementation of MarkerBeaconDataProvider.",source:"@site/docs/garminsdk/classes/DefaultMarkerBeaconDataProvider.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/DefaultMarkerBeaconDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultMarkerBeaconDataProvider",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"DefaultMarkerBeaconDataProvider",title:"Class: DefaultMarkerBeaconDataProvider",sidebar_label:"DefaultMarkerBeaconDataProvider",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"DefaultMapRunwayDesignationImageCache",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultMapRunwayDesignationImageCache"},next:{title:"DefaultMinimumsDataProvider",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultMinimumsDataProvider"}},d={},s=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"isDataFailed",id:"isdatafailed",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"markerBeaconState",id:"markerbeaconstate",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"init",id:"init",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"pause",id:"pause",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"resume",id:"resume",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-6",level:4}],p={toc:s},m="wrapper";function u(e){let{components:t,...a}=e;return(0,n.kt)(m,(0,r.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A default implementation of ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MarkerBeaconDataProvider"},"MarkerBeaconDataProvider"),"."),(0,n.kt)("h2",{id:"implements"},"Implements"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MarkerBeaconDataProvider"},(0,n.kt)("inlineCode",{parentName:"a"},"MarkerBeaconDataProvider")))),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new DefaultMarkerBeaconDataProvider"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"markerBeaconIndex"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultMarkerBeaconDataProvider"},(0,n.kt)("inlineCode",{parentName:"a"},"DefaultMarkerBeaconDataProvider"))),(0,n.kt)("p",null,"Constructor."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"bus")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"markerBeaconIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")," ","|"," ",(0,n.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,n.kt)("inlineCode",{parentName:"td"},"number"),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The index of the AoA computer that is the source of this provider's data.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/DefaultMarkerBeaconDataProvider"},(0,n.kt)("inlineCode",{parentName:"a"},"DefaultMarkerBeaconDataProvider"))),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/components/nextgenpfd/marker/MarkerBeaconDataProvider.ts:44"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"isdatafailed"},"isDataFailed"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"isDataFailed"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,n.kt)("p",null,"Whether marker beacon data is in a failed state."),(0,n.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MarkerBeaconDataProvider"},"MarkerBeaconDataProvider"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MarkerBeaconDataProvider#isdatafailed"},"isDataFailed")),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/components/nextgenpfd/marker/MarkerBeaconDataProvider.ts:28"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"markerbeaconstate"},"markerBeaconState"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"markerBeaconState"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,n.kt)("p",null,"The current marker beacon receiving state."),(0,n.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MarkerBeaconDataProvider"},"MarkerBeaconDataProvider"),".",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/MarkerBeaconDataProvider#markerbeaconstate"},"markerBeaconState")),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/components/nextgenpfd/marker/MarkerBeaconDataProvider.ts:24"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"destroy"},"destroy"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can\nno longer be paused or resumed."),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/components/nextgenpfd/marker/MarkerBeaconDataProvider.ts:133"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"init"},"init"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"init"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"paused?"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Initializes this data provider. Once initialized, this data provider will continuously update its data until\npaused or destroyed."),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"paused")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"false")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether to initialize this data provider as paused. If ",(0,n.kt)("inlineCode",{parentName:"td"},"true"),", this data provider will provide an initial set of data but will not update the provided data until it is resumed. Defaults to ",(0,n.kt)("inlineCode",{parentName:"td"},"false"),".")))),(0,n.kt)("h4",{id:"returns-2"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,n.kt)("p",null,"Error if this data provider is dead."),(0,n.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/components/nextgenpfd/marker/MarkerBeaconDataProvider.ts:58"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"pause"},"pause"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"pause"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Pauses this data provider. Once paused, this data provider will not update its data until it is resumed."),(0,n.kt)("h4",{id:"returns-3"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,n.kt)("p",null,"Error if this data provider is dead."),(0,n.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/components/nextgenpfd/marker/MarkerBeaconDataProvider.ts:114"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"resume"},"resume"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"resume"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or\ndestroyed."),(0,n.kt)("h4",{id:"returns-4"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,n.kt)("p",null,"Error if this data provider is dead."),(0,n.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,n.kt)("p",null,"src/garminsdk/components/nextgenpfd/marker/MarkerBeaconDataProvider.ts:95"))}u.isMDXComponent=!0}}]);