"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[10989],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>k});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function d(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},l=Object.keys(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var o=r.createContext({}),s=function(e){var t=r.useContext(o),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},p=function(e){var t=s(e.components);return r.createElement(o.Provider,{value:t},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,l=e.originalType,o=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),u=s(a),m=n,k=u["".concat(o,".").concat(m)]||u[m]||c[m]||l;return a?r.createElement(k,i(i({ref:t},p),{},{components:a})):r.createElement(k,i({ref:t},p))}));function k(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var l=a.length,i=new Array(l);i[0]=m;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[u]="string"==typeof e?e:n,i[1]=d;for(var s=2;s<l;s++)i[s]=a[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,a)}m.displayName="MDXCreateElement"},73939:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>o,contentTitle:()=>i,default:()=>c,frontMatter:()=>l,metadata:()=>d,toc:()=>s});var r=a(87462),n=(a(67294),a(3905));const l={id:"GlidePathCalculator",title:"Class: GlidePathCalculator",sidebar_label:"GlidePathCalculator",sidebar_position:0,custom_edit_url:null},i=void 0,d={unversionedId:"framework/classes/GlidePathCalculator",id:"framework/classes/GlidePathCalculator",title:"Class: GlidePathCalculator",description:"Handles the calculation of a Glide Path.",source:"@site/docs/framework/classes/GlidePathCalculator.md",sourceDirName:"framework/classes",slug:"/framework/classes/GlidePathCalculator",permalink:"/msfs-avionics-mirror/docs/framework/classes/GlidePathCalculator",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GlidePathCalculator",title:"Class: GlidePathCalculator",sidebar_label:"GlidePathCalculator",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GeodesicResampler",permalink:"/msfs-avionics-mirror/docs/framework/classes/GeodesicResampler"},next:{title:"GpsSynchronizer",permalink:"/msfs-avionics-mirror/docs/framework/classes/GpsSynchronizer"}},o={},s=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"glidepathFpa",id:"glidepathfpa",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"getDesiredGlidepathAltitude",id:"getdesiredglidepathaltitude",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"getGlidepathDistance",id:"getglidepathdistance",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"getRunwayAltitude",id:"getrunwayaltitude",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-4",level:4}],p={toc:s},u="wrapper";function c(e){let{components:t,...a}=e;return(0,n.kt)(u,(0,r.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Handles the calculation of a Glide Path."),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new GlidePathCalculator"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"flightPlanner"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"primaryPlanIndex"),"): ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/GlidePathCalculator"},(0,n.kt)("inlineCode",{parentName:"a"},"GlidePathCalculator"))),(0,n.kt)("p",null,"Creates a new instance of GlidePathCalculator."),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"bus")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/EventBus"},(0,n.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,n.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"flightPlanner")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanner"},(0,n.kt)("inlineCode",{parentName:"a"},"FlightPlanner")),"<",(0,n.kt)("inlineCode",{parentName:"td"},"any"),">"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The flight planner to use with this instance.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"primaryPlanIndex")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The primary plan index to use for calculating GlidePath.")))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/GlidePathCalculator"},(0,n.kt)("inlineCode",{parentName:"a"},"GlidePathCalculator"))),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/autopilot/calculators/GlidePathCalculator.ts:29"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"glidepathfpa"},"glidepathFpa"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"glidepathFpa"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,n.kt)("inlineCode",{parentName:"p"},"0")),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/autopilot/calculators/GlidePathCalculator.ts:21"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"getdesiredglidepathaltitude"},"getDesiredGlidepathAltitude"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"getDesiredGlidepathAltitude"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"distance"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"Gets the Glidepath desired altitude in meters."),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"distance")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The current Glidepath distance in meters.")))),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"The current Glidepath desired altitude in meters."),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"src/sdk/autopilot/calculators/GlidePathCalculator.ts:150"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"getglidepathdistance"},"getGlidepathDistance"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"getGlidepathDistance"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"index"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"distanceAlongLeg"),"): ",(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"Gets the current Glidepath distance in meters."),(0,n.kt)("h4",{id:"parameters-2"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"index")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The global index of the active leg.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"distanceAlongLeg")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The aircraft's current distance along the active leg, in meters.")))),(0,n.kt)("h4",{id:"returns-2"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"The current Glidepath distance in meters."),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"src/sdk/autopilot/calculators/GlidePathCalculator.ts:100"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"getrunwayaltitude"},"getRunwayAltitude"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"getRunwayAltitude"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"Gets the Glidepath runway altitude in meters."),(0,n.kt)("h4",{id:"returns-3"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"number")),(0,n.kt)("p",null,"The Glidepath runway altitude in meters."),(0,n.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,n.kt)("p",null,"src/sdk/autopilot/calculators/GlidePathCalculator.ts:158"))}c.isMDXComponent=!0}}]);