"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[79901],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=r.createContext({}),u=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},p=function(e){var t=u(e.components);return r.createElement(l.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,l=e.parentName,p=a(e,["components","mdxType","originalType","parentName"]),c=u(n),m=o,f=c["".concat(l,".").concat(m)]||c[m]||d[m]||i;return n?r.createElement(f,s(s({ref:t},p),{},{components:n})):r.createElement(f,s({ref:t},p))}));function f(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,s=new Array(i);s[0]=m;var a={};for(var l in t)hasOwnProperty.call(t,l)&&(a[l]=t[l]);a.originalType=e,a[c]="string"==typeof e?e:o,s[1]=a;for(var u=2;u<i;u++)s[u]=n[u];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},27071:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>s,default:()=>d,frontMatter:()=>i,metadata:()=>a,toc:()=>u});var r=n(87462),o=(n(67294),n(3905));const i={id:"CASMessageCountProps",title:"Interface: CASMessageCountProps",sidebar_label:"CASMessageCountProps",sidebar_position:0,custom_edit_url:null},s=void 0,a={unversionedId:"g3000common/interfaces/CASMessageCountProps",id:"g3000common/interfaces/CASMessageCountProps",title:"Interface: CASMessageCountProps",description:"Properties for the component that shows CAS message counts.",source:"@site/docs/g3000common/interfaces/CASMessageCountProps.md",sourceDirName:"g3000common/interfaces",slug:"/g3000common/interfaces/CASMessageCountProps",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/CASMessageCountProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"CASMessageCountProps",title:"Interface: CASMessageCountProps",sidebar_label:"CASMessageCountProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"CASControlEvents",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/CASControlEvents"},next:{title:"Config",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/Config"}},l={},u=[{value:"Properties",id:"properties",level:2},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"countAboveWindow",id:"countabovewindow",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"countBelowWindow",id:"countbelowwindow",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"highestAlertState",id:"highestalertstate",level:3},{value:"Defined in",id:"defined-in-3",level:4}],p={toc:u},c="wrapper";function d(e){let{components:t,...n}=e;return(0,o.kt)(c,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Properties for the component that shows CAS message counts."),(0,o.kt)("h2",{id:"properties"},"Properties"),(0,o.kt)("h3",{id:"bus"},"bus"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"bus"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,o.kt)("p",null,"The bus."),(0,o.kt)("h4",{id:"defined-in"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/CAS/CAS.tsx:73"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"countabovewindow"},"countAboveWindow"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"countAboveWindow"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,o.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,o.kt)("p",null,"The count of messages above the window."),(0,o.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/CAS/CAS.tsx:75"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"countbelowwindow"},"countBelowWindow"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"countBelowWindow"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,o.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,o.kt)("p",null,"The count of messages below the window."),(0,o.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/CAS/CAS.tsx:77"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"highestalertstate"},"highestAlertState"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"highestAlertState"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Subscribable"),"<",(0,o.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,o.kt)("inlineCode",{parentName:"p"},"AnnunciationType"),">"),(0,o.kt)("p",null,"The highest current alert state."),(0,o.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,o.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/Components/CAS/CAS.tsx:79"))}d.isMDXComponent=!0}}]);