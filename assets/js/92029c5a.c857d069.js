"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[20658],{3905:(e,n,t)=>{t.d(n,{Zo:()=>m,kt:()=>v});var a=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function p(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,a,i=function(e,n){if(null==e)return{};var t,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var o=a.createContext({}),l=function(e){var n=a.useContext(o),t=n;return e&&(t="function"==typeof e?e(n):p(p({},n),e)),t},m=function(e){var n=l(e.components);return a.createElement(o.Provider,{value:n},e.children)},d="mdxType",c={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},_=a.forwardRef((function(e,n){var t=e.components,i=e.mdxType,r=e.originalType,o=e.parentName,m=s(e,["components","mdxType","originalType","parentName"]),d=l(t),_=i,v=d["".concat(o,".").concat(_)]||d[_]||c[_]||r;return t?a.createElement(v,p(p({ref:n},m),{},{components:t})):a.createElement(v,p({ref:n},m))}));function v(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var r=t.length,p=new Array(r);p[0]=_;var s={};for(var o in n)hasOwnProperty.call(n,o)&&(s[o]=n[o]);s.originalType=e,s[d]="string"==typeof e?e:i,p[1]=s;for(var l=2;l<r;l++)p[l]=t[l];return a.createElement.apply(null,p)}return a.createElement.apply(null,t)}_.displayName="MDXCreateElement"},99276:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>p,default:()=>c,frontMatter:()=>r,metadata:()=>s,toc:()=>l});var a=t(87462),i=(t(67294),t(3905));const r={id:"NearestPaneViewEventTypes",title:"Interface: NearestPaneViewEventTypes",sidebar_label:"NearestPaneViewEventTypes",sidebar_position:0,custom_edit_url:null},p=void 0,s={unversionedId:"g3000common/interfaces/NearestPaneViewEventTypes",id:"g3000common/interfaces/NearestPaneViewEventTypes",title:"Interface: NearestPaneViewEventTypes",description:"Events which can be sent to nearest display pane views.",source:"@site/docs/g3000common/interfaces/NearestPaneViewEventTypes.md",sourceDirName:"g3000common/interfaces",slug:"/g3000common/interfaces/NearestPaneViewEventTypes",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/NearestPaneViewEventTypes",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"NearestPaneViewEventTypes",title:"Interface: NearestPaneViewEventTypes",sidebar_label:"NearestPaneViewEventTypes",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"NavigationMapPaneViewProps",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/NavigationMapPaneViewProps"},next:{title:"NearestPaneViewProps",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/NearestPaneViewProps"}},o={},l=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"display_pane_map_pointer_active_set",id:"display_pane_map_pointer_active_set",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"display_pane_map_pointer_active_toggle",id:"display_pane_map_pointer_active_toggle",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"display_pane_map_pointer_move",id:"display_pane_map_pointer_move",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"display_pane_map_range_dec",id:"display_pane_map_range_dec",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"display_pane_map_range_inc",id:"display_pane_map_range_inc",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"display_pane_nearest_set",id:"display_pane_nearest_set",level:3},{value:"Defined in",id:"defined-in-5",level:4}],m={toc:l},d="wrapper";function c(e){let{components:n,...t}=e;return(0,i.kt)(d,(0,a.Z)({},m,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Events which can be sent to nearest display pane views."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes"},(0,i.kt)("inlineCode",{parentName:"a"},"DisplayPaneViewEventTypes"))),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"NearestPaneViewEventTypes"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"display_pane_map_pointer_active_set"},"display","_","pane","_","map","_","pointer","_","active","_","set"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"display","_","pane","_","map","_","pointer","_","active","_","set"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Activates/deactivates the map pointer."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes"},"DisplayPaneViewEventTypes"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes#display_pane_map_pointer_active_set"},"display_pane_map_pointer_active_set")),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneViewEvents.ts:14"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"display_pane_map_pointer_active_toggle"},"display","_","pane","_","map","_","pointer","_","active","_","toggle"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"display","_","pane","_","map","_","pointer","_","active","_","toggle"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Toggles the map pointer."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes"},"DisplayPaneViewEventTypes"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes#display_pane_map_pointer_active_toggle"},"display_pane_map_pointer_active_toggle")),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneViewEvents.ts:17"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"display_pane_map_pointer_move"},"display","_","pane","_","map","_","pointer","_","move"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"display","_","pane","_","map","_","pointer","_","move"),": ","[",(0,i.kt)("inlineCode",{parentName:"p"},"number"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"number"),"]"),(0,i.kt)("p",null,"Moves the map pointer by ",(0,i.kt)("inlineCode",{parentName:"p"},"[x, y]")," pixels."),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes"},"DisplayPaneViewEventTypes"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes#display_pane_map_pointer_move"},"display_pane_map_pointer_move")),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneViewEvents.ts:20"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"display_pane_map_range_dec"},"display","_","pane","_","map","_","range","_","dec"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"display","_","pane","_","map","_","range","_","dec"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Decrements the map range."),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes"},"DisplayPaneViewEventTypes"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes#display_pane_map_range_dec"},"display_pane_map_range_dec")),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneViewEvents.ts:11"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"display_pane_map_range_inc"},"display","_","pane","_","map","_","range","_","inc"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"display","_","pane","_","map","_","range","_","inc"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Increments the map range."),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes"},"DisplayPaneViewEventTypes"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes#display_pane_map_range_inc"},"display_pane_map_range_inc")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneViewEvents.ts:8"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"display_pane_nearest_set"},"display","_","pane","_","nearest","_","set"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"display","_","pane","_","nearest","_","set"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#nearestpaneselectiondata"},(0,i.kt)("inlineCode",{parentName:"a"},"NearestPaneSelectionData"))),(0,i.kt)("p",null,"Sets the selected waypoint."),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/NearestPane/NearestPaneViewEvents.ts:34"))}c.isMDXComponent=!0}}]);