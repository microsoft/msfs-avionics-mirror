"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[99220],{3905:(e,r,t)=>{t.d(r,{Zo:()=>l,kt:()=>u});var a=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,a)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function s(e,r){if(null==e)return{};var t,a,n=function(e,r){if(null==e)return{};var t,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var c=a.createContext({}),d=function(e){var r=a.useContext(c),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},l=function(e){var r=d(e.components);return a.createElement(c.Provider,{value:r},e.children)},p="mdxType",m={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},f=a.forwardRef((function(e,r){var t=e.components,n=e.mdxType,i=e.originalType,c=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),p=d(t),f=n,u=p["".concat(c,".").concat(f)]||p[f]||m[f]||i;return t?a.createElement(u,o(o({ref:r},l),{},{components:t})):a.createElement(u,o({ref:r},l))}));function u(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var i=t.length,o=new Array(i);o[0]=f;var s={};for(var c in r)hasOwnProperty.call(r,c)&&(s[c]=r[c]);s.originalType=e,s[p]="string"==typeof e?e:n,o[1]=s;for(var d=2;d<i;d++)o[d]=t[d];return a.createElement.apply(null,o)}return a.createElement.apply(null,t)}f.displayName="MDXCreateElement"},76444:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>c,contentTitle:()=>o,default:()=>m,frontMatter:()=>i,metadata:()=>s,toc:()=>d});var a=t(87462),n=(t(67294),t(3905));const i={id:"TcasAdvisoryParameters",title:"Interface: TcasAdvisoryParameters",sidebar_label:"TcasAdvisoryParameters",sidebar_position:0,custom_edit_url:null},o=void 0,s={unversionedId:"framework/interfaces/TcasAdvisoryParameters",id:"framework/interfaces/TcasAdvisoryParameters",title:"Interface: TcasAdvisoryParameters",description:"TCAS parameters for advisories defining the protected zone around the own airplane.",source:"@site/docs/framework/interfaces/TcasAdvisoryParameters.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/TcasAdvisoryParameters",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/TcasAdvisoryParameters",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TcasAdvisoryParameters",title:"Interface: TcasAdvisoryParameters",sidebar_label:"TcasAdvisoryParameters",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"TcasAdvisoryDataProvider",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/TcasAdvisoryDataProvider"},next:{title:"TcasEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/TcasEvents"}},c={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"protectedHeight",id:"protectedheight",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"protectedRadius",id:"protectedradius",level:3},{value:"Defined in",id:"defined-in-1",level:4}],l={toc:d},p="wrapper";function m(e){let{components:r,...t}=e;return(0,n.kt)(p,(0,a.Z)({},l,t,{components:r,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"TCAS parameters for advisories defining the protected zone around the own airplane."),(0,n.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"TcasAdvisoryParameters"))),(0,n.kt)("p",{parentName:"li"},"\u21b3 ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/TcasTcaParameters"},(0,n.kt)("inlineCode",{parentName:"a"},"TcasTcaParameters"))))),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"protectedheight"},"protectedHeight"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"protectedHeight"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/NumberUnitInterface"},(0,n.kt)("inlineCode",{parentName:"a"},"NumberUnitInterface")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/UnitFamily#distance"},(0,n.kt)("inlineCode",{parentName:"a"},"Distance")),", ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Unit"},(0,n.kt)("inlineCode",{parentName:"a"},"Unit")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/UnitFamily#distance"},(0,n.kt)("inlineCode",{parentName:"a"},"Distance")),">",">"),(0,n.kt)("p",null,"The half-height of the own airplane's protected volume."),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"src/sdk/traffic/Tcas.ts:171"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"protectedradius"},"protectedRadius"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,n.kt)("strong",{parentName:"p"},"protectedRadius"),": ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/NumberUnitInterface"},(0,n.kt)("inlineCode",{parentName:"a"},"NumberUnitInterface")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/UnitFamily#distance"},(0,n.kt)("inlineCode",{parentName:"a"},"Distance")),", ",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/Unit"},(0,n.kt)("inlineCode",{parentName:"a"},"Unit")),"<",(0,n.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/UnitFamily#distance"},(0,n.kt)("inlineCode",{parentName:"a"},"Distance")),">",">"),(0,n.kt)("p",null,"The radius of the own airplane's protected volume."),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"src/sdk/traffic/Tcas.ts:168"))}m.isMDXComponent=!0}}]);