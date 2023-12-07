"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[77129],{3905:(e,r,n)=>{n.d(r,{Zo:()=>d,kt:()=>m});var t=n(67294);function i(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function a(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function l(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?a(Object(n),!0).forEach((function(r){i(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function o(e,r){if(null==e)return{};var n,t,i=function(e,r){if(null==e)return{};var n,t,i={},a=Object.keys(e);for(t=0;t<a.length;t++)n=a[t],r.indexOf(n)>=0||(i[n]=e[n]);return i}(e,r);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)n=a[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=t.createContext({}),s=function(e){var r=t.useContext(p),n=r;return e&&(n="function"==typeof e?e(r):l(l({},r),e)),n},d=function(e){var r=s(e.components);return t.createElement(p.Provider,{value:r},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},f=t.forwardRef((function(e,r){var n=e.components,i=e.mdxType,a=e.originalType,p=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),c=s(n),f=i,m=c["".concat(p,".").concat(f)]||c[f]||u[f]||a;return n?t.createElement(m,l(l({ref:r},d),{},{components:n})):t.createElement(m,l({ref:r},d))}));function m(e,r){var n=arguments,i=r&&r.mdxType;if("string"==typeof e||i){var a=n.length,l=new Array(a);l[0]=f;var o={};for(var p in r)hasOwnProperty.call(r,p)&&(o[p]=r[p]);o.originalType=e,o[c]="string"==typeof e?e:i,l[1]=o;for(var s=2;s<a;s++)l[s]=n[s];return t.createElement.apply(null,l)}return t.createElement.apply(null,n)}f.displayName="MDXCreateElement"},1537:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>p,contentTitle:()=>l,default:()=>u,frontMatter:()=>a,metadata:()=>o,toc:()=>s});var t=n(87462),i=(n(67294),n(3905));const a={id:"LabelBarProps",title:"Interface: LabelBarProps",sidebar_label:"LabelBarProps",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"g3000gtc/interfaces/LabelBarProps",id:"g3000gtc/interfaces/LabelBarProps",title:"Interface: LabelBarProps",description:"Component props for LabelBar.",source:"@site/docs/g3000gtc/interfaces/LabelBarProps.md",sourceDirName:"g3000gtc/interfaces",slug:"/g3000gtc/interfaces/LabelBarProps",permalink:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/LabelBarProps",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"LabelBarProps",title:"Interface: LabelBarProps",sidebar_label:"LabelBarProps",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"KeyboardProps",permalink:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/KeyboardProps"},next:{title:"NumberInputProps",permalink:"/msfs-avionics-mirror/docs/g3000gtc/interfaces/NumberInputProps"}},p={},s=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"children",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"gtcService",id:"gtcservice",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"pluginHandlers",id:"pluginhandlers",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"ref",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4}],d={toc:s},c="wrapper";function u(e){let{components:r,...n}=e;return(0,i.kt)(c,(0,t.Z)({},d,n,{components:r,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Component props for LabelBar."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"p"},"ComponentProps")),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"LabelBarProps"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"children"},"children"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"children"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"DisplayChildren"),"[]"),(0,i.kt)("p",null,"The children of the display component."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,"ComponentProps.children"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:122"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"gtcservice"},"gtcService"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"gtcService"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcService"},(0,i.kt)("inlineCode",{parentName:"a"},"GtcService"))),(0,i.kt)("p",null,"The GtcService."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/LabelBar/LabelBar.tsx:31"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"pluginhandlers"},"pluginHandlers"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"pluginHandlers"),": readonly ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#labelbarpluginhandlers"},(0,i.kt)("inlineCode",{parentName:"a"},"LabelBarPluginHandlers")),">","[]"),(0,i.kt)("p",null,"An array of plugin label handlers. The array should be ordered such that the handlers appear in the order in which\ntheir parent plugins were loaded."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Components/LabelBar/LabelBar.tsx:37"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"ref"},"ref"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"ref"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"NodeReference"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,i.kt)("p",null,"A reference to the display component."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,"ComponentProps.ref"),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"sdk/components/FSComponent.ts:125"))}u.isMDXComponent=!0}}]);