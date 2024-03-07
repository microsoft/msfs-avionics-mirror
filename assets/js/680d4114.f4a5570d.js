"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[93962],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>f});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var c=a.createContext({}),l=function(e){var t=a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},m=function(e){var t=l(e.components);return a.createElement(c.Provider,{value:t},e.children)},p="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,c=e.parentName,m=s(e,["components","mdxType","originalType","parentName"]),p=l(n),u=r,f=p["".concat(c,".").concat(u)]||p[u]||d[u]||i;return n?a.createElement(f,o(o({ref:t},m),{},{components:n})):a.createElement(f,o({ref:t},m))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,o=new Array(i);o[0]=u;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s[p]="string"==typeof e?e:r,o[1]=s;for(var l=2;l<i;l++)o[l]=n[l];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},20230:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>o,default:()=>d,frontMatter:()=>i,metadata:()=>s,toc:()=>l});var a=n(87462),r=(n(67294),n(3905));const i={id:"UiInteractionHandler",title:"Interface: UiInteractionHandler",sidebar_label:"UiInteractionHandler",sidebar_position:0,custom_edit_url:null},o=void 0,s={unversionedId:"g3xtouchcommon/interfaces/UiInteractionHandler",id:"g3xtouchcommon/interfaces/UiInteractionHandler",title:"Interface: UiInteractionHandler",description:"A handler which can respond to and optionally handle instances of UiInteractionEvent.",source:"@site/docs/g3xtouchcommon/interfaces/UiInteractionHandler.md",sourceDirName:"g3xtouchcommon/interfaces",slug:"/g3xtouchcommon/interfaces/UiInteractionHandler",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/UiInteractionHandler",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"UiInteractionHandler",title:"Interface: UiInteractionHandler",sidebar_label:"UiInteractionHandler",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"UiImgTouchButtonProps",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/UiImgTouchButtonProps"},next:{title:"UiListButtonProps",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/UiListButtonProps"}},c={},l=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Implemented by",id:"implemented-by",level:2},{value:"Methods",id:"methods",level:2},{value:"onUiInteractionEvent",id:"onuiinteractionevent",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4}],m={toc:l},p="wrapper";function d(e){let{components:t,...n}=e;return(0,r.kt)(p,(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A handler which can respond to and optionally handle instances of ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/enums/UiInteractionEvent"},"UiInteractionEvent"),"."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"UiInteractionHandler"))),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/MfdPage"},(0,r.kt)("inlineCode",{parentName:"a"},"MfdPage"))),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/TabbedContent"},(0,r.kt)("inlineCode",{parentName:"a"},"TabbedContent"))),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/UiFocusableComponent"},(0,r.kt)("inlineCode",{parentName:"a"},"UiFocusableComponent"))),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/UiView"},(0,r.kt)("inlineCode",{parentName:"a"},"UiView"))))),(0,r.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/FrequencyInput"},(0,r.kt)("inlineCode",{parentName:"a"},"FrequencyInput"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/MfdPageContainer"},(0,r.kt)("inlineCode",{parentName:"a"},"MfdPageContainer"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/MfdPageNavBar"},(0,r.kt)("inlineCode",{parentName:"a"},"MfdPageNavBar"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/TabbedContainer"},(0,r.kt)("inlineCode",{parentName:"a"},"TabbedContainer"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiFlightPlanList"},(0,r.kt)("inlineCode",{parentName:"a"},"UiFlightPlanList"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiFocusController"},(0,r.kt)("inlineCode",{parentName:"a"},"UiFocusController"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiList"},(0,r.kt)("inlineCode",{parentName:"a"},"UiList"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiListItem"},(0,r.kt)("inlineCode",{parentName:"a"},"UiListItem"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiNearestWaypointList"},(0,r.kt)("inlineCode",{parentName:"a"},"UiNearestWaypointList"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiViewStack"},(0,r.kt)("inlineCode",{parentName:"a"},"UiViewStack"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/WaypointInfo"},(0,r.kt)("inlineCode",{parentName:"a"},"WaypointInfo"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/WaypointInfoInfo"},(0,r.kt)("inlineCode",{parentName:"a"},"WaypointInfoInfo")))),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"onuiinteractionevent"},"onUiInteractionEvent"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onUiInteractionEvent"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"event"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Handles a ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/enums/UiInteractionEvent"},"UiInteractionEvent"),"."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"event")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/enums/UiInteractionEvent"},(0,r.kt)("inlineCode",{parentName:"a"},"UiInteractionEvent"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event to handle.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether the event was handled."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/UiSystem/UiInteraction.ts:90"))}d.isMDXComponent=!0}}]);