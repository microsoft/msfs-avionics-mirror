"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[46049],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>y});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=r.createContext({}),s=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(d.Provider,{value:t},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,d=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),c=s(n),f=i,y=c["".concat(d,".").concat(f)]||c[f]||u[f]||o;return n?r.createElement(y,a(a({ref:t},p),{},{components:n})):r.createElement(y,a({ref:t},p))}));function y(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=f;var l={};for(var d in t)hasOwnProperty.call(t,d)&&(l[d]=t[d]);l.originalType=e,l[c]="string"==typeof e?e:i,a[1]=l;for(var s=2;s<o;s++)a[s]=n[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},25274:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>a,default:()=>u,frontMatter:()=>o,metadata:()=>l,toc:()=>s});var r=n(87462),i=(n(67294),n(3905));const o={id:"WindEntry",title:"Interface: WindEntry",sidebar_label:"WindEntry",sidebar_position:0,custom_edit_url:null},a=void 0,l={unversionedId:"wt21shared/interfaces/WindEntry",id:"wt21shared/interfaces/WindEntry",title:"Interface: WindEntry",description:"Interface for wind entry data",source:"@site/docs/wt21shared/interfaces/WindEntry.md",sourceDirName:"wt21shared/interfaces",slug:"/wt21shared/interfaces/WindEntry",permalink:"/msfs-avionics-mirror/docs/wt21shared/interfaces/WindEntry",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"WindEntry",title:"Interface: WindEntry",sidebar_label:"WindEntry",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"WaypointDisplayControllerModules",permalink:"/msfs-avionics-mirror/docs/wt21shared/interfaces/WaypointDisplayControllerModules"},next:{title:"Readme",permalink:"/msfs-avionics-mirror/docs/wt21pfd/"}},d={},s=[{value:"Properties",id:"properties",level:2},{value:"direction",id:"direction",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"speed",id:"speed",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"trueDegrees",id:"truedegrees",level:3},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:s},c="wrapper";function u(e){let{components:t,...n}=e;return(0,i.kt)(c,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Interface for wind entry data"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"direction"},"direction"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"direction"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"Wind direction"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-wt21/shared/Types.ts:4"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"speed"},"speed"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"speed"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"Wind speed"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-wt21/shared/Types.ts:10"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"truedegrees"},"trueDegrees"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"trueDegrees"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Indicating if direction is in true degrees"),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"workingtitle-instruments-wt21/shared/Types.ts:7"))}u.isMDXComponent=!0}}]);