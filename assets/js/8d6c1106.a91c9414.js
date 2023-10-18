"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[58436],{3905:(t,e,a)=>{a.d(e,{Zo:()=>c,kt:()=>f});var i=a(67294);function n(t,e,a){return e in t?Object.defineProperty(t,e,{value:a,enumerable:!0,configurable:!0,writable:!0}):t[e]=a,t}function r(t,e){var a=Object.keys(t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);e&&(i=i.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),a.push.apply(a,i)}return a}function l(t){for(var e=1;e<arguments.length;e++){var a=null!=arguments[e]?arguments[e]:{};e%2?r(Object(a),!0).forEach((function(e){n(t,e,a[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(a,e))}))}return t}function o(t,e){if(null==t)return{};var a,i,n=function(t,e){if(null==t)return{};var a,i,n={},r=Object.keys(t);for(i=0;i<r.length;i++)a=r[i],e.indexOf(a)>=0||(n[a]=t[a]);return n}(t,e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);for(i=0;i<r.length;i++)a=r[i],e.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(t,a)&&(n[a]=t[a])}return n}var p=i.createContext({}),s=function(t){var e=i.useContext(p),a=e;return t&&(a="function"==typeof t?t(e):l(l({},e),t)),a},c=function(t){var e=s(t.components);return i.createElement(p.Provider,{value:e},t.children)},d="mdxType",y={inlineCode:"code",wrapper:function(t){var e=t.children;return i.createElement(i.Fragment,{},e)}},m=i.forwardRef((function(t,e){var a=t.components,n=t.mdxType,r=t.originalType,p=t.parentName,c=o(t,["components","mdxType","originalType","parentName"]),d=s(a),m=n,f=d["".concat(p,".").concat(m)]||d[m]||y[m]||r;return a?i.createElement(f,l(l({ref:e},c),{},{components:a})):i.createElement(f,l({ref:e},c))}));function f(t,e){var a=arguments,n=e&&e.mdxType;if("string"==typeof t||n){var r=a.length,l=new Array(r);l[0]=m;var o={};for(var p in e)hasOwnProperty.call(e,p)&&(o[p]=e[p]);o.originalType=t,o[d]="string"==typeof t?t:n,l[1]=o;for(var s=2;s<r;s++)l[s]=a[s];return i.createElement.apply(null,l)}return i.createElement.apply(null,a)}m.displayName="MDXCreateElement"},60745:(t,e,a)=>{a.r(e),a.d(e,{assets:()=>p,contentTitle:()=>l,default:()=>y,frontMatter:()=>r,metadata:()=>o,toc:()=>s});var i=a(87462),n=(a(67294),a(3905));const r={id:"index.FacilityWaypointUtils",title:"Class: FacilityWaypointUtils",sidebar_label:"FacilityWaypointUtils",custom_edit_url:null},l=void 0,o={unversionedId:"framework/classes/index.FacilityWaypointUtils",id:"framework/classes/index.FacilityWaypointUtils",title:"Class: FacilityWaypointUtils",description:"index.FacilityWaypointUtils",source:"@site/docs/framework/classes/index.FacilityWaypointUtils.md",sourceDirName:"framework/classes",slug:"/framework/classes/index.FacilityWaypointUtils",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.FacilityWaypointUtils",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.FacilityWaypointUtils",title:"Class: FacilityWaypointUtils",sidebar_label:"FacilityWaypointUtils",custom_edit_url:null},sidebar:"sidebar",previous:{title:"FacilityUtils",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.FacilityUtils"},next:{title:"FilteredMapSubject",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.FilteredMapSubject"}},p={},s=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Methods",id:"methods",level:2},{value:"isFacilityWaypoint",id:"isfacilitywaypoint",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4}],c={toc:s},d="wrapper";function y(t){let{components:e,...a}=t;return(0,n.kt)(d,(0,i.Z)({},c,a,{components:e,mdxType:"MDXLayout"}),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".FacilityWaypointUtils"),(0,n.kt)("p",null,"A utility class for working with FacilityWaypoint."),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new FacilityWaypointUtils"),"()"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"isfacilitywaypoint"},"isFacilityWaypoint"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,n.kt)("strong",{parentName:"p"},"isFacilityWaypoint"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"waypoint"),"): waypoint is FacilityWaypoint<Facility",">"),(0,n.kt)("p",null,"Checks whether a waypoint is a ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.FacilityWaypoint"},"FacilityWaypoint"),"."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.Waypoint"},(0,n.kt)("inlineCode",{parentName:"a"},"Waypoint"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The waypoint to check.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,"waypoint is FacilityWaypoint<Facility",">"),(0,n.kt)("p",null,"Whether the specified waypoint is a ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.FacilityWaypoint"},"FacilityWaypoint"),"."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/navigation/Waypoint.ts:227"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,n.kt)("strong",{parentName:"p"},"isFacilityWaypoint"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"T"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"waypoint"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"facilityType"),"): waypoint is FacilityWaypoint<FacilityTypeMap","[T]",">"),(0,n.kt)("p",null,"Checks whether a waypoint is a ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.FacilityWaypoint"},"FacilityWaypoint")," of a given facility type."),(0,n.kt)("h4",{id:"type-parameters"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/enums/index.FacilityType"},(0,n.kt)("inlineCode",{parentName:"a"},"FacilityType")))))),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"waypoint")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.Waypoint"},(0,n.kt)("inlineCode",{parentName:"a"},"Waypoint"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The waypoint to check.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"facilityType")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The facility type to check against.")))),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,"waypoint is FacilityWaypoint<FacilityTypeMap","[T]",">"),(0,n.kt)("p",null,"Whether the specified waypoint is a ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.FacilityWaypoint"},"FacilityWaypoint")," of the specified facility type."),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/navigation/Waypoint.ts:234"))}y.isMDXComponent=!0}}]);