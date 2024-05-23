"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[26103],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>f});var n=r(67294);function l(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){l(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function a(e,t){if(null==e)return{};var r,n,l=function(e,t){if(null==e)return{};var r,n,l={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(l[r]=e[r]);return l}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(l[r]=e[r])}return l}var s=n.createContext({}),m=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},u=function(e){var t=m(e.components);return n.createElement(s.Provider,{value:t},e.children)},c="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,l=e.mdxType,o=e.originalType,s=e.parentName,u=a(e,["components","mdxType","originalType","parentName"]),c=m(r),d=l,f=c["".concat(s,".").concat(d)]||c[d]||p[d]||o;return r?n.createElement(f,i(i({ref:t},u),{},{components:r})):n.createElement(f,i({ref:t},u))}));function f(e,t){var r=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var o=r.length,i=new Array(o);i[0]=d;var a={};for(var s in t)hasOwnProperty.call(t,s)&&(a[s]=t[s]);a.originalType=e,a[c]="string"==typeof e?e:l,i[1]=a;for(var m=2;m<o;m++)i[m]=r[m];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},84537:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>p,frontMatter:()=>o,metadata:()=>a,toc:()=>m});var n=r(87462),l=(r(67294),r(3905));const o={id:"MinimumsAlertController",title:"Class: MinimumsAlertController",sidebar_label:"MinimumsAlertController",sidebar_position:0,custom_edit_url:null},i=void 0,a={unversionedId:"wt21pfd/classes/MinimumsAlertController",id:"wt21pfd/classes/MinimumsAlertController",title:"Class: MinimumsAlertController",description:"Class to manage the minimums alerter on the PFD",source:"@site/docs/wt21pfd/classes/MinimumsAlertController.md",sourceDirName:"wt21pfd/classes",slug:"/wt21pfd/classes/MinimumsAlertController",permalink:"/msfs-avionics-mirror/docs/wt21pfd/classes/MinimumsAlertController",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MinimumsAlertController",title:"Class: MinimumsAlertController",sidebar_label:"MinimumsAlertController",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MarkerBeacon",permalink:"/msfs-avionics-mirror/docs/wt21pfd/classes/MarkerBeacon"},next:{title:"PfdBaroSetMenu",permalink:"/msfs-avionics-mirror/docs/wt21pfd/classes/PfdBaroSetMenu"}},s={},m=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4}],u={toc:m},c="wrapper";function p(e){let{components:t,...r}=e;return(0,l.kt)(c,(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"Class to manage the minimums alerter on the PFD"),(0,l.kt)("h2",{id:"constructors"},"Constructors"),(0,l.kt)("h3",{id:"constructor"},"constructor"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"new MinimumsAlertController"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"bus"),"): ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21pfd/classes/MinimumsAlertController"},(0,l.kt)("inlineCode",{parentName:"a"},"MinimumsAlertController"))),(0,l.kt)("p",null,"Ctor"),(0,l.kt)("h4",{id:"parameters"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"bus")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,l.kt)("td",{parentName:"tr",align:"left"},"the event bus")))),(0,l.kt)("h4",{id:"returns"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21pfd/classes/MinimumsAlertController"},(0,l.kt)("inlineCode",{parentName:"a"},"MinimumsAlertController"))),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/PFD/Components/FlightInstruments/MinimumsAlertController.ts:34"))}p.isMDXComponent=!0}}]);