"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[94331],{3905:(e,n,t)=>{t.d(n,{Zo:()=>s,kt:()=>m});var i=t(67294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,i,a=function(e,n){if(null==e)return{};var t,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var d=i.createContext({}),p=function(e){var n=i.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},s=function(e){var n=p(e.components);return i.createElement(d.Provider,{value:n},e.children)},f="mdxType",c={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},u=i.forwardRef((function(e,n){var t=e.components,a=e.mdxType,r=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),f=p(t),u=a,m=f["".concat(d,".").concat(u)]||f[u]||c[u]||r;return t?i.createElement(m,l(l({ref:n},s),{},{components:t})):i.createElement(m,l({ref:n},s))}));function m(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var r=t.length,l=new Array(r);l[0]=u;var o={};for(var d in n)hasOwnProperty.call(n,d)&&(o[d]=n[d]);o.originalType=e,o[f]="string"==typeof e?e:a,l[1]=o;for(var p=2;p<r;p++)l[p]=t[p];return i.createElement.apply(null,l)}return i.createElement.apply(null,t)}u.displayName="MDXCreateElement"},60520:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>l,default:()=>c,frontMatter:()=>r,metadata:()=>o,toc:()=>p});var i=t(87462),a=(t(67294),t(3905));const r={id:"LegDefinition",title:"Interface: LegDefinition",sidebar_label:"LegDefinition",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/interfaces/LegDefinition",id:"framework/interfaces/LegDefinition",title:"Interface: LegDefinition",description:"A definition of a leg in a flight plan.",source:"@site/docs/framework/interfaces/LegDefinition.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/LegDefinition",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/LegDefinition",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"LegDefinition",title:"Interface: LegDefinition",sidebar_label:"LegDefinition",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"LegCalculations",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/LegCalculations"},next:{title:"LineSelectKeyEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/LineSelectKeyEvent"}},d={},p=[{value:"Properties",id:"properties",level:2},{value:"calculated",id:"calculated",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"flags",id:"flags",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"leg",id:"leg",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"name",id:"name",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"userData",id:"userdata",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"verticalData",id:"verticaldata",level:3},{value:"Defined in",id:"defined-in-5",level:4}],s={toc:p},f="wrapper";function c(e){let{components:n,...t}=e;return(0,a.kt)(f,(0,i.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A definition of a leg in a flight plan."),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"calculated"},"calculated"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"calculated"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/LegCalculations"},(0,a.kt)("inlineCode",{parentName:"a"},"LegCalculations"))),(0,a.kt)("p",null,"The calculated leg data."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:341"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"flags"},"flags"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"flags"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Leg definition flags. See ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/LegDefinitionFlags"},"LegDefinitionFlags"),". Use BitFlags to check."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:347"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"leg"},"leg"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"leg"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPlanLeg"},(0,a.kt)("inlineCode",{parentName:"a"},"FlightPlanLeg")),">"),(0,a.kt)("p",null,"The leg of the flight plan."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:344"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"name"},"name"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"name"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"The display name of the leg."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:338"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"userdata"},"userData"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"userData"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Record"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"string"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,a.kt)("p",null,"This leg's user data."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:353"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"verticaldata"},"verticalData"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"verticalData"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/VerticalData"},(0,a.kt)("inlineCode",{parentName:"a"},"VerticalData")),">"," & ",(0,a.kt)("inlineCode",{parentName:"p"},"Pick"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/VerticalData"},(0,a.kt)("inlineCode",{parentName:"a"},"VerticalData")),", ",(0,a.kt)("inlineCode",{parentName:"p"},'"fpa"'),">"),(0,a.kt)("p",null,"Vertical Leg Data. All the fields should be readonly except for calculated fields like ",(0,a.kt)("inlineCode",{parentName:"p"},"fpa"),"."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:350"))}c.isMDXComponent=!0}}]);