"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[54767],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>u});var a=n(67294);function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,l=function(e,t){if(null==e)return{};var n,a,l={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(l[n]=e[n]);return l}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(l[n]=e[n])}return l}var p=a.createContext({}),o=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},d=function(e){var t=o(e.components);return a.createElement(p.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},g=a.forwardRef((function(e,t){var n=e.components,l=e.mdxType,i=e.originalType,p=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),m=o(n),g=l,u=m["".concat(p,".").concat(g)]||m[g]||k[g]||i;return n?a.createElement(u,r(r({ref:t},d),{},{components:n})):a.createElement(u,r({ref:t},d))}));function u(e,t){var n=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var i=n.length,r=new Array(i);r[0]=g;var s={};for(var p in t)hasOwnProperty.call(t,p)&&(s[p]=t[p]);s.originalType=e,s[m]="string"==typeof e?e:l,r[1]=s;for(var o=2;o<i;o++)r[o]=n[o];return a.createElement.apply(null,r)}return a.createElement.apply(null,n)}g.displayName="MDXCreateElement"},71580:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>r,default:()=>k,frontMatter:()=>i,metadata:()=>s,toc:()=>o});var a=n(87462),l=(n(67294),n(3905));const i={id:"FlightPlanUtils",title:"Class: FlightPlanUtils",sidebar_label:"FlightPlanUtils",sidebar_position:0,custom_edit_url:null},r=void 0,s={unversionedId:"framework/classes/FlightPlanUtils",id:"framework/classes/FlightPlanUtils",title:"Class: FlightPlanUtils",description:"Utility class for working with flight plans.",source:"@site/docs/framework/classes/FlightPlanUtils.md",sourceDirName:"framework/classes",slug:"/framework/classes/FlightPlanUtils",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanUtils",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPlanUtils",title:"Class: FlightPlanUtils",sidebar_label:"FlightPlanUtils",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPlanSegment",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanSegment"},next:{title:"FlightPlanner",permalink:"/msfs-avionics-mirror/docs/framework/classes/FlightPlanner"}},p={},o=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Methods",id:"methods",level:2},{value:"getTerminatorIcao",id:"getterminatoricao",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"isAltitudeLeg",id:"isaltitudeleg",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"isDiscontinuityLeg",id:"isdiscontinuityleg",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"isHeadingToLeg",id:"isheadingtoleg",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"isHoldLeg",id:"isholdleg",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"isManualDiscontinuityLeg",id:"ismanualdiscontinuityleg",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-5",level:4}],d={toc:o},m="wrapper";function k(e){let{components:t,...n}=e;return(0,l.kt)(m,(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"Utility class for working with flight plans."),(0,l.kt)("h2",{id:"constructors"},"Constructors"),(0,l.kt)("h3",{id:"constructor"},"constructor"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"new FlightPlanUtils"),"()"),(0,l.kt)("h2",{id:"methods"},"Methods"),(0,l.kt)("h3",{id:"getterminatoricao"},"getTerminatorIcao"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,l.kt)("strong",{parentName:"p"},"getTerminatorIcao"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"leg"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("p",null,"Gets the ICAO of the facility defining the terminator of a flight plan leg."),(0,l.kt)("h4",{id:"parameters"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"leg")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanLeg"},(0,l.kt)("inlineCode",{parentName:"a"},"FlightPlanLeg"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"A flight plan leg.")))),(0,l.kt)("h4",{id:"returns"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("p",null,"The ICAO of the facility defining the terminator of the specified flight plan leg, or ",(0,l.kt)("inlineCode",{parentName:"p"},"undefined")," if\nthe leg's terminator is not defined by a facility."),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPlanUtils.ts:74"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"isaltitudeleg"},"isAltitudeLeg"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,l.kt)("strong",{parentName:"p"},"isAltitudeLeg"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"legType"),"): legType is CA ","|"," FA ","|"," VA"),(0,l.kt)("p",null,'Checks if a leg type is an "to altitude" leg type.'),(0,l.kt)("h4",{id:"parameters-1"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"legType")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/enums/LegType"},(0,l.kt)("inlineCode",{parentName:"a"},"LegType"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"The leg type to check.")))),(0,l.kt)("h4",{id:"returns-1"},"Returns"),(0,l.kt)("p",null,"legType is CA ","|"," FA ","|"," VA"),(0,l.kt)("p",null,'Whether the leg type is a "to altitude" leg type.'),(0,l.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPlanUtils.ts:28"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"isdiscontinuityleg"},"isDiscontinuityLeg"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,l.kt)("strong",{parentName:"p"},"isDiscontinuityLeg"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"legType"),"): legType is Discontinuity ","|"," ThruDiscontinuity"),(0,l.kt)("p",null,"Checks if a leg type is a discontinuity leg type."),(0,l.kt)("h4",{id:"parameters-2"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"legType")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/enums/LegType"},(0,l.kt)("inlineCode",{parentName:"a"},"LegType"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"The leg type to check.")))),(0,l.kt)("h4",{id:"returns-2"},"Returns"),(0,l.kt)("p",null,"legType is Discontinuity ","|"," ThruDiscontinuity"),(0,l.kt)("p",null,"Whether the leg type is a discontinuity leg type."),(0,l.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPlanUtils.ts:64"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"isheadingtoleg"},"isHeadingToLeg"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,l.kt)("strong",{parentName:"p"},"isHeadingToLeg"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"legType"),"): legType is VA ","|"," VD ","|"," VI ","|"," VM ","|"," VR"),(0,l.kt)("p",null,'Checks if a leg type is a "heading to" leg type.'),(0,l.kt)("h4",{id:"parameters-3"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"legType")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/enums/LegType"},(0,l.kt)("inlineCode",{parentName:"a"},"LegType"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"The leg type to check.")))),(0,l.kt)("h4",{id:"returns-3"},"Returns"),(0,l.kt)("p",null,"legType is VA ","|"," VD ","|"," VI ","|"," VM ","|"," VR"),(0,l.kt)("p",null,'Whether the leg type is a "heading to" leg type.'),(0,l.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPlanUtils.ts:37"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"isholdleg"},"isHoldLeg"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,l.kt)("strong",{parentName:"p"},"isHoldLeg"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"legType"),"): legType is HA ","|"," HF ","|"," HM"),(0,l.kt)("p",null,'Checks if a leg type is a "hold" leg type.'),(0,l.kt)("h4",{id:"parameters-4"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"legType")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/enums/LegType"},(0,l.kt)("inlineCode",{parentName:"a"},"LegType"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"The leg type to check.")))),(0,l.kt)("h4",{id:"returns-4"},"Returns"),(0,l.kt)("p",null,"legType is HA ","|"," HF ","|"," HM"),(0,l.kt)("p",null,'Whether the leg type is a "hold" leg type.'),(0,l.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPlanUtils.ts:46"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ismanualdiscontinuityleg"},"isManualDiscontinuityLeg"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,l.kt)("strong",{parentName:"p"},"isManualDiscontinuityLeg"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"legType"),"): legType is FM ","|"," VM"),(0,l.kt)("p",null,"Checks if a leg type is a manual termination leg type that ends in a discontinuity."),(0,l.kt)("h4",{id:"parameters-5"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"legType")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/enums/LegType"},(0,l.kt)("inlineCode",{parentName:"a"},"LegType"))),(0,l.kt)("td",{parentName:"tr",align:"left"},"The leg type to check.")))),(0,l.kt)("h4",{id:"returns-5"},"Returns"),(0,l.kt)("p",null,"legType is FM ","|"," VM"),(0,l.kt)("p",null,"Whether the leg type is a manual termination leg type that ends in a discontinuity."),(0,l.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPlanUtils.ts:55"))}k.isMDXComponent=!0}}]);