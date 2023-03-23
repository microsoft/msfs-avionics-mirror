"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[89601],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>k});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function s(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var l=r.createContext({}),d=function(e){var t=r.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):s(s({},t),e)),a},p=function(e){var t=d(e.components);return r.createElement(l.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,l=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=d(a),u=n,k=m["".concat(l,".").concat(u)]||m[u]||c[u]||i;return a?r.createElement(k,s(s({ref:t},p),{},{components:a})):r.createElement(k,s({ref:t},p))}));function k(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,s=new Array(i);s[0]=u;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[m]="string"==typeof e?e:n,s[1]=o;for(var d=2;d<i;d++)s[d]=a[d];return r.createElement.apply(null,s)}return r.createElement.apply(null,a)}u.displayName="MDXCreateElement"},24734:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>l,contentTitle:()=>s,default:()=>c,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var r=a(87462),n=(a(67294),a(3905));const i={id:"index.NearestLodBoundarySearchSession",title:"Class: NearestLodBoundarySearchSession",sidebar_label:"NearestLodBoundarySearchSession",custom_edit_url:null},s=void 0,o={unversionedId:"framework/classes/index.NearestLodBoundarySearchSession",id:"framework/classes/index.NearestLodBoundarySearchSession",title:"Class: NearestLodBoundarySearchSession",description:"index.NearestLodBoundarySearchSession",source:"@site/docs/framework/classes/index.NearestLodBoundarySearchSession.md",sourceDirName:"framework/classes",slug:"/framework/classes/index.NearestLodBoundarySearchSession",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.NearestLodBoundarySearchSession",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.NearestLodBoundarySearchSession",title:"Class: NearestLodBoundarySearchSession",sidebar_label:"NearestLodBoundarySearchSession",custom_edit_url:null},sidebar:"sidebar",previous:{title:"NearestIntersectionSubscription",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.NearestIntersectionSubscription"},next:{title:"NearestNdbSubscription",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.NearestNdbSubscription"}},l={},d=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"cache",id:"cache",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"frameBudget",id:"framebudget",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"session",id:"session",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"searchNearest",id:"searchnearest",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"setFilter",id:"setfilter",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-5",level:4}],p={toc:d},m="wrapper";function c(e){let{components:t,...a}=e;return(0,n.kt)(m,(0,r.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".NearestLodBoundarySearchSession"),(0,n.kt)("p",null,"A nearest search session for boundaries (airspaces) in the form of LodBoundary objects."),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new NearestLodBoundarySearchSession"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"cache"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"session"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"frameBudget"),")"),(0,n.kt)("p",null,"Constructor."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"cache")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.LodBoundaryCache"},(0,n.kt)("inlineCode",{parentName:"a"},"LodBoundaryCache"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The boundary cache this search session uses.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"session")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.NearestBoundarySearchSession"},(0,n.kt)("inlineCode",{parentName:"a"},"NearestBoundarySearchSession"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The nearest boundary facility search session this search session uses.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"frameBudget")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The maximum amount of time allotted per frame to retrieve and process LodBoundary objects, in milliseconds.")))),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/navigation/NearestLodBoundarySearchSession.ts:28"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"cache"},"cache"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"cache"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.LodBoundaryCache"},(0,n.kt)("inlineCode",{parentName:"a"},"LodBoundaryCache"))),(0,n.kt)("p",null,"The boundary cache this search session uses."),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/navigation/NearestLodBoundarySearchSession.ts:29"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"framebudget"},"frameBudget"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"frameBudget"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"The maximum amount of time allotted per frame to retrieve and process LodBoundary objects, in\nmilliseconds."),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/navigation/NearestLodBoundarySearchSession.ts:31"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"session"},"session"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"session"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.NearestBoundarySearchSession"},(0,n.kt)("inlineCode",{parentName:"a"},"NearestBoundarySearchSession"))),(0,n.kt)("p",null,"The nearest boundary facility search session this search session uses."),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/sdk/navigation/NearestLodBoundarySearchSession.ts:30"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"searchnearest"},"searchNearest"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"searchNearest"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"lat"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"lon"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"radius"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"maxItems"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/#nearestlodboundarysearchresults"},(0,n.kt)("inlineCode",{parentName:"a"},"NearestLodBoundarySearchResults")),">"),(0,n.kt)("p",null,"Searches for the nearest boundaries around a specified location."),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"lat")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The latitude of the search center, in degrees.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"lon")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The longitude of the search center, in degrees.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"radius")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The radius of the search, in meters.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"maxItems")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The maximum number of items for which to search.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/#nearestlodboundarysearchresults"},(0,n.kt)("inlineCode",{parentName:"a"},"NearestLodBoundarySearchResults")),">"),(0,n.kt)("p",null,"The nearest search results."),(0,n.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,n.kt)("p",null,"src/sdk/navigation/NearestLodBoundarySearchSession.ts:43"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"setfilter"},"setFilter"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"setFilter"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"classMask"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("p",null,"Sets this session's boundary class filter. The new filter takes effect with the next search executed in this\nsession."),(0,n.kt)("h4",{id:"parameters-2"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"classMask")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"A bitmask defining the boundary classes to include in the search (",(0,n.kt)("inlineCode",{parentName:"td"},"0"),": exclude, ",(0,n.kt)("inlineCode",{parentName:"td"},"1"),": include). The bit index for each boundary class is equal to the value of the corresponding ",(0,n.kt)("inlineCode",{parentName:"td"},"BoundaryType")," enum.")))),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"void")),(0,n.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,n.kt)("p",null,"src/sdk/navigation/NearestLodBoundarySearchSession.ts:63"))}c.isMDXComponent=!0}}]);