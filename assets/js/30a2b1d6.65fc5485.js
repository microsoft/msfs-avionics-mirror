"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[44226],{3905:(e,t,n)=>{n.d(t,{Zo:()=>o,kt:()=>k});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=a.createContext({}),p=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},o=function(e){var t=p(e.components);return a.createElement(d.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},f=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,l=e.originalType,d=e.parentName,o=s(e,["components","mdxType","originalType","parentName"]),m=p(n),f=i,k=m["".concat(d,".").concat(f)]||m[f]||u[f]||l;return n?a.createElement(k,r(r({ref:t},o),{},{components:n})):a.createElement(k,r({ref:t},o))}));function k(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var l=n.length,r=new Array(l);r[0]=f;var s={};for(var d in t)hasOwnProperty.call(t,d)&&(s[d]=t[d]);s.originalType=e,s[m]="string"==typeof e?e:i,r[1]=s;for(var p=2;p<l;p++)r[p]=n[p];return a.createElement.apply(null,r)}return a.createElement.apply(null,n)}f.displayName="MDXCreateElement"},70188:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>r,default:()=>u,frontMatter:()=>l,metadata:()=>s,toc:()=>p});var a=n(87462),i=(n(67294),n(3905));const l={id:"DisplayPaneUtils",title:"Class: DisplayPaneUtils",sidebar_label:"DisplayPaneUtils",sidebar_position:0,custom_edit_url:null},r=void 0,s={unversionedId:"g3000common/classes/DisplayPaneUtils",id:"g3000common/classes/DisplayPaneUtils",title:"Class: DisplayPaneUtils",description:"Collection of functions for working with Display Panes.",source:"@site/docs/g3000common/classes/DisplayPaneUtils.md",sourceDirName:"g3000common/classes",slug:"/g3000common/classes/DisplayPaneUtils",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/DisplayPaneUtils",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"DisplayPaneUtils",title:"Class: DisplayPaneUtils",sidebar_label:"DisplayPaneUtils",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"DisplayPaneContainer",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/DisplayPaneContainer"},next:{title:"DisplayPaneView",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/DisplayPaneView"}},d={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Properties",id:"properties",level:2},{value:"ALL_INDEXES",id:"all_indexes",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"CONTROLLABLE_INDEXES",id:"controllable_indexes",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"MFD_INDEXES",id:"mfd_indexes",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"PFD_INDEXES",id:"pfd_indexes",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"PFD_INSTRUMENT_INDEXES",id:"pfd_instrument_indexes",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"Methods",id:"methods",level:2},{value:"isControllableDisplayPaneIndex",id:"iscontrollabledisplaypaneindex",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"isMfdDisplayPaneIndex",id:"ismfddisplaypaneindex",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"isPfdDisplayPaneIndex",id:"ispfddisplaypaneindex",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"isPfdInstrumentDisplayPaneIndex",id:"ispfdinstrumentdisplaypaneindex",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-8",level:4}],o={toc:p},m="wrapper";function u(e){let{components:t,...n}=e;return(0,i.kt)(m,(0,a.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Collection of functions for working with Display Panes."),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new DisplayPaneUtils"),"(): ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/DisplayPaneUtils"},(0,i.kt)("inlineCode",{parentName:"a"},"DisplayPaneUtils"))),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/DisplayPaneUtils"},(0,i.kt)("inlineCode",{parentName:"a"},"DisplayPaneUtils"))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"all_indexes"},"ALL","_","INDEXES"),(0,i.kt)("p",null,"\u25aa ",(0,i.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"ALL","_","INDEXES"),": readonly [",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#leftpfdinstrument"},(0,i.kt)("inlineCode",{parentName:"a"},"LeftPfdInstrument")),", ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#leftpfd"},(0,i.kt)("inlineCode",{parentName:"a"},"LeftPfd")),", ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#leftmfd"},(0,i.kt)("inlineCode",{parentName:"a"},"LeftMfd")),", ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#rightmfd"},(0,i.kt)("inlineCode",{parentName:"a"},"RightMfd")),", ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#rightpfd"},(0,i.kt)("inlineCode",{parentName:"a"},"RightPfd")),", ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#rightpfdinstrument"},(0,i.kt)("inlineCode",{parentName:"a"},"RightPfdInstrument")),"]"),(0,i.kt)("p",null,"An array of indexes of all display panes."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneUtils.ts:6"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"controllable_indexes"},"CONTROLLABLE","_","INDEXES"),(0,i.kt)("p",null,"\u25aa ",(0,i.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"CONTROLLABLE","_","INDEXES"),": readonly [",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#leftpfd"},(0,i.kt)("inlineCode",{parentName:"a"},"LeftPfd")),", ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#leftmfd"},(0,i.kt)("inlineCode",{parentName:"a"},"LeftMfd")),", ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#rightmfd"},(0,i.kt)("inlineCode",{parentName:"a"},"RightMfd")),", ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#rightpfd"},(0,i.kt)("inlineCode",{parentName:"a"},"RightPfd")),"]"),(0,i.kt)("p",null,"An array of indexes of display panes that are controllable by GTCs."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneUtils.ts:16"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"mfd_indexes"},"MFD","_","INDEXES"),(0,i.kt)("p",null,"\u25aa ",(0,i.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"MFD","_","INDEXES"),": readonly [",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#leftmfd"},(0,i.kt)("inlineCode",{parentName:"a"},"LeftMfd")),", ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#rightmfd"},(0,i.kt)("inlineCode",{parentName:"a"},"RightMfd")),"]"),(0,i.kt)("p",null,"An array of indexes of MFD display panes."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneUtils.ts:36"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"pfd_indexes"},"PFD","_","INDEXES"),(0,i.kt)("p",null,"\u25aa ",(0,i.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"PFD","_","INDEXES"),": readonly [",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#leftpfd"},(0,i.kt)("inlineCode",{parentName:"a"},"LeftPfd")),", ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#rightpfd"},(0,i.kt)("inlineCode",{parentName:"a"},"RightPfd")),"]"),(0,i.kt)("p",null,"An array of indexes of PFD display panes."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneUtils.ts:30"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"pfd_instrument_indexes"},"PFD","_","INSTRUMENT","_","INDEXES"),(0,i.kt)("p",null,"\u25aa ",(0,i.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"PFD","_","INSTRUMENT","_","INDEXES"),": readonly [",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#leftpfdinstrument"},(0,i.kt)("inlineCode",{parentName:"a"},"LeftPfdInstrument")),", ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/enums/DisplayPaneIndex#rightpfdinstrument"},(0,i.kt)("inlineCode",{parentName:"a"},"RightPfdInstrument")),"]"),(0,i.kt)("p",null,"An array of indexes of PFD instrument display panes."),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneUtils.ts:24"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"iscontrollabledisplaypaneindex"},"isControllableDisplayPaneIndex"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"isControllableDisplayPaneIndex"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"value"),"): value is ControllableDisplayPaneIndex"),(0,i.kt)("p",null,"Checks whether a value is a controllable display pane index."),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"value")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"unknown")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The value to check.")))),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,"value is ControllableDisplayPaneIndex"),(0,i.kt)("p",null,"Whether the specified value is a controllable display pane index."),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneUtils.ts:46"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ismfddisplaypaneindex"},"isMfdDisplayPaneIndex"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"isMfdDisplayPaneIndex"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"value"),"): value is LeftMfd ","|"," RightMfd"),(0,i.kt)("p",null,"Checks whether a value is an MFD display pane index."),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"value")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"unknown")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The value to check.")))),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,"value is LeftMfd ","|"," RightMfd"),(0,i.kt)("p",null,"Whether the specified value is an MFD display pane index."),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneUtils.ts:85"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ispfddisplaypaneindex"},"isPfdDisplayPaneIndex"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"isPfdDisplayPaneIndex"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"value"),"): value is LeftPfd ","|"," RightPfd"),(0,i.kt)("p",null,"Checks whether a value is a PFD display pane index."),(0,i.kt)("h4",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"value")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"unknown")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The value to check.")))),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,"value is LeftPfd ","|"," RightPfd"),(0,i.kt)("p",null,"Whether the specified value is a PFD display pane index."),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneUtils.ts:72"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ispfdinstrumentdisplaypaneindex"},"isPfdInstrumentDisplayPaneIndex"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"isPfdInstrumentDisplayPaneIndex"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"value"),"): value is LeftPfdInstrument ","|"," RightPfdInstrument"),(0,i.kt)("p",null,"Checks whether a value is a PFD instrument display pane index."),(0,i.kt)("h4",{id:"parameters-3"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"value")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"unknown")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The value to check.")))),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,"value is LeftPfdInstrument ","|"," RightPfdInstrument"),(0,i.kt)("p",null,"Whether the specified value is a PFD instrument display pane index."),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/DisplayPanes/DisplayPaneUtils.ts:59"))}u.isMDXComponent=!0}}]);