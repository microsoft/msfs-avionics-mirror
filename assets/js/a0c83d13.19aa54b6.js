"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[31226],{3905:(e,n,t)=>{t.d(n,{Zo:()=>u,kt:()=>f});var r=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var s=r.createContext({}),d=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},u=function(e){var n=d(e.components);return r.createElement(s.Provider,{value:n},e.children)},p="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},c=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),p=d(t),c=i,f=p["".concat(s,".").concat(c)]||p[c]||m[c]||o;return t?r.createElement(f,a(a({ref:n},u),{},{components:t})):r.createElement(f,a({ref:n},u))}));function f(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,a=new Array(o);a[0]=c;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l[p]="string"==typeof e?e:i,a[1]=l;for(var d=2;d<o;d++)a[d]=t[d];return r.createElement.apply(null,a)}return r.createElement.apply(null,t)}c.displayName="MDXCreateElement"},22356:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>a,default:()=>m,frontMatter:()=>o,metadata:()=>l,toc:()=>d});var r=t(87462),i=(t(67294),t(3905));const o={id:"NPConfig",title:"Class: NPConfig",sidebar_label:"NPConfig",sidebar_position:0,custom_edit_url:null},a=void 0,l={unversionedId:"g1000common/classes/NPConfig",id:"g1000common/classes/NPConfig",title:"Class: NPConfig",description:"A configuration for the G1000 NavProcessor, including a custrom simvar",source:"@site/docs/g1000common/classes/NPConfig.md",sourceDirName:"g1000common/classes",slug:"/g1000common/classes/NPConfig",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/NPConfig",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NPConfig",title:"Class: NPConfig",sidebar_label:"NPConfig",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MultipleSoftKeyUserSettingController",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/MultipleSoftKeyUserSettingController"},next:{title:"Nav1Needle",permalink:"/msfs-avionics-mirror/docs/g1000common/classes/Nav1Needle"}},s={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"additionalSources",id:"additionalsources",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"courseDecEvents",id:"coursedecevents",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"courseIncEvents",id:"courseincevents",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"courseSyncEvents",id:"coursesyncevents",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"numAdf",id:"numadf",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"numGps",id:"numgps",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"numNav",id:"numnav",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"simVarPublisher",id:"simvarpublisher",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-8",level:4}],u={toc:d},p="wrapper";function m(e){let{components:n,...t}=e;return(0,i.kt)(p,(0,r.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A configuration for the G1000 NavProcessor, including a custrom simvar\npublisher configured with your LNav simvars for GPS data publishing."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"p"},"NavProcessorConfig")),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"NPConfig"))))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new NPConfig"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"bus"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"planner"),"): ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/NPConfig"},(0,i.kt)("inlineCode",{parentName:"a"},"NPConfig"))),(0,i.kt)("p",null,"Create an NPConfig."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"bus")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The event bus")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"planner")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"FlightPlanner"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"any"),">"),(0,i.kt)("td",{parentName:"tr",align:"left"},"A flight planner for LNav data")))),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g1000common/classes/NPConfig"},(0,i.kt)("inlineCode",{parentName:"a"},"NPConfig"))),(0,i.kt)("h4",{id:"overrides"},"Overrides"),(0,i.kt)("p",null,"NavProcessorConfig.constructor"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Shared/NavProcessorConfig.ts:15"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"additionalsources"},"additionalSources"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"additionalSources"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"NavSource"),"[]"),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,"NavProcessorConfig.additionalSources"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"sdk/instruments/NavProcessor.ts:1031"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"coursedecevents"},"courseDecEvents"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"courseDecEvents"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Set"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,"NavProcessorConfig.courseDecEvents"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"sdk/instruments/NavProcessor.ts:1028"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"courseincevents"},"courseIncEvents"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"courseIncEvents"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Set"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,"NavProcessorConfig.courseIncEvents"),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"sdk/instruments/NavProcessor.ts:1027"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"coursesyncevents"},"courseSyncEvents"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"courseSyncEvents"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Set"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,"NavProcessorConfig.courseSyncEvents"),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"sdk/instruments/NavProcessor.ts:1029"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"numadf"},"numAdf"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"numAdf"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,i.kt)("inlineCode",{parentName:"p"},"1")),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,"NavProcessorConfig.numAdf"),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"sdk/instruments/NavProcessor.ts:1026"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"numgps"},"numGps"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"numGps"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,i.kt)("inlineCode",{parentName:"p"},"1")),(0,i.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,i.kt)("p",null,"NavProcessorConfig.numGps"),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"sdk/instruments/NavProcessor.ts:1025"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"numnav"},"numNav"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"numNav"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")," = ",(0,i.kt)("inlineCode",{parentName:"p"},"2")),(0,i.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,i.kt)("p",null,"NavProcessorConfig.numNav"),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"sdk/instruments/NavProcessor.ts:1024"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"simvarpublisher"},"simVarPublisher"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"simVarPublisher"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"BasePublisher"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"NavProcSimVars"),">"),(0,i.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,i.kt)("p",null,"NavProcessorConfig.simVarPublisher"),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"sdk/instruments/NavProcessor.ts:1030"))}m.isMDXComponent=!0}}]);