"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[24525],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>u});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=a.createContext({}),o=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=o(e.components);return a.createElement(p.Provider,{value:t},e.children)},k="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),k=o(n),c=r,u=k["".concat(p,".").concat(c)]||k[c]||m[c]||i;return n?a.createElement(u,l(l({ref:t},s),{},{components:n})):a.createElement(u,l({ref:t},s))}));function u(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=c;var d={};for(var p in t)hasOwnProperty.call(t,p)&&(d[p]=t[p]);d.originalType=e,d[k]="string"==typeof e?e:r,l[1]=d;for(var o=2;o<i;o++)l[o]=n[o];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},92762:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>m,frontMatter:()=>i,metadata:()=>d,toc:()=>o});var a=n(87462),r=(n(67294),n(3905));const i={id:"GtcKnobHandler",title:"Class: GtcKnobHandler",sidebar_label:"GtcKnobHandler",sidebar_position:0,custom_edit_url:null},l=void 0,d={unversionedId:"g3000gtc/classes/GtcKnobHandler",id:"g3000gtc/classes/GtcKnobHandler",title:"Class: GtcKnobHandler",description:"Handles default behavior for the physical GTC knobs and buttons.",source:"@site/docs/g3000gtc/classes/GtcKnobHandler.md",sourceDirName:"g3000gtc/classes",slug:"/g3000gtc/classes/GtcKnobHandler",permalink:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcKnobHandler",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GtcKnobHandler",title:"Class: GtcKnobHandler",sidebar_label:"GtcKnobHandler",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GtcKeyboardDialog",permalink:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcKeyboardDialog"},next:{title:"GtcKnobStates",permalink:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcKnobStates"}},p={},o=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"cdiSource",id:"cdisource",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"controlledMapDisplayPaneIndex",id:"controlledmapdisplaypaneindex",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"gtcService",id:"gtcservice",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"mapPointerJoystickHandler",id:"mappointerjoystickhandler",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"pfdMapLayoutSetting",id:"pfdmaplayoutsetting",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"publisher",id:"publisher",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"vec2Cache",id:"vec2cache",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"Methods",id:"methods",level:2},{value:"changeCourse",id:"changecourse",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"changeSelectedDisplayPane",id:"changeselecteddisplaypane",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"handleCenterKnobRotate",id:"handlecenterknobrotate",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"handleDefaultInteractionBehavior",id:"handledefaultinteractionbehavior",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"handleInnerKnobPush",id:"handleinnerknobpush",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"handleInnerKnobRotate",id:"handleinnerknobrotate",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"handleJoystickPan",id:"handlejoystickpan",level:3},{value:"Parameters",id:"parameters-7",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"handleMapKnobPush",id:"handlemapknobpush",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"handleMapKnobRotate",id:"handlemapknobrotate",level:3},{value:"Parameters",id:"parameters-8",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"handleOuterKnobRotate",id:"handleouterknobrotate",level:3},{value:"Parameters",id:"parameters-9",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"sendMapPointerActiveSetEvent",id:"sendmappointeractivesetevent",level:3},{value:"Parameters",id:"parameters-10",level:4},{value:"Returns",id:"returns-10",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"sendMapPointerMoveEvent",id:"sendmappointermoveevent",level:3},{value:"Parameters",id:"parameters-11",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"sendMapRangeEvent",id:"sendmaprangeevent",level:3},{value:"Parameters",id:"parameters-12",level:4},{value:"Returns",id:"returns-12",level:4},{value:"Defined in",id:"defined-in-21",level:4}],s={toc:o},k="wrapper";function m(e){let{components:t,...n}=e;return(0,r.kt)(k,(0,a.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Handles default behavior for the physical GTC knobs and buttons."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new GtcKnobHandler"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"gtcService"),")"),(0,r.kt)("p",null,"The GtcKnobHandler constructor."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"gtcService")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcService"},(0,r.kt)("inlineCode",{parentName:"a"},"GtcService"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The GTC service instance for the GTC with which this handler is associated.")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:53"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"bus"},"bus"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"bus"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:19"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"cdisource"},"cdiSource"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"cdiSource"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"NavSourceId")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:23"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"controlledmapdisplaypaneindex"},"controlledMapDisplayPaneIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"controlledMapDisplayPaneIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"MappedSubject"),"<[",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtccontrolmode"},(0,r.kt)("inlineCode",{parentName:"a"},"GtcControlMode")),", ",(0,r.kt)("inlineCode",{parentName:"p"},"ControllableDisplayPaneIndex")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"-1"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"PfdMapLayoutSettingMode"),"], ",(0,r.kt)("inlineCode",{parentName:"p"},"DisplayPaneIndex")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"-1"),">"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:27"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"gtcservice"},"gtcService"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"gtcService"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcService"},(0,r.kt)("inlineCode",{parentName:"a"},"GtcService"))),(0,r.kt)("p",null,"The GTC service instance for the GTC with which this handler is associated."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:53"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"mappointerjoystickhandler"},"mapPointerJoystickHandler"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"mapPointerJoystickHandler"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"MapPointerJoystickHandler")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:47"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"pfdmaplayoutsetting"},"pfdMapLayoutSetting"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"pfdMapLayoutSetting"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"PfdMapLayoutSettingMode"),">"),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:25"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"publisher"},"publisher"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"publisher"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Publisher"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"DisplayPaneControlEvents"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"DisplayPaneViewEventTypes"),">",">"),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:21"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"vec2cache"},"vec2Cache"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"vec2Cache"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Float64Array"),"[]"),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:17"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"changecourse"},"changeCourse"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"changeCourse"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"incOrDec"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Change the course knob course."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"incOrDec")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"GtcKnobDirection")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Increase or decrease event.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:222"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"changeselecteddisplaypane"},"changeSelectedDisplayPane"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"changeSelectedDisplayPane"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"incOrDec"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Sends event to scroll display pane selection left or right."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"incOrDec")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"GtcKnobDirection")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Increase goes right, decrease left.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:212"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"handlecenterknobrotate"},"handleCenterKnobRotate"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"handleCenterKnobRotate"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"incOrDec"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Handles center knob rotate events."),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"incOrDec")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"GtcKnobDirection")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Increase or decrease event.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:196"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"handledefaultinteractionbehavior"},"handleDefaultInteractionBehavior"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"handleDefaultInteractionBehavior"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"event"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Handles GtcInteractionEvents in the case that a GtcView has not overridden the knob behavior."),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"event")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtcinteractionevent-1"},(0,r.kt)("inlineCode",{parentName:"a"},"GtcInteractionEvent"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event.")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:64"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"handleinnerknobpush"},"handleInnerKnobPush"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"handleInnerKnobPush"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"event"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"isLong"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Handles inner knob push events."),(0,r.kt)("h4",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"event")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtcinteractionevent-1"},(0,r.kt)("inlineCode",{parentName:"a"},"GtcInteractionEvent"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The GtcInteractionEvent.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"isLong")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether the event is a long push.")))),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:156"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"handleinnerknobrotate"},"handleInnerKnobRotate"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"handleInnerKnobRotate"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"event"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"incOrDec"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Handles inner knob rotate events."),(0,r.kt)("h4",{id:"parameters-6"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"event")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtcinteractionevent-1"},(0,r.kt)("inlineCode",{parentName:"a"},"GtcInteractionEvent"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The GtcInteractionEvent.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"incOrDec")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"GtcKnobDirection")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Increase or decrease event.")))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:131"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"handlejoystickpan"},"handleJoystickPan"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"handleJoystickPan"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"direction"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Handles joystick pan events."),(0,r.kt)("h4",{id:"parameters-7"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"direction")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},'"left"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"right"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"down"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"up"')),(0,r.kt)("td",{parentName:"tr",align:"left"},"The direction of the pan.")))),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:282"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"handlemapknobpush"},"handleMapKnobPush"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"handleMapKnobPush"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Handles map knob push events."),(0,r.kt)("h4",{id:"returns-7"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:250"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"handlemapknobrotate"},"handleMapKnobRotate"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"handleMapKnobRotate"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"incOrDec"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Handles map knob rotate events."),(0,r.kt)("h4",{id:"parameters-8"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"incOrDec")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"GtcKnobDirection")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Increase or decrease event.")))),(0,r.kt)("h4",{id:"returns-8"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:230"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"handleouterknobrotate"},"handleOuterKnobRotate"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"handleOuterKnobRotate"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"event"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"incOrDec"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Handles outer knob rotate events."),(0,r.kt)("h4",{id:"parameters-9"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"event")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtcinteractionevent-1"},(0,r.kt)("inlineCode",{parentName:"a"},"GtcInteractionEvent"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The GtcInteractionEvent.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"incOrDec")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"GtcKnobDirection")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Increase or decrease event.")))),(0,r.kt)("h4",{id:"returns-9"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:173"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"sendmappointeractivesetevent"},"sendMapPointerActiveSetEvent"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"sendMapPointerActiveSetEvent"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"activate"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Sends a map pointer set active state event to the currently controlled display pane."),(0,r.kt)("h4",{id:"parameters-10"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"activate")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether to activate the pointer.")))),(0,r.kt)("h4",{id:"returns-10"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:339"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"sendmappointermoveevent"},"sendMapPointerMoveEvent"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"sendMapPointerMoveEvent"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"direction"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Sends a map pointer move event to the currently controlled display pane."),(0,r.kt)("h4",{id:"parameters-11"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"direction")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"MapPointerJoystickDirection")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The direction in which to move the pointer.")))),(0,r.kt)("h4",{id:"returns-11"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:358"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"sendmaprangeevent"},"sendMapRangeEvent"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"sendMapRangeEvent"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"incOrDec"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Sends a map range event to the currently controlled display pane."),(0,r.kt)("h4",{id:"parameters-12"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"incOrDec")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"GtcKnobDirection")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Increase or decrease event.")))),(0,r.kt)("h4",{id:"returns-12"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobHandler.ts:321"))}m.isMDXComponent=!0}}]);