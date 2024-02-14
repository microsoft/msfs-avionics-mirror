"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[68114],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>v});var n=a(67294);function i(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function r(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){i(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function d(e,t){if(null==e)return{};var a,n,i=function(e,t){if(null==e)return{};var a,n,i={},l=Object.keys(e);for(n=0;n<l.length;n++)a=l[n],t.indexOf(a)>=0||(i[a]=e[a]);return i}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)a=l[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}var o=n.createContext({}),p=function(e){var t=n.useContext(o),a=t;return e&&(a="function"==typeof e?e(t):r(r({},t),e)),a},m=function(e){var t=p(e.components);return n.createElement(o.Provider,{value:t},e.children)},k="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var a=e.components,i=e.mdxType,l=e.originalType,o=e.parentName,m=d(e,["components","mdxType","originalType","parentName"]),k=p(a),s=i,v=k["".concat(o,".").concat(s)]||k[s]||u[s]||l;return a?n.createElement(v,r(r({ref:t},m),{},{components:a})):n.createElement(v,r({ref:t},m))}));function v(e,t){var a=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var l=a.length,r=new Array(l);r[0]=s;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[k]="string"==typeof e?e:i,r[1]=d;for(var p=2;p<l;p++)r[p]=a[p];return n.createElement.apply(null,r)}return n.createElement.apply(null,a)}s.displayName="MDXCreateElement"},7493:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>o,contentTitle:()=>r,default:()=>u,frontMatter:()=>l,metadata:()=>d,toc:()=>p});var n=a(87462),i=(a(67294),a(3905));const l={id:"GarminVNavManager",title:"Class: GarminVNavManager",sidebar_label:"GarminVNavManager",sidebar_position:0,custom_edit_url:null},r=void 0,d={unversionedId:"garminsdk/classes/GarminVNavManager",id:"garminsdk/classes/GarminVNavManager",title:"Class: GarminVNavManager",description:"A Garmin VNAV Manager.",source:"@site/docs/garminsdk/classes/GarminVNavManager.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/GarminVNavManager",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminVNavManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GarminVNavManager",title:"Class: GarminVNavManager",sidebar_label:"GarminVNavManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GarminVNavComputer",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminVNavComputer"},next:{title:"GarminVNavManager2",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminVNavManager2"}},o={},p=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"activateMode",id:"activatemode",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-1",level:5},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"armMode",id:"armmode",level:3},{value:"Type declaration",id:"type-declaration-1",level:4},{value:"Parameters",id:"parameters-2",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"calculator",id:"calculator",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"capturedAltitude",id:"capturedaltitude",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"glidepathCalculator",id:"glidepathcalculator",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"lpvDeviation",id:"lpvdeviation",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"onActivate",id:"onactivate",level:3},{value:"Type declaration",id:"type-declaration-2",level:4},{value:"Returns",id:"returns-3",level:5},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"onDeactivate",id:"ondeactivate",level:3},{value:"Type declaration",id:"type-declaration-3",level:4},{value:"Returns",id:"returns-4",level:5},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"onDisable",id:"ondisable",level:3},{value:"Type declaration",id:"type-declaration-4",level:4},{value:"Returns",id:"returns-5",level:5},{value:"Defined in",id:"defined-in-9",level:4},{value:"onEnable",id:"onenable",level:3},{value:"Type declaration",id:"type-declaration-5",level:4},{value:"Returns",id:"returns-6",level:5},{value:"Defined in",id:"defined-in-10",level:4},{value:"state",id:"state",level:3},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"Methods",id:"methods",level:2},{value:"canVerticalModeActivate",id:"canverticalmodeactivate",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Implementation of",id:"implementation-of-5",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"onPathDirectorDeactivated",id:"onpathdirectordeactivated",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Implementation of",id:"implementation-of-6",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"setState",id:"setstate",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Implementation of",id:"implementation-of-7",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"tryActivate",id:"tryactivate",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Implementation of",id:"implementation-of-8",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"tryDeactivate",id:"trydeactivate",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Implementation of",id:"implementation-of-9",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"update",id:"update",level:3},{value:"Returns",id:"returns-12",level:4},{value:"Implementation of",id:"implementation-of-10",level:4},{value:"Defined in",id:"defined-in-17",level:4}],m={toc:p},k="wrapper";function u(e){let{components:t,...a}=e;return(0,i.kt)(k,(0,n.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A Garmin VNAV Manager."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Deprecated"))),(0,i.kt)("h2",{id:"implements"},"Implements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"VNavManager"))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new GarminVNavManager"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"flightPlanner"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"calculator"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"apValues"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"primaryPlanIndex"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"hasNonPathVnav?"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"guidanceEndsAtFaf?"),"): ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminVNavManager"},(0,i.kt)("inlineCode",{parentName:"a"},"GarminVNavManager"))),(0,i.kt)("p",null,"Creates an instance of the Garmin VNAV Manager."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"bus")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The event bus to use with this instance.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"flightPlanner")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"FlightPlanner"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"any"),">"),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The flight planner to use with this instance.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"calculator")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"BottomTargetPathCalculator")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The VNAV path calculator to use with this instance.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"apValues")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"APValues")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"are the autopilot ap values.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"primaryPlanIndex")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"undefined")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The index of the flightplan to follow vertical guidance from.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"hasNonPathVnav")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"false")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether this VNav Director provides non-path climb and descent restriction adherence (false by default).")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"guidanceEndsAtFaf")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"true")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether this VNav Director terminates vertical guidance at the FAF (true by default).")))),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminVNavManager"},(0,i.kt)("inlineCode",{parentName:"a"},"GarminVNavManager"))),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:103"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"activatemode"},"activateMode"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"activateMode"),": (",(0,i.kt)("inlineCode",{parentName:"p"},"mode"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"APVerticalModes"),") => ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback called by the autopilot to activate the supplied vertical mode."),(0,i.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (",(0,i.kt)("inlineCode",{parentName:"p"},"mode"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback called by the autopilot to activate the supplied vertical mode."),(0,i.kt)("h5",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"mode")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"APVerticalModes"))))),(0,i.kt)("h5",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,i.kt)("p",null,"VNavManager.activateMode"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:61"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"armmode"},"armMode"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"armMode"),": (",(0,i.kt)("inlineCode",{parentName:"p"},"mode"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"APVerticalModes"),") => ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback called by the autopilot to arm the supplied vertical mode."),(0,i.kt)("h4",{id:"type-declaration-1"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (",(0,i.kt)("inlineCode",{parentName:"p"},"mode"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback called by the autopilot to arm the supplied vertical mode."),(0,i.kt)("h5",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"mode")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"APVerticalModes"))))),(0,i.kt)("h5",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,i.kt)("p",null,"VNavManager.armMode"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:58"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"calculator"},"calculator"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"calculator"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"BottomTargetPathCalculator")),(0,i.kt)("p",null,"The VNAV path calculator to use with this instance."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:103"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"capturedaltitude"},"capturedAltitude"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"capturedAltitude"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,i.kt)("inlineCode",{parentName:"p"},"0")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:63"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"glidepathcalculator"},"glidepathCalculator"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"glidepathCalculator"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"GlidePathCalculator")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:78"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lpvdeviation"},"lpvDeviation"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"lpvDeviation"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:77"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onactivate"},"onActivate"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"onActivate"),": () => ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"type-declaration-2"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h5",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,i.kt)("p",null,"VNavManager.onActivate"),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:53"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ondeactivate"},"onDeactivate"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"onDeactivate"),": () => ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"type-declaration-3"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h5",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"implementation-of-3"},"Implementation of"),(0,i.kt)("p",null,"VNavManager.onDeactivate"),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:55"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ondisable"},"onDisable"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"onDisable"),": () => ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback called when the manager is disabled."),(0,i.kt)("h4",{id:"type-declaration-4"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback called when the manager is disabled."),(0,i.kt)("h5",{id:"returns-5"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:51"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onenable"},"onEnable"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"onEnable"),": () => ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback called when the manager is enabled."),(0,i.kt)("h4",{id:"type-declaration-5"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback called when the manager is enabled."),(0,i.kt)("h5",{id:"returns-6"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:48"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"state"},"state"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"state"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"VNavState")," = ",(0,i.kt)("inlineCode",{parentName:"p"},"VNavState.Disabled")),(0,i.kt)("h4",{id:"implementation-of-4"},"Implementation of"),(0,i.kt)("p",null,"VNavManager.state"),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:19"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"canverticalmodeactivate"},"canVerticalModeActivate"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"canVerticalModeActivate"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("h4",{id:"returns-7"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"implementation-of-5"},"Implementation of"),(0,i.kt)("p",null,"VNavManager.canVerticalModeActivate"),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:237"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onpathdirectordeactivated"},"onPathDirectorDeactivated"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onPathDirectorDeactivated"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"returns-8"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"implementation-of-6"},"Implementation of"),(0,i.kt)("p",null,"VNavManager.onPathDirectorDeactivated"),(0,i.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:243"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"setstate"},"setState"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"setState"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"vnavState"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"parameters-3"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"vnavState")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"VNavState"))))),(0,i.kt)("h4",{id:"returns-9"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"implementation-of-7"},"Implementation of"),(0,i.kt)("p",null,"VNavManager.setState"),(0,i.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:184"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"tryactivate"},"tryActivate"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"tryActivate"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"returns-10"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"implementation-of-8"},"Implementation of"),(0,i.kt)("p",null,"VNavManager.tryActivate"),(0,i.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:208"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"trydeactivate"},"tryDeactivate"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"tryDeactivate"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"newMode?"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"parameters-4"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"newMode?")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"APVerticalModes"))))),(0,i.kt)("h4",{id:"returns-11"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"implementation-of-9"},"Implementation of"),(0,i.kt)("p",null,"VNavManager.tryDeactivate"),(0,i.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:219"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"update"},"update"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"update"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Updates the VNAV director."),(0,i.kt)("h4",{id:"returns-12"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"implementation-of-10"},"Implementation of"),(0,i.kt)("p",null,"VNavManager.update"),(0,i.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,i.kt)("p",null,"src/garminsdk/autopilot/GarminVNavManager.ts:322"))}u.isMDXComponent=!0}}]);