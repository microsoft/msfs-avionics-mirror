"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[4496],{3905:(e,t,a)=>{a.d(t,{Zo:()=>d,kt:()=>N});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var o=n.createContext({}),m=function(e){var t=n.useContext(o),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},d=function(e){var t=m(e.components);return n.createElement(o.Provider,{value:t},e.children)},s="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,d=p(e,["components","mdxType","originalType","parentName"]),s=m(a),u=r,N=s["".concat(o,".").concat(u)]||s[u]||k[u]||i;return a?n.createElement(N,l(l({ref:t},d),{},{components:a})):n.createElement(N,l({ref:t},d))}));function N(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=u;var p={};for(var o in t)hasOwnProperty.call(t,o)&&(p[o]=t[o]);p.originalType=e,p[s]="string"==typeof e?e:r,l[1]=p;for(var m=2;m<i;m++)l[m]=a[m];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}u.displayName="MDXCreateElement"},2374:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>k,frontMatter:()=>i,metadata:()=>p,toc:()=>m});var n=a(87462),r=(a(67294),a(3905));const i={id:"G3XMapWaypointStyles",title:"Class: G3XMapWaypointStyles",sidebar_label:"G3XMapWaypointStyles",sidebar_position:0,custom_edit_url:null},l=void 0,p={unversionedId:"g3xtouchcommon/classes/G3XMapWaypointStyles",id:"g3xtouchcommon/classes/G3XMapWaypointStyles",title:"Class: G3XMapWaypointStyles",description:"A utility class for generating G3X Touch map waypoint styles.",source:"@site/docs/g3xtouchcommon/classes/G3XMapWaypointStyles.md",sourceDirName:"g3xtouchcommon/classes",slug:"/g3xtouchcommon/classes/G3XMapWaypointStyles",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XMapWaypointStyles",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"G3XMapWaypointStyles",title:"Class: G3XMapWaypointStyles",sidebar_label:"G3XMapWaypointStyles",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"G3XMapUtils",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XMapUtils"},next:{title:"G3XNavDataBar",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XNavDataBar"}},o={},m=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"flightPlanIconStyles",id:"flightplaniconstyles",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Defined in",id:"defined-in",level:4},{value:"flightPlanLabelStyles",id:"flightplanlabelstyles",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Parameters",id:"parameters-3",level:5},{value:"Returns",id:"returns-4",level:5},{value:"Defined in",id:"defined-in-1",level:4},{value:"highlightIconStyles",id:"highlighticonstyles",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Parameters",id:"parameters-5",level:5},{value:"Returns",id:"returns-6",level:5},{value:"Defined in",id:"defined-in-2",level:4},{value:"highlightLabelStyles",id:"highlightlabelstyles",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Parameters",id:"parameters-7",level:5},{value:"Returns",id:"returns-8",level:5},{value:"Defined in",id:"defined-in-3",level:4},{value:"normalIconStyles",id:"normaliconstyles",level:3},{value:"Parameters",id:"parameters-8",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Parameters",id:"parameters-9",level:5},{value:"Returns",id:"returns-10",level:5},{value:"Defined in",id:"defined-in-4",level:4},{value:"normalLabelStyles",id:"normallabelstyles",level:3},{value:"Parameters",id:"parameters-10",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"runwayOutlineIconStyles",id:"runwayoutlineiconstyles",level:3},{value:"Parameters",id:"parameters-11",level:4},{value:"Returns",id:"returns-12",level:4},{value:"Parameters",id:"parameters-12",level:5},{value:"Returns",id:"returns-13",level:5},{value:"Defined in",id:"defined-in-6",level:4},{value:"vnavIconStyles",id:"vnaviconstyles",level:3},{value:"Parameters",id:"parameters-13",level:4},{value:"Returns",id:"returns-14",level:4},{value:"Parameters",id:"parameters-14",level:5},{value:"Returns",id:"returns-15",level:5},{value:"Defined in",id:"defined-in-7",level:4},{value:"vnavLabelStyles",id:"vnavlabelstyles",level:3},{value:"Parameters",id:"parameters-15",level:4},{value:"Returns",id:"returns-16",level:4},{value:"Parameters",id:"parameters-16",level:5},{value:"Returns",id:"returns-17",level:5},{value:"Defined in",id:"defined-in-8",level:4}],d={toc:m},s="wrapper";function k(e){let{components:t,...a}=e;return(0,r.kt)(s,(0,n.Z)({},d,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A utility class for generating G3X Touch map waypoint styles."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new G3XMapWaypointStyles"),"(): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XMapWaypointStyles"},(0,r.kt)("inlineCode",{parentName:"a"},"G3XMapWaypointStyles"))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/G3XMapWaypointStyles"},(0,r.kt)("inlineCode",{parentName:"a"},"G3XMapWaypointStyles"))),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"flightplaniconstyles"},"flightPlanIconStyles"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"flightPlanIconStyles"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"active"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"gduFormat"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"basePriority"),"): (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Waypoint"),") => ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointIconStyles")),(0,r.kt)("p",null,"Creates a function which retrieves G3X Touch map icon styles for flight plan waypoints."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"active")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether to retrieve styles for active flight plan waypoints.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"gduFormat")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#gduformat"},(0,r.kt)("inlineCode",{parentName:"a"},"GduFormat"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The format of the map's parent GDU.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"basePriority")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The base icon render priority. Icon priorities are guaranteed to fall in the range ",(0,r.kt)("inlineCode",{parentName:"td"},"[basePriority, basePriority + 1)"),".")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fn")),(0,r.kt)("p",null,"A function which retrieves G3X Touch map icon styles for flight plan waypoints."),(0,r.kt)("p",null,"\u25b8 (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointIconStyles")),(0,r.kt)("h5",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Waypoint"))))),(0,r.kt)("h5",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointIconStyles")),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/Map/G3XMapWaypointStyles.ts:319"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"flightplanlabelstyles"},"flightPlanLabelStyles"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"flightPlanLabelStyles"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"active"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"gduFormat"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"basePriority"),"): (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Waypoint"),") => ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointLabelStyles")),(0,r.kt)("p",null,"Creates a function which retrieves G3X Touch map label styles for flight plan waypoints."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"active")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether to retrieve styles for active flight plan waypoints.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"gduFormat")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#gduformat"},(0,r.kt)("inlineCode",{parentName:"a"},"GduFormat"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The format of the map's parent GDU.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"basePriority")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The base label render priority. Label priorities are guaranteed to fall in the range ",(0,r.kt)("inlineCode",{parentName:"td"},"[basePriority, basePriority + 1)"),".")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fn")),(0,r.kt)("p",null,"A function which retrieves G3X Touch map label styles for flight plan waypoints."),(0,r.kt)("p",null,"\u25b8 (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointLabelStyles")),(0,r.kt)("h5",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Waypoint"))))),(0,r.kt)("h5",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointLabelStyles")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/Map/G3XMapWaypointStyles.ts:384"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"highlighticonstyles"},"highlightIconStyles"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"highlightIconStyles"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"gduFormat"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"basePriority"),"): (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Waypoint"),") => ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointIconHighlightStyles")),(0,r.kt)("p",null,"Creates a function which retrieves G3X Touch map icon styles for highlighted waypoints."),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"gduFormat")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#gduformat"},(0,r.kt)("inlineCode",{parentName:"a"},"GduFormat"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The format of the map's parent GDU.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"basePriority")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The base icon render priority. Icon priorities are guaranteed to fall in the range ",(0,r.kt)("inlineCode",{parentName:"td"},"[basePriority, basePriority + 1)"),".")))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fn")),(0,r.kt)("p",null,"A function which retrieves G3X Touch map icon styles for highlighted waypoints."),(0,r.kt)("p",null,"\u25b8 (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointIconHighlightStyles")),(0,r.kt)("h5",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Waypoint"))))),(0,r.kt)("h5",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointIconHighlightStyles")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/Map/G3XMapWaypointStyles.ts:507"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"highlightlabelstyles"},"highlightLabelStyles"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"highlightLabelStyles"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"gduFormat"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"basePriority"),"): (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Waypoint"),") => ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointLabelStyles")),(0,r.kt)("p",null,"Creates a function which retrieves G3X Touch map label styles for highlighted waypoints."),(0,r.kt)("h4",{id:"parameters-6"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"gduFormat")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#gduformat"},(0,r.kt)("inlineCode",{parentName:"a"},"GduFormat"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The format of the map's parent GDU.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"basePriority")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The base label render priority. Label priorities are guaranteed to fall in the range ",(0,r.kt)("inlineCode",{parentName:"td"},"[basePriority, basePriority + 1)"),".")))),(0,r.kt)("h4",{id:"returns-7"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fn")),(0,r.kt)("p",null,"A function which retrieves G3X Touch map label styles for highlighted waypoints."),(0,r.kt)("p",null,"\u25b8 (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointLabelStyles")),(0,r.kt)("h5",{id:"parameters-7"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Waypoint"))))),(0,r.kt)("h5",{id:"returns-8"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointLabelStyles")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/Map/G3XMapWaypointStyles.ts:600"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"normaliconstyles"},"normalIconStyles"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"normalIconStyles"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"gduFormat"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"basePriority"),"): (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Waypoint"),") => ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointIconStyles")),(0,r.kt)("p",null,"Creates a function which retrieves G3X Touch map icon styles for normal waypoints."),(0,r.kt)("h4",{id:"parameters-8"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"gduFormat")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#gduformat"},(0,r.kt)("inlineCode",{parentName:"a"},"GduFormat"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The format of the map's parent GDU.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"basePriority")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The base icon render priority. Icon priorities are guaranteed to fall in the range ",(0,r.kt)("inlineCode",{parentName:"td"},"[basePriority, basePriority + 1)"),".")))),(0,r.kt)("h4",{id:"returns-9"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fn")),(0,r.kt)("p",null,"A function which retrieves G3X Touch map icon styles for normal waypoints."),(0,r.kt)("p",null,"\u25b8 (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointIconStyles")),(0,r.kt)("h5",{id:"parameters-9"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Waypoint"))))),(0,r.kt)("h5",{id:"returns-10"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointIconStyles")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/Map/G3XMapWaypointStyles.ts:58"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"normallabelstyles"},"normalLabelStyles"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"normalLabelStyles"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"gduFormat"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"basePriority"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"airportLargeTextSize"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"airportMediumTextSize"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"airportSmallTextSize"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"vorTextSize"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"ndbTextSize"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"intTextSize"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"userTextSize"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#g3xmapwaypointlabelstylefuncdef"},(0,r.kt)("inlineCode",{parentName:"a"},"G3XMapWaypointLabelStyleFuncDef"))),(0,r.kt)("p",null,"Creates a function which retrieves G3X Touch map label styles for normal waypoints."),(0,r.kt)("h4",{id:"parameters-10"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"gduFormat")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#gduformat"},(0,r.kt)("inlineCode",{parentName:"a"},"GduFormat"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The format of the map's parent GDU.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"basePriority")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The base label render priority. Label priorities are guaranteed to fall in the range ",(0,r.kt)("inlineCode",{parentName:"td"},"[basePriority, basePriority + 1)"),".")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"airportLargeTextSize")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"MapLabelTextSizeMode"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The text size mode with which to render large airport labels.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"airportMediumTextSize")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"MapLabelTextSizeMode"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The text size mode with which to render medium airport labels.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"airportSmallTextSize")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"MapLabelTextSizeMode"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The text size mode with which to render small airport labels.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"vorTextSize")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"MapLabelTextSizeMode"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The text size mode with which to render VOR labels.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"ndbTextSize")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"MapLabelTextSizeMode"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The text size mode with which to render NDB labels.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"intTextSize")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"MapLabelTextSizeMode"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The text size mode with which to render intersection labels.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"userTextSize")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"MapLabelTextSizeMode"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The text size mode with which to render user waypoint labels.")))),(0,r.kt)("h4",{id:"returns-11"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#g3xmapwaypointlabelstylefuncdef"},(0,r.kt)("inlineCode",{parentName:"a"},"G3XMapWaypointLabelStyleFuncDef"))),(0,r.kt)("p",null,"A function which retrieves G3X Touch map label styles for normal waypoints."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/Map/G3XMapWaypointStyles.ts:119"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"runwayoutlineiconstyles"},"runwayOutlineIconStyles"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"runwayOutlineIconStyles"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"basePriority"),"): (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"MapRunwayOutlineWaypoint"),") => ",(0,r.kt)("inlineCode",{parentName:"p"},"MapRunwayOutlineIconStyles")),(0,r.kt)("p",null,"Creates a function which retrieves G3X Touch map icon styles for runway outline waypoints."),(0,r.kt)("h4",{id:"parameters-11"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"basePriority")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The base icon render priority. Icon priorities are guaranteed to fall in the range ",(0,r.kt)("inlineCode",{parentName:"td"},"[basePriority, basePriority + 1)"),".")))),(0,r.kt)("h4",{id:"returns-12"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fn")),(0,r.kt)("p",null,"A function which retrieves G3X Touch map icon styles for normal waypoints."),(0,r.kt)("p",null,"\u25b8 (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"MapRunwayOutlineIconStyles")),(0,r.kt)("h5",{id:"parameters-12"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"MapRunwayOutlineWaypoint"))))),(0,r.kt)("h5",{id:"returns-13"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"MapRunwayOutlineIconStyles")),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/Map/G3XMapWaypointStyles.ts:264"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"vnaviconstyles"},"vnavIconStyles"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"vnavIconStyles"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"gduFormat"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"basePriority"),"): (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Waypoint"),") => ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointIconStyles")),(0,r.kt)("p",null,"Creates a function which retrieves G3X Touch map icon styles for VNAV waypoints."),(0,r.kt)("h4",{id:"parameters-13"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"gduFormat")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#gduformat"},(0,r.kt)("inlineCode",{parentName:"a"},"GduFormat"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The format of the map's parent GDU.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"basePriority")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The base icon render priority. Icon priorities are guaranteed to fall in the range ",(0,r.kt)("inlineCode",{parentName:"td"},"[basePriority, basePriority + 1)"),".")))),(0,r.kt)("h4",{id:"returns-14"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fn")),(0,r.kt)("p",null,"A function which retrieves G3X Touch map icon styles for VNAV waypoints."),(0,r.kt)("p",null,"\u25b8 (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointIconStyles")),(0,r.kt)("h5",{id:"parameters-14"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Waypoint"))))),(0,r.kt)("h5",{id:"returns-15"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointIconStyles")),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/Map/G3XMapWaypointStyles.ts:694"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"vnavlabelstyles"},"vnavLabelStyles"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"vnavLabelStyles"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"gduFormat"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"basePriority"),"): (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Waypoint"),") => ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointLabelStyles")),(0,r.kt)("p",null,"Creates a function which retrieves G3X Touch map label styles for VNAV waypoints."),(0,r.kt)("h4",{id:"parameters-15"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"gduFormat")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/modules#gduformat"},(0,r.kt)("inlineCode",{parentName:"a"},"GduFormat"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The format of the map's parent GDU.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"basePriority")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The base label render priority. Label priorities are guaranteed to fall in the range ",(0,r.kt)("inlineCode",{parentName:"td"},"[basePriority, basePriority + 1)"),".")))),(0,r.kt)("h4",{id:"returns-16"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fn")),(0,r.kt)("p",null,"A function which retrieves G3X Touch map label styles for VNAV waypoints."),(0,r.kt)("p",null,"\u25b8 (",(0,r.kt)("inlineCode",{parentName:"p"},"waypoint"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointLabelStyles")),(0,r.kt)("h5",{id:"parameters-16"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Waypoint"))))),(0,r.kt)("h5",{id:"returns-17"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"MapWaypointLabelStyles")),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/Components/Map/G3XMapWaypointStyles.ts:710"))}k.isMDXComponent=!0}}]);