"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[49763],{3905:(e,n,t)=>{t.d(n,{Zo:()=>s,kt:()=>m});var r=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function p(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var l=r.createContext({}),c=function(e){var n=r.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},s=function(e){var n=c(e.components);return r.createElement(l.Provider,{value:n},e.children)},d="mdxType",f={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},u=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,a=e.originalType,l=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),d=c(t),u=i,m=d["".concat(l,".").concat(u)]||d[u]||f[u]||a;return t?r.createElement(m,o(o({ref:n},s),{},{components:t})):r.createElement(m,o({ref:n},s))}));function m(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var a=t.length,o=new Array(a);o[0]=u;var p={};for(var l in n)hasOwnProperty.call(n,l)&&(p[l]=n[l]);p.originalType=e,p[d]="string"==typeof e?e:i,o[1]=p;for(var c=2;c<a;c++)o[c]=t[c];return r.createElement.apply(null,o)}return r.createElement.apply(null,t)}u.displayName="MDXCreateElement"},99039:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>o,default:()=>f,frontMatter:()=>a,metadata:()=>p,toc:()=>c});var r=t(87462),i=(t(67294),t(3905));const a={id:"index.MapWaypoint",title:"Interface: MapWaypoint",sidebar_label:"MapWaypoint",custom_edit_url:null},o=void 0,p={unversionedId:"framework/interfaces/index.MapWaypoint",id:"framework/interfaces/index.MapWaypoint",title:"Interface: MapWaypoint",description:"index.MapWaypoint",source:"@site/docs/framework/interfaces/index.MapWaypoint.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/index.MapWaypoint",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.MapWaypoint",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.MapWaypoint",title:"Interface: MapWaypoint",sidebar_label:"MapWaypoint",custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapTrafficIntruderIcon",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.MapTrafficIntruderIcon"},next:{title:"MapWaypointIcon",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/index.MapWaypointIcon"}},l={},c=[{value:"Properties",id:"properties",level:2},{value:"location",id:"location",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"uid",id:"uid",level:3},{value:"Defined in",id:"defined-in-1",level:4}],s={toc:c},d="wrapper";function f(e){let{components:n,...t}=e;return(0,i.kt)(d,(0,r.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".MapWaypoint"),(0,i.kt)("p",null,"A waypoint which is renderable to a map."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"location"},"location"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"location"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.Subscribable"},(0,i.kt)("inlineCode",{parentName:"a"},"Subscribable")),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.GeoPointInterface"},(0,i.kt)("inlineCode",{parentName:"a"},"GeoPointInterface")),">"),(0,i.kt)("p",null,"The location of this waypoint."),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/map/MapWaypoint.ts:12"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"uid"},"uid"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"uid"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"This waypoint's unique string ID."),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/map/MapWaypoint.ts:9"))}f.isMDXComponent=!0}}]);