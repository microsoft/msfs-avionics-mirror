"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[63007],{3905:(e,n,t)=>{t.d(n,{Zo:()=>c,kt:()=>m});var i=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,i,r=function(e,n){if(null==e)return{};var t,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var d=i.createContext({}),f=function(e){var n=i.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},c=function(e){var n=f(e.components);return i.createElement(d.Provider,{value:n},e.children)},p="mdxType",s={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},u=i.forwardRef((function(e,n){var t=e.components,r=e.mdxType,a=e.originalType,d=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),p=f(t),u=r,m=p["".concat(d,".").concat(u)]||p[u]||s[u]||a;return t?i.createElement(m,l(l({ref:n},c),{},{components:t})):i.createElement(m,l({ref:n},c))}));function m(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var a=t.length,l=new Array(a);l[0]=u;var o={};for(var d in n)hasOwnProperty.call(n,d)&&(o[d]=n[d]);o.originalType=e,o[p]="string"==typeof e?e:r,l[1]=o;for(var f=2;f<a;f++)l[f]=t[f];return i.createElement.apply(null,l)}return i.createElement.apply(null,t)}u.displayName="MDXCreateElement"},56382:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>l,default:()=>s,frontMatter:()=>a,metadata:()=>o,toc:()=>f});var i=t(87462),r=(t(67294),t(3905));const a={id:"index.LegDefinition",title:"Interface: LegDefinition",sidebar_label:"LegDefinition",custom_edit_url:null},l=void 0,o={unversionedId:"framework/interfaces/index.LegDefinition",id:"framework/interfaces/index.LegDefinition",title:"Interface: LegDefinition",description:"index.LegDefinition",source:"@site/docs/framework/interfaces/index.LegDefinition.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.LegDefinition",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.LegDefinition",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.LegDefinition",title:"Interface: LegDefinition",sidebar_label:"LegDefinition",custom_edit_url:null},sidebar:"sidebar",previous:{title:"LegCalculations",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.LegCalculations"},next:{title:"LineSelectKeyEvent",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.LineSelectKeyEvent"}},d={},f=[{value:"Properties",id:"properties",level:2},{value:"calculated",id:"calculated",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"flags",id:"flags",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"leg",id:"leg",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"name",id:"name",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"verticalData",id:"verticaldata",level:3},{value:"Defined in",id:"defined-in-4",level:4}],c={toc:f},p="wrapper";function s(e){let{components:n,...t}=e;return(0,r.kt)(p,(0,i.Z)({},c,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".LegDefinition"),(0,r.kt)("p",null,"A definition of a leg in a flight plan."),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"calculated"},"calculated"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"calculated"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.LegCalculations"},(0,r.kt)("inlineCode",{parentName:"a"},"LegCalculations"))),(0,r.kt)("p",null,"The calculated leg data."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:336"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"flags"},"flags"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"flags"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Leg definition flags. See ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/index.LegDefinitionFlags"},"LegDefinitionFlags"),". Use BitFlags to check."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:342"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"leg"},"leg"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"leg"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.FlightPlanLeg"},(0,r.kt)("inlineCode",{parentName:"a"},"FlightPlanLeg")),">"),(0,r.kt)("p",null,"The leg of the flight plan."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:339"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"name"},"name"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"name"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("p",null,"The display name of the leg."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:333"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"verticaldata"},"verticalData"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"verticalData"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.VerticalData"},(0,r.kt)("inlineCode",{parentName:"a"},"VerticalData")),">"," & ",(0,r.kt)("inlineCode",{parentName:"p"},"Pick"),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.VerticalData"},(0,r.kt)("inlineCode",{parentName:"a"},"VerticalData")),", ",(0,r.kt)("inlineCode",{parentName:"p"},'"fpa"'),">"),(0,r.kt)("p",null,"Vertical Leg Data. All the fields should be readonly except for calculated fields like ",(0,r.kt)("inlineCode",{parentName:"p"},"fpa"),"."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/flightplan/FlightPlanning.ts:345"))}s.isMDXComponent=!0}}]);