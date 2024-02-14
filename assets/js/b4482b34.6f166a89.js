"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[12861],{3905:(e,t,a)=>{a.d(t,{Zo:()=>d,kt:()=>k});var l=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function n(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);t&&(l=l.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,l)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?n(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):n(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,l,r=function(e,t){if(null==e)return{};var a,l,r={},n=Object.keys(e);for(l=0;l<n.length;l++)a=n[l],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(l=0;l<n.length;l++)a=n[l],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var p=l.createContext({}),o=function(e){var t=l.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},d=function(e){var t=o(e.components);return l.createElement(p.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return l.createElement(l.Fragment,{},t)}},b=l.forwardRef((function(e,t){var a=e.components,r=e.mdxType,n=e.originalType,p=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),m=o(a),b=r,k=m["".concat(p,".").concat(b)]||m[b]||u[b]||n;return a?l.createElement(k,i(i({ref:t},d),{},{components:a})):l.createElement(k,i({ref:t},d))}));function k(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var n=a.length,i=new Array(n);i[0]=b;var s={};for(var p in t)hasOwnProperty.call(t,p)&&(s[p]=t[p]);s.originalType=e,s[m]="string"==typeof e?e:r,i[1]=s;for(var o=2;o<n;o++)i[o]=a[o];return l.createElement.apply(null,i)}return l.createElement.apply(null,a)}b.displayName="MDXCreateElement"},81493:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>u,frontMatter:()=>n,metadata:()=>s,toc:()=>o});var l=a(87462),r=(a(67294),a(3905));const n={id:"MapCullableTextLabelManager",title:"Class: MapCullableTextLabelManager",sidebar_label:"MapCullableTextLabelManager",sidebar_position:0,custom_edit_url:null},i=void 0,s={unversionedId:"framework/classes/MapCullableTextLabelManager",id:"framework/classes/MapCullableTextLabelManager",title:"Class: MapCullableTextLabelManager",description:"Manages a set of MapCullableTextLabels. Colliding labels will be culled based on their render priority. Labels with",source:"@site/docs/framework/classes/MapCullableTextLabelManager.md",sourceDirName:"framework/classes",slug:"/framework/classes/MapCullableTextLabelManager",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapCullableTextLabelManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapCullableTextLabelManager",title:"Class: MapCullableTextLabelManager",sidebar_label:"MapCullableTextLabelManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapCullableLocationTextLabel",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapCullableLocationTextLabel"},next:{title:"MapCullableTextLayer",permalink:"/msfs-avionics-mirror/docs/framework/classes/MapCullableTextLayer"}},p={},o=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Accessors",id:"accessors",level:2},{value:"visibleLabels",id:"visiblelabels",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"deregister",id:"deregister",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"register",id:"register",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"setCullingEnabled",id:"setcullingenabled",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"update",id:"update",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-5",level:4}],d={toc:o},m="wrapper";function u(e){let{components:t,...a}=e;return(0,r.kt)(m,(0,l.Z)({},d,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Manages a set of MapCullableTextLabels. Colliding labels will be culled based on their render priority. Labels with\nlower priorities will be culled before labels with higher priorities."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new MapCullableTextLabelManager"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"cullingEnabled?"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapCullableTextLabelManager"},(0,r.kt)("inlineCode",{parentName:"a"},"MapCullableTextLabelManager"))),(0,r.kt)("p",null,"Creates an instance of the MapCullableTextLabelManager."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"cullingEnabled")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"true")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether or not culling of labels is enabled.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/MapCullableTextLabelManager"},(0,r.kt)("inlineCode",{parentName:"a"},"MapCullableTextLabelManager"))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/map/MapCullableTextLabel.ts:154"),(0,r.kt)("h2",{id:"accessors"},"Accessors"),(0,r.kt)("h3",{id:"visiblelabels"},"visibleLabels"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"get")," ",(0,r.kt)("strong",{parentName:"p"},"visibleLabels"),"(): readonly ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapCullableTextLabel"},(0,r.kt)("inlineCode",{parentName:"a"},"MapCullableTextLabel")),"[]"),(0,r.kt)("p",null,"An array of labels registered with this manager that are visible."),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,"readonly ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapCullableTextLabel"},(0,r.kt)("inlineCode",{parentName:"a"},"MapCullableTextLabel")),"[]"),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/map/MapCullableTextLabel.ts:140"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"deregister"},"deregister"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"deregister"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"label"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Deregisters a label with this manager. Newly deregistered labels will be processed with the next manager update."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"label")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapCullableTextLabel"},(0,r.kt)("inlineCode",{parentName:"a"},"MapCullableTextLabel"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The label to deregister.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/map/MapCullableTextLabel.ts:173"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"register"},"register"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"register"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"label"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Registers a label with this manager. Newly registered labels will be processed with the next manager update."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"label")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/MapCullableTextLabel"},(0,r.kt)("inlineCode",{parentName:"a"},"MapCullableTextLabel"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The label to register.")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/map/MapCullableTextLabel.ts:160"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"setcullingenabled"},"setCullingEnabled"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"setCullingEnabled"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"enabled"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Sets whether or not text label culling is enabled."),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"enabled")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether or not culling is enabled.")))),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/map/MapCullableTextLabel.ts:190"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"update"},"update"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"update"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"mapProjection"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Updates this manager."),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"mapProjection")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/MapProjection"},(0,r.kt)("inlineCode",{parentName:"a"},"MapProjection"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The projection of the map to which this manager's labels are to be drawn.")))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/components/map/MapCullableTextLabel.ts:199"))}u.isMDXComponent=!0}}]);