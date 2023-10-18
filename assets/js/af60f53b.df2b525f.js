"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[67573],{3905:(e,n,r)=>{r.d(n,{Zo:()=>c,kt:()=>f});var t=r(67294);function i(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function a(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function o(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?a(Object(r),!0).forEach((function(n){i(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function l(e,n){if(null==e)return{};var r,t,i=function(e,n){if(null==e)return{};var r,t,i={},a=Object.keys(e);for(t=0;t<a.length;t++)r=a[t],n.indexOf(r)>=0||(i[r]=e[r]);return i}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)r=a[t],n.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var s=t.createContext({}),d=function(e){var n=t.useContext(s),r=n;return e&&(r="function"==typeof e?e(n):o(o({},n),e)),r},c=function(e){var n=d(e.components);return t.createElement(s.Provider,{value:n},e.children)},u="mdxType",p={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},m=t.forwardRef((function(e,n){var r=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=d(r),m=i,f=u["".concat(s,".").concat(m)]||u[m]||p[m]||a;return r?t.createElement(f,o(o({ref:n},c),{},{components:r})):t.createElement(f,o({ref:n},c))}));function f(e,n){var r=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var a=r.length,o=new Array(a);o[0]=m;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l[u]="string"==typeof e?e:i,o[1]=l;for(var d=2;d<a;d++)o[d]=r[d];return t.createElement.apply(null,o)}return t.createElement.apply(null,r)}m.displayName="MDXCreateElement"},21663:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>s,contentTitle:()=>o,default:()=>p,frontMatter:()=>a,metadata:()=>l,toc:()=>d});var t=r(87462),i=(r(67294),r(3905));const a={id:"index.Procedure",title:"Interface: Procedure",sidebar_label:"Procedure",custom_edit_url:null},o=void 0,l={unversionedId:"framework/interfaces/index.Procedure",id:"framework/interfaces/index.Procedure",title:"Interface: Procedure",description:"index.Procedure",source:"@site/docs/framework/interfaces/index.Procedure.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.Procedure",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.Procedure",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.Procedure",title:"Interface: Procedure",sidebar_label:"Procedure",custom_edit_url:null},sidebar:"sidebar",previous:{title:"PressurizationEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.PressurizationEvents"},next:{title:"PublishPacer",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.PublishPacer"}},s={},d=[{value:"Properties",id:"properties",level:2},{value:"commonLegs",id:"commonlegs",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"enRouteTransitions",id:"enroutetransitions",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"name",id:"name",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"runwayTransitions",id:"runwaytransitions",level:3},{value:"Defined in",id:"defined-in-3",level:4}],c={toc:d},u="wrapper";function p(e){let{components:n,...r}=e;return(0,i.kt)(u,(0,t.Z)({},c,r,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".Procedure"),(0,i.kt)("p",null,"Common interface for procedures."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"commonlegs"},"commonLegs"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"commonLegs"),": readonly ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.FlightPlanLeg"},(0,i.kt)("inlineCode",{parentName:"a"},"FlightPlanLeg")),">","[]"),(0,i.kt)("p",null,"The legs of the procedure that are common to all selected transitions and runways."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/navigation/Facilities.ts:349"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"enroutetransitions"},"enRouteTransitions"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"enRouteTransitions"),": readonly ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.EnrouteTransition"},(0,i.kt)("inlineCode",{parentName:"a"},"EnrouteTransition")),"[]"),(0,i.kt)("p",null,"The transition from the departure to the enroute segment."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/navigation/Facilities.ts:352"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"name"},"name"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"name"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"The name of the departure."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/navigation/Facilities.ts:346"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"runwaytransitions"},"runwayTransitions"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"runwayTransitions"),": readonly ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.RunwayTransition"},(0,i.kt)("inlineCode",{parentName:"a"},"RunwayTransition")),"[]"),(0,i.kt)("p",null,"The transition from the selected runway to the common procedure legs."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/navigation/Facilities.ts:355"))}p.isMDXComponent=!0}}]);