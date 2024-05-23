"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[97108],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>u});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=i.createContext({}),d=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=d(e.components);return i.createElement(o.Provider,{value:t},e.children)},m="mdxType",g={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},k=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,o=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),m=d(n),k=a,u=m["".concat(o,".").concat(k)]||m[k]||g[k]||r;return n?i.createElement(u,l(l({ref:t},p),{},{components:n})):i.createElement(u,l({ref:t},p))}));function u(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,l=new Array(r);l[0]=k;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s[m]="string"==typeof e?e:a,l[1]=s;for(var d=2;d<r;d++)l[d]=n[d];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}k.displayName="MDXCreateElement"},69605:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>g,frontMatter:()=>r,metadata:()=>s,toc:()=>d});var i=n(87462),a=(n(67294),n(3905));const r={id:"LegPageItem",title:"Class: LegPageItem",sidebar_label:"LegPageItem",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"wt21fmc/classes/LegPageItem",id:"wt21fmc/classes/LegPageItem",title:"Class: LegPageItem",description:"Leg Page Items",source:"@site/docs/wt21fmc/classes/LegPageItem.md",sourceDirName:"wt21fmc/classes",slug:"/wt21fmc/classes/LegPageItem",permalink:"/msfs-avionics-mirror/docs/wt21fmc/classes/LegPageItem",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"LegPageItem",title:"Class: LegPageItem",sidebar_label:"LegPageItem",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"LatLongTextFormat",permalink:"/msfs-avionics-mirror/docs/wt21fmc/classes/LatLongTextFormat"},next:{title:"LegsPage",permalink:"/msfs-avionics-mirror/docs/wt21fmc/classes/LegsPage"}},o={},d=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"globalIndex",id:"globalindex",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"isFirstMissedLeg",id:"isfirstmissedleg",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"isFromLeg",id:"isfromleg",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"isPpos",id:"isppos",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"isToLeg",id:"istoleg",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"legDefinition",id:"legdefinition",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"segmentIndex",id:"segmentindex",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"segmentLegIndex",id:"segmentlegindex",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"vnavConstraint",id:"vnavconstraint",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"vnavLeg",id:"vnavleg",level:3},{value:"Defined in",id:"defined-in-10",level:4}],p={toc:d},m="wrapper";function g(e){let{components:t,...n}=e;return(0,a.kt)(m,(0,i.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Leg Page Items"),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new LegPageItem"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"globalIndex"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"segmentIndex"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"segmentLegIndex"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"isPpos"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"isFromLeg"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"isToLeg"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"isFirstMissedLeg"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"legDefinition?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"vnavLeg?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"vnavConstraint?"),"): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21fmc/classes/LegPageItem"},(0,a.kt)("inlineCode",{parentName:"a"},"LegPageItem"))),(0,a.kt)("p",null,"A Leg Page Item"),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"globalIndex")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Leg Global Leg Index")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"segmentIndex")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Segment Index")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"segmentLegIndex")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Leg Index in Segment")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"isPpos")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"whether this is a PPOS leg (for hold selection)")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"isFromLeg")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether this is the from leg.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"isToLeg")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether this is the to leg.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"isFirstMissedLeg")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether this is the first leg of the missed approach sequence.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"legDefinition?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"LegDefinition")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Leg Definition.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"vnavLeg?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"VNavLeg")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The VNav Leg.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"vnavConstraint?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"VNavConstraint")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The VNav Constraint for the VNav Leg.")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/wt21fmc/classes/LegPageItem"},(0,a.kt)("inlineCode",{parentName:"a"},"LegPageItem"))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Pages/LegsPageStore.ts:19"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"globalindex"},"globalIndex"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"globalIndex"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Leg Global Leg Index"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Pages/LegsPageStore.ts:20"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isfirstmissedleg"},"isFirstMissedLeg"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"isFirstMissedLeg"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Whether this is the first leg of the missed approach sequence."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Pages/LegsPageStore.ts:26"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isfromleg"},"isFromLeg"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"isFromLeg"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Whether this is the from leg."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Pages/LegsPageStore.ts:24"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"isppos"},"isPpos"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"isPpos"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"whether this is a PPOS leg (for hold selection)"),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Pages/LegsPageStore.ts:23"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"istoleg"},"isToLeg"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"isToLeg"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Whether this is the to leg."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Pages/LegsPageStore.ts:25"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"legdefinition"},"legDefinition"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"legDefinition"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"LegDefinition")),(0,a.kt)("p",null,"Leg Definition."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Pages/LegsPageStore.ts:27"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"segmentindex"},"segmentIndex"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"segmentIndex"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Segment Index"),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Pages/LegsPageStore.ts:21"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"segmentlegindex"},"segmentLegIndex"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"segmentLegIndex"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Leg Index in Segment"),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Pages/LegsPageStore.ts:22"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"vnavconstraint"},"vnavConstraint"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"vnavConstraint"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"VNavConstraint")),(0,a.kt)("p",null,"The VNav Constraint for the VNav Leg."),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Pages/LegsPageStore.ts:29"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"vnavleg"},"vnavLeg"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"vnavLeg"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"VNavLeg")),(0,a.kt)("p",null,"The VNav Leg."),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21/FMC/Pages/LegsPageStore.ts:28"))}g.isMDXComponent=!0}}]);