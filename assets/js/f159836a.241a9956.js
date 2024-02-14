"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[24240],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>k});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var d=a.createContext({}),p=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},m=function(e){var t=p(e.components);return a.createElement(d.Provider,{value:t},e.children)},s="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,d=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),s=p(n),c=r,k=s["".concat(d,".").concat(c)]||s[c]||u[c]||i;return n?a.createElement(k,l(l({ref:t},m),{},{components:n})):a.createElement(k,l({ref:t},m))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=c;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[s]="string"==typeof e?e:r,l[1]=o;for(var p=2;p<i;p++)l[p]=n[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},36054:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>o,toc:()=>p});var a=n(87462),r=(n(67294),n(3905));const i={id:"GarminVNavComputer",title:"Class: GarminVNavComputer",sidebar_label:"GarminVNavComputer",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"garminsdk/classes/GarminVNavComputer",id:"garminsdk/classes/GarminVNavComputer",title:"Class: GarminVNavComputer",description:"A computer that calculates Garmin vertical navigation guidance for an active flight plan.",source:"@site/docs/garminsdk/classes/GarminVNavComputer.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/GarminVNavComputer",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminVNavComputer",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GarminVNavComputer",title:"Class: GarminVNavComputer",sidebar_label:"GarminVNavComputer",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GarminTimerManager",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminTimerManager"},next:{title:"GarminVNavManager",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminVNavManager"}},d={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"guidance",id:"guidance",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"index",id:"index",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"pathGuidance",id:"pathguidance",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"Methods",id:"methods",level:2},{value:"tryActivate",id:"tryactivate",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"tryDeactivate",id:"trydeactivate",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"update",id:"update",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-6",level:4}],m={toc:p},s="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(s,(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A computer that calculates Garmin vertical navigation guidance for an active flight plan."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new GarminVNavComputer"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"index"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"flightPlanner"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"calculator"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"apValues"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"options?"),"): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminVNavComputer"},(0,r.kt)("inlineCode",{parentName:"a"},"GarminVNavComputer"))),(0,r.kt)("p",null,"Creates a new instance of GarminVNavComputer."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"index")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The index of this computer.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event bus.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"flightPlanner")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"FlightPlanner"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"any"),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The flight planner containing the flight plan for which this computer provides guidance.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"calculator")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"VNavPathCalculator")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The VNAV path calculator providing the vertical flight path for which this computer provides guidance.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"apValues")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/modules#garminvnavcomputerapvalues"},(0,r.kt)("inlineCode",{parentName:"a"},"GarminVNavComputerAPValues")),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"Autopilot values for the autopilot associated with this computer.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"options?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Partial"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/interfaces/GarminVNavComputerOptions"},(0,r.kt)("inlineCode",{parentName:"a"},"GarminVNavComputerOptions")),">",">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"Options with which to configure the computer.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/GarminVNavComputer"},(0,r.kt)("inlineCode",{parentName:"a"},"GarminVNavComputer"))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavComputer.ts:276"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"guidance"},"guidance"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"guidance"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#garminvnavguidance"},(0,r.kt)("inlineCode",{parentName:"a"},"GarminVNavGuidance")),">",">"),(0,r.kt)("p",null,"The VNAV guidance calculated by this computer."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavComputer.ts:241"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"index"},"index"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"index"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of this computer."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavComputer.ts:277"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"pathguidance"},"pathGuidance"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"pathGuidance"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#garminvnavpathguidance"},(0,r.kt)("inlineCode",{parentName:"a"},"GarminVNavPathGuidance")),">",">"),(0,r.kt)("p",null,"The vertical path guidance calculated by this computer."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavComputer.ts:264"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"tryactivate"},"tryActivate"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"tryActivate"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Attempts to activate VNAV."),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavComputer.ts:422"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"trydeactivate"},"tryDeactivate"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"tryDeactivate"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Attempts to deactivate VNAV."),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavComputer.ts:435"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"update"},"update"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"update"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Updates this computer."),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/garminsdk/autopilot/vnav/GarminVNavComputer.ts:608"))}u.isMDXComponent=!0}}]);