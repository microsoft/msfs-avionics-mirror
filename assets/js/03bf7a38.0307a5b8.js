"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[26134],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>f});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=r.createContext({}),s=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},d=function(e){var t=s(e.components);return r.createElement(c.Provider,{value:t},e.children)},u="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,c=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),u=s(n),m=i,f=u["".concat(c,".").concat(m)]||u[m]||p[m]||o;return n?r.createElement(f,a(a({ref:t},d),{},{components:n})):r.createElement(f,a({ref:t},d))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=m;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[u]="string"==typeof e?e:i,a[1]=l;for(var s=2;s<o;s++)a[s]=n[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},46143:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>a,default:()=>p,frontMatter:()=>o,metadata:()=>l,toc:()=>s});var r=n(87462),i=(n(67294),n(3905));const o={id:"FPLInteractive",title:"Interface: FPLInteractive",sidebar_label:"FPLInteractive",sidebar_position:0,custom_edit_url:null},a=void 0,l={unversionedId:"g1000common/interfaces/FPLInteractive",id:"g1000common/interfaces/FPLInteractive",title:"Interface: FPLInteractive",description:"An interface to define interaction event handling on FPL sections",source:"@site/docs/g1000common/interfaces/FPLInteractive.md",sourceDirName:"g1000common/interfaces",slug:"/g1000common/interfaces/FPLInteractive",permalink:"/msfs-avionics-mirror/docs/g1000common/interfaces/FPLInteractive",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FPLInteractive",title:"Interface: FPLInteractive",sidebar_label:"FPLInteractive",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FPLHeaderProps",permalink:"/msfs-avionics-mirror/docs/g1000common/interfaces/FPLHeaderProps"},next:{title:"FPLSectionProps",permalink:"/msfs-avionics-mirror/docs/g1000common/interfaces/FPLSectionProps"}},c={},s=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Methods",id:"methods",level:2},{value:"onDirectTo",id:"ondirectto",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"onMenu",id:"onmenu",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4}],d={toc:s},u="wrapper";function p(e){let{components:t,...n}=e;return(0,i.kt)(u,(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"An interface to define interaction event handling on FPL sections"),(0,i.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/msfs-avionics-mirror/docs/g1000common/classes/FPLSection"},(0,i.kt)("inlineCode",{parentName:"a"},"FPLSection")))),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"ondirectto"},"onDirectTo"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onDirectTo"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Event that is called when the DTO button is pressed."),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"A booleans indicating that the event was handled."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/UI/FPL/FPLSection.tsx:71"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onmenu"},"onMenu"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onMenu"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Event that is called when the MENU button is pressed."),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"A booleans indicating that the event was handled."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/Components/UI/FPL/FPLSection.tsx:65"))}p.isMDXComponent=!0}}]);