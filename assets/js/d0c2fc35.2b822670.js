"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[69557],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>v});var r=n(67294);function s(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){s(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,s=function(e,t){if(null==e)return{};var n,r,s={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(s[n]=e[n]);return s}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(s[n]=e[n])}return s}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},d="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,s=e.mdxType,a=e.originalType,l=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),d=c(n),m=s,v=d["".concat(l,".").concat(m)]||d[m]||p[m]||a;return n?r.createElement(v,i(i({ref:t},u),{},{components:n})):r.createElement(v,i({ref:t},u))}));function v(e,t){var n=arguments,s=t&&t.mdxType;if("string"==typeof e||s){var a=n.length,i=new Array(a);i[0]=m;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[d]="string"==typeof e?e:s,i[1]=o;for(var c=2;c<a;c++)i[c]=n[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},42965:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>p,frontMatter:()=>a,metadata:()=>o,toc:()=>c});var r=n(87462),s=(n(67294),n(3905));const a={id:"AvionicsStatusManager",title:"Class: AvionicsStatusManager",sidebar_label:"AvionicsStatusManager",sidebar_position:0,custom_edit_url:null},i=void 0,o={unversionedId:"g3000common/classes/AvionicsStatusManager",id:"g3000common/classes/AvionicsStatusManager",title:"Class: AvionicsStatusManager",description:"A manager for G3000 avionics unit (GDUs and GTCs) status. Processes status updates received from instances of",source:"@site/docs/g3000common/classes/AvionicsStatusManager.md",sourceDirName:"g3000common/classes",slug:"/g3000common/classes/AvionicsStatusManager",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/AvionicsStatusManager",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"AvionicsStatusManager",title:"Class: AvionicsStatusManager",sidebar_label:"AvionicsStatusManager",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"AvionicsStatusEventClient",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/AvionicsStatusEventClient"},next:{title:"AvionicsStatusUtils",permalink:"/msfs-avionics-mirror/docs/g3000common/classes/AvionicsStatusUtils"}},l={},c=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"init",id:"init",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4}],u={toc:c},d="wrapper";function p(e){let{components:t,...n}=e;return(0,s.kt)(d,(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("p",null,"A manager for G3000 avionics unit (GDUs and GTCs) status. Processes status updates received from instances of\n",(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/AvionicsStatusClient"},"AvionicsStatusClient")," and publishes avionics unit status events, including global power state events."),(0,s.kt)("h2",{id:"constructors"},"Constructors"),(0,s.kt)("h3",{id:"constructor"},"constructor"),(0,s.kt)("p",null,"\u2022 ",(0,s.kt)("strong",{parentName:"p"},"new AvionicsStatusManager"),"(",(0,s.kt)("inlineCode",{parentName:"p"},"bus"),"): ",(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/AvionicsStatusManager"},(0,s.kt)("inlineCode",{parentName:"a"},"AvionicsStatusManager"))),(0,s.kt)("p",null,"Constructor."),(0,s.kt)("h4",{id:"parameters"},"Parameters"),(0,s.kt)("table",null,(0,s.kt)("thead",{parentName:"table"},(0,s.kt)("tr",{parentName:"thead"},(0,s.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,s.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,s.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,s.kt)("tbody",{parentName:"table"},(0,s.kt)("tr",{parentName:"tbody"},(0,s.kt)("td",{parentName:"tr",align:"left"},(0,s.kt)("inlineCode",{parentName:"td"},"bus")),(0,s.kt)("td",{parentName:"tr",align:"left"},(0,s.kt)("inlineCode",{parentName:"td"},"EventBus")),(0,s.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,s.kt)("h4",{id:"returns"},"Returns"),(0,s.kt)("p",null,(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/AvionicsStatusManager"},(0,s.kt)("inlineCode",{parentName:"a"},"AvionicsStatusManager"))),(0,s.kt)("h4",{id:"defined-in"},"Defined in"),(0,s.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsStatus/AvionicsStatusManager.ts:131"),(0,s.kt)("h2",{id:"methods"},"Methods"),(0,s.kt)("h3",{id:"destroy"},"destroy"),(0,s.kt)("p",null,"\u25b8 ",(0,s.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,s.kt)("inlineCode",{parentName:"p"},"void")),(0,s.kt)("p",null,"Destroys this manager. Once destroyed, this manager will no longer keep track of avionics unit statuses or publish\nevents to the event bus."),(0,s.kt)("h4",{id:"returns-1"},"Returns"),(0,s.kt)("p",null,(0,s.kt)("inlineCode",{parentName:"p"},"void")),(0,s.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,s.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsStatus/AvionicsStatusManager.ts:268"),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"init"},"init"),(0,s.kt)("p",null,"\u25b8 ",(0,s.kt)("strong",{parentName:"p"},"init"),"(): ",(0,s.kt)("inlineCode",{parentName:"p"},"void")),(0,s.kt)("p",null,"Initializes this manager. Once initialized, this manager will keep track of the status of all\n",(0,s.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/AvionicsStatusClient"},"AvionicsStatusClient")," instances and publish them on the event bus, along with the avionics global power\nstate."),(0,s.kt)("h4",{id:"returns-2"},"Returns"),(0,s.kt)("p",null,(0,s.kt)("inlineCode",{parentName:"p"},"void")),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},(0,s.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,s.kt)("p",null,"Error if this manager was destroyed."),(0,s.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,s.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/AvionicsStatus/AvionicsStatusManager.ts:140"))}p.isMDXComponent=!0}}]);