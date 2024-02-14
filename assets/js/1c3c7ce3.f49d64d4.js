"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[71620],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>c});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},d=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},k="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),k=p(n),m=a,c=k["".concat(s,".").concat(m)]||k[m]||u[m]||i;return n?r.createElement(c,l(l({ref:t},d),{},{components:n})):r.createElement(c,l({ref:t},d))}));function c(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=m;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[k]="string"==typeof e?e:a,l[1]=o;for(var p=2;p<i;p++)l[p]=n[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},78391:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>o,toc:()=>p});var r=n(87462),a=(n(67294),n(3905));const i={id:"LerpLookupTable",title:"Class: LerpLookupTable",sidebar_label:"LerpLookupTable",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/classes/LerpLookupTable",id:"framework/classes/LerpLookupTable",title:"Class: LerpLookupTable",description:"A linearly interpolated N-dimensional lookup table.",source:"@site/docs/framework/classes/LerpLookupTable.md",sourceDirName:"framework/classes",slug:"/framework/classes/LerpLookupTable",permalink:"/msfs-avionics-mirror/docs/framework/classes/LerpLookupTable",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"LerpLookupTable",title:"Class: LerpLookupTable",sidebar_label:"LerpLookupTable",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"LatLonDisplay",permalink:"/msfs-avionics-mirror/docs/framework/classes/LatLonDisplay"},next:{title:"LerpVectorLookupTable",permalink:"/msfs-avionics-mirror/docs/framework/classes/LerpVectorLookupTable"}},s={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"Accessors",id:"accessors",level:2},{value:"dimensionCount",id:"dimensioncount",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"get",id:"get",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"insertBreakpoint",id:"insertbreakpoint",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-4",level:4}],d={toc:p},k="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(k,(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A linearly interpolated N-dimensional lookup table."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new LerpLookupTable"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"dimensionCount"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/LerpLookupTable"},(0,a.kt)("inlineCode",{parentName:"a"},"LerpLookupTable"))),(0,a.kt)("p",null,"Creates a lookup table of a specified dimension."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"dimensionCount")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The number of dimensions in the new table. Values less than 0 will be clamped to 0.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/LerpLookupTable"},(0,a.kt)("inlineCode",{parentName:"a"},"LerpLookupTable"))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/datastructures/LerpLookupTable.ts:39"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new LerpLookupTable"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"breakpoints"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/LerpLookupTable"},(0,a.kt)("inlineCode",{parentName:"a"},"LerpLookupTable"))),(0,a.kt)("p",null,"Creates a lookup table initialized with an array of breakpoints."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"breakpoints")),(0,a.kt)("td",{parentName:"tr",align:"left"},"readonly readonly ",(0,a.kt)("inlineCode",{parentName:"td"},"number"),"[][]"),(0,a.kt)("td",{parentName:"tr",align:"left"},"An array of breakpoints with which to initialize the new table. Each breakpoint should be expressed as a number array, where the first element represents the breakpoint value, and the next N elements represent the breakpoint key in each dimension. If not all breakpoint arrays have the same length, the dimension of the table will be set equal to ",(0,a.kt)("inlineCode",{parentName:"td"},"L - 1"),", where ",(0,a.kt)("inlineCode",{parentName:"td"},"L")," is the length of the shortest array. For arrays with length greater than ",(0,a.kt)("inlineCode",{parentName:"td"},"L"),", all keys after index ",(0,a.kt)("inlineCode",{parentName:"td"},"L - 1")," will be ignored. If the table ends up with zero dimensions, it will be initialized to an empty table.")))),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/LerpLookupTable"},(0,a.kt)("inlineCode",{parentName:"a"},"LerpLookupTable"))),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/datastructures/LerpLookupTable.ts:49"),(0,a.kt)("h2",{id:"accessors"},"Accessors"),(0,a.kt)("h3",{id:"dimensioncount"},"dimensionCount"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"get")," ",(0,a.kt)("strong",{parentName:"p"},"dimensionCount"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The number of dimensions in this table."),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/datastructures/LerpLookupTable.ts:29"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"get"},"get"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"get"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"...key"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Looks up a value in this table using a specified key. The returned value will be linearly interpolated from\nsurrounding breakpoints if the key is not an exact match for any of the table's breakpoints."),(0,a.kt)("h4",{id:"parameters-2"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"...key")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number"),"[]"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The lookup key, as an ordered N-tuple of numbers.")))),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The value corresponding to the specified key."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,a.kt)("p",null,"Error if this table has zero dimensions, the key has fewer dimensions than this table, or a value could\nnot be retrieved."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/datastructures/LerpLookupTable.ts:125"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"insertbreakpoint"},"insertBreakpoint"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"insertBreakpoint"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"breakpoint"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"this")),(0,a.kt)("p",null,"Inserts a breakpoint into this table. If the breakpoint has more dimensions than this table, only the first ",(0,a.kt)("inlineCode",{parentName:"p"},"N"),"\nkeys of the breakpoint will be used, where ",(0,a.kt)("inlineCode",{parentName:"p"},"N")," is the dimension count of this table."),(0,a.kt)("h4",{id:"parameters-3"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"breakpoint")),(0,a.kt)("td",{parentName:"tr",align:"left"},"readonly ",(0,a.kt)("inlineCode",{parentName:"td"},"number"),"[]"),(0,a.kt)("td",{parentName:"tr",align:"left"},"A breakpoint, as a number array with the value at index 0 followed by the keys for each dimension.")))),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"this")),(0,a.kt)("p",null,"This table, after the breakpoint has been inserted."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,a.kt)("p",null,"Error if this table has zero dimensions, or the breakpoint has fewer dimensions than this table."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/utils/datastructures/LerpLookupTable.ts:77"))}u.isMDXComponent=!0}}]);