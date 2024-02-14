"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[93962],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>f});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),s=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},m=function(e){var t=s(e.components);return r.createElement(l.Provider,{value:t},e.children)},p="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,m=c(e,["components","mdxType","originalType","parentName"]),p=s(n),u=a,f=p["".concat(l,".").concat(u)]||p[u]||d[u]||i;return n?r.createElement(f,o(o({ref:t},m),{},{components:n})):r.createElement(f,o({ref:t},m))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=u;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c[p]="string"==typeof e?e:a,o[1]=c;for(var s=2;s<i;s++)o[s]=n[s];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},20230:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>d,frontMatter:()=>i,metadata:()=>c,toc:()=>s});var r=n(87462),a=(n(67294),n(3905));const i={id:"UiInteractionHandler",title:"Interface: UiInteractionHandler",sidebar_label:"UiInteractionHandler",sidebar_position:0,custom_edit_url:null},o=void 0,c={unversionedId:"g3xtouchcommon/interfaces/UiInteractionHandler",id:"g3xtouchcommon/interfaces/UiInteractionHandler",title:"Interface: UiInteractionHandler",description:"A handler which can respond to and optionally handle instances of UiInteractionEvent.",source:"@site/docs/g3xtouchcommon/interfaces/UiInteractionHandler.md",sourceDirName:"g3xtouchcommon/interfaces",slug:"/g3xtouchcommon/interfaces/UiInteractionHandler",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/UiInteractionHandler",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"UiInteractionHandler",title:"Interface: UiInteractionHandler",sidebar_label:"UiInteractionHandler",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"UiImgTouchButtonProps",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/UiImgTouchButtonProps"},next:{title:"UiListItemProps",permalink:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/UiListItemProps"}},l={},s=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Implemented by",id:"implemented-by",level:2},{value:"Methods",id:"methods",level:2},{value:"onUiInteractionEvent",id:"onuiinteractionevent",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4}],m={toc:s},p="wrapper";function d(e){let{components:t,...n}=e;return(0,a.kt)(p,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A handler which can respond to and optionally handle instances of ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/enums/UiInteractionEvent"},"UiInteractionEvent"),"."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"UiInteractionHandler"))),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/MfdPage"},(0,a.kt)("inlineCode",{parentName:"a"},"MfdPage"))),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/TabbedContent"},(0,a.kt)("inlineCode",{parentName:"a"},"TabbedContent"))),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/UiFocusableComponent"},(0,a.kt)("inlineCode",{parentName:"a"},"UiFocusableComponent"))),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/UiView"},(0,a.kt)("inlineCode",{parentName:"a"},"UiView"))))),(0,a.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/FrequencyInput"},(0,a.kt)("inlineCode",{parentName:"a"},"FrequencyInput"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/MfdPageContainer"},(0,a.kt)("inlineCode",{parentName:"a"},"MfdPageContainer"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/MfdPageNavBar"},(0,a.kt)("inlineCode",{parentName:"a"},"MfdPageNavBar"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/TabbedContainer"},(0,a.kt)("inlineCode",{parentName:"a"},"TabbedContainer"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiFlightPlanList"},(0,a.kt)("inlineCode",{parentName:"a"},"UiFlightPlanList"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiFocusController"},(0,a.kt)("inlineCode",{parentName:"a"},"UiFocusController"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiList"},(0,a.kt)("inlineCode",{parentName:"a"},"UiList"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiListItem"},(0,a.kt)("inlineCode",{parentName:"a"},"UiListItem"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/UiViewStack"},(0,a.kt)("inlineCode",{parentName:"a"},"UiViewStack"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/classes/WaypointInfo"},(0,a.kt)("inlineCode",{parentName:"a"},"WaypointInfo")))),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"onuiinteractionevent"},"onUiInteractionEvent"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"onUiInteractionEvent"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"event"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Handles a ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/enums/UiInteractionEvent"},"UiInteractionEvent"),"."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"event")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/g3xtouchcommon/enums/UiInteractionEvent"},(0,a.kt)("inlineCode",{parentName:"a"},"UiInteractionEvent"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The event to handle.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Whether the event was handled."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/Shared/UiSystem/UiInteraction.ts:90"))}d.isMDXComponent=!0}}]);