"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[52575],{3905:(e,n,i)=>{i.d(n,{Zo:()=>d,kt:()=>v});var t=i(67294);function r(e,n,i){return n in e?Object.defineProperty(e,n,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[n]=i,e}function a(e,n){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),i.push.apply(i,t)}return i}function p(e){for(var n=1;n<arguments.length;n++){var i=null!=arguments[n]?arguments[n]:{};n%2?a(Object(i),!0).forEach((function(n){r(e,n,i[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):a(Object(i)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(i,n))}))}return e}function s(e,n){if(null==e)return{};var i,t,r=function(e,n){if(null==e)return{};var i,t,r={},a=Object.keys(e);for(t=0;t<a.length;t++)i=a[t],n.indexOf(i)>=0||(r[i]=e[i]);return r}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)i=a[t],n.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(r[i]=e[i])}return r}var o=t.createContext({}),l=function(e){var n=t.useContext(o),i=n;return e&&(i="function"==typeof e?e(n):p(p({},n),e)),i},d=function(e){var n=l(e.components);return t.createElement(o.Provider,{value:n},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},_=t.forwardRef((function(e,n){var i=e.components,r=e.mdxType,a=e.originalType,o=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),m=l(i),_=r,v=m["".concat(o,".").concat(_)]||m[_]||c[_]||a;return i?t.createElement(v,p(p({ref:n},d),{},{components:i})):t.createElement(v,p({ref:n},d))}));function v(e,n){var i=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var a=i.length,p=new Array(a);p[0]=_;var s={};for(var o in n)hasOwnProperty.call(n,o)&&(s[o]=n[o]);s.originalType=e,s[m]="string"==typeof e?e:r,p[1]=s;for(var l=2;l<a;l++)p[l]=i[l];return t.createElement.apply(null,p)}return t.createElement.apply(null,i)}_.displayName="MDXCreateElement"},33524:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>o,contentTitle:()=>p,default:()=>c,frontMatter:()=>a,metadata:()=>s,toc:()=>l});var t=i(87462),r=(i(67294),i(3905));const a={id:"ProcedurePreviewPaneViewEventTypes",title:"Interface: ProcedurePreviewPaneViewEventTypes",sidebar_label:"ProcedurePreviewPaneViewEventTypes",sidebar_position:0,custom_edit_url:null},p=void 0,s={unversionedId:"g3000common/interfaces/ProcedurePreviewPaneViewEventTypes",id:"g3000common/interfaces/ProcedurePreviewPaneViewEventTypes",title:"Interface: ProcedurePreviewPaneViewEventTypes",description:"Events which can be sent to procedure preview display pane views.",source:"@site/docs/g3000common/interfaces/ProcedurePreviewPaneViewEventTypes.md",sourceDirName:"g3000common/interfaces",slug:"/g3000common/interfaces/ProcedurePreviewPaneViewEventTypes",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/ProcedurePreviewPaneViewEventTypes",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"ProcedurePreviewPaneViewEventTypes",title:"Interface: ProcedurePreviewPaneViewEventTypes",sidebar_label:"ProcedurePreviewPaneViewEventTypes",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"NumericConfig",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/NumericConfig"},next:{title:"ProcedurePreviewPaneViewProps",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/ProcedurePreviewPaneViewProps"}},o={},l=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"display_pane_map_pointer_active_set",id:"display_pane_map_pointer_active_set",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"display_pane_map_pointer_active_toggle",id:"display_pane_map_pointer_active_toggle",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"display_pane_map_pointer_move",id:"display_pane_map_pointer_move",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"display_pane_map_range_dec",id:"display_pane_map_range_dec",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"display_pane_map_range_inc",id:"display_pane_map_range_inc",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"display_pane_procedure_preview_set",id:"display_pane_procedure_preview_set",level:3},{value:"Defined in",id:"defined-in-5",level:4}],d={toc:l},m="wrapper";function c(e){let{components:n,...i}=e;return(0,r.kt)(m,(0,t.Z)({},d,i,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Events which can be sent to procedure preview display pane views."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes"},(0,r.kt)("inlineCode",{parentName:"a"},"DisplayPaneViewEventTypes"))),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"ProcedurePreviewPaneViewEventTypes"))))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"display_pane_map_pointer_active_set"},"display","_","pane","_","map","_","pointer","_","active","_","set"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"display","_","pane","_","map","_","pointer","_","active","_","set"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Activates/deactivates the map pointer."),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes"},"DisplayPaneViewEventTypes"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes#display_pane_map_pointer_active_set"},"display_pane_map_pointer_active_set")),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneViewEvents.ts:14"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"display_pane_map_pointer_active_toggle"},"display","_","pane","_","map","_","pointer","_","active","_","toggle"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"display","_","pane","_","map","_","pointer","_","active","_","toggle"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Toggles the map pointer."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes"},"DisplayPaneViewEventTypes"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes#display_pane_map_pointer_active_toggle"},"display_pane_map_pointer_active_toggle")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneViewEvents.ts:17"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"display_pane_map_pointer_move"},"display","_","pane","_","map","_","pointer","_","move"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"display","_","pane","_","map","_","pointer","_","move"),": ","[",(0,r.kt)("inlineCode",{parentName:"p"},"number"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),"]"),(0,r.kt)("p",null,"Moves the map pointer by ",(0,r.kt)("inlineCode",{parentName:"p"},"[x, y]")," pixels."),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes"},"DisplayPaneViewEventTypes"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes#display_pane_map_pointer_move"},"display_pane_map_pointer_move")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneViewEvents.ts:20"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"display_pane_map_range_dec"},"display","_","pane","_","map","_","range","_","dec"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"display","_","pane","_","map","_","range","_","dec"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Decrements the map range."),(0,r.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes"},"DisplayPaneViewEventTypes"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes#display_pane_map_range_dec"},"display_pane_map_range_dec")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneViewEvents.ts:11"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"display_pane_map_range_inc"},"display","_","pane","_","map","_","range","_","inc"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"display","_","pane","_","map","_","range","_","inc"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Increments the map range."),(0,r.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes"},"DisplayPaneViewEventTypes"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/interfaces/DisplayPaneViewEventTypes#display_pane_map_range_inc"},"display_pane_map_range_inc")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneViewEvents.ts:8"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"display_pane_procedure_preview_set"},"display","_","pane","_","procedure","_","preview","_","set"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"display","_","pane","_","procedure","_","preview","_","set"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/modules#procedurepreviewpaneprocdata"},(0,r.kt)("inlineCode",{parentName:"a"},"ProcedurePreviewPaneProcData"))),(0,r.kt)("p",null,"Sets the previewed procedure."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/ProcedurePreviewPane/ProcedurePreviewPaneViewEvents.ts:32"))}c.isMDXComponent=!0}}]);