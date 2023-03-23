"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[97709],{3905:(e,t,a)=>{a.d(t,{Zo:()=>s,kt:()=>y});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var c=r.createContext({}),p=function(e){var t=r.useContext(c),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},s=function(e){var t=p(e.components);return r.createElement(c.Provider,{value:t},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,c=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=p(a),f=n,y=m["".concat(c,".").concat(f)]||m[f]||d[f]||i;return a?r.createElement(y,l(l({ref:t},s),{},{components:a})):r.createElement(y,l({ref:t},s))}));function y(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,l=new Array(i);l[0]=f;var o={};for(var c in t)hasOwnProperty.call(t,c)&&(o[c]=t[c]);o.originalType=e,o[m]="string"==typeof e?e:n,l[1]=o;for(var p=2;p<i;p++)l[p]=a[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}f.displayName="MDXCreateElement"},46170:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>d,frontMatter:()=>i,metadata:()=>o,toc:()=>p});var r=a(87462),n=(a(67294),a(3905));const i={id:"index.FacilityWaypointCache",title:"Interface: FacilityWaypointCache",sidebar_label:"FacilityWaypointCache",custom_edit_url:null},l=void 0,o={unversionedId:"framework/interfaces/index.FacilityWaypointCache",id:"framework/interfaces/index.FacilityWaypointCache",title:"Interface: FacilityWaypointCache",description:"index.FacilityWaypointCache",source:"@site/docs/framework/interfaces/index.FacilityWaypointCache.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.FacilityWaypointCache",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.FacilityWaypointCache",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.FacilityWaypointCache",title:"Interface: FacilityWaypointCache",sidebar_label:"FacilityWaypointCache",custom_edit_url:null},sidebar:"sidebar",previous:{title:"FacilityWaypoint",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.FacilityWaypoint"},next:{title:"FlightPathCalculatorControlEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.FlightPathCalculatorControlEvents"}},c={},p=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Methods",id:"methods",level:2},{value:"get",id:"get",level:3},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4}],s={toc:p},m="wrapper";function d(e){let{components:t,...a}=e;return(0,n.kt)(m,(0,r.Z)({},s,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".FacilityWaypointCache"),(0,n.kt)("p",null,"A cache of facility waypoints."),(0,n.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/framework/classes/index.DefaultFacilityWaypointCache"},(0,n.kt)("inlineCode",{parentName:"a"},"DefaultFacilityWaypointCache")))),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"get"},"get"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"get"),"<",(0,n.kt)("inlineCode",{parentName:"p"},"T"),">","(",(0,n.kt)("inlineCode",{parentName:"p"},"facility"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.FacilityWaypoint"},(0,n.kt)("inlineCode",{parentName:"a"},"FacilityWaypoint")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,n.kt)("p",null,"Gets a waypoint from the cache for a specific facility. If one does not exist, a new waypoint will be created."),(0,n.kt)("h4",{id:"type-parameters"},"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.Facility"},(0,n.kt)("inlineCode",{parentName:"a"},"Facility")))))),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"facility")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.Facility"},(0,n.kt)("inlineCode",{parentName:"a"},"Facility"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The facility for which to get a waypoint.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.FacilityWaypoint"},(0,n.kt)("inlineCode",{parentName:"a"},"FacilityWaypoint")),"<",(0,n.kt)("inlineCode",{parentName:"p"},"T"),">"),(0,n.kt)("p",null,"A waypoint."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/navigation/FacilityWaypointCache.ts:13"))}d.isMDXComponent=!0}}]);