"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[43914],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>u});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=a.createContext({}),s=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=s(e.components);return a.createElement(d.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},k=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,d=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=s(n),k=i,u=m["".concat(d,".").concat(k)]||m[k]||c[k]||r;return n?a.createElement(u,l(l({ref:t},p),{},{components:n})):a.createElement(u,l({ref:t},p))}));function u(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,l=new Array(r);l[0]=k;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:i,l[1]=o;for(var s=2;s<r;s++)l[s]=n[s];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}k.displayName="MDXCreateElement"},17180:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>c,frontMatter:()=>r,metadata:()=>o,toc:()=>s});var a=n(87462),i=(n(67294),n(3905));const r={id:"GtcKnobStatesManager",title:"Class: GtcKnobStatesManager",sidebar_label:"GtcKnobStatesManager",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"g3000gtc/classes/GtcKnobStatesManager",id:"g3000gtc/classes/GtcKnobStatesManager",title:"Class: GtcKnobStatesManager",description:"A default implementation of GtcKnobStates which automatically manages knob control states.",source:"@site/docs/g3000gtc/classes/GtcKnobStatesManager.md",sourceDirName:"g3000gtc/classes",slug:"/g3000gtc/classes/GtcKnobStatesManager",permalink:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcKnobStatesManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GtcKnobStatesManager",title:"Class: GtcKnobStatesManager",sidebar_label:"GtcKnobStatesManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GtcKnobStates",permalink:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcKnobStates"},next:{title:"GtcLandingDataPage",permalink:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcLandingDataPage"}},d={},s=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"centerKnobState",id:"centerknobstate",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"controlledPfdMapDisplayPaneIndex",id:"controlledpfdmapdisplaypaneindex",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"dualKnobState",id:"dualknobstate",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"gtcService",id:"gtcservice",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"isPfdMapPointerActive",id:"ispfdmappointeractive",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"mapKnobState",id:"mapknobstate",level:3},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"pfdDisplayPaneSettingManager",id:"pfddisplaypanesettingmanager",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"pfdMapLayoutSetting",id:"pfdmaplayoutsetting",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"pluginCenterStateOverride",id:"plugincenterstateoverride",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"pluginDualKnobStateOverride",id:"plugindualknobstateoverride",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"pluginMapStateOverride",id:"pluginmapstateoverride",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"Methods",id:"methods",level:2},{value:"attachPluginOverrides",id:"attachpluginoverrides",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"getPfdMapKnobState",id:"getpfdmapknobstate",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"selectPluginOverrideState",id:"selectpluginoverridestate",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-14",level:4}],p={toc:s},m="wrapper";function c(e){let{components:t,...n}=e;return(0,i.kt)(m,(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A default implementation of ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcKnobStates"},"GtcKnobStates")," which automatically manages knob control states."),(0,i.kt)("h2",{id:"implements"},"Implements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcKnobStates"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcKnobStates")))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new GtcKnobStatesManager"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"gtcService"),")"),(0,i.kt)("p",null,"Creates a new instance of GtcKnobStatesManager."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"gtcService")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcService"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcService"))),(0,i.kt)("td",{parentName:"tr",align:"left"},"The GTC service instance associated with this manager's GTC.")))),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:214"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"centerknobstate"},"centerKnobState"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"centerKnobState"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("p",null,"The current state of the center knob (only found on vertically oriented GTCs)."),(0,i.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcKnobStates"},"GtcKnobStates"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcKnobStates#centerknobstate"},"centerKnobState")),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:170"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"controlledpfdmapdisplaypaneindex"},"controlledPfdMapDisplayPaneIndex"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"controlledPfdMapDisplayPaneIndex"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"MappedSubject"),"<[",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtccontrolmode"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcControlMode")),", ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"PfdMapLayoutSettingMode"),"], ",(0,i.kt)("inlineCode",{parentName:"p"},"DisplayPaneIndex")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"-1"),">"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:106"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"dualknobstate"},"dualKnobState"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"dualKnobState"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("p",null,"The current state of the dual concentric knob (located at the top of horizontally oriented GTCs or at the right\nside of vertically oriented GTCs)."),(0,i.kt)("h4",{id:"implementation-of-1"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcKnobStates"},"GtcKnobStates"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcKnobStates#dualknobstate"},"dualKnobState")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:130"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"gtcservice"},"gtcService"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"gtcService"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcService"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcService"))),(0,i.kt)("p",null,"The GTC service instance associated with this manager's GTC."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:214"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ispfdmappointeractive"},"isPfdMapPointerActive"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"isPfdMapPointerActive"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"boolean"),">"),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:123"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"mapknobstate"},"mapKnobState"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"mapKnobState"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("p",null,"The current state of the map knob (located at the bottom of horizontally oriented GTCs or at the left side of\nvertically oriented GTCs)."),(0,i.kt)("h4",{id:"implementation-of-2"},"Implementation of"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcKnobStates"},"GtcKnobStates"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/GtcKnobStates#mapknobstate"},"mapKnobState")),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:183"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"pfddisplaypanesettingmanager"},"pfdDisplayPaneSettingManager"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"pfdDisplayPaneSettingManager"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"DisplayPanesAliasedUserSettingManager")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:104"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"pfdmaplayoutsetting"},"pfdMapLayoutSetting"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"pfdMapLayoutSetting"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"UserSetting"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"PfdMapLayoutSettingMode"),">"),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:102"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"plugincenterstateoverride"},"pluginCenterStateOverride"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"pluginCenterStateOverride"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:126"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"plugindualknobstateoverride"},"pluginDualKnobStateOverride"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"pluginDualKnobStateOverride"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:125"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"pluginmapstateoverride"},"pluginMapStateOverride"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"pluginMapStateOverride"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Subject"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:127"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"attachpluginoverrides"},"attachPluginOverrides"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"attachPluginOverrides"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"overrides"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Attaches plugin-defined knob control state overrides."),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"overrides")),(0,i.kt)("td",{parentName:"tr",align:"left"},"readonly ",(0,i.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtcknobstatepluginoverrides"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcKnobStatePluginOverrides")),">","[]"),(0,i.kt)("td",{parentName:"tr",align:"left"},"An array of plugin-defined knob control state overrides. The array should be ordered such that the overrides appear in the order in which their parent plugins were loaded.")))),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:233"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"getpfdmapknobstate"},"getPfdMapKnobState"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("strong",{parentName:"p"},"getPfdMapKnobState"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"pfdPaneVisible"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"pfdPaneView"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"pfdMapLayout"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"isPfdMapPointerActive"),"): ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/enums/GtcMapKnobState"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcMapKnobState"))),(0,i.kt)("p",null,"Gets the desired PFD control mode map knob control state based on a given context."),(0,i.kt)("h4",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"pfdPaneVisible")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether the PFD display pane is visible.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"pfdPaneView")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"string")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The key of the currently displayed PFD display pane view.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"pfdMapLayout")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"PfdMapLayoutSettingMode")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The current PFD map layout mode.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"isPfdMapPointerActive")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"boolean")),(0,i.kt)("td",{parentName:"tr",align:"left"},"Whether the PFD map pointer is active.")))),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/enums/GtcMapKnobState"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcMapKnobState"))),(0,i.kt)("p",null,"The desired PFD control mode map knob control state based on the specified context."),(0,i.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:278"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"selectpluginoverridestate"},"selectPluginOverrideState"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("strong",{parentName:"p"},"selectPluginOverrideState"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"overrides"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"Selects a single plugin-defined knob control state override to apply from an array of overrides. The last\nnon-",(0,i.kt)("inlineCode",{parentName:"p"},"null")," override in the array will be selected. If all overrides in the array are ",(0,i.kt)("inlineCode",{parentName:"p"},"null"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," will be\nselected."),(0,i.kt)("h4",{id:"parameters-3"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"overrides")),(0,i.kt)("td",{parentName:"tr",align:"left"},"readonly (",(0,i.kt)("inlineCode",{parentName:"td"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"td"},"string"),")[]"),(0,i.kt)("td",{parentName:"tr",align:"left"},"An array of plugin-defined knob control state overrides.")))),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The plugin-defined knob control state override to apply from the specified array of overrides."),(0,i.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GtcService/GtcKnobStates.ts:304"))}c.isMDXComponent=!0}}]);