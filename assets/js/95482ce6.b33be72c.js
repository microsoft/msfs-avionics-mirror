"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[11577],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>N});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var d=a.createContext({}),o=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},m=function(e){var t=o(e.components);return a.createElement(d.Provider,{value:t},e.children)},k="mdxType",s={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,l=e.originalType,d=e.parentName,m=p(e,["components","mdxType","originalType","parentName"]),k=o(n),u=r,N=k["".concat(d,".").concat(u)]||k[u]||s[u]||l;return n?a.createElement(N,i(i({ref:t},m),{},{components:n})):a.createElement(N,i({ref:t},m))}));function N(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=n.length,i=new Array(l);i[0]=u;var p={};for(var d in t)hasOwnProperty.call(t,d)&&(p[d]=t[d]);p.originalType=e,p[k]="string"==typeof e?e:r,i[1]=p;for(var o=2;o<l;o++)i[o]=n[o];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},12472:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>i,default:()=>s,frontMatter:()=>l,metadata:()=>p,toc:()=>o});var a=n(87462),r=(n(67294),n(3905));const l={id:"ConfigParser",title:"Class: ConfigParser",sidebar_label:"ConfigParser",sidebar_position:0,custom_edit_url:null},i=void 0,p={unversionedId:"framework/classes/ConfigParser",id:"framework/classes/ConfigParser",title:"Class: ConfigParser",description:"A parser for FmsConfig elements.",source:"@site/docs/framework/classes/ConfigParser.md",sourceDirName:"framework/classes",slug:"/framework/classes/ConfigParser",permalink:"/msfs-avionics-mirror/docs/framework/classes/ConfigParser",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"ConfigParser",title:"Class: ConfigParser",sidebar_label:"ConfigParser",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"ConfigBuilder",permalink:"/msfs-avionics-mirror/docs/framework/classes/ConfigBuilder"},next:{title:"ConnectCirclesBuilder",permalink:"/msfs-avionics-mirror/docs/framework/classes/ConnectCirclesBuilder"}},d={},o=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Properties",id:"properties",level:2},{value:"configName",id:"configname",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"getChildElement",id:"getchildelement",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"getChildElements",id:"getchildelements",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"getChildLerpLookupTable",id:"getchildlerplookuptable",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"getIntegerAttrValue",id:"getintegerattrvalue",level:3},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"getStringAttrValue",id:"getstringattrvalue",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"getTextContent",id:"gettextcontent",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"optional",id:"optional",level:3},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-7",level:4}],m={toc:o},k="wrapper";function s(e){let{components:t,...n}=e;return(0,r.kt)(k,(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A parser for FmsConfig elements."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new ConfigParser"),"(): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/ConfigParser"},(0,r.kt)("inlineCode",{parentName:"a"},"ConfigParser"))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/ConfigParser"},(0,r.kt)("inlineCode",{parentName:"a"},"ConfigParser"))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"configname"},"configName"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("strong",{parentName:"p"},"configName"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"'ConfigParser'")),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/config/ConfigUtils.ts:5"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"getchildelement"},"getChildElement"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getChildElement"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"parentElement"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"tagName"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"Element")),(0,r.kt)("p",null,"Gets the first occurrence of a given child element."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"parentElement")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The element to search on.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"tagName")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The tag name to find.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Element")),(0,r.kt)("p",null,"An element."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"If no element is found."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/config/ConfigUtils.ts:32"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getchildelements"},"getChildElements"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getChildElements"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"parentElement"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"tagName"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"Element"),"[]"),(0,r.kt)("p",null,"Gets all occurrences of a given child element type."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"parentElement")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The element to search on.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"tagName")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The tag name to find.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Element"),"[]"),(0,r.kt)("p",null,"All child elements that match."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/config/ConfigUtils.ts:49"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getchildlerplookuptable"},"getChildLerpLookupTable"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getChildLerpLookupTable"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"parentElement"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"tagName"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/LerpLookupTable"},(0,r.kt)("inlineCode",{parentName:"a"},"LerpLookupTable"))),(0,r.kt)("p",null,"Gets a LookupTable child of an element"),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"parentElement")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The element to search on.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"tagName")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The tag name to find.")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/LerpLookupTable"},(0,r.kt)("inlineCode",{parentName:"a"},"LerpLookupTable"))),(0,r.kt)("p",null,"LerpLookupTable"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"If a lookup table cannot be parsed"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/config/ConfigUtils.ts:62"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getintegerattrvalue"},"getIntegerAttrValue"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getIntegerAttrValue"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"attributeName"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"allowZero?"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"allowNegative?"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"T")),(0,r.kt)("p",null,"Gets an integer attribute value of an element."),(0,r.kt)("h4",{id:"type-parameters"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"number"))))),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The element to search on.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"attributeName")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The attribute to find on the element.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"allowZero")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"false")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether zero should be allowed as a value.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"allowNegative")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"false")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether negative numbers should be allowed as a value.")))),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"T")),(0,r.kt)("p",null,"The attribute's value."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"If the attribute is not present."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/config/ConfigUtils.ts:167"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getstringattrvalue"},"getStringAttrValue"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getStringAttrValue"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"attributeName"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"T")),(0,r.kt)("p",null,"Gets a string attribute value of an element."),(0,r.kt)("h4",{id:"type-parameters-1"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T")),(0,r.kt)("td",{parentName:"tr",align:"left"},"extends ",(0,r.kt)("inlineCode",{parentName:"td"},"string"))))),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The element to search on.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"attributeName")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The attribute to find on the element.")))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"T")),(0,r.kt)("p",null,"The attribute's value."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"If the attribute is not present."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/config/ConfigUtils.ts:154"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"gettextcontent"},"getTextContent"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getTextContent"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"element"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("p",null,"Gets the text content of an element."),(0,r.kt)("h4",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"element")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The element to search on.")))),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("p",null,"The element's text content."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"If no text content is present."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/config/ConfigUtils.ts:120"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"optional"},"optional"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"optional"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"T"),">","(",(0,r.kt)("inlineCode",{parentName:"p"},"executor"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"defaultValue"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"T")),(0,r.kt)("p",null,"Returns a value computed by an executor, with a fallback value if the executor throws"),(0,r.kt)("h4",{id:"type-parameters-2"},"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T"))))),(0,r.kt)("h4",{id:"parameters-6"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"executor")),(0,r.kt)("td",{parentName:"tr",align:"left"},"() => ",(0,r.kt)("inlineCode",{parentName:"td"},"T")),(0,r.kt)("td",{parentName:"tr",align:"left"},"the executor which returns the value")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"defaultValue")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"T")),(0,r.kt)("td",{parentName:"tr",align:"left"},"a fallback value in case the executor throws")))),(0,r.kt)("h4",{id:"returns-7"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"T")),(0,r.kt)("p",null,"T"),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/config/ConfigUtils.ts:15"))}s.isMDXComponent=!0}}]);